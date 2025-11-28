# Edge Functions Deployment Instructions

## Prerequisites

1. **Unpause Supabase Project** (if paused)
   - Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_REF
   - Click "Resume" if project is paused

2. **Link Supabase Project**
   ```bash
   cd /Users/trevorchimtengo/Pezani-Mobile
   supabase link --project-ref YOUR_PROJECT_REF
   ```

## Quick Deployment

Run the deployment script:
```bash
./scripts/deploy-edge-functions.sh
```

## Manual Deployment

### Step 1: Deploy Edge Functions

```bash
cd /Users/trevorchimtengo/Pezani-Mobile

# Deploy all functions
supabase functions deploy send-email
supabase functions deploy send-agent-email
supabase functions deploy paychangu-webhook
supabase functions deploy create-viewing-request
```

### Step 2: Set Environment Variables

**Option A: Via Supabase Dashboard (Recommended)**

1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_REF/settings/functions
2. Scroll to "Secrets" section
3. Add the following secrets:

   - **RESEND_API_KEY**: `re_9Mf8QWBF_ADeZpzWvfkKiEGpTLH9HbbW1`
   - **SITE_URL**: `http://localhost:5173` (or your production URL)
   - **PAYCHANGU_WEBHOOK_SECRET**: (get from Paychangu dashboard when configuring webhook)

**Option B: Via CLI**

```bash
# Set Resend API Key
supabase secrets set RESEND_API_KEY=re_9Mf8QWBF_ADeZpzWvfkKiEGpTLH9HbbW1

# Set Site URL (update with your actual URL)
supabase secrets set SITE_URL=http://localhost:5173

# Set Paychangu Webhook Secret (when available)
supabase secrets set PAYCHANGU_WEBHOOK_SECRET=your_webhook_secret_here
```

### Step 3: Verify Deployment

1. Check functions are deployed:
   ```bash
   supabase functions list
   ```

2. Check secrets are set:
   ```bash
   supabase secrets list
   ```

3. Test a function (optional):
   ```bash
   # Test send-email function
   curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-email \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     -H "Content-Type: application/json" \
     -d '{"to":"test@example.com","subject":"Test","html":"<p>Test email</p>"}'
   ```

## Environment Variables Reference

| Variable | Value | Required For |
|----------|-------|--------------|
| `RESEND_API_KEY` | `re_9Mf8QWBF_ADeZpzWvfkKiEGpTLH9HbbW1` | All email functions |
| `SITE_URL` | `http://localhost:5173` or production URL | Email templates |
| `PAYCHANGU_WEBHOOK_SECRET` | From Paychangu dashboard | Webhook verification |
| `SUPABASE_URL` | Auto-set by Supabase | All functions |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-set by Supabase | All functions |

## Troubleshooting

### Project is Paused
- Go to Supabase Dashboard → Project Settings → Resume project

### Functions Not Deploying
- Check you're linked: `supabase status`
- Check project is active (not paused)
- Verify you have deployment permissions

### Secrets Not Working
- Secrets are case-sensitive
- Wait a few seconds after setting secrets
- Restart functions if needed

### Email Not Sending
- Verify `RESEND_API_KEY` is set correctly
- Check Resend dashboard for API key status
- Verify sender domain is verified in Resend (or use `onboarding@resend.dev` for testing)

## Next Steps

After deployment:
1. ✅ Configure webhook URL in Paychangu dashboard
2. ✅ Test email sending from AgentApprovalPage
3. ✅ Test viewing request flow end-to-end
4. ✅ Monitor Edge Function logs in Supabase dashboard

