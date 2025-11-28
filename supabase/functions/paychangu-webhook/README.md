# Paychangu Webhook Handler

This Supabase Edge Function handles webhook events from Paychangu payment gateway.

## Deployment

### Prerequisites

1. Install Supabase CLI (if not already installed)
2. Link your project
3. Set environment variables

### Environment Variables

Set these in your Supabase project dashboard under Settings → Edge Functions → Secrets:

- `RESEND_API_KEY` - Resend API key for sending emails (get from https://resend.com)
- `SITE_URL` - Your frontend URL (e.g., https://yourdomain.com)
- `PAYCHANGU_WEBHOOK_SECRET` - Webhook secret from Paychangu dashboard (for signature verification)
- `SUPABASE_URL` - Auto-set by Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Auto-set by Supabase

### Deploy

```bash
supabase functions deploy paychangu-webhook
```

### Configure Webhook in Paychangu Dashboard

1. Log into Paychangu dashboard
2. Go to Webhooks/Settings
3. Add webhook URL: `https://your-project.supabase.co/functions/v1/paychangu-webhook`
4. Select events to listen for:
   - `payment.successful`
   - `payment.failed`
5. Save webhook configuration

## Webhook Events Handled

### payment.successful

When a payment is successful:
1. Updates transaction status to `completed`
2. Sets escrow status to `held` (payment held until viewing confirmed)
3. Sends confirmation email to tenant
4. Sends notification email to landlord

### payment.failed

When a payment fails:
1. Updates transaction status to `failed`
2. Deletes the viewing request (no payment = no viewing)
3. Sends failure notification email to tenant

## Webhook Payload Format

```json
{
  "event": "payment.successful" | "payment.failed",
  "data": {
    "reference": "transaction-reference-id",
    "payment_id": "paychangu-payment-id",
    "amount": 5000,
    "currency": "MWK",
    "status": "successful" | "failed",
    "customer_email": "customer@example.com",
    "customer_phone": "+265912345678",
    "metadata": {}
  },
  "signature": "webhook-signature-for-verification"
}
```

## Security

**Webhook Signature Verification:**

Signature verification is implemented using HMAC-SHA256. The function:
1. Creates an HMAC-SHA256 hash of the webhook payload using the webhook secret
2. Compares it with the signature provided by Paychangu
3. Uses constant-time comparison to prevent timing attacks

**Note:** The implementation assumes Paychangu uses HMAC-SHA256. If Paychangu uses a different method:
1. Check Paychangu's webhook documentation
2. Update the `verifyPaychanguSignature` function accordingly
3. Ensure the signature format matches (hex, base64, etc.)

**To enable signature verification:**
1. Get your webhook secret from Paychangu dashboard
2. Set `PAYCHANGU_WEBHOOK_SECRET` in Supabase Edge Functions secrets
3. Webhook will automatically verify signatures when secret is configured

## Email Templates

The function uses HTML email templates for:
- Tenant viewing confirmation
- Landlord viewing request notification
- Payment failed notification

All emails are sent via Resend API.

## Testing

### Test with Paychangu Test Mode

1. Use Paychangu test cards:
   - Success: `5123 4567 8901 2346`
   - Failed: `4000 0000 0000 0002`

2. Create a viewing request
3. Complete payment with test card
4. Check webhook logs in Supabase dashboard
5. Verify emails are sent

### Manual Webhook Testing

You can test webhooks manually using a tool like:
- https://webhook.site (for testing webhook delivery)
- Postman (for sending test payloads)

## Monitoring

Check webhook logs in:
- Supabase Dashboard → Edge Functions → Logs
- Look for `paychangu-webhook` function logs

## Troubleshooting

**Webhook not receiving events:**
- Verify webhook URL is correct in Paychangu dashboard
- Check Supabase function logs for errors
- Verify environment variables are set

**Emails not sending:**
- Verify `RESEND_API_KEY` is set correctly
- Check Resend dashboard for email delivery status
- Verify sender domain is verified in Resend

**Transaction not found:**
- Verify `paychangu_reference` matches between payment and transaction
- Check transaction was created before payment completed

