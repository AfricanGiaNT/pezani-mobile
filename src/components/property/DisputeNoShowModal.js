import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/common';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
export const DisputeNoShowModal = ({ isOpen, onClose, viewingRequest, onSuccess, }) => {
    const [evidence, setEvidence] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    if (!isOpen)
        return null;
    const getTimeRemaining = () => {
        if (!viewingRequest.dispute_deadline)
            return 'No deadline set';
        const deadline = new Date(viewingRequest.dispute_deadline);
        const now = new Date();
        const hoursLeft = Math.max(0, (deadline.getTime() - now.getTime()) / (1000 * 60 * 60));
        if (hoursLeft < 1) {
            const minutesLeft = Math.floor(hoursLeft * 60);
            return `${minutesLeft} minutes remaining`;
        }
        return `${Math.floor(hoursLeft)} hours remaining`;
    };
    const handleDispute = async () => {
        if (!evidence.trim()) {
            toast.error('Please provide evidence for your dispute');
            return;
        }
        setIsProcessing(true);
        try {
            const { data, error } = await supabase.functions.invoke('process-refund', {
                body: {
                    viewing_request_id: viewingRequest.id,
                    refund_reason: evidence,
                    cancelled_by: 'tenant',
                    dispute_type: 'tenant_dispute_no_show',
                },
            });
            if (error)
                throw error;
            toast.success('Dispute submitted successfully. Admin will review and contact you.', { duration: 5000 });
            onSuccess();
            onClose();
        }
        catch (error) {
            console.error('Error submitting dispute:', error);
            toast.error(error.message || 'Failed to submit dispute');
        }
        finally {
            setIsProcessing(false);
        }
    };
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50", children: _jsxs("div", { className: "bg-white rounded-lg shadow-xl max-w-md w-full", children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(AlertCircle, { size: 24, className: "text-red-500" }), _jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Dispute No-Show Claim" })] }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600", disabled: isProcessing, children: _jsx(X, { size: 24 }) })] }), _jsxs("div", { className: "p-6 space-y-4", children: [_jsxs("div", { className: "p-4 bg-red-50 border border-red-200 rounded-lg", children: [_jsx("p", { className: "text-sm font-medium text-red-900 mb-1", children: "\u23F0 Dispute Deadline" }), _jsx("p", { className: "text-lg font-bold text-red-700", children: getTimeRemaining() })] }), _jsxs("div", { className: "p-4 bg-gray-50 border border-gray-200 rounded-lg", children: [_jsx("p", { className: "text-sm font-medium text-gray-900 mb-2", children: "Landlord's Claim:" }), _jsx("p", { className: "text-sm text-gray-700", children: viewingRequest.cancellation_reason || 'Tenant did not show up for scheduled viewing' })] }), _jsxs("div", { className: "p-4 bg-blue-50 border border-blue-200 rounded-lg", children: [_jsx("p", { className: "text-sm font-medium text-blue-900 mb-1", children: "What happens after you dispute?" }), _jsxs("ul", { className: "text-sm text-blue-700 space-y-1 list-disc list-inside", children: [_jsx("li", { children: "Your dispute will be reviewed by an admin" }), _jsx("li", { children: "Both you and landlord may be contacted for details" }), _jsx("li", { children: "Decision will be made within 2-3 business days" }), _jsx("li", { children: "Refund will be processed based on admin decision" })] })] }), _jsxs("div", { className: "text-sm text-gray-600", children: [_jsx("p", { className: "font-medium text-gray-900", children: "Property:" }), _jsx("p", { children: viewingRequest.properties?.title || 'Unknown Property' }), viewingRequest.scheduled_date && (_jsxs(_Fragment, { children: [_jsx("p", { className: "font-medium text-gray-900 mt-2", children: "Scheduled Date:" }), _jsx("p", { children: new Date(viewingRequest.scheduled_date).toLocaleString() })] }))] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "evidence", className: "block text-sm font-medium text-gray-700 mb-2", children: "Your Evidence/Explanation *" }), _jsx("textarea", { id: "evidence", rows: 5, value: evidence, onChange: (e) => setEvidence(e.target.value), placeholder: "Please provide detailed evidence that you attended or attempted to attend the viewing. Include:\n- What time you arrived\n- Any communication with landlord\n- Photos/screenshots if available\n- Any witnesses", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent", disabled: isProcessing }), _jsx("p", { className: "mt-1 text-xs text-gray-500", children: "Be as detailed as possible. Strong evidence increases chances of refund." })] }), _jsxs("div", { className: "p-4 bg-yellow-50 border border-yellow-200 rounded-lg", children: [_jsx("p", { className: "text-sm text-yellow-700 mb-1", children: "Amount at stake:" }), _jsxs("p", { className: "text-2xl font-bold text-yellow-900", children: [(viewingRequest.transactions?.[0]?.amount || 0).toLocaleString(), ' ', "MWK"] })] })] }), _jsxs("div", { className: "flex gap-3 p-6 border-t", children: [_jsx(Button, { variant: "outline", onClick: onClose, disabled: isProcessing, fullWidth: true, children: "Cancel" }), _jsx(Button, { variant: "primary", onClick: handleDispute, disabled: isProcessing || !evidence.trim(), fullWidth: true, className: "bg-red-600 hover:bg-red-700", children: isProcessing ? 'Submitting...' : 'Submit Dispute' })] })] }) }));
};
