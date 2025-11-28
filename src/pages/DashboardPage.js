import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import TenantDashboard from './TenantDashboard';
import LandlordDashboard from './LandlordDashboard';
import AdminDashboard from './admin/AdminDashboard';
const DashboardPage = () => {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    // Redirect pending agents to pending page
    useEffect(() => {
        if (profile?.role === 'agent' && profile?.status === 'pending') {
            navigate('/agent-pending');
        }
    }, [profile, navigate]);
    // Route to role-specific dashboards
    if (profile?.role === 'tenant') {
        return _jsx(TenantDashboard, {});
    }
    if (profile?.role === 'landlord' || profile?.role === 'agent') {
        return _jsx(LandlordDashboard, {});
    }
    if (profile?.role === 'admin') {
        return _jsx(AdminDashboard, {});
    }
    // Generic dashboard for other roles (landlord/agent/admin dashboards will be added later)
    return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsx("h1", { className: "text-3xl font-bold text-text mb-6", children: "Dashboard" }), user && (_jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Welcome back!" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("p", { children: [_jsx("span", { className: "font-medium", children: "Email:" }), " ", user.email] }), profile && (_jsxs(_Fragment, { children: [profile.full_name && (_jsxs("p", { children: [_jsx("span", { className: "font-medium", children: "Name:" }), " ", profile.full_name] })), profile.phone && (_jsxs("p", { children: [_jsx("span", { className: "font-medium", children: "Phone:" }), " ", profile.phone] })), _jsxs("p", { children: [_jsx("span", { className: "font-medium", children: "Role:" }), ' ', _jsx("span", { className: "capitalize", children: profile.role })] }), profile.status === 'pending' && (_jsx("div", { className: "mt-4 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg", children: "Your account is pending approval. You'll be notified once approved." }))] }))] })] }))] }));
};
export default DashboardPage;
