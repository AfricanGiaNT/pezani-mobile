import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Home, Eye, Heart, Calendar, Plus, Edit, Trash2, ToggleLeft, ToggleRight, Grid3x3, List, Loader2, MapPin, Phone, Mail, Clock, CheckCircle2, X, DollarSign } from 'lucide-react';
import { Button, Modal, Input } from '@components/common';
import { supabase } from '@lib/supabase';
import { useAuth } from '@contexts/AuthContext';
import { formatPrice, formatDate, formatDateTime, formatPhone } from '@utils/formatting';
const LandlordDashboard = () => {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [properties, setProperties] = useState([]);
    const [viewMode, setViewMode] = useState('grid');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [propertyToDelete, setPropertyToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [stats, setStats] = useState({
        totalProperties: 0,
        totalViews: 0,
        totalSaves: 0,
        totalViewingRequests: 0,
    });
    const [viewingRequests, setViewingRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(false);
    const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
    const [requestToSchedule, setRequestToSchedule] = useState(null);
    const [scheduledDate, setScheduledDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [isScheduling, setIsScheduling] = useState(false);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [requestToCancel, setRequestToCancel] = useState(null);
    const [isCancelling, setIsCancelling] = useState(false);
    // Redirect if not landlord or agent, or if agent is pending
    useEffect(() => {
        if (profile) {
            if (profile.role !== 'landlord' && profile.role !== 'agent') {
                navigate('/dashboard');
            }
            else if (profile.role === 'agent' && profile.status === 'pending') {
                navigate('/agent-pending');
            }
        }
    }, [profile, navigate]);
    // Fetch properties and stats
    useEffect(() => {
        if (user && (profile?.role === 'landlord' || profile?.role === 'agent')) {
            fetchProperties();
            fetchStats();
            fetchViewingRequests();
        }
    }, [user, profile]);
    const fetchProperties = async () => {
        if (!user)
            return;
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('properties')
                .select(`
          *,
          property_images (
            image_url,
            is_primary,
            display_order
          )
        `)
                .eq('owner_id', user.id)
                .order('created_at', { ascending: false });
            if (error)
                throw error;
            setProperties((data || []));
        }
        catch (error) {
            console.error('Error fetching properties:', error);
            toast.error('Failed to load properties');
        }
        finally {
            setLoading(false);
        }
    };
    const fetchStats = async () => {
        if (!user)
            return;
        try {
            // Total properties
            const { count: totalProperties } = await supabase
                .from('properties')
                .select('*', { count: 'exact', head: true })
                .eq('owner_id', user.id);
            // Total views (sum of all property view_counts)
            const { data: viewData } = await supabase
                .from('properties')
                .select('view_count')
                .eq('owner_id', user.id);
            const totalViews = (viewData || []).reduce((sum, p) => sum + (p.view_count || 0), 0);
            // Total saves (count saved_properties for this landlord's properties)
            // First get all property IDs owned by this user
            const { data: ownedProperties } = await supabase
                .from('properties')
                .select('id')
                .eq('owner_id', user.id);
            const propertyIds = (ownedProperties || []).map((p) => p.id);
            // Then count saved_properties for those properties
            let totalSaves = 0;
            if (propertyIds.length > 0) {
                const { count } = await supabase
                    .from('saved_properties')
                    .select('*', { count: 'exact', head: true })
                    .in('property_id', propertyIds);
                totalSaves = count || 0;
            }
            // Total viewing requests
            const { count: totalViewingRequests } = await supabase
                .from('viewing_requests')
                .select('*', { count: 'exact', head: true })
                .eq('landlord_id', user.id)
                .in('status', ['pending', 'scheduled']);
            setStats({
                totalProperties: totalProperties || 0,
                totalViews,
                totalSaves,
                totalViewingRequests: totalViewingRequests || 0,
            });
        }
        catch (error) {
            console.error('Error fetching stats:', error);
        }
    };
    const handleToggleStatus = async (propertyId, currentStatus) => {
        if (!user)
            return;
        try {
            const newStatus = currentStatus === 'available' ? 'unavailable' : 'available';
            const { error } = await supabase
                .from('properties')
                .update({ status: newStatus })
                .eq('id', propertyId)
                .eq('owner_id', user.id);
            if (error)
                throw error;
            // Update local state
            setProperties((prev) => prev.map((p) => (p.id === propertyId ? { ...p, status: newStatus } : p)));
            toast.success(`Property marked as ${newStatus}`);
        }
        catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update property status');
        }
    };
    const handleDeleteClick = (propertyId) => {
        setPropertyToDelete(propertyId);
        setDeleteModalOpen(true);
    };
    const handleDeleteConfirm = async () => {
        if (!user || !propertyToDelete)
            return;
        setIsDeleting(true);
        try {
            // 1. Get property images
            const { data: images } = await supabase
                .from('property_images')
                .select('image_url')
                .eq('property_id', propertyToDelete);
            // 2. Delete images from storage
            if (images && images.length > 0) {
                for (const img of images) {
                    try {
                        const fileName = img.image_url.split('/').pop();
                        if (fileName) {
                            await supabase.storage.from('property-images').remove([fileName]);
                        }
                    }
                    catch (storageError) {
                        console.warn('Error deleting image from storage:', storageError);
                        // Continue even if storage deletion fails
                    }
                }
            }
            // 3. Delete property (cascades to property_images, saved_properties)
            const { error } = await supabase
                .from('properties')
                .delete()
                .eq('id', propertyToDelete)
                .eq('owner_id', user.id);
            if (error)
                throw error;
            // Remove from local state
            setProperties((prev) => prev.filter((p) => p.id !== propertyToDelete));
            // Refresh stats
            await fetchStats();
            toast.success('Property deleted successfully');
            setDeleteModalOpen(false);
            setPropertyToDelete(null);
        }
        catch (error) {
            console.error('Error deleting property:', error);
            toast.error('Failed to delete property');
        }
        finally {
            setIsDeleting(false);
        }
    };
    const handleDeleteCancel = () => {
        setDeleteModalOpen(false);
        setPropertyToDelete(null);
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
          tenant_id,
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
          tenant:profiles!tenant_id (
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
                .eq('landlord_id', user.id)
                .in('status', ['pending', 'scheduled', 'confirmed', 'completed'])
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
    const handleScheduleClick = (request) => {
        setRequestToSchedule(request);
        setScheduledDate('');
        setScheduledTime('');
        setScheduleModalOpen(true);
    };
    const handleScheduleConfirm = async () => {
        if (!user || !requestToSchedule || !scheduledDate || !scheduledTime) {
            toast.error('Please select both date and time');
            return;
        }
        setIsScheduling(true);
        try {
            // Combine date and time
            const dateTime = new Date(`${scheduledDate}T${scheduledTime}`);
            const isoDateTime = dateTime.toISOString();
            const { error } = await supabase
                .from('viewing_requests')
                .update({
                status: 'scheduled',
                scheduled_date: isoDateTime,
            })
                .eq('id', requestToSchedule.id)
                .eq('landlord_id', user.id);
            if (error)
                throw error;
            toast.success('Viewing scheduled successfully');
            await fetchViewingRequests();
            await fetchStats();
            setScheduleModalOpen(false);
            setRequestToSchedule(null);
            setScheduledDate('');
            setScheduledTime('');
        }
        catch (error) {
            console.error('Error scheduling viewing:', error);
            toast.error('Failed to schedule viewing');
        }
        finally {
            setIsScheduling(false);
        }
    };
    const handleConfirmViewing = async (requestId) => {
        if (!user)
            return;
        try {
            // Update landlord confirmation
            const { data: updatedRequest, error: updateError } = await supabase
                .from('viewing_requests')
                .update({ landlord_confirmed: true })
                .eq('id', requestId)
                .eq('landlord_id', user.id)
                .select('tenant_confirmed')
                .single();
            if (updateError)
                throw updateError;
            // If both parties have confirmed, release payment
            if (updatedRequest?.tenant_confirmed) {
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
                toast.success('Viewing confirmed. Waiting for tenant confirmation.');
            }
            await fetchViewingRequests();
            await fetchStats();
        }
        catch (error) {
            console.error('Error confirming viewing:', error);
            toast.error('Failed to confirm viewing');
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
                .eq('landlord_id', user.id);
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
    const getMinDateTime = () => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };
    const getMinTime = () => {
        if (!scheduledDate)
            return '';
        const today = new Date().toISOString().split('T')[0];
        if (scheduledDate === today) {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            return `${hours}:${minutes}`;
        }
        return '';
    };
    const getPrimaryImage = (property) => {
        const primaryImage = property.property_images?.find((img) => img.is_primary);
        if (primaryImage)
            return primaryImage.image_url;
        return property.property_images?.[0]?.image_url || '';
    };
    if (!user || (profile?.role !== 'landlord' && profile?.role !== 'agent')) {
        return (_jsx("div", { className: "container mx-auto px-4 py-8", children: _jsx("div", { className: "text-center", children: "Loading..." }) }));
    }
    return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h1", { className: "text-3xl font-bold text-text", children: "Dashboard" }), _jsx(Button, { onClick: () => navigate('/properties/add'), leftIcon: _jsx(Plus, { size: 18 }), children: "Add Property" })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8", children: [_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "bg-surface rounded-lg shadow-md p-6 border border-gray-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-text-light text-sm mb-1", children: "Total Properties" }), _jsx("p", { className: "text-3xl font-bold text-text", children: stats.totalProperties })] }), _jsx("div", { className: "w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center", children: _jsx(Home, { size: 24, className: "text-primary" }) })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 }, className: "bg-surface rounded-lg shadow-md p-6 border border-gray-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-text-light text-sm mb-1", children: "Total Views" }), _jsx("p", { className: "text-3xl font-bold text-text", children: stats.totalViews })] }), _jsx("div", { className: "w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center", children: _jsx(Eye, { size: 24, className: "text-accent" }) })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 }, className: "bg-surface rounded-lg shadow-md p-6 border border-gray-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-text-light text-sm mb-1", children: "Total Saves" }), _jsx("p", { className: "text-3xl font-bold text-text", children: stats.totalSaves })] }), _jsx("div", { className: "w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center", children: _jsx(Heart, { size: 24, className: "text-pink-600" }) })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.3 }, className: "bg-surface rounded-lg shadow-md p-6 border border-gray-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-text-light text-sm mb-1", children: "Viewing Requests" }), _jsx("p", { className: "text-3xl font-bold text-text", children: stats.totalViewingRequests })] }), _jsx("div", { className: "w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center", children: _jsx(Calendar, { size: 24, className: "text-blue-600" }) })] }) })] }), _jsxs("div", { className: "mb-8", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-2xl font-semibold text-text", children: "My Listings" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: viewMode === 'grid' ? 'primary' : 'ghost', size: "sm", onClick: () => setViewMode('grid'), leftIcon: _jsx(Grid3x3, { size: 18 }), children: "Grid" }), _jsx(Button, { variant: viewMode === 'list' ? 'primary' : 'ghost', size: "sm", onClick: () => setViewMode('list'), leftIcon: _jsx(List, { size: 18 }), children: "List" })] })] }), loading ? (_jsx("div", { className: "flex items-center justify-center py-12", children: _jsx(Loader2, { size: 32, className: "animate-spin text-primary" }) })) : properties.length === 0 ? (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "bg-surface rounded-lg shadow-md p-12 text-center border border-gray-200", children: [_jsx("div", { className: "w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center", children: _jsx(Home, { size: 48, className: "text-text-light" }) }), _jsx("h3", { className: "text-xl font-semibold text-text mb-2", children: "No properties listed yet" }), _jsx("p", { className: "text-text-light mb-6", children: "Start by adding your first property listing" }), _jsx(Button, { onClick: () => navigate('/properties/add'), leftIcon: _jsx(Plus, { size: 18 }), children: "Add Property" })] })) : viewMode === 'grid' ? (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6", children: properties.map((property) => (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "bg-surface rounded-lg shadow-md overflow-hidden border border-gray-200", children: [_jsxs("div", { className: "relative h-48 bg-gray-200", children: [getPrimaryImage(property) ? (_jsx("img", { src: getPrimaryImage(property), alt: property.title, className: "w-full h-full object-cover" })) : (_jsx("div", { className: "w-full h-full flex items-center justify-center", children: _jsx(Home, { size: 48, className: "text-gray-400" }) })), _jsx("div", { className: "absolute top-2 right-2", children: _jsx("span", { className: `px-2 py-1 rounded text-xs font-medium ${property.status === 'available'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'}`, children: property.status === 'available' ? '● Available' : '● Unavailable' }) })] }), _jsxs("div", { className: "p-4", children: [_jsx("h3", { className: "font-semibold text-lg text-text mb-2 line-clamp-1", children: property.title }), _jsxs("p", { className: "text-primary font-bold text-xl mb-2", children: [formatPrice(property.price), "/month"] }), _jsx("p", { className: "text-text-light text-sm mb-3", children: property.location }), _jsxs("div", { className: "flex items-center gap-4 text-sm text-text-light mb-4", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Eye, { size: 16 }), _jsx("span", { children: property.view_count || 0 })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Heart, { size: 16 }), _jsx("span", { children: property.save_count || 0 })] })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Button, { size: "sm", variant: "outline", onClick: () => navigate(`/properties/edit/${property.id}`), leftIcon: _jsx(Edit, { size: 14 }), children: "Edit" }), _jsx(Button, { size: "sm", variant: "outline", onClick: () => handleToggleStatus(property.id, property.status), leftIcon: property.status === 'available' ? (_jsx(ToggleLeft, { size: 14 })) : (_jsx(ToggleRight, { size: 14 })), children: property.status === 'available' ? 'Mark Unavailable' : 'Mark Available' }), _jsx(Button, { size: "sm", variant: "danger", onClick: () => handleDeleteClick(property.id), leftIcon: _jsx(Trash2, { size: 14 }), children: "Delete" })] })] })] }, property.id))) })) : (_jsx("div", { className: "space-y-4", children: properties.map((property) => (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "bg-surface rounded-lg shadow-md p-4 border border-gray-200", children: _jsxs("div", { className: "flex flex-col md:flex-row gap-4", children: [_jsx("div", { className: "w-full md:w-48 h-48 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0", children: getPrimaryImage(property) ? (_jsx("img", { src: getPrimaryImage(property), alt: property.title, className: "w-full h-full object-cover" })) : (_jsx("div", { className: "w-full h-full flex items-center justify-center", children: _jsx(Home, { size: 48, className: "text-gray-400" }) })) }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-lg text-text mb-1", children: property.title }), _jsx("p", { className: "text-text-light text-sm mb-2", children: property.location }), _jsxs("p", { className: "text-primary font-bold text-xl mb-2", children: [formatPrice(property.price), "/month"] })] }), _jsx("span", { className: `px-2 py-1 rounded text-xs font-medium ${property.status === 'available'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-100 text-gray-800'}`, children: property.status === 'available' ? '● Available' : '● Unavailable' })] }), _jsxs("div", { className: "flex items-center gap-4 text-sm text-text-light mb-4", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Eye, { size: 16 }), _jsxs("span", { children: [property.view_count || 0, " views"] })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Heart, { size: 16 }), _jsxs("span", { children: [property.save_count || 0, " saves"] })] })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Button, { size: "sm", variant: "outline", onClick: () => navigate(`/properties/edit/${property.id}`), leftIcon: _jsx(Edit, { size: 14 }), children: "Edit" }), _jsx(Button, { size: "sm", variant: "outline", onClick: () => handleToggleStatus(property.id, property.status), leftIcon: property.status === 'available' ? (_jsx(ToggleLeft, { size: 14 })) : (_jsx(ToggleRight, { size: 14 })), children: property.status === 'available' ? 'Mark Unavailable' : 'Mark Available' }), _jsx(Button, { size: "sm", variant: "danger", onClick: () => handleDeleteClick(property.id), leftIcon: _jsx(Trash2, { size: 14 }), children: "Delete" })] })] })] }) }, property.id))) }))] }), _jsx(Modal, { isOpen: deleteModalOpen, onClose: handleDeleteCancel, title: "Delete Property", size: "md", children: _jsxs("div", { className: "space-y-4", children: [_jsx("p", { className: "text-text", children: "Are you sure you want to delete this property? This action cannot be undone." }), _jsx("p", { className: "text-sm text-text-light", children: "This will permanently delete the property and all associated images. Any saved properties will also be removed." }), _jsxs("div", { className: "flex gap-3 justify-end pt-4", children: [_jsx(Button, { variant: "ghost", onClick: handleDeleteCancel, disabled: isDeleting, children: "Cancel" }), _jsx(Button, { variant: "danger", onClick: handleDeleteConfirm, disabled: isDeleting, isLoading: isDeleting, leftIcon: _jsx(Trash2, { size: 18 }), children: isDeleting ? 'Deleting...' : 'Delete Property' })] })] }) }), _jsxs("div", { className: "mb-8", children: [_jsx("h2", { className: "text-2xl font-semibold text-text mb-4", children: "Incoming Viewing Requests" }), loadingRequests ? (_jsx("div", { className: "flex items-center justify-center py-12", children: _jsx(Loader2, { size: 32, className: "animate-spin text-primary" }) })) : viewingRequests.length === 0 ? (_jsxs("div", { className: "bg-surface rounded-lg shadow-md p-12 text-center border border-gray-200", children: [_jsx("div", { className: "w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center", children: _jsx(Calendar, { size: 48, className: "text-text-light" }) }), _jsx("h3", { className: "text-xl font-semibold text-text mb-2", children: "No viewing requests yet" }), _jsx("p", { className: "text-text-light", children: "You haven't received any viewing requests for your properties." })] })) : (_jsx("div", { className: "space-y-4", children: viewingRequests.map((request) => (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "bg-surface rounded-lg shadow-md border border-gray-200 overflow-hidden", children: _jsx("div", { className: "p-6", children: _jsxs("div", { className: "flex flex-col md:flex-row gap-4", children: [_jsx("div", { className: "w-full md:w-48 h-48 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0", children: getPrimaryImage(request.properties) ? (_jsx("img", { src: getPrimaryImage(request.properties), alt: request.properties?.title || 'Property', className: "w-full h-full object-cover" })) : (_jsx("div", { className: "w-full h-full flex items-center justify-center", children: _jsx(Home, { size: 48, className: "text-gray-400" }) })) }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-xl font-semibold text-text mb-1", children: request.properties?.title || 'Property' }), _jsxs("div", { className: "flex items-center gap-2 text-text-light text-sm mb-2", children: [_jsx(MapPin, { size: 16 }), _jsx("span", { children: request.properties?.location || 'Location not specified' })] })] }), getStatusBadge(request.status)] }), request.transactions?.[0] && (_jsxs("div", { className: "mb-3 flex items-center gap-2", children: [_jsx(DollarSign, { size: 16, className: "text-green-600" }), _jsxs("span", { className: "text-sm text-text-light", children: ["Payment: ", _jsx("span", { className: `font-medium ${request.transactions[0].payment_status === 'completed'
                                                                        ? 'text-green-600'
                                                                        : 'text-yellow-600'}`, children: request.transactions[0].payment_status }), request.transactions[0].payment_status === 'completed' && (_jsxs("span", { className: "text-text-light ml-2", children: ["(MWK ", request.transactions[0].amount?.toLocaleString(), ")"] }))] })] })), request.scheduled_date ? (_jsxs("div", { className: "mb-3 flex items-center gap-2 text-sm text-text", children: [_jsx(Calendar, { size: 16, className: "text-primary" }), _jsx("span", { className: "font-medium", children: "Scheduled:" }), _jsx("span", { children: formatDateTime(request.scheduled_date) })] })) : request.preferred_dates && request.preferred_dates.length > 0 ? (_jsxs("div", { className: "mb-3", children: [_jsx("p", { className: "text-sm font-medium text-text mb-1", children: "Tenant's Preferred Dates:" }), _jsx("ul", { className: "text-sm text-text-light space-y-1", children: request.preferred_dates.map((date, idx) => (_jsxs("li", { className: "flex items-center gap-2", children: [_jsx(Clock, { size: 14 }), formatDate(date)] }, idx))) })] })) : null, request.tenant && (_jsxs("div", { className: "mb-4 p-3 bg-gray-50 rounded-lg", children: [_jsx("p", { className: "text-sm font-medium text-text mb-2", children: "Tenant Contact:" }), _jsxs("div", { className: "space-y-1 text-sm text-text-light", children: [_jsx("p", { className: "font-medium text-text", children: request.tenant.full_name || 'Not provided' }), request.tenant.email && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Mail, { size: 14 }), _jsx("a", { href: `mailto:${request.tenant.email}`, className: "hover:text-primary", children: request.tenant.email })] })), request.tenant.phone && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Phone, { size: 14 }), _jsx("a", { href: `tel:${request.tenant.phone}`, className: "hover:text-primary", children: formatPhone(request.tenant.phone) })] }))] })] })), request.status === 'scheduled' && (_jsxs("div", { className: "mb-3 p-3 bg-gray-50 rounded-lg", children: [_jsx("p", { className: "text-sm font-medium text-text mb-2", children: "Confirmation Status:" }), _jsxs("div", { className: "flex items-center gap-4 text-sm", children: [_jsxs("div", { className: "flex items-center gap-2", children: [request.tenant_confirmed ? (_jsx(CheckCircle2, { size: 16, className: "text-green-600" })) : (_jsx(Clock, { size: 16, className: "text-yellow-600" })), _jsxs("span", { className: request.tenant_confirmed ? 'text-green-600 font-medium' : 'text-text-light', children: ["Tenant: ", request.tenant_confirmed ? 'Confirmed' : 'Waiting'] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [request.landlord_confirmed ? (_jsx(CheckCircle2, { size: 16, className: "text-green-600" })) : (_jsx(Clock, { size: 16, className: "text-yellow-600" })), _jsxs("span", { className: request.landlord_confirmed ? 'text-green-600 font-medium' : 'text-text-light', children: ["You: ", request.landlord_confirmed ? 'Confirmed' : 'Not confirmed'] })] })] }), request.tenant_confirmed && request.landlord_confirmed && (_jsx("p", { className: "text-xs text-green-600 mt-2", children: "\u2713 Both parties confirmed - Payment released" }))] })), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Button, { size: "sm", variant: "outline", onClick: () => navigate(`/properties/${request.properties?.id}`), children: "View Property" }), request.status === 'pending' && (_jsx(Button, { size: "sm", variant: "primary", onClick: () => handleScheduleClick(request), leftIcon: _jsx(Calendar, { size: 16 }), children: "Schedule" })), request.status === 'scheduled' && !request.landlord_confirmed && (_jsx(Button, { size: "sm", variant: "primary", onClick: () => handleConfirmViewing(request.id), leftIcon: _jsx(CheckCircle2, { size: 16 }), children: "Confirm Viewing Completed" })), request.status === 'scheduled' && request.landlord_confirmed && !request.tenant_confirmed && (_jsxs("div", { className: "text-sm text-text-light flex items-center gap-2", children: [_jsx(Clock, { size: 16 }), _jsx("span", { children: "Waiting for tenant confirmation" })] })), ['pending', 'scheduled'].includes(request.status) && !request.landlord_confirmed && (_jsx(Button, { size: "sm", variant: "danger", onClick: () => handleCancelClick(request.id), leftIcon: _jsx(X, { size: 16 }), children: "Cancel" }))] })] })] }) }) }, request.id))) }))] }), _jsx(Modal, { isOpen: scheduleModalOpen, onClose: () => {
                    setScheduleModalOpen(false);
                    setRequestToSchedule(null);
                    setScheduledDate('');
                    setScheduledTime('');
                }, title: "Schedule Viewing", size: "md", children: _jsxs("div", { className: "space-y-4", children: [requestToSchedule && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "bg-gray-50 rounded-lg p-4 mb-4", children: [_jsx("p", { className: "text-sm font-medium text-text mb-2", children: "Property:" }), _jsx("p", { className: "text-text", children: requestToSchedule.properties?.title }), _jsx("p", { className: "text-sm text-text-light", children: requestToSchedule.properties?.location })] }), requestToSchedule.preferred_dates && requestToSchedule.preferred_dates.length > 0 && (_jsxs("div", { className: "mb-4", children: [_jsx("p", { className: "text-sm font-medium text-text mb-2", children: "Tenant's Preferred Dates:" }), _jsx("ul", { className: "text-sm text-text-light space-y-1", children: requestToSchedule.preferred_dates.map((date, idx) => (_jsxs("li", { className: "flex items-center gap-2", children: [_jsx(Clock, { size: 14 }), formatDate(date)] }, idx))) })] }))] })), _jsx("div", { children: _jsx(Input, { type: "date", label: "Select Date", value: scheduledDate, onChange: (e) => setScheduledDate(e.target.value), min: getMinDateTime(), leftIcon: _jsx(Calendar, { size: 18 }), required: true }) }), _jsx("div", { children: _jsx(Input, { type: "time", label: "Select Time", value: scheduledTime, onChange: (e) => setScheduledTime(e.target.value), min: scheduledDate === new Date().toISOString().split('T')[0] ? getMinTime() : undefined, leftIcon: _jsx(Clock, { size: 18 }), required: true }) }), _jsxs("div", { className: "flex gap-3 justify-end pt-4", children: [_jsx(Button, { variant: "ghost", onClick: () => {
                                        setScheduleModalOpen(false);
                                        setRequestToSchedule(null);
                                        setScheduledDate('');
                                        setScheduledTime('');
                                    }, disabled: isScheduling, children: "Cancel" }), _jsx(Button, { variant: "primary", onClick: handleScheduleConfirm, disabled: isScheduling || !scheduledDate || !scheduledTime, isLoading: isScheduling, leftIcon: _jsx(Calendar, { size: 18 }), children: isScheduling ? 'Scheduling...' : 'Schedule Viewing' })] })] }) }), _jsx(Modal, { isOpen: cancelModalOpen, onClose: () => {
                    setCancelModalOpen(false);
                    setRequestToCancel(null);
                }, title: "Cancel Viewing Request", size: "md", children: _jsxs("div", { className: "space-y-4", children: [_jsx("p", { className: "text-text", children: "Are you sure you want to cancel this viewing request? This action cannot be undone." }), _jsx("p", { className: "text-sm text-text-light", children: "The tenant will be notified and may be eligible for a refund depending on payment status." }), _jsxs("div", { className: "flex gap-3 justify-end pt-4", children: [_jsx(Button, { variant: "ghost", onClick: () => {
                                        setCancelModalOpen(false);
                                        setRequestToCancel(null);
                                    }, disabled: isCancelling, children: "Keep Request" }), _jsx(Button, { variant: "danger", onClick: handleCancelConfirm, disabled: isCancelling, isLoading: isCancelling, leftIcon: _jsx(X, { size: 18 }), children: isCancelling ? 'Cancelling...' : 'Cancel Request' })] })] }) })] }));
};
export default LandlordDashboard;
