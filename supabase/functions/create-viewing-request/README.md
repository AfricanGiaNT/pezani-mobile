# Create Viewing Request Edge Function

This Supabase Edge Function handles the creation of viewing requests and payment initialization with Paychangu.

## Deployment

### Prerequisites

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

### Environment Variables

Set these in your Supabase project dashboard under Settings → Edge Functions → Secrets:

- `PAYCHANGU_API_BASE_URL` - Paychangu API base URL (default: https://api.paychangu.com/v1)
- `PAYCHANGU_SECRET_KEY` - Your Paychangu secret key (server-side only)
- `SUPABASE_URL` - Your Supabase project URL (auto-set)
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (auto-set)
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key (auto-set)
- `SITE_URL` - Your frontend URL (e.g., https://yourdomain.com or http://localhost:5173)

### Deploy

```bash
supabase functions deploy create-viewing-request
```

### Test Locally

```bash
supabase functions serve create-viewing-request
```

## API Usage

### Request

```typescript
POST /functions/v1/create-viewing-request
Authorization: Bearer <user-access-token>
Content-Type: application/json

{
  "property_id": "uuid",
  "preferred_dates": [
    "2025-12-01T10:00:00Z",
    "2025-12-02T14:00:00Z",
    "2025-12-03T16:00:00Z"
  ],
  "callback_url": "https://yourdomain.com/api/paychangu/webhook", // optional
  "return_url": "https://yourdomain.com/payment/success" // optional
}
```

### Success Response

```json
{
  "success": true,
  "viewing_request_id": "uuid",
  "transaction_id": "uuid",
  "payment_url": "https://paychangu.com/pay/...",
  "reference": "paychangu-reference-id"
}
```

### Error Response

```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

## Flow

1. Validates user is authenticated and is a tenant
2. Checks property exists and is available
3. Checks for duplicate viewing requests
4. Creates viewing request (status: pending)
5. Creates transaction record (payment_status: pending)
6. Calls Paychangu API to initialize payment
7. Returns payment URL for redirect

## Error Handling

- **401 Unauthorized**: User not authenticated
- **403 Forbidden**: User is not a tenant or account not active
- **404 Not Found**: Property not found
- **400 Bad Request**: Missing fields, duplicate request, or property unavailable
- **500 Internal Server Error**: Database or Paychangu API error

## Notes

- Payment is held in escrow until both parties confirm viewing completion
- If payment initialization fails, the viewing request is rolled back
- Transaction reference is stored for webhook verification

