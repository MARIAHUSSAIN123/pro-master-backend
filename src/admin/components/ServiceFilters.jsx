import { Search, Download, Plus } from "lucide-react";

const CATEGORY_OPTIONS = [
  "All Categories",
  "Residential",
  "Commercial",
  "Deep Cleaning",
  "Carpet Cleaning",
  "Window Cleaning",
  "Move In / Move Out",
  "Post Construction",
];

export default function ServiceFilters({
  search = "",
  onSearchChange,
  category = "All Categories",
  onCategoryChange,
  status = "All Status",
  onStatusChange,
  onExport,
  onAddClick,
}) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-[#111827] p-6 shadow-xl">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-1 flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search services..."
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 py-3 pl-12 pr-4 text-white outline-none transition focus:border-cyan-500"
            />
          </div>

          <select
            value={category}
            onChange={(e) => onCategoryChange?.(e.target.value)}
            className="rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-white outline-none focus:border-cyan-500"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => onStatusChange?.(e.target.value)}
            className="rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-white outline-none focus:border-cyan-500"
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={onExport}
            className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-white transition hover:border-cyan-500 hover:bg-slate-800"
          >
            <Download size={18} />
            Export
          </button>

          <button
            onClick={onAddClick}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:scale-105"
          >
            <Plus size={18} />
            Add Service
          </button>
        </div>
      </div>
    </div>
  );
}
