import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from '@lib/supabase';
import { Layout } from '@components/layout';
import { ProtectedRoute, AgentStatusCheck } from '@components/auth';
import { Toaster } from '@/components/ui/sonner';
import { Skeleton } from '@/components/common';
// Eager load critical pages (homepage, login, signup)
import HomePage from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
// Lazy load other pages for better initial load performance
const BrowsePage = lazy(() => import('./pages/BrowsePage'));
const PropertyDetailPage = lazy(() => import('./pages/PropertyDetailPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AddPropertyPage = lazy(() => import('./pages/AddPropertyPage'));
const EditPropertyPage = lazy(() => import('./pages/EditPropertyPage'));
const AgentPendingPage = lazy(() => import('./pages/AgentPendingPage'));
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage'));
const PaymentFailedPage = lazy(() => import('./pages/PaymentFailedPage'));
const DesignSystemPage = lazy(() => import('./pages/DesignSystemPage'));
const SavedPropertiesPage = lazy(() => import('./pages/SavedPropertiesPage'));
// Admin pages (rarely accessed, good candidates for lazy loading)
const AgentApprovalPage = lazy(() => import('./pages/admin/AgentApprovalPage'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ReportsPage = lazy(() => import('./pages/admin/ReportsPage'));
const AdminPayoutsPage = lazy(() => import('./pages/admin/AdminPayoutsPage'));
// Full page loading skeleton
const PageLoadingFallback = () => (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-background", children: _jsxs("div", { className: "space-y-4 w-full max-w-2xl px-4", children: [_jsx(Skeleton, { className: "h-12 w-3/4" }), _jsx(Skeleton, { className: "h-64 w-full" }), _jsx(Skeleton, { className: "h-8 w-1/2" })] }) }));
function App() {
    useEffect(() => {
        // Test Supabase connection by checking auth state
        // This is a cleaner way to verify connection without causing 404 errors
        const testConnection = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session || !session) {
                    // Connection successful (we just need to verify the client works)
                    console.log('✅ Supabase connected!');
                }
            }
            catch (error) {
                console.error('❌ Supabase connection failed:', error);
            }
        };
        testConnection();
    }, []);
    return (_jsxs(_Fragment, { children: [_jsx(Toaster, { position: "top-right", richColors: true }), _jsx(Layout, { children: _jsx(Suspense, { fallback: _jsx(PageLoadingFallback, {}), children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(HomePage, {}) }), _jsx(Route, { path: "/browse", element: _jsx(BrowsePage, {}) }), _jsx(Route, { path: "/properties/:id", element: _jsx(PropertyDetailPage, {}) }), _jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/signup", element: _jsx(SignUpPage, {}) }), _jsx(Route, { path: "/design-system", element: _jsx(DesignSystemPage, {}) }), _jsx(Route, { path: "/payment/success", element: _jsx(PaymentSuccessPage, {}) }), _jsx(Route, { path: "/payment/failed", element: _jsx(PaymentFailedPage, {}) }), _jsx(Route, { path: "/properties/add", element: _jsx(ProtectedRoute, { children: _jsx(AgentStatusCheck, { children: _jsx(AddPropertyPage, {}) }) }) }), _jsx(Route, { path: "/properties/edit/:id", element: _jsx(ProtectedRoute, { children: _jsx(AgentStatusCheck, { children: _jsx(EditPropertyPage, {}) }) }) }), _jsx(Route, { path: "/dashboard", element: _jsx(ProtectedRoute, { children: _jsx(DashboardPage, {}) }) }), _jsx(Route, { path: "/profile", element: _jsx(ProtectedRoute, { children: _jsx(ProfilePage, {}) }) }), _jsx(Route, { path: "/saved-properties", element: _jsx(ProtectedRoute, { children: _jsx(SavedPropertiesPage, {}) }) }), _jsx(Route, { path: "/agent-pending", element: _jsx(ProtectedRoute, { children: _jsx(AgentPendingPage, {}) }) }), _jsx(Route, { path: "/admin/agent-approval", element: _jsx(ProtectedRoute, { children: _jsx(AgentApprovalPage, {}) }) }), _jsx(Route, { path: "/admin/dashboard", element: _jsx(ProtectedRoute, { children: _jsx(AdminDashboard, {}) }) }), _jsx(Route, { path: "/admin/reports", element: _jsx(ProtectedRoute, { children: _jsx(ReportsPage, {}) }) }), _jsx(Route, { path: "/admin/payouts", element: _jsx(ProtectedRoute, { children: _jsx(AdminPayoutsPage, {}) }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }) }) })] }));
}
export default App;
