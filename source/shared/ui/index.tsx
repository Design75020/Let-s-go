
import React from 'react';
import { motion } from 'framer-motion';

export const Card = ({ children, className = '', ...props }: any) => (
  <motion.div 
    whileHover={{ y: -4 }}
    className={`bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm transition-all hover:shadow-xl ${className}`}
    {...props}
  >
    {children}
  </motion.div>
);

export const Button = ({ children, variant = 'primary', className = '', ...props }: any) => {
  const variants = {
    primary: 'bg-slate-900 text-white hover:bg-slate-800',
    ghost: 'bg-slate-50 text-slate-400 hover:bg-slate-100',
    outline: 'border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white',
    danger: 'bg-red-50 text-red-500 hover:bg-red-100'
  } as any;

  return (
    <motion.button 
      whileTap={{ scale: 0.98 }}
      className={`px-8 py-4 rounded-2xl font-black italic uppercase tracking-widest text-[10px] transition-all disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export const SectionTitle = ({ title, subtitle }: { title: string, subtitle?: string }) => (
  <div className="mb-12">
    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 leading-none mb-2">{title}</h2>
    {subtitle && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{subtitle}</p>}
  </div>
);
