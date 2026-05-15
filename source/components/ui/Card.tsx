import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export const Card = ({ children, className = '', onClick, hover = true }: CardProps) => {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hover && onClick ? { y: -4, scale: 1.01 } : {}}
      className={`bg-[#121417] border border-white/5 rounded-2xl overflow-hidden ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
};

export const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);
