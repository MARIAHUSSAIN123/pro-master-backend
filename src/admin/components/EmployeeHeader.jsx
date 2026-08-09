import { motion } from "framer-motion";
import { Users, UserPlus } from "lucide-react";

export default function EmployeeHeader({ onAdd }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e293b] p-8 shadow-2xl"
    >
      <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl"></div>
      <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl"></div>

      <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 text-cyan-400">
            <Users size={18} />
            Employee Management
          </div>

          <h1 className="mt-5 text-4xl lg:text-5xl font-bold text-white">
            Employees
          </h1>

          <p className="mt-3 text-slate-400 max-w-xl">
            Manage employee profiles, departments, salaries, and status from
            one place.
          </p>
        </div>

        <button
          onClick={onAdd}
          className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-7 py-4 text-white font-semibold hover:scale-105 transition"
        >
          <UserPlus size={20} />
          Add Employee
        </button>
      </div>
    </motion.div>
  );
}