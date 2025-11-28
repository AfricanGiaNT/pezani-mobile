// Supabase Edge Function: Create Viewing Request with Payment
// Deploy with: supabase functions deploy create-viewing-request

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const PAYCHANGU_API_BASE_URL = Deno.env.get('PAYCHANGU_API_BASE_URL') || 'https://api.paychangu.com/v1'
const PAYCHANGU_SECRET_KEY = Deno.env.get('PAYCHANGU_SECRET_KEY') || ''

interface RequestBody {
  property_id: string
  preferred_dates: string[] // ISO date strings
  callback_url?: string
  return_url?: string
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with service role for admin operations
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

    // Create Supabase client for user operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get user profile to verify role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role, status')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Verify user is a tenant
    if (profile.role !== 'tenant') {
      return new Response(
        JSON.stringify({ error: 'Only tenants can request viewings' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Verify user is active
    if (profile.status !== 'active') {
      return new Response(
        JSON.stringify({ error: 'Your account is not active' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const body: RequestBody = await req.json()
    const { property_id, preferred_dates, callback_url, return_url } = body

    if (!property_id || !preferred_dates || preferred_dates.length !== 3) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: property_id and 3 preferred_dates' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get property details
    const { data: property, error: propertyError } = await supabaseAdmin
      .from('properties')
      .select('id, owner_id, viewing_fee, title, status')
      .eq('id', property_id)
      .single()

    if (propertyError || !property) {
      return new Response(
        JSON.stringify({ error: 'Property not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Verify property is available
    if (property.status !== 'available') {
      return new Response(
        JSON.stringify({ error: 'Property is not available for viewing' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Check for duplicate viewing requests
    const { data: existingRequest } = await supabaseAdmin
      .from('viewing_requests')
      .select('id')
      .eq('property_id', property_id)
      .eq('tenant_id', user.id)
      .in('status', ['pending', 'scheduled'])
      .maybeSingle()

    if (existingRequest) {
      return new Response(
        JSON.stringify({ error: 'You already have a pending viewing request for this property' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create viewing request
    const { data: viewingRequest, error: requestError } = await supabaseAdmin
      .from('viewing_requests')
      .insert({
        property_id: property.id,
        tenant_id: user.id,
        landlord_id: property.owner_id,
        preferred_dates: preferred_dates,
        status: 'pending',
      })
      .select()
      .single()

    if (requestError) {
      console.error('Error creating viewing request:', requestError)
      return new Response(
        JSON.stringify({ error: 'Failed to create viewing request' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create transaction record
    const { data: transaction, error: transactionError } = await supabaseAdmin
      .from('transactions')
      .insert({
        viewing_request_id: viewingRequest.id,
        tenant_id: user.id,
        amount: property.viewing_fee,
        payment_status: 'pending',
        escrow_status: 'pending',
      })
      .select()
      .single()

    if (transactionError) {
      console.error('Error creating transaction:', transactionError)
      // Rollback viewing request
      await supabaseAdmin.from('viewing_requests').delete().eq('id', viewingRequest.id)
      return new Response(
        JSON.stringify({ error: 'Failed to create transaction' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Initialize payment with Paychangu
    if (!PAYCHANGU_SECRET_KEY) {
      console.warn('Paychangu secret key not configured')
      return new Response(
        JSON.stringify({
          error: 'Payment service not configured',
          viewing_request_id: viewingRequest.id,
          transaction_id: transaction.id,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get user profile for payment details
    const { data: userProfile } = await supabaseAdmin
      .from('profiles')
      .select('email, full_name, phone')
      .eq('id', user.id)
      .single()

    // Prepare Paychangu payment request
    const paymentRequest = {
      amount: property.viewing_fee,
      currency: 'MWK',
      description: `Viewing fee for ${property.title}`,
      reference: transaction.id, // Use transaction ID as reference
      callback_url: callback_url || `${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/functions/v1/paychangu-webhook`,
      return_url: return_url || `${Deno.env.get('SITE_URL') || 'http://localhost:5173'}/payment/success?reference=${transaction.id}`,
      customer_email: userProfile?.email || user.email,
      customer_phone: userProfile?.phone || undefined,
      customer_name: userProfile?.full_name || undefined,
    }

    // Call Paychangu API
    const paychanguResponse = await fetch(`${PAYCHANGU_API_BASE_URL}/payments/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PAYCHANGU_SECRET_KEY}`,
      },
      body: JSON.stringify(paymentRequest),
    })

    const paychanguData = await paychanguResponse.json()

    if (!paychanguResponse.ok || !paychanguData.payment_url) {
      console.error('Paychangu error:', paychanguData)
      // Update transaction with error
      await supabaseAdmin
        .from('transactions')
        .update({
          payment_status: 'failed',
        })
        .eq('id', transaction.id)

      return new Response(
        JSON.stringify({
          error: 'Failed to initialize payment',
          details: paychanguData.message || 'Payment service error',
          viewing_request_id: viewingRequest.id,
          transaction_id: transaction.id,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Update transaction with Paychangu reference
    await supabaseAdmin
      .from('transactions')
      .update({
        paychangu_reference: paychanguData.reference || paychanguData.payment_id,
      })
      .eq('id', transaction.id)

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        viewing_request_id: viewingRequest.id,
        transaction_id: transaction.id,
        payment_url: paychanguData.payment_url,
        reference: paychanguData.reference || paychanguData.payment_id,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  } catch (error: any) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

