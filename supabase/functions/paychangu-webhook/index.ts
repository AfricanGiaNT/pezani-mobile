// Supabase Edge Function: Paychangu Webhook Handler
// Deploy with: supabase functions deploy paychangu-webhook
// Configure webhook URL in Paychangu dashboard: https://your-project.supabase.co/functions/v1/paychangu-webhook

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''
const SITE_URL = Deno.env.get('SITE_URL') || 'http://localhost:5173'
const PAYCHANGU_WEBHOOK_SECRET = Deno.env.get('PAYCHANGU_WEBHOOK_SECRET') || ''

interface PaychanguWebhookPayload {
  event: string // 'payment.successful' | 'payment.failed'
  data: {
    reference: string
    payment_id: string
    amount: number
    currency: string
    status: string
    customer_email?: string
    customer_phone?: string
    metadata?: Record<string, any>
  }
  signature?: string // Webhook signature for verification
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'content-type, x-paychangu-signature',
      },
    })
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Parse webhook payload
    const payload: PaychanguWebhookPayload = await req.json()
    const { event, data, signature } = payload

    console.log('Webhook received:', { event, reference: data.reference })

    // Verify webhook signature (if webhook secret is configured)
    if (PAYCHANGU_WEBHOOK_SECRET && signature) {
      const isValid = await verifyPaychanguSignature(signature, payload, PAYCHANGU_WEBHOOK_SECRET)
      if (!isValid) {
        console.warn('Invalid webhook signature:', signature)
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        )
      }
    } else if (!PAYCHANGU_WEBHOOK_SECRET) {
      console.warn('Webhook secret not configured, skipping signature verification')
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Find transaction by Paychangu reference
    const { data: transaction, error: transactionError } = await supabaseAdmin
      .from('transactions')
      .select(`
        id,
        viewing_request_id,
        tenant_id,
        amount,
        payment_status,
        escrow_status,
        viewing_requests (
          id,
          property_id,
          tenant_id,
          landlord_id,
          status,
          preferred_dates,
          properties (
            id,
            title,
            location,
            viewing_fee,
            profiles!owner_id (
              id,
              email,
              full_name,
              phone
            )
          ),
          tenant:profiles!tenant_id (
            id,
            email,
            full_name,
            phone
          )
        )
      `)
      .eq('paychangu_reference', data.reference)
      .maybeSingle()

    if (transactionError) {
      console.error('Error fetching transaction:', transactionError)
      return new Response(
        JSON.stringify({ error: 'Transaction not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!transaction) {
      console.warn('Transaction not found for reference:', data.reference)
      return new Response(
        JSON.stringify({ error: 'Transaction not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const viewingRequest = transaction.viewing_requests as any

    // Handle different webhook events
    if (event === 'payment.successful') {
      // Update transaction status
      const { error: updateError } = await supabaseAdmin
        .from('transactions')
        .update({
          payment_status: 'completed',
          escrow_status: 'held', // Payment held in escrow until viewing confirmed
        })
        .eq('id', transaction.id)

      if (updateError) {
        console.error('Error updating transaction:', updateError)
        throw updateError
      }

      // Update viewing request status (keep as pending until landlord schedules)
      // The status will be updated to 'scheduled' when landlord confirms date

      // Send email notifications
      if (RESEND_API_KEY && viewingRequest) {
        await sendViewingRequestEmails(
          viewingRequest,
          transaction,
          'successful'
        )
      }

      console.log('Payment successful, transaction updated:', transaction.id)

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Payment processed successfully',
          transaction_id: transaction.id,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    } else if (event === 'payment.failed') {
      // Update transaction status
      const { error: updateError } = await supabaseAdmin
        .from('transactions')
        .update({
          payment_status: 'failed',
        })
        .eq('id', transaction.id)

      if (updateError) {
        console.error('Error updating transaction:', updateError)
        throw updateError
      }

      // Delete viewing request (payment failed, no viewing)
      if (viewingRequest) {
        const { error: deleteError } = await supabaseAdmin
          .from('viewing_requests')
          .delete()
          .eq('id', viewingRequest.id)

        if (deleteError) {
          console.error('Error deleting viewing request:', deleteError)
          // Don't throw - transaction is already updated
        }
      }

      // Send failure notification email
      if (RESEND_API_KEY && viewingRequest?.tenant) {
        await sendPaymentFailedEmail(
          viewingRequest.tenant,
          viewingRequest.properties,
          transaction
        )
      }

      console.log('Payment failed, transaction and viewing request updated')

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Payment failure processed',
          transaction_id: transaction.id,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    } else {
      console.warn('Unknown webhook event:', event)
      return new Response(
        JSON.stringify({ error: 'Unknown event type' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
  } catch (error: any) {
    console.error('Webhook handler error:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        details: error.toString(),
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
})

// Verify Paychangu webhook signature
// Uses HMAC-SHA256 which is standard for most payment gateways
// Adapt this based on Paychangu's actual signature method
async function verifyPaychanguSignature(
  signature: string | undefined,
  payload: PaychanguWebhookPayload,
  secret: string
): Promise<boolean> {
  if (!signature || !secret) {
    return false
  }

  try {
    // Standard HMAC-SHA256 verification
    // Paychangu may send signature in header (x-paychangu-signature) or in payload
    // This implementation assumes signature is in the payload
    // If Paychangu sends it in headers, extract from request headers instead
    
    // Create HMAC hash of the payload
    const encoder = new TextEncoder()
    const payloadString = JSON.stringify(payload)
    const keyData = encoder.encode(secret)
    const messageData = encoder.encode(payloadString)
    
    // Use Web Crypto API for HMAC-SHA256
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    
    const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData)
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    
    // Compare signatures (constant-time comparison to prevent timing attacks)
    if (signature.length !== expectedSignature.length) {
      return false
    }
    
    let match = 0
    for (let i = 0; i < signature.length; i++) {
      match |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i)
    }
    
    return match === 0
  } catch (error) {
    console.error('Error verifying signature:', error)
    return false
  }
}

// Send viewing request emails (tenant confirmation + landlord notification)
async function sendViewingRequestEmails(
  viewingRequest: any,
  transaction: any,
  status: 'successful' | 'scheduled'
) {
  if (!RESEND_API_KEY) {
    console.warn('Resend API key not configured, skipping emails')
    return
  }

  const property = viewingRequest.properties
  const landlord = property.profiles
  const tenant = viewingRequest.tenant

  // Email to tenant (confirmation)
  if (tenant?.email) {
    await sendEmail({
      to: tenant.email,
      subject: status === 'successful'
        ? `Viewing Request Confirmed - ${property.title}`
        : `Viewing Scheduled - ${property.title}`,
      html: getTenantViewingConfirmationEmail(
        tenant,
        property,
        viewingRequest,
        transaction,
        status
      ),
    })
  }

  // Email to landlord (notification)
  if (landlord?.email) {
    await sendEmail({
      to: landlord.email,
      subject: `New Viewing Request - ${property.title}`,
      html: getLandlordViewingRequestEmail(
        landlord,
        tenant,
        property,
        viewingRequest,
        transaction
      ),
    })
  }
}

// Send payment failed email
async function sendPaymentFailedEmail(
  tenant: any,
  property: any,
  transaction: any
) {
  if (!RESEND_API_KEY || !tenant?.email) {
    return
  }

  await sendEmail({
    to: tenant.email,
    subject: `Payment Failed - Viewing Request for ${property.title}`,
    html: getPaymentFailedEmail(tenant, property, transaction),
  })
}

// Send email using Resend API
async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Pezani Estates <noreply@pezani.com>', // Update with your verified domain
        to: [to],
        subject,
        html,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Resend API error:', error)
      throw new Error(`Failed to send email: ${error.message}`)
    }

    const data = await response.json()
    console.log('Email sent successfully:', data.id)
    return data
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

// Email template: Tenant viewing confirmation
function getTenantViewingConfirmationEmail(
  tenant: any,
  property: any,
  viewingRequest: any,
  transaction: any,
  status: 'successful' | 'scheduled'
): string {
  const preferredDates = viewingRequest.preferred_dates
    ?.map((d: string) => new Date(d).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }))
    .join(', ') || 'Not specified'

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Viewing Request Confirmed</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(to right, #E4B012, #C29910); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0;">Viewing Request ${status === 'successful' ? 'Confirmed' : 'Scheduled'}</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
        <p>Hello ${tenant.full_name || 'there'},</p>
        
        <p>Your viewing request has been ${status === 'successful' ? 'confirmed and payment received' : 'scheduled'}!</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #E4B012;">
          <h2 style="margin-top: 0; color: #1E3A5F;">${property.title}</h2>
          <p style="color: #666; margin-bottom: 10px;">📍 ${property.location}</p>
          <p style="color: #666; margin-bottom: 10px;">💰 Viewing Fee: MWK ${transaction.amount.toLocaleString()}</p>
          ${status === 'scheduled' && viewingRequest.scheduled_date ? `
            <p style="color: #666; margin-bottom: 0;"><strong>Scheduled Date:</strong> ${new Date(viewingRequest.scheduled_date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}</p>
          ` : `
            <p style="color: #666; margin-bottom: 0;"><strong>Your Preferred Dates:</strong></p>
            <ul style="color: #666; margin-top: 5px;">
              ${viewingRequest.preferred_dates?.map((d: string) => `<li>${new Date(d).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}</li>`).join('') || '<li>Not specified</li>'}
            </ul>
          `}
        </div>
        
        ${status === 'successful' ? `
          <p><strong>What's Next?</strong></p>
          <ol>
            <li>The landlord will review your preferred dates</li>
            <li>You'll receive another email when a date is confirmed</li>
            <li>Contact the landlord directly if you have questions</li>
            <li>After the viewing, both parties will confirm completion</li>
            <li>Payment will be released to the landlord after confirmation</li>
          </ol>
        ` : `
          <p><strong>Your viewing is scheduled!</strong> Please arrive on time and contact the landlord if you need to reschedule.</p>
        `}
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 14px; margin: 0;">
            Questions? Contact us at <a href="mailto:support@pezani.com" style="color: #E4B012;">support@pezani.com</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Email template: Landlord viewing request notification
function getLandlordViewingRequestEmail(
  landlord: any,
  tenant: any,
  property: any,
  viewingRequest: any,
  transaction: any
): string {
  const preferredDates = viewingRequest.preferred_dates
    ?.map((d: string) => new Date(d).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }))
    .join(', ') || 'Not specified'

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Viewing Request</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(to right, #1E3A5F, #152B47); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0;">New Viewing Request</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
        <p>Hello ${landlord.full_name || 'there'},</p>
        
        <p>You have received a new viewing request for your property!</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1E3A5F;">
          <h2 style="margin-top: 0; color: #1E3A5F;">${property.title}</h2>
          <p style="color: #666; margin-bottom: 10px;">📍 ${property.location}</p>
          <p style="color: #666; margin-bottom: 10px;">💰 Viewing Fee: MWK ${transaction.amount.toLocaleString()} (Payment Received)</p>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1E3A5F;">Tenant Information</h3>
          <p><strong>Name:</strong> ${tenant.full_name || 'Not provided'}</p>
          <p><strong>Email:</strong> ${tenant.email || 'Not provided'}</p>
          ${tenant.phone ? `<p><strong>Phone:</strong> ${tenant.phone}</p>` : ''}
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1E3A5F;">Preferred Dates</h3>
          <ul>
            ${viewingRequest.preferred_dates?.map((d: string) => `<li>${new Date(d).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}</li>`).join('') || '<li>Not specified</li>'}
          </ul>
        </div>
        
        <div style="background: #E4B012; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <a href="${SITE_URL}/dashboard" style="color: white; text-decoration: none; font-weight: bold; display: inline-block; padding: 12px 24px; background: #1E3A5F; border-radius: 6px;">
            Schedule Viewing in Dashboard
          </a>
        </div>
        
        <p><strong>Next Steps:</strong></p>
        <ol>
          <li>Log into your dashboard</li>
          <li>Review the tenant's preferred dates</li>
          <li>Select a date and confirm the viewing</li>
          <li>Contact the tenant to finalize details</li>
        </ol>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 14px; margin: 0;">
            Questions? Contact us at <a href="mailto:support@pezani.com" style="color: #E4B012;">support@pezani.com</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Email template: Payment failed
function getPaymentFailedEmail(
  tenant: any,
  property: any,
  transaction: any
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Failed</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(to right, #DC3545, #C82333); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0;">Payment Failed</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
        <p>Hello ${tenant.full_name || 'there'},</p>
        
        <p>Unfortunately, your payment for the viewing request could not be processed.</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #DC3545;">
          <h2 style="margin-top: 0; color: #1E3A5F;">${property.title}</h2>
          <p style="color: #666; margin-bottom: 10px;">📍 ${property.location}</p>
          <p style="color: #666; margin-bottom: 0;">💰 Viewing Fee: MWK ${transaction.amount.toLocaleString()}</p>
        </div>
        
        <p><strong>What happened?</strong></p>
        <ul>
          <li>No viewing request was created</li>
          <li>No money was deducted from your account</li>
          <li>You can try again by visiting the property page</li>
        </ul>
        
        <div style="background: #E4B012; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <a href="${SITE_URL}/properties/${property.id}" style="color: white; text-decoration: none; font-weight: bold; display: inline-block; padding: 12px 24px; background: #1E3A5F; border-radius: 6px;">
            Try Again
          </a>
        </div>
        
        <p><strong>Common reasons for payment failure:</strong></p>
        <ul>
          <li>Insufficient funds in your mobile money account</li>
          <li>Network connectivity issues</li>
          <li>Payment service temporarily unavailable</li>
        </ul>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 14px; margin: 0;">
            Need help? Contact us at <a href="mailto:support@pezani.com" style="color: #E4B012;">support@pezani.com</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

