# Process Refund Edge Function

## Purpose
Handles refund processing for viewing requests when cancelled by tenant, landlord, or due to disputes.

## Endpoints
- **POST** `/process-refund`

## Request Body
```json
{
  "viewing_request_id": "uuid",
  "refund_reason": "string",
  "refund_amount": 1000.00, // optional, calculated based on policy if not provided
  "cancelled_by": "tenant" | "landlord" | "admin"
}
```

## Authorization
Requires authentication. User must be:
- The tenant (if cancelled_by is "tenant")
- The landlord/agent (if cancelled_by is "landlord")
- An admin (for any cancellation)

## Refund Policy

### Landlord Cancels
- **Refund:** 100% (full refund)
- **Status:** `cancelled_by_landlord`

### Tenant Cancels
- **More than 24 hours before viewing:** 100% refund
- **Less than 24 hours before viewing:** 50% refund
- **After scheduled time:** 0% refund
- **Status:** `cancelled_by_tenant`

### No-Show Disputes
- Handled through admin review
- Status set to `tenant_no_show` or `disputed`

## Response

### Success
```json
{
  "success": true,
  "message": "Refund processed successfully",
  "refund_amount": 5000.00,
  "transaction_id": "uuid",
  "viewing_status": "cancelled_by_tenant"
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
2. Get viewing request and transaction details
3. Calculate refund amount based on policy
4. Call `process_refund` database function
5. Update viewing request status
6. Send email notifications to both parties

## Database Function
Calls the `process_refund(p_viewing_request_id, p_refund_reason, p_refund_amount)` function which:
- Updates transaction table with refund details
- Sets escrow_status to "refunded" or "partially_refunded"
- Records refund amount and reason
- Returns success status

## Email Notifications
- Tenant: Receives refund confirmation with amount
- Landlord/Agent: Receives cancellation notification

## Integration Note
Currently marks refund in database only. In production, integrate with Paychangu refund API:
```typescript
await processPaychanguRefund(transaction.paychangu_reference, finalRefundAmount)
```

## Deployment
```bash
supabase functions deploy process-refund
```

## Testing
```bash
# Landlord cancels (full refund)
curl -X POST https://your-project.supabase.co/functions/v1/process-refund \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "viewing_request_id": "your-viewing-id",
    "refund_reason": "Property no longer available",
    "cancelled_by": "landlord"
  }'

# Tenant cancels
curl -X POST https://your-project.supabase.co/functions/v1/process-refund \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "viewing_request_id": "your-viewing-id",
    "refund_reason": "Changed my mind",
    "cancelled_by": "tenant"
  }'
```

## Error Scenarios
- Transaction not found
- Unauthorized user
- Invalid viewing request ID
- Payment already released
- Database error

## Status Updates
The viewing_request status will be updated to:
- `cancelled_by_landlord` - Landlord/agent cancelled
- `cancelled_by_tenant` - Tenant cancelled
- `disputed` - Conflicting confirmations
- `tenant_no_show` - Tenant didn't show up

