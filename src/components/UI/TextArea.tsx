export const TextArea = ({
  label,
  placeholder,
  rows = 3,
  theme = 'orange',
}: {
  label: string;
  placeholder?: string;
  rows?: number;
  theme?: 'orange' | 'green';
}) => (
  <div className="mb-4 flex w-full flex-col gap-1.5 text-left">
    <label className="ml-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</label>
    <textarea
      rows={rows}
      className={`flex w-full resize-none rounded-2xl border border-[#253043] bg-[#111621] px-4 py-3 text-sm text-white shadow-[0_10px_24px_rgba(0,0,0,0.18)] transition-all placeholder:text-slate-500 focus:outline-none focus:ring-4 ${
        theme === 'orange'
          ? 'focus:border-kart-orange focus:ring-kart-orange/25'
          : 'focus:border-market-green focus:ring-market-green/25'
      }`}
      placeholder={placeholder}
    ></textarea>
  </div>
);