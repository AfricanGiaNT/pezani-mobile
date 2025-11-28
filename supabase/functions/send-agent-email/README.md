# Send Agent Email Edge Function

This Supabase Edge Function sends approval or rejection emails to agents when their applications are reviewed by admins.

## Deployment

### Prerequisites

1. Install Supabase CLI (if not already installed)
2. Link your project
3. Set environment variables

### Environment Variables

Set these in your Supabase project dashboard under Settings → Edge Functions → Secrets:

- `RESEND_API_KEY` - Resend API key for sending emails (get from https://resend.com)
- `SITE_URL` - Your frontend URL (e.g., https://yourdomain.com)
- `SUPABASE_URL` - Auto-set by Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Auto-set by Supabase

### Deploy

```bash
supabase functions deploy send-agent-email
```

## Usage

### From Frontend (AgentApprovalPage)

```typescript
// Approve agent
const { data, error } = await supabase.functions.invoke('send-agent-email', {
  body: {
    agentId: 'agent-uuid',
    approved: true
  }
})

// Reject agent
const { data, error } = await supabase.functions.invoke('send-agent-email', {
  body: {
    agentId: 'agent-uuid',
    approved: false,
    rejectionReason: 'Reason for rejection'
  }
})
```

## Request Format

```json
{
  "agentId": "uuid-of-agent",
  "approved": true | false,
  "rejectionReason": "Reason for rejection (required if approved: false)"
}
```

## Response Format

```json
{
  "success": true,
  "message": "Email sent to agent@example.com"
}
```

## Email Templates

### Approval Email
- Subject: "Welcome to Pezani Estates - Your Agent Application Has Been Approved!"
- Includes welcome message, next steps, and dashboard link

### Rejection Email
- Subject: "Pezani Estates - Agent Application Update"
- Includes rejection reason and support contact

## Error Handling

- Returns 400 if `agentId` is missing
- Returns 400 if `rejectionReason` is missing when `approved: false`
- Returns 404 if agent not found
- Returns 500 if email service not configured or fails

## Testing

1. Deploy function
2. Set environment variables
3. Test from AgentApprovalPage:
   - Approve an agent → Check email inbox
   - Reject an agent with reason → Check email inbox
4. Check Supabase Edge Functions logs for errors

