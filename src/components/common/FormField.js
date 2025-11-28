import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
/**
 * FormField component that wraps form inputs with label, error, and help text
 * Provides consistent styling and animations for form validation feedback
 */
const FormField = ({ label, error, helpText, required = false, children, htmlFor, }) => {
    return (_jsxs("div", { className: "space-y-1.5", children: [_jsxs("label", { htmlFor: htmlFor, className: "block text-sm font-medium text-text", children: [label, required && _jsx("span", { className: "text-error ml-1", children: "*" })] }), children, _jsx(AnimatePresence, { mode: "wait", children: error ? (_jsxs(motion.div, { initial: { opacity: 0, y: -10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, transition: { duration: 0.2 }, className: "flex items-start gap-1.5 text-sm text-error", children: [_jsx(AlertCircle, { className: "w-4 h-4 mt-0.5 flex-shrink-0" }), _jsx("span", { children: error })] })) : helpText ? (_jsx(motion.p, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.2 }, className: "text-sm text-text-light", children: helpText })) : null })] }));
};
export default FormField;
