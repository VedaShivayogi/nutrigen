import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false,
  onClick,
  className = '',
  type = 'button',
  as = 'button', 
  ...props 
}) => {
  const baseClasses = 'font-semibold rounded-full transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm';
  
  const variants = {
    primary: 'bg-gradient-to-r from-primary to-primary-dark text-white focus:ring-primary hover:shadow-lg hover:brightness-105',
    secondary: 'bg-gradient-to-r from-secondary to-secondary-dark text-white focus:ring-secondary hover:shadow-lg hover:brightness-105',
    outline: 'border-2 border-primary/70 text-primary hover:bg-primary hover:text-white focus:ring-primary',
    ghost: 'text-primary hover:bg-primary/10 focus:ring-primary shadow-none',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500 shadow-md hover:shadow-lg',
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`;

  const MotionComponent = motion(as === 'button' ? 'button' : as);

  const motionProps = {
    whileHover: !disabled ? { scale: 1.02, y: -1 } : {},
    whileTap: !disabled ? { scale: 0.98 } : {},
    className: classes,
    onClick,
    ...props,
  };

  if (as === 'button' || as === undefined) {
    motionProps.type = type;
    motionProps.disabled = disabled || loading;
  }

  return (
    <MotionComponent {...motionProps}>
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </MotionComponent>
  );
};

export default Button;