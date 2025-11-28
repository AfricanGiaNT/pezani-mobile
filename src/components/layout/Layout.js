import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import BottomNavBar from './BottomNavBar';
import { useAuth } from '@/hooks/useAuth';
const Layout = ({ children }) => {
    const location = useLocation();
    const { user } = useAuth();
    // Add padding for bottom nav on mobile when user is logged in
    const mainPaddingClass = user ? 'pb-20 md:pb-0' : '';
    return (_jsxs("div", { className: "min-h-screen flex flex-col", children: [_jsx(Navbar, {}), _jsx(motion.main, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.3 }, className: `flex-grow ${mainPaddingClass}`, children: children }, location.pathname), _jsx(Footer, {}), _jsx(BottomNavBar, {})] }));
};
export default Layout;
