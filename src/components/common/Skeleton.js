import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const Skeleton = ({ className = '', variant = 'rectangular', width, height, animation = 'pulse', }) => {
    const baseClasses = 'bg-gray-200';
    const animationClasses = {
        pulse: 'animate-pulse',
        wave: 'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]',
    };
    const variantClasses = {
        text: 'rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-lg',
    };
    const style = {
        width: width || '100%',
        height: height || (variant === 'text' ? '1em' : '100%'),
    };
    return (_jsx("div", { className: `${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`, style: style }));
};
// Pre-built skeleton patterns
export const PropertyCardSkeleton = () => {
    return (_jsxs("div", { className: "bg-white rounded-lg shadow-md overflow-hidden", children: [_jsx(Skeleton, { height: "200px", className: "w-full" }), _jsxs("div", { className: "p-4 space-y-3", children: [_jsx(Skeleton, { height: "24px", className: "w-3/4" }), _jsx(Skeleton, { height: "16px", className: "w-1/2" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Skeleton, { height: "16px", width: "60px" }), _jsx(Skeleton, { height: "16px", width: "60px" }), _jsx(Skeleton, { height: "16px", width: "60px" })] }), _jsx(Skeleton, { height: "20px", className: "w-1/3" })] })] }));
};
export const PropertyGridSkeleton = ({ count = 6, }) => {
    return (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6", children: Array.from({ length: count }).map((_, i) => (_jsx(PropertyCardSkeleton, {}, i))) }));
};
export const PropertyDetailSkeleton = () => {
    return (_jsxs("div", { className: "max-w-7xl mx-auto px-4 py-8 space-y-6", children: [_jsx(Skeleton, { height: "400px", className: "w-full rounded-lg" }), _jsxs("div", { className: "space-y-3", children: [_jsx(Skeleton, { height: "32px", className: "w-3/4" }), _jsx(Skeleton, { height: "24px", className: "w-1/4" })] }), _jsxs("div", { className: "flex gap-4", children: [_jsx(Skeleton, { height: "40px", width: "100px" }), _jsx(Skeleton, { height: "40px", width: "100px" }), _jsx(Skeleton, { height: "40px", width: "100px" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Skeleton, { height: "16px", className: "w-full" }), _jsx(Skeleton, { height: "16px", className: "w-full" }), _jsx(Skeleton, { height: "16px", className: "w-3/4" })] }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: Array.from({ length: 8 }).map((_, i) => (_jsx(Skeleton, { height: "60px" }, i))) }), _jsx(Skeleton, { height: "48px", className: "w-full rounded-lg" })] }));
};
export const DashboardSkeleton = () => {
    return (_jsxs("div", { className: "max-w-7xl mx-auto px-4 py-8 space-y-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Skeleton, { height: "32px", className: "w-1/3" }), _jsx(Skeleton, { height: "16px", className: "w-1/4" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: Array.from({ length: 3 }).map((_, i) => (_jsx(Skeleton, { height: "100px", className: "rounded-lg" }, i))) }), _jsx("div", { className: "space-y-3", children: Array.from({ length: 5 }).map((_, i) => (_jsx(Skeleton, { height: "80px", className: "rounded-lg" }, i))) })] }));
};
