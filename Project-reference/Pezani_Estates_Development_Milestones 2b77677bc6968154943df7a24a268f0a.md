# Pezani_Estates_Development_Milestones

# 🚀 Pezani Estates - Development Milestones

**Project:** Pezani Estates - Real Estate Property Listing Platform

**Timeline:** 2 Weeks MVP (14 Days)

**Development Tool:** Cursor AI

**Tech Stack:** React + Supabase + Render + Paychangu

**Document Version:** 1.0

**Last Updated:** November 26, 2025

---

## Table of Contents

1. [Development Approach with Cursor AI](about:blank#development-approach-with-cursor-ai)
2. [Milestone 1: Foundation & Setup (Day 1)](about:blank#milestone-1-foundation--setup)
3. [Milestone 2: Core UI & Property Listings (Days 2-3)](about:blank#milestone-2-core-ui--property-listings)
4. [Milestone 3: User Features & Dashboards (Days 4-5)](about:blank#milestone-3-user-features--dashboards)
5. [Milestone 4: Viewing Requests & Payments (Days 6-7)](about:blank#milestone-4-viewing-requests--payments)
6. [Milestone 5: Polish & Optimization (Days 8-9)](about:blank#milestone-5-polish--optimization)
7. [Milestone 6: Testing & Bug Fixes (Days 10-11)](about:blank#milestone-6-testing--bug-fixes)
8. [Milestone 7: Analytics, Monitoring & Deployment (Days 12-13)](about:blank#milestone-7-analytics-monitoring--deployment)
9. [Milestone 8: Post-Launch Monitoring & Iteration (Days 14+)](about:blank#milestone-8-post-launch-monitoring--iteration)
10. [Development Tools & Resources](about:blank#development-tools--resources)
11. [Daily Progress Tracking](about:blank#daily-progress-tracking)
12. [Emergency Contacts & Resources](about:blank#emergency-contacts--resources)
13. [Success Metrics for MVP](about:blank#success-metrics-for-mvp)

---

## Development Approach with Cursor AI

### Speed Multipliers with Cursor AI

Cursor AI dramatically accelerates development. Expected speed improvements:

| Task Type | Speed Multiplier | Traditional Time | Cursor AI Time |
| --- | --- | --- | --- |
| UI Components | 5x faster | 2 hours | 25 minutes |
| CRUD Operations | 4x faster | 3 hours | 45 minutes |
| Form Handling | 4x faster | 2 hours | 30 minutes |
| API Integration | 3x faster | 4 hours | 80 minutes |
| Bug Fixes | 3x faster | 1 hour | 20 minutes |

### Your Role (Senior Developer Oversight)

**Responsibilities:**
- Provide clear, detailed prompts to Cursor
- Review generated code for logic errors and security issues
- Test features immediately after generation
- Make architectural decisions
- Handle complex business logic
- Ensure code quality and maintainability

### Cursor AI’s Role

**Capabilities:**
- Generate boilerplate code instantly
- Write repetitive CRUD operations
- Create UI components from descriptions
- Suggest bug fixes from error messages
- Handle styling and layout
- Generate SQL queries and database schemas

### Development Philosophy

**Principles:**
1. **Build fast, test immediately** - Generate feature, test, refine, move on
2. **Use Cursor for repetition** - Don’t write boilerplate manually
3. **Focus on business logic** - Let Cursor handle UI/CRUD patterns
4. **Test continuously** - Don’t wait until the end
5. **Deploy early to staging** - Catch integration issues early

---

## Milestone 1: Foundation & Setup

**Duration:** Day 1 (6-8 hours)

**Status:** ⬜ Not Started

**Priority:** CRITICAL - Everything depends on this

---

### Morning Session (3-4 hours)

### Task 1: Project Initialization (30 minutes)

**Steps:**
1. Create React + Vite project:
`bash    npm create vite@latest pezani-estates -- --template react    cd pezani-estates    npm install`

1. Install Tailwind CSS:
    
    ```bash
    npm install -D tailwindcss postcss autoprefixer
    npx tailwindcss init -p
    ```
    
2. Configure Tailwind in `tailwind.config.js`:
    
    ```jsx
    export default {
      content: [
        "./index.html",    "./src/**/*.{js,ts,jsx,tsx}",  ],  theme: {
        extend: {
          colors: {
            primary: '#E4B012',        secondary: '#1E3A5F',        accent: '#2E7D6B',      }
        },  },  plugins: [],}
    ```
    
3. Test dev server:
    
    ```bash
    npm run dev
    ```
    

**Validation:**
- [ ] Dev server runs on http://localhost:5173
- [ ] Tailwind styles working (test with a colored div)
- [ ] No errors in console

---

### Task 2: Repository Setup (15 minutes)

**Steps:**
1. Initialize Git:
`bash    git init`

1. Create `.gitignore`:
    
    ```
    node_modules
    dist
    .env
    .env.local
    .DS_Store
    ```
    
2. Create GitHub repository (via GitHub website)
3. Connect and push:
    
    ```bash
    git add .
    git commit -m "Initial commit: Project setup"git remote add origin <your-repo-url>git push -u origin main
    ```
    

**Validation:**
- [ ] Repository visible on GitHub
- [ ] `.env` files not committed
- [ ] All source files committed

---

### Task 3: Supabase Project Setup (45 minutes)

**Steps:**
1. Create Supabase project:
- Go to https://supabase.com/dashboard
- Click “New Project”
- Name: `pezani-estates-dev`
- Generate strong database password
- Choose region closest to Malawi (Europe or Middle East)
- Wait for project to provision (~2 minutes)

1. Save credentials to `.env.local`:
    
    ```
    VITE_SUPABASE_URL=https://xxxxx.supabase.co
    VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    ```
    
2. Install Supabase client:
    
    ```bash
    npm install @supabase/supabase-js
    ```
    
3. Create `src/lib/supabase.js`:
    
    ```jsx
    import { createClient } from '@supabase/supabase-js'const supabaseUrl = import.meta.env.VITE_SUPABASE_URLconst supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEYexport const supabase = createClient(supabaseUrl, supabaseAnonKey)
    ```
    
4. Test connection in `App.jsx`:
    
    ```jsx
    import { useEffect } from 'react'import { supabase } from './lib/supabase'function App() {
      useEffect(() => {
        const testConnection = async () => {
          const { data, error } = await supabase.from('_test').select('*')
          if (error) console.log('Supabase connected! (Expected error is OK)')
        }
        testConnection()
      }, [])
      return <div>Supabase Test</div>}
    ```
    

**Validation:**
- [ ] Supabase project created
- [ ] Environment variables saved
- [ ] Client connection successful
- [ ] Console shows connection message

---

### Task 4: Database Schema Creation (90 minutes)

**Cursor AI Prompt:**

```
Create SQL schema for my real estate platform with these tables:
1. profiles (extends auth.users): id, email, full_name, phone, role (enum: tenant/landlord/agent/admin), status, avatar_url, payout details
2. properties: id, owner_id, title, description, location, price, viewing_fee, bedrooms, bathrooms, property_type, amenities (array), status, view_count, save_count
3. property_images: id, property_id, image_url, is_primary, display_order
4. saved_properties: id, user_id, property_id
5. viewing_requests: id, property_id, tenant_id, landlord_id, preferred_dates, scheduled_date, status (enum), confirmations
6. transactions: id, viewing_request_id, tenant_id, amount, paychangu_reference, payment_status, escrow_status
7. payouts: id, transaction_id, landlord_id, amount, payout_method, status
8. reports: id, reporter_id, reported_type, reported_property_id, reported_user_id, reason, status

Include all foreign keys, indexes, and constraints. Use UUIDs for IDs.
```

**Steps:**
1. Use Cursor to generate SQL (or manually create from Phase 3 schema)
2. Copy SQL to Supabase SQL Editor
3. Execute each CREATE TABLE statement
4. Verify all tables created in Table Editor

**Tables to create:**
- [ ] profiles
- [ ] properties
- [ ] property_images
- [ ] saved_properties
- [ ] viewing_requests
- [ ] transactions
- [ ] payouts
- [ ] reports

**Indexes to create:**
- [ ] properties: owner_id, status, location, price, created_at
- [ ] viewing_requests: tenant_id, landlord_id, property_id, status
- [ ] saved_properties: user_id, property_id
- [ ] transactions: viewing_request_id, payment_status
- [ ] reports: status, reported_property_id

**Validation:**
- [ ] All 8 tables visible in Supabase Table Editor
- [ ] Can insert test data manually
- [ ] Foreign keys working (can’t delete referenced rows)

---

### Afternoon Session (3-4 hours)

### Task 5: Supabase Auth Setup (45 minutes)

**Steps:**
1. Configure Supabase Auth:
- Go to Authentication → Settings
- Enable email provider
- Configure Site URL: `http://localhost:5173`
- Configure Redirect URLs: `http://localhost:5173/**`
- Enable email confirmations (optional for MVP)

1. Set up Row Level Security (RLS) policies:

**Cursor AI Prompt:**

```
Generate Supabase RLS policies for my tables:
- profiles: Users can read all, update own profile, admin can update all
- properties: Everyone can read available properties, owners can CRUD own properties, admin can CRUD all
- property_images: Same as properties
- saved_properties: Users can CRUD own saved properties
- viewing_requests: Tenants see own requests, landlords see requests for their properties
- transactions: Users see own transactions, admin sees all
- payouts: Landlords see own payouts, admin sees all
- reports: Users can create, admin can read/update all
```

1. Execute RLS policies in SQL Editor
2. Enable RLS on all tables:
    
    ```sql
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
    -- ... repeat for all tables
    ```
    
3. Test RLS:
    - Create test user
    - Try to query another user’s data (should fail)
    - Try to update another user’s property (should fail)

**Validation:**
- [ ] RLS enabled on all tables
- [ ] Policies restrict access correctly
- [ ] Test user can only see own data

---

### Task 6: Project Structure (30 minutes)

**Cursor AI Prompt:**

```
Create a React project structure with these folders and add index.js barrel exports where appropriate:
- src/components/ (layout/, property/, auth/, common/)
- src/pages/
- src/hooks/
- src/contexts/
- src/utils/
- src/lib/
- src/styles/
```

**Steps:**
1. Let Cursor scaffold the structure
2. Create path aliases in `vite.config.js`:
```javascript
import { defineConfig } from ‘vite’
import react from ‘@vitejs/plugin-react’
import path from ‘path’

export default defineConfig({
plugins: [react()],
resolve: {
alias: {
‘@’: path.resolve(__dirname, ‘./src’),
‘@components’: path.resolve(__dirname, ‘./src/components’),
‘@pages’: path.resolve(__dirname, ‘./src/pages’),
‘@hooks’: path.resolve(__dirname, ‘./src/hooks’),
‘@contexts’: path.resolve(__dirname, ‘./src/contexts’),
‘@utils’: path.resolve(__dirname, ‘./src/utils’),
‘@lib’: path.resolve(__dirname, ‘./src/lib’),
}
}
})
```

**Final Structure:**

```
src/
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── Layout.jsx
│   │   └── BottomNavBar.jsx
│   ├── property/
│   │   ├── PropertyCard.jsx
│   │   ├── PropertyGrid.jsx
│   │   └── PropertyFilters.jsx
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   └── SignUpForm.jsx
│   └── common/
│       ├── Button.jsx
│       ├── Input.jsx
│       └── Modal.jsx
├── pages/
│   ├── HomePage.jsx
│   ├── BrowsePage.jsx
│   ├── PropertyDetailPage.jsx
│   ├── LoginPage.jsx
│   ├── SignUpPage.jsx
│   └── DashboardPage.jsx
├── hooks/
│   ├── useAuth.js
│   └── useProperties.js
├── contexts/
│   └── AuthContext.jsx
├── utils/
│   ├── validation.js
│   └── formatting.js
├── lib/
│   └── supabase.js
└── styles/
    └── globals.css
```

**Validation:**
- [ ] All folders created
- [ ] Path aliases working (test an import)
- [ ] No errors when importing from aliases

---

### Task 7: Essential Dependencies (20 minutes)

**Steps:**
1. Install core packages:
`bash    npm install react-router-dom @tanstack/react-query react-hook-form zod @hookform/resolvers lucide-react`

1. Install dev dependencies:
    
    ```bash
    npm install -D @types/react
    ```
    

**Installed Packages:**
- `react-router-dom` - Routing
- `@tanstack/react-query` - Data fetching & caching
- `react-hook-form` - Form handling
- `zod` - Validation schema
- `@hookform/resolvers` - React Hook Form + Zod integration
- `lucide-react` - Icons

**Validation:**
- [ ] All packages installed successfully
- [ ] No peer dependency warnings
- [ ] `package.json` updated

---

### Task 8: Basic Authentication Implementation (90 minutes)

**Cursor AI Prompt:**

```
Create a complete authentication system using Supabase Auth:
1. AuthContext with signup, login, logout, and session management
2. Protected route component that redirects to login if not authenticated
3. Basic login page with email/password form
4. Basic signup page with email/password form
5. Store session in localStorage and handle refresh
```

**Files to Create:**

**1. `src/contexts/AuthContext.jsx`:**
- State: user, loading
- Functions: signUp, signIn, signOut, getUser
- Session persistence
- Automatic session refresh

**2. `src/components/auth/ProtectedRoute.jsx`:**
- Check if user authenticated
- Redirect to /login if not
- Show loading spinner while checking

**3. `src/pages/LoginPage.jsx`:**
- Email and password inputs
- Submit handler
- Error display
- Link to signup

**4. `src/pages/SignUpPage.jsx`:**
- Email and password inputs
- Submit handler
- Error display
- Link to login

**5. `src/App.jsx`:**
- Wrap app in AuthProvider
- Set up basic routes
- Add protected routes

**Example Auth Context Structure:**

```jsx
const AuthContext = createContext({})
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    // Check active sessions and subscribe to auth changes    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])
  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    return { data, error }
  }
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }
  const value = {
    user,    loading,    signUp,    signIn,    signOut,  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>}
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

**Testing Steps:**
1. Start dev server
2. Navigate to signup page
3. Register new account with email/password
4. Check email for verification link (if enabled)
5. Verify email (if required)
6. Login with credentials
7. Verify user object in console
8. Refresh page - should stay logged in
9. Logout
10. Try to access protected route - should redirect to login

**Validation:**
- [ ] Can register new user
- [ ] Verification email arrives (if enabled)
- [ ] Can login with correct credentials
- [ ] Cannot login with wrong password
- [ ] Session persists on page refresh
- [ ] Logout works
- [ ] Protected routes redirect when not logged in
- [ ] No console errors

---

### End of Day 1 Deliverables

**Completed:**
- [x] ✅ Working development environment
- [x] ✅ GitHub repository with initial commit
- [x] ✅ Supabase project configured
- [x] ✅ Complete database schema implemented (8 tables)
- [x] ✅ RLS policies active and tested
- [x] ✅ Authentication working (register, login, logout)
- [x] ✅ Project structure organized
- [x] ✅ Essential dependencies installed

**End of Day Checklist:**
- [ ] Can register a new user
- [ ] Can verify email (if enabled)
- [ ] Can login
- [ ] Can logout
- [ ] Session persists on page refresh
- [ ] Protected routes redirect to login
- [ ] All database tables visible in Supabase dashboard
- [ ] No console errors
- [ ] Code committed to GitHub

**Screenshots to Capture:**
- Login page
- Signup page
- Supabase dashboard showing all tables
- Console showing successful authentication

**Notes Section:**

```
Blockers encountered:
- [List any issues]

Solutions found:
- [How you solved them]

Decisions made:
- [Any architectural decisions]

Questions for tomorrow:
- [Any unclear items]

Hours worked: [X hours]
Energy level: [Low/Medium/High]
```

---

## Milestone 2: Core UI & Property Listings

**Duration:** Days 2-3 (12-16 hours)

**Status:** ⬜ Not Started

**Priority:** HIGH - Core functionality

---

### Day 2 - Morning Session (4 hours)

### Task 1: Design System Setup (45 minutes)

**Cursor AI Prompt:**

```
Create a Tailwind design system with these colors:
- Primary: #E4B012 (golden yellow)
- Secondary: #1E3A5F (deep navy)
- Accent: #2E7D6B (muted teal)
- Background: #F8F9FA (off-white)
- Surface: #FFFFFF (white)
- Text: #333333 (dark gray)
- Text Light: #6B7280 (medium gray)
- Error: #DC3545 (red)

Also create reusable Button, Input, and Card components with variants.
```

**Files to Create:**

**1. Update `tailwind.config.js`:**

```jsx
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E4B012',          dark: '#C29910',          light: '#F0C64D',        },        secondary: {
          DEFAULT: '#1E3A5F',          dark: '#152B47',          light: '#2E5282',        },        accent: {
          DEFAULT: '#2E7D6B',          dark: '#236356',          light: '#3E9D87',        },        background: '#F8F9FA',        surface: '#FFFFFF',        text: {
          DEFAULT: '#333333',          light: '#6B7280',        },        error: '#DC3545',      },    },  },  plugins: [],}
```

**2. `src/components/common/Button.jsx`:**
- Variants: primary, secondary, outline, ghost
- Sizes: sm, md, lg
- Loading state
- Disabled state

**3. `src/components/common/Input.jsx`:**
- Standard text input
- Error state styling
- Label support
- Icon support (left/right)

**4. `src/components/common/Card.jsx`:**
- Basic card with padding
- Card with header/footer sections
- Hover effects

**Testing:**
Create a showcase page to test all components with different variants.

**Validation:**
- [ ] All colors working in Tailwind
- [ ] Button component has all variants
- [ ] Input component shows errors correctly
- [ ] Card component renders properly
- [ ] Components are mobile responsive

---

### Task 2: Layout Components (60 minutes)

**Cursor AI Prompt:**

```
Create responsive navigation components:
1. Navbar: Logo on left, nav links in center, login/profile on right. Mobile: hamburger menu.
2. Footer: Company info, links, social icons
3. Layout wrapper that includes Navbar and Footer
4. BottomNavBar for mobile: Home, Search, Dashboard icons

Use Tailwind CSS and make fully responsive. Include mobile menu drawer.
```

**Files to Create:**

**1. `src/components/layout/Navbar.jsx`:**
- Desktop: horizontal nav with logo, links, auth buttons
- Mobile: hamburger menu → drawer
- Sticky on scroll
- Show different links based on auth state
- Show different links based on user role

**2. `src/components/layout/Footer.jsx`:**
- Company information
- Quick links
- Social media icons (if applicable)
- Copyright notice

**3. `src/components/layout/Layout.jsx`:**
- Wraps children with Navbar and Footer
- Handles page padding/margins
- Provides consistent layout

**4. `src/components/layout/BottomNavBar.jsx`:**
- Only visible on mobile (<768px)
- Fixed at bottom
- Icons for: Home, Search, Dashboard
- Active state highlighting
- Only shows when logged in

**Nav Links Structure:**

```jsx
// Guest user- Home
- Browse Properties
- Login
- Sign Up
// Logged in Tenant- Home
- Browse Properties
- Saved Properties
- Dashboard
// Logged in Landlord/Agent- Home
- Browse Properties
- My Listings
- Add Property
- Dashboard
// Admin- Dashboard
- Users
- Properties
- Reports
- Payouts
```

**Validation:**
- [ ] Navbar responsive (desktop and mobile)
- [ ] Mobile hamburger menu works
- [ ] Footer displays correctly
- [ ] Layout wrapper applies to all pages
- [ ] Bottom nav shows only on mobile
- [ ] Bottom nav shows only when logged in
- [ ] Active link highlighted

---

### Task 3: Homepage (90 minutes)

**Cursor AI Prompt:**

```
Create a property listing homepage with:
1. Hero section: large heading, subtitle, search bar
2. Featured properties section: grid of 4-6 property cards
3. Recent properties section: grid of property cards with "Load More"
4. CTA section: "Are you a landlord? List your property"

Use Tailwind CSS, make mobile responsive (2 columns on mobile, 3-4 on desktop).
Create PropertyCard component that shows: image, price, location, bedrooms, "Available" badge, heart icon.
Use placeholder data for now.
```

**Files to Create:**

**1. `src/pages/HomePage.jsx`:**
- Hero section with search
- Featured properties
- Recent properties
- CTA sections

**2. `src/components/property/PropertyCard.jsx`:**
- Property image (with fallback)
- Price with “MWK” and “/month”
- Title
- Location
- Quick stats (bedrooms, bathrooms, property type)
- “Available” or “Unavailable” badge
- Heart icon (save functionality - connected later)
- Link to property detail page

**Example PropertyCard Layout:**

```
┌─────────────────────────────┐
│ [Image]                 1/5 │
├─────────────────────────────┤
│ MWK 150,000/month       ♡   │
│ 3 Bed House in Area 47      │
│ 🛏 3  🚿 2  🏠 House        │
│ ● Available                  │
└─────────────────────────────┘
```

**Mock Data:**
Create `src/utils/mockData.js` with 10-15 mock properties:

```jsx
export const mockProperties = [
  {
    id: 1,    title: "Modern 3 Bedroom House",    location: "Area 47",    price: 150000,    bedrooms: 3,    bathrooms: 2,    property_type: "house",    status: "available",    image: "https://via.placeholder.com/400x300",  },  // ... more properties]
```

**Validation:**
- [ ] Homepage loads without errors
- [ ] Hero section displays correctly
- [ ] Property cards show all information
- [ ] Grid responsive (2 cols mobile, 3-4 desktop)
- [ ] Images load with fallback
- [ ] “Load More” button visible
- [ ] Page looks good on mobile and desktop

---

### Day 2 - Afternoon Session (4 hours)

### Task 4: Property Listing Form - Part 1 (120 minutes)

**Cursor AI Prompt:**

```
Create a multi-step property listing form with React Hook Form and Zod validation:

Step 1 - Basic Details:
- Title (required, max 30 chars)
- Description (required, max 1500 chars, textarea)
- Location (required, dropdown or text)

Step 2 - Pricing:
- Monthly rent (required, min 5000, max 999999999 MWK)
- Viewing fee (required, min 0, max 999999 MWK)

Step 3 - Property Details:
- Bedrooms (required, min 0, max 20)
- Bathrooms (required, min 0, max 20)
- Property type (required, dropdown: house/apartment/room/shop/office)
- Amenities (checkboxes: WiFi, Parking, Generator, Water Tank, Garden, Security, etc.)

Step 4 - Images:
- Image upload component (will add later)

Include: Step indicator, Previous/Next buttons, validation on each step, submit button on last step.
```

**Files to Create:**

**1. `src/pages/AddPropertyPage.jsx`:**
- Multi-step form state management
- Step indicators (1, 2, 3, 4)
- Navigation between steps
- Form submission handler (placeholder for now)

**2. `src/utils/validation.js`:**

```jsx
import { z } from 'zod'export const propertySchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(30, 'Title must be 30 characters or less'),  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(1500, 'Description must be 1500 characters or less'),  location: z.string()
    .min(1, 'Location is required'),  price: z.number()
    .min(5000, 'Minimum rent is MWK 5,000')
    .max(999999999, 'Maximum rent is MWK 999,999,999'),  viewing_fee: z.number()
    .min(0, 'Viewing fee cannot be negative')
    .max(999999, 'Maximum viewing fee is MWK 999,999'),  bedrooms: z.number()
    .min(0, 'Bedrooms cannot be negative')
    .max(20, 'Maximum 20 bedrooms'),  bathrooms: z.number()
    .min(0, 'Bathrooms cannot be negative')
    .max(20, 'Maximum 20 bathrooms'),  property_type: z.enum(['house', 'apartment', 'room', 'shop', 'office']),  amenities: z.array(z.string()).optional(),})
```

**3. Form field components:**
- Reusable field wrappers with labels and errors
- Dropdown/select component
- Checkbox group component
- Textarea component

**Amenities List:**

```jsx
const amenitiesList = [
  'WiFi',  'Parking',  'Generator',  'Water Tank',  'Garden',  'Security Guard',  'CCTV',  'Furnished',  'Air Conditioning',  'Kitchen Appliances',]
```

**Step Indicator Design:**

```
○ Basic Details  →  ○ Pricing  →  ○ Details  →  ○ Images
```

**Validation:**
- [ ] All form fields render correctly
- [ ] Step navigation works (Next/Previous)
- [ ] Can’t proceed to next step with invalid data
- [ ] Validation errors display clearly
- [ ] Form data persists when going back
- [ ] Mobile responsive
- [ ] All field types working (text, number, select, checkbox)

---

### Task 5: Supabase Storage Setup (45 minutes)

**Steps:**
1. Go to Supabase Dashboard → Storage
2. Create new bucket: `property-images`
3. Set bucket to **public**
4. Configure storage policies:

```sql
-- Allow authenticated users to upload imagesCREATE POLICY "Users can upload images"ON storage.objects FOR INSERTTO authenticatedWITH CHECK (bucket_id = 'property-images');
-- Allow public read accessCREATE POLICY "Public can view images"ON storage.objects FOR SELECTTO publicUSING (bucket_id = 'property-images');
-- Allow users to delete their own imagesCREATE POLICY "Users can delete own images"ON storage.objects FOR DELETETO authenticatedUSING (bucket_id = 'property-images' AND auth.uid() = owner);
```

1. Test upload via Supabase Dashboard:
    - Upload a test image
    - Get public URL
    - Verify accessible in browser

**Validation:**
- [ ] Bucket created and public
- [ ] Policies active
- [ ] Can upload via dashboard
- [ ] Public URL works
- [ ] Image loads in browser

---

### Task 6: Image Upload Component (75 minutes)

**Cursor AI Prompt:**

```
Create an image upload component with these features:
1. Drag & drop area
2. Click to select files (multiple selection, max 10)
3. Client-side image compression before upload (target <300KB)
4. Preview thumbnails with delete button
5. Set one image as primary (radio button on each thumbnail)
6. Upload progress indicator
7. Error handling (file too large, wrong format, etc.)

Use browser-image-compression library. Accept only jpg, jpeg, png, webp.
Integrate with Supabase Storage bucket 'property-images'.
```

**Steps:**
1. Install image compression library:
`bash    npm install browser-image-compression`

1. Create `src/components/property/ImageUpload.jsx`:
    - Drag & drop zone
    - File input (hidden, triggered by button)
    - Image preview grid
    - Primary image selection
    - Delete buttons
    - Compression logic
    - Upload to Supabase Storage

**Compression Settings:**

```jsx
const options = {
  maxSizeMB: 0.3,          // 300KB  maxWidthOrHeight: 1200,  // Max dimension  useWebWorker: true,  fileType: 'image/webp'   // Convert to WebP}
```

**Upload Logic:**

```jsx
const uploadImage = async (file) => {
  // 1. Compress image  const compressedFile = await imageCompression(file, options)
  // 2. Generate unique filename  const fileName = `${Date.now()}-${file.name}`  // 3. Upload to Supabase  const { data, error } = await supabase.storage    .from('property-images')
    .upload(fileName, compressedFile)
  // 4. Get public URL  const { data: { publicUrl } } = supabase.storage    .from('property-images')
    .getPublicUrl(fileName)
  return publicUrl
}
```

**UI Design:**

```
┌─────────────────────────────────────────┐
│  Drag & drop images here                │
│  or click to select files               │
│  (Max 10 images, JPG/PNG/WEBP)          │
└─────────────────────────────────────────┘

Preview:
┌─────┐ ┌─────┐ ┌─────┐
│Img1 │ │ Img2│ │ Img3│
│  ○  │ │  ●  │ │  ○  │  ← Primary selection
│  X  │ │  X  │ │  X  │  ← Delete buttons
└─────┘ └─────┘ └─────┘
```

**Validation:**
- [ ] Can drag & drop images
- [ ] Can click to select images
- [ ] Multiple selection works (up to 10)
- [ ] Images compressed before upload
- [ ] Upload progress shown
- [ ] Thumbnails display correctly
- [ ] Can set primary image
- [ ] Can delete images
- [ ] Error shown for invalid files (wrong format, too large)
- [ ] Uploaded images accessible via public URL

---

### Day 2 End of Day

**Deliverables:**
- [x] ✅ Complete design system (colors, buttons, inputs, cards)
- [x] ✅ Responsive layout (navbar, footer, bottom nav)
- [x] ✅ Homepage with property grid and mock data
- [x] ✅ Multi-step property listing form (all fields)
- [x] ✅ Supabase Storage configured
- [x] ✅ Image upload component working with compression

**Screenshots to Capture:**
- Homepage (mobile + desktop)
- Property card component
- Add property form (all steps)
- Image upload component with previews
- Supabase Storage with uploaded images

**End of Day Checklist:**
- [ ] All components responsive
- [ ] No console errors
- [ ] Images upload and compress correctly
- [ ] Form validation working
- [ ] Code committed to GitHub

---

### Day 3 - Morning Session (4 hours)

### Task 7: Property Listing Form - Part 2 (90 minutes)

**Cursor AI Prompt:**

```
Complete the property listing form submission:
1. Integrate ImageUpload component into Step 4
2. Create handleSubmit function that:
   - Uploads all images to Supabase Storage
   - Gets public URLs for each image
   - Saves property data to 'properties' table
   - Saves image URLs to 'property_images' table (with is_primary flag)
   - Shows success message
   - Redirects to "My Listings" page
3. Handle errors gracefully (network failure, storage failure, database failure)
4. Show loading state during submission
```

**Implementation Steps:**

**1. Update `AddPropertyPage.jsx` with submission logic:**

```jsx
const handleSubmit = async (formData) => {
  setSubmitting(true)
  try {
    // 1. Upload images and get URLs    const imageUrls = await uploadImages(selectedImages)
    // 2. Insert property    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .insert({
        owner_id: user.id,        title: formData.title,        description: formData.description,        location: formData.location,        price: formData.price,        viewing_fee: formData.viewing_fee,        bedrooms: formData.bedrooms,        bathrooms: formData.bathrooms,        property_type: formData.property_type,        amenities: formData.amenities,        status: 'available',      })
      .select()
      .single()
    if (propertyError) throw propertyError
    // 3. Insert property images    const imageInserts = imageUrls.map((url, index) => ({
      property_id: property.id,      image_url: url,      is_primary: index === primaryImageIndex,      display_order: index,    }))
    const { error: imagesError } = await supabase
      .from('property_images')
      .insert(imageInserts)
    if (imagesError) throw imagesError
    // 4. Success!    toast.success('Property listed successfully!')
    navigate('/dashboard/listings')
  } catch (error) {
    console.error('Error creating property:', error)
    toast.error('Failed to create property. Please try again.')
  } finally {
    setSubmitting(false)
  }
}
```

**2. Add loading/success states:**
- Show spinner during submission
- Disable form during submission
- Show success message
- Clear form after success

**Validation:**
- [ ] Form submits successfully
- [ ] Property saved to database
- [ ] All images saved to property_images table
- [ ] Primary image flag set correctly
- [ ] Success message shown
- [ ] Redirects to listings page
- [ ] Loading state shown during submission
- [ ] Error handling works (test by disconnecting internet)

---

### Task 8: Property Detail Page (90 minutes)

**Cursor AI Prompt:**

```
Create a property detail page that fetches a property by ID and displays:
1. Image carousel with image counter (1/5)
2. Property title, price (/month), location
3. Quick stats row: bedrooms, bathrooms, property type
4. "Available" or "Unavailable" badge
5. Full description (expandable if >300 chars)
6. Amenities grid with icons
7. Property overview table (bedrooms, bathrooms, type, viewing fee)
8. Sticky "Request Viewing" button (only for tenants, only if available)
9. Landlord/agent info section (name, phone)
10. Save button (heart icon)
11. Report button
12. Share button

Make fully mobile responsive. Handle loading state and 404 not found.
```

**Files to Create:**

**1. `src/pages/PropertyDetailPage.jsx`:**
- Fetch property by ID from URL params
- Fetch property images
- Fetch landlord/agent info
- Display all property details
- Handle loading and error states

**2. `src/components/property/ImageCarousel.jsx`:**
- Display images in carousel
- Previous/Next buttons
- Image counter (1/5)
- Thumbnail strip below (optional)
- Click to view full-screen (optional for MVP)

**Image Carousel Design:**

```
┌─────────────────────────────────────┐
│  ←  [Property Image]  →         1/5 │
│                                     │
└─────────────────────────────────────┘
[thumb][thumb][thumb][thumb][thumb]
```

**Property Detail Layout (Mobile):**

```
┌─────────────────────────────────┐
│ [Image Carousel]            1/5 │
├─────────────────────────────────┤
│ MWK 150,000/month           ♡   │
│ Modern 3 Bedroom House          │
│ Area 47, Lilongwe               │
│                                 │
│ 🛏 3  🚿 2  🏠 House        ● Available │
│                                 │
│ Description                     │
│ [Full description text...]      │
│ [Read more]                     │
│                                 │
│ Amenities                       │
│ ✓ WiFi  ✓ Parking  ✓ Generator │
│                                 │
│ Property Overview               │
│ Bedrooms:     3                 │
│ Bathrooms:    2                 │
│ Property Type: House            │
│ Viewing Fee:  MWK 5,000         │
│                                 │
│ Listed by                       │
│ John Doe (Landlord)             │
│ +265 888 123 456                │
│                                 │
│ [Request Viewing - MWK 5,000]   │ ← Sticky button
└─────────────────────────────────┘
```

**Query to fetch property:**

```jsx
const { data: property, error } = await supabase
  .from('properties')
  .select(`    *,    property_images (*),    profiles!owner_id (      full_name,      phone,      role    )  `)
  .eq('id', propertyId)
  .single()
```

**Validation:**
- [ ] Property fetched by ID from URL
- [ ] All property details display correctly
- [ ] Image carousel works (next/prev)
- [ ] Image counter updates
- [ ] Description expandable if long
- [ ] Amenities displayed with icons
- [ ] Landlord info displayed
- [ ] “Request Viewing” button shown (only for tenants)
- [ ] “Request Viewing” button hidden if unavailable
- [ ] Save button (heart) present
- [ ] Report button present
- [ ] Loading state shown while fetching
- [ ] 404 page shown if property not found
- [ ] Mobile responsive

---

### Day 3 - Afternoon Session (4 hours)

### Task 9: Browse & Search Page (120 minutes)

**Cursor AI Prompt:**

```
Create a property browse page with advanced filtering:

Filters:
- Location (dropdown: Area 43, Area 47, Kanengo, etc.)
- Price range (min/max inputs or slider)
- Bedrooms (dropdown: Any, 1, 2, 3, 4+)
- Property type (checkboxes: house, apartment, room, shop, office)
- Status (toggle: Available only)

Layout:
- Filter sidebar on desktop (collapsible drawer on mobile)
- Property grid (2 cols mobile, 3-4 desktop)
- Sort dropdown (Newest, Price: Low to High, Price: High to Low)
- Results count ("Showing 12 of 48 properties")
- "Load More" button (pagination - 12 per page)

Implement filtering using Supabase queries. Update URL params so users can share filtered results.
```

**Files to Create:**

**1. `src/pages/BrowsePage.jsx`:**
- Fetch properties with filters
- Filter state management
- Sort state management
- Pagination state management
- URL params sync

**2. `src/components/property/PropertyFilters.jsx`:**
- All filter controls
- Reset filters button
- Apply filters button (mobile)

**3. `src/components/property/PropertyGrid.jsx`:**
- Grid of PropertyCard components
- Loading skeleton
- Empty state (“No properties found”)

**Filter Component Design (Desktop):**

```
┌─────────────┬─────────────────────────────┐
│ Filters     │ [Sort: Newest ▼]   48 found │
│             │                             │
│ Location    │ ┌───┐ ┌───┐ ┌───┐ ┌───┐   │
│ [Dropdown]  │ │   │ │   │ │   │ │   │   │
│             │ └───┘ └───┘ └───┘ └───┘   │
│ Price Range │                             │
│ Min: [    ] │ ┌───┐ ┌───┐ ┌───┐ ┌───┐   │
│ Max: [    ] │ │   │ │   │ │   │ │   │   │
│             │ └───┘ └───┘ └───┘ └───┘   │
│ Bedrooms    │                             │
│ [Dropdown]  │ ┌───┐ ┌───┐ ┌───┐ ┌───┐   │
│             │ │   │ │   │ │   │ │   │   │
│ Type        │ └───┘ └───┘ └───┘ └───┘   │
│ ☐ House     │                             │
│ ☐ Apartment │      [Load More (12/48)]    │
│             │                             │
│ [Reset]     │                             │
└─────────────┴─────────────────────────────┘
```

**Supabase Query with Filters:**

```jsx
let query = supabase
  .from('properties')
  .select('*, property_images(*)', { count: 'exact' })
  .eq('status', 'available')
// Apply filtersif (filters.location) {
  query = query.eq('location', filters.location)
}
if (filters.minPrice) {
  query = query.gte('price', filters.minPrice)
}
if (filters.maxPrice) {
  query = query.lte('price', filters.maxPrice)
}
if (filters.bedrooms && filters.bedrooms !== 'any') {
  query = query.eq('bedrooms', filters.bedrooms)
}
if (filters.propertyTypes.length > 0) {
  query = query.in('property_type', filters.propertyTypes)
}
// Apply sortingif (sort === 'price_asc') {
  query = query.order('price', { ascending: true })
} else if (sort === 'price_desc') {
  query = query.order('price', { ascending: false })
} else {
  query = query.order('created_at', { ascending: false })
}
// Paginationquery = query.range(from, to)
const { data, error, count } = await query
```

**URL Params Example:**

```
/browse?location=Area+47&minPrice=50000&maxPrice=200000&bedrooms=3&sort=price_asc
```

**Validation:**
- [ ] All properties load initially
- [ ] Location filter works
- [ ] Price range filter works
- [ ] Bedrooms filter works
- [ ] Property type filter works
- [ ] Multiple filters work together
- [ ] Sort dropdown works
- [ ] Results count accurate
- [ ] “Load More” loads next 12 properties
- [ ] URL updates with filters (shareable)
- [ ] Filters persist on page refresh
- [ ] Reset filters button clears all
- [ ] Mobile: filters in drawer
- [ ] Empty state shown when no results
- [ ] Loading skeleton shown while fetching

---

### Task 10: Search Functionality (60 minutes)

**Cursor AI Prompt:**

```
Add keyword search functionality that searches property titles, descriptions, and locations.
Add search bar to navbar that redirects to browse page with search query.
Implement search using Supabase .ilike() or .textSearch().
Highlight search query in results (optional for MVP).
```

**Implementation:**

**1. Add search bar to `Navbar.jsx`:**

```jsx
const [searchQuery, setSearchQuery] = useState('')
const handleSearch = (e) => {
  e.preventDefault()
  navigate(`/browse?search=${encodeURIComponent(searchQuery)}`)
}
return (
  <form onSubmit={handleSearch}>    <input
      type="text"      placeholder="Search properties..."      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />    <button type="submit">Search</button>  </form>)
```

**2. Update `BrowsePage.jsx` to handle search:**

```jsx
const searchQuery = new URLSearchParams(location.search).get('search')
// In Supabase queryif (searchQuery) {
  query = query.or(
    `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`  )
}
```

**Search Bar Design (Desktop Navbar):**

```
┌──────────────────────────────────┐
│ [Logo]  [🔍 Search properties...] [Browse] [Login] │
└──────────────────────────────────┘
```

**Validation:**
- [ ] Search bar in navbar
- [ ] Search submits on Enter
- [ ] Redirects to browse page with query param
- [ ] Search results display correctly
- [ ] Searches title, description, and location
- [ ] Case-insensitive search
- [ ] “No results” shown when no matches
- [ ] Search query visible in URL (shareable)
- [ ] Search works with other filters

---

### Day 3 End of Day

**Deliverables:**
- [x] ✅ Property creation fully working (form → upload → database)
- [x] ✅ Property detail page complete with carousel
- [x] ✅ Browse page with advanced filters working
- [x] ✅ Search functionality working
- [x] ✅ Properties searchable immediately after creation
- [x] ✅ All UI responsive on mobile

**Screenshots to Capture:**
- Property detail page (mobile + desktop)
- Browse page with filters (mobile + desktop)
- Search results page
- Newly created property appearing in search

**End of Day Checklist:**
- [ ] Can create property from start to finish
- [ ] Property appears in browse immediately
- [ ] Can search for property by keyword
- [ ] Can filter properties by all criteria
- [ ] Property detail page shows all info correctly
- [ ] All pages responsive
- [ ] No console errors
- [ ] Code committed to GitHub

**Testing:**
1. Create 5 test properties with different attributes
2. Search for each property by title
3. Filter by each criterion (location, price, bedrooms, type)
4. Combine multiple filters
5. Click on property → view detail page
6. Navigate back to browse → filters preserved

---

## Milestone 3: User Features & Dashboards

**Duration:** Days 4-5 (12-16 hours)

**Status:** ⬜ Not Started

**Priority:** HIGH - Core user experience

---

### Day 4 - Morning Session (4 hours)

### Task 1: Enhanced User Registration (45 minutes)

**Cursor AI Prompt:**

```
Update the registration form to include:
1. Role selection (radio buttons: Tenant, Landlord, Agent)
2. Full name field
3. Phone number field (format: +265 followed by 9 digits)
4. Zod validation for all fields
5. On submit: create auth user + create profile in profiles table
6. Handle agent role: set status to "pending" (cannot access features until approved)
```

**Updates to `SignUpPage.jsx`:**

**New Fields:**
- Full name (text input)
- Phone number (text input with validation)
- Role selector (radio buttons or dropdown)
- Email (existing)
- Password (existing)

**Validation Schema:**

```jsx
const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),  password: z.string().min(8, 'Password must be at least 8 characters'),  full_name: z.string().min(2, 'Name must be at least 2 characters'),  phone: z.string().regex(/^\+2659\d{8}$/, 'Phone must be +265 followed by 9 digits'),  role: z.enum(['tenant', 'landlord', 'agent']),})
```

**Submit Handler:**

```jsx
const handleSignUp = async (formData) => {
  // 1. Create auth user  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: formData.email,    password: formData.password,  })
  if (authError) throw authError
  // 2. Create profile  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,      email: formData.email,      full_name: formData.full_name,      phone: formData.phone,      role: formData.role,      status: formData.role === 'agent' ? 'pending' : 'active',    })
  if (profileError) throw profileError
  // 3. Show appropriate message  if (formData.role === 'agent') {
    toast.info('Your agent application is under review. You will be notified once approved.')
  } else {
    toast.success('Registration successful! Please check your email to verify.')
  }
}
```

**Validation:**
- [ ] All new fields render correctly
- [ ] Phone validation works (+265 format)
- [ ] Role selection works
- [ ] Profile created in database on registration
- [ ] Agent registration sets status to “pending”
- [ ] Appropriate message shown based on role
- [ ] Form validation prevents submission with invalid data

---

### Task 2: User Profile Page (60 minutes)

**Cursor AI Prompt:**

```
Create a user profile page where users can view and edit their information:
- Display: Full name, email, phone, role, avatar
- Editable: Full name, phone, payout details (for landlords/agents only)
- Password change section (current password, new password, confirm)
- Avatar upload (optional for MVP)
- Save changes button

