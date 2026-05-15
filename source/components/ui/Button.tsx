import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-xl font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95';

    const variants = {
      primary: 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/20',
      secondary: 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm',
      outline: 'border-2 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10',
      danger: 'bg-red-500 text-white hover:bg-red-400 shadow-lg shadow-red-500/20',
      ghost: 'hover:bg-white/5 text-white/70 hover:text-white',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-[10px] uppercase tracking-wider',
      md: 'px-6 py-3 text-sm',
      lg: 'px-8 py-4 text-base',
      icon: 'p-2',
    };

    return (
      <motion.button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        whileTap={{ scale: 0.98 }}
        {...props as any}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
          </>
        )}
      </motion.button>
    );
  }
);
