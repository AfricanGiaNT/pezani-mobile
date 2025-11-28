import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle, RefreshCw, Home, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/common';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/utils/formatting';
const PaymentFailedPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const reference = searchParams.get('reference');
    const errorMessage = searchParams.get('error') || 'Payment could not be processed';
    const [loading, setLoading] = useState(true);
    const [transaction, setTransaction] = useState(null);
    const [retrying, setRetrying] = useState(false);
    useEffect(() => {
        if (reference) {
            fetchTransaction();
        }
        else {
            setLoading(false);
        }
    }, [reference]);
    const fetchTransaction = async () => {
        if (!reference)
            return;
        try {
            setLoading(true);
            const { data, error } = await supabase
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
            properties (
              title,
              location
            )
          )
        `)
                .eq('paychangu_reference', reference)
                .maybeSingle();
            if (error) {
                throw error;
            }
            setTransaction(data);
        }
        catch (err) {
            console.error('Error fetching transaction:', err);
        }
        finally {
            setLoading(false);
        }
    };
    const handleRetry = () => {
        if (!transaction?.viewing_request_id) {
            navigate('/browse');
            return;
        }
        setRetrying(true);
        // Navigate back to property detail page to retry
        if (transaction.viewing_requests?.property_id) {
            navigate(`/properties/${transaction.viewing_requests.property_id}`);
        }
        else {
            navigate('/browse');
        }
    };
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-background flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" }), _jsx("p", { className: "text-text-light", children: "Loading payment details..." })] }) }));
    }
    const property = transaction?.viewing_requests?.properties;
    return (_jsx("div", { className: "min-h-screen bg-background py-8", children: _jsx("div", { className: "container-custom max-w-2xl", children: _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "bg-surface rounded-lg shadow-md overflow-hidden", children: [_jsxs("div", { className: "bg-gradient-to-r from-red-500 to-red-600 p-8 text-center text-white", children: [_jsx(motion.div, { initial: { scale: 0 }, animate: { scale: 1 }, transition: { type: 'spring', stiffness: 200, damping: 15 }, children: _jsx(XCircle, { size: 64, className: "mx-auto mb-4" }) }), _jsx("h1", { className: "text-3xl font-bold mb-2", children: "Payment Failed" }), _jsx("p", { className: "text-red-100", children: "We couldn't process your payment" })] }), _jsxs("div", { className: "p-6 md:p-8 space-y-6", children: [_jsx("div", { className: "bg-red-50 rounded-lg p-4 border border-red-200", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(AlertCircle, { size: 20, className: "text-red-600 flex-shrink-0 mt-0.5" }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "font-semibold text-red-900 mb-1", children: "Payment Error" }), _jsx("p", { className: "text-sm text-red-800", children: errorMessage })] })] }) }), transaction && (_jsxs("div", { className: "bg-gray-50 rounded-lg p-4 border border-gray-200", children: [_jsx("h2", { className: "font-semibold text-text mb-3", children: "Transaction Details" }), _jsxs("div", { className: "space-y-2 text-sm", children: [transaction.amount && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-text-light", children: "Amount:" }), _jsx("span", { className: "font-semibold text-text", children: formatPrice(transaction.amount) })] })), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-text-light", children: "Status:" }), _jsx("span", { className: "font-semibold text-red-600 capitalize", children: transaction.payment_status })] }), transaction.paychangu_reference && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-text-light", children: "Reference:" }), _jsx("span", { className: "font-mono text-xs text-text-light", children: transaction.paychangu_reference })] }))] })] })), property && (_jsxs("div", { children: [_jsx("h2", { className: "font-semibold text-text mb-3", children: "Property" }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4 border border-gray-200", children: [_jsx("h3", { className: "font-medium text-text mb-1", children: property.title }), _jsx("p", { className: "text-sm text-text-light", children: property.location })] })] })), _jsxs("div", { className: "bg-blue-50 rounded-lg p-4 border border-blue-200", children: [_jsx("h2", { className: "font-semibold text-text mb-2", children: "Common Reasons for Payment Failure" }), _jsxs("ul", { className: "list-disc list-inside space-y-1 text-sm text-text-light", children: [_jsx("li", { children: "Insufficient funds in your mobile money account" }), _jsx("li", { children: "Network connectivity issues" }), _jsx("li", { children: "Payment service temporarily unavailable" }), _jsx("li", { children: "Incorrect payment details" }), _jsx("li", { children: "Transaction timeout" })] })] }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4 border border-gray-200", children: [_jsx("h2", { className: "font-semibold text-text mb-2", children: "What Happens Next?" }), _jsxs("ul", { className: "list-disc list-inside space-y-1 text-sm text-text-light", children: [_jsx("li", { children: "No viewing request was created" }), _jsx("li", { children: "No money was deducted from your account" }), _jsx("li", { children: "You can try again by clicking the retry button below" }), _jsx("li", { children: "If the problem persists, contact support" })] })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-3 pt-4", children: [_jsx(Button, { variant: "outline", fullWidth: true, onClick: () => navigate('/browse'), leftIcon: _jsx(Home, { size: 18 }), children: "Browse Properties" }), transaction?.viewing_requests?.property_id && (_jsx(Button, { variant: "outline", fullWidth: true, onClick: () => navigate(`/properties/${transaction.viewing_requests.property_id}`), leftIcon: _jsx(ArrowLeft, { size: 18 }), children: "Back to Property" })), _jsx(Button, { fullWidth: true, onClick: handleRetry, loading: retrying, leftIcon: _jsx(RefreshCw, { size: 18 }), children: "Try Again" })] }), _jsxs("div", { className: "text-center pt-4 border-t border-gray-200", children: [_jsx("p", { className: "text-sm text-text-light mb-2", children: "Need help? Contact our support team" }), _jsx("a", { href: "mailto:support@pezani.com", className: "text-primary hover:underline text-sm font-medium", children: "support@pezani.com" })] })] })] }) }) }));
};
export default PaymentFailedPage;