For landlords/agents, add payout settings:
- Payout method (dropdown: Mobile Money, Bank Account)
- Provider (if Mobile Money: Airtel, TNM)
- Account number
- Account name
```

**File to Create:**

**`src/pages/ProfilePage.jsx`:**
- Fetch current user profile
- Form with all editable fields
- Conditional payout fields (only for landlord/agent)
- Save handler updates profiles table
- Password change handler uses Supabase auth

**Profile Layout:**

```
┌─────────────────────────────────┐
│ Profile                         │
├─────────────────────────────────┤
│ [Avatar]         [Upload Photo] │
│                                 │
│ Full Name:    [John Doe      ] │
│ Email:         john@example.com │
│                (cannot change)  │
│ Phone:        [+265888123456  ] │
│ Role:          Landlord         │
│                (cannot change)  │
│                                 │
│ [Only if Landlord/Agent]        │
│ Payout Settings                 │
│ Method:       [Mobile Money ▼] │
│ Provider:     [Airtel       ▼] │
│ Account #:    [0888123456    ] │
│ Account Name: [John Doe      ] │
│                                 │
│ Change Password                 │
│ Current:      [**********    ] │
│ New:          [**********    ] │
│ Confirm:      [**********    ] │
│                                 │
│            [Save Changes]       │
└─────────────────────────────────┘
```

**Save Handler:**

```jsx
const handleSave = async (formData) => {
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: formData.full_name,      phone: formData.phone,      payout_method: formData.payout_method,      payout_provider: formData.payout_provider,      payout_account_number: formData.payout_account_number,      payout_account_name: formData.payout_account_name,    })
    .eq('id', user.id)
  if (error) throw error
  toast.success('Profile updated successfully')
}
```

**Password Change Handler:**

```jsx
const handlePasswordChange = async (formData) => {
  const { error } = await supabase.auth.updateUser({
    password: formData.new_password,  })
  if (error) throw error
  toast.success('Password updated successfully')
}
```

**Validation:**
- [ ] Profile fetched and displayed
- [ ] Can edit name and phone
- [ ] Payout fields shown only for landlord/agent
- [ ] Payout fields hidden for tenants
- [ ] Changes save correctly
- [ ] Password change works
- [ ] Error handling for invalid data
- [ ] Success message shown

---

### Task 3: Save Property Feature (45 minutes)

**Cursor AI Prompt:**

```
Implement save/unsave property functionality:
1. Add heart icon to PropertyCard and PropertyDetailPage
2. Check if property is already saved (for logged-in users)
3. On click: toggle saved state
4. If saved: add to saved_properties table
5. If unsaved: remove from saved_properties table
6. Update UI immediately (filled heart vs outline heart)
7. If user not logged in: redirect to login with return URL
```

**Implementation:**

**1. Update `PropertyCard.jsx` to include save button:**

```jsx
const [isSaved, setIsSaved] = useState(false)
const { user } = useAuth()
useEffect(() => {
  if (user) {
    checkIfSaved()
  }
}, [user, property.id])
const checkIfSaved = async () => {
  const { data } = await supabase
    .from('saved_properties')
    .select('id')
    .eq('user_id', user.id)
    .eq('property_id', property.id)
    .single()
  setIsSaved(!!data)
}
const handleToggleSave = async () => {
  if (!user) {
    navigate(`/login?return=${encodeURIComponent(location.pathname)}`)
    return  }
  if (isSaved) {
    await supabase
      .from('saved_properties')
      .delete()
      .eq('user_id', user.id)
      .eq('property_id', property.id)
    setIsSaved(false)
    toast.success('Property unsaved')
  } else {
    await supabase
      .from('saved_properties')
      .insert({ user_id: user.id, property_id: property.id })
    setIsSaved(true)
    toast.success('Property saved')
  }
}
return (
  <div className="property-card">    {/* ... property details */}
    <button onClick={handleToggleSave}>      {isSaved ? <HeartSolid /> : <HeartOutline />}
    </button>  </div>)
