# Payment Escrow Integration Guide

Quick reference for integrating the payment escrow and payout system into the Pezani Estates platform.

---

## Overview

The payment escrow system ensures secure handling of viewing fees through a dual-confirmation process:
1. Tenant pays viewing fee → Payment held in escrow
2. Viewing happens
3. Both parties confirm → Payment released to landlord
4. Payout created → Admin processes payout

---

## Frontend Integration

### 1. Viewing Confirmation Button (Tenant Dashboard)

Add to your tenant viewing requests component:

```tsx
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'

const handleConfirmViewing = async (viewingRequestId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('release-payment', {
      body: {
        viewing_request_id: viewingRequestId,
        confirmed_by: 'tenant'
      }
    })

    if (error) throw error

    if (data.payment_released) {
      toast.success('Viewing confirmed! Payment has been released.')
    } else {
      toast.success('Confirmation recorded. Waiting for landlord to confirm.')
    }

    // Refresh viewing requests list
    refetch()
  } catch (error) {
    console.error('Error confirming viewing:', error)
    toast.error('Failed to confirm viewing')
  }
}

// In your JSX:
<Button onClick={() => handleConfirmViewing(viewing.id)}>
  ✓ Confirm Viewing Happened
</Button>
```

---

### 2. Viewing Confirmation Button (Landlord Dashboard)

Add to your landlord viewing requests component:

```tsx
const handleConfirmViewing = async (viewingRequestId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('release-payment', {
      body: {
        viewing_request_id: viewingRequestId,
        confirmed_by: 'landlord'
      }
    })

    if (error) throw error

    if (data.payment_released) {
      toast.success('Payment released! Check payouts section.')
    } else {
      toast.success('Confirmation recorded. Waiting for tenant to confirm.')
    }

    refetch()
  } catch (error) {
    console.error('Error confirming viewing:', error)
    toast.error('Failed to confirm viewing')
  }
}
```

---

### 3. Cancellation Handler (Landlord Dashboard)

```tsx
const handleCancelViewing = async (viewingRequestId: string) => {
  const reason = prompt('Please provide a reason for cancellation:')
  
  if (!reason) {
    toast.error('Cancellation reason is required')
    return
  }

  try {
    const { data, error } = await supabase.functions.invoke('process-refund', {
      body: {
        viewing_request_id: viewingRequestId,
        refund_reason: reason,
        cancelled_by: 'landlord'
      }
    })

    if (error) throw error

    toast.success(`Viewing cancelled. Tenant will receive ${data.refund_amount} MWK refund.`)
    refetch()
  } catch (error) {
    console.error('Error cancelling viewing:', error)
    toast.error('Failed to cancel viewing')
  }
}
```

---

### 4. Cancellation Handler (Tenant Dashboard)

```tsx
const handleCancelViewing = async (viewingRequestId: string) => {
  const confirmed = confirm('Are you sure you want to cancel this viewing? Refund policy applies.')
  
  if (!confirmed) return

  const reason = prompt('Please provide a reason for cancellation:')
  
  if (!reason) {
    toast.error('Cancellation reason is required')
    return
  }

  try {
    const { data, error } = await supabase.functions.invoke('process-refund', {
      body: {
        viewing_request_id: viewingRequestId,
        refund_reason: reason,
        cancelled_by: 'tenant'
      }
    })

    if (error) throw error

    toast.success(`Viewing cancelled. You will receive ${data.refund_amount} MWK refund.`)
    refetch()
  } catch (error) {
    console.error('Error cancelling viewing:', error)
    toast.error('Failed to cancel viewing')
  }
}
```

---

## Database Queries

### 1. Get Viewing Requests with Confirmation Status

```typescript
const { data, error } = await supabase
  .from('viewing_requests')
  .select(`
    *,
    properties (title, location),
    transactions (amount, escrow_status, payment_status),
    tenant:profiles!tenant_id (full_name, phone),
    landlord:profiles!landlord_id (full_name, phone)
  `)
  .eq('tenant_id', userId) // or landlord_id
  .order('created_at', { ascending: false })
```

---

### 2. Get Pending Payouts (Landlord View)

```typescript
const { data, error } = await supabase
  .from('payouts')
  .select(`
    *,
    transactions (
      amount,
      viewing_requests (
        property_id,
        properties (title, location)
      )
    )
  `)
  .eq('landlord_id', userId)
  .eq('status', 'pending')
  .order('created_at', { ascending: false })
```

---

## UI States to Handle

### Viewing Request Status Display

```tsx
const getStatusBadge = (viewing: ViewingRequest) => {
  switch (viewing.status) {
    case 'pending':
      return <Badge color="yellow">⏳ Pending Response</Badge>
    case 'scheduled':
      if (viewing.tenant_confirmed && viewing.landlord_confirmed) {
        return <Badge color="green">✅ Completed</Badge>
      } else if (viewing.tenant_confirmed || viewing.landlord_confirmed) {
        return <Badge color="blue">⏳ Waiting for Confirmation</Badge>
      } else {
        return <Badge color="gray">📅 Scheduled</Badge>
      }
    case 'completed':
      return <Badge color="green">✅ Completed</Badge>
    case 'disputed':
      return <Badge color="red">⚠️ Disputed</Badge>
    case 'expired':
      return <Badge color="gray">⏰ Expired</Badge>
    case 'cancelled_by_landlord':
      return <Badge color="orange">🚫 Cancelled by Landlord</Badge>
    case 'cancelled_by_tenant':
      return <Badge color="orange">🚫 Cancelled by Tenant</Badge>
    case 'tenant_no_show':
      return <Badge color="red">❌ Tenant No-Show</Badge>
    default:
      return <Badge color="gray">{viewing.status}</Badge>
  }
}
```

