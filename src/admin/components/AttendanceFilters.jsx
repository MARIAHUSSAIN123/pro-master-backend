import { Search, Download, Calendar, Plus } from "lucide-react";

export default function AttendanceFilters({
  search,
  onSearchChange,
  department,
  onDepartmentChange,
  departments = [],
  status,
  onStatusChange,
  date,
  onDateChange,
  onExport,
  onMark,
}) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-[#111827] p-6 shadow-xl">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-1 flex-col gap-4 lg:flex-row">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search employee..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 py-3 pl-12 pr-4 text-white outline-none transition focus:border-cyan-500"
            />
          </div>

          <select
            value={department}
            onChange={(e) => onDepartmentChange(e.target.value)}
            className="rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-white outline-none focus:border-cyan-500"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-white outline-none focus:border-cyan-500"
          >
            <option value="">All Status</option>
            <option>Present</option>
            <option>Absent</option>
            <option>Late</option>
            <option>Leave</option>
            <option>Half Day</option>
          </select>

          <div className="relative">
            <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="date"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
              className="rounded-2xl border border-slate-700 bg-slate-900 py-3 pl-12 pr-4 text-white outline-none focus:border-cyan-500"
            />
          </div>
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
            onClick={onMark}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105"
          >
            <Plus size={18} />
            Mark Attendance
          </button>
        </div>
      </div>
    </div>
  );
}
