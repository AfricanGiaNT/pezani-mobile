import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Users, Home, Calendar, DollarSign, AlertTriangle, UserCheck, FileText, CreditCard, Loader2, } from 'lucide-react';
import { Button } from '@components/common';
import { supabase } from '@lib/supabase';
import { useAuth } from '@contexts/AuthContext';
import { formatPrice } from '@utils/formatting';
const AdminDashboard = () => {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalProperties: 0,
        totalViewingRequests: 0,
        totalTransactionVolume: 0,
        userBreakdown: {
            tenants: 0,
            landlords: 0,
            agents: 0,
            admins: 0,
        },
        pendingActions: {
            pendingAgents: 0,
            pendingReports: 0,
            pendingPayouts: 0,
        },
    });
    // Check if user is admin
    useEffect(() => {
        if (profile) {
            if (profile.role !== 'admin') {
                toast.error('Access denied. Admin only.');
                navigate('/dashboard');
            }
        }
    }, [profile, navigate]);
    // Fetch stats
    useEffect(() => {
        if (user && profile?.role === 'admin') {
            fetchStats();
        }
    }, [user, profile]);
    const fetchStats = async () => {
        if (!user)
            return;
        try {
            setLoading(true);
            // Total users by role
            const { data: usersData } = await supabase
                .from('profiles')
                .select('role')
                .neq('status', 'banned');
            const userBreakdown = {
                tenants: usersData?.filter((u) => u.role === 'tenant').length || 0,
                landlords: usersData?.filter((u) => u.role === 'landlord').length || 0,
                agents: usersData?.filter((u) => u.role === 'agent').length || 0,
                admins: usersData?.filter((u) => u.role === 'admin').length || 0,
            };
            const totalUsers = usersData?.length || 0;
            // Total properties
            const { count: totalProperties } = await supabase
                .from('properties')
                .select('*', { count: 'exact', head: true });
            // Total viewing requests
            const { count: totalViewingRequests } = await supabase
                .from('viewing_requests')
                .select('*', { count: 'exact', head: true });
            // Total transaction volume
            const { data: transactionsData } = await supabase
                .from('transactions')
                .select('amount')
                .eq('payment_status', 'successful');
            const totalTransactionVolume = transactionsData?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
            // Pending actions
            const { count: pendingAgents } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'agent')
                .eq('status', 'pending');
            const { count: pendingReports } = await supabase
                .from('reports')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending');
            const { count: pendingPayouts } = await supabase
                .from('payouts')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending');
            setStats({
                totalUsers,
                totalProperties: totalProperties || 0,
                totalViewingRequests: totalViewingRequests || 0,
                totalTransactionVolume,
                userBreakdown,
                pendingActions: {
                    pendingAgents: pendingAgents || 0,
                    pendingReports: pendingReports || 0,
                    pendingPayouts: pendingPayouts || 0,
                },
            });
        }
        catch (error) {
            console.error('Error fetching stats:', error);
            toast.error('Failed to load dashboard stats');
        }
        finally {
            setLoading(false);
        }
    };
    if (!user || profile?.role !== 'admin') {
        return (_jsx("div", { className: "container mx-auto px-4 py-8", children: _jsx("div", { className: "text-center", children: "Loading..." }) }));
    }
    const totalActiveUsers = stats.userBreakdown.tenants +
        stats.userBreakdown.landlords +
        stats.userBreakdown.agents +
        stats.userBreakdown.admins;
    return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "text-3xl font-bold text-text mb-2", children: "Admin Dashboard" }), _jsx("p", { className: "text-text-light", children: "Platform overview and management" })] }), loading ? (_jsx("div", { className: "flex items-center justify-center py-12", children: _jsx(Loader2, { size: 32, className: "animate-spin text-primary" }) })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "mb-8", children: [_jsx("h2", { className: "text-xl font-semibold text-text mb-4", children: "Platform Overview" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "bg-surface rounded-lg shadow-md p-6 border border-gray-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-text-light text-sm mb-1", children: "Total Users" }), _jsx("p", { className: "text-3xl font-bold text-text", children: stats.totalUsers })] }), _jsx("div", { className: "w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center", children: _jsx(Users, { size: 24, className: "text-primary" }) })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 }, className: "bg-surface rounded-lg shadow-md p-6 border border-gray-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-text-light text-sm mb-1", children: "Total Properties" }), _jsx("p", { className: "text-3xl font-bold text-text", children: stats.totalProperties })] }), _jsx("div", { className: "w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center", children: _jsx(Home, { size: 24, className: "text-accent" }) })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 }, className: "bg-surface rounded-lg shadow-md p-6 border border-gray-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-text-light text-sm mb-1", children: "Viewing Requests" }), _jsx("p", { className: "text-3xl font-bold text-text", children: stats.totalViewingRequests })] }), _jsx("div", { className: "w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center", children: _jsx(Calendar, { size: 24, className: "text-blue-600" }) })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.3 }, className: "bg-surface rounded-lg shadow-md p-6 border border-gray-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-text-light text-sm mb-1", children: "Transaction Volume" }), _jsx("p", { className: "text-2xl font-bold text-text", children: formatPrice(stats.totalTransactionVolume) })] }), _jsx("div", { className: "w-12 h-12 bg-green-100 rounded-full flex items-center justify-center", children: _jsx(DollarSign, { size: 24, className: "text-green-600" }) })] }) })] })] }), _jsxs("div", { className: "mb-8", children: [_jsx("h2", { className: "text-xl font-semibold text-text mb-4", children: "User Breakdown" }), _jsx("div", { className: "bg-surface rounded-lg shadow-md p-6 border border-gray-200", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-text-light text-sm mb-1", children: "Tenants" }), _jsxs("p", { className: "text-2xl font-bold text-text", children: [stats.userBreakdown.tenants, totalActiveUsers > 0 && (_jsxs("span", { className: "text-base font-normal text-text-light ml-2", children: ["(", Math.round((stats.userBreakdown.tenants / totalActiveUsers) * 100), "%)"] }))] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-text-light text-sm mb-1", children: "Landlords" }), _jsxs("p", { className: "text-2xl font-bold text-text", children: [stats.userBreakdown.landlords, totalActiveUsers > 0 && (_jsxs("span", { className: "text-base font-normal text-text-light ml-2", children: ["(", Math.round((stats.userBreakdown.landlords / totalActiveUsers) * 100), "%)"] }))] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-text-light text-sm mb-1", children: "Agents" }), _jsxs("p", { className: "text-2xl font-bold text-text", children: [stats.userBreakdown.agents, totalActiveUsers > 0 && (_jsxs("span", { className: "text-base font-normal text-text-light ml-2", children: ["(", Math.round((stats.userBreakdown.agents / totalActiveUsers) * 100), "%)"] }))] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-text-light text-sm mb-1", children: "Admins" }), _jsx("p", { className: "text-2xl font-bold text-text", children: stats.userBreakdown.admins })] })] }) })] }), _jsxs("div", { className: "mb-8", children: [_jsx("h2", { className: "text-xl font-semibold text-text mb-4", children: "Pending Actions" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-yellow-800 text-sm mb-1", children: "Agent Applications" }), _jsx("p", { className: "text-2xl font-bold text-yellow-900", children: stats.pendingActions.pendingAgents })] }), _jsx(AlertTriangle, { size: 24, className: "text-yellow-600" })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 }, className: "bg-red-50 border border-red-200 rounded-lg p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-red-800 text-sm mb-1", children: "Reports to Review" }), _jsx("p", { className: "text-2xl font-bold text-red-900", children: stats.pendingActions.pendingReports })] }), _jsx(FileText, { size: 24, className: "text-red-600" })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 }, className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-blue-800 text-sm mb-1", children: "Payouts to Process" }), _jsx("p", { className: "text-2xl font-bold text-blue-900", children: stats.pendingActions.pendingPayouts })] }), _jsx(CreditCard, { size: 24, className: "text-blue-600" })] }) })] })] }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold text-text mb-4", children: "Quick Actions" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx(Button, { variant: "outline", onClick: () => navigate('/admin/agent-approval'), leftIcon: _jsx(UserCheck, { size: 18 }), fullWidth: true, children: "Approve Agents" }), _jsx(Button, { variant: "outline", onClick: () => navigate('/admin/reports'), leftIcon: _jsx(FileText, { size: 18 }), fullWidth: true, children: "Review Reports" }), _jsx(Button, { variant: "outline", onClick: () => navigate('/admin/payouts'), leftIcon: _jsx(CreditCard, { size: 18 }), fullWidth: true, children: "Process Payouts" }), _jsx(Button, { variant: "outline", onClick: () => navigate('/admin/users'), leftIcon: _jsx(Users, { size: 18 }), fullWidth: true, children: "Manage Users" })] })] })] }))] }));
};
export default AdminDashboard;
