# Environment Variables Guide

## Required Environment Variables

### Supabase Configuration
These are required for the application to connect to your Supabase backend:

```bash
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**How to get these values:**
1. Go to your Supabase project dashboard
2. Click on "Settings" → "API"
3. Copy the "Project URL" for `VITE_SUPABASE_URL`
4. Copy the "anon public" key for `VITE_SUPABASE_ANON_KEY`

### Paychangu Payment Gateway
```bash
VITE_PAYCHANGU_PUBLIC_KEY=PUB-TEST-lU3cD0LiVVIhrVICng1C3kYgmasNZQIb
```

**Note:** The test key is already configured. For production, you'll need to:
1. Sign up at Paychangu
2. Get your production public key
3. Update this environment variable

## Local Development Setup

1. Create a `.env` file in the project root (it's gitignored):
```bash
cp .env.example .env  # If you have the example file
```

2. Edit `.env` and add your actual values

3. Restart your dev server:
```bash
npm run dev
```

## Render Production Setup

The environment variables are already configured in Render, but you need to update the Supabase values:

### Step-by-Step Instructions:

1. **Go to your Render dashboard**:
   https://dashboard.render.com/static/srv-d4ku0875r7bs73ckuqe0

2. **Click "Environment" in the left sidebar**

3. **Update the following variables**:
   - `VITE_SUPABASE_URL` → Paste your actual Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` → Paste your actual Supabase anon key

4. **Click "Save Changes"**

5. **Automatic Redeploy**: Render will automatically trigger a new deployment with the updated environment variables

### Verifying Environment Variables

After deployment, you can verify the environment variables are working:
1. Open your deployed site: https://pezani-mobile.onrender.com
2. Open browser DevTools (F12)
3. Check the Console tab
4. You should see "✅ Supabase connected!" if configured correctly
5. If you see a warning about missing credentials, the env vars need to be updated

## Security Notes

⚠️ **Important Security Practices:**

1. **Never commit `.env` files** - They're gitignored for a reason
2. **Use Supabase RLS policies** - Row Level Security protects your data
3. **Rotate keys if exposed** - If you accidentally commit keys, rotate them immediately
4. **Use test keys in development** - Keep production keys separate
5. **Paychangu keys** - The `PUBLIC_KEY` is safe to expose, but keep secret keys private

## Troubleshooting

### Issue: "Supabase credentials not found"
**Solution**: Ensure environment variables are set in both:
- Local: `.env` file in project root
- Production: Render dashboard → Environment tab

### Issue: Build fails on Render
**Solution**: Check that all required env vars are set in Render dashboard

### Issue: App works locally but not on Render
**Solution**: 
1. Verify env vars are set correctly in Render
2. Check that `VITE_` prefix is used (required for Vite)
3. Redeploy after updating env vars

## Additional Resources

- [Vite Environment Variables Docs](https://vitejs.dev/guide/env-and-mode.html)
- [Supabase API Keys Docs](https://supabase.com/docs/guides/api/api-keys)
- [Render Environment Variables Docs](https://render.com/docs/environment-variables)

