import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import PropertyCard from './PropertyCard';
import { staggerContainer, staggerItem } from '@/utils/animations';
const PropertyGrid = ({ properties, loading = false, emptyMessage = 'No properties found', onSaveProperty, }) => {
    if (loading) {
        return (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6", children: [...Array(8)].map((_, index) => (_jsxs("div", { className: "animate-pulse", children: [_jsx("div", { className: "bg-gray-200 h-48 rounded-t-lg" }), _jsxs("div", { className: "bg-surface p-4 rounded-b-lg border border-gray-200", children: [_jsx("div", { className: "h-4 bg-gray-200 rounded mb-2" }), _jsx("div", { className: "h-4 bg-gray-200 rounded w-3/4 mb-3" }), _jsx("div", { className: "h-6 bg-gray-200 rounded w-1/2 mb-3" }), _jsxs("div", { className: "flex gap-3 mb-3", children: [_jsx("div", { className: "h-4 bg-gray-200 rounded w-12" }), _jsx("div", { className: "h-4 bg-gray-200 rounded w-12" }), _jsx("div", { className: "h-4 bg-gray-200 rounded w-16" })] }), _jsx("div", { className: "h-6 bg-gray-200 rounded w-20" })] })] }, index))) }));
    }
    if (properties.length === 0) {
        return (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "text-center py-12", children: [_jsx("div", { className: "w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center", children: _jsx("span", { className: "text-4xl", children: "\uD83C\uDFE0" }) }), _jsx("h3", { className: "text-xl font-semibold text-text mb-2", children: emptyMessage }), _jsx("p", { className: "text-text-light", children: "Try adjusting your search filters" })] }));
    }
    return (_jsx(motion.div, { variants: staggerContainer, initial: "initial", animate: "animate", className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6", children: properties.map((property) => (_jsx(motion.div, { variants: staggerItem, children: _jsx(PropertyCard, { property: property, onSave: onSaveProperty }) }, property.id))) }));
};
export default PropertyGrid;
