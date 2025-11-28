# Release Payment Edge Function

## Purpose
Handles viewing confirmation from either tenant or landlord. When both parties confirm the viewing happened, automatically releases payment from escrow to the landlord/agent.

## Endpoints
- **POST** `/release-payment`

## Request Body
```json
{
  "viewing_request_id": "uuid",
  "confirmed_by": "tenant" | "landlord"
}
```

## Authorization
Requires authentication. User must be either:
- The tenant of the viewing request (if confirming_by is "tenant")
- The landlord/agent of the viewing request (if confirming_by is "landlord")

## Response

### Success (Partial Confirmation)
```json
{
  "success": true,
  "message": "Confirmation recorded. Waiting for other party to confirm.",
  "payment_released": false,
  "viewing_status": "scheduled"
}
```

### Success (Both Confirmed)
```json
{
  "success": true,
  "message": "Viewing confirmed by both parties. Payment released to landlord.",
  "payment_released": true,
  "viewing_status": "completed"
}
```

### Error
```json
{
  "success": false,
  "error": "Error message"
}
```

## Workflow
1. Verify user authorization
2. Check if already confirmed
3. Update viewing_requests table with confirmation
4. If both parties confirmed:
   - Database trigger updates status to "completed"
   - Database trigger updates transaction escrow_status to "released"
   - Database trigger creates payout record
5. Send email notifications

## Database Trigger
The function relies on the `auto_release_payment_on_confirmation` trigger which:
- Detects when both `tenant_confirmed` and `landlord_confirmed` are true
- Updates viewing request status to "completed"
- Updates transaction escrow_status to "released"
- Creates a payout record in the payouts table

## Email Notifications
- When tenant confirms: email sent to landlord
- When landlord confirms: email sent to tenant
- When both confirm: completion emails sent to both parties

## Deployment
```bash
supabase functions deploy release-payment
```

## Testing
```bash
curl -X POST https://your-project.supabase.co/functions/v1/release-payment \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "viewing_request_id": "your-viewing-id",
    "confirmed_by": "tenant"
  }'
```
