import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Home as HomeIcon, TrendingUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/common';
import DarkVeil from '@/components/common/DarkVeil';
import { PropertyGrid } from '@/components/property';
import { supabase } from '@/lib/supabase';
const HomePage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [featuredProperties, setFeaturedProperties] = useState([]);
    const [recentProperties, setRecentProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/browse?search=${encodeURIComponent(searchQuery)}`);
        }
    };
    // Fetch featured and recent properties
    useEffect(() => {
        const fetchProperties = async () => {
            try {
                setLoading(true);
                // Fetch featured properties (most viewed or saved)
                const { data: featuredData } = await supabase
                    .from('properties')
                    .select('*, property_images(*)')
                    .eq('status', 'available')
                    .order('view_count', { ascending: false })
                    .order('save_count', { ascending: false })
                    .limit(6);
                // Fetch recent properties
                const { data: recentData } = await supabase
                    .from('properties')
                    .select('*, property_images(*)')
                    .eq('status', 'available')
                    .order('created_at', { ascending: false })
                    .limit(8);
                // Convert to PropertyGrid format
                const convertProperties = (props) => {
                    return (props || []).map(prop => ({
                        id: prop.id,
                        title: prop.title,
                        location: prop.location,
                        price: prop.price,
                        viewing_fee: prop.viewing_fee,
                        bedrooms: prop.bedrooms,
                        bathrooms: prop.bathrooms,
                        property_type: prop.property_type,
                        status: prop.status,
                        images: prop.property_images?.map((img) => img.image_url) || [],
                        description: prop.description,
                        amenities: prop.amenities || [],
                        view_count: prop.view_count || 0,
                        save_count: prop.save_count || 0,
                        created_at: prop.created_at,
                    }));
                };
                setFeaturedProperties(convertProperties(featuredData || []));
                setRecentProperties(convertProperties(recentData || []));
            }
            catch (error) {
                console.error('Error fetching properties:', error);
                setFeaturedProperties([]);
                setRecentProperties([]);
            }
            finally {
                setLoading(false);
            }
        };
        fetchProperties();
    }, []);
    return (_jsxs("div", { className: "min-h-screen", children: [_jsxs("section", { className: "relative bg-gradient-to-br from-secondary via-secondary-dark to-accent py-20 md:py-32 overflow-hidden min-h-[600px]", children: [_jsx("div", { className: "absolute inset-0 z-0 w-full h-full", style: { minHeight: '600px' }, children: _jsx(DarkVeil, { hueShift: 200, noiseIntensity: 0.02, scanlineIntensity: 0.1, speed: 0.3, scanlineFrequency: 2.0, warpAmount: 0.3, resolutionScale: 1 }) }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-secondary/80 via-secondary-dark/70 to-accent/80 z-[1]" }), _jsx("div", { className: "container-custom relative z-10", children: _jsxs("div", { className: "max-w-3xl mx-auto text-center", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8 }, children: [_jsx("h1", { className: "text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6", children: "Find Your Perfect Home in Malawi" }), _jsx("p", { className: "text-lg md:text-xl text-gray-200 mb-8", children: "Browse thousands of properties and connect with landlords directly. No more deceitful agents, no more hidden fees." })] }), _jsx(motion.form, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: 0.3 }, onSubmit: handleSearch, className: "relative max-w-2xl mx-auto", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-4 top-1/2 transform -translate-y-1/2 text-text-light", size: 24 }), _jsx("input", { type: "text", placeholder: "Search by location, property type, or price...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "w-full pl-14 pr-4 py-4 md:py-5 text-lg bg-white rounded-xl border-2 border-transparent focus:outline-none focus:border-primary shadow-2xl" }), _jsx(Button, { type: "submit", size: "lg", className: "absolute right-2 top-1/2 transform -translate-y-1/2", children: "Search" })] }) }), _jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.8, delay: 0.6 }, className: "mt-12 grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-3xl md:text-4xl font-bold text-primary mb-1", children: "500+" }), _jsx("div", { className: "text-sm md:text-base text-gray-300", children: "Properties" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-3xl md:text-4xl font-bold text-primary mb-1", children: "1000+" }), _jsx("div", { className: "text-sm md:text-base text-gray-300", children: "Happy Tenants" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-3xl md:text-4xl font-bold text-primary mb-1", children: "50+" }), _jsx("div", { className: "text-sm md:text-base text-gray-300", children: "Landlords" })] })] })] }) }), _jsx("div", { className: "absolute bottom-0 left-0 right-0 z-10", children: _jsx("svg", { viewBox: "0 0 1440 120", fill: "none", xmlns: "http://www.w3.org/2000/svg", className: "w-full h-auto", children: _jsx("path", { d: "M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z", fill: "#F8F9FA" }) }) })] }), _jsx("section", { className: "py-16 md:py-20 bg-background", children: _jsxs("div", { className: "container-custom", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 }, className: "text-center mb-12", children: [_jsxs("div", { className: "flex items-center justify-center gap-2 mb-4", children: [_jsx(TrendingUp, { className: "text-primary", size: 28 }), _jsx("h2", { className: "text-3xl md:text-4xl font-bold text-text", children: "Featured Properties" })] }), _jsx("p", { className: "text-text-light text-lg max-w-2xl mx-auto", children: "Hand-picked properties with verified information and quality photos" })] }), loading ? (_jsx("div", { className: "flex items-center justify-center py-20", children: _jsx(Loader2, { size: 48, className: "animate-spin text-primary" }) })) : featuredProperties.length > 0 ? (_jsx(PropertyGrid, { properties: featuredProperties.slice(0, 6) })) : (_jsx("div", { className: "text-center py-12", children: _jsx("p", { className: "text-text-light", children: "No featured properties available at the moment." }) })), _jsx(motion.div, { initial: { opacity: 0 }, whileInView: { opacity: 1 }, viewport: { once: true }, transition: { delay: 0.4 }, className: "text-center mt-12", children: _jsx(Link, { to: "/browse", children: _jsx(Button, { size: "lg", variant: "outline", children: "View All Properties" }) }) })] }) }), _jsx("section", { className: "py-16 md:py-20 bg-surface", children: _jsxs("div", { className: "container-custom", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 }, className: "text-center mb-12", children: [_jsxs("div", { className: "flex items-center justify-center gap-2 mb-4", children: [_jsx(HomeIcon, { className: "text-primary", size: 28 }), _jsx("h2", { className: "text-3xl md:text-4xl font-bold text-text", children: "Recently Added" })] }), _jsx("p", { className: "text-text-light text-lg max-w-2xl mx-auto", children: "Fresh listings from verified landlords and agents" })] }), loading ? (_jsx("div", { className: "flex items-center justify-center py-20", children: _jsx(Loader2, { size: 48, className: "animate-spin text-primary" }) })) : recentProperties.length > 0 ? (_jsx(PropertyGrid, { properties: recentProperties.slice(0, 8) })) : (_jsx("div", { className: "text-center py-12", children: _jsx("p", { className: "text-text-light", children: "No recent properties available at the moment." }) })), _jsx(motion.div, { initial: { opacity: 0 }, whileInView: { opacity: 1 }, viewport: { once: true }, transition: { delay: 0.4 }, className: "text-center mt-12", children: _jsx(Link, { to: "/browse", children: _jsx(Button, { size: "lg", children: "Browse More Properties" }) }) })] }) }), _jsx("section", { className: "py-16 md:py-20 bg-primary", children: _jsx("div", { className: "container-custom", children: _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 }, className: "text-center max-w-3xl mx-auto", children: [_jsx("h2", { className: "text-3xl md:text-4xl font-bold text-white mb-6", children: "Are You a Landlord?" }), _jsx("p", { className: "text-lg text-white/90 mb-8", children: "List your properties for free and reach thousands of potential tenants. No hidden fees, no commission charges." }), _jsx(Link, { to: "/signup", children: _jsx(Button, { size: "lg", variant: "secondary", children: "List Your Property" }) })] }) }) })] }));
};
export default HomePage;