```

**2. Also add to `PropertyDetailPage.jsx`**

**Heart Icon States:**
- Not saved: Outline heart ♡
- Saved: Filled heart ♥

**Validation:**
- [ ] Heart icon visible on property cards
- [ ] Heart icon visible on property detail page
- [ ] Clicking heart when logged out redirects to login
- [ ] Clicking heart when logged in saves property
- [ ] Heart icon updates immediately (filled/outline)
- [ ] Saved state persists on page refresh
- [ ] Unsaving works correctly
- [ ] Toast notifications shown

---

### Task 4: Tenant Dashboard (90 minutes)

**Cursor AI Prompt:**

```
Create a tenant dashboard that shows:
1. Stats overview (total saved properties, total viewing requests)
2. Saved properties section (grid of property cards with unsave option)
3. Viewing requests section (will populate later when viewing requests implemented)
4. Quick actions: Browse Properties, Search

Fetch saved properties with a join to properties table.
Show "unavailable" badge if property no longer available.
Handle empty states ("No saved properties yet").
```

**File to Create:**

**`src/pages/TenantDashboard.jsx`:**

**Layout:**

```
┌─────────────────────────────────────────┐
│ Dashboard                               │
├─────────────────────────────────────────┤
│ ┌─────────┐  ┌─────────┐  ┌─────────┐ │
│ │  📌 5   │  │  👁️ 3   │  │  ✓ 2   │ │
│ │ Saved   │  │ Pending │  │Complete │ │
│ └─────────┘  └─────────┘  └─────────┘ │
│                                         │
│ Saved Properties                        │
│ ┌───────┐ ┌───────┐ ┌───────┐         │
│ │       │ │       │ │       │         │
│ │ Card  │ │ Card  │ │ Card  │         │
│ │   ♥   │ │   ♥   │ │   ♥   │         │
│ └───────┘ └───────┘ └───────┘         │
│                                         │
│ Viewing Requests                        │
│ (Coming soon after viewing requests     │
│  feature is implemented)                │
└─────────────────────────────────────────┘
```

**Query for Saved Properties:**

```jsx
const { data, error } = await supabase
  .from('saved_properties')
  .select(`    id,    created_at,    properties (      *,      property_images (        image_url,        is_primary      )    )  `)
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
```

**Empty State:**

```
┌─────────────────────────────────┐
│   📌                            │
│   No saved properties yet       │
│                                 │
│   Start browsing to save        │
│   properties you like!          │
│                                 │
│   [Browse Properties]           │
└─────────────────────────────────┘
```

**Validation:**
- [ ] Stats cards show correct counts
- [ ] Saved properties fetched and displayed
- [ ] Each property card has unsave button (heart)
- [ ] Unsaving removes property from dashboard
- [ ] “Unavailable” badge shown if property status changed
- [ ] Empty state shown when no saved properties
- [ ] Quick action buttons work
- [ ] Mobile responsive

---

### Day 4 - Afternoon Session (4 hours)

### Task 5: Landlord Dashboard - Part 1 (120 minutes)

**Cursor AI Prompt:**

```
Create a landlord dashboard that shows:
1. Stats overview (total properties, total views, total saves, total viewing requests)
2. My listings section (grid/list view toggle)
3. Each listing shows: image, title, price, status, view count, save count
4. Actions per listing: Edit, Delete, Mark as Unavailable/Available
5. Quick action: Add Property
6. Viewing requests section (will populate later)

