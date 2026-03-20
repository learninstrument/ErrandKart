import React, { forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Vercel needs this interface to know 'theme' and 'icon' are allowed!
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  theme?: 'orange' | 'green';
  icon?: React.ReactNode;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, theme = 'orange', icon, error, ...props }, ref) => {
    const focusRing = theme === 'orange' ? 'focus:ring-[#FF6600]' : 'focus:ring-[#2E8B57]';
    
    return (
      <div className="flex flex-col gap-1.5 mb-4 text-left w-full">
        {label && <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">{label}</label>}
        <div className="relative">
          {icon && <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">{icon}</div>}
          <input
            type={type}
            ref={ref}
            className={cn(
              "flex h-12 w-full rounded-xl border border-gray-200 bg-gray-50 py-2 text-sm text-[#333333] transition-colors focus:outline-none focus:ring-2 focus:border-transparent placeholder:text-gray-400",
              icon ? 'pl-11 pr-4' : 'px-4',
              focusRing,
              error && "border-red-500 focus:ring-red-500",
              className
            )}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-red-500 ml-1 font-medium">{error}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";