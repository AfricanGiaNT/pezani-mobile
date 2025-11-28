# Deployment Status - Payment Escrow & Admin Payouts

**Deployment Date:** November 28, 2025  
**Tasks Completed:** Day 7, Tasks 10 & 11

---

## ✅ Deployment Checklist

### Database Migration
- [x] Created migration file: `20251128183422_check_viewing_confirmations.sql`
- [x] Pushed to remote database successfully
- [x] Function `check_viewing_confirmations()` deployed
- [x] Trigger ready (will be enabled when needed)

### Edge Functions
- [x] **release-payment** - Deployed to Supabase
  - URL: `https://yalbenqwotubsasutniv.supabase.co/functions/v1/release-payment`
  - Handles dual-confirmation logic
  - Automatically releases payments when both parties confirm

- [x] **process-refund** - Deployed to Supabase
  - URL: `https://yalbenqwotubsasutniv.supabase.co/functions/v1/process-refund`
  - Handles cancellation scenarios
  - Calculates refund amounts based on timing

### Environment Variables
- [x] `PAYCHANGU_PUBLIC_KEY` - Set
- [x] `PAYCHANGU_SECRET_KEY` - Set
- [x] `RESEND_API_KEY` - Set (for email notifications)
- [x] `SUPABASE_URL` - Set
- [x] `SUPABASE_ANON_KEY` - Set
- [x] `SUPABASE_SERVICE_ROLE_KEY` - Set
- [x] `SUPABASE_DB_URL` - Set
- [x] `SITE_URL` - Set

### Frontend Components
- [x] `AdminPayoutsPage.tsx` - Created and ready
- [x] Route added to `App.tsx` (`/admin/payouts`)
- [x] Navigation added to `AdminDashboard.tsx`

---

## 🔧 What's Working

### Backend (Deployed)
1. ✅ Payment escrow logic in database
2. ✅ Dual-confirmation system
3. ✅ Automatic payment release
4. ✅ Refund processing with rules
5. ✅ Email notifications

### Frontend (Ready to Use)
1. ✅ Admin can view all payouts
2. ✅ Admin can process payouts
3. ✅ Admin can export to CSV
4. ✅ Filter and search functionality

---

## 📝 Next Steps for Integration

### 1. Add Confirmation Buttons to Tenant Dashboard

**File:** `src/pages/TenantDashboard.tsx`

Add this function:
```typescript
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

    // Refresh viewing requests
    refetchViewingRequests()
  } catch (error) {
    console.error('Error confirming viewing:', error)
    toast.error('Failed to confirm viewing')
  }
}
```

Add button in your viewing requests list:
```tsx
{viewing.status === 'scheduled' && 
 !viewing.tenant_confirmed && 
 new Date(viewing.scheduled_date) < new Date() && (
  <Button onClick={() => handleConfirmViewing(viewing.id)}>
    ✓ Confirm Viewing
  </Button>
)}
```

### 2. Add Confirmation Buttons to Landlord Dashboard

**File:** `src/pages/LandlordDashboard.tsx`

Same function as above but with `confirmed_by: 'landlord'`

### 3. Add Cancellation Functionality

**Both Dashboards:**
```typescript
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
        cancelled_by: 'landlord' // or 'tenant'
      }
    })

    if (error) throw error

    toast.success(`Viewing cancelled. Refund: ${data.refund_amount} MWK`)
    refetchViewingRequests()
  } catch (error) {
    console.error('Error cancelling viewing:', error)
    toast.error('Failed to cancel viewing')
  }
}
```

### 4. Update Viewing Status Display

Show confirmation status in your UI:
```tsx
const getConfirmationStatus = (viewing: ViewingRequest) => {
  if (viewing.tenant_confirmed && viewing.landlord_confirmed) {
    return <Badge color="green">✅ Both Confirmed</Badge>
  } else if (viewing.tenant_confirmed) {
    return <Badge color="blue">⏳ Waiting for Landlord</Badge>
  } else if (viewing.landlord_confirmed) {
    return <Badge color="blue">⏳ Waiting for Tenant</Badge>
  } else {
    return <Badge color="gray">⏸️ No Confirmations</Badge>
  }
}
```

---

## 🧪 Testing Instructions

### Test 1: Happy Path (Both Confirm)
1. Create a viewing request as tenant
2. Pay the viewing fee
3. Landlord schedules the viewing
4. After viewing date passes:
   - Tenant clicks "Confirm Viewing"
   - Landlord clicks "Confirm Viewing"
5. ✅ Payment should be released automatically
6. ✅ Payout should appear in `/admin/payouts`

### Test 2: Landlord Cancels
1. Create viewing request with payment
2. Landlord clicks "Cancel Viewing"
3. ✅ Tenant should receive 100% refund
4. ✅ Status should change to "cancelled_by_landlord"