Fetch properties where owner_id = current user.
Calculate aggregated stats from viewing_requests table.
Handle empty state ("No properties listed yet").
```

**File to Create:**

**`src/pages/LandlordDashboard.jsx`:**

**Layout:**

```
┌─────────────────────────────────────────┐
│ Dashboard                      [+ Add]  │
├─────────────────────────────────────────┤
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │
│ │ 🏠 8│ │👁️152│ │ ♥ 23│ │ 📅 5│       │
│ │Props│ │Views│ │Saves│ │ Reqs│       │
│ └─────┘ └─────┘ └─────┘ └─────┘       │
│                                         │
│ My Listings                  [Grid][List]│
│ ┌───────────────────────────────────┐  │
│ │ [Img] 3 Bed House - Area 47      │  │
│ │       MWK 150,000/month           │  │
│ │       ● Available                 │  │
│ │       👁️ 24  ♥ 5                  │  │
│ │       [Edit] [Delete] [Unavail]   │  │
│ └───────────────────────────────────┘  │
│ ┌───────────────────────────────────┐  │
│ │ [Img] 2 Bed Apartment - Kanengo  │  │
│ │       ... (similar)                │  │
│ └───────────────────────────────────┘  │
│                                         │
│ Viewing Requests                        │
│ (Coming soon)                           │
└─────────────────────────────────────────┘
```

**Stats Queries:**

```jsx
// Total propertiesconst { count: totalProperties } = await supabase
  .from('properties')
  .select('*', { count: 'exact', head: true })
  .eq('owner_id', user.id)
