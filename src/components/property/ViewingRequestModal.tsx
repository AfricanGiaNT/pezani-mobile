import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Calendar, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@contexts/AuthContext';
import { formatPrice } from '@/utils/formatting';

interface Property {
  id: string;
  title: string;
  location: string;
  viewing_fee: number;
  owner_id: string;
  profiles?: {
    full_name: string | null;
    phone: string | null;
    email: string | null;
  };
}

interface ViewingRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
}

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

type ViewingRequestFormData = z.infer<typeof viewingRequestSchema>;

const ViewingRequestModal = ({ isOpen, onClose, property }: ViewingRequestModalProps) => {
  const { user, profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [hasDuplicate, setHasDuplicate] = useState(false);
  const [existingRequest, setExistingRequest] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ViewingRequestFormData>({
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
    } else {
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
    if (!property || !user) return;

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
      } else {
        setHasDuplicate(false);
        setExistingRequest(null);
      }
    } catch (error: any) {
      console.error('Error checking for duplicate:', error);
      // Don't block user if check fails, but log it
    } finally {
      setIsCheckingDuplicate(false);
    }
  };

  const onSubmit = async (data: ViewingRequestFormData) => {
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
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'create-viewing-request',
        {
          body: {
            property_id: property.id,
            preferred_dates: preferredDates,
            callback_url: `${window.location.origin}/api/paychangu/webhook`,
            return_url: `${window.location.origin}/payment/success`,
          },
        }
      );

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
      } else {
        // Fallback: redirect to success page with reference
        const reference = functionData.reference || functionData.transaction_id;
        window.location.href = `/payment/success?reference=${reference}`;
      }
    } catch (error: any) {
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
    } finally {
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Viewing"
      size="lg"
    >
      <div className="space-y-6">
        {/* Property Summary */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="font-semibold text-text mb-2">{property.title}</h3>
          <p className="text-sm text-text-light mb-2">{property.location}</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-light">Viewing Fee:</span>
            <span className="font-bold text-primary text-lg">
              {formatPrice(property.viewing_fee)}
            </span>
          </div>
        </div>

        {/* User Contact Info (Pre-filled) */}
        {profile && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="font-semibold text-text mb-2">Your Contact Information</h3>
            <div className="space-y-1 text-sm">
              <p className="text-text">
                <span className="text-text-light">Name:</span> {profile.full_name || 'Not set'}
              </p>
              <p className="text-text">
                <span className="text-text-light">Email:</span> {profile.email || user?.email || 'Not set'}
              </p>
              {profile.phone && (
                <p className="text-text">
                  <span className="text-text-light">Phone:</span> {profile.phone}
                </p>
              )}
            </div>
            {(!profile.full_name || !profile.phone) && (
              <p className="text-xs text-text-light mt-2">
                Update your profile to ensure landlords can contact you.
              </p>
            )}
          </div>
        )}

        {/* Duplicate Request Warning */}
        {isCheckingDuplicate ? (
          <div className="flex items-center gap-2 text-sm text-text-light">
            <Loader2 size={16} className="animate-spin" />
            <span>Checking for existing requests...</span>
          </div>
        ) : hasDuplicate && existingRequest ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-yellow-900 mb-1">Existing Request Found</h4>
                <p className="text-sm text-yellow-800">
                  You already have a {existingRequest.status} viewing request for this property.
                  {existingRequest.status === 'pending' && ' Please wait for the landlord to respond.'}
                  {existingRequest.status === 'scheduled' && ' Please check your dashboard for the scheduled date.'}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Form */}
        {!hasDuplicate && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Preferred Dates */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Select 3 Preferred Dates
              </label>
              <p className="text-xs text-text-light mb-3">
                Choose 3 different dates when you're available for viewing. The landlord will select one.
              </p>
              
              <div className="space-y-3">
                <div>
                  <Input
                    type="date"
                    label="First Preferred Date"
                    min={today}
                    max={maxDateString}
                    error={errors.preferred_date_1?.message}
                    {...register('preferred_date_1')}
                    leftIcon={<Calendar size={18} />}
                  />
                </div>
                
                <div>
                  <Input
                    type="date"
                    label="Second Preferred Date"
                    min={today}
                    max={maxDateString}
                    error={errors.preferred_date_2?.message}
                    {...register('preferred_date_2')}
                    leftIcon={<Calendar size={18} />}
                  />
                </div>
                
                <div>
                  <Input
                    type="date"
                    label="Third Preferred Date"
                    min={today}
                    max={maxDateString}
                    error={errors.preferred_date_3?.message}
                    {...register('preferred_date_3')}
                    leftIcon={<Calendar size={18} />}
                  />
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('terms_accepted')}
                  className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-text">
                    I accept the terms and conditions
                  </span>
                  <p className="text-xs text-text-light mt-1">
                    By proceeding, you agree to pay the viewing fee of {formatPrice(property.viewing_fee)}.
                    The fee will be held in escrow and released to the landlord after both parties confirm
                    the viewing was completed. If the viewing is cancelled by the landlord, you will receive
                    a full refund.
                  </p>
                </div>
              </label>
              {errors.terms_accepted && (
                <p className="text-sm text-error mt-2 ml-7">
                  {errors.terms_accepted.message}
                </p>
              )}
            </div>

            {/* Payment Summary */}
            <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-text">Viewing Fee</span>
                <span className="font-bold text-primary text-lg">
                  {formatPrice(property.viewing_fee)}
                </span>
              </div>
              <p className="text-xs text-text-light">
                You will be redirected to Paychangu to complete the payment securely.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={isSubmitting}
                disabled={!termsAccepted || isSubmitting}
              >
                {isSubmitting ? 'Processing...' : `Proceed to Payment - ${formatPrice(property.viewing_fee)}`}
              </Button>
            </div>
          </form>
        )}

        {/* Close button if duplicate */}
        {hasDuplicate && (
          <Button
            variant="outline"
            fullWidth
            onClick={onClose}
          >
            Close
          </Button>
        )}
      </div>
    </Modal>
  );
};

export default ViewingRequestModal;

