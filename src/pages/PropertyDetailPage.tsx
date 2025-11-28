import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Bed, 
  Bath, 
  Home as HomeIcon, 
  MapPin, 
  Share2, 
  Flag, 
  Phone, 
  Mail,
  Loader2,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/common';
import ImageCarousel from '@/components/property/ImageCarousel';
import Stack from '@/components/property/Stack';
import ReportModal from '@/components/common/ReportModal';
import ViewingRequestModal from '@/components/property/ViewingRequestModal';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice } from '@/utils/formatting';

interface PropertyImage {
  id: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  viewing_fee: number;
  bedrooms: number;
  bathrooms: number;
  property_type: string;
  amenities: string[];
  status: string;
  view_count: number;
  save_count: number;
  created_at: string;
  owner_id: string;
  property_images: PropertyImage[];
  profiles: {
    full_name: string;
    phone: string;
    email: string;
    role: string;
  };
}

const PropertyDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isCheckingSaved, setIsCheckingSaved] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [viewingRequestModalOpen, setViewingRequestModalOpen] = useState(false);

  // Fetch property data
  useEffect(() => {
    if (!id) {
      setError('Property ID not found');
      setLoading(false);
      return;
    }

    let isMounted = true;
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.error('Property fetch timeout after 10 seconds');
        setError('Request timed out. Please try again.');
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Fetching property with ID:', id);

        // First, try to fetch property with images (without profile join to avoid RLS issues)
        console.log('Starting property query...');
        const { data: propertyData, error: propertyError } = await supabase
          .from('properties')
          .select('*, property_images (*)')
          .eq('id', id)
          .single();
        
        console.log('Property query completed. Data:', propertyData ? 'Found' : 'Not found', 'Error:', propertyError);

        if (propertyError) {
          console.error('Property fetch error:', propertyError);
          console.error('Error code:', propertyError.code);
          console.error('Error message:', propertyError.message);
          throw propertyError;
        }

        if (!propertyData) {
          throw new Error('Property not found');
        }

        console.log('Property fetched successfully:', propertyData.id);

        // Fetch owner profile separately (optional, don't fail if this fails)
        let ownerProfile = null;
        if (propertyData.owner_id) {
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('full_name, phone, email, role')
              .eq('id', propertyData.owner_id)
              .maybeSingle();
            
            if (!profileError && profileData) {
              ownerProfile = profileData;
              console.log('Owner profile fetched:', ownerProfile);
            }
          } catch (profileErr: any) {
            console.warn('Could not fetch owner profile:', profileErr);
            // Continue without profile data
          }
        }

        // Combine property and profile data
        const combinedData = {
          ...propertyData,
          profiles: ownerProfile || {
            full_name: null,
            phone: null,
            email: null,
            role: null
          }
        };

        if (!isMounted) return;

        // Increment view count (don't wait for this, do it in background)
        Promise.resolve(
          supabase
            .from('properties')
            .update({ view_count: (propertyData.view_count || 0) + 1 })
            .eq('id', id)
        )
          .then(() => {
            // Update local state if successful
            if (isMounted) {
              setProperty(prev => prev ? { ...prev, view_count: (prev.view_count || 0) + 1 } : null);
            }
          })
          .catch((err: any) => {
            console.warn('Failed to increment view count:', err);
          });

        setProperty(combinedData as Property);

        // Check if property is saved (if user is logged in)
        if (user && isMounted) {
          checkIfSaved(propertyData.id);
        }
      } catch (err: any) {
        console.error('Error fetching property:', err);
        console.error('Error details:', {
          message: err.message,
          code: err.code,
          details: err.details,
          hint: err.hint
        });
        if (isMounted) {
          setError(err.message || 'Failed to load property');
          setProperty(null);
        }
      } finally {
        clearTimeout(timeoutId);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProperty();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [id]);

  const checkIfSaved = async (propertyId: string) => {
    if (!user) {
      setIsSaved(false);
      return;
    }

    try {
      setIsCheckingSaved(true);
      const { data } = await supabase
        .from('saved_properties')
        .select('id')
        .eq('user_id', user.id)
        .eq('property_id', propertyId)
        .maybeSingle();

      setIsSaved(!!data);
    } catch (error) {
      // Not saved or error - treat as not saved
      console.error('Error checking if saved:', error);
      setIsSaved(false);
    } finally {
      setIsCheckingSaved(false);
    }
  };

  const handleToggleSave = async () => {
    if (!user) {
      navigate(`/login?return=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (!property) return;

    try {
      if (isSaved) {
        // Unsave
        const { error } = await supabase
          .from('saved_properties')
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', property.id);

        if (error) throw error;
        setIsSaved(false);
        toast.success('Property unsaved');
      } else {
        // Save
        const { error } = await supabase
          .from('saved_properties')
          .insert({
            user_id: user.id,
            property_id: property.id,
          });

        if (error) throw error;
        setIsSaved(true);
        toast.success('Property saved');
      }
    } catch (error: any) {
      console.error('Error toggling save:', error);
      toast.error('Failed to update saved status. Please try again.');
    }
  };

  const handleShare = async () => {
    if (navigator.share && property) {
      try {
        await navigator.share({
          title: property.title,
          text: property.description,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleRequestViewing = () => {
    if (!user) {
      navigate(`/login?return=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    // Check user role from profile
    if (profile?.role !== 'tenant') {
      toast.error('Only tenants can request viewings.');
      return;
    }

    if (property) {
      setViewingRequestModalOpen(true);
    }
  };

  const getPropertyIcon = () => {
    switch (property?.property_type) {
      case 'house':
      case 'apartment':
      case 'room':
      case 'shop':
      case 'office':
        return <HomeIcon size={18} />;
      default:
        return <HomeIcon size={18} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container-custom max-w-4xl">
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={48} className="animate-spin text-primary mb-4" />
            <p className="text-text-light">Loading property details...</p>
            {error && (
              <p className="text-error mt-2 text-sm">Error: {error}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container-custom max-w-4xl">
          <div className="text-center py-20">
            <XCircle size={64} className="mx-auto text-error mb-4" />
            <h1 className="text-2xl font-bold text-text mb-2">Property Not Found</h1>
            <p className="text-text-light mb-6">{error || 'The property you are looking for does not exist.'}</p>
            <Button onClick={() => navigate('/browse')}>Browse Properties</Button>
          </div>
        </div>
      </div>
    );
  }

  // Sort images: primary first, then by display_order
  const sortedImages = [...(property.property_images || [])]
    .sort((a, b) => {
      if (a.is_primary) return -1;
      if (b.is_primary) return 1;
      return a.display_order - b.display_order;
    })
    .map(img => img.image_url);

  const imageUrls = sortedImages.length > 0 ? sortedImages : ['/placeholder-property.jpg'];
  const descriptionLength = property.description?.length || 0;
  const shouldTruncate = descriptionLength > 300;

  return (
    <div className={`min-h-screen bg-background ${property.status === 'available' && profile?.role === 'tenant' ? 'pb-24 lg:pb-0' : ''}`}>
      <div className="container-custom max-w-5xl py-4 md:py-6 lg:py-8">
        {/* Image Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-4 md:mb-6"
        >
          {imageUrls.length > 0 ? (
            <div className="relative">
              <div className="w-full flex justify-center px-4 md:px-0">
                <div className="w-full max-w-full md:max-w-2xl">
                  {imageUrls.length > 1 ? (
                    <div className="relative">
                      <Stack
                        randomRotation={true}
                        sensitivity={180}
                        sendToBackOnClick={false}
                        cardDimensions={{ width: 600, height: 500 }}
                        cardsData={imageUrls.map((img, index) => ({
                          id: index + 1,
                          img: img,
                        }))}
                      />
                      {/* Swipe Hint */}
                      <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/70 backdrop-blur-sm text-white text-xs font-medium rounded-full z-10 flex items-center gap-1.5">
                        <span>👆</span>
                        <span className="hidden sm:inline">Swipe to see more</span>
                        <span className="sm:hidden">Swipe</span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full h-64 md:h-96 rounded-xl overflow-hidden">
                      <img
                        src={imageUrls[0]}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
              {/* Image Counter Overlay */}
              {imageUrls.length > 1 && (
                <div className="absolute bottom-4 right-4 px-4 py-2 bg-black/80 backdrop-blur-sm text-white text-sm font-semibold rounded-full z-10">
                  {imageUrls.length} {imageUrls.length === 1 ? 'Photo' : 'Photos'}
                </div>
              )}
            </div>
          ) : (
            <div className="relative w-full h-64 md:h-96 bg-gray-200 rounded-xl flex items-center justify-center">
              <span className="text-text-light">No images available</span>
            </div>
          )}
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Title and Price Card - Enhanced */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-surface rounded-xl shadow-lg border border-gray-100 overflow-hidden"
            >
              <div className="p-5 md:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 pr-3">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text mb-2 leading-tight">
                      {property.title}
                    </h1>
                    <div className="flex items-center text-text-light text-sm md:text-base">
                      <MapPin size={18} className="mr-1.5 flex-shrink-0" />
                      <span className="line-clamp-1">{property.location}</span>
                    </div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleToggleSave}
                    disabled={isCheckingSaved}
                    className="p-2.5 rounded-full hover:bg-gray-50 transition-all duration-200 flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label={isSaved ? 'Unsave property' : 'Save property'}
                  >
                    <Heart
                      size={24}
                      fill={isSaved ? '#E4B012' : 'none'}
                      stroke={isSaved ? '#E4B012' : '#333'}
                      strokeWidth={isSaved ? 2.5 : 2}
                      className={`transition-all duration-200 ${isCheckingSaved ? 'opacity-50' : ''}`}
                    />
                  </motion.button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 pb-4 border-b border-gray-200">
                  <div className="flex items-baseline gap-2">
                    <span className="text-primary font-bold text-3xl md:text-4xl">
                      {formatPrice(property.price)}
                    </span>
                    <span className="text-text-light text-base md:text-lg">/month</span>
                  </div>
                  {/* Quick Book Viewing Button - Top Section */}
                  {property.status === 'available' && (
                    <Button
                      size="sm"
                      onClick={handleRequestViewing}
                      className="bg-primary text-white font-bold shadow-md hover:shadow-lg hover:bg-primary-dark transition-all text-sm px-4 py-2"
                    >
                      {profile?.role === 'tenant' ? (
                        <>Book Viewing • {formatPrice(property.viewing_fee)}</>
                      ) : (
                        <>Viewing Fee: {formatPrice(property.viewing_fee)}</>
                      )}
                    </Button>
                  )}
                  <span
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold w-fit shadow-sm ${
                      property.status === 'available'
                        ? 'bg-accent text-white border-2 border-accent'
                        : 'bg-red-50 text-red-700 border-2 border-red-200'
                    }`}
                  >
                    {property.status === 'available' ? (
                      <>
                        <CheckCircle2 size={18} className="flex-shrink-0" />
                        <span className="uppercase tracking-wide">Available for Rent</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={18} className="flex-shrink-0" />
                        <span className="uppercase tracking-wide">Not Available</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Quick Stats - Enhanced */}
                <div className="flex flex-wrap items-center gap-4 md:gap-6 text-text-light pt-2">
                  {property.bedrooms > 0 && (
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                      <Bed size={20} className="text-primary flex-shrink-0" />
                      <span className="font-semibold text-text">{property.bedrooms}</span>
                      <span className="text-sm">{property.bedrooms > 1 ? 'Beds' : 'Bed'}</span>
                    </div>
                  )}
                  {property.bathrooms > 0 && (
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                      <Bath size={20} className="text-primary flex-shrink-0" />
                      <span className="font-semibold text-text">{property.bathrooms}</span>
                      <span className="text-sm">{property.bathrooms > 1 ? 'Baths' : 'Bath'}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                    {getPropertyIcon()}
                    <span className="font-semibold text-text capitalize">{property.property_type}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Description - Enhanced */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-surface rounded-xl shadow-lg border border-gray-100 p-5 md:p-6"
            >
              <h2 className="text-xl md:text-2xl font-bold text-text mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-primary rounded-full"></div>
                Description
              </h2>
              <p className="text-text-light leading-relaxed whitespace-pre-line text-sm md:text-base">
                {shouldTruncate && !descriptionExpanded
                  ? `${property.description.substring(0, 300)}...`
                  : property.description}
              </p>
              {shouldTruncate && (
                <button
                  onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                  className="mt-4 text-primary font-semibold hover:text-primary-dark transition-colors flex items-center gap-1 group"
                >
                  <span>{descriptionExpanded ? 'Read Less' : 'Read More'}</span>
                  <motion.span
                    animate={{ rotate: descriptionExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="inline-block"
                  >
                    ↓
                  </motion.span>
                </button>
              )}
            </motion.div>

            {/* Amenities - Enhanced */}
            {property.amenities && property.amenities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="bg-surface rounded-xl shadow-lg border border-gray-100 p-5 md:p-6"
              >
                <h2 className="text-xl md:text-2xl font-bold text-text mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-primary rounded-full"></div>
                  Amenities
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.amenities.map((amenity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-text-light bg-gray-50 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <CheckCircle2 size={18} className="text-accent flex-shrink-0" />
                      <span className="text-sm md:text-base">{amenity}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Property Overview - Enhanced */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="bg-surface rounded-xl shadow-lg border border-gray-100 p-5 md:p-6"
            >
              <h2 className="text-xl md:text-2xl font-bold text-text mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-primary rounded-full"></div>
                Property Overview
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-3 border-b border-gray-100 hover:bg-gray-50 px-2 rounded-lg transition-colors">
                  <span className="text-text-light font-medium">Bedrooms</span>
                  <span className="font-bold text-text text-lg">{property.bedrooms}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100 hover:bg-gray-50 px-2 rounded-lg transition-colors">
                  <span className="text-text-light font-medium">Bathrooms</span>
                  <span className="font-bold text-text text-lg">{property.bathrooms}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100 hover:bg-gray-50 px-2 rounded-lg transition-colors">
                  <span className="text-text-light font-medium">Property Type</span>
                  <span className="font-bold text-text text-lg capitalize">{property.property_type}</span>
                </div>
                <div className="flex justify-between items-center py-3 hover:bg-gray-50 px-2 rounded-lg transition-colors">
                  <span className="text-text-light font-medium">Viewing Fee</span>
                  <span className="font-bold text-primary text-lg">{formatPrice(property.viewing_fee)}</span>
                </div>
                {/* Book Viewing Button - Property Overview Section */}
                {property.status === 'available' && (
                  <div className="pt-3">
                    <Button
                      fullWidth
                      size="md"
                      onClick={handleRequestViewing}
                      className="bg-primary text-white font-bold shadow-md hover:shadow-lg hover:bg-primary-dark transition-all"
                    >
                      {profile?.role === 'tenant' ? (
                        <>Book Viewing • {formatPrice(property.viewing_fee)}</>
                      ) : (
                        <>Login to Book Viewing • {formatPrice(property.viewing_fee)}</>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Listed By - Enhanced */}
            {property.profiles && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="bg-surface rounded-xl shadow-lg border border-gray-100 p-5 md:p-6"
              >
                <h2 className="text-xl md:text-2xl font-bold text-text mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-primary rounded-full"></div>
                  Listed By
                </h2>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-bold text-text text-lg mb-1">{property.profiles.full_name || 'N/A'}</p>
                    <p className="text-sm text-text-light capitalize">{property.profiles.role}</p>
                  </div>
                  {property.profiles.phone && (
                    <a
                      href={`tel:${property.profiles.phone}`}
                      className="flex items-center gap-3 text-text-light hover:text-primary transition-colors bg-gray-50 rounded-lg p-3 hover:bg-primary/5 group"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Phone size={18} className="text-primary" />
                      </div>
                      <span className="font-medium">{property.profiles.phone}</span>
                    </a>
                  )}
                  {property.profiles.email && (
                    <a
                      href={`mailto:${property.profiles.email}`}
                      className="flex items-center gap-3 text-text-light hover:text-primary transition-colors bg-gray-50 rounded-lg p-3 hover:bg-primary/5 group"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Mail size={18} className="text-primary" />
                      </div>
                      <span className="font-medium break-all">{property.profiles.email}</span>
                    </a>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Actions - Enhanced */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              {/* Action Buttons Card - Enhanced */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="bg-surface rounded-xl shadow-lg border border-gray-100 p-5 md:p-6 space-y-4"
              >
                {/* View Property Button - Always visible */}
                <Button
                  fullWidth
                  size="lg"
                  variant="secondary"
                  onClick={() => {
                    // Scroll to top to view property images
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="shadow-md hover:shadow-lg transition-shadow"
                >
                  <span className="flex items-center justify-center gap-2">
                    <HomeIcon size={20} />
                    <span>View Property</span>
                  </span>
                </Button>

                {property.status === 'available' && (
                  <Button
                    fullWidth
                    size="md"
                    onClick={handleRequestViewing}
                    className="bg-primary text-white font-bold shadow-md hover:shadow-lg hover:bg-primary-dark transition-all"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span>{profile?.role === 'tenant' ? 'Book Viewing' : 'Login to Book'}</span>
                      <span className="text-sm font-semibold">• {formatPrice(property.viewing_fee)}</span>
                    </span>
                  </Button>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={handleShare}
                    className="border-2 hover:bg-primary/5 hover:border-primary transition-all"
                  >
                    <Share2 size={18} />
                    <span className="hidden sm:inline ml-2">Share</span>
                  </Button>
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => {
                      if (!user) {
                        toast.error('Please log in to report a property')
                        navigate('/login')
                        return
                      }
                      setReportModalOpen(true)
                    }}
                    className="border-2 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all"
                  >
                    <Flag size={18} />
                    <span className="hidden sm:inline ml-2">Report</span>
                  </Button>
                </div>
              </motion.div>

              {/* View Stats - Enhanced */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl shadow-lg border border-gray-100 p-5 md:p-6"
              >
                <h3 className="text-sm font-semibold text-text-light mb-4 uppercase tracking-wide">Property Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-text-light text-sm">Views</span>
                    <span className="font-bold text-text text-lg">{property.view_count || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-gray-200">
                    <span className="text-text-light text-sm">Saved</span>
                    <span className="font-bold text-text text-lg">{property.save_count || 0} times</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile CTA - Enhanced */}
      {property.status === 'available' && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-primary/30 p-3 shadow-2xl z-20"
        >
          <div className="container-custom max-w-5xl">
            <Button
              fullWidth
              size="md"
              onClick={handleRequestViewing}
              className="bg-primary text-white font-bold shadow-lg hover:shadow-xl hover:bg-primary-dark transition-all"
            >
              {profile?.role === 'tenant' ? (
                <>Book Viewing • {formatPrice(property.viewing_fee)}</>
              ) : (
                <>Login to Book • {formatPrice(property.viewing_fee)}</>
              )}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        reportedType="property"
        reportedId={property?.id || ''}
      />

      {/* Viewing Request Modal */}
      {property && (
        <ViewingRequestModal
          isOpen={viewingRequestModalOpen}
          onClose={() => setViewingRequestModalOpen(false)}
          property={property}
        />
      )}
    </div>
  );
};

export default PropertyDetailPage;