// Total views (sum of all property view_counts)const { data: viewData } = await supabase
  .from('properties')
  .select('view_count')
  .eq('owner_id', user.id)
const totalViews = viewData.reduce((sum, p) => sum + (p.view_count || 0), 0)
// Total savesconst { count: totalSaves } = await supabase
  .from('saved_properties')
  .select('*', { count: 'exact', head: true })
  .eq('properties.owner_id', user.id)
  .join('properties', { on: 'property_id' })
// Total viewing requestsconst { count: totalRequests } = await supabase
  .from('viewing_requests')
  .select('*', { count: 'exact', head: true })
  .eq('landlord_id', user.id)
```

**Properties Query:**

```jsx
const { data, error } = await supabase
  .from('properties')
  .select(`    *,    property_images (      image_url,      is_primary    )  `)
  .eq('owner_id', user.id)
  .order('created_at', { ascending: false })
```

**Actions:**
- Edit → Navigate to `/properties/edit/:id`
- Delete → Confirm modal → Delete property + images
- Mark Unavailable → Update status to ‘unavailable’
- Mark Available → Update status to ‘available’

**Validation:**
- [ ] Stats cards show correct numbers
- [ ] All properties listed
- [ ] Can toggle between grid and list view
- [ ] Edit button navigates to edit page
- [ ] Delete button shows confirmation
- [ ] Delete removes property and images
- [ ] Status toggle works (available ↔︎ unavailable)
- [ ] View/save counts displayed
- [ ] Empty state shown if no properties
- [ ] “Add Property” button navigates to form

---

### Task 6: Edit Property (60 minutes)

**Cursor AI Prompt:**

```
Create an edit property page that:
1. Fetches property by ID
2. Pre-fills form with existing data
3. Allows editing all fields except images (images are append-only for MVP)
4. Saves changes to properties table
5. Shows success message
6. Redirects back to dashboard

