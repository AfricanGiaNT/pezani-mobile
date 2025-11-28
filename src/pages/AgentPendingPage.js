import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@components/common';
import { useAuth } from '@contexts/AuthContext';
import { formatDate } from '@utils/formatting';
const AgentPendingPage = () => {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    // Redirect if not agent or not pending
    useEffect(() => {
        if (profile) {
            if (profile.role !== 'agent') {
                navigate('/dashboard');
            }
            else if (profile.status !== 'pending') {
                // If agent is approved or rejected, redirect to dashboard
                navigate('/dashboard');
            }
        }
    }, [profile, navigate]);
    if (!user || profile?.role !== 'agent' || profile?.status !== 'pending') {
        return (_jsx("div", { className: "container mx-auto px-4 py-8", children: _jsx("div", { className: "text-center", children: "Loading..." }) }));
    }
    return (_jsx("div", { className: "min-h-screen bg-background flex items-center justify-center py-12 px-4", children: _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "max-w-2xl w-full bg-surface rounded-lg shadow-lg p-8 md:p-12 text-center", children: [_jsx("div", { className: "w-24 h-24 mx-auto mb-6 bg-yellow-100 rounded-full flex items-center justify-center", children: _jsx(Clock, { size: 48, className: "text-yellow-600" }) }), _jsx("h1", { className: "text-3xl font-bold text-text mb-4", children: "Application Under Review" }), _jsx("p", { className: "text-lg text-text-light mb-6", children: "Your agent application is currently being reviewed by our team. You will receive an email notification once your application is approved." }), user.created_at && (_jsxs("div", { className: "bg-gray-50 rounded-lg p-4 mb-6", children: [_jsx("p", { className: "text-sm text-text-light mb-1", children: "Application Submitted" }), _jsx("p", { className: "text-base font-medium text-text", children: formatDate(user.created_at) })] })), _jsxs("div", { className: "border-t border-gray-200 pt-6", children: [_jsx("p", { className: "text-text-light mb-2", children: "Questions about your application?" }), _jsxs("a", { href: "mailto:support@pezani.com", className: "inline-flex items-center gap-2 text-primary hover:text-primary-dark transition-colors", children: [_jsx(Mail, { size: 18 }), "support@pezani.com"] })] }), _jsx("div", { className: "mt-8", children: _jsx(Button, { variant: "outline", onClick: () => navigate('/'), leftIcon: _jsx(ArrowLeft, { size: 18 }), children: "Back to Home" }) })] }) }));
};
export default AgentPendingPage;
