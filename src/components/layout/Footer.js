import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin } from 'lucide-react';
const Footer = () => {
    const currentYear = new Date().getFullYear();
    const quickLinks = [
        { name: 'Home', path: '/' },
        { name: 'Browse Properties', path: '/browse' },
        { name: 'About Us', path: '/about' },
        { name: 'Contact', path: '/contact' },
    ];
    const legalLinks = [
        { name: 'Privacy Policy', path: '/privacy' },
        { name: 'Terms of Service', path: '/terms' },
    ];
    return (_jsx("footer", { className: "bg-gray-900 text-white mt-auto", children: _jsxs("div", { className: "container-custom py-12", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8", children: [_jsxs("div", { children: [_jsxs(Link, { to: "/", className: "flex items-center space-x-2 mb-4", children: [_jsx("div", { className: "w-8 h-8 bg-primary rounded-lg flex items-center justify-center", children: _jsx(Building2, { className: "text-white", size: 20 }) }), _jsx("span", { className: "text-xl font-bold text-white", children: "Pezani Estates" })] }), _jsx("p", { className: "text-white/90 text-sm mb-4", children: "Find your perfect home in Malawi. Browse thousands of properties and connect with landlords directly." })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-lg mb-4 text-white", children: "Quick Links" }), _jsx("ul", { className: "space-y-2", children: quickLinks.map((link) => (_jsx("li", { children: _jsx(Link, { to: link.path, className: "text-white/90 hover:text-white transition-colors text-sm", children: link.name }) }, link.path))) })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-lg mb-4 text-white", children: "Legal" }), _jsx("ul", { className: "space-y-2", children: legalLinks.map((link) => (_jsx("li", { children: _jsx(Link, { to: link.path, className: "text-white/90 hover:text-white transition-colors text-sm", children: link.name }) }, link.path))) })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-lg mb-4 text-white", children: "Contact Us" }), _jsxs("ul", { className: "space-y-3", children: [_jsxs("li", { className: "flex items-start space-x-3 text-sm", children: [_jsx(MapPin, { size: 18, className: "text-primary flex-shrink-0 mt-0.5" }), _jsx("span", { className: "text-white/90", children: "Lilongwe, Malawi" })] }), _jsxs("li", { className: "flex items-start space-x-3 text-sm", children: [_jsx(Phone, { size: 18, className: "text-primary flex-shrink-0 mt-0.5" }), _jsx("span", { className: "text-white/90", children: "+265 888 123 456" })] }), _jsxs("li", { className: "flex items-start space-x-3 text-sm", children: [_jsx(Mail, { size: 18, className: "text-primary flex-shrink-0 mt-0.5" }), _jsx("span", { className: "text-white/90", children: "info@pezani.com" })] })] })] })] }), _jsx("div", { className: "border-t border-white/20 mt-8 pt-8 text-center", children: _jsxs("p", { className: "text-white/90 text-sm", children: ["\u00A9 ", currentYear, " Pezani Estates. All rights reserved."] }) })] }) }));
};
export default Footer;