Reuse the same form components from AddPropertyPage.
```

**File to Create:**

**`src/pages/EditPropertyPage.jsx`:**
- Fetch property by ID from URL params
- Check if current user owns property (authorization)
- Pre-fill form with existing values
- Allow editing all fields
- Save changes to database

**Pre-fill Logic:**

```jsx
useEffect(() => {
  const fetchProperty = async () => {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single()
    if (error || !data) {
      navigate('/dashboard')
      return    }
    // Check ownership    if (data.owner_id !== user.id) {
      toast.error('You do not have permission to edit this property')
      navigate('/dashboard')
      return    }
    // Pre-fill form    reset(data) // React Hook Form reset with data  }
  fetchProperty()
}, [propertyId])
```

**Save Handler:**

```jsx
const handleSave = async (formData) => {
  const { error } = await supabase
    .from('properties')
    .update({
      title: formData.title,      description: formData.description,      location: formData.location,      price: formData.price,      viewing_fee: formData.viewing_fee,      bedrooms: formData.bedrooms,      bathrooms: formData.bathrooms,      property_type: formData.property_type,      amenities: formData.amenities,    })
    .eq('id', propertyId)
  if (error) throw error
  toast.success('Property updated successfully')
  navigate('/dashboard/listings')
}
```

**Validation:**
- [ ] Property fetched and form pre-filled
- [ ] Cannot edit other user’s properties (authorization check)
- [ ] All fields editable
- [ ] Changes save correctly
- [ ] Success message shown
- [ ] Redirects to dashboard after save
- [ ] Images not editable (noted to user)

---

### Task 7: Delete Property (30 minutes)

**Implementation:**
Add delete functionality to landlord dashboard.

**Delete Handler:**

```jsx
const handleDelete = async (propertyId) => {
  const confirmed = confirm('Are you sure you want to delete this property? This cannot be undone.')
  if (!confirmed) return  // 1. Get property images  const { data: images } = await supabase
    .from('property_images')
    .select('image_url')
    .eq('property_id', propertyId)
  // 2. Delete images from storage  for (const img of images) {
    const fileName = img.image_url.split('/').pop()
    await supabase.storage      .from('property-images')
      .remove([fileName])
  }
  // 3. Delete property (cascades to property_images, saved_properties)  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', propertyId)
  if (error) throw error
  toast.success('Property deleted successfully')
  // 4. Refresh dashboard  refetch()
}
```

**Validation:**
- [ ] Confirmation modal appears
- [ ] Property deleted from database
- [ ] Images deleted from storage
- [ ] Saved_properties references removed (cascade)
- [ ] Dashboard updates immediately
- [ ] Success message shown

---

### Day 4 End of Day

**Deliverables:**
- [x] ✅ Enhanced registration with role selection and profile creation
- [x] ✅ User profile page (view and edit)
- [x] ✅ Save/unsave property feature working
- [x] ✅ Tenant dashboard with saved properties
- [x] ✅ Landlord dashboard with listings and stats
- [x] ✅ Edit property functionality
- [x] ✅ Delete property functionality

**Screenshots:**
- Registration form with role selection
- User profile page
- Tenant dashboard
- Landlord dashboard with listings
- Edit property page

**End of Day Checklist:**
- [ ] Can register with role selection
- [ ] Profile page displays and edits correctly
- [ ] Can save/unsave properties
- [ ] Tenant dashboard shows saved properties
- [ ] Landlord dashboard shows listings and stats
- [ ] Can edit and delete properties
- [ ] All dashboards responsive
- [ ] No console errors
- [ ] Code committed to GitHub

---

### Day 5 - Morning Session (4 hours)

### Task 8: Agent Approval Flow (90 minutes)

**Cursor AI Prompt:**

```
Implement agent approval system:

1. AgentPendingPage: Shows "Application under review" message for pending agents
2. Check agent status in auth context and block access to features if pending
3. AdminAgentApprovalPage: Shows list of pending agents with approve/reject buttons
4. Approve action: updates status to "active", sends welcome email
5. Reject action: updates status to "rejected", sends rejection email with reason
6. Only admin can access approval page
```

**Files to Create:**

**1. `src/pages/AgentPendingPage.jsx`:**

```jsx
function AgentPendingPage() {
  const { user } = useAuth()
  return (
    <div className="pending-page">      <Icon>⏳</Icon>      <h1>Application Under Review</h1>      <p>        Your agent application is currently being reviewed by our team.        You will receive an email notification once your application is approved.      </p>      <p>Submitted on: {formatDate(user.created_at)}</p>      <p>        Questions? Contact us at <a href="mailto:support@pezani.com">support@pezani.com</a>      </p>    </div>  )
}
```

**2. Update `AuthContext.jsx` to check agent status:**

```jsx
useEffect(() => {
  const checkUserStatus = async () => {
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, status')
        .eq('id', user.id)
        .single()
      setUserProfile(profile)
      // Redirect pending agents      if (profile.role === 'agent' && profile.status === 'pending') {
        navigate('/agent-pending')
      }
    }
  }
  checkUserStatus()
}, [user])
```

**3. `src/pages/admin/AgentApprovalPage.jsx`:**

**Layout:**

```
┌─────────────────────────────────────────┐
│ Pending Agent Applications              │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ John Doe                            │ │
│ │ john@example.com | +265 888 123 456 │ │
│ │ Applied: Nov 20, 2025               │ │
│ │ [✓ Approve] [✗ Reject]              │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ Jane Smith                          │ │
│ │ ... (similar)                       │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Query for Pending Agents:**

```jsx
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('role', 'agent')
  .eq('status', 'pending')
  .order('created_at', { ascending: true })
```

**Approve Handler:**

```jsx
const handleApprove = async (agentId) => {
  // 1. Update status  const { error } = await supabase
    .from('profiles')
    .update({ status: 'active' })
    .eq('id', agentId)
  if (error) throw error
  // 2. Send welcome email (using Supabase Edge Function or email service)  await supabase.functions.invoke('send-agent-approval-email', {
    body: { agentId, approved: true }
  })
  toast.success('Agent approved successfully')
  refetch()
}
```

**Reject Handler:**

```jsx
const handleReject = async (agentId, reason) => {
  // 1. Update status  const { error } = await supabase
    .from('profiles')
    .update({
      status: 'rejected',      rejection_reason: reason
    })
    .eq('id', agentId)
  if (error) throw error
  // 2. Send rejection email  await supabase.functions.invoke('send-agent-approval-email', {
    body: { agentId, approved: false, reason }
  })
  toast.success('Agent application rejected')
  refetch()
}
```

**Validation:**
- [ ] Pending agents see “Application under review” page
- [ ] Pending agents cannot access features
- [ ] Admin sees list of pending agents
- [ ] Approve button updates status to “active”
- [ ] Reject button updates status to “rejected”
- [ ] Welcome email sent on approval
- [ ] Rejection email sent on rejection
- [ ] Only admin can access approval page
- [ ] Agent can login and access features after approval

---

### Task 9: Admin Dashboard (120 minutes)

**Cursor AI Prompt:**

```
Create an admin dashboard that shows:
1. Stats cards: Total users (by role), properties, viewing requests, transaction volume
2. Pending actions: Pending agents, pending reports, pending payouts
3. Quick links: Manage Users, Manage Properties, View Reports, Process Payouts
4. Optional: Charts showing users over time, properties by location

Fetch all metrics from database (use SQL queries from Phase 3).
Only accessible by admin role.
```

**File to Create:**

**`src/pages/admin/AdminDashboard.jsx`:**

**Layout:**

```
┌─────────────────────────────────────────┐
│ Admin Dashboard                         │
├─────────────────────────────────────────┤
│ Platform Overview                       │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │
│ │👥234│ │🏠156│ │📅 89│ │💰445k│       │
│ │Users│ │Props│ │ Reqs│ │ Vol  │       │
│ └─────┘ └─────┘ └─────┘ └─────┘       │
│                                         │
│ User Breakdown                          │
│ Tenants:    180 (77%)                   │
│ Landlords:   42 (18%)                   │
│ Agents:      12 (5%)                    │
│                                         │
│ Pending Actions                         │
│ ⚠️ 3 agent applications                 │
│ ⚠️ 2 reports to review                  │
│ ⚠️ 8 payouts to process                 │
│                                         │
│ Quick Actions                           │
│ [Approve Agents] [Review Reports]       │
│ [Process Payouts] [View Users]          │
└─────────────────────────────────────────┘
```

**Stats Queries (from Phase 3):**

```sql
-- Total users by roleSELECT role, COUNT(*) as countFROM profiles
WHERE status != 'banned'GROUP BY role;
-- Total propertiesSELECT COUNT(*) FROM properties;
-- Total viewing requestsSELECT COUNT(*) FROM viewing_requests;
-- Total transaction volumeSELECT SUM(amount) FROM transactions WHERE payment_status = 'successful';
-- Pending actionsSELECT  (SELECT COUNT(*) FROM profiles WHERE role = 'agent' AND status = 'pending') as pending_agents,
  (SELECT COUNT(*) FROM reports WHERE status = 'pending') as pending_reports,
  (SELECT COUNT(*) FROM payouts WHERE status = 'pending') as pending_payouts;
```

**Authorization Check:**

```jsx
useEffect(() => {
  const checkAdmin = async () => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile.role !== 'admin') {
      toast.error('Access denied. Admin only.')
      navigate('/')
    }
  }
  checkAdmin()
}, [user])
```

**Validation:**
- [ ] All stats display correctly
- [ ] User breakdown accurate
- [ ] Pending actions count correct
- [ ] Quick links navigate to correct pages
- [ ] Only admin can access (redirect non-admin)
- [ ] Stats update when data changes
- [ ] Mobile responsive

---

### Day 5 - Afternoon Session (4 hours)

### Task 10: Report System - Frontend (90 minutes)

**Cursor AI Prompt:**

```
Create a report system where users can report properties or users:

1. ReportModal: Opens when user clicks "Report" button
   - Dropdown: Reason (fake listing, wrong info, scam, inappropriate, other)
   - Textarea: Additional details (optional)
   - Submit button
2. Add "Report" button to PropertyDetailPage
3. Submit report to reports table with reported_property_id
4. Show confirmation: "Report submitted. We'll review it shortly."
5. Prevent duplicate reports (same user + same property)
```

**Files to Create:**

**1. `src/components/common/ReportModal.jsx`:**

```jsx
function ReportModal({ isOpen, onClose, reportedType, reportedId }) {
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const { user } = useAuth()
  const reasons = [
    'fake_listing',    'wrong_information',    'scam_fraud',    'inappropriate_content',    'unavailable_property',    'other'  ]
  const handleSubmit = async () => {
    // Check for duplicate    const { data: existing } = await supabase
      .from('reports')
      .select('id')
      .eq('reporter_id', user.id)
      .eq('reported_type', reportedType)
      .eq(`reported_${reportedType}_id`, reportedId)
      .single()
    if (existing) {
      toast.error('You have already reported this.')
      return    }
    // Create report    const { error } = await supabase
      .from('reports')
      .insert({
        reporter_id: user.id,        reported_type: reportedType,        [`reported_${reportedType}_id`]: reportedId,        reason,        details,        status: 'pending'      })
    if (error) throw error
    toast.success('Report submitted. Thank you for helping keep our platform safe.')
    onClose()
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose}>      <h2>Report Property</h2>      <select value={reason} onChange={(e) => setReason(e.target.value)}>        <option value="">Select reason...</option>        {reasons.map(r => (
          <option key={r} value={r}>{formatReason(r)}</option>        ))}
      </select>      <textarea
        placeholder="Additional details (optional)"        value={details}
        onChange={(e) => setDetails(e.target.value)}
      />      <button onClick={handleSubmit}>Submit Report</button>    </Modal>  )
}
```

