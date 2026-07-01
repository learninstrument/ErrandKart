import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  theme?: 'orange' | 'green';
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  theme = 'orange',
  className = '',
  ...props
}) => (
  <div className="mb-4 flex w-full flex-col gap-1.5 text-left">
    <label className="ml-1 text-[11px] font-bold uppercase tracking-[0.14em] text-black/50 dark:text-white/50">{label}</label>
    <textarea
      className={`flex w-full resize-none rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 py-3 text-[15px] font-semibold text-black dark:text-white shadow-inner transition-all placeholder:text-black/30 dark:placeholder:text-white/30 focus:outline-none focus:ring-1 hover:border-black/20 dark:hover:border-white/20 focus:bg-white dark:focus:bg-[#000000] ${
        theme === 'orange'
          ? 'focus:border-[#ff6600] focus:ring-[#ff6600]/30'
          : 'focus:border-market-green focus:ring-market-green/30'
      } ${className}`}
      {...props}
    ></textarea>
  </div>
);