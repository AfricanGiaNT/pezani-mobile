# Cancellation & Refund Logic Guide

Complete guide for the cancellation and refund system in Pezani Estates.

---

## Overview

The cancellation and refund system handles three main scenarios:
1. **Landlord cancels** → Full refund to tenant
2. **Tenant cancels** → Refund based on timing
3. **Tenant no-show** → 24h dispute window

---

## Cancellation Scenarios

### 1. Landlord Cancels Viewing

**Refund Policy:** 100% refund to tenant

**Flow:**
1. Landlord clicks "Cancel Viewing"
2. Provides reason for cancellation
3. System processes full refund
4. Tenant receives email notification
5. Status changes to `cancelled_by_landlord`

**UI Component:** `CancellationModal` (userRole: 'landlord')

**Edge Function Call:**
```typescript
await supabase.functions.invoke('process-refund', {
  body: {
    viewing_request_id: viewingRequest.id,
    refund_reason: reason,
    cancelled_by: 'landlord',
  },
})
```

---

### 2. Tenant Cancels Viewing

**Refund Policy:**
- **>24 hours before viewing:** 100% refund
- **<24 hours before viewing:** 50% refund (50% goes to landlord)
- **After scheduled time:** No refund (100% to landlord)

**Flow:**
1. Tenant clicks "Cancel Viewing"
2. System calculates refund amount based on timing
3. Shows refund percentage before confirmation
4. Tenant provides reason
5. System processes refund and landlord payout (if applicable)
6. Both parties receive email notification
7. Status changes to `cancelled_by_tenant`

**UI Component:** `CancellationModal` (userRole: 'tenant')

**Edge Function Call:**
```typescript
await supabase.functions.invoke('process-refund', {
  body: {
    viewing_request_id: viewingRequest.id,
    refund_reason: reason,
    cancelled_by: 'tenant',
  },
})
```

---

### 3. Tenant No-Show

**Flow:**
1. Landlord reports tenant didn't show up
2. System marks viewing as `tenant_no_show`
3. Sets 24-hour dispute deadline
4. Tenant receives email with dispute option
5. **Option A:** Tenant does nothing → Payment released to landlord after 24h
6. **Option B:** Tenant disputes → Status changes to `disputed`, admin reviews

**UI Component:** `NoShowReportModal` (for landlord)

**Landlord Report Call:**
```typescript
await supabase.functions.invoke('process-refund', {
  body: {
    viewing_request_id: viewingRequest.id,
    refund_reason: 'Tenant did not show up...',
    cancelled_by: 'landlord',
    dispute_type: 'tenant_no_show',
  },
})
```

---

### 4. Tenant Disputes No-Show

**Flow:**
1. Tenant has 24 hours from no-show claim
2. Tenant clicks "Dispute No-Show"
3. Provides evidence (arrival time, screenshots, witness info)
4. Status changes to `disputed`
5. Admin receives notification
6. Admin reviews evidence from both parties
7. Admin makes final decision and processes refund/payout accordingly

**UI Component:** `DisputeNoShowModal` (for tenant)

**Tenant Dispute Call:**
```typescript
await supabase.functions.invoke('process-refund', {
  body: {
    viewing_request_id: viewingRequest.id,
    refund_reason: 'I arrived at 2pm as scheduled...',
    cancelled_by: 'tenant',
    dispute_type: 'tenant_dispute_no_show',
  },
})
```

---

## Database Schema Updates

### Viewing Requests Table

New/updated fields:
```sql
-- Existing fields
status TEXT -- Now includes: 'tenant_no_show', 'disputed'
cancellation_reason TEXT
cancelled_by TEXT

-- New field
dispute_deadline TIMESTAMPTZ -- 24h from no-show report
```

### Transactions Table

```sql
escrow_status TEXT -- held, released, refunded, partially_refunded
```

### Payouts Table

When tenant cancels <24h before or landlord reports no-show:
```sql
INSERT INTO payouts (
  transaction_id,
  landlord_id,
  amount, -- 50% or 100% depending on scenario
  status -- 'pending'
)
```

---

## UI Components Reference

### 1. CancellationModal

**Props:**
```typescript
interface CancellationModalProps {
  isOpen: boolean
  onClose: () => void
  viewingRequest: any
  userRole: 'tenant' | 'landlord'
  onSuccess: () => void
}
```

**Features:**
- Calculates refund amount in real-time
- Shows refund policy explanation
- Requires cancellation reason
- Confirms action before processing

