#!/bin/bash

# Deploy Edge Functions and Set Environment Variables
# Run this script after unpausing your Supabase project

set -e

echo "🚀 Deploying Supabase Edge Functions..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   brew install supabase/tap/supabase"
    exit 1
fi

# Check if project is linked
if ! supabase status &> /dev/null; then
    echo "⚠️  Project not linked. Please link your project first:"
    echo "   supabase link --project-ref YOUR_PROJECT_REF"
    echo ""
    echo "Available projects:"
    supabase projects list
    exit 1
fi

echo "📦 Deploying Edge Functions..."

# Deploy send-email function
echo "  → Deploying send-email..."
supabase functions deploy send-email

# Deploy send-agent-email function
echo "  → Deploying send-agent-email..."
supabase functions deploy send-agent-email

# Deploy paychangu-webhook function
echo "  → Deploying paychangu-webhook..."
supabase functions deploy paychangu-webhook

# Deploy create-viewing-request function (if not already deployed)
echo "  → Deploying create-viewing-request..."
supabase functions deploy create-viewing-request

echo ""
echo "✅ Edge Functions deployed successfully!"
echo ""
echo "📝 Next: Set environment variables in Supabase Dashboard:"
echo "   1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_REF/settings/functions"
echo "   2. Add the following secrets:"
echo "      - RESEND_API_KEY = re_9Mf8QWBF_ADeZpzWvfkKiEGpTLH9HbbW1"
echo "      - SITE_URL = http://localhost:5173 (or your production URL)"
echo "      - PAYCHANGU_WEBHOOK_SECRET = (get from Paychangu dashboard)"
echo ""
echo "Or use CLI to set secrets:"
echo "   supabase secrets set RESEND_API_KEY=re_9Mf8QWBF_ADeZpzWvfkKiEGpTLH9HbbW1"
echo "   supabase secrets set SITE_URL=http://localhost:5173"

