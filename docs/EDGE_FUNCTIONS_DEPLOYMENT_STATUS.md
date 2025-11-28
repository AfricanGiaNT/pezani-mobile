# Edge Functions Deployment Status

**Date:** November 26, 2025  
**Status:** ⚠️ Ready to Deploy (Project Currently Paused)

---

## ✅ What's Ready

### Edge Functions Created:
1. ✅ `send-email` - Generic email sending function
2. ✅ `send-agent-email` - Agent approval/rejection emails  
3. ✅ `paychangu-webhook` - Payment webhook handler
4. ✅ `create-viewing-request` - Viewing request creation

### Environment Variables Prepared:
- ✅ `RESEND_API_KEY`: `re_9Mf8QWBF_ADeZpzWvfkKiEGpTLH9HbbW1`
- ✅ `SITE_URL`: `http://localhost:5173` (update for production)

---

## ⚠️ Current Issue

**Supabase project is paused.** You need to unpause it before deployment:

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click "Resume" or "Unpause" button

---

## 🚀 Deployment Commands (Run After Unpausing)

### Step 1: Link Project (if not already linked)

```bash
cd /Users/trevorchimtengo/Pezani-Mobile

# Link to your project (use your actual project ref)
supabase link --project-ref YOUR_PROJECT_REF
```

### Step 2: Deploy All Functions

```bash
# Deploy all 4 functions
supabase functions deploy send-email
supabase functions deploy send-agent-email
supabase functions deploy paychangu-webhook
supabase functions deploy create-viewing-request
```

### Step 3: Set Environment Variables

```bash
# Set Resend API Key
supabase secrets set RESEND_API_KEY=re_9Mf8QWBF_ADeZpzWvfkKiEGpTLH9HbbW1

# Set Site URL
supabase secrets set SITE_URL=http://localhost:5173

# Optional: Set Paychangu Webhook Secret (when configuring webhook)
# supabase secrets set PAYCHANGU_WEBHOOK_SECRET=your_secret_here
```

### Step 4: Verify Deployment

```bash
# List all deployed functions
supabase functions list

# List all secrets
supabase secrets list
```

---

## 📋 Quick Deployment Script

I've created a deployment script at:
- `scripts/deploy-edge-functions.sh`

Run it after unpausing your project:
```bash
./scripts/deploy-edge-functions.sh
```

---

## 🔍 Verification Checklist

After deployment, verify:

- [ ] All 4 functions appear in `supabase functions list`
- [ ] Secrets are set: `supabase secrets list`
- [ ] Functions are accessible in Supabase Dashboard
- [ ] Test agent approval email (approve an agent)
- [ ] Test viewing request flow (create request, complete payment)
- [ ] Check Edge Function logs for any errors

---

## 📚 Documentation Created

1. **`docs/QUICK_DEPLOYMENT_GUIDE.md`** - Step-by-step deployment guide
2. **`docs/DEPLOYMENT_INSTRUCTIONS.md`** - Detailed deployment instructions
3. **`scripts/deploy-edge-functions.sh`** - Automated deployment script

---

## 🎯 Next Steps

1. **Unpause Supabase project** in dashboard
2. **Link project** using `supabase link`
3. **Deploy functions** using commands above
4. **Set secrets** using `supabase secrets set`
5. **Test email functionality**
6. **Configure Paychangu webhook** (Task 5)

---

## 📞 Support

If you encounter issues:
- Check Supabase Dashboard → Edge Functions → Logs
- Verify project is active (not paused)
- Ensure you're linked to correct project
- Check Resend dashboard for email delivery status

---

**Status:** ✅ Code Ready | ⚠️ Awaiting Project Unpause