**2. Add to `PropertyDetailPage.jsx`:**

```jsx
const [reportModalOpen, setReportModalOpen] = useState(false)
// In JSX<button onClick={() => setReportModalOpen(true)}>  🚩 Report
</button><ReportModal
  isOpen={reportModalOpen}
  onClose={() => setReportModalOpen(false)}
  reportedType="property"  reportedId={property.id}
/>
```

**Validation:**
- [ ] Report button visible on property detail page
- [ ] Modal opens when clicked
- [ ] All reasons available in dropdown
- [ ] Can submit report with reason and details
- [ ] Report saved to database
- [ ] Confirmation message shown
- [ ] Cannot submit duplicate report (same property)
- [ ] Modal closes after submission

---

### Task 11: Admin Reports Management (90 minutes)

**Cursor AI Prompt:**

```
Create an admin page to review and manage user reports:
1. List all reports (pending first)
2. Each report shows: Reporter, reported property/user, reason, details, date
3. Action buttons: View Property, Hide Listing, Dismiss Report
4. "Hide Listing" sets property status to 'hidden' (not in search)
5. "Dismiss Report" sets report status to 'dismissed'
6. Mark report as resolved after action taken
```

**File to Create:**

**`src/pages/admin/ReportsPage.jsx`:**

**Layout:**

```
┌─────────────────────────────────────────┐
│ User Reports                            │
│ [Pending] [Reviewed] [All]              │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ Fake Listing                        │ │
│ │ Reported by: John Doe               │ │
│ │ Property: 3 Bed House - Area 47     │ │
│ │ Reason: This property doesn't exist │ │
│ │ Date: Nov 25, 2025                  │ │
│ │ [View Property] [Hide Listing]      │ │
│ │ [Dismiss]                           │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ ... (more reports)                  │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Query for Reports:**

```jsx
const { data, error } = await supabase
  .from('reports')
  .select(`    *,    reporter:profiles!reporter_id (full_name, email),    property:properties (id, title, location),    reported_user:profiles!reported_user_id (full_name, email)  `)
  .eq('status', 'pending')
  .order('created_at', { ascending: true })
