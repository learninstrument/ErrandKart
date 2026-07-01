import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  theme?: 'orange' | 'green' | 'black' | 'white';
  fullWidth?: boolean;
  children: ReactNode;
}

export const Button = ({
  children,
  variant = 'primary',
  theme = 'black',
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
        : theme === 'green'
        ? 'bg-market-green text-white shadow-[0_0_15px_rgba(46,139,87,0.2)] hover:shadow-[0_0_25px_rgba(46,139,87,0.4)] hover:brightness-110'
        : theme === 'white'
        ? 'bg-white text-black shadow-lg hover:bg-gray-100'
        : 'bg-black text-white dark:bg-white dark:text-black shadow-lg hover:opacity-90',
    outline:
      'border border-black/10 dark:border-white/10 bg-white/80 dark:bg-[#0A0A0A]/80 text-black dark:text-white shadow-lg backdrop-blur-md hover:border-black/30 dark:hover:border-white/30',
    ghost: 
      'bg-transparent text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white',
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