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
    'inline-flex items-center justify-center rounded-2xl px-5 py-3.5 text-sm font-semibold transition-all duration-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0';

  const variants = {
    primary:
      theme === 'orange'
        ? 'bg-kart-orange text-white shadow-[0_14px_28px_rgba(255,102,0,0.35)] hover:brightness-95 focus-visible:ring-kart-orange/50'
        : 'bg-market-green text-white shadow-[0_14px_28px_rgba(46,139,87,0.35)] hover:brightness-95 focus-visible:ring-market-green/50',
    outline:
      'border border-[#263042] bg-[#111621] text-white/80 shadow-[0_10px_24px_rgba(0,0,0,0.18)] hover:border-[#364155] hover:text-white focus-visible:ring-white/20',
    ghost: 'bg-transparent text-white/70 hover:bg-white/10 focus-visible:ring-white/20',
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