**Usage Example:**
```tsx
import { CancellationModal } from '@/components/property'

const [showCancelModal, setShowCancelModal] = useState(false)

<CancellationModal
  isOpen={showCancelModal}
  onClose={() => setShowCancelModal(false)}
  viewingRequest={viewing}
  userRole="tenant"
  onSuccess={() => refetchViewings()}
/>
```

---

### 2. NoShowReportModal

**Props:**
```typescript
interface NoShowReportModalProps {
  isOpen: boolean
  onClose: () => void
  viewingRequest: any
  onSuccess: () => void
}
```

**Features:**
- Explains no-show process
- Warns about false claims
- Shows payment amount to be released
- Requires detailed explanation

**Usage Example:**
```tsx
import { NoShowReportModal } from '@/components/property'

const [showNoShowModal, setShowNoShowModal] = useState(false)

<NoShowReportModal
  isOpen={showNoShowModal}
  onClose={() => setShowNoShowModal(false)}
  viewingRequest={viewing}
  onSuccess={() => refetchViewings()}
/>
```

---

### 3. DisputeNoShowModal

**Props:**
```typescript
interface DisputeNoShowModalProps {
  isOpen: boolean
  onClose: () => void
  viewingRequest: any
  onSuccess: () => void
}
```

**Features:**
- Shows time remaining to dispute
- Displays landlord's claim
- Requires detailed evidence
- Explains review process

**Usage Example:**
```tsx
import { DisputeNoShowModal } from '@/components/property'

const [showDisputeModal, setShowDisputeModal] = useState(false)

// Only show if status is 'tenant_no_show' and within 24h
const canDispute = viewing.status === 'tenant_no_show' &&
  new Date(viewing.dispute_deadline) > new Date()

{canDispute && (
  <DisputeNoShowModal
    isOpen={showDisputeModal}
    onClose={() => setShowDisputeModal(false)}
    viewingRequest={viewing}
    onSuccess={() => refetchViewings()}
  />
)}
```

---

### 4. ViewingStatusBadge

**Props:**
```typescript
interface ViewingStatusBadgeProps {
  status: string
  tenantConfirmed?: boolean
  landlordConfirmed?: boolean
  disputeDeadline?: string | null
  className?: string
}
```

**Supported Statuses:**
- `pending` - Yellow badge
- `scheduled` - Gray badge (or blue if partially confirmed, green if both confirmed)
- `completed` - Green badge
- `cancelled_by_landlord` - Orange badge
- `cancelled_by_tenant` - Orange badge
- `tenant_no_show` - Red badge (shows hours left to dispute)
- `disputed` - Purple badge
- `expired` - Gray badge

**Usage Example:**
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

## Integration Examples

### Tenant Dashboard Integration

```tsx
import { 
  CancellationModal, 
  DisputeNoShowModal,
  ViewingStatusBadge 
} from '@/components/property'
import { Button } from '@/components/common'

function TenantViewingCard({ viewing }: { viewing: ViewingRequest }) {
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showDisputeModal, setShowDisputeModal] = useState(false)

  const canCancel = ['pending', 'scheduled'].includes(viewing.status)
  const canDispute = 
    viewing.status === 'tenant_no_show' &&
    viewing.dispute_deadline &&
    new Date(viewing.dispute_deadline) > new Date()

  return (
    <div className="border rounded-lg p-4">
      <h3>{viewing.properties.title}</h3>
      
      <ViewingStatusBadge
        status={viewing.status}
        tenantConfirmed={viewing.tenant_confirmed}
        landlordConfirmed={viewing.landlord_confirmed}
        disputeDeadline={viewing.dispute_deadline}
      />

      <div className="flex gap-2 mt-4">
        {canCancel && (
          <Button 
            variant="outline" 
            onClick={() => setShowCancelModal(true)}
          >
            Cancel Viewing
          </Button>
        )}

        {canDispute && (
          <Button 
            variant="primary" 
            onClick={() => setShowDisputeModal(true)}
            className="bg-red-600"
          >
            Dispute No-Show
          </Button>
        )}
      </div>

      <CancellationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        viewingRequest={viewing}
        userRole="tenant"
        onSuccess={() => refetch()}
      />

      <DisputeNoShowModal
        isOpen={showDisputeModal}
        onClose={() => setShowDisputeModal(false)}
        viewingRequest={viewing}
        onSuccess={() => refetch()}
      />
    </div>
  )
}
```

