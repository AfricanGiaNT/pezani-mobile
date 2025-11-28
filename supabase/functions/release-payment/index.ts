import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the user making the request
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Parse request body
    const { viewing_request_id, confirmed_by } = await req.json()

    if (!viewing_request_id || !confirmed_by) {
      throw new Error('Missing required parameters: viewing_request_id and confirmed_by')
    }

    // Validate confirmed_by is either 'tenant' or 'landlord'
    if (!['tenant', 'landlord'].includes(confirmed_by)) {
      throw new Error('confirmed_by must be either "tenant" or "landlord"')
    }

    // Get viewing request
    const { data: viewingRequest, error: viewingError } = await supabaseClient
      .from('viewing_requests')
      .select('*, transactions(*)')
      .eq('id', viewing_request_id)
      .single()

    if (viewingError || !viewingRequest) {
      throw new Error('Viewing request not found')
    }

    // Verify user is authorized to confirm
    const isAuthorized =
      (confirmed_by === 'tenant' && viewingRequest.tenant_id === user.id) ||
      (confirmed_by === 'landlord' && viewingRequest.landlord_id === user.id)

    if (!isAuthorized) {
      throw new Error('You are not authorized to confirm this viewing')
    }

    // Check if already confirmed
    if (confirmed_by === 'tenant' && viewingRequest.tenant_confirmed) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'You have already confirmed this viewing',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    if (confirmed_by === 'landlord' && viewingRequest.landlord_confirmed) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'You have already confirmed this viewing',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Update confirmation
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (confirmed_by === 'tenant') {
      updateData.tenant_confirmed = true
      updateData.tenant_confirmed_at = new Date().toISOString()
    } else {
      updateData.landlord_confirmed = true
      updateData.landlord_confirmed_at = new Date().toISOString()
    }

    // Update viewing request
    const { data: updatedRequest, error: updateError } = await supabaseClient
      .from('viewing_requests')
      .update(updateData)
      .eq('id', viewing_request_id)
      .select('*')
      .single()

    if (updateError) {
      throw updateError
    }

    // Check if both parties have confirmed
    const bothConfirmed =
      (confirmed_by === 'tenant' && viewingRequest.landlord_confirmed) ||
      (confirmed_by === 'landlord' && viewingRequest.tenant_confirmed)

    let paymentReleased = false

    if (bothConfirmed) {
      // Both parties confirmed - the database trigger will handle payment release
      // and payout creation automatically
      paymentReleased = true
    }

    // Send email notifications
    const emailNotifications = []

    if (confirmed_by === 'tenant') {
      // Notify landlord that tenant confirmed
      emailNotifications.push(
        supabaseClient.functions.invoke('send-email', {
          body: {
            to: viewingRequest.landlord_id,
            subject: 'Tenant Confirmed Viewing',
            template: 'tenant_confirmed_viewing',
            data: {
              viewing_request_id,
              property_id: viewingRequest.property_id,
            },
          },
        })
      )
    } else {
      // Notify tenant that landlord confirmed
      emailNotifications.push(
        supabaseClient.functions.invoke('send-email', {
          body: {
            to: viewingRequest.tenant_id,
            subject: 'Landlord Confirmed Viewing',
            template: 'landlord_confirmed_viewing',
            data: {
              viewing_request_id,
              property_id: viewingRequest.property_id,
            },
          },
        })
      )
    }

    if (bothConfirmed) {
      // Notify both parties that payment has been released
      emailNotifications.push(
        supabaseClient.functions.invoke('send-email', {
          body: {
            to: viewingRequest.tenant_id,
            subject: 'Viewing Completed',
            template: 'viewing_completed_tenant',
            data: {
              viewing_request_id,
              property_id: viewingRequest.property_id,
            },
          },
        })
      )

      emailNotifications.push(
        supabaseClient.functions.invoke('send-email', {
          body: {
            to: viewingRequest.landlord_id,
            subject: 'Payment Released',
            template: 'payment_released_landlord',
            data: {
              viewing_request_id,
              property_id: viewingRequest.property_id,
              amount: viewingRequest.transactions?.[0]?.amount || 0,
            },
          },
        })
      )
    }

    // Wait for email notifications (fire and forget)
    Promise.all(emailNotifications).catch((err) => {
      console.error('Error sending email notifications:', err)
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: bothConfirmed
          ? 'Viewing confirmed by both parties. Payment released to landlord.'
          : 'Confirmation recorded. Waiting for other party to confirm.',
        payment_released: paymentReleased,
        viewing_status: updatedRequest.status,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in release-payment function:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
