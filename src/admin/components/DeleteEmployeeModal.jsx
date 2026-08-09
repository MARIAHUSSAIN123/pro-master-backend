import { AnimatePresence, motion } from "framer-motion";
import {
  TriangleAlert,
  Trash2,
  X,
  Loader2,
} from "lucide-react";

export default function DeleteEmployeeModal({
  open,
  onClose,
  onDelete,
  employeeName,
  deleting,
  error,
}) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: .85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: .85, opacity: 0 }}
          transition={{ duration: .25 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-red-500/20 bg-[#0f172a] shadow-[0_0_60px_rgba(239,68,68,.15)]"
        >
          {/* Glow */}

          <div className="absolute -top-20 right-0 h-56 w-56 rounded-full bg-red-500/10 blur-3xl"></div>

          {/* Close */}

          <button
            onClick={onClose}
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 hover:bg-red-500 transition"
          >
            <X className="text-white" size={18}/>
          </button>

          <div className="p-10">
            {/* Icon */}

            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-500/15">
              <TriangleAlert size={45} className="text-red-400" />
            </div>

            {/* Title */}

            <h2 className="mt-8 text-center text-3xl font-bold text-white">
              Delete Employee?
            </h2>

            <p className="mt-5 text-center leading-7 text-slate-400">
              You are about to permanently remove
              <span className="font-semibold text-white">
                {" "} {employeeName || "this employee"}{" "}
              </span>
              from the employee database.
            </p>

            <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
              <p className="text-center text-sm text-red-300">
                Employees assigned to active bookings cannot be deleted —
                remove those assignments first.
              </p>
            </div>

            {error && (
              <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-center text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Buttons */}

            <div className="mt-10 flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 rounded-2xl border border-slate-700 py-4 font-semibold text-white transition hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                onClick={onDelete}
                disabled={deleting}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-500 to-red-700 py-4 font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Trash2 size={20} />
                )}
                {deleting ? "Deleting..." : "Delete Employee"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}