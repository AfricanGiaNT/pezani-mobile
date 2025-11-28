import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Heart, Bed, Bath, Home as HomeIcon, MapPin } from 'lucide-react';
import { useAuth } from '@contexts/AuthContext';
import { supabase } from '@lib/supabase';
const PropertyCard = ({ property, onSave }) => {
    const [isSaved, setIsSaved] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    // Check if property is saved when user is logged in
    useEffect(() => {
        if (user && property.id) {
            checkIfSaved();
        }
        else {
            setIsSaved(false);
        }
    }, [user, property.id]);
    const checkIfSaved = async () => {
        if (!user || !property.id)
            return;
        try {
            const { data } = await supabase
                .from('saved_properties')
                .select('id')
                .eq('user_id', user.id)
                .eq('property_id', property.id)
                .maybeSingle();
            setIsSaved(!!data);
        }
        catch (error) {
            // Not saved or error - treat as not saved
            setIsSaved(false);
        }
    };
    const handleSave = async (e) => {
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
                if (error)
                    throw error;
                setIsSaved(false);
                toast.success('Property unsaved');
                onSave?.(property.id);
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
                onSave?.(property.id);
            }
        }
        catch (error) {
            console.error('Error toggling save:', error);
            toast.error('Failed to update saved status. Please try again.');
        }
    };
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-MW', {
            style: 'currency',
            currency: 'MWK',
            minimumFractionDigits: 0,
        }).format(price).replace('MWK', 'MWK ');
    };
    const getPropertyIcon = () => {
        switch (property.property_type) {
            case 'house':
                return _jsx(HomeIcon, { size: 16 });
            case 'apartment':
                return _jsx(HomeIcon, { size: 16 });
            case 'room':
                return _jsx(HomeIcon, { size: 16 });
            case 'shop':
                return _jsx(HomeIcon, { size: 16 });
            case 'office':
                return _jsx(HomeIcon, { size: 16 });
            default:
                return _jsx(HomeIcon, { size: 16 });
        }
    };
    return (_jsx(Link, { to: `/properties/${property.id}`, children: _jsxs(motion.div, { layout: true, initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, whileHover: { y: -4 }, transition: { duration: 0.3 }, className: "bg-surface rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow h-full flex flex-col", children: [_jsxs("div", { className: "relative h-48 bg-gray-200 overflow-hidden", children: [property.images && property.images.length > 1 && (_jsxs("div", { className: "absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded z-10", children: ["1/", property.images.length] })), _jsx(motion.button, { whileTap: { scale: 0.9 }, onClick: handleSave, className: "absolute top-2 right-2 p-2 bg-white rounded-full shadow-md z-10 hover:bg-gray-50 transition-colors", children: _jsx(motion.div, { animate: {
                                    scale: isSaved ? [1, 1.3, 1] : 1,
                                }, transition: { duration: 0.3 }, children: _jsx(Heart, { size: 20, fill: isSaved ? '#E4B012' : 'none', stroke: isSaved ? '#E4B012' : '#333', strokeWidth: 2 }) }) }), !imageLoaded && (_jsx("div", { className: "absolute inset-0 bg-gray-200 animate-pulse" })), property.images && property.images.length > 0 ? (_jsx(motion.img, { src: property.images[0], alt: property.title, onLoad: () => setImageLoaded(true), whileHover: { scale: 1.05 }, transition: { duration: 0.3 }, className: "w-full h-full object-cover" })) : (_jsx("div", { className: "w-full h-full flex items-center justify-center bg-gray-200", children: _jsx(HomeIcon, { size: 48, className: "text-gray-400" }) }))] }), _jsxs("div", { className: "p-4 space-y-3 flex-1 flex flex-col", children: [_jsx("div", { children: _jsx("h3", { className: "font-semibold text-lg text-text mb-1 line-clamp-2 min-h-[3rem]", children: property.title }) }), _jsxs("div", { className: "flex items-start text-text text-sm", children: [_jsx(MapPin, { size: 16, className: "mr-1.5 flex-shrink-0 mt-0.5 text-text-light" }), _jsx("span", { className: "line-clamp-2", children: property.location })] }), _jsxs("div", { children: [_jsx("span", { className: "text-primary font-bold text-xl", children: formatPrice(property.price) }), _jsx("span", { className: "text-text-light text-sm ml-1", children: "/month" })] }), _jsxs("div", { className: "flex items-center gap-4 text-sm text-text flex-wrap", children: [property.bedrooms > 0 && (_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx(Bed, { size: 16, className: "text-text-light" }), _jsx("span", { className: "text-text font-medium", children: property.bedrooms })] })), property.bathrooms > 0 && (_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx(Bath, { size: 16, className: "text-text-light" }), _jsx("span", { className: "text-text font-medium", children: property.bathrooms })] })), _jsxs("div", { className: "flex items-center gap-1.5", children: [getPropertyIcon(), _jsx("span", { className: "capitalize text-text font-medium", children: property.property_type })] })] }), _jsx("div", { className: "pt-1", children: _jsxs("span", { className: `inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${property.status === 'available'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'}`, children: [_jsx("span", { className: "mr-1.5", children: "\u25CF" }), property.status === 'available' ? 'Available' : 'Unavailable'] }) })] })] }) }));
};
export default PropertyCard;
