/**
 * Paychangu Payment Integration
 * 
 * Paychangu is a Malawi payment gateway that supports mobile money and bank transfers.
 * This module handles payment initialization and verification.
 */

const PAYCHANGU_API_BASE_URL = 'https://api.paychangu.com/v1'; // Update with actual Paychangu API URL
const PAYCHANGU_PUBLIC_KEY = import.meta.env.VITE_PAYCHANGU_PUBLIC_KEY || 'PUB-TEST-lU3cD0LiVVIhrVICng1C3kYgmasNZQIb';

export interface PaychanguPaymentRequest {
  amount: number;
  currency: string;
  description: string;
  reference: string;
  callback_url: string;
  return_url: string;
  customer_email?: string;
  customer_phone?: string;
  customer_name?: string;
}

export interface PaychanguPaymentResponse {
  success: boolean;
  payment_url?: string;
  payment_id?: string;
  reference?: string;
  message?: string;
  error?: string;
}

/**
 * Initialize a payment with Paychangu
 * 
 * Note: In production, this should be called from a Supabase Edge Function
 * to keep the secret key secure. For MVP, we'll use the public key for initialization
 * and handle the actual payment processing server-side.
 */
export const initializePayment = async (
  request: PaychanguPaymentRequest
): Promise<PaychanguPaymentResponse> => {
  if (!PAYCHANGU_PUBLIC_KEY) {
    return {
      success: false,
      error: 'Paychangu public key not configured. Please set VITE_PAYCHANGU_PUBLIC_KEY in your environment variables.',
    };
  }

  try {
    // In production, this should call a Supabase Edge Function
    // that uses the secret key server-side
    const response = await fetch(`${PAYCHANGU_API_BASE_URL}/payments/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PAYCHANGU_PUBLIC_KEY}`,
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Failed to initialize payment',
      };
    }

    return {
      success: true,
      payment_url: data.payment_url,
      payment_id: data.payment_id,
      reference: data.reference,
      message: data.message,
    };
  } catch (error: any) {
    console.error('Paychangu payment initialization error:', error);
    return {
      success: false,
      error: error.message || 'Network error. Please try again.',
    };
  }
};

/**
 * Verify payment status
 * This should be called after payment redirect to verify the payment was successful
 */
export const verifyPayment = async (reference: string): Promise<PaychanguPaymentResponse> => {
  if (!PAYCHANGU_PUBLIC_KEY) {
    return {
      success: false,
      error: 'Paychangu public key not configured',
    };
  }

  try {
    const response = await fetch(`${PAYCHANGU_API_BASE_URL}/payments/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYCHANGU_PUBLIC_KEY}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Failed to verify payment',
      };
    }

    return {
      success: data.status === 'successful',
      payment_id: data.payment_id,
      reference: data.reference,
      message: data.message,
    };
  } catch (error: any) {
    console.error('Paychangu payment verification error:', error);
    return {
      success: false,
      error: error.message || 'Network error. Please try again.',
    };
  }
};

/**
 * Test Paychangu API connection
 * Useful for debugging and setup verification
 */
export const testPaychanguConnection = async (): Promise<boolean> => {
  try {
    const response = await initializePayment({
      amount: 100, // Test amount
      currency: 'MWK',
      description: 'Test Payment',
      reference: `test-${Date.now()}`,
      callback_url: `${window.location.origin}/api/paychangu/webhook`,
      return_url: `${window.location.origin}/payment/success`,
    });

    return response.success;
  } catch (error) {
    console.error('Paychangu connection test failed:', error);
    return false;
  }
};

