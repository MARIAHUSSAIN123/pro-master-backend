import { motion } from "framer-motion";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const weekDays = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

const days = Array.from({ length: 31 }, (_, i) => i + 1);

export default function AttendanceCalendar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-3xl border border-slate-800 bg-[#111827] p-6 shadow-xl"
    >
      {/* Header */}

      <div className="mb-8 flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10">

            <CalendarDays
              className="text-cyan-400"
              size={24}
            />

          </div>

          <div>

            <h2 className="text-2xl font-bold text-white">
              Attendance Calendar
            </h2>

            <p className="text-slate-400">
              July 2026
            </p>

          </div>

        </div>

        <div className="flex gap-3">

          <button className="rounded-xl border border-slate-700 bg-slate-900 p-3 hover:border-cyan-500">

            <ChevronLeft className="text-white" />

          </button>

          <button className="rounded-xl border border-slate-700 bg-slate-900 p-3 hover:border-cyan-500">

            <ChevronRight className="text-white" />

          </button>

        </div>

      </div>

      {/* Week Days */}

      <div className="mb-4 grid grid-cols-7 gap-3">

        {weekDays.map((day) => (
          <div
            key={day}
            className="rounded-xl bg-slate-900 py-3 text-center font-semibold text-cyan-400"
          >
            {day}
          </div>
        ))}

      </div>

      {/* Calendar */}

      <div className="grid grid-cols-7 gap-3">

        {days.map((day) => {

          const present =
            day % 5 !== 0 &&
            day % 8 !== 0;

          return (
            <div
              key={day}
              className={`cursor-pointer rounded-2xl border p-4 transition hover:scale-105 ${
                present
                  ? "border-green-500/20 bg-green-500/10"
                  : "border-red-500/20 bg-red-500/10"
              }`}
            >

              <div className="mb-3 text-lg font-bold text-white">

                {day}

              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  present
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                }`}
              >

                {present ? "Present" : "Absent"}

              </span>

            </div>
          );

        })}

      </div>

      {/* Summary */}

      <div className="mt-8 grid gap-4 md:grid-cols-3">

        <div className="rounded-2xl bg-green-500/10 p-5">

          <h3 className="text-3xl font-bold text-green-400">
            23
          </h3>

          <p className="text-slate-300">
            Present Days
          </p>

        </div>

        <div className="rounded-2xl bg-red-500/10 p-5">

          <h3 className="text-3xl font-bold text-red-400">
            6
          </h3>

          <p className="text-slate-300">
            Absent Days
          </p>

        </div>

        <div className="rounded-2xl bg-cyan-500/10 p-5">

          <h3 className="text-3xl font-bold text-cyan-400">
            2
          </h3>

          <p className="text-slate-300">
            Leave Days
          </p>

        </div>

      </div>

    </motion.div>
  );
}