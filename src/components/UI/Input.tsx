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
        ? 'focus:border-kart-orange focus:ring-kart-orange/25'
        : 'focus:border-market-green focus:ring-market-green/25';

    return (
      <div className="mb-4 flex w-full flex-col gap-1.5 text-left">
        {label && (
          <label className="ml-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
          <input
            type={type}
            ref={ref}
            className={cn(
              'flex h-12 w-full rounded-2xl border border-[#253043] bg-[#111621] px-4 py-2 text-sm text-white shadow-[0_10px_24px_rgba(0,0,0,0.18)] transition-all placeholder:text-slate-500 focus:outline-none focus:ring-4',
              icon ? 'pl-11 pr-4' : 'px-4',
              accent,
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/25',
              className
            )}
            {...props}
          />
        </div>
        {error && <span className="ml-1 text-xs font-medium text-red-400">{error}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";