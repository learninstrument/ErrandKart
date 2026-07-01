import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemeSwitcherProps {
  className?: string;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex h-9 w-16 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-black dark:bg-[#1A1A1A] dark:border-white/10 ${className}`}
      aria-label="Toggle theme"
    >
      <span className="sr-only">Toggle theme</span>
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-300 ease-in-out ${
          theme === 'dark' ? 'translate-x-3.5 bg-black' : '-translate-x-3.5'
        }`}
      >
        <div className="flex h-full w-full items-center justify-center">
          {theme === 'dark' ? (
            <Moon size={14} className="text-white" />
          ) : (
            <Sun size={14} className="text-yellow-500" />
          )}
        </div>
      </span>
    </button>
  );
};
