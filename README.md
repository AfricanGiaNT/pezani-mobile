# 🏠 Pezani Estates

A modern real estate property listing platform for Malawi, connecting tenants with landlords and agents.

## 📋 Project Overview

Pezani Estates is a full-stack web application that solves the problem of fragmented property listings in Malawi. The platform provides:

- **Centralized property listings** with photos and complete details
- **Advanced search and filtering** capabilities
- **Secure viewing request system** with payment escrow
- **Role-based dashboards** for tenants, landlords, agents, and admins
- **Mobile-first responsive design** optimized for slow connections

## 🚀 Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Payments:** Paychangu (Malawi mobile money)
- **State Management:** React Query + Context API
- **Forms:** React Hook Form + Zod validation
- **Icons:** Lucide React
- **Hosting:** Render (Static Site)

## 📁 Project Structure

```
/
├── config/                # All secrets & service configs
│   └── .env.example       # Sample env vars
├── plans/                 # High-level roadmaps, sprint plans
├── docs/                  # Reference docs, ADRs, diagrams
├── dev_journal/           # Milestone logs
├── src/                   # Runtime code only
│   ├── api/               # API endpoints
│   ├── components/        # React components
│   │   ├── layout/        # Navbar, Footer, Layout
│   │   ├── property/      # Property-related components
│   │   ├── auth/          # Auth forms
│   │   └── common/        # Reusable UI components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom React hooks
│   ├── contexts/          # React contexts
│   ├── utils/             # Utility functions
│   ├── lib/               # Third-party library configs
│   └── styles/            # Global styles
├── tests/                 # Unit, integration, E2E tests
├── data/                  # Seeds, fixtures, sample datasets
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ (or 20+ recommended)
- npm or yarn
- Supabase account
- Paychangu developer account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Pezani-Mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp config/.env.example config/.env
   # Edit config/.env with your credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run linter (when configured)

## 🔐 Environment Variables

See `config/.env.example` for all required environment variables.

**Required:**
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

**Optional (for full functionality):**
- `VITE_PAYCHANGU_PUBLIC_KEY` - Paychangu public key
- `PAYCHANGU_SECRET_KEY` - Paychangu secret key (server-side only)
- `RESEND_API_KEY` - Email service API key
- `VITE_SENTRY_DSN` - Error tracking
- `VITE_GA4_MEASUREMENT_ID` - Analytics

## 📚 Documentation

- [Project Plan](./Project-reference/) - Complete project documentation
- [Features List](./docs/features.md) - Detailed feature specifications
- [Database Schema](./docs/database-schema.md) - Database structure
- [API Documentation](./docs/api.md) - API endpoints

## 🧪 Testing

Testing strategy focuses on manual testing for MVP, with automated tests added post-launch.

## 🚢 Deployment

The project is configured for deployment on Render as a static site.

1. Connect your GitHub repository to Render
2. Configure build command: `npm install && npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Render dashboard

## 📄 License

ISC

## 👤 Author

Trevor Chimtengo

---

**Status:** 🔴 Planning → In Development

