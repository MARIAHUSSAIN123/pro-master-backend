import { motion } from "framer-motion";
import {
  Search,
  Building2,
  Briefcase,
  Calendar,
  Download,
  UserPlus,
} from "lucide-react";

export default function EmployeeFilters() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border border-slate-800 bg-[#111827] p-6 shadow-2xl"
    >
      {/* Glow */}

      <div className="absolute -top-20 left-20 h-52 w-52 rounded-full bg-cyan-500/10 blur-3xl"></div>

      <div className="absolute -bottom-20 right-20 h-52 w-52 rounded-full bg-indigo-500/10 blur-3xl"></div>

      <div className="relative flex flex-wrap items-center gap-4">

        {/* Search */}

        <div className="relative flex-1 min-w-[280px]">

          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search employee..."
            className="h-14 w-full rounded-2xl border border-slate-700 bg-slate-900 pl-12 pr-4 text-white placeholder:text-slate-500 outline-none transition-all duration-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
          />

        </div>

        {/* Department */}

        <div className="relative min-w-[200px]">

          <Building2
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <select className="h-14 w-full appearance-none rounded-2xl border border-slate-700 bg-slate-900 pl-12 pr-4 text-white outline-none transition focus:border-cyan-500">

            <option>All Departments</option>

            <option>Cleaning</option>

            <option>Management</option>

            <option>Finance</option>

            <option>HR</option>

            <option>Operations</option>

          </select>

        </div>

        {/* Position */}

        <div className="relative min-w-[200px]">

          <Briefcase
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <select className="h-14 w-full appearance-none rounded-2xl border border-slate-700 bg-slate-900 pl-12 pr-4 text-white outline-none transition focus:border-cyan-500">

            <option>All Positions</option>

            <option>Manager</option>

            <option>Supervisor</option>

            <option>Cleaner</option>

            <option>Driver</option>

          </select>

        </div>

        {/* Joining Date */}

        <div className="relative min-w-[190px]">

          <Calendar
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="date"
            className="h-14 w-full rounded-2xl border border-slate-700 bg-slate-900 pl-12 pr-4 text-white outline-none transition focus:border-cyan-500"
          />

        </div>

        {/* Export */}

        <button
          className="
          flex h-14 min-w-[150px] items-center justify-center gap-2
          rounded-2xl
          border border-cyan-500/20
          bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600
          px-6
          font-semibold
          text-white
          shadow-lg shadow-cyan-500/20
          transition-all duration-300
          hover:scale-105
          hover:shadow-cyan-500/40
          "
        >
          <Download size={20} />
          Export
        </button>

        {/* Add Employee */}

        <button
          className="
          flex h-14 min-w-[190px] items-center justify-center gap-2
          rounded-2xl
          bg-gradient-to-r from-emerald-500 to-green-600
          px-6
          font-semibold
          text-white
          shadow-lg shadow-green-500/20
          transition-all duration-300
          hover:scale-105
          hover:shadow-green-500/40
          "
        >
          <UserPlus size={20} />
          Add Employee
        </button>

      </div>

    </motion.div>
  );
}