import React, { forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  theme?: 'orange' | 'green';
  icon?: React.ReactNode;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, theme = 'orange', icon, error, ...props }, ref) => {
    const accent =
      theme === 'orange'
        ? 'focus:border-kart-orange focus:ring-kart-orange/30'
        : 'focus:border-market-green focus:ring-market-green/30';

    return (
      <div className="mb-4 flex w-full flex-col gap-1.5 text-left">
        {label && (
          <label className="ml-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white/50">
            {label}
          </label>
        )}
        <div className="relative group">
          {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 transition-colors group-focus-within:text-kart-orange">{icon}</div>}
          <input
            type={type}
            ref={ref}
            className={cn(
              'flex h-12 w-full rounded-2xl border border-white/20 bg-black px-4 py-2 text-[15px] text-white shadow-inner transition-all placeholder:text-white/30 focus:outline-none focus:ring-1 hover:border-white/40',
              icon ? 'pl-11 pr-4' : 'px-4',
              accent,
              error && 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20',
              className
            )}
            {...props}
          />
        </div>
        {error && <span className="ml-1 text-xs font-semibold text-red-400">{error}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";