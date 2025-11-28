import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Heart, Bed, Bath, Home as HomeIcon, MapPin, Share2, Flag, Phone, Mail, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/common';
import Stack from '@/components/property/Stack';
import ReportModal from '@/components/common/ReportModal';
import ViewingRequestModal from '@/components/property/ViewingRequestModal';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice } from '@/utils/formatting';
const PropertyDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, profile } = useAuth();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
                    }
                    catch (profileErr) {
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
                if (!isMounted)
                    return;
                // Increment view count (don't wait for this, do it in background)
                Promise.resolve(supabase
                    .from('properties')
                    .update({ view_count: (propertyData.view_count || 0) + 1 })
                    .eq('id', id))
                    .then(() => {
                    // Update local state if successful
                    if (isMounted) {
                        setProperty(prev => prev ? { ...prev, view_count: (prev.view_count || 0) + 1 } : null);
                    }
                })
                    .catch((err) => {
                    console.warn('Failed to increment view count:', err);
                });
                setProperty(combinedData);
                // Check if property is saved (if user is logged in)
                if (user && isMounted) {
                    checkIfSaved(propertyData.id);
                }
            }
            catch (err) {
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
            }
            finally {
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
    const checkIfSaved = async (propertyId) => {
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
        }
        catch (error) {
            // Not saved or error - treat as not saved
            console.error('Error checking if saved:', error);
            setIsSaved(false);
        }
        finally {
            setIsCheckingSaved(false);
        }
    };
    const handleToggleSave = async () => {
        if (!user) {
            navigate(`/login?return=${encodeURIComponent(window.location.pathname)}`);
            return;
        }
        if (!property)
            return;
        try {
            if (isSaved) {
                // Unsave
                const { error } = await supabase
                    .from('saved_properties')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('property_id', property.id);
                if (error)
                    throw error;
                setIsSaved(false);
                toast.success('Property unsaved');
            }
            else {
                // Save
                const { error } = await supabase
                    .from('saved_properties')
                    .insert({
                    user_id: user.id,
                    property_id: property.id,
                });
                if (error)
                    throw error;
                setIsSaved(true);
                toast.success('Property saved');
            }
        }
        catch (error) {
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
            }
            catch (error) {
                // User cancelled or error
            }
        }
        else {
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
                return _jsx(HomeIcon, { size: 18 });
            default:
                return _jsx(HomeIcon, { size: 18 });
        }
    };
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-background py-8", children: _jsx("div", { className: "container-custom max-w-4xl", children: _jsxs("div", { className: "flex flex-col items-center justify-center py-20", children: [_jsx(Loader2, { size: 48, className: "animate-spin text-primary mb-4" }), _jsx("p", { className: "text-text-light", children: "Loading property details..." }), error && (_jsxs("p", { className: "text-error mt-2 text-sm", children: ["Error: ", error] }))] }) }) }));
    }
    if (error || !property) {
        return (_jsx("div", { className: "min-h-screen bg-background py-8", children: _jsx("div", { className: "container-custom max-w-4xl", children: _jsxs("div", { className: "text-center py-20", children: [_jsx(XCircle, { size: 64, className: "mx-auto text-error mb-4" }), _jsx("h1", { className: "text-2xl font-bold text-text mb-2", children: "Property Not Found" }), _jsx("p", { className: "text-text-light mb-6", children: error || 'The property you are looking for does not exist.' }), _jsx(Button, { onClick: () => navigate('/browse'), children: "Browse Properties" })] }) }) }));
    }
    // Sort images: primary first, then by display_order
    const sortedImages = [...(property.property_images || [])]
        .sort((a, b) => {
        if (a.is_primary)
            return -1;
        if (b.is_primary)
            return 1;
        return a.display_order - b.display_order;
    })
        .map(img => img.image_url);
    const imageUrls = sortedImages.length > 0 ? sortedImages : ['/placeholder-property.jpg'];
    const descriptionLength = property.description?.length || 0;
    const shouldTruncate = descriptionLength > 300;
    return (_jsxs("div", { className: `min-h-screen bg-background ${property.status === 'available' && profile?.role === 'tenant' ? 'pb-24 lg:pb-0' : ''}`, children: [_jsxs("div", { className: "container-custom max-w-5xl py-4 md:py-6 lg:py-8", children: [_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 }, className: "mb-4 md:mb-6", children: imageUrls.length > 0 ? (_jsxs("div", { className: "relative", children: [_jsx("div", { className: "w-full flex justify-center px-4 md:px-0", children: _jsx("div", { className: "w-full max-w-full md:max-w-2xl", children: imageUrls.length > 1 ? (_jsxs("div", { className: "relative", children: [_jsx(Stack, { randomRotation: true, sensitivity: 180, sendToBackOnClick: false, cardDimensions: { width: 600, height: 500 }, cardsData: imageUrls.map((img, index) => ({
                                                        id: index + 1,
                                                        img: img,
                                                    })) }), _jsxs("div", { className: "absolute top-4 left-4 px-3 py-1.5 bg-black/70 backdrop-blur-sm text-white text-xs font-medium rounded-full z-10 flex items-center gap-1.5", children: [_jsx("span", { children: "\uD83D\uDC46" }), _jsx("span", { className: "hidden sm:inline", children: "Swipe to see more" }), _jsx("span", { className: "sm:hidden", children: "Swipe" })] })] })) : (_jsx("div", { className: "relative w-full h-64 md:h-96 rounded-xl overflow-hidden", children: _jsx("img", { src: imageUrls[0], alt: property.title, className: "w-full h-full object-cover" }) })) }) }), imageUrls.length > 1 && (_jsxs("div", { className: "absolute bottom-4 right-4 px-4 py-2 bg-black/80 backdrop-blur-sm text-white text-sm font-semibold rounded-full z-10", children: [imageUrls.length, " ", imageUrls.length === 1 ? 'Photo' : 'Photos'] }))] })) : (_jsx("div", { className: "relative w-full h-64 md:h-96 bg-gray-200 rounded-xl flex items-center justify-center", children: _jsx("span", { className: "text-text-light", children: "No images available" }) })) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6", children: [_jsxs("div", { className: "lg:col-span-2 space-y-4 md:space-y-6", children: [_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay: 0.1 }, className: "bg-surface rounded-xl shadow-lg border border-gray-100 overflow-hidden", children: _jsxs("div", { className: "p-5 md:p-6", children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsxs("div", { className: "flex-1 pr-3", children: [_jsx("h1", { className: "text-2xl md:text-3xl lg:text-4xl font-bold text-text mb-2 leading-tight", children: property.title }), _jsxs("div", { className: "flex items-center text-text-light text-sm md:text-base", children: [_jsx(MapPin, { size: 18, className: "mr-1.5 flex-shrink-0" }), _jsx("span", { className: "line-clamp-1", children: property.location })] })] }), _jsx(motion.button, { whileTap: { scale: 0.95 }, onClick: handleToggleSave, disabled: isCheckingSaved, className: "p-2.5 rounded-full hover:bg-gray-50 transition-all duration-200 flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center", "aria-label": isSaved ? 'Unsave property' : 'Save property', children: _jsx(Heart, { size: 24, fill: isSaved ? '#E4B012' : 'none', stroke: isSaved ? '#E4B012' : '#333', strokeWidth: isSaved ? 2.5 : 2, className: `transition-all duration-200 ${isCheckingSaved ? 'opacity-50' : ''}` }) })] }), _jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 pb-4 border-b border-gray-200", children: [_jsxs("div", { className: "flex items-baseline gap-2", children: [_jsx("span", { className: "text-primary font-bold text-3xl md:text-4xl", children: formatPrice(property.price) }), _jsx("span", { className: "text-text-light text-base md:text-lg", children: "/month" })] }), property.status === 'available' && (_jsx(Button, { size: "sm", onClick: handleRequestViewing, className: "bg-primary text-white font-bold shadow-md hover:shadow-lg hover:bg-primary-dark transition-all text-sm px-4 py-2", children: profile?.role === 'tenant' ? (_jsxs(_Fragment, { children: ["Book Viewing \u2022 ", formatPrice(property.viewing_fee)] })) : (_jsxs(_Fragment, { children: ["Viewing Fee: ", formatPrice(property.viewing_fee)] })) })), _jsx("span", { className: `inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold w-fit shadow-sm ${property.status === 'available'
                                                                ? 'bg-accent text-white border-2 border-accent'
                                                                : 'bg-red-50 text-red-700 border-2 border-red-200'}`, children: property.status === 'available' ? (_jsxs(_Fragment, { children: [_jsx(CheckCircle2, { size: 18, className: "flex-shrink-0" }), _jsx("span", { className: "uppercase tracking-wide", children: "Available for Rent" })] })) : (_jsxs(_Fragment, { children: [_jsx(XCircle, { size: 18, className: "flex-shrink-0" }), _jsx("span", { className: "uppercase tracking-wide", children: "Not Available" })] })) })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-4 md:gap-6 text-text-light pt-2", children: [property.bedrooms > 0 && (_jsxs("div", { className: "flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg", children: [_jsx(Bed, { size: 20, className: "text-primary flex-shrink-0" }), _jsx("span", { className: "font-semibold text-text", children: property.bedrooms }), _jsx("span", { className: "text-sm", children: property.bedrooms > 1 ? 'Beds' : 'Bed' })] })), property.bathrooms > 0 && (_jsxs("div", { className: "flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg", children: [_jsx(Bath, { size: 20, className: "text-primary flex-shrink-0" }), _jsx("span", { className: "font-semibold text-text", children: property.bathrooms }), _jsx("span", { className: "text-sm", children: property.bathrooms > 1 ? 'Baths' : 'Bath' })] })), _jsxs("div", { className: "flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg", children: [getPropertyIcon(), _jsx("span", { className: "font-semibold text-text capitalize", children: property.property_type })] })] })] }) }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay: 0.2 }, className: "bg-surface rounded-xl shadow-lg border border-gray-100 p-5 md:p-6", children: [_jsxs("h2", { className: "text-xl md:text-2xl font-bold text-text mb-4 flex items-center gap-2", children: [_jsx("div", { className: "w-1 h-6 bg-primary rounded-full" }), "Description"] }), _jsx("p", { className: "text-text-light leading-relaxed whitespace-pre-line text-sm md:text-base", children: shouldTruncate && !descriptionExpanded
                                                    ? `${property.description.substring(0, 300)}...`
                                                    : property.description }), shouldTruncate && (_jsxs("button", { onClick: () => setDescriptionExpanded(!descriptionExpanded), className: "mt-4 text-primary font-semibold hover:text-primary-dark transition-colors flex items-center gap-1 group", children: [_jsx("span", { children: descriptionExpanded ? 'Read Less' : 'Read More' }), _jsx(motion.span, { animate: { rotate: descriptionExpanded ? 180 : 0 }, transition: { duration: 0.2 }, className: "inline-block", children: "\u2193" })] }))] }), property.amenities && property.amenities.length > 0 && (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay: 0.3 }, className: "bg-surface rounded-xl shadow-lg border border-gray-100 p-5 md:p-6", children: [_jsxs("h2", { className: "text-xl md:text-2xl font-bold text-text mb-4 flex items-center gap-2", children: [_jsx("div", { className: "w-1 h-6 bg-primary rounded-full" }), "Amenities"] }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-3", children: property.amenities.map((amenity, index) => (_jsxs("div", { className: "flex items-center gap-2 text-text-light bg-gray-50 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors", children: [_jsx(CheckCircle2, { size: 18, className: "text-accent flex-shrink-0" }), _jsx("span", { className: "text-sm md:text-base", children: amenity })] }, index))) })] })), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay: 0.4 }, className: "bg-surface rounded-xl shadow-lg border border-gray-100 p-5 md:p-6", children: [_jsxs("h2", { className: "text-xl md:text-2xl font-bold text-text mb-4 flex items-center gap-2", children: [_jsx("div", { className: "w-1 h-6 bg-primary rounded-full" }), "Property Overview"] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between items-center py-3 border-b border-gray-100 hover:bg-gray-50 px-2 rounded-lg transition-colors", children: [_jsx("span", { className: "text-text-light font-medium", children: "Bedrooms" }), _jsx("span", { className: "font-bold text-text text-lg", children: property.bedrooms })] }), _jsxs("div", { className: "flex justify-between items-center py-3 border-b border-gray-100 hover:bg-gray-50 px-2 rounded-lg transition-colors", children: [_jsx("span", { className: "text-text-light font-medium", children: "Bathrooms" }), _jsx("span", { className: "font-bold text-text text-lg", children: property.bathrooms })] }), _jsxs("div", { className: "flex justify-between items-center py-3 border-b border-gray-100 hover:bg-gray-50 px-2 rounded-lg transition-colors", children: [_jsx("span", { className: "text-text-light font-medium", children: "Property Type" }), _jsx("span", { className: "font-bold text-text text-lg capitalize", children: property.property_type })] }), _jsxs("div", { className: "flex justify-between items-center py-3 hover:bg-gray-50 px-2 rounded-lg transition-colors", children: [_jsx("span", { className: "text-text-light font-medium", children: "Viewing Fee" }), _jsx("span", { className: "font-bold text-primary text-lg", children: formatPrice(property.viewing_fee) })] }), property.status === 'available' && (_jsx("div", { className: "pt-3", children: _jsx(Button, { fullWidth: true, size: "md", onClick: handleRequestViewing, className: "bg-primary text-white font-bold shadow-md hover:shadow-lg hover:bg-primary-dark transition-all", children: profile?.role === 'tenant' ? (_jsxs(_Fragment, { children: ["Book Viewing \u2022 ", formatPrice(property.viewing_fee)] })) : (_jsxs(_Fragment, { children: ["Login to Book Viewing \u2022 ", formatPrice(property.viewing_fee)] })) }) }))] })] }), property.profiles && (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay: 0.5 }, className: "bg-surface rounded-xl shadow-lg border border-gray-100 p-5 md:p-6", children: [_jsxs("h2", { className: "text-xl md:text-2xl font-bold text-text mb-4 flex items-center gap-2", children: [_jsx("div", { className: "w-1 h-6 bg-primary rounded-full" }), "Listed By"] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsx("p", { className: "font-bold text-text text-lg mb-1", children: property.profiles.full_name || 'N/A' }), _jsx("p", { className: "text-sm text-text-light capitalize", children: property.profiles.role })] }), property.profiles.phone && (_jsxs("a", { href: `tel:${property.profiles.phone}`, className: "flex items-center gap-3 text-text-light hover:text-primary transition-colors bg-gray-50 rounded-lg p-3 hover:bg-primary/5 group", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors", children: _jsx(Phone, { size: 18, className: "text-primary" }) }), _jsx("span", { className: "font-medium", children: property.profiles.phone })] })), property.profiles.email && (_jsxs("a", { href: `mailto:${property.profiles.email}`, className: "flex items-center gap-3 text-text-light hover:text-primary transition-colors bg-gray-50 rounded-lg p-3 hover:bg-primary/5 group", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors", children: _jsx(Mail, { size: 18, className: "text-primary" }) }), _jsx("span", { className: "font-medium break-all", children: property.profiles.email })] }))] })] }))] }), _jsx("div", { className: "lg:col-span-1", children: _jsxs("div", { className: "sticky top-4 space-y-4", children: [_jsxs(motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.4, delay: 0.2 }, className: "bg-surface rounded-xl shadow-lg border border-gray-100 p-5 md:p-6 space-y-4", children: [_jsx(Button, { fullWidth: true, size: "lg", variant: "secondary", onClick: () => {
                                                        // Scroll to top to view property images
                                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                                    }, className: "shadow-md hover:shadow-lg transition-shadow", children: _jsxs("span", { className: "flex items-center justify-center gap-2", children: [_jsx(HomeIcon, { size: 20 }), _jsx("span", { children: "View Property" })] }) }), property.status === 'available' && (_jsx(Button, { fullWidth: true, size: "md", onClick: handleRequestViewing, className: "bg-primary text-white font-bold shadow-md hover:shadow-lg hover:bg-primary-dark transition-all", children: _jsxs("span", { className: "flex items-center justify-center gap-2", children: [_jsx("span", { children: profile?.role === 'tenant' ? 'Book Viewing' : 'Login to Book' }), _jsxs("span", { className: "text-sm font-semibold", children: ["\u2022 ", formatPrice(property.viewing_fee)] })] }) })), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs(Button, { variant: "outline", fullWidth: true, onClick: handleShare, className: "border-2 hover:bg-primary/5 hover:border-primary transition-all", children: [_jsx(Share2, { size: 18 }), _jsx("span", { className: "hidden sm:inline ml-2", children: "Share" })] }), _jsxs(Button, { variant: "outline", fullWidth: true, onClick: () => {
                                                                if (!user) {
                                                                    toast.error('Please log in to report a property');
                                                                    navigate('/login');
                                                                    return;
                                                                }
                                                                setReportModalOpen(true);
                                                            }, className: "border-2 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all", children: [_jsx(Flag, { size: 18 }), _jsx("span", { className: "hidden sm:inline ml-2", children: "Report" })] })] })] }), _jsxs(motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.4, delay: 0.3 }, className: "bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl shadow-lg border border-gray-100 p-5 md:p-6", children: [_jsx("h3", { className: "text-sm font-semibold text-text-light mb-4 uppercase tracking-wide", children: "Property Stats" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between items-center py-2", children: [_jsx("span", { className: "text-text-light text-sm", children: "Views" }), _jsx("span", { className: "font-bold text-text text-lg", children: property.view_count || 0 })] }), _jsxs("div", { className: "flex justify-between items-center py-2 border-t border-gray-200", children: [_jsx("span", { className: "text-text-light text-sm", children: "Saved" }), _jsxs("span", { className: "font-bold text-text text-lg", children: [property.save_count || 0, " times"] })] })] })] })] }) })] })] }), property.status === 'available' && (_jsx(motion.div, { initial: { y: 100 }, animate: { y: 0 }, transition: { type: 'spring', damping: 25, stiffness: 200 }, className: "lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-primary/30 p-3 shadow-2xl z-20", children: _jsx("div", { className: "container-custom max-w-5xl", children: _jsx(Button, { fullWidth: true, size: "md", onClick: handleRequestViewing, className: "bg-primary text-white font-bold shadow-lg hover:shadow-xl hover:bg-primary-dark transition-all", children: profile?.role === 'tenant' ? (_jsxs(_Fragment, { children: ["Book Viewing \u2022 ", formatPrice(property.viewing_fee)] })) : (_jsxs(_Fragment, { children: ["Login to Book \u2022 ", formatPrice(property.viewing_fee)] })) }) }) })), _jsx(ReportModal, { isOpen: reportModalOpen, onClose: () => setReportModalOpen(false), reportedType: "property", reportedId: property?.id || '' }), property && (_jsx(ViewingRequestModal, { isOpen: viewingRequestModalOpen, onClose: () => setViewingRequestModalOpen(false), property: property }))] }));
};
export default PropertyDetailPage;
