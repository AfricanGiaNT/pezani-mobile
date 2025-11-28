import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Calendar, Home, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/common';
import { supabase } from '@/lib/supabase';
import { formatPrice, formatDate } from '@/utils/formatting';
const PaymentSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const reference = searchParams.get('reference');
    const [loading, setLoading] = useState(true);
    const [viewingRequest, setViewingRequest] = useState(null);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (!reference) {
            setError('Payment reference not found');
            setLoading(false);
            return;
        }
        fetchViewingRequest();
    }, [reference]);
    const fetchViewingRequest = async () => {
        if (!reference)
            return;
        try {
            setLoading(true);
            setError(null);
            // Fetch transaction by reference
            const { data: transaction, error: transactionError } = await supabase
                .from('transactions')
                .select(`
          id,
          viewing_request_id,
          amount,
          payment_status,
          paychangu_reference,
          viewing_requests (
            id,
            property_id,
            preferred_dates,
            status,
            created_at,
            properties (
              title,
              location,
              viewing_fee,
              profiles!owner_id (
                full_name,
                phone,
                email
              )
            )
          )
        `)
                .eq('paychangu_reference', reference)
                .maybeSingle();
            if (transactionError) {
                throw transactionError;
            }
            if (!transaction || !transaction.viewing_requests) {
                setError('Viewing request not found');
                return;
            }
            // Transform the data to match our interface
            const request = transaction.viewing_requests;
            setViewingRequest({
                id: request.id,
                property_id: request.property_id,
                preferred_dates: request.preferred_dates || [],
                status: request.status,
                created_at: request.created_at,
                properties: request.properties,
                transactions: [{
                        id: transaction.id,
                        amount: transaction.amount,
                        payment_status: transaction.payment_status,
                        paychangu_reference: transaction.paychangu_reference,
                    }],
            });
        }
        catch (err) {
            console.error('Error fetching viewing request:', err);
            setError(err.message || 'Failed to load viewing details');
        }
        finally {
            setLoading(false);
        }
    };
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-background flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx(Loader2, { size: 48, className: "animate-spin text-primary mx-auto mb-4" }), _jsx("p", { className: "text-text-light", children: "Loading payment details..." })] }) }));
    }
    if (error || !viewingRequest) {
        return (_jsx("div", { className: "min-h-screen bg-background flex items-center justify-center py-8", children: _jsx("div", { className: "container-custom max-w-2xl", children: _jsxs("div", { className: "bg-surface rounded-lg shadow-md p-8 text-center", children: [_jsx("div", { className: "text-error mb-4", children: _jsx("svg", { className: "w-16 h-16 mx-auto", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }), _jsx("h1", { className: "text-2xl font-bold text-text mb-2", children: "Payment Details Not Found" }), _jsx("p", { className: "text-text-light mb-6", children: error || 'Unable to load viewing request details.' }), _jsxs("div", { className: "flex gap-3 justify-center", children: [_jsx(Button, { variant: "outline", onClick: () => navigate('/dashboard'), children: "Go to Dashboard" }), _jsx(Button, { onClick: () => navigate('/browse'), children: "Browse Properties" })] })] }) }) }));
    }
    const transaction = viewingRequest.transactions[0];
    const property = viewingRequest.properties;
    const landlord = property.profiles;
    return (_jsx("div", { className: "min-h-screen bg-background py-8", children: _jsx("div", { className: "container-custom max-w-2xl", children: _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "bg-surface rounded-lg shadow-md overflow-hidden", children: [_jsxs("div", { className: "bg-gradient-to-r from-green-500 to-green-600 p-8 text-center text-white", children: [_jsx(motion.div, { initial: { scale: 0 }, animate: { scale: 1 }, transition: { type: 'spring', stiffness: 200, damping: 15 }, children: _jsx(CheckCircle2, { size: 64, className: "mx-auto mb-4" }) }), _jsx("h1", { className: "text-3xl font-bold mb-2", children: "Payment Successful!" }), _jsx("p", { className: "text-green-100", children: "Your viewing request has been submitted" })] }), _jsxs("div", { className: "p-6 md:p-8 space-y-6", children: [_jsxs("div", { className: "bg-gray-50 rounded-lg p-4 border border-gray-200", children: [_jsx("h2", { className: "font-semibold text-text mb-3", children: "Payment Summary" }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-text-light", children: "Amount Paid:" }), _jsx("span", { className: "font-semibold text-text", children: formatPrice(transaction.amount) })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-text-light", children: "Payment Status:" }), _jsx("span", { className: "font-semibold text-green-600 capitalize", children: transaction.payment_status })] }), transaction.paychangu_reference && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-text-light", children: "Reference:" }), _jsx("span", { className: "font-mono text-xs text-text-light", children: transaction.paychangu_reference })] }))] })] }), _jsxs("div", { children: [_jsx("h2", { className: "font-semibold text-text mb-3", children: "Property Details" }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4 border border-gray-200", children: [_jsx("h3", { className: "font-medium text-text mb-1", children: property.title }), _jsx("p", { className: "text-sm text-text-light mb-3", children: property.location }), _jsxs("div", { className: "flex items-center gap-2 text-sm text-text-light", children: [_jsx(Calendar, { size: 16 }), _jsxs("span", { children: ["Viewing Fee: ", formatPrice(property.viewing_fee)] })] })] })] }), viewingRequest.preferred_dates && viewingRequest.preferred_dates.length > 0 && (_jsxs("div", { children: [_jsx("h2", { className: "font-semibold text-text mb-3", children: "Your Preferred Dates" }), _jsx("div", { className: "space-y-2", children: viewingRequest.preferred_dates.map((date, index) => (_jsxs("div", { className: "bg-gray-50 rounded-lg p-3 border border-gray-200 flex items-center gap-3", children: [_jsx(Calendar, { size: 18, className: "text-primary flex-shrink-0" }), _jsx("span", { className: "text-text", children: formatDate(new Date(date)) })] }, index))) })] })), landlord && (_jsxs("div", { children: [_jsx("h2", { className: "font-semibold text-text mb-3", children: "Landlord Contact" }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-2", children: [landlord.full_name && (_jsxs("p", { className: "text-text", children: [_jsx("span", { className: "text-text-light", children: "Name:" }), " ", landlord.full_name] })), landlord.phone && (_jsxs("p", { className: "text-text", children: [_jsx("span", { className: "text-text-light", children: "Phone:" }), ' ', _jsx("a", { href: `tel:${landlord.phone}`, className: "text-primary hover:underline", children: landlord.phone })] })), landlord.email && (_jsxs("p", { className: "text-text", children: [_jsx("span", { className: "text-text-light", children: "Email:" }), ' ', _jsx("a", { href: `mailto:${landlord.email}`, className: "text-primary hover:underline", children: landlord.email })] }))] })] })), _jsxs("div", { className: "bg-primary/10 rounded-lg p-4 border border-primary/20", children: [_jsx("h2", { className: "font-semibold text-text mb-2", children: "What's Next?" }), _jsxs("ol", { className: "list-decimal list-inside space-y-2 text-sm text-text-light", children: [_jsx("li", { children: "The landlord will review your preferred dates" }), _jsx("li", { children: "You'll receive an email when a date is confirmed" }), _jsx("li", { children: "Contact the landlord directly if you have questions" }), _jsx("li", { children: "After the viewing, both parties will confirm completion" }), _jsx("li", { children: "Payment will be released to the landlord after confirmation" })] })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-3 pt-4", children: [_jsx(Button, { variant: "outline", fullWidth: true, onClick: () => navigate('/dashboard'), leftIcon: _jsx(Home, { size: 18 }), children: "Go to Dashboard" }), _jsx(Button, { fullWidth: true, onClick: () => navigate(`/properties/${viewingRequest.property_id}`), rightIcon: _jsx(ArrowRight, { size: 18 }), children: "View Property" })] })] })] }) }) }));
};
export default PaymentSuccessPage;
