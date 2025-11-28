import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
const Card = ({ children, header, footer, hoverable = false, padding = 'md', className = '', ...props }) => {
    const baseStyles = 'bg-surface rounded-lg border border-gray-200 transition-shadow';
    const paddingStyles = {
        none: '',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
    };
    const hoverStyles = hoverable ? 'cursor-pointer' : '';
    const cardContent = (_jsxs(_Fragment, { children: [header && (_jsx("div", { className: `border-b border-gray-200 ${padding !== 'none' ? 'pb-4 mb-4' : ''}`, children: header })), _jsx("div", { className: padding !== 'none' && (header || footer) ? '' : '', children: children }), footer && (_jsx("div", { className: `border-t border-gray-200 ${padding !== 'none' ? 'pt-4 mt-4' : ''}`, children: footer }))] }));
    if (hoverable) {
        // Exclude drag-related props that conflict with motion
        const { onDrag, onDragStart, onDragEnd, ...motionProps } = props;
        return (_jsx(motion.div, { whileHover: { y: -4, boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }, className: `${baseStyles} ${paddingStyles[padding]} ${hoverStyles} ${className}`, ...motionProps, children: cardContent }));
    }
    return (_jsx("div", { className: `${baseStyles} ${paddingStyles[padding]} ${hoverStyles} ${className}`, ...props, children: cardContent }));
};
export default Card;
