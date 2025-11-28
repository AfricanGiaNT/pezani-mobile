import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Heart, Bed, Bath, Home as HomeIcon, MapPin } from 'lucide-react';
import { useAuth } from '@contexts/AuthContext';
import { supabase } from '@lib/supabase';
import { MockProperty } from '@/utils/mockData';

interface PropertyCardProps {
  property: MockProperty;
  onSave?: (propertyId: string) => void;
}

const PropertyCard = ({ property, onSave }: PropertyCardProps) => {
  const [isSaved, setIsSaved] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if property is saved when user is logged in
  useEffect(() => {
    if (user && property.id) {
      checkIfSaved();
    } else {
      setIsSaved(false);
    }
  }, [user, property.id]);

  const checkIfSaved = async () => {
    if (!user || !property.id) return;

    try {
      const { data } = await supabase
        .from('saved_properties')
        .select('id')
        .eq('user_id', user.id)
        .eq('property_id', property.id)
        .maybeSingle();

      setIsSaved(!!data);
    } catch (error) {
      // Not saved or error - treat as not saved
      setIsSaved(false);
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate(`/login?return=${encodeURIComponent(location.pathname)}`);
      return;
    }

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
        onSave?.(property.id);
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
        onSave?.(property.id);
      }
    } catch (error: any) {
      console.error('Error toggling save:', error);
      toast.error('Failed to update saved status. Please try again.');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-MW', {
      style: 'currency',
      currency: 'MWK',
      minimumFractionDigits: 0,
    }).format(price).replace('MWK', 'MWK ');
  };

  const getPropertyIcon = () => {
    switch (property.property_type) {
      case 'house':
        return <HomeIcon size={16} />;
      case 'apartment':
        return <HomeIcon size={16} />;
      case 'room':
        return <HomeIcon size={16} />;
      case 'shop':
        return <HomeIcon size={16} />;
      case 'office':
        return <HomeIcon size={16} />;
      default:
        return <HomeIcon size={16} />;
    }
  };

  return (
    <Link to={`/properties/${property.id}`}>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
        className="bg-surface rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow h-full flex flex-col"
      >
        {/* Image Container */}
        <div className="relative h-48 bg-gray-200 overflow-hidden">
          {/* Image Counter */}
          {property.images && property.images.length > 1 && (
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded z-10">
              1/{property.images.length}
            </div>
          )}

          {/* Save Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSave}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md z-10 hover:bg-gray-50 transition-colors"
          >
            <motion.div
              animate={{
                scale: isSaved ? [1, 1.3, 1] : 1,
              }}
              transition={{ duration: 0.3 }}
            >
              <Heart
                size={20}
                fill={isSaved ? '#E4B012' : 'none'}
                stroke={isSaved ? '#E4B012' : '#333'}
                strokeWidth={2}
              />
            </motion.div>
          </motion.button>

          {/* Property Image */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
          {property.images && property.images.length > 0 ? (
            <motion.img
              src={property.images[0]}
              alt={property.title}
              onLoad={() => setImageLoaded(true)}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <HomeIcon size={48} className="text-gray-400" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 flex-1 flex flex-col">
          {/* Title */}
          <div>
            <h3 className="font-semibold text-lg text-text mb-1 line-clamp-2 min-h-[3rem]">
              {property.title}
            </h3>
          </div>

          {/* Location */}
          <div className="flex items-start text-text text-sm">
            <MapPin size={16} className="mr-1.5 flex-shrink-0 mt-0.5 text-text-light" />
            <span className="line-clamp-2">{property.location}</span>
          </div>

          {/* Price */}
          <div>
            <span className="text-primary font-bold text-xl">
              {formatPrice(property.price)}
            </span>
            <span className="text-text-light text-sm ml-1">/month</span>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-4 text-sm text-text flex-wrap">
            {property.bedrooms > 0 && (
              <div className="flex items-center gap-1.5">
                <Bed size={16} className="text-text-light" />
                <span className="text-text font-medium">{property.bedrooms}</span>
              </div>
            )}
            {property.bathrooms > 0 && (
              <div className="flex items-center gap-1.5">
                <Bath size={16} className="text-text-light" />
                <span className="text-text font-medium">{property.bathrooms}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              {getPropertyIcon()}
              <span className="capitalize text-text font-medium">{property.property_type}</span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="pt-1">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                property.status === 'available' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}
            >
              <span className="mr-1.5">●</span>
              {property.status === 'available' ? 'Available' : 'Unavailable'}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default PropertyCard;