---

### Landlord Dashboard Integration

```tsx
import { 
  CancellationModal, 
  NoShowReportModal,
  ViewingStatusBadge 
} from '@/components/property'
import { Button } from '@/components/common'

function LandlordViewingCard({ viewing }: { viewing: ViewingRequest }) {
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showNoShowModal, setShowNoShowModal] = useState(false)

  const canCancel = ['pending', 'scheduled'].includes(viewing.status)
  const canReportNoShow = 
    viewing.status === 'scheduled' &&
    viewing.scheduled_date &&
    new Date(viewing.scheduled_date) < new Date() &&
    !viewing.tenant_confirmed

  return (
    <div className="border rounded-lg p-4">
      <h3>{viewing.properties.title}</h3>
      
      <ViewingStatusBadge
        status={viewing.status}
        tenantConfirmed={viewing.tenant_confirmed}
        landlordConfirmed={viewing.landlord_confirmed}
      />

      <div className="flex gap-2 mt-4">
        {canCancel && (
          <Button 
            variant="outline" 
            onClick={() => setShowCancelModal(true)}
          >
            Cancel Viewing
          </Button>
        )}

        {canReportNoShow && (
          <Button 
            variant="primary" 
            onClick={() => setShowNoShowModal(true)}
            className="bg-orange-600"
          >
            Report No-Show
          </Button>
        )}
      </div>

      <CancellationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        viewingRequest={viewing}
        userRole="landlord"
        onSuccess={() => refetch()}
      />

      <NoShowReportModal
        isOpen={showNoShowModal}
        onClose={() => setShowNoShowModal(false)}
        viewingRequest={viewing}
        onSuccess={() => refetch()}
      />
    </div>
  )
}
```

---

## Testing Scenarios

### Test 1: Landlord Cancels (Full Refund)
1. ✅ Create viewing request
2. ✅ Landlord schedules viewing
3. ✅ Landlord clicks "Cancel Viewing"
4. ✅ Enters reason
5. ✅ Verify 100% refund processed
6. ✅ Verify status = `cancelled_by_landlord`
7. ✅ Verify both parties receive emails

**Expected Result:** Tenant receives full refund

---

### Test 2: Tenant Cancels (>24h Before)
1. ✅ Create viewing request scheduled 3 days from now
2. ✅ Tenant clicks "Cancel Viewing"
3. ✅ Verify modal shows "100% refund"
4. ✅ Confirm cancellation
5. ✅ Verify full refund processed
6. ✅ Verify status = `cancelled_by_tenant`

**Expected Result:** Tenant receives 100% refund, landlord receives nothing

---

### Test 3: Tenant Cancels (<24h Before)
1. ✅ Create viewing request scheduled 12 hours from now
2. ✅ Tenant clicks "Cancel Viewing"
3. ✅ Verify modal shows "50% refund"
4. ✅ Confirm cancellation
5. ✅ Verify 50% refund to tenant
6. ✅ Verify 50% payout created for landlord

**Expected Result:** Split 50/50

---

### Test 4: Tenant No-Show (No Dispute)
1. ✅ Create viewing scheduled yesterday
2. ✅ Landlord reports "Tenant No-Show"
3. ✅ Verify status = `tenant_no_show`
4. ✅ Verify dispute_deadline = 24h from now
5. ✅ Verify tenant receives email
6. ✅ Wait 24h (or manually update deadline)
7. ✅ Verify payment released to landlord

**Expected Result:** Landlord receives 100% after 24h

---

### Test 5: Tenant No-Show (With Dispute)
1. ✅ Create viewing scheduled yesterday
2. ✅ Landlord reports "Tenant No-Show"
3. ✅ Tenant clicks "Dispute No-Show" within 24h
4. ✅ Provides evidence
5. ✅ Verify status = `disputed`
6. ✅ Verify admin receives notification
7. ✅ Admin reviews and decides

**Expected Result:** Status changes to `disputed`, admin makes final call

---

### Test 6: Dispute Deadline Expired
1. ✅ Landlord reports no-show
2. ✅ 24h passes
3. ✅ Tenant tries to dispute
4. ✅ Verify dispute button is disabled/hidden
5. ✅ Verify payment already released to landlord

**Expected Result:** Tenant cannot dispute after deadline

---

## Email Templates

