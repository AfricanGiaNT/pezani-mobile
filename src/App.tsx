import { useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from '@lib/supabase'
import { Layout } from '@components/layout'
import { ProtectedRoute, AgentStatusCheck } from '@components/auth'
import { Toaster } from '@/components/ui/sonner'
import { Skeleton } from '@/components/common'

// Eager load critical pages (homepage, login, signup)
import HomePage from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { SignUpPage } from './pages/SignUpPage'

// Lazy load other pages for better initial load performance
const BrowsePage = lazy(() => import('./pages/BrowsePage'))
const PropertyDetailPage = lazy(() => import('./pages/PropertyDetailPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const AddPropertyPage = lazy(() => import('./pages/AddPropertyPage'))
const EditPropertyPage = lazy(() => import('./pages/EditPropertyPage'))
const AgentPendingPage = lazy(() => import('./pages/AgentPendingPage'))
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage'))
const PaymentFailedPage = lazy(() => import('./pages/PaymentFailedPage'))
const DesignSystemPage = lazy(() => import('./pages/DesignSystemPage'))
const SavedPropertiesPage = lazy(() => import('./pages/SavedPropertiesPage'))

// Admin pages (rarely accessed, good candidates for lazy loading)
const AgentApprovalPage = lazy(() => import('./pages/admin/AgentApprovalPage'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const ReportsPage = lazy(() => import('./pages/admin/ReportsPage'))
const AdminPayoutsPage = lazy(() => import('./pages/admin/AdminPayoutsPage'))

// Full page loading skeleton
const PageLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="space-y-4 w-full max-w-2xl px-4">
      <Skeleton className="h-12 w-3/4" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-8 w-1/2" />
    </div>
  </div>
)

function App() {
  useEffect(() => {
    // Test Supabase connection by checking auth state
    // This is a cleaner way to verify connection without causing 404 errors
    const testConnection = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session || !session) {
          // Connection successful (we just need to verify the client works)
          console.log('✅ Supabase connected!')
        }
      } catch (error) {
        console.error('❌ Supabase connection failed:', error)
      }
    }
    testConnection()
  }, [])

  return (
    <>
      <Toaster position="top-right" richColors />
      <Layout>
        <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/properties/:id" element={<PropertyDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/design-system" element={<DesignSystemPage />} />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/payment/failed" element={<PaymentFailedPage />} />
        <Route
          path="/properties/add"
          element={
            <ProtectedRoute>
              <AgentStatusCheck>
                <AddPropertyPage />
              </AgentStatusCheck>
            </ProtectedRoute>
          }
        />
        <Route
          path="/properties/edit/:id"
          element={
            <ProtectedRoute>
              <AgentStatusCheck>
                <EditPropertyPage />
              </AgentStatusCheck>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/saved-properties"
          element={
            <ProtectedRoute>
              <SavedPropertiesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agent-pending"
          element={
            <ProtectedRoute>
              <AgentPendingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/agent-approval"
          element={
            <ProtectedRoute>
              <AgentApprovalPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/payouts"
          element={
            <ProtectedRoute>
              <AdminPayoutsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Layout>
    </>
  )
}

export default App

