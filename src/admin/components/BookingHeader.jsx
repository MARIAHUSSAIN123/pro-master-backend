import { motion } from "framer-motion";
import { CalendarDays, Plus } from "lucide-react";

export default function BookingHeader({ onAddClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8 shadow-[0_20px_60px_rgba(6,182,212,0.15)]"
    >
      <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl"></div>

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-cyan-400">
            <CalendarDays size={18} />
            Booking Management
          </div>

          <h1 className="bg-gradient-to-r from-white via-cyan-300 to-blue-400 bg-clip-text text-5xl font-extrabold text-transparent">
            Bookings
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-slate-400">
            Manage customer bookings, assign employees, track cleaning
            schedules and monitor booking status from one place.
          </p>
        </div>

        <button
          onClick={onAddClick}
          className="group flex items-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 px-7 py-4 font-semibold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-cyan-500/30"
        >
          <Plus size={22} />
          Add Booking
        </button>
      </div>
    </motion.div>
  );
}