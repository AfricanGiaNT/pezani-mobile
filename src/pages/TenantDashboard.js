import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Bookmark, Eye, CheckCircle2, Search, Building2, Loader2, Calendar, X, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Button, Modal } from '@components/common';
import PropertyCard from '@components/property/PropertyCard';
import { supabase } from '@lib/supabase';
import { useAuth } from '@contexts/AuthContext';
import { formatDate, formatDateTime, formatPhone } from '@utils/formatting';
const TenantDashboard = () => {
    const { user, profile, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [savedProperties, setSavedProperties] = useState([]);
    const [stats, setStats] = useState({
        savedCount: 0,
        pendingViewings: 0,
        completedViewings: 0,
    });
    const [viewingRequests, setViewingRequests] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const [loadingRequests, setLoadingRequests] = useState(false);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [requestToCancel, setRequestToCancel] = useState(null);
    const [isCancelling, setIsCancelling] = useState(false);
    // Limit saved properties preview on dashboard
    const SAVED_PROPERTIES_PREVIEW_LIMIT = 4;
    // Redirect if not tenant
    useEffect(() => {
        if (profile && profile.role !== 'tenant') {
            navigate('/dashboard');
        }
    }, [profile, navigate]);
    // Fetch saved properties and stats
    useEffect(() => {
        if (authLoading) {
            // Wait for auth to finish loading
            setLoading(true);
            return;
        }
        if (user && profile?.role === 'tenant') {
            fetchSavedProperties();
            fetchStats();
            fetchViewingRequests();
        }
        else if (user && !profile) {
            // User exists but profile not loaded yet - wait
            setLoading(true);
        }
        else if (user && profile && profile.role !== 'tenant') {
            // User exists but is not a tenant - will redirect, stop loading
            setLoading(false);
        }
        else if (!user) {
            // No user - not loading data
            setLoading(false);
        }
    }, [user, profile, authLoading]);
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
    const fetchStats = async () => {
        if (!user)
            return;
        try {
            // Count saved properties
            const { count: savedCount } = await supabase
                .from('saved_properties')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);
            // Count viewing requests
            const { count: pendingCount } = await supabase
                .from('viewing_requests')
                .select('*', { count: 'exact', head: true })
                .eq('tenant_id', user.id)
                .in('status', ['pending', 'scheduled']);
            const { count: completedCount } = await supabase
                .from('viewing_requests')
                .select('*', { count: 'exact', head: true })
                .eq('tenant_id', user.id)
                .eq('status', 'completed');
            setStats({
                savedCount: savedCount || 0,
                pendingViewings: pendingCount || 0,
                completedViewings: completedCount || 0,
            });
        }
        catch (error) {
            console.error('Error fetching stats:', error);
        }
    };
    const fetchViewingRequests = async () => {
        if (!user)
            return;
        try {
            setLoadingRequests(true);
            const { data, error } = await supabase
                .from('viewing_requests')
                .select(`
          id,
          property_id,
          landlord_id,
          status,
          preferred_dates,
          scheduled_date,
          tenant_confirmed,
          landlord_confirmed,
          notes,
          created_at,
          updated_at,
          properties (
            id,
            title,
            location,
            viewing_fee,
            property_images (
              image_url,
              is_primary,
              display_order
            )
          ),
          landlord:profiles!landlord_id (
            id,
            full_name,
            email,
            phone
          ),
          transactions (
            id,
            payment_status,
            escrow_status,
            amount
          )
        `)
                .eq('tenant_id', user.id)
                .order('created_at', { ascending: false });
            if (error)
                throw error;
            setViewingRequests(data || []);
        }
        catch (error) {
            console.error('Error fetching viewing requests:', error);
            toast.error('Failed to load viewing requests');
        }
        finally {
            setLoadingRequests(false);
        }
    };
    const handleCancelClick = (requestId) => {
        setRequestToCancel(requestId);
        setCancelModalOpen(true);
    };
    const handleCancelConfirm = async () => {
        if (!user || !requestToCancel)
            return;
        setIsCancelling(true);
        try {
            const { error } = await supabase
                .from('viewing_requests')
                .update({ status: 'cancelled' })
                .eq('id', requestToCancel)
                .eq('tenant_id', user.id);
            if (error)
                throw error;
            toast.success('Viewing request cancelled');
            await fetchViewingRequests();
            await fetchStats();
            setCancelModalOpen(false);
            setRequestToCancel(null);
        }
        catch (error) {
            console.error('Error cancelling viewing request:', error);
            toast.error('Failed to cancel viewing request');
        }
        finally {
            setIsCancelling(false);
        }
    };
    const handleConfirmViewing = async (requestId) => {
        if (!user)
            return;
        try {
            // Update tenant confirmation
            const { data: updatedRequest, error: updateError } = await supabase
                .from('viewing_requests')
                .update({ tenant_confirmed: true })
                .eq('id', requestId)
                .eq('tenant_id', user.id)
                .select('landlord_confirmed')
                .single();
            if (updateError)
                throw updateError;
            // If both parties have confirmed, release payment
            if (updatedRequest?.landlord_confirmed) {
                const { error: releaseError } = await supabase.functions.invoke('release-payment', {
                    body: { viewing_request_id: requestId }
                });
                if (releaseError) {
                    console.error('Error releasing payment:', releaseError);
                    // Don't fail the confirmation if release fails - can be retried
                    toast.success('Viewing confirmed. Payment release may take a moment.');
                }
                else {
                    toast.success('Viewing confirmed! Payment has been released.');
                }
            }
            else {
                toast.success('Viewing confirmed. Waiting for landlord confirmation.');
            }
            await fetchViewingRequests();
            await fetchStats();
        }
        catch (error) {
            console.error('Error confirming viewing:', error);
            toast.error('Failed to confirm viewing');
        }
    };
    const getFilteredRequests = () => {
        if (activeTab === 'all')
            return viewingRequests;
        if (activeTab === 'pending')
            return viewingRequests.filter(r => r.status === 'pending');
        if (activeTab === 'scheduled')
            return viewingRequests.filter(r => r.status === 'scheduled');
        if (activeTab === 'completed')
            return viewingRequests.filter(r => r.status === 'completed');
        return viewingRequests;
    };
    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
            scheduled: { color: 'bg-blue-100 text-blue-800', label: 'Scheduled' },
            confirmed: { color: 'bg-green-100 text-green-800', label: 'Confirmed' },
            completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
            cancelled: { color: 'bg-gray-100 text-gray-800', label: 'Cancelled' },
            rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
        };
        const config = statusConfig[status] || statusConfig.pending;
        return (_jsx("span", { className: `px-2 py-1 rounded text-xs font-medium ${config.color}`, children: config.label }));
    };
    const getPrimaryImage = (property) => {
        if (!property?.property_images)
            return '';
        const primaryImage = property.property_images.find((img) => img.is_primary);
        return primaryImage?.image_url || property.property_images[0]?.image_url || '';
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
            // Update stats
            setStats((prev) => ({
                ...prev,
                savedCount: prev.savedCount - 1,
            }));
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
    // Show loading if auth is still loading or if we're waiting for profile
    if (authLoading || (user && !profile)) {
        return (_jsx("div", { className: "container mx-auto px-4 py-8", children: _jsx("div", { className: "flex items-center justify-center py-12", children: _jsx(Loader2, { size: 32, className: "animate-spin text-primary" }) }) }));
    }
    // Redirect if user exists but is not a tenant
    if (user && profile?.role !== 'tenant') {
        return (_jsx("div", { className: "container mx-auto px-4 py-8", children: _jsx("div", { className: "text-center", children: "Loading..." }) }));
    }
    return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsx("h1", { className: "text-3xl font-bold text-text mb-6", children: "Dashboard" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8", children: [_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "bg-surface rounded-lg shadow-md p-6 border border-gray-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-text-light text-sm mb-1", children: "Saved Properties" }), _jsx("p", { className: "text-3xl font-bold text-text", children: stats.savedCount })] }), _jsx("div", { className: "w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center", children: _jsx(Bookmark, { size: 24, className: "text-primary" }) })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 }, className: "bg-surface rounded-lg shadow-md p-6 border border-gray-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-text-light text-sm mb-1", children: "Pending Viewings" }), _jsx("p", { className: "text-3xl font-bold text-text", children: stats.pendingViewings })] }), _jsx("div", { className: "w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center", children: _jsx(Eye, { size: 24, className: "text-accent" }) })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 }, className: "bg-surface rounded-lg shadow-md p-6 border border-gray-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-text-light text-sm mb-1", children: "Completed" }), _jsx("p", { className: "text-3xl font-bold text-text", children: stats.completedViewings })] }), _jsx("div", { className: "w-12 h-12 bg-green-100 rounded-full flex items-center justify-center", children: _jsx(CheckCircle2, { size: 24, className: "text-green-600" }) })] }) })] }), _jsxs("div", { className: "mb-8 flex flex-wrap gap-3", children: [_jsx(Button, { variant: "outline", onClick: () => navigate('/browse'), leftIcon: _jsx(Search, { size: 18 }), children: "Browse Properties" }), _jsx(Button, { variant: "outline", onClick: () => navigate('/browse'), leftIcon: _jsx(Building2, { size: 18 }), children: "Search" })] }), _jsxs("div", { className: "mb-8", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-2xl font-semibold text-text", children: "Saved Properties" }), convertedProperties.length > SAVED_PROPERTIES_PREVIEW_LIMIT && (_jsxs(Button, { variant: "ghost", size: "sm", onClick: () => navigate('/saved-properties'), className: "text-primary", children: ["View All (", convertedProperties.length, ")"] }))] }), loading ? (_jsx("div", { className: "flex items-center justify-center py-12", children: _jsx(Loader2, { size: 32, className: "animate-spin text-primary" }) })) : convertedProperties.length === 0 ? (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "bg-surface rounded-lg shadow-md p-12 text-center border border-gray-200", children: [_jsx("div", { className: "w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center", children: _jsx(Bookmark, { size: 48, className: "text-text-light" }) }), _jsx("h3", { className: "text-xl font-semibold text-text mb-2", children: "No saved properties yet" }), _jsx("p", { className: "text-text-light mb-6", children: "Start browsing to save properties you like!" }), _jsx(Button, { onClick: () => navigate('/browse'), leftIcon: _jsx(Search, { size: 18 }), children: "Browse Properties" })] })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6", children: convertedProperties.slice(0, SAVED_PROPERTIES_PREVIEW_LIMIT).map((property) => (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "relative", children: [_jsx(PropertyCard, { property: property, onSave: handleUnsave }), property.status === 'unavailable' && (_jsx("div", { className: "absolute top-2 left-2 z-20 bg-error text-white px-2 py-1 rounded text-xs font-medium", children: "Unavailable" }))] }, property.id))) }), convertedProperties.length > SAVED_PROPERTIES_PREVIEW_LIMIT && (_jsx("div", { className: "mt-6 text-center", children: _jsxs(Button, { variant: "outline", onClick: () => navigate('/saved-properties'), leftIcon: _jsx(Bookmark, { size: 18 }), children: ["View All ", convertedProperties.length, " Saved Properties"] }) }))] }))] }), _jsxs("div", { className: "mb-8", children: [_jsx("h2", { className: "text-2xl font-semibold text-text mb-4", children: "Viewing Requests" }), _jsxs("div", { className: "flex flex-wrap gap-2 mb-4 border-b border-gray-200", children: [_jsxs("button", { onClick: () => setActiveTab('all'), className: `px-4 py-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'all'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-text-light hover:text-text'}`, children: ["All (", viewingRequests.length, ")"] }), _jsxs("button", { onClick: () => setActiveTab('pending'), className: `px-4 py-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'pending'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-text-light hover:text-text'}`, children: ["Pending (", viewingRequests.filter(r => r.status === 'pending').length, ")"] }), _jsxs("button", { onClick: () => setActiveTab('scheduled'), className: `px-4 py-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'scheduled'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-text-light hover:text-text'}`, children: ["Scheduled (", viewingRequests.filter(r => r.status === 'scheduled').length, ")"] }), _jsxs("button", { onClick: () => setActiveTab('completed'), className: `px-4 py-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'completed'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-text-light hover:text-text'}`, children: ["Completed (", viewingRequests.filter(r => r.status === 'completed').length, ")"] })] }), loadingRequests ? (_jsx("div", { className: "flex items-center justify-center py-12", children: _jsx(Loader2, { size: 32, className: "animate-spin text-primary" }) })) : getFilteredRequests().length === 0 ? (_jsxs("div", { className: "bg-surface rounded-lg shadow-md p-12 text-center border border-gray-200", children: [_jsx("div", { className: "w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center", children: _jsx(Eye, { size: 48, className: "text-text-light" }) }), _jsxs("h3", { className: "text-xl font-semibold text-text mb-2", children: ["No viewing requests ", activeTab !== 'all' ? `(${activeTab})` : ''] }), _jsx("p", { className: "text-text-light", children: activeTab === 'all'
                                    ? "You haven't made any viewing requests yet. Browse properties to request a viewing!"
                                    : `You don't have any ${activeTab} viewing requests.` })] })) : (_jsx("div", { className: "space-y-4", children: getFilteredRequests().map((request) => (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "bg-surface rounded-lg shadow-md border border-gray-200 overflow-hidden", children: _jsx("div", { className: "p-6", children: _jsxs("div", { className: "flex flex-col md:flex-row gap-4", children: [_jsx("div", { className: "w-full md:w-48 h-48 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0", children: getPrimaryImage(request.properties) ? (_jsx("img", { src: getPrimaryImage(request.properties), alt: request.properties?.title || 'Property', className: "w-full h-full object-cover" })) : (_jsx("div", { className: "w-full h-full flex items-center justify-center", children: _jsx(Building2, { size: 48, className: "text-gray-400" }) })) }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-xl font-semibold text-text mb-1", children: request.properties?.title || 'Property' }), _jsxs("div", { className: "flex items-center gap-2 text-text-light text-sm mb-2", children: [_jsx(MapPin, { size: 16 }), _jsx("span", { children: request.properties?.location || 'Location not specified' })] })] }), getStatusBadge(request.status)] }), request.transactions?.[0] && (_jsx("div", { className: "mb-3", children: _jsxs("span", { className: "text-sm text-text-light", children: ["Payment: ", _jsx("span", { className: `font-medium ${request.transactions[0].payment_status === 'completed'
                                                                    ? 'text-green-600'
                                                                    : 'text-yellow-600'}`, children: request.transactions[0].payment_status }), request.transactions[0].payment_status === 'completed' && (_jsxs("span", { className: "text-text-light ml-2", children: ["(MWK ", request.transactions[0].amount?.toLocaleString(), ")"] }))] }) })), request.scheduled_date ? (_jsxs("div", { className: "mb-3 flex items-center gap-2 text-sm text-text", children: [_jsx(Calendar, { size: 16, className: "text-primary" }), _jsx("span", { className: "font-medium", children: "Scheduled:" }), _jsx("span", { children: formatDateTime(request.scheduled_date) })] })) : request.preferred_dates && request.preferred_dates.length > 0 ? (_jsxs("div", { className: "mb-3", children: [_jsx("p", { className: "text-sm font-medium text-text mb-1", children: "Preferred Dates:" }), _jsx("ul", { className: "text-sm text-text-light space-y-1", children: request.preferred_dates.map((date, idx) => (_jsxs("li", { className: "flex items-center gap-2", children: [_jsx(Clock, { size: 14 }), formatDate(date)] }, idx))) })] })) : null, request.landlord && (_jsxs("div", { className: "mb-4 p-3 bg-gray-50 rounded-lg", children: [_jsx("p", { className: "text-sm font-medium text-text mb-2", children: "Landlord Contact:" }), _jsxs("div", { className: "space-y-1 text-sm text-text-light", children: [_jsx("p", { className: "font-medium text-text", children: request.landlord.full_name || 'Not provided' }), request.landlord.email && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Mail, { size: 14 }), _jsx("a", { href: `mailto:${request.landlord.email}`, className: "hover:text-primary", children: request.landlord.email })] })), request.landlord.phone && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Phone, { size: 14 }), _jsx("a", { href: `tel:${request.landlord.phone}`, className: "hover:text-primary", children: formatPhone(request.landlord.phone) })] }))] })] })), request.status === 'scheduled' && (_jsxs("div", { className: "mb-3 p-3 bg-gray-50 rounded-lg", children: [_jsx("p", { className: "text-sm font-medium text-text mb-2", children: "Confirmation Status:" }), _jsxs("div", { className: "flex items-center gap-4 text-sm", children: [_jsxs("div", { className: "flex items-center gap-2", children: [request.tenant_confirmed ? (_jsx(CheckCircle2, { size: 16, className: "text-green-600" })) : (_jsx(Clock, { size: 16, className: "text-yellow-600" })), _jsxs("span", { className: request.tenant_confirmed ? 'text-green-600 font-medium' : 'text-text-light', children: ["You: ", request.tenant_confirmed ? 'Confirmed' : 'Not confirmed'] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [request.landlord_confirmed ? (_jsx(CheckCircle2, { size: 16, className: "text-green-600" })) : (_jsx(Clock, { size: 16, className: "text-yellow-600" })), _jsxs("span", { className: request.landlord_confirmed ? 'text-green-600 font-medium' : 'text-text-light', children: ["Landlord: ", request.landlord_confirmed ? 'Confirmed' : 'Waiting'] })] })] }), request.tenant_confirmed && request.landlord_confirmed && (_jsx("p", { className: "text-xs text-green-600 mt-2", children: "\u2713 Both parties confirmed - Payment released" }))] })), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Button, { size: "sm", variant: "outline", onClick: () => navigate(`/properties/${request.properties?.id}`), children: "View Property" }), request.status === 'scheduled' && !request.tenant_confirmed && (_jsx(Button, { size: "sm", variant: "primary", onClick: () => handleConfirmViewing(request.id), leftIcon: _jsx(CheckCircle2, { size: 16 }), children: "Confirm Viewing Completed" })), request.status === 'scheduled' && request.tenant_confirmed && !request.landlord_confirmed && (_jsxs("div", { className: "text-sm text-text-light flex items-center gap-2", children: [_jsx(Clock, { size: 16 }), _jsx("span", { children: "Waiting for landlord confirmation" })] })), ['pending', 'scheduled'].includes(request.status) && !request.tenant_confirmed && (_jsx(Button, { size: "sm", variant: "danger", onClick: () => handleCancelClick(request.id), leftIcon: _jsx(X, { size: 16 }), children: "Cancel" }))] })] })] }) }) }, request.id))) }))] }), _jsx(Modal, { isOpen: cancelModalOpen, onClose: () => {
                    setCancelModalOpen(false);
                    setRequestToCancel(null);
                }, title: "Cancel Viewing Request", size: "md", children: _jsxs("div", { className: "space-y-4", children: [_jsx("p", { className: "text-text", children: "Are you sure you want to cancel this viewing request? This action cannot be undone." }), _jsx("p", { className: "text-sm text-text-light", children: "If payment was already made, please contact support for refund information." }), _jsxs("div", { className: "flex gap-3 justify-end pt-4", children: [_jsx(Button, { variant: "ghost", onClick: () => {
                                        setCancelModalOpen(false);
                                        setRequestToCancel(null);
                                    }, disabled: isCancelling, children: "Keep Request" }), _jsx(Button, { variant: "danger", onClick: handleCancelConfirm, disabled: isCancelling, isLoading: isCancelling, leftIcon: _jsx(X, { size: 18 }), children: isCancelling ? 'Cancelling...' : 'Cancel Request' })] })] }) })] }));
};
export default TenantDashboard;