```

**Action Handlers:**

```jsx
const handleHideListing = async (reportId, propertyId) => {
  // 1. Hide property  await supabase
    .from('properties')
    .update({ status: 'hidden' })
    .eq('id', propertyId)
  // 2. Resolve report  await supabase
    .from('reports')
    .update({ status: 'resolved' })
    .eq('id', reportId)
  toast.success('Property hidden and report resolved')
  refetch()
}
const handleDismiss = async (reportId) => {
  await supabase
    .from('reports')
    .update({ status: 'dismissed' })
    .eq('id', reportId)
  toast.success('Report dismissed')
  refetch()
}
```

**Validation:**
- [ ] All pending reports displayed
- [ ] Can filter by status (pending/reviewed/all)
- [ ] Each report shows complete info
- [ ] “View Property” opens property in new tab
- [ ] “Hide Listing” hides property and resolves report
- [ ] “Dismiss” marks report as dismissed
- [ ] Hidden properties not in search results
- [ ] Reports list updates after actions

---

### Day 5 End of Day

**Deliverables:**
- [x] ✅ Agent approval flow working (pending → approved/rejected)
- [x] ✅ Admin dashboard with comprehensive metrics
- [x] ✅ Report system (submission + review)
- [x] ✅ All user roles functional with appropriate permissions

**Screenshots:**
- Agent pending screen
- Admin dashboard
- Agent approval page
- Report modal
- Admin reports page

**End of Day Checklist:**
- [ ] Agent registers → sees pending screen → admin approves → can list properties
- [ ] Admin dashboard shows accurate stats
- [ ] Can report a property
- [ ] Admin can review and act on reports
- [ ] Hidden properties not searchable
- [ ] All dashboards responsive
- [ ] No console errors
- [ ] Code committed to GitHub

**Testing:**
1. Register as agent → verify pending state
2. Login as admin → approve agent
3. Agent can now list properties
4. Report a property
5. Admin reviews and hides property
6. Verify property not in search

---

**Continue to Day 6-7 for Viewing Requests & Payments…**

## DAYS 6-13 EXPANSION (Copy this into your document)
Day 6 - Morning Session (4 hours)
Task 1: Paychangu Integration Setup (60 minutes)
Steps:

Sign up for Paychangu developer account
Get API credentials (Public Key + Secret Key)
Save to .env.local:

envVITE_PAYCHANGU_PUBLIC_KEY=pk_test_xxxxx
PAYCHANGU_SECRET_KEY=sk_test_xxxxx

Read Paychangu documentation
Test API connection

Paychangu Test Cards:

Success: 5123 4567 8901 2346
Failed: 4000 0000 0000 0002

Task 2: Viewing Request Modal (120 minutes)
Create viewing request modal with:

Property summary
User contact (pre-filled)
3 preferred date inputs
Terms checkbox
"Proceed to Payment" button

Check for duplicate viewing requests.

Task 3: Supabase Edge Function - Create Viewing Request (60 minutes)
Create Edge Function that:

Validates user is tenant
Creates viewing request (status: pending)
Creates transaction (payment_status: pending)
Calls Paychangu API
Returns payment URL

Deploy with:
bashsupabase functions deploy create-viewing-request

Day 6 - Afternoon Session (4 hours)
Task 4: Payment Success/Failed Pages (90 minutes)
Create:

PaymentSuccessPage.jsx - Shows viewing details, next steps
PaymentFailedPage.jsx - Shows error, retry option

Task 5: Paychangu Webhook Handler (90 minutes)
Create Edge Function to handle webhooks:

Verify signature
Handle payment.successful - update transaction, send emails
Handle payment.failed - delete viewing request, notify user

Configure webhook URL in Paychangu dashboard.

Task 6: Email Notifications (60 minutes)
Set up Resend or SendGrid.
Create email templates:

Viewing confirmation (tenant)
New viewing request (landlord)
Viewing scheduled (both)
Agent approval/rejection

Deploy send-viewing-request-email Edge Function.

Day 7 - Morning Session (4 hours)
Task 7: Tenant Dashboard - Viewing Requests (90 minutes)
Add to tenant dashboard:

Viewing requests section
Tabs: All, Pending, Scheduled, Completed
Each shows: Property, status, landlord contact
Actions: Cancel, Mark Completed

Task 8: Landlord Dashboard - Viewing Requests (90 minutes)
Add to landlord dashboard:

Incoming viewing requests
Each shows: Property, tenant contact, payment status
Actions: Schedule, Mark Completed, Cancel
Schedule modal with date/time picker

Task 9: Viewing Confirmation Flow (60 minutes)
Implement dual confirmation:

Both parties must confirm
If both confirm → release payment
If only one confirms after 72h → disputed
If neither confirms after 72h → expired

Create release-payment Edge Function.

Day 7 - Afternoon Session (4 hours)
Task 10: Payment Escrow Logic (90 minutes)
Create database function to check confirmations:
sqlCREATE OR REPLACE FUNCTION check_viewing_confirmations()
-- Marks as disputed or expired after 72 hours
Create process-refund Edge Function for cancellations.

Task 11: Admin Payout Management (90 minutes)
Create AdminPayoutsPage.jsx:

List pending payouts
Show landlord details, amount, payout method
Mark as processed with reference number
Export to CSV

Task 12: Cancellation & Refund Logic (60 minutes)
Handle:

Landlord cancels → full refund
Tenant cancels → refund per policy
No-show → tenant has 24h to dispute

Day 7 End of Day
Deliverables:

Complete viewing request lifecycle
Dual confirmation working
Payment escrow and release
Payout management
Cancellation/refund logic

Milestone 5: Polish & Optimization
Days 8-9 (12-16 hours)
Day 8 - Full Day (6-8 hours)
Task 1: UI/UX Polish (180 minutes)
Use Cursor: "Review all pages for consistency"

Fix layout issues
Consistent spacing (Tailwind scale)
Add loading skeletons everywhere
Add loading spinners on buttons
User-friendly error messages
Success toasts/notifications
Proper form validation feedback

Task 2: Mobile Responsiveness (120 minutes)
Test every page at 375px width:

Fix overflow issues
Readable text (not too small)
Tappable buttons (min 44px)
Test bottom nav on all pages
Test modals on mobile
Test forms on mobile

Task 3: Performance Optimization (90 minutes)
Install React Query:
bashnpm install @tanstack/react-query

Wrap app in QueryClientProvider
Convert data fetching to React Query
Add lazy loading to images
Add code splitting (React.lazy)
Test with DevTools (Slow 3G)

Day 9 - Full Day (6-8 hours)
Task 1: Security Hardening (120 minutes)

Review all RLS policies
Test by accessing data as different users
Ensure phone numbers encrypted
Add rate limiting checks
Sanitize rich text (DOMPurify)
Test SQL injection (should block)
Test XSS (should block)

Task 2: Error Handling (120 minutes)

Add 404 page
Add error boundary for React crashes
Handle offline state
Handle slow loading (show after 2s)
Handle empty states
Handle expired sessions
Test all error scenarios

Task 3: SEO & Metadata (60 minutes)

Add meta tags to index.html
Add Open Graph tags
Add favicon
Add robots.txt
Test social sharing preview

Task 4: Legal Pages (60 minutes)
Use Cursor: "Generate privacy policy for Malawi real estate platform"
Create:

Privacy Policy page
Terms of Service page
About page
Add links to footer

Milestone 6: Testing & Bug Fixes
Days 10-11 (12-16 hours)
Day 10 - Full Day (6-8 hours)
Run Complete Manual Testing Checklist (360 minutes)
Use Testing Strategy document.
Go through EVERY checkbox:

Functionality testing (auth, properties, viewing requests, dashboards, admin)
UI/UX testing (responsive, browser compatibility, accessibility, loading states, errors)
Performance testing (page load times, image optimization, database queries)
Security testing (auth, authorization, input validation, data privacy)
Integration testing (Supabase, Paychangu, email delivery)

Document bugs in GitHub Issues with severity labels.
Create lists:

Critical bugs (must fix)
High-priority bugs (should fix)
Medium/low bugs (post-launch)

Day 11 - Full Day (6-8 hours)
Fix Critical Bugs (360 minutes)
Focus ONLY on critical bugs:

Payment issues
Auth issues
Data loss issues

Use Cursor to help debug.
Test each fix thoroughly.
Verify fix doesn't break other features.
Mark resolved in GitHub.

Fix High-Priority Bugs (120 minutes)
Fix as many as time allows.
Prioritize core feature bugs.
Document postponed bugs.

Milestone 7: Analytics, Monitoring & Deployment
Days 12-13 (12-16 hours)
Day 12 - Morning Session (4 hours)
Task 1: Google Analytics Setup (45 minutes)

Create GA4 property
Install GA4 script
Set up custom events
Test in GA4 DebugView
Set up conversions

Task 2: Sentry Setup (45 minutes)
bashnpm install @sentry/react

Create Sentry project
Initialize in main.jsx
Test error reporting
Set up email alerts

Task 3: UptimeRobot Setup (30 minutes)
Create monitors:

Frontend homepage (5 min intervals)
Supabase API health
Property detail page
Login page

Configure email alerts.

Task 4: Admin Dashboard Metrics (90 minutes)
Implement all metrics from Phase 3:

Total users (by role)
Properties count
Viewing requests count
Transaction volume
Create charts (optional - Recharts)

Day 12 - Afternoon Session (4 hours)
Task 5: Environment Configuration (60 minutes)

Create .env.example
Document all variables in README
Create Supabase projects: Dev, Staging, Production
Configure Paychangu: test mode (staging), live mode (production)

Task 6: Render Deployment (90 minutes)

Create Render account
Create Web Service (Static Site)
Connect GitHub repo
Configure build:

Build Command: npm install && npm run build
Publish Directory: dist

Add environment variables in Render
Deploy to staging
Test staging thoroughly

Task 7: Domain & SSL (30 minutes)

Purchase domain (optional - use Render subdomain for MVP)
Configure in Render
Verify SSL active
Update Supabase redirect URLs
Update Paychangu redirect URLs

Task 8: Production Database Migration (60 minutes)

Run all SQL migrations in production
Verify all tables
Verify all RLS policies
Create admin account
Create test accounts
Create 5-10 test properties

Day 13 - Morning Session (4 hours)
Task 9: Final Smoke Test (120 minutes)
Test EVERY critical journey in staging:

Registration → verification → login
Create property → appears in search
Search → view property
Request viewing → pay → confirm
All dashboards load
All admin features work
Test mobile and desktop
No console errors
No broken images
All links work

Task 10: Documentation (90 minutes)
Update [README.md](http://readme.md/):

Project description
Features list
Tech stack
Installation instructions
Environment variables
Deployment guide

Optional:

User guide
Admin manual
Known issues
Post-launch roadmap

Day 13 - Afternoon Session (4 hours)
Task 11: Production Deployment (60 minutes)

Final code review
Merge to main
Deploy to production
Verify deployment successful
Switch Paychangu to live mode
Test one real payment (small amount)

Task 12: Launch Checklist (90 minutes)
Verify acceptance criteria from Phase 3:

All 8 features working
All 5 roles functional
Payment processing
Emails sending
Mobile responsive
Security implemented
Analytics active
Monitoring active
Documentation complete

Task 13: Monitoring Setup Verification (30 minutes)

Verify UptimeRobot monitoring
Verify Sentry receiving events
Verify GA4 tracking
Set up daily email summary

Task 14: 🚀 LAUNCH (30 minutes)

Announce launch (social media, WhatsApp)
Monitor closely for first few hours
Watch Sentry for errors
Watch UptimeRobot for downtime
Respond to critical issues immediately

Milestone 8: Post-Launch
Day 14+ (Ongoing)
Week 1 Post-Launch
Daily Monitoring (30 min/day):

Check Sentry for errors
Check UptimeRobot
Review GA4
Check Supabase performance
Respond to user support

Gather Feedback:

Talk to first users
Document pain points
Document feature requests
Create prioritized backlog

Hot Fixes (as needed):

Fix critical bugs within 24h
Deploy immediately
Communicate to users

Week 2-4 Post-Launch
Week 2: Add Automated Tests
bashnpm install -D @playwright/test
Write E2E tests for 5 critical journeys.
Week 3: Add Unit Tests
bashnpm install -D vitest
Write unit tests for validation functions.
Aim for 50%+ coverage.
Week 4: Performance Optimization

Analyze slow queries
Add database indexes
Optimize images
Add CDN

Month 2+ Improvements
Based on Phase 3 nice-to-have features:

WhatsApp notifications
SMS notifications
Property view tracking
Saved searches
Reviews/ratings
Verified badges
Map view
Premium listings
In-app messaging
Advanced analytics
Mobile app

Quick Reference: 2-Week Sprint Checklist
WEEK 1: CORE FUNCTIONALITY
Day 1: Foundation ✅

Project setup (React + Vite + Tailwind)
GitHub repo
Supabase project + database schema
Authentication working

Day 2: UI & Properties (Part 1) ✅

Design system
Layout components
Homepage
Add property form
Image upload

Day 3: Properties (Part 2) ✅

Property submission working
Property detail page
Browse & search page
Filters working

Day 4: User Features ✅

Enhanced registration
User profile
Save properties
Tenant dashboard
Landlord dashboard (listings)

Day 5: Admin Features ✅

Agent approval flow
Admin dashboard
Report system
Admin reports management

WEEK 2: PAYMENTS & LAUNCH
Day 6: Payments (Part 1) ✅

Paychangu integration
Viewing request modal
Payment flow
Webhook handler
Email notifications

Day 7: Payments (Part 2) ✅

Tenant viewing requests dashboard
Landlord viewing requests dashboard
Dual confirmation flow
Payment escrow logic
Admin payout management

Day 8: Polish ✅

UI/UX polish (spacing, loading states, errors)
Mobile responsiveness fixes
Performance optimization (React Query, lazy loading)

Day 9: Security & Prep ✅

Security hardening (RLS, encryption, sanitization)
Error handling (404, offline, empty states)
SEO & metadata
Legal pages

Day 10: Testing ✅

Complete manual testing checklist (all features)
Document all bugs by severity

Day 11: Bug Fixes ✅

Fix all critical bugs
Fix high-priority bugs

Day 12: Deployment Prep ✅

Google Analytics setup
Sentry setup
UptimeRobot setup
Admin metrics working
Staging deployment
Production database ready

Day 13: Launch 🚀

Final smoke test
Documentation complete
Production deployment
Launch checklist verified
GO LIVE

Day 14+: Monitor & Iterate 🔄

Daily monitoring
Gather feedback
Hot fixes
Plan improvements

Daily Progress Template
markdown## Day X - [Date]

### Goals

- [ ]  Goal 1
- [ ]  Goal 2
- [ ]  Goal 3

### Completed

- Feature 1: [description]
- Feature 2: [description]

### Cursor Wins

- [What Cursor generated well]
- [Time saved]

### Challenges

- 

### Tomorrow

1. [Priority 1]
2. [Priority 2]

### Hours: [X]

### Energy: [Low/Med/High]

Emergency Resources
Supabase Issues:

Docs: [https://supabase.com/docs](https://supabase.com/docs)
Discord: [https://discord.supabase.com](https://discord.supabase.com/)

Paychangu Issues:

Check their docs
Test webhook: [https://webhook.site](https://webhook.site/)

React Issues:

Stack Overflow
Ask Cursor AI
React docs: [https://react.dev](https://react.dev/)

Deployment Issues:

Render docs: [https://docs.render.com](https://docs.render.com/)
Check build logs

Success Criteria
Functional (Must Have)

All 8 features working
All 5 roles functional
Payments processing
Emails sending
Mobile responsive
Live online

Quality (Must Have)

No critical bugs
<5 high bugs (documented)
<3s page loads
Security implemented
Monitoring active

Documentation (Must Have)

README complete
Code commented
Issues documented
Deployment process documented

END OF EXPANSION

---

## Development Tools & Resources

### Essential Cursor AI Prompts

**Component Generation:**

```
Create a React component called [ComponentName] that [description].
Use Tailwind CSS for styling. Make it responsive (mobile-first).
Include proper PropTypes or TypeScript types.
```

**Form Creation:**

```
Create a form component with React Hook Form and Zod validation for [purpose].
Fields: [list fields with types].
Validation rules: [describe rules].
Use Tailwind for styling. Show validation errors inline.
```

**Supabase Query:**

```
Write a Supabase query that [description].
Use proper error handling and loading states.
Return data in format: [describe format].
```

**Bug Fix:**

```
I'm getting this error: [paste error].
Here's the code: [paste code].
What's wrong and how do I fix it?
```

**Refactoring:**

```
Refactor this code to be more readable and maintainable: [paste code].
Follow React best practices. Extract reusable components where appropriate.
```

### Useful VS Code Extensions (with Cursor)

- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Error Lens (see errors inline)
- GitLens (Git visualization)
- Prettier (code formatting)

### Testing Resources

- Chrome DevTools (Network tab for API debugging)
- React DevTools (component inspection)
- Supabase Dashboard (database inspection)
- Paychangu Test Cards Documentation

---

## Daily Progress Tracking

### Daily Template

```markdown
## Day [X] - [Date]### Goals for Today- [ ] Goal 1
- [ ] Goal 2
- [ ] Goal 3
### What I Built- Feature 1: [description]- Feature 2: [description]- Bug fixes: [list]### Cursor AI Highlights- [Particularly helpful Cursor generation]- [Time saved on X feature]### Blockers / Challenges- [Issue 1]: [How I solved it]- [Issue 2]: [Still working on it]### Testing Done- [ ] Tested feature X manually
- [ ] Verified on mobile
- [ ] No console errors
### Tomorrow's Priorities1. [Top priority]2. [Second priority]3. [Third priority]### Screenshots[Attach screenshots of progress]### Hours Worked: [X hours]### Energy Level: [Low / Medium / High]
```

---

## Emergency Contacts & Resources

### If You Get Stuck

**Supabase Issues:**
- Supabase Documentation: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- Check Supabase logs in Dashboard → Logs

**Paychangu Issues:**
- Paychangu Documentation: [their docs URL]
- Paychangu Support: [their support email]
- Test webhook with https://webhook.site

**React/Code Issues:**
- Stack Overflow (search your error)
- Ask Cursor AI to explain the error
- React Documentation: https://react.dev

**Deployment Issues:**
- Render Documentation: https://docs.render.com
- Render Support (if paid plan)
- Check build logs in Render dashboard

---

## Success Metrics for MVP

### At the End of 2 Weeks

✅ **Functional Requirements:**
- [ ] All 8 must-have features working
- [ ] All 5 user roles functional
- [ ] Payment system processing real transactions
- [ ] Email notifications sending
- [ ] Mobile responsive on real devices
- [ ] Deployed to production and accessible online

✅ **Quality Requirements:**
- [ ] No critical bugs
- [ ] <5 high-priority bugs (documented for post-launch)
- [ ] Page loads in <3 seconds on slow connection
- [ ] All security measures implemented
- [ ] Analytics and monitoring active

✅ **Documentation:**
- [ ] README complete
- [ ] Code reasonably commented
- [ ] Known issues documented
- [ ] Deployment process documented

---

**Document End**

*This development roadmap should be updated daily as you progress through the milestones.*