### Test 3: Tenant Cancels (Late)
1. Create viewing request for tomorrow
2. Tenant clicks "Cancel Viewing"
3. ✅ Tenant should receive 50% refund
4. ✅ Landlord should receive 50%

### Test 4: Admin Processes Payout
1. Go to `/admin/payouts`
2. Find a pending payout
3. Click "Mark as Processed"
4. Enter reference number
5. ✅ Status should change to "Completed"

---

## 🔍 Monitoring & Logs

### Check Edge Function Logs
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/yalbenqwotubsasutniv/functions)
2. Select `release-payment` or `process-refund`
3. View logs and invocations

### Check Database Function
```sql
-- Test the function manually
SELECT check_viewing_confirmations();

-- Check viewing requests that need review
SELECT id, status, tenant_confirmed, landlord_confirmed, 
       scheduled_date, created_at
FROM viewing_requests
WHERE status = 'scheduled'
  AND scheduled_date < NOW() - INTERVAL '72 hours'
  AND (NOT tenant_confirmed OR NOT landlord_confirmed);
```

### Check Payouts
```sql
-- Pending payouts
SELECT p.*, pr.full_name, pr.phone
FROM payouts p
JOIN profiles pr ON p.landlord_id = pr.id
WHERE p.status = 'pending'
ORDER BY p.created_at DESC;
```

---

## 🚨 Troubleshooting

### Payment Not Releasing
**Symptoms:** Both parties confirmed but payment still in escrow

**Solutions:**
1. Check Edge Function logs for errors
2. Verify transaction exists:
   ```sql
   SELECT * FROM transactions 
   WHERE viewing_request_id = 'viewing-id';
   ```
3. Manually release if needed:
   ```sql
   UPDATE transactions 
   SET escrow_status = 'released' 
   WHERE viewing_request_id = 'viewing-id';
   
   -- Then create payout manually
   ```

### Refund Not Processing
**Symptoms:** Cancellation fails or wrong refund amount

**Solutions:**
1. Check Edge Function logs
2. Verify user authorization
3. Check transaction exists and is not already refunded
4. Test manually via Postman/curl:
   ```bash
   curl -X POST https://yalbenqwotubsasutniv.supabase.co/functions/v1/process-refund \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "viewing_request_id": "viewing-id",
       "refund_reason": "Test cancellation",
       "cancelled_by": "tenant"
     }'
   ```

### Admin Can't See Payouts
**Symptoms:** Payouts page is empty or showing errors

**Solutions:**
1. Check RLS policies on `payouts` table
2. Verify admin role in `profiles` table
3. Check browser console for errors
4. Test query manually:
   ```sql
   SELECT * FROM payouts WHERE status = 'pending';
   ```

---

## 📊 Database Schema Reference

### Viewing Requests
```sql
tenant_confirmed: BOOLEAN (default false)
landlord_confirmed: BOOLEAN (default false)
tenant_confirmed_at: TIMESTAMPTZ
landlord_confirmed_at: TIMESTAMPTZ
status: TEXT (pending, scheduled, completed, cancelled, disputed, expired)
```

### Transactions
```sql
escrow_status: TEXT (held, released, refunded, partially_refunded)
payment_status: TEXT (pending, successful, failed)
```

### Payouts
```sql
status: TEXT (pending, completed, failed)
amount: DECIMAL
payout_method: TEXT (bank_transfer, mobile_money)
reference_number: TEXT
processed_by: UUID (admin user id)
processed_at: TIMESTAMPTZ
```

---

## 🔐 Security Checklist

- [x] RLS policies enabled on all tables
- [x] Edge Functions verify user authorization
- [x] Service role key used only in Edge Functions
- [x] Payment amounts validated before refund
- [x] Admin actions logged with processor ID
- [x] Email notifications don't expose sensitive data

---

## 📞 Support

If you encounter issues:

1. **Check Logs First**
   - Edge Function logs in Supabase Dashboard
   - Browser console for frontend errors
   - Database logs for function execution

2. **Review Documentation**
   - `docs/PAYMENT_ESCROW_INTEGRATION_GUIDE.md`
   - `docs/DAY_7_TASKS_10_11_COMPLETION.md`
   - Edge Function README files

3. **Test Manually**
   - Use Postman to test Edge Functions
   - Run SQL queries directly in Supabase SQL Editor
   - Check email delivery in logs

---

## 🎉 What's Been Achieved

✅ **Secure payment escrow system** - Payments held until both parties confirm  
✅ **Automated payment release** - No manual intervention needed  
✅ **Intelligent refund logic** - Based on timing and cancellation party  
✅ **Admin management interface** - Easy payout processing and tracking  
✅ **Email notifications** - Keep all parties informed  
✅ **Audit trail** - All actions logged with timestamps and user IDs  

---

**Next Task:** Day 7, Task 12 - Cancellation & Refund Logic (Enhanced UI)

**Estimated Time:** 60 minutes

**Status:** Ready to begin 🚀

