# Send Email Edge Function

A reusable Edge Function for sending transactional emails via Resend.

## Usage

This function is called by other Edge Functions (like `paychangu-webhook`) to send emails.

### Request

```typescript
POST /functions/v1/send-email
Content-Type: application/json

{
  "to": "recipient@example.com",
  "subject": "Email Subject",
  "html": "<html>Email body</html>",
  "from": "Sender Name <sender@example.com>" // optional
}
```

### Response

```json
{
  "success": true,
  "message_id": "resend-message-id"
}
```

## Environment Variables

- `RESEND_API_KEY` - Required, Resend API key
- `SITE_URL` - Optional, used in email templates

## Email Templates

Email templates are defined in the calling functions (e.g., `paychangu-webhook`). This function only handles the actual sending.

## Resend Setup

1. Sign up at https://resend.com
2. Get your API key
3. Verify your domain (for production)
4. Set `RESEND_API_KEY` in Supabase Edge Functions secrets

## Free Tier Limits

Resend free tier includes:
- 3,000 emails/month
- 100 emails/day
- Perfect for MVP/testing