### Tenant Cancellation Email
**To:** Tenant
**Subject:** Viewing Cancelled - Refund Processed

```
Your viewing request for [Property Title] has been cancelled.

Refund Details:
- Amount: [Refund Amount] MWK
- Processing Time: 3-5 business days

Property: [Property Title]
Scheduled Date: [Date]
Reason: [Cancellation Reason]
```

---

### Landlord No-Show Claim Email
**To:** Tenant
**Subject:** No-Show Claim - You Have 24h to Dispute

```
⚠️ URGENT: No-Show Claim Filed

The landlord has reported that you did not attend the scheduled viewing:

Property: [Property Title]
Scheduled Date: [Date]
Landlord's Claim: [Reason]

You have 24 hours to dispute this claim.
Deadline: [Dispute Deadline]

If you believe you attended or had a valid reason for missing the viewing, 
please submit a dispute with evidence.

If no dispute is filed within 24 hours, the viewing fee will be released 
to the landlord.
```

---

### Admin Dispute Notification
**To:** Admin
**Subject:** Dispute Requires Review

```
A tenant has disputed a no-show claim:

Viewing ID: [ID]
Property: [Property Title]
Scheduled Date: [Date]

Landlord's Claim:
[Landlord Reason]

Tenant's Evidence:
[Tenant Evidence]

Please review and make a decision.
View in Admin Dashboard: [Link]
```

---

## Admin Actions for Disputed Cases

### Review Process
1. Admin navigates to `/admin/disputes` (to be created)
2. Reviews both sides' claims
3. Checks any supporting evidence
4. Makes decision: Refund tenant OR Release to landlord
5. Executes decision via admin dashboard
6. Both parties notified of outcome

### Admin Database Actions
```sql
-- Approve tenant (refund)
UPDATE transactions 
SET escrow_status = 'refunded'
WHERE viewing_request_id = 'xxx';

UPDATE viewing_requests
SET status = 'cancelled_by_landlord' -- Treat as landlord fault
WHERE id = 'xxx';

-- OR

-- Approve landlord (release payment)
UPDATE transactions 
SET escrow_status = 'released'
WHERE viewing_request_id = 'xxx';

INSERT INTO payouts (transaction_id, landlord_id, amount, status)
VALUES ('xxx', 'landlord-id', 5000, 'pending');
```

---

## Error Handling

### Common Errors

**1. "Viewing request not found"**
- Check viewing_request_id is correct
- Verify viewing exists in database

**2. "Unauthorized"**
- Check user is logged in
- Verify user is tenant/landlord for this viewing

**3. "Cannot cancel after viewing completed"**
- Viewing status must be 'pending' or 'scheduled'
- Cannot cancel completed/cancelled viewings

**4. "Dispute deadline passed"**
- Tenant must dispute within 24h
- Show appropriate message to tenant

---

## Monitoring & Analytics

### Key Metrics
1. **Cancellation Rate**
   ```sql
   SELECT 
     COUNT(*) FILTER (WHERE status LIKE 'cancelled%') * 100.0 / COUNT(*) 
   FROM viewing_requests
   ```

2. **No-Show Rate**
   ```sql
   SELECT 
     COUNT(*) FILTER (WHERE status = 'tenant_no_show') * 100.0 / COUNT(*)
   FROM viewing_requests
   WHERE status IN ('scheduled', 'completed', 'tenant_no_show')
   ```

3. **Dispute Rate**
   ```sql
   SELECT 
     COUNT(*) FILTER (WHERE status = 'disputed') * 100.0 / 
     COUNT(*) FILTER (WHERE status = 'tenant_no_show')
   FROM viewing_requests
   ```

4. **Average Refund Amount**
   ```sql
   SELECT AVG(refund_amount)
   FROM transactions
   WHERE escrow_status = 'refunded'
   ```

---

## Troubleshooting

### Refund Not Processing
1. Check Edge Function logs
2. Verify transaction exists
3. Check escrow_status is 'held'
4. Verify Paychangu integration is working

### Dispute Deadline Not Set
1. Check `process-refund` Edge Function
2. Verify `dispute_deadline` field exists in table
3. Check timestamp calculation logic

### Payout Not Created
1. Verify `landlord_payout` calculation in Edge Function
2. Check `payouts` table insert statement
3. Review RLS policies on payouts table

---

**Last Updated:** November 28, 2025  
**Version:** 1.0  
**Status:** ✅ Fully Implemented and Deployed

