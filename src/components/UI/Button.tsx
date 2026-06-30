import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  theme?: 'orange' | 'green';
  fullWidth?: boolean;
  children: ReactNode;
}

export const Button = ({
  children,
  variant = 'primary',
  theme = 'orange',
  fullWidth,
  className,
  ...props
}: ButtonProps) => {
  const baseStyle =
    'inline-flex items-center justify-center rounded-2xl px-5 py-3.5 text-sm font-semibold transition-all duration-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none';

  const variants = {
    primary:
      theme === 'orange'
        ? 'bg-kart-orange text-white shadow-[0_0_15px_rgba(255,102,0,0.2)] hover:shadow-[0_0_25px_rgba(255,102,0,0.4)] hover:brightness-110'
        : 'bg-market-green text-white shadow-[0_0_15px_rgba(46,139,87,0.2)] hover:shadow-[0_0_25px_rgba(46,139,87,0.4)] hover:brightness-110',
    outline:
      'border border-[#1e293b] bg-[#111722]/80 text-white shadow-lg backdrop-blur-md hover:border-kart-orange/50 hover:bg-[#111722]',
    ghost: 
      'bg-transparent text-white/60 hover:bg-white/10 hover:text-white',
  };

  return (
    <button
      className={cn(baseStyle, variants[variant], fullWidth && "w-full", className)}
      {...props}
    >
      {children}
    </button>
  );
};