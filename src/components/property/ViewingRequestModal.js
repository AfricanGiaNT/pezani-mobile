import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Calendar, Loader2, AlertCircle } from 'lucide-react';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice } from '@/utils/formatting';
// Validation schema for viewing request form
const viewingRequestSchema = z.object({
    preferred_date_1: z.string().min(1, 'First preferred date is required'),
    preferred_date_2: z.string().min(1, 'Second preferred date is required'),
    preferred_date_3: z.string().min(1, 'Third preferred date is required'),
    terms_accepted: z.boolean().refine((val) => val === true, {
        message: 'You must accept the terms and conditions to proceed',
    }),
}).refine((data) => {
    // Ensure all three dates are different
    return data.preferred_date_1 !== data.preferred_date_2 &&
        data.preferred_date_1 !== data.preferred_date_3 &&
        data.preferred_date_2 !== data.preferred_date_3;
}, {
    message: 'All three preferred dates must be different',
    path: ['preferred_date_3'], // Show error on the last field
});
const ViewingRequestModal = ({ isOpen, onClose, property }) => {
    const { user, profile } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
    const [hasDuplicate, setHasDuplicate] = useState(false);
    const [existingRequest, setExistingRequest] = useState(null);
    const { register, handleSubmit, formState: { errors }, reset, watch, } = useForm({
        resolver: zodResolver(viewingRequestSchema),
        defaultValues: {
            preferred_date_1: '',
            preferred_date_2: '',
            preferred_date_3: '',
            terms_accepted: false,
        },
    });
    const termsAccepted = watch('terms_accepted');
    // Check for duplicate viewing requests when modal opens
    useEffect(() => {
        if (isOpen && property && user) {
            checkForDuplicate();
        }
        else {
            setHasDuplicate(false);
            setExistingRequest(null);
        }
    }, [isOpen, property?.id, user?.id]);
    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            reset();
            setHasDuplicate(false);
            setExistingRequest(null);
        }
    }, [isOpen, reset]);
    const checkForDuplicate = async () => {
        if (!property || !user)
            return;
        try {
            setIsCheckingDuplicate(true);
            const { data, error } = await supabase
                .from('viewing_requests')
                .select('*')
                .eq('property_id', property.id)
                .eq('tenant_id', user.id)
                .in('status', ['pending', 'scheduled'])
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();
            if (error && error.code !== 'PGRST116') {
                // PGRST116 is "no rows returned" which is fine
                throw error;
            }
            if (data) {
                setHasDuplicate(true);
                setExistingRequest(data);
            }
            else {
                setHasDuplicate(false);
                setExistingRequest(null);
            }
        }
        catch (error) {
            console.error('Error checking for duplicate:', error);
            // Don't block user if check fails, but log it
        }
        finally {
            setIsCheckingDuplicate(false);
        }
    };
    const onSubmit = async (data) => {
        if (!property || !user || !profile) {
            toast.error('Please log in to request a viewing');
            return;
        }
        if (profile.role !== 'tenant') {
            toast.error('Only tenants can request viewings');
            return;
        }
        if (hasDuplicate && existingRequest) {
            toast.error('You already have a pending viewing request for this property');
            return;
        }
        setIsSubmitting(true);
        try {
            // Convert date strings to ISO timestamps
            const preferredDates = [
                new Date(data.preferred_date_1).toISOString(),
                new Date(data.preferred_date_2).toISOString(),
                new Date(data.preferred_date_3).toISOString(),
            ];
            // Get Supabase session for auth header
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error('Session expired. Please log in again.');
            }
            // Call Edge Function to create viewing request and initialize payment
            const { data: functionData, error: functionError } = await supabase.functions.invoke('create-viewing-request', {
                body: {
                    property_id: property.id,
                    preferred_dates: preferredDates,
                    callback_url: `${window.location.origin}/api/paychangu/webhook`,
                    return_url: `${window.location.origin}/payment/success`,
                },
            });
            if (functionError) {
                throw functionError;
            }
            if (!functionData.success) {
                throw new Error(functionData.error || 'Failed to create viewing request');
            }
            // Close modal and reset form
            reset();
            onClose();
            // Redirect to payment URL
            if (functionData.payment_url) {
                window.location.href = functionData.payment_url;
            }
            else {
                // Fallback: redirect to success page with reference
                const reference = functionData.reference || functionData.transaction_id;
                window.location.href = `/payment/success?reference=${reference}`;
            }
        }
        catch (error) {
            console.error('Error creating viewing request:', error);
            // If error contains payment_url, still redirect (partial success)
            if (error.payment_url) {
                window.location.href = error.payment_url;
                return;
            }
            // Show error and redirect to failed page if we have a reference
            const errorMessage = error.message || 'Failed to create viewing request. Please try again.';
            toast.error(errorMessage);
            // If we have a transaction reference, redirect to failed page
            if (error.transaction_id) {
                setTimeout(() => {
                    window.location.href = `/payment/failed?reference=${error.transaction_id}&error=${encodeURIComponent(errorMessage)}`;
                }, 2000);
            }
        }
        finally {
            setIsSubmitting(false);
        }
    };
    if (!property) {
        return null;
    }
    // Get minimum date (today)
    const today = new Date().toISOString().split('T')[0];
    // Get maximum date (30 days from now)
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    const maxDateString = maxDate.toISOString().split('T')[0];
    return (_jsx(Modal, { isOpen: isOpen, onClose: onClose, title: "Request Viewing", size: "lg", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-gray-50 rounded-lg p-4 border border-gray-200", children: [_jsx("h3", { className: "font-semibold text-text mb-2", children: property.title }), _jsx("p", { className: "text-sm text-text-light mb-2", children: property.location }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-text-light", children: "Viewing Fee:" }), _jsx("span", { className: "font-bold text-primary text-lg", children: formatPrice(property.viewing_fee) })] })] }), profile && (_jsxs("div", { className: "bg-gray-50 rounded-lg p-4 border border-gray-200", children: [_jsx("h3", { className: "font-semibold text-text mb-2", children: "Your Contact Information" }), _jsxs("div", { className: "space-y-1 text-sm", children: [_jsxs("p", { className: "text-text", children: [_jsx("span", { className: "text-text-light", children: "Name:" }), " ", profile.full_name || 'Not set'] }), _jsxs("p", { className: "text-text", children: [_jsx("span", { className: "text-text-light", children: "Email:" }), " ", profile.email || user?.email || 'Not set'] }), profile.phone && (_jsxs("p", { className: "text-text", children: [_jsx("span", { className: "text-text-light", children: "Phone:" }), " ", profile.phone] }))] }), (!profile.full_name || !profile.phone) && (_jsx("p", { className: "text-xs text-text-light mt-2", children: "Update your profile to ensure landlords can contact you." }))] })), isCheckingDuplicate ? (_jsxs("div", { className: "flex items-center gap-2 text-sm text-text-light", children: [_jsx(Loader2, { size: 16, className: "animate-spin" }), _jsx("span", { children: "Checking for existing requests..." })] })) : hasDuplicate && existingRequest ? (_jsx("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4", children: _jsxs("div", { className: "flex items-start gap-2", children: [_jsx(AlertCircle, { size: 20, className: "text-yellow-600 flex-shrink-0 mt-0.5" }), _jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "font-semibold text-yellow-900 mb-1", children: "Existing Request Found" }), _jsxs("p", { className: "text-sm text-yellow-800", children: ["You already have a ", existingRequest.status, " viewing request for this property.", existingRequest.status === 'pending' && ' Please wait for the landlord to respond.', existingRequest.status === 'scheduled' && ' Please check your dashboard for the scheduled date.'] })] })] }) })) : null, !hasDuplicate && (_jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-text mb-2", children: "Select 3 Preferred Dates" }), _jsx("p", { className: "text-xs text-text-light mb-3", children: "Choose 3 different dates when you're available for viewing. The landlord will select one." }), _jsxs("div", { className: "space-y-3", children: [_jsx("div", { children: _jsx(Input, { type: "date", label: "First Preferred Date", min: today, max: maxDateString, error: errors.preferred_date_1?.message, ...register('preferred_date_1'), leftIcon: _jsx(Calendar, { size: 18 }) }) }), _jsx("div", { children: _jsx(Input, { type: "date", label: "Second Preferred Date", min: today, max: maxDateString, error: errors.preferred_date_2?.message, ...register('preferred_date_2'), leftIcon: _jsx(Calendar, { size: 18 }) }) }), _jsx("div", { children: _jsx(Input, { type: "date", label: "Third Preferred Date", min: today, max: maxDateString, error: errors.preferred_date_3?.message, ...register('preferred_date_3'), leftIcon: _jsx(Calendar, { size: 18 }) }) })] })] }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4 border border-gray-200", children: [_jsxs("label", { className: "flex items-start gap-3 cursor-pointer", children: [_jsx("input", { type: "checkbox", ...register('terms_accepted'), className: "mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" }), _jsxs("div", { className: "flex-1", children: [_jsx("span", { className: "text-sm font-medium text-text", children: "I accept the terms and conditions" }), _jsxs("p", { className: "text-xs text-text-light mt-1", children: ["By proceeding, you agree to pay the viewing fee of ", formatPrice(property.viewing_fee), ". The fee will be held in escrow and released to the landlord after both parties confirm the viewing was completed. If the viewing is cancelled by the landlord, you will receive a full refund."] })] })] }), errors.terms_accepted && (_jsx("p", { className: "text-sm text-error mt-2 ml-7", children: errors.terms_accepted.message }))] }), _jsxs("div", { className: "bg-primary/10 rounded-lg p-4 border border-primary/20", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm font-medium text-text", children: "Viewing Fee" }), _jsx("span", { className: "font-bold text-primary text-lg", children: formatPrice(property.viewing_fee) })] }), _jsx("p", { className: "text-xs text-text-light", children: "You will be redirected to Paychangu to complete the payment securely." })] }), _jsxs("div", { className: "flex gap-3 pt-2", children: [_jsx(Button, { type: "button", variant: "outline", fullWidth: true, onClick: onClose, disabled: isSubmitting, children: "Cancel" }), _jsx(Button, { type: "submit", variant: "primary", fullWidth: true, loading: isSubmitting, disabled: !termsAccepted || isSubmitting, children: isSubmitting ? 'Processing...' : `Proceed to Payment - ${formatPrice(property.viewing_fee)}` })] })] })), hasDuplicate && (_jsx(Button, { variant: "outline", fullWidth: true, onClick: onClose, children: "Close" }))] }) }));
};
export default ViewingRequestModal;
