import { HTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card = ({
  children,
  header,
  footer,
  hoverable = false,
  padding = 'md',
  className = '',
  ...props
}: CardProps) => {
  const baseStyles = 'bg-surface rounded-lg border border-gray-200 transition-shadow';
  
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const hoverStyles = hoverable ? 'cursor-pointer' : '';

  const cardContent = (
    <>
      {header && (
        <div className={`border-b border-gray-200 ${padding !== 'none' ? 'pb-4 mb-4' : ''}`}>
          {header}
        </div>
      )}
      
      <div className={padding !== 'none' && (header || footer) ? '' : ''}>
        {children}
      </div>

      {footer && (
        <div className={`border-t border-gray-200 ${padding !== 'none' ? 'pt-4 mt-4' : ''}`}>
          {footer}
        </div>
      )}
    </>
  );

  if (hoverable) {
    // Exclude drag-related props that conflict with motion
    const { onDrag, onDragStart, onDragEnd, ...motionProps } = props;
    return (
      <motion.div
        whileHover={{ y: -4, boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
        className={`${baseStyles} ${paddingStyles[padding]} ${hoverStyles} ${className}`}
        {...(motionProps as any)}
      >
        {cardContent}
      </motion.div>
    );
  }

  return (
    <div
      className={`${baseStyles} ${paddingStyles[padding]} ${hoverStyles} ${className}`}
      {...props}
    >
      {cardContent}
    </div>
  );
};

export default Card;

