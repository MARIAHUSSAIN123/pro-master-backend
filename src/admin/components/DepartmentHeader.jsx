import { motion } from "framer-motion";
import {
  Building2,
  Plus,
  Users,
} from "lucide-react";

export default function DepartmentHeader({ total = 0, onAdd }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e293b] p-8 shadow-2xl"
    >
      {/* Background Glow */}

      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl"></div>

      <div className="absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl"></div>

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        {/* Left */}

        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-5 py-2 text-cyan-400">
            <Building2 size={18} />
            Department Management
          </div>

          <h1 className="mt-5 text-4xl font-bold text-white lg:text-5xl">
            Manage Departments
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-slate-400">
            Create departments, assign managers, organize employees and
            monitor department performance from one place.
          </p>

          <div className="mt-6 flex items-center gap-3 text-slate-300">
            <Users size={18} className="text-cyan-400" />
            {total} {total === 1 ? "Department" : "Departments"}
          </div>
        </div>

        {/* Right */}

        <div className="flex gap-4">
          <button
            onClick={onAdd}
            className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 px-8 py-4 font-semibold text-white shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Plus size={20} />
            Add Department
          </button>
        </div>
      </div>
    </motion.div>
  );
}