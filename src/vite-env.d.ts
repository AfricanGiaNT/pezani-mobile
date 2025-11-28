/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_PAYCHANGU_PUBLIC_KEY?: string
  readonly VITE_SENTRY_DSN?: string
  readonly VITE_GA4_MEASUREMENT_ID?: string
}

// Paychangu Test Cards (for development)
// Success: 5123 4567 8901 2346
// Failed: 4000 0000 0000 0002

interface ImportMeta {
  readonly env: ImportMetaEnv
}


