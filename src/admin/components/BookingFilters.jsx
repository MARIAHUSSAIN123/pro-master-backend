import { motion } from "framer-motion";
import { Search, Calendar, Briefcase, RotateCcw, Download } from "lucide-react";

const STATUS_OPTIONS = [
  "All Status",
  "Pending",
  "Confirmed",
  "Assigned",
  "In Progress",
  "Completed",
  "Approved",
  "In Dispute",
  "Cancelled",
];

export default function BookingFilters({
  search = "",
  onSearchChange,
  status = "All Status",
  onStatusChange,
  date = "",
  onDateChange,
  onReset,
  onExport,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-3xl border border-slate-800 bg-[#0f172a] p-6 shadow-2xl"
    >
      <div className="absolute -top-24 -left-24 h-52 w-52 rounded-full bg-cyan-500/10 blur-3xl"></div>
      <div className="absolute -bottom-24 -right-24 h-52 w-52 rounded-full bg-indigo-500/10 blur-3xl"></div>

      <div className="relative grid gap-5 lg:grid-cols-5">
        <div className="lg:col-span-2 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search by customer, service, booking #..."
            className="w-full rounded-2xl border border-slate-700 bg-slate-900 py-3 pl-11 pr-4 text-white outline-none transition focus:border-cyan-500"
          />
        </div>

        <div className="relative">
          <Briefcase size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={status}
            onChange={(e) => onStatusChange?.(e.target.value)}
            className="w-full appearance-none rounded-2xl border border-slate-700 bg-slate-900 py-3 pl-11 pr-4 text-white outline-none focus:border-cyan-500"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange?.(e.target.value)}
            className="w-full rounded-2xl border border-slate-700 bg-slate-900 py-3 pl-11 pr-4 text-white outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onReset}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400"
          >
            <RotateCcw size={18} />
            Reset
          </button>
          <button
            onClick={onExport}
            className="px-6 min-w-[130px] h-14 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold flex items-center justify-center gap-2 hover:scale-105 transition"
          >
            <Download size={20} />
            Export
          </button>
        </div>
      </div>
    </motion.div>
  );
}
