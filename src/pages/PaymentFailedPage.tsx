import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle, RefreshCw, Home, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/common';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/utils/formatting';

interface Transaction {
  id: string;
  viewing_request_id: string | null;
  amount: number;
  payment_status: string;
  paychangu_reference: string | null;
  viewing_requests?: {
    id: string;
    property_id: string;
    properties: {
      title: string;
      location: string;
    };
  };
}

const PaymentFailedPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reference = searchParams.get('reference');
  const errorMessage = searchParams.get('error') || 'Payment could not be processed';
  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (reference) {
      fetchTransaction();
    } else {
      setLoading(false);
    }
  }, [reference]);

  const fetchTransaction = async () => {
    if (!reference) return;

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

      setTransaction(data as Transaction | null);
    } catch (err: any) {
      console.error('Error fetching transaction:', err);
    } finally {
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
    } else {
      navigate('/browse');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-light">Loading payment details...</p>
        </div>
      </div>
    );
  }

  const property = transaction?.viewing_requests?.properties;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container-custom max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface rounded-lg shadow-md overflow-hidden"
        >
          {/* Error Header */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-8 text-center text-white">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <XCircle size={64} className="mx-auto mb-4" />
            </motion.div>
            <h1 className="text-3xl font-bold mb-2">Payment Failed</h1>
            <p className="text-red-100">We couldn't process your payment</p>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8 space-y-6">
            {/* Error Message */}
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 mb-1">Payment Error</h3>
                  <p className="text-sm text-red-800">{errorMessage}</p>
                </div>
              </div>
            </div>

            {/* Transaction Details */}
            {transaction && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h2 className="font-semibold text-text mb-3">Transaction Details</h2>
                <div className="space-y-2 text-sm">
                  {transaction.amount && (
                    <div className="flex justify-between">
                      <span className="text-text-light">Amount:</span>
                      <span className="font-semibold text-text">
                        {formatPrice(transaction.amount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-text-light">Status:</span>
                    <span className="font-semibold text-red-600 capitalize">
                      {transaction.payment_status}
                    </span>
                  </div>
                  {transaction.paychangu_reference && (
                    <div className="flex justify-between">
                      <span className="text-text-light">Reference:</span>
                      <span className="font-mono text-xs text-text-light">
                        {transaction.paychangu_reference}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Property Info */}
            {property && (
              <div>
                <h2 className="font-semibold text-text mb-3">Property</h2>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="font-medium text-text mb-1">{property.title}</h3>
                  <p className="text-sm text-text-light">{property.location}</p>
                </div>
              </div>
            )}

            {/* Common Reasons */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h2 className="font-semibold text-text mb-2">Common Reasons for Payment Failure</h2>
              <ul className="list-disc list-inside space-y-1 text-sm text-text-light">
                <li>Insufficient funds in your mobile money account</li>
                <li>Network connectivity issues</li>
                <li>Payment service temporarily unavailable</li>
                <li>Incorrect payment details</li>
                <li>Transaction timeout</li>
              </ul>
            </div>

            {/* What Happens Next */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h2 className="font-semibold text-text mb-2">What Happens Next?</h2>
              <ul className="list-disc list-inside space-y-1 text-sm text-text-light">
                <li>No viewing request was created</li>
                <li>No money was deducted from your account</li>
                <li>You can try again by clicking the retry button below</li>
                <li>If the problem persists, contact support</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                variant="outline"
                fullWidth
                onClick={() => navigate('/browse')}
                leftIcon={<Home size={18} />}
              >
                Browse Properties
              </Button>
              {transaction?.viewing_requests?.property_id && (
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => navigate(`/properties/${transaction.viewing_requests!.property_id}`)}
                  leftIcon={<ArrowLeft size={18} />}
                >
                  Back to Property
                </Button>
              )}
              <Button
                fullWidth
                onClick={handleRetry}
                loading={retrying}
                leftIcon={<RefreshCw size={18} />}
              >
                Try Again
              </Button>
            </div>

            {/* Support */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-text-light mb-2">
                Need help? Contact our support team
              </p>
              <a
                href="mailto:support@pezani.com"
                className="text-primary hover:underline text-sm font-medium"
              >
                support@pezani.com
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentFailedPage;

