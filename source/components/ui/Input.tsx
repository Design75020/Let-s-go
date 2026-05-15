import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white
            placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50
            focus:ring-1 focus:ring-emerald-500/50 transition-all
            ${error ? 'border-red-500/50' : ''}
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-[10px] text-red-500 font-bold ml-1 italic">{error}</p>}
      </div>
    );
  }
);