---

### Confirmation Button Visibility

```tsx
const showConfirmButton = (viewing: ViewingRequest, userRole: string) => {
  // Only show if scheduled and viewing date has passed
  if (viewing.status !== 'scheduled') return false
  if (!viewing.scheduled_date) return false
  if (new Date(viewing.scheduled_date) > new Date()) return false
  
  // Check if user already confirmed
  if (userRole === 'tenant' && viewing.tenant_confirmed) return false
  if (userRole === 'landlord' && viewing.landlord_confirmed) return false
  
  return true
}
```

---

## Cron Job Setup (Optional)

To automatically check and update viewing statuses:

### 1. Create Supabase Cron Job (Paid Plans Only)

```sql
-- This requires Supabase Pro plan with pg_cron extension

SELECT cron.schedule(
  'check-viewing-confirmations',
  '0 * * * *', -- Run every hour
  $$SELECT check_viewing_confirmations()$$
);
```

### 2. Alternative: External Cron Service

Use services like GitHub Actions, Vercel Cron, or Render Cron Jobs:

```typescript
// api/cron/check-confirmations.ts
export default async function handler(req: Request) {
  // Verify cron secret
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { data, error } = await supabase.rpc('check_viewing_confirmations')
  
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 })
}
```

---

## Error Handling

### Common Errors and Solutions

#### 1. Unauthorized Error
```typescript
if (error.message.includes('Unauthorized')) {
  toast.error('You are not authorized to perform this action')
  // Redirect to login or show appropriate message
}
```

#### 2. Already Confirmed
```typescript
if (error.message.includes('already confirmed')) {
  toast.info('You have already confirmed this viewing')
  // Refresh the list to show updated status
}
```

#### 3. Transaction Not Found
```typescript
if (error.message.includes('Transaction not found')) {
  toast.error('Payment record not found. Please contact support.')
  // Log error for admin review
}
```

---

## Testing Flow

### 1. Happy Path
1. Tenant requests viewing → Pays fee
2. Landlord schedules viewing
3. Viewing happens
4. Tenant clicks "Confirm" → Status shows "Waiting for landlord"
5. Landlord clicks "Confirm" → Status changes to "Completed"
6. Payment released → Payout created
7. Admin processes payout

### 2. Cancellation by Landlord
1. Tenant requests viewing → Pays fee
2. Landlord cancels → Full refund processed
3. Tenant notified via email

### 3. Cancellation by Tenant (Late)
1. Tenant requests viewing → Pays fee
2. Tenant cancels <24h before → 50% refund
3. Both parties notified

### 4. No Confirmation (72h+)
1. Viewing scheduled but no confirmations
2. After 72h → Status changes to "Expired"
3. Admin reviews and decides on refund

---

## Admin Actions

### Process Payout
1. Navigate to `/admin/payouts`
2. Click "Mark as Processed" on pending payout
3. Enter transfer reference number
4. Add optional notes
5. Payout status changes to "Completed"

### Export Payouts
1. Filter by status (Pending/Completed/All)
2. Click "Export CSV"
3. CSV downloads with all payout details

---

## Security Checklist

- [ ] RLS policies enabled on all tables
- [ ] Edge Functions verify user authorization
- [ ] Service role key used only where necessary
- [ ] Email notifications don't expose sensitive data
- [ ] Payment amounts validated before refund
- [ ] Admin actions logged with processor ID

---

## Monitoring

### Key Metrics to Track
1. **Average confirmation time:** How long until both parties confirm
2. **Dispute rate:** Percentage of viewings marked as disputed
3. **Refund rate:** Percentage of viewings that result in refunds
4. **No-show rate:** Percentage of tenant no-shows
5. **Payout processing time:** Time from release to admin processing

### Queries for Analytics

```sql
-- Average time to dual confirmation
SELECT AVG(
  EXTRACT(EPOCH FROM (
    GREATEST(tenant_confirmed_at, landlord_confirmed_at) - created_at
  )) / 3600
) as avg_hours_to_confirm
FROM viewing_requests
WHERE status = 'completed';

-- Dispute rate
SELECT 
  COUNT(*) FILTER (WHERE status = 'disputed') * 100.0 / COUNT(*) as dispute_rate
FROM viewing_requests
WHERE status IN ('completed', 'disputed', 'expired');
```

---

## Troubleshooting

### Payment Not Released After Both Confirmations
1. Check database trigger is enabled:
   ```sql
   SELECT tgname, tgenabled 
   FROM pg_trigger 
   WHERE tgname = 'trigger_auto_release_payment';
   ```
2. Verify both confirmations are TRUE:
   ```sql
   SELECT tenant_confirmed, landlord_confirmed, status
   FROM viewing_requests
   WHERE id = 'viewing-id';
   ```
3. Check transaction escrow_status:
   ```sql
   SELECT escrow_status
   FROM transactions
   WHERE viewing_request_id = 'viewing-id';
   ```

### Refund Not Processing
1. Check if transaction exists
2. Verify user authorization
3. Check for existing refund
4. Review Edge Function logs in Supabase dashboard

---

## Support

For issues or questions:
1. Check Edge Function logs in Supabase Dashboard
2. Review database logs for trigger execution
3. Test with Postman/curl to isolate frontend issues
4. Check email delivery in Supabase logs

---

**Last Updated:** November 28, 2025  
**Version:** 1.0

