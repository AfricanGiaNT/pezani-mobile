// Supabase Edge Function: Send Agent Approval/Rejection Emails
// Deploy with: supabase functions deploy send-agent-email
// Called from AgentApprovalPage when admin approves or rejects an agent

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''
const SITE_URL = Deno.env.get('SITE_URL') || 'http://localhost:5173'

interface AgentEmailRequest {
  agentId: string
  approved: boolean
  rejectionReason?: string
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
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client
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

    // Parse request
    const { agentId, approved, rejectionReason }: AgentEmailRequest = await req.json()

    if (!agentId) {
      return new Response(
        JSON.stringify({ error: 'Missing agentId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Fetch agent profile
    const { data: agent, error: agentError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, phone, role, status')
      .eq('id', agentId)
      .eq('role', 'agent')
      .single()

    if (agentError || !agent) {
      return new Response(
        JSON.stringify({ error: 'Agent not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!agent.email) {
      return new Response(
        JSON.stringify({ error: 'Agent email not found' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Send appropriate email
    if (approved) {
      await sendAgentApprovalEmail(agent)
    } else {
      if (!rejectionReason) {
        return new Response(
          JSON.stringify({ error: 'Rejection reason required' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }
      await sendAgentRejectionEmail(agent, rejectionReason)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Email sent to ${agent.email}`,
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
    console.error('Agent email function error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

// Send agent approval email
async function sendAgentApprovalEmail(agent: any) {
  if (!RESEND_API_KEY || !agent.email) {
    return
  }

  const emailHtml = getAgentApprovalEmailTemplate(agent)

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Pezani Estates <noreply@pezani.com>', // Update with verified domain
        to: [agent.email],
        subject: 'Welcome to Pezani Estates - Your Agent Application Has Been Approved!',
        html: emailHtml,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Resend API error:', error)
      throw new Error(`Failed to send email: ${error.message}`)
    }

    const data = await response.json()
    console.log('Approval email sent successfully:', data.id)
    return data
  } catch (error) {
    console.error('Error sending approval email:', error)
    throw error
  }
}

// Send agent rejection email
async function sendAgentRejectionEmail(agent: any, reason: string) {
  if (!RESEND_API_KEY || !agent.email) {
    return
  }

  const emailHtml = getAgentRejectionEmailTemplate(agent, reason)

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Pezani Estates <noreply@pezani.com>', // Update with verified domain
        to: [agent.email],
        subject: 'Pezani Estates - Agent Application Update',
        html: emailHtml,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Resend API error:', error)
      throw new Error(`Failed to send email: ${error.message}`)
    }

    const data = await response.json()
    console.log('Rejection email sent successfully:', data.id)
    return data
  } catch (error) {
    console.error('Error sending rejection email:', error)
    throw error
  }
}

// Email template: Agent approval
function getAgentApprovalEmailTemplate(agent: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Agent Application Approved</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(to right, #E4B012, #C29910); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0;">Welcome to Pezani Estates!</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
        <p>Hello ${agent.full_name || 'there'},</p>
        
        <p><strong>Great news!</strong> Your agent application has been approved. You can now start listing properties and helping tenants find their perfect homes.</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #E4B012;">
          <h2 style="margin-top: 0; color: #1E3A5F;">What's Next?</h2>
          <ol style="margin: 0; padding-left: 20px;">
            <li>Log into your dashboard</li>
            <li>Add your first property listing</li>
            <li>Start connecting with tenants</li>
            <li>Earn commissions on successful viewings</li>
          </ol>
        </div>
        
        <div style="background: #E4B012; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <a href="${SITE_URL}/dashboard" style="color: white; text-decoration: none; font-weight: bold; display: inline-block; padding: 12px 24px; background: #1E3A5F; border-radius: 6px;">
            Go to Dashboard
          </a>
        </div>
        
        <p><strong>Important Information:</strong></p>
        <ul>
          <li>You can now list properties on behalf of landlords</li>
          <li>You'll receive notifications when tenants request viewings</li>
          <li>Commissions are paid after successful viewings</li>
          <li>Keep your profile updated with accurate contact information</li>
        </ul>
        
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

// Email template: Agent rejection
function getAgentRejectionEmailTemplate(agent: any, reason: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Agent Application Update</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(to right, #1E3A5F, #152B47); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0;">Application Update</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
        <p>Hello ${agent.full_name || 'there'},</p>
        
        <p>Thank you for your interest in becoming an agent with Pezani Estates. After careful review, we're unable to approve your application at this time.</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #DC3545;">
          <h3 style="margin-top: 0; color: #1E3A5F;">Reason:</h3>
          <p style="color: #666; margin: 0;">${reason}</p>
        </div>
        
        <p>We encourage you to address the concerns mentioned above and consider reapplying in the future. We're always looking for dedicated agents who can help connect tenants with quality properties.</p>
        
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

