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
    // Create Supabase client with service role for admin operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
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

    // Verify user is authorized (admin, landlord, or system)
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Parse request body
    const { viewing_request_id, refund_reason, refund_amount, cancelled_by, dispute_type } = await req.json()

    if (!viewing_request_id || !refund_reason) {
      throw new Error('Missing required parameters: viewing_request_id and refund_reason')
    }

    // Get viewing request and transaction
    const { data: viewingRequest, error: viewingError } = await supabaseClient
      .from('viewing_requests')
      .select('*, transactions(*), properties(*)')
      .eq('id', viewing_request_id)
      .single()

    if (viewingError || !viewingRequest) {
      throw new Error('Viewing request not found')
    }

    // Verify authorization based on cancellation scenario
    const isLandlord = viewingRequest.landlord_id === user.id
    const isTenant = viewingRequest.tenant_id === user.id
    const isAdmin = profile?.role === 'admin'

    if (cancelled_by === 'landlord' && !isLandlord && !isAdmin) {
      throw new Error('Only landlord or admin can cancel on behalf of landlord')
    }

    if (cancelled_by === 'tenant' && !isTenant && !isAdmin) {
      throw new Error('Only tenant or admin can cancel on behalf of tenant')
    }

    // Get transaction
    const transaction = viewingRequest.transactions?.[0]
    if (!transaction) {
      throw new Error('Transaction not found for this viewing request')
    }

    // Determine refund amount and status based on cancellation policy
    let finalRefundAmount = refund_amount
    let newStatus = 'cancelled_by_tenant'
    let landlordPayout = 0

    if (cancelled_by === 'landlord') {
      // Landlord cancels: Full refund to tenant
      finalRefundAmount = transaction.amount
      newStatus = 'cancelled_by_landlord'
    } else if (cancelled_by === 'tenant') {
      // Tenant cancels: Check timing
      const scheduledDate = new Date(viewingRequest.scheduled_date)
      const now = new Date()
      const hoursUntilViewing = (scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60)

      if (hoursUntilViewing > 24) {
        // More than 24 hours before: Full refund
        finalRefundAmount = transaction.amount
        landlordPayout = 0
      } else if (hoursUntilViewing > 0) {
        // Less than 24 hours before: 50% refund, 50% to landlord
        finalRefundAmount = transaction.amount * 0.5
        landlordPayout = transaction.amount * 0.5
      } else {
        // After scheduled time: No refund
        finalRefundAmount = 0
        landlordPayout = transaction.amount
      }
      newStatus = 'cancelled_by_tenant'
    } else if (dispute_type === 'tenant_no_show') {
      // Landlord reports tenant no-show: Full amount to landlord
      // Tenant has 24h to dispute this
      finalRefundAmount = 0
      landlordPayout = transaction.amount
      newStatus = 'tenant_no_show'
    } else if (dispute_type === 'tenant_dispute_no_show') {
      // Tenant disputes no-show claim within 24h
      // Admin will review and decide
      finalRefundAmount = 0
      landlordPayout = 0
      newStatus = 'disputed'
    }

    // Call database function to process refund
    const { data: refundResult, error: refundError } = await supabaseClient.rpc(
      'process_refund',
      {
        p_viewing_request_id: viewing_request_id,
        p_refund_reason: refund_reason,
        p_refund_amount: finalRefundAmount,
      }
    )

    if (refundError) {
      throw refundError
    }

    // Update viewing request status
    const updateData: any = {
      status: newStatus,
      cancellation_reason: refund_reason,
      cancelled_by,
      updated_at: new Date().toISOString(),
    }

    // Add dispute deadline for no-show scenarios
    if (dispute_type === 'tenant_no_show') {
      const disputeDeadline = new Date()
      disputeDeadline.setHours(disputeDeadline.getHours() + 24)
      updateData.dispute_deadline = disputeDeadline.toISOString()
    }

    await supabaseClient
      .from('viewing_requests')
      .update(updateData)
      .eq('id', viewing_request_id)

    // Create landlord payout if applicable
    if (landlordPayout > 0) {
      await supabaseClient.from('payouts').insert({
        transaction_id: transaction.id,
        landlord_id: viewingRequest.landlord_id,
        amount: landlordPayout,
        payout_method: 'mobile_money', // Default, should be from landlord profile
        status: 'pending',
      })
    }

    // TODO: Integrate with Paychangu refund API
    // For now, we just mark it in the database
    // In production, you would call:
    // await processPaychanguRefund(transaction.paychangu_reference, finalRefundAmount)

    // Send email notifications
    const emailPromises = []

    if (dispute_type === 'tenant_no_show') {
      // Notify tenant of no-show claim with dispute option
      emailPromises.push(
        supabaseClient.functions.invoke('send-email', {
          body: {
            to: viewingRequest.tenant_id,
            subject: 'No-Show Claim - You Have 24h to Dispute',
            template: 'tenant_no_show_claim',
            data: {
              viewing_request_id,
              property_title: viewingRequest.properties.title,
              dispute_deadline: updateData.dispute_deadline,
              reason: refund_reason,
            },
          },
        })
      )

      // Notify landlord that claim has been submitted
      emailPromises.push(
        supabaseClient.functions.invoke('send-email', {
          body: {
            to: viewingRequest.landlord_id,
            subject: 'No-Show Claim Submitted',
            template: 'landlord_no_show_submitted',
            data: {
              viewing_request_id,
              property_title: viewingRequest.properties.title,
              payout_amount: landlordPayout,
            },
          },
        })
      )
    } else if (dispute_type === 'tenant_dispute_no_show') {
      // Notify admin of dispute
      emailPromises.push(
        supabaseClient.functions.invoke('send-email', {
          body: {
            to: 'admin@pezani.com', // Replace with actual admin email
            subject: 'Dispute Requires Review',
            template: 'admin_dispute_notification',
            data: {
              viewing_request_id,
              property_title: viewingRequest.properties.title,
              tenant_reason: refund_reason,
            },
          },
        })
      )

      // Notify both parties
      emailPromises.push(
        supabaseClient.functions.invoke('send-email', {
          body: {
            to: viewingRequest.tenant_id,
            subject: 'Dispute Submitted for Review',
            template: 'tenant_dispute_submitted',
            data: {
              viewing_request_id,
              property_title: viewingRequest.properties.title,
            },
          },
        })
      )
    } else {
      // Standard cancellation notifications
      // Notify tenant
      emailPromises.push(
        supabaseClient.functions.invoke('send-email', {
          body: {
            to: viewingRequest.tenant_id,
            subject: 'Viewing Cancelled - Refund Processed',
            template: 'viewing_cancelled_tenant',
            data: {
              viewing_request_id,
              property_title: viewingRequest.properties.title,
              cancelled_by,
              refund_amount: finalRefundAmount,
              reason: refund_reason,
            },
          },
        })
      )

      // Notify landlord
      emailPromises.push(
        supabaseClient.functions.invoke('send-email', {
          body: {
            to: viewingRequest.landlord_id,
            subject: 'Viewing Cancelled',
            template: 'viewing_cancelled_landlord',
            data: {
              viewing_request_id,
              property_title: viewingRequest.properties.title,
              cancelled_by,
              reason: refund_reason,
              landlord_payout: landlordPayout,
            },
          },
        })
      )
    }

    // Wait for emails (fire and forget)
    Promise.all(emailPromises).catch((err) => {
      console.error('Error sending email notifications:', err)
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: dispute_type === 'tenant_no_show' 
          ? 'No-show claim submitted. Tenant has 24h to dispute.'
          : dispute_type === 'tenant_dispute_no_show'
          ? 'Dispute submitted for admin review.'
          : 'Refund processed successfully',
        refund_amount: finalRefundAmount,
        landlord_payout: landlordPayout,
        transaction_id: transaction.id,
        viewing_status: newStatus,
        dispute_deadline: updateData.dispute_deadline || null,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in process-refund function:', error)
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

