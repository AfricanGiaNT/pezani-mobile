# Quick Deployment Guide - Edge Functions & Environment Variables

## ⚠️ Important: Project Must Be Active

Your Supabase project appears to be paused. You need to unpause it first:

1. Go to: https://supabase.com/dashboard
2. Select your project (or create a new one)
3. If paused, click "Resume" or "Unpause"

## 🚀 Deployment Steps

### Step 1: Link Project (if not already linked)

```bash
cd /Users/trevorchimtengo/Pezani-Mobile

# Link to your project (replace with your actual project ref)
supabase link --project-ref YOUR_PROJECT_REF

# Or if you see "primetime-estate" in the list:
supabase link --project-ref hlnxhjqnokpyiwcbykbm
```

### Step 2: Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy send-email
supabase functions deploy send-agent-email  
supabase functions deploy paychangu-webhook
supabase functions deploy create-viewing-request
```

### Step 3: Set Environment Variables

**Using CLI (Recommended):**

```bash
# Set Resend API Key
supabase secrets set RESEND_API_KEY=re_9Mf8QWBF_ADeZpzWvfkKiEGpTLH9HbbW1

# Set Site URL (update with your actual URL)
supabase secrets set SITE_URL=http://localhost:5173

# Optional: Set Paychangu Webhook Secret (when configuring webhook)
# supabase secrets set PAYCHANGU_WEBHOOK_SECRET=your_secret_here
```

**Or via Dashboard:**

1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_REF/settings/functions
2. Scroll to "Secrets" section
3. Add:
   - `RESEND_API_KEY` = `re_9Mf8QWBF_ADeZpzWvfkKiEGpTLH9HbbW1`
   - `SITE_URL` = `http://localhost:5173` (or your production URL)

### Step 4: Verify

```bash
# List deployed functions
supabase functions list

# List secrets (should show your secrets)
supabase secrets list
```

## 📋 All Functions to Deploy

1. ✅ `send-email` - Generic email sending
2. ✅ `send-agent-email` - Agent approval/rejection emails
3. ✅ `paychangu-webhook` - Payment webhook handler
4. ✅ `create-viewing-request` - Viewing request creation with payment

## 🔑 Environment Variables Summary

| Variable | Value | Status |
|----------|-------|--------|
| `RESEND_API_KEY` | `re_9Mf8QWBF_ADeZpzWvfkKiEGpTLH9HbbW1` | ✅ Ready to set |
| `SITE_URL` | `http://localhost:5173` | ⚠️ Update for production |
| `PAYCHANGU_WEBHOOK_SECRET` | (from Paychangu) | ⏳ Set when configuring webhook |

## 🧪 Testing After Deployment

1. **Test Agent Email:**
   - Go to Admin Dashboard → Agent Approval
   - Approve/reject an agent
   - Check email inbox

2. **Test Viewing Request:**
   - Create viewing request as tenant
   - Complete payment
   - Check emails sent to tenant and landlord

3. **Check Logs:**
   - Supabase Dashboard → Edge Functions → Logs
   - Look for any errors

## 📝 Notes

- Functions are deployed to: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/`
- Secrets are available to all Edge Functions automatically
- Update `SITE_URL` when deploying to production
- Resend sender email defaults to `onboarding@resend.dev` (for testing)
- For production, verify your domain in Resend and update sender email in code

