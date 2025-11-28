import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/common';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
export const CancellationModal = ({ isOpen, onClose, viewingRequest, userRole, onSuccess, }) => {
    const [reason, setReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    if (!isOpen)
        return null;
    const calculateRefundInfo = () => {
        if (userRole === 'landlord') {
            return {
                refundPercent: 100,
                message: 'Tenant will receive 100% refund (Full refund)',
            };
        }
        // Tenant cancellation
        if (!viewingRequest.scheduled_date) {
            return {
                refundPercent: 100,
                message: 'You will receive 100% refund',
            };
        }
        const scheduledDate = new Date(viewingRequest.scheduled_date);
        const now = new Date();
        const hoursUntil = (scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        if (hoursUntil > 24) {
            return {
                refundPercent: 100,
                message: 'You will receive 100% refund (>24 hours notice)',
            };
        }
        else if (hoursUntil > 0) {
            return {
                refundPercent: 50,
                message: 'You will receive 50% refund (<24 hours notice)',
            };
        }
        else {
            return {
                refundPercent: 0,
                message: 'No refund (after scheduled viewing time)',
            };
        }
    };
    const refundInfo = calculateRefundInfo();
    const handleCancel = async () => {
        if (!reason.trim()) {
            toast.error('Please provide a reason for cancellation');
            return;
        }
        setIsProcessing(true);
        try {
            const { data, error } = await supabase.functions.invoke('process-refund', {
                body: {
                    viewing_request_id: viewingRequest.id,
                    refund_reason: reason,
                    cancelled_by: userRole,
                },
            });
            if (error)
                throw error;
            toast.success(`Viewing cancelled. Refund: ${data.refund_amount.toLocaleString()} MWK`);
            onSuccess();
            onClose();
        }
        catch (error) {
            console.error('Error cancelling viewing:', error);
            toast.error(error.message || 'Failed to cancel viewing');
        }
        finally {
            setIsProcessing(false);
        }
    };
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50", children: _jsxs("div", { className: "bg-white rounded-lg shadow-xl max-w-md w-full", children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Cancel Viewing Request" }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600", disabled: isProcessing, children: _jsx(X, { size: 24 }) })] }), _jsxs("div", { className: "p-6 space-y-4", children: [_jsxs("div", { className: "p-4 bg-blue-50 border border-blue-200 rounded-lg", children: [_jsx("p", { className: "text-sm font-medium text-blue-900 mb-1", children: "Refund Policy" }), _jsx("p", { className: "text-sm text-blue-700", children: refundInfo.message }), _jsxs("p", { className: "text-lg font-bold text-blue-900 mt-2", children: [refundInfo.refundPercent, "% Refund (", ((viewingRequest.transactions?.[0]?.amount || 0) * refundInfo.refundPercent / 100).toLocaleString(), " MWK)"] })] }), _jsxs("div", { className: "text-sm text-gray-600", children: [_jsx("p", { className: "font-medium text-gray-900", children: "Property:" }), _jsx("p", { children: viewingRequest.properties?.title || 'Unknown Property' }), viewingRequest.scheduled_date && (_jsxs(_Fragment, { children: [_jsx("p", { className: "font-medium text-gray-900 mt-2", children: "Scheduled for:" }), _jsx("p", { children: new Date(viewingRequest.scheduled_date).toLocaleString() })] }))] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "reason", className: "block text-sm font-medium text-gray-700 mb-2", children: "Reason for Cancellation *" }), _jsx("textarea", { id: "reason", rows: 4, value: reason, onChange: (e) => setReason(e.target.value), placeholder: "Please provide a detailed reason for cancelling this viewing...", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent", disabled: isProcessing })] }), _jsx("div", { className: "p-4 bg-red-50 border border-red-200 rounded-lg", children: _jsx("p", { className: "text-sm text-red-700", children: "\u26A0\uFE0F This action cannot be undone. The viewing request will be cancelled and refund will be processed according to the policy." }) })] }), _jsxs("div", { className: "flex gap-3 p-6 border-t", children: [_jsx(Button, { variant: "outline", onClick: onClose, disabled: isProcessing, fullWidth: true, children: "Keep Viewing" }), _jsx(Button, { variant: "primary", onClick: handleCancel, disabled: isProcessing || !reason.trim(), fullWidth: true, className: "bg-red-600 hover:bg-red-700", children: isProcessing ? 'Cancelling...' : 'Cancel Viewing' })] })] }) }));
};
