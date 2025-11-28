import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface FormFieldProps {
  label: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  children: ReactNode;
  htmlFor?: string;
}

/**
 * FormField component that wraps form inputs with label, error, and help text
 * Provides consistent styling and animations for form validation feedback
 */
const FormField = ({
  label,
  error,
  helpText,
  required = false,
  children,
  htmlFor,
}: FormFieldProps) => {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-text"
      >
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </label>

      {children}

      <AnimatePresence mode="wait">
        {error ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex items-start gap-1.5 text-sm text-error"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        ) : helpText ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-sm text-text-light"
          >
            {helpText}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default FormField;

