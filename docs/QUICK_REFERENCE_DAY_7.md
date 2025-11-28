# Quick Reference - Day 7 Implementation

Fast reference guide for Day 7 features. For detailed docs, see other documentation files.

---

## 🚀 Edge Functions

### release-payment
```typescript
// Tenant confirms
await supabase.functions.invoke('release-payment', {
  body: {
    viewing_request_id: 'xxx',
    confirmed_by: 'tenant'
  }
})

// Landlord confirms
await supabase.functions.invoke('release-payment', {
  body: {
    viewing_request_id: 'xxx',
    confirmed_by: 'landlord'
  }
})
```

---

### process-refund

**Landlord Cancels:**
```typescript
await supabase.functions.invoke('process-refund', {
  body: {
    viewing_request_id: 'xxx',
    refund_reason: 'Property no longer available',
    cancelled_by: 'landlord'
  }
})
// Result: 100% refund to tenant
```

**Tenant Cancels:**
```typescript
await supabase.functions.invoke('process-refund', {
  body: {
    viewing_request_id: 'xxx',
    refund_reason: 'Schedule conflict',
    cancelled_by: 'tenant'
  }
})
// Result: Time-based refund (100%/50%/0%)
```

**Report No-Show:**
```typescript
await supabase.functions.invoke('process-refund', {
  body: {
    viewing_request_id: 'xxx',
    refund_reason: 'Tenant did not show up',
    cancelled_by: 'landlord',
    dispute_type: 'tenant_no_show'
  }
})
// Result: 24h dispute window, then payment to landlord
```

**Dispute No-Show:**
```typescript
await supabase.functions.invoke('process-refund', {
  body: {
    viewing_request_id: 'xxx',
    refund_reason: 'I arrived on time with proof',
    cancelled_by: 'tenant',
    dispute_type: 'tenant_dispute_no_show'
  }
})
// Result: Status = 'disputed', admin reviews
```

---

## 🎨 UI Components

### CancellationModal
```tsx
import { CancellationModal } from '@/components/property'

<CancellationModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  viewingRequest={viewing}
  userRole="tenant" // or "landlord"
  onSuccess={() => refetchViewings()}
/>
```

---

### NoShowReportModal
```tsx
import { NoShowReportModal } from '@/components/property'

<NoShowReportModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  viewingRequest={viewing}
  onSuccess={() => refetchViewings()}
/>
```

---

### DisputeNoShowModal
```tsx
import { DisputeNoShowModal } from '@/components/property'

// Only show if status is 'tenant_no_show' and within 24h
<DisputeNoShowModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  viewingRequest={viewing}
  onSuccess={() => refetchViewings()}
/>
```

---

### ViewingStatusBadge
```tsx
import { ViewingStatusBadge } from '@/components/property'

<ViewingStatusBadge
  status={viewing.status}
  tenantConfirmed={viewing.tenant_confirmed}
  landlordConfirmed={viewing.landlord_confirmed}
  disputeDeadline={viewing.dispute_deadline}
/>
```

---

## 📊 Database Queries

### Get Viewing with Full Details
```typescript
const { data } = await supabase
  .from('viewing_requests')
  .select(`
    *,
    properties (title, location),
    transactions (amount, escrow_status),
    tenant:profiles!tenant_id (full_name, phone),
    landlord:profiles!landlord_id (full_name, phone)
  `)
  .eq('id', viewingId)
  .single()
```

---

### Get Pending Payouts (Admin)
```typescript
const { data } = await supabase
  .from('payouts')
  .select(`
    *,
    landlord:profiles!landlord_id (full_name, phone),
    transactions (
      amount,
      viewing_requests (
        properties (title, location)
      )
    )
  `)
  .eq('status', 'pending')
  .order('created_at', { ascending: false })
```

---

### Get Disputed Viewings (Admin)
```typescript
const { data } = await supabase
  .from('viewing_requests')
  .select(`
    *,
    properties (title, location),
    tenant:profiles!tenant_id (full_name, phone),
    landlord:profiles!landlord_id (full_name, phone),
    transactions (amount)
  `)
  .eq('status', 'disputed')
  .order('created_at', { ascending: false })
```

---

## 💰 Refund Policy

| Scenario | Tenant Gets | Landlord Gets |
|----------|-------------|---------------|
| Landlord cancels | 100% | 0% |
| Tenant cancels >24h | 100% | 0% |
| Tenant cancels <24h | 50% | 50% |
| Tenant cancels (late) | 0% | 100% |
| No-show (no dispute) | 0% | 100% |
| No-show (disputed) | TBD | TBD |

