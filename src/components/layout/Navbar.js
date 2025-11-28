import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Search, User, Home, Building2, PlusCircle } from 'lucide-react';
import { Button } from '@/components/common';
import { useAuth } from '@/hooks/useAuth';
const Navbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/browse?search=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
        }
    };
    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };
    // Navigation links based on user state
    const guestLinks = [
        { name: 'Home', path: '/', icon: Home },
        { name: 'Browse Properties', path: '/browse', icon: Building2 },
    ];
    const authenticatedLinks = [
        { name: 'Home', path: '/', icon: Home },
        { name: 'Browse Properties', path: '/browse', icon: Building2 },
        { name: 'Dashboard', path: '/dashboard', icon: User },
        { name: 'Profile', path: '/profile', icon: User },
    ];
    // Show "Add Property" for landlords and agents
    const canAddProperty = user?.user_metadata?.role === 'landlord' || user?.user_metadata?.role === 'agent';
    const navLinks = user ? authenticatedLinks : guestLinks;
    return (_jsxs("nav", { className: "bg-surface border-b border-gray-200 sticky top-0 z-30 shadow-sm", children: [_jsxs("div", { className: "container-custom", children: [_jsxs("div", { className: "flex items-center justify-between h-16", children: [_jsx(Link, { to: "/", className: "flex items-center space-x-2", children: _jsxs(motion.div, { whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 }, className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-8 h-8 bg-primary rounded-lg flex items-center justify-center", children: _jsx(Building2, { className: "text-white", size: 20 }) }), _jsx("span", { className: "text-xl font-bold text-text", children: "Pezani" })] }) }), _jsx("form", { onSubmit: handleSearch, className: "hidden md:flex flex-1 max-w-md mx-8", children: _jsxs("div", { className: "relative w-full", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light", size: 18 }), _jsx("input", { type: "text", placeholder: "Search properties...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" })] }) }), _jsxs("div", { className: "hidden md:flex items-center space-x-6", children: [navLinks.map((link) => (_jsx(Link, { to: link.path, className: "text-text hover:text-primary transition-colors font-medium", children: link.name }, link.path))), canAddProperty && (_jsx(Link, { to: "/properties/add", children: _jsxs(Button, { size: "sm", variant: "outline", children: [_jsx(PlusCircle, { size: 16, className: "mr-1" }), "Add Property"] }) })), user ? (_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Link, { to: "/dashboard", children: _jsxs(Button, { size: "sm", variant: "ghost", children: [_jsx(User, { size: 16, className: "mr-1" }), user.user_metadata?.full_name || 'Profile'] }) }), _jsx(Button, { size: "sm", variant: "outline", onClick: handleSignOut, children: "Logout" })] })) : (_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Link, { to: "/login", children: _jsx(Button, { size: "sm", variant: "ghost", children: "Login" }) }), _jsx(Link, { to: "/signup", children: _jsx(Button, { size: "sm", children: "Sign Up" }) })] }))] }), _jsx("button", { onClick: () => setMobileMenuOpen(!mobileMenuOpen), className: "md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors", "aria-label": "Toggle menu", children: mobileMenuOpen ? _jsx(X, { size: 24 }) : _jsx(Menu, { size: 24 }) })] }), _jsx("form", { onSubmit: handleSearch, className: "md:hidden pb-3", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light", size: 18 }), _jsx("input", { type: "text", placeholder: "Search properties...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" })] }) })] }), _jsx(AnimatePresence, { children: mobileMenuOpen && (_jsxs(_Fragment, { children: [_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, onClick: () => setMobileMenuOpen(false), className: "fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden" }), _jsx(motion.div, { initial: { x: '-100%' }, animate: { x: 0 }, exit: { x: '-100%' }, transition: { type: 'tween', ease: 'easeOut', duration: 0.3 }, className: "fixed left-0 top-0 bottom-0 w-80 bg-surface shadow-xl z-50 md:hidden overflow-y-auto", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-8", children: [_jsx(Link, { to: "/", onClick: () => setMobileMenuOpen(false), children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-8 h-8 bg-primary rounded-lg flex items-center justify-center", children: _jsx(Building2, { className: "text-white", size: 20 }) }), _jsx("span", { className: "text-xl font-bold text-text", children: "Pezani" })] }) }), _jsx("button", { onClick: () => setMobileMenuOpen(false), className: "p-2 rounded-lg hover:bg-gray-100 transition-colors", children: _jsx(X, { size: 24 }) })] }), _jsxs("div", { className: "space-y-2 mb-6", children: [navLinks.map((link) => (_jsxs(Link, { to: link.path, onClick: () => setMobileMenuOpen(false), className: "flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors", children: [_jsx(link.icon, { size: 20, className: "text-primary" }), _jsx("span", { className: "font-medium text-text", children: link.name })] }, link.path))), canAddProperty && (_jsxs(Link, { to: "/properties/add", onClick: () => setMobileMenuOpen(false), className: "flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors", children: [_jsx(PlusCircle, { size: 20, className: "text-primary" }), _jsx("span", { className: "font-medium text-text", children: "Add Property" })] }))] }), _jsx("div", { className: "border-t border-gray-200 pt-6", children: user ? (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "px-4 py-2 bg-gray-50 rounded-lg", children: [_jsx("p", { className: "text-sm text-text-light", children: "Signed in as" }), _jsx("p", { className: "font-medium text-text", children: user.user_metadata?.full_name || user.email })] }), _jsx(Button, { fullWidth: true, variant: "outline", onClick: handleSignOut, children: "Logout" })] })) : (_jsxs("div", { className: "space-y-3", children: [_jsx(Link, { to: "/login", onClick: () => setMobileMenuOpen(false), children: _jsx(Button, { fullWidth: true, variant: "outline", children: "Login" }) }), _jsx(Link, { to: "/signup", onClick: () => setMobileMenuOpen(false), children: _jsx(Button, { fullWidth: true, children: "Sign Up" }) })] })) })] }) })] })) })] }));
};
export default Navbar;
