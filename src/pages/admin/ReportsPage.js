import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FileText, EyeOff, X, CheckCircle2, Clock, Loader2, ExternalLink, } from 'lucide-react';
import { Button } from '@components/common';
import { supabase } from '@lib/supabase';
import { useAuth } from '@contexts/AuthContext';
import { formatDate } from '@utils/formatting';
const reportReasonLabels = {
    fake_listing: 'Fake Listing',
    wrong_information: 'Wrong Information',
    scam_fraud: 'Scam/Fraud',
    inappropriate_content: 'Inappropriate Content',
    unavailable_property: 'Property Not Available',
    other: 'Other',
};
const ReportsPage = () => {
    const { profile } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [reports, setReports] = useState([]);
    const [filter, setFilter] = useState('pending');
    const [actionLoading, setActionLoading] = useState(null);
    // Check admin authorization
    useEffect(() => {
        if (profile && profile.role !== 'admin') {
            toast.error('Access denied. Admin only.');
            navigate('/dashboard');
        }
    }, [profile, navigate]);
    // Fetch reports
    useEffect(() => {
        if (profile?.role !== 'admin')
            return;
        const fetchReports = async () => {
            try {
                setLoading(true);
                let query = supabase
                    .from('reports')
                    .select(`
            *,
            reporter:profiles!reporter_id (full_name, email),
            property:properties!reported_property_id (id, title, location),
            reported_user:profiles!reported_user_id (full_name, email)
          `)
                    .order('created_at', { ascending: false });
                // Apply filter
                if (filter !== 'all') {
                    query = query.eq('status', filter);
                }
                const { data, error } = await query;
                if (error)
                    throw error;
                setReports(data || []);
            }
            catch (error) {
                console.error('Error fetching reports:', error);
                toast.error('Failed to load reports');
            }
            finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, [filter, profile]);
    const handleHideListing = async (reportId, propertyId) => {
        if (!propertyId) {
            toast.error('Property ID not found');
            return;
        }
        setActionLoading(reportId);
        try {
            // 1. Hide property by setting status to unavailable
            const { error: propertyError } = await supabase
                .from('properties')
                .update({ status: 'unavailable' })
                .eq('id', propertyId);
            if (propertyError)
                throw propertyError;
            // 2. Resolve report
            const { error: reportError } = await supabase
                .from('reports')
                .update({ status: 'resolved' })
                .eq('id', reportId);
            if (reportError)
                throw reportError;
            toast.success('Property marked as unavailable and report resolved');
            // Update local state
            setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status: 'resolved' } : r)));
        }
        catch (error) {
            console.error('Error hiding listing:', error);
            toast.error('Failed to hide listing');
        }
        finally {
            setActionLoading(null);
        }
    };
    const handleDismiss = async (reportId) => {
        setActionLoading(reportId);
        try {
            const { error } = await supabase
                .from('reports')
                .update({ status: 'dismissed' })
                .eq('id', reportId);
            if (error)
                throw error;
            toast.success('Report dismissed');
            // Update local state
            setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status: 'dismissed' } : r)));
        }
        catch (error) {
            console.error('Error dismissing report:', error);
            toast.error('Failed to dismiss report');
        }
        finally {
            setActionLoading(null);
        }
    };
    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return (_jsxs("span", { className: "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800", children: [_jsx(Clock, { size: 12 }), "Pending"] }));
            case 'resolved':
                return (_jsxs("span", { className: "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800", children: [_jsx(CheckCircle2, { size: 12 }), "Resolved"] }));
            case 'dismissed':
                return (_jsxs("span", { className: "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800", children: [_jsx(X, { size: 12 }), "Dismissed"] }));
            default:
                return null;
        }
    };
    if (profile?.role !== 'admin') {
        return null;
    }
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-background py-8", children: _jsx("div", { className: "container-custom max-w-7xl", children: _jsx("div", { className: "flex items-center justify-center py-20", children: _jsx(Loader2, { size: 48, className: "animate-spin text-primary" }) }) }) }));
    }
    return (_jsx("div", { className: "min-h-screen bg-background py-8", children: _jsxs("div", { className: "container-custom max-w-7xl", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-text mb-2", children: "User Reports" }), _jsx("p", { className: "text-text-light", children: "Review and manage property and user reports" })] }), _jsx("div", { className: "mb-6 flex gap-2 border-b border-gray-200", children: ['pending', 'resolved', 'dismissed', 'all'].map((status) => (_jsxs("button", { onClick: () => setFilter(status), className: `px-4 py-2 font-medium text-sm transition-colors border-b-2 ${filter === status
                            ? 'border-primary text-primary'
                            : 'border-transparent text-text-light hover:text-text'}`, children: [status.charAt(0).toUpperCase() + status.slice(1), status !== 'all' && (_jsx("span", { className: "ml-2 px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs", children: reports.filter((r) => r.status === status).length }))] }, status))) }), reports.length === 0 ? (_jsxs("div", { className: "bg-surface rounded-lg shadow-md p-12 text-center", children: [_jsx(FileText, { size: 64, className: "mx-auto text-gray-400 mb-4" }), _jsx("h3", { className: "text-xl font-semibold text-text mb-2", children: "No Reports Found" }), _jsx("p", { className: "text-text-light", children: filter === 'all'
                                ? 'No reports have been submitted yet.'
                                : `No ${filter} reports found.` })] })) : (_jsx("div", { className: "space-y-4", children: reports.map((report, index) => (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: index * 0.05 }, className: "bg-surface rounded-lg shadow-md p-6", children: [_jsx("div", { className: "flex items-start justify-between mb-4", children: _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx("h3", { className: "text-lg font-semibold text-text", children: reportReasonLabels[report.reason] || report.reason }), getStatusBadge(report.status)] }), report.description && (_jsx("p", { className: "text-sm text-text-light mb-4", children: report.description }))] }) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-text-light", children: "Reported by:" }), _jsx("span", { className: "ml-2 font-medium text-text", children: report.reporter?.full_name || 'Unknown User' }), _jsxs("span", { className: "ml-2 text-text-light", children: ["(", report.reporter?.email || 'No email', ")"] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-text-light", children: "Date:" }), _jsx("span", { className: "ml-2 font-medium text-text", children: formatDate(report.created_at) })] }), report.reported_type === 'property' && report.property && (_jsxs("div", { className: "md:col-span-2", children: [_jsx("span", { className: "text-text-light", children: "Property:" }), _jsxs("span", { className: "ml-2 font-medium text-text", children: [report.property.title, " - ", report.property.location] })] })), report.reported_type === 'user' && report.reported_user && (_jsxs("div", { className: "md:col-span-2", children: [_jsx("span", { className: "text-text-light", children: "Reported User:" }), _jsxs("span", { className: "ml-2 font-medium text-text", children: [report.reported_user.full_name, " (", report.reported_user.email, ")"] })] }))] }), report.status === 'pending' && (_jsxs("div", { className: "flex flex-wrap gap-3 pt-4 border-t border-gray-200", children: [report.reported_type === 'property' && report.reported_property_id && (_jsxs(_Fragment, { children: [_jsx(Button, { size: "sm", variant: "outline", onClick: () => window.open(`/properties/${report.reported_property_id}`, '_blank'), leftIcon: _jsx(ExternalLink, { size: 14 }), children: "View Property" }), _jsx(Button, { size: "sm", variant: "danger", onClick: () => handleHideListing(report.id, report.reported_property_id), disabled: actionLoading === report.id, isLoading: actionLoading === report.id, leftIcon: _jsx(EyeOff, { size: 14 }), children: "Hide Listing" })] })), _jsx(Button, { size: "sm", variant: "ghost", onClick: () => handleDismiss(report.id), disabled: actionLoading === report.id, isLoading: actionLoading === report.id, leftIcon: _jsx(X, { size: 14 }), children: "Dismiss Report" })] }))] }, report.id))) }))] }) }));
};
export default ReportsPage;
