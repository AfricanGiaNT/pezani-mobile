import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Bookmark, Search, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@components/common';
import PropertyCard from '@components/property/PropertyCard';
import { supabase } from '@lib/supabase';
import { useAuth } from '@contexts/AuthContext';
const SavedPropertiesPage = () => {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [savedProperties, setSavedProperties] = useState([]);
    // Redirect if not tenant
    useEffect(() => {
        if (profile && profile.role !== 'tenant') {
            navigate('/dashboard');
        }
    }, [profile, navigate]);
    // Fetch saved properties
    useEffect(() => {
        if (user && profile?.role === 'tenant') {
            fetchSavedProperties();
        }
    }, [user, profile]);
    const fetchSavedProperties = async () => {
        if (!user)
            return;
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('saved_properties')
                .select(`
          id,
          created_at,
          properties (
            *,
            property_images (
              image_url,
              is_primary,
              display_order
            )
          )
        `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            if (error)
                throw error;
            // Transform data to match PropertyCard format
            const transformed = (data || []).map((item) => ({
                id: item.id,
                created_at: item.created_at,
                properties: item.properties,
            }));
            setSavedProperties(transformed);
        }
        catch (error) {
            console.error('Error fetching saved properties:', error);
            toast.error('Failed to load saved properties');
        }
        finally {
            setLoading(false);
        }
    };
    const handleUnsave = async (propertyId) => {
        if (!user)
            return;
        try {
            const { error } = await supabase
                .from('saved_properties')
                .delete()
                .eq('user_id', user.id)
                .eq('property_id', propertyId);
            if (error)
                throw error;
            // Remove from local state
            setSavedProperties((prev) => prev.filter((item) => item.properties.id !== propertyId));
            toast.success('Property unsaved');
        }
        catch (error) {
            console.error('Error unsaving property:', error);
            toast.error('Failed to unsave property');
        }
    };
    // Convert saved properties to PropertyCard format
    const convertedProperties = savedProperties.map((item) => ({
        id: item.properties.id,
        title: item.properties.title,
        location: item.properties.location,
        price: item.properties.price,
        viewing_fee: item.properties.viewing_fee,
        bedrooms: item.properties.bedrooms,
        bathrooms: item.properties.bathrooms,
        property_type: item.properties.property_type,
        status: item.properties.status,
        images: item.properties.property_images
            ?.sort((a, b) => {
            // Primary image first, then by display_order
            if (a.is_primary)
                return -1;
            if (b.is_primary)
                return 1;
            return a.display_order - b.display_order;
        })
            .map((img) => img.image_url) || [],
        description: item.properties.description,
        amenities: item.properties.amenities || [],
        view_count: item.properties.view_count || 0,
        save_count: item.properties.save_count || 0,
        created_at: item.properties.created_at,
    }));
    if (!user || profile?.role !== 'tenant') {
        return (_jsx("div", { className: "container mx-auto px-4 py-8", children: _jsx("div", { className: "text-center", children: "Loading..." }) }));
    }
    return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsx("div", { className: "flex items-center gap-4 mb-6", children: _jsx(Button, { variant: "ghost", size: "sm", onClick: () => navigate('/dashboard'), leftIcon: _jsx(ArrowLeft, { size: 18 }), className: "text-text-light hover:text-text", children: "Back to Dashboard" }) }), _jsx("div", { className: "flex items-center justify-between mb-6", children: _jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-text mb-2", children: "Saved Properties" }), _jsxs("p", { className: "text-text-light", children: [convertedProperties.length, " ", convertedProperties.length === 1 ? 'property' : 'properties', " saved"] })] }) }), loading ? (_jsx("div", { className: "flex items-center justify-center py-12", children: _jsx(Loader2, { size: 32, className: "animate-spin text-primary" }) })) : convertedProperties.length === 0 ? (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "bg-surface rounded-lg shadow-md p-12 text-center border border-gray-200", children: [_jsx("div", { className: "w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center", children: _jsx(Bookmark, { size: 48, className: "text-text-light" }) }), _jsx("h3", { className: "text-xl font-semibold text-text mb-2", children: "No saved properties yet" }), _jsx("p", { className: "text-text-light mb-6", children: "Start browsing to save properties you like!" }), _jsx(Button, { onClick: () => navigate('/browse'), leftIcon: _jsx(Search, { size: 18 }), children: "Browse Properties" })] })) : (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6", children: convertedProperties.map((property) => (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "relative", children: [_jsx(PropertyCard, { property: property, onSave: handleUnsave }), property.status === 'unavailable' && (_jsx("div", { className: "absolute top-2 left-2 z-20 bg-error text-white px-2 py-1 rounded text-xs font-medium", children: "Unavailable" }))] }, property.id))) }))] }));
};
export default SavedPropertiesPage;
