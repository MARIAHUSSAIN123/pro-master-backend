import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Clock,
  MapPin,
  CalendarCheck,
} from "lucide-react";

export default function CheckInModal({
  open = true,
  onClose = () => {},
}) {
  if (!open) return null;

  return (
    <AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      >

        <motion.div
          initial={{ scale: .9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: .9, opacity: 0 }}
          className="w-full max-w-2xl rounded-3xl border border-slate-700 bg-[#111827] shadow-2xl"
        >

          {/* Header */}

          <div className="flex items-center justify-between border-b border-slate-700 p-6">

            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10">

                <CalendarCheck
                  className="text-cyan-400"
                  size={24}
                />

              </div>

              <div>

                <h2 className="text-2xl font-bold text-white">
                  Employee Check In
                </h2>

                <p className="text-sm text-slate-400">
                  Record employee attendance
                </p>

              </div>

            </div>

            <button
              onClick={onClose}
              className="rounded-xl p-2 hover:bg-slate-800"
            >
              <X className="text-white" />
            </button>

          </div>

          {/* Body */}

          <div className="space-y-6 p-6">

            {/* Employee */}

            <div>

              <label className="mb-2 block text-sm text-slate-400">
                Employee
              </label>

              <div className="relative">

                <User
                  size={18}
                  className="absolute left-4 top-4 text-cyan-400"
                />

                <select className="w-full rounded-2xl border border-slate-700 bg-slate-900 py-3 pl-12 pr-4 text-white outline-none">

                  <option>John Smith</option>
                  <option>Emma Wilson</option>
                  <option>David Brown</option>
                  <option>Olivia Johnson</option>

                </select>

              </div>

            </div>

            {/* Time */}

            <div className="grid gap-6 md:grid-cols-2">

              <div>

                <label className="mb-2 block text-sm text-slate-400">
                  Check In Time
                </label>

                <div className="relative">

                  <Clock
                    size={18}
                    className="absolute left-4 top-4 text-cyan-400"
                  />

                  <input
                    type="time"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900 py-3 pl-12 text-white outline-none"
                  />

                </div>

              </div>

              <div>

                <label className="mb-2 block text-sm text-slate-400">
                  Location
                </label>

                <div className="relative">

                  <MapPin
                    size={18}
                    className="absolute left-4 top-4 text-cyan-400"
                  />

                  <input
                    placeholder="Toronto Office"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900 py-3 pl-12 text-white outline-none"
                  />

                </div>

              </div>

            </div>

            {/* Notes */}

            <div>

              <label className="mb-2 block text-sm text-slate-400">
                Notes
              </label>

              <textarea
                rows={4}
                placeholder="Optional notes..."
                className="w-full rounded-2xl border border-slate-700 bg-slate-900 p-4 text-white outline-none"
              />

            </div>

          </div>

          {/* Footer */}

          <div className="flex justify-end gap-4 border-t border-slate-700 p-6">

            <button
              onClick={onClose}
              className="rounded-2xl border border-slate-700 px-6 py-3 text-white hover:border-red-500"
            >
              Cancel
            </button>

            <button className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-3 font-semibold text-white transition hover:scale-105">

              Check In Employee

            </button>

          </div>

        </motion.div>

      </motion.div>

    </AnimatePresence>
  );
}