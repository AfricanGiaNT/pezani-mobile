import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
const Modal = ({ isOpen, onClose, title, children, size = 'md', showCloseButton = true, }) => {
    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);
    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);
    const sizeStyles = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        full: 'max-w-full mx-4',
    };
    return (_jsx(AnimatePresence, { children: isOpen && (_jsxs(_Fragment, { children: [_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, onClick: onClose, className: "fixed inset-0 bg-black/50 backdrop-blur-sm z-40" }), _jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: _jsxs(motion.div, { initial: { scale: 0.95, opacity: 0, y: 20 }, animate: { scale: 1, opacity: 1, y: 0 }, exit: { scale: 0.95, opacity: 0, y: 20 }, transition: { type: 'spring', stiffness: 300, damping: 30 }, className: `bg-surface rounded-lg shadow-xl w-full ${sizeStyles[size]} max-h-[90vh] overflow-y-auto`, onClick: (e) => e.stopPropagation(), children: [(title || showCloseButton) && (_jsxs("div", { className: "flex items-center justify-between p-4 border-b border-gray-200", children: [title && (_jsx("h2", { className: "text-xl font-semibold text-text", children: title })), showCloseButton && (_jsx(motion.button, { whileHover: { scale: 1.1 }, whileTap: { scale: 0.9 }, onClick: onClose, className: "p-1 rounded-lg hover:bg-gray-100 transition-colors", "aria-label": "Close modal", children: _jsx(X, { size: 20, className: "text-text-light" }) }))] })), _jsx("div", { className: "p-4", children: children })] }) })] })) }));
};
export default Modal;
