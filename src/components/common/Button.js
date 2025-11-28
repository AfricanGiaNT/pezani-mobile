import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Spinner } from '@/components/ui/spinner';
const Button = forwardRef(({ variant = 'primary', size = 'md', loading = false, isLoading, fullWidth = false, disabled, className = '', children, leftIcon, rightIcon, ...props }, ref) => {
    // Use isLoading if provided, otherwise use loading
    const isButtonLoading = isLoading !== undefined ? isLoading : loading;
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    const variantStyles = {
        primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary shadow-sm',
        secondary: 'bg-secondary text-white hover:bg-secondary-dark focus:ring-secondary shadow-sm',
        outline: 'bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary',
        ghost: 'bg-transparent text-text hover:bg-gray-100 focus:ring-gray-300',
        danger: 'bg-error text-white hover:bg-red-600 focus:ring-error shadow-sm',
    };
    const sizeStyles = {
        sm: 'px-4 py-2.5 text-sm min-h-[44px]', // Minimum 44px touch target for mobile
        md: 'px-6 py-3 text-base min-h-[48px]',
        lg: 'px-8 py-4 text-lg min-h-[52px]',
    };
    const widthStyle = fullWidth ? 'w-full' : '';
    const iconSpacing = size === 'sm' ? 'gap-1.5' : size === 'lg' ? 'gap-2.5' : 'gap-2';
    // Filter out custom props that shouldn't be passed to DOM
    const { loading: _, isLoading: __, fullWidth: ___, leftIcon: ____, rightIcon: _____, ...domProps } = props;
    return (_jsx(motion.button, { ref: ref, whileTap: { scale: disabled || isButtonLoading ? 1 : 0.98 }, whileHover: { scale: disabled || isButtonLoading ? 1 : 1.02 }, className: `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`, disabled: disabled || isButtonLoading, ...domProps, children: isButtonLoading ? (_jsxs(_Fragment, { children: [_jsx(Spinner, { className: "mr-2" }), children] })) : (_jsxs("span", { className: `flex items-center ${iconSpacing}`, children: [leftIcon && _jsx("span", { className: "flex-shrink-0", children: leftIcon }), children, rightIcon && _jsx("span", { className: "flex-shrink-0", children: rightIcon })] })) }));
});
Button.displayName = 'Button';
export default Button;
