import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;

    const baseInputStyles = 'block w-full rounded-lg border transition-all focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:cursor-not-allowed';
    
    const stateStyles = hasError
      ? 'border-error focus:border-error focus:ring-error'
      : 'border-gray-300 focus:border-primary focus:ring-primary';

    const paddingStyles = leftIcon && rightIcon
      ? 'pl-10 pr-10'
      : leftIcon
      ? 'pl-10 pr-4'
      : rightIcon
      ? 'pl-4 pr-10'
      : 'px-4';

    const sizeStyles = 'py-2.5 text-base';

    const widthStyle = fullWidth ? 'w-full' : '';

    return (
      <div className={widthStyle}>
        {label && (
          <label className="block text-sm font-medium text-text mb-1.5">
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light">
              {leftIcon}
            </div>
          )}

          <motion.input
            ref={ref}
            whileFocus={{ scale: 1.01 }}
            className={`${baseInputStyles} ${stateStyles} ${paddingStyles} ${sizeStyles} text-text bg-white ${className}`}
            disabled={disabled}
            {...(Object.fromEntries(
              Object.entries(props).filter(([key]) => 
                !['onDrag', 'onDragStart', 'onDragEnd'].includes(key)
              )
            ) as any)}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-light">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1.5 text-sm text-error"
          >
            {error}
          </motion.p>
        )}

        {helperText && !error && (
          <p className="mt-1.5 text-sm text-text-light">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
