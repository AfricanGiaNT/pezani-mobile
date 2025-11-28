import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/common';
import PropertyGrid from '@/components/property/PropertyGrid';
import PropertyFilters from '@/components/property/PropertyFilters';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
const BrowsePage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState('newest');
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const itemsPerPage = 12;
    // Initialize filters from URL params
    const [filters, setFilters] = useState({
        location: searchParams.get('location') || '',
        minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : '',
        maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : '',
        bedrooms: searchParams.get('bedrooms') || '',
        propertyTypes: searchParams.get('propertyTypes')?.split(',') || [],
        status: searchParams.get('status') || 'available',
    });
    const searchQuery = searchParams.get('search') || '';
    // Fetch properties
    useEffect(() => {
        fetchProperties();
    }, [filters, sortBy, page, searchQuery]);
    // Update URL params when filters change
    useEffect(() => {
        const params = new URLSearchParams();
        if (filters.location)
            params.set('location', filters.location);
        if (filters.minPrice)
            params.set('minPrice', String(filters.minPrice));
        if (filters.maxPrice)
            params.set('maxPrice', String(filters.maxPrice));
        if (filters.bedrooms)
            params.set('bedrooms', filters.bedrooms);
        if (filters.propertyTypes.length > 0)
            params.set('propertyTypes', filters.propertyTypes.join(','));
        if (filters.status !== 'available')
            params.set('status', filters.status);
        if (searchQuery)
            params.set('search', searchQuery);
        setSearchParams(params, { replace: true });
    }, [filters, searchQuery]);
    const fetchProperties = async () => {
        try {
            setLoading(true);
            let query = supabase
                .from('properties')
                .select('*, property_images(*)', { count: 'exact' });
            // Apply status filter - only show available properties by default
            if (filters.status === 'available') {
                query = query.eq('status', 'available');
            }
            else if (filters.status === 'all') {
                // Show all statuses except unavailable (for browsing)
                query = query.neq('status', 'unavailable');
            }
            // Apply location filter
            if (filters.location) {
                query = query.ilike('location', `%${filters.location}%`);
            }
            // Apply price filters
            if (filters.minPrice) {
                query = query.gte('price', filters.minPrice);
            }
            if (filters.maxPrice) {
                query = query.lte('price', filters.maxPrice);
            }
            // Apply bedrooms filter
            if (filters.bedrooms) {
                if (filters.bedrooms === '5+') {
                    query = query.gte('bedrooms', 5);
                }
                else {
                    query = query.eq('bedrooms', Number(filters.bedrooms));
                }
            }
            // Apply property type filter
            if (filters.propertyTypes.length > 0) {
                query = query.in('property_type', filters.propertyTypes);
            }
            // Apply search query
            if (searchQuery) {
                query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`);
            }
            // Apply sorting
            if (sortBy === 'price_asc') {
                query = query.order('price', { ascending: true });
            }
            else if (sortBy === 'price_desc') {
                query = query.order('price', { ascending: false });
            }
            else {
                query = query.order('created_at', { ascending: false });
            }
            // Apply pagination
            const from = (page - 1) * itemsPerPage;
            const to = from + itemsPerPage - 1;
            query = query.range(from, to);
            const { data, error, count } = await query;
            if (error) {
                console.error('Supabase query error:', error);
                throw error;
            }
            console.log('Fetched properties:', data?.length || 0, 'Total count:', count);
            setProperties(data || []);
            setTotalCount(count || 0);
        }
        catch (error) {
            console.error('Error fetching properties:', error);
            console.error('Error details:', {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint
            });
            setProperties([]);
            setTotalCount(0);
        }
        finally {
            setLoading(false);
        }
    };
    const handleFiltersChange = (newFilters) => {
        setFilters(newFilters);
        setPage(1); // Reset to first page when filters change
    };
    const handleResetFilters = () => {
        const resetFilters = {
            location: '',
            minPrice: '',
            maxPrice: '',
            bedrooms: '',
            propertyTypes: [],
            status: 'available',
        };
        setFilters(resetFilters);
        setPage(1);
    };
    const handleLoadMore = () => {
        if ((page * itemsPerPage) < totalCount) {
            setPage(prev => prev + 1);
        }
    };
    const hasMore = (page * itemsPerPage) < totalCount;
    // Convert Property to format expected by PropertyGrid
    const convertedProperties = properties.map(prop => ({
        id: prop.id,
        title: prop.title,
        location: prop.location,
        price: prop.price,
        viewing_fee: prop.viewing_fee,
        bedrooms: prop.bedrooms,
        bathrooms: prop.bathrooms,
        property_type: prop.property_type,
        status: prop.status,
        images: prop.property_images?.map(img => img.image_url) || [],
        description: prop.description,
        amenities: prop.amenities || [],
        view_count: prop.view_count || 0,
        save_count: prop.save_count || 0,
        created_at: prop.created_at,
    }));
    return (_jsxs("div", { className: "min-h-screen bg-background py-6 md:py-8", children: [_jsxs("div", { className: "container-custom", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "text-3xl font-bold text-text mb-2", children: "Browse Properties" }), searchQuery && (_jsxs("p", { className: "text-text-light", children: ["Search results for: ", _jsxs("span", { className: "font-semibold text-text", children: ["\"", searchQuery, "\""] })] }))] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-4 gap-6", children: [_jsx("div", { className: "hidden lg:block", children: _jsx(PropertyFilters, { filters: filters, onFiltersChange: handleFiltersChange, onReset: handleResetFilters }) }), _jsxs("div", { className: "lg:col-span-3", children: [_jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6", children: [_jsxs("button", { onClick: () => setMobileFiltersOpen(true), className: "lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors", children: [_jsx(SlidersHorizontal, { size: 18 }), _jsx("span", { children: "Filters" })] }), _jsxs("div", { className: "flex-1 flex items-center justify-between gap-4", children: [_jsxs("p", { className: "text-text-light", children: ["Showing ", _jsx("span", { className: "font-semibold text-text", children: properties.length }), " of", ' ', _jsx("span", { className: "font-semibold text-text", children: totalCount }), " properties"] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("label", { className: "text-sm text-text-light", children: "Sort by:" }), _jsxs("select", { value: sortBy, onChange: (e) => {
                                                                    setSortBy(e.target.value);
                                                                    setPage(1);
                                                                }, className: "rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2 text-sm", children: [_jsx("option", { value: "newest", children: "Newest First" }), _jsx("option", { value: "price_asc", children: "Price: Low to High" }), _jsx("option", { value: "price_desc", children: "Price: High to Low" })] })] })] })] }), loading && properties.length === 0 ? (_jsx("div", { className: "flex items-center justify-center py-20", children: _jsx(Loader2, { size: 48, className: "animate-spin text-primary" }) })) : (_jsxs(_Fragment, { children: [_jsx(PropertyGrid, { properties: convertedProperties, loading: loading && properties.length > 0, emptyMessage: searchQuery
                                                    ? `No properties found matching "${searchQuery}"`
                                                    : 'No properties found. Try adjusting your filters.' }), hasMore && !loading && (_jsx("div", { className: "mt-8 text-center", children: _jsx(Button, { variant: "outline", onClick: handleLoadMore, disabled: loading, children: loading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { size: 18, className: "mr-2 animate-spin" }), "Loading..."] })) : (`Load More (${totalCount - (page * itemsPerPage)} remaining)`) }) }))] }))] })] })] }), _jsx(AnimatePresence, { children: mobileFiltersOpen && (_jsxs(_Fragment, { children: [_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, onClick: () => setMobileFiltersOpen(false), className: "fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" }), _jsx(motion.div, { initial: { x: '-100%' }, animate: { x: 0 }, exit: { x: '-100%' }, transition: { type: 'tween', ease: 'easeOut', duration: 0.3 }, className: "fixed left-0 top-0 bottom-0 w-80 bg-surface shadow-xl z-50 lg:hidden overflow-y-auto", children: _jsx("div", { className: "p-4", children: _jsx(PropertyFilters, { filters: filters, onFiltersChange: handleFiltersChange, onReset: handleResetFilters, isMobile: true, onClose: () => setMobileFiltersOpen(false) }) }) })] })) })] }));
};
export default BrowsePage;
