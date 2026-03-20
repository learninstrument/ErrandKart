import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  theme?: 'orange' | 'green';
  fullWidth?: boolean;
}

export const Button = ({ 
  children, 
  variant = 'primary', 
  theme = 'orange', 
  fullWidth, 
  className,
  ...props 
}: ButtonProps) => {
  const baseStyle = "inline-flex items-center justify-center font-bold transition-all duration-200 active:scale-95 rounded-xl py-3 px-4 text-sm";
  const variants = {
    primary: theme === 'orange' 
      ? "bg-[#FF6600] text-white hover:bg-[#E65C00] shadow-lg shadow-orange-200" 
      : "bg-[#2E8B57] text-white hover:bg-[#236B43] shadow-lg shadow-green-200",
    outline: "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm",
    ghost: "bg-transparent text-gray-500 hover:bg-gray-100 shadow-none"
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