---

## 📍 Routes

| Route | Component | Access |
|-------|-----------|--------|
| `/admin/payouts` | AdminPayoutsPage | Admin only |
| `/tenant/dashboard` | TenantDashboard | Tenant only |
| `/landlord/dashboard` | LandlordDashboard | Landlord/Agent only |

---

## 🔔 Viewing Statuses

| Status | Color | Icon | Meaning |
|--------|-------|------|---------|
| `pending` | Yellow | Clock | Awaiting landlord response |
| `scheduled` | Gray/Blue/Green | Calendar/Clock/Check | Based on confirmations |
| `completed` | Green | CheckCircle | Both confirmed |
| `cancelled_by_landlord` | Orange | XCircle | Landlord cancelled |
| `cancelled_by_tenant` | Orange | Ban | Tenant cancelled |
| `tenant_no_show` | Red | UserX | No-show reported, can dispute |
| `disputed` | Purple | AlertTriangle | Under admin review |
| `expired` | Gray | AlertCircle | No confirmations after 72h |

---

## ⏰ Time Rules

| Action | Timing | Result |
|--------|--------|--------|
| Dual confirmation | Within 72h of viewing | Payment released |
| Single confirmation | After 72h | Status = 'disputed' |
| No confirmation | After 72h | Status = 'expired' |
| Tenant cancels | >24h before | 100% refund |
| Tenant cancels | <24h before | 50% refund |
| No-show dispute | Within 24h of claim | Status = 'disputed' |
| No-show dispute | After 24h | Payment to landlord |

---

## 🔧 Helper Functions

### Check if Can Dispute
```typescript
const canDispute = (viewing: ViewingRequest) => {
  return (
    viewing.status === 'tenant_no_show' &&
    viewing.dispute_deadline &&
    new Date(viewing.dispute_deadline) > new Date()
  )
}
```

---

### Check if Can Report No-Show
```typescript
const canReportNoShow = (viewing: ViewingRequest) => {
  return (
    viewing.status === 'scheduled' &&
    viewing.scheduled_date &&
    new Date(viewing.scheduled_date) < new Date() &&
    !viewing.tenant_confirmed
  )
}
```

---

### Check if Can Cancel
```typescript
const canCancel = (viewing: ViewingRequest) => {
  return ['pending', 'scheduled'].includes(viewing.status)
}
```

---

### Calculate Refund Preview
```typescript
const calculateRefund = (viewing: ViewingRequest, userRole: string) => {
  if (userRole === 'landlord') return 100 // Full refund
  
  if (!viewing.scheduled_date) return 100
  
  const hoursUntil = (
    new Date(viewing.scheduled_date).getTime() - new Date().getTime()
  ) / (1000 * 60 * 60)
  
  if (hoursUntil > 24) return 100
  if (hoursUntil > 0) return 50
  return 0
}
```

---

## 📧 Email Templates Needed

1. `viewing_cancelled_tenant` - Tenant receives when cancelled
2. `viewing_cancelled_landlord` - Landlord receives when cancelled
3. `tenant_no_show_claim` - Tenant when no-show reported
4. `landlord_no_show_submitted` - Landlord when claim submitted
5. `admin_dispute_notification` - Admin when dispute filed
6. `tenant_dispute_submitted` - Tenant when dispute submitted

---

## 🐛 Common Issues

**Payment not releasing:**
- Check both confirmations are TRUE
- Verify transaction escrow_status is 'held'
- Check Edge Function logs

**Refund amount wrong:**
- Verify scheduled_date is correct
- Check current time calculation
- Review refund logic in Edge Function

**Dispute button not showing:**
- Status must be 'tenant_no_show'
- dispute_deadline must exist and be future
- Check conditional rendering

---

## 📞 URLs

**Supabase Dashboard:**
https://supabase.com/dashboard/project/yalbenqwotubsasutniv

**Edge Functions:**
- release-payment: `/functions/v1/release-payment`
- process-refund: `/functions/v1/process-refund`

---

## ✅ Pre-Launch Checklist

- [ ] Integrate components into Tenant Dashboard
- [ ] Integrate components into Landlord Dashboard
- [ ] Create Admin Disputes page
- [ ] Set up email templates
- [ ] Configure cron job (optional)
- [ ] Test all scenarios end-to-end
- [ ] Load test Edge Functions
- [ ] Review RLS policies
- [ ] Check email delivery
- [ ] Verify payment flows

---

**Last Updated:** November 28, 2025  
**Version:** 1.0  
**Day 7 Status:** ✅ Complete

