import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Calendar, Home, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/common';
import { supabase } from '@/lib/supabase';
import { formatPrice, formatDate } from '@/utils/formatting';

interface ViewingRequest {
  id: string;
  property_id: string;
  preferred_dates: string[];
  status: string;
  created_at: string;
  properties: {
    title: string;
    location: string;
    viewing_fee: number;
    profiles: {
      full_name: string | null;
      phone: string | null;
      email: string | null;
    };
  };
  transactions: {
    id: string;
    amount: number;
    payment_status: string;
    paychangu_reference: string | null;
  }[];
}

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reference = searchParams.get('reference');
  const [loading, setLoading] = useState(true);
  const [viewingRequest, setViewingRequest] = useState<ViewingRequest | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) {
      setError('Payment reference not found');
      setLoading(false);
      return;
    }

    fetchViewingRequest();
  }, [reference]);

  const fetchViewingRequest = async () => {
    if (!reference) return;

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
      const request = transaction.viewing_requests as any;
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
    } catch (err: any) {
      console.error('Error fetching viewing request:', err);
      setError(err.message || 'Failed to load viewing details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-text-light">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error || !viewingRequest) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-8">
        <div className="container-custom max-w-2xl">
          <div className="bg-surface rounded-lg shadow-md p-8 text-center">
            <div className="text-error mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-text mb-2">Payment Details Not Found</h1>
            <p className="text-text-light mb-6">{error || 'Unable to load viewing request details.'}</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
              <Button onClick={() => navigate('/browse')}>
                Browse Properties
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const transaction = viewingRequest.transactions[0];
  const property = viewingRequest.properties;
  const landlord = property.profiles;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container-custom max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface rounded-lg shadow-md overflow-hidden"
        >
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-center text-white">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <CheckCircle2 size={64} className="mx-auto mb-4" />
            </motion.div>
            <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-green-100">Your viewing request has been submitted</p>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8 space-y-6">
            {/* Payment Summary */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h2 className="font-semibold text-text mb-3">Payment Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-light">Amount Paid:</span>
                  <span className="font-semibold text-text">{formatPrice(transaction.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-light">Payment Status:</span>
                  <span className="font-semibold text-green-600 capitalize">
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

            {/* Property Details */}
            <div>
              <h2 className="font-semibold text-text mb-3">Property Details</h2>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-medium text-text mb-1">{property.title}</h3>
                <p className="text-sm text-text-light mb-3">{property.location}</p>
                <div className="flex items-center gap-2 text-sm text-text-light">
                  <Calendar size={16} />
                  <span>Viewing Fee: {formatPrice(property.viewing_fee)}</span>
                </div>
              </div>
            </div>

            {/* Preferred Dates */}
            {viewingRequest.preferred_dates && viewingRequest.preferred_dates.length > 0 && (
              <div>
                <h2 className="font-semibold text-text mb-3">Your Preferred Dates</h2>
                <div className="space-y-2">
                  {viewingRequest.preferred_dates.map((date, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-3 border border-gray-200 flex items-center gap-3"
                    >
                      <Calendar size={18} className="text-primary flex-shrink-0" />
                      <span className="text-text">
                        {formatDate(new Date(date))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Landlord Contact */}
            {landlord && (
              <div>
                <h2 className="font-semibold text-text mb-3">Landlord Contact</h2>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-2">
                  {landlord.full_name && (
                    <p className="text-text">
                      <span className="text-text-light">Name:</span> {landlord.full_name}
                    </p>
                  )}
                  {landlord.phone && (
                    <p className="text-text">
                      <span className="text-text-light">Phone:</span>{' '}
                      <a href={`tel:${landlord.phone}`} className="text-primary hover:underline">
                        {landlord.phone}
                      </a>
                    </p>
                  )}
                  {landlord.email && (
                    <p className="text-text">
                      <span className="text-text-light">Email:</span>{' '}
                      <a href={`mailto:${landlord.email}`} className="text-primary hover:underline">
                        {landlord.email}
                      </a>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
              <h2 className="font-semibold text-text mb-2">What's Next?</h2>
              <ol className="list-decimal list-inside space-y-2 text-sm text-text-light">
                <li>The landlord will review your preferred dates</li>
                <li>You'll receive an email when a date is confirmed</li>
                <li>Contact the landlord directly if you have questions</li>
                <li>After the viewing, both parties will confirm completion</li>
                <li>Payment will be released to the landlord after confirmation</li>
              </ol>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                variant="outline"
                fullWidth
                onClick={() => navigate('/dashboard')}
                leftIcon={<Home size={18} />}
              >
                Go to Dashboard
              </Button>
              <Button
                fullWidth
                onClick={() => navigate(`/properties/${viewingRequest.property_id}`)}
                rightIcon={<ArrowRight size={18} />}
              >
                View Property
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;

