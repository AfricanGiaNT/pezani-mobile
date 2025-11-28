import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
const BottomNavBar = () => {
    const location = useLocation();
    const { user } = useAuth();
    // Only show bottom nav for authenticated users
    if (!user)
        return null;
    const navItems = [
        { name: 'Home', path: '/', icon: Home },
        { name: 'Search', path: '/browse', icon: Search },
        { name: 'Dashboard', path: '/dashboard', icon: User },
    ];
    return (_jsx("nav", { className: "md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-200 z-30 shadow-lg", children: _jsx("div", { className: "flex items-center justify-around h-16", children: navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (_jsxs(Link, { to: item.path, className: "flex flex-col items-center justify-center flex-1 h-full relative", children: [_jsxs(motion.div, { whileTap: { scale: 0.9 }, className: `flex flex-col items-center justify-center ${isActive ? 'text-primary' : 'text-text-light'}`, children: [_jsx(Icon, { size: 24 }), _jsx("span", { className: "text-xs mt-1 font-medium", children: item.name })] }), isActive && (_jsx(motion.div, { layoutId: "bottomNavIndicator", className: "absolute top-0 left-0 right-0 h-1 bg-primary", initial: false, transition: { type: 'spring', stiffness: 500, damping: 30 } }))] }, item.path));
            }) }) }));
};
export default BottomNavBar;
