import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { X, Filter } from 'lucide-react';
import { Button } from '@/components/common';
import { malawiLocations, propertyTypes } from '@/utils/validation';
const PropertyFilters = ({ filters, onFiltersChange, onReset, isMobile = false, onClose, }) => {
    const [localFilters, setLocalFilters] = useState(filters);
    const updateFilter = (key, value) => {
        const updated = { ...localFilters, [key]: value };
        setLocalFilters(updated);
        onFiltersChange(updated);
    };
    const togglePropertyType = (type) => {
        const updated = {
            ...localFilters,
            propertyTypes: localFilters.propertyTypes.includes(type)
                ? localFilters.propertyTypes.filter(t => t !== type)
                : [...localFilters.propertyTypes, type],
        };
        setLocalFilters(updated);
        onFiltersChange(updated);
    };
    const handleReset = () => {
        const resetFilters = {
            location: '',
            minPrice: '',
            maxPrice: '',
            bedrooms: '',
            propertyTypes: [],
            status: 'available',
        };
        setLocalFilters(resetFilters);
        onReset();
    };
    const hasActiveFilters = localFilters.location !== '' ||
        localFilters.minPrice !== '' ||
        localFilters.maxPrice !== '' ||
        localFilters.bedrooms !== '' ||
        localFilters.propertyTypes.length > 0 ||
        localFilters.status !== 'available';
    return (_jsxs("div", { className: `bg-surface rounded-lg shadow-md ${isMobile ? 'p-4' : 'p-6'}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Filter, { size: 20, className: "text-primary" }), _jsx("h3", { className: "text-lg font-semibold text-text", children: "Filters" })] }), isMobile && onClose && (_jsx("button", { onClick: onClose, className: "p-1 rounded-lg hover:bg-gray-100 transition-colors", "aria-label": "Close filters", children: _jsx(X, { size: 20 }) }))] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-text mb-2", children: "Location" }), _jsxs("select", { value: localFilters.location, onChange: (e) => updateFilter('location', e.target.value), className: "w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary px-4 py-2 text-base", children: [_jsx("option", { value: "", children: "All Locations" }), malawiLocations.map((location) => (_jsx("option", { value: location, children: location }, location)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-text mb-2", children: "Price Range (MWK)" }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsx("div", { children: _jsx("input", { type: "number", placeholder: "Min", value: localFilters.minPrice, onChange: (e) => updateFilter('minPrice', e.target.value ? Number(e.target.value) : ''), className: "w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary px-4 py-2 text-base", min: "0" }) }), _jsx("div", { children: _jsx("input", { type: "number", placeholder: "Max", value: localFilters.maxPrice, onChange: (e) => updateFilter('maxPrice', e.target.value ? Number(e.target.value) : ''), className: "w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary px-4 py-2 text-base", min: "0" }) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-text mb-2", children: "Bedrooms" }), _jsxs("select", { value: localFilters.bedrooms, onChange: (e) => updateFilter('bedrooms', e.target.value), className: "w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary px-4 py-2 text-base", children: [_jsx("option", { value: "", children: "Any" }), _jsx("option", { value: "1", children: "1 Bedroom" }), _jsx("option", { value: "2", children: "2 Bedrooms" }), _jsx("option", { value: "3", children: "3 Bedrooms" }), _jsx("option", { value: "4", children: "4 Bedrooms" }), _jsx("option", { value: "5+", children: "5+ Bedrooms" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-text mb-2", children: "Property Type" }), _jsx("div", { className: "space-y-2", children: propertyTypes.map((type) => (_jsxs("label", { className: "flex items-center space-x-2 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: localFilters.propertyTypes.includes(type.value), onChange: () => togglePropertyType(type.value), className: "w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" }), _jsx("span", { className: "text-sm text-text", children: type.label })] }, type.value))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-text mb-2", children: "Status" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("label", { className: "flex items-center space-x-2 cursor-pointer", children: [_jsx("input", { type: "radio", name: "status", value: "available", checked: localFilters.status === 'available', onChange: (e) => updateFilter('status', e.target.value), className: "w-4 h-4 text-primary border-gray-300 focus:ring-primary" }), _jsx("span", { className: "text-sm text-text", children: "Available Only" })] }), _jsxs("label", { className: "flex items-center space-x-2 cursor-pointer", children: [_jsx("input", { type: "radio", name: "status", value: "all", checked: localFilters.status === 'all', onChange: (e) => updateFilter('status', e.target.value), className: "w-4 h-4 text-primary border-gray-300 focus:ring-primary" }), _jsx("span", { className: "text-sm text-text", children: "All Properties" })] })] })] }), hasActiveFilters && (_jsxs(Button, { variant: "outline", fullWidth: true, onClick: handleReset, children: [_jsx(X, { size: 16, className: "mr-2" }), "Reset Filters"] }))] })] }));
};
export default PropertyFilters;
