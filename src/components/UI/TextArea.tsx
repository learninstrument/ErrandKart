// Removed unused React import to satisfy Vercel
export const TextArea = ({ label, placeholder, rows = 3 }: { label: string, placeholder?: string, rows?: number }) => (
  <div className="flex flex-col gap-1.5 mb-4 text-left w-full">
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">{label}</label>
    <textarea
      rows={rows}
      className="flex w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-[#333333] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent placeholder:text-gray-400 resize-none"
      placeholder={placeholder}
    ></textarea>
  </div>
);