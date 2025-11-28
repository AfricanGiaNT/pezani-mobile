import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/common';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
export const NoShowReportModal = ({ isOpen, onClose, viewingRequest, onSuccess, }) => {
    const [reason, setReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    if (!isOpen)
        return null;
    const handleReportNoShow = async () => {
        if (!reason.trim()) {
            toast.error('Please provide details about the no-show');
            return;
        }
        setIsProcessing(true);
        try {
            const { data, error } = await supabase.functions.invoke('process-refund', {
                body: {
                    viewing_request_id: viewingRequest.id,
                    refund_reason: reason,
                    cancelled_by: 'landlord',
                    dispute_type: 'tenant_no_show',
                },
            });
            if (error)
                throw error;
            toast.success('No-show claim submitted. Tenant has 24 hours to dispute.', { duration: 5000 });
            onSuccess();
            onClose();
        }
        catch (error) {
            console.error('Error reporting no-show:', error);
            toast.error(error.message || 'Failed to report no-show');
        }
        finally {
            setIsProcessing(false);
        }
    };
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50", children: _jsxs("div", { className: "bg-white rounded-lg shadow-xl max-w-md w-full", children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(AlertTriangle, { size: 24, className: "text-orange-500" }), _jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Report Tenant No-Show" })] }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600", disabled: isProcessing, children: _jsx(X, { size: 24 }) })] }), _jsxs("div", { className: "p-6 space-y-4", children: [_jsxs("div", { className: "p-4 bg-blue-50 border border-blue-200 rounded-lg", children: [_jsx("p", { className: "text-sm font-medium text-blue-900 mb-1", children: "What happens next?" }), _jsxs("ul", { className: "text-sm text-blue-700 space-y-1 list-disc list-inside", children: [_jsx("li", { children: "Tenant will be notified of the no-show claim" }), _jsx("li", { children: "They have 24 hours to dispute" }), _jsx("li", { children: "If no dispute, payment is released to you" }), _jsx("li", { children: "If disputed, admin will review and decide" })] })] }), _jsxs("div", { className: "text-sm text-gray-600", children: [_jsx("p", { className: "font-medium text-gray-900", children: "Property:" }), _jsx("p", { children: viewingRequest.properties?.title || 'Unknown Property' }), viewingRequest.scheduled_date && (_jsxs(_Fragment, { children: [_jsx("p", { className: "font-medium text-gray-900 mt-2", children: "Was scheduled for:" }), _jsx("p", { children: new Date(viewingRequest.scheduled_date).toLocaleString() })] }))] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "reason", className: "block text-sm font-medium text-gray-700 mb-2", children: "Details of No-Show *" }), _jsx("textarea", { id: "reason", rows: 4, value: reason, onChange: (e) => setReason(e.target.value), placeholder: "e.g., Tenant didn't show up at scheduled time. I waited 15 minutes and tried calling but no response...", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent", disabled: isProcessing })] }), _jsxs("div", { className: "p-4 bg-orange-50 border border-orange-200 rounded-lg", children: [_jsx("p", { className: "text-sm font-medium text-orange-900 mb-1", children: "\u26A0\uFE0F Important" }), _jsx("p", { className: "text-sm text-orange-700", children: "False no-show claims may result in penalties to your account. Only report genuine no-shows with accurate details." })] }), _jsxs("div", { className: "p-4 bg-green-50 border border-green-200 rounded-lg", children: [_jsx("p", { className: "text-sm text-green-700 mb-1", children: "Payment to be released:" }), _jsxs("p", { className: "text-2xl font-bold text-green-900", children: [(viewingRequest.transactions?.[0]?.amount || 0).toLocaleString(), ' ', "MWK"] })] })] }), _jsxs("div", { className: "flex gap-3 p-6 border-t", children: [_jsx(Button, { variant: "outline", onClick: onClose, disabled: isProcessing, fullWidth: true, children: "Cancel" }), _jsx(Button, { variant: "primary", onClick: handleReportNoShow, disabled: isProcessing || !reason.trim(), fullWidth: true, className: "bg-orange-600 hover:bg-orange-700", children: isProcessing ? 'Submitting...' : 'Report No-Show' })] })] }) }));
};
