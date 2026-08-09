import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Trash2, X } from "lucide-react";

export default function DeleteServiceModal({
  open,
  onClose,
  onDelete,
  service,
  deleting,
  error,
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 30 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-800 bg-[#111827] shadow-2xl"
          >
            {/* Header */}

            <div className="flex items-center justify-between border-b border-slate-800 p-6">

              <div className="flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/20">

                  <AlertTriangle
                    className="text-red-500"
                    size={24}
                  />

                </div>

                <div>

                  <h2 className="text-xl font-bold text-white">
                    Delete Service
                  </h2>

                  <p className="text-sm text-slate-400">
                    This action cannot be undone.
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

            <div className="space-y-5 p-6">

              <p className="leading-7 text-slate-300">
                Are you sure you want to permanently delete
                <span className="font-semibold text-white">
                  {" "}
                  {service?.serviceName || "this service"}
                </span>
                ?
              </p>

              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4">

                <p className="text-sm text-red-300">
                  Services already used in existing bookings cannot be deleted.
                </p>

              </div>

              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

            </div>

            {/* Footer */}

            <div className="flex justify-end gap-3 border-t border-slate-800 p-6">

              <button
                onClick={onClose}
                className="rounded-xl bg-slate-700 px-6 py-3 font-medium text-white transition hover:bg-slate-600"
              >
                Cancel
              </button>

              <button
                onClick={onDelete}
                disabled={deleting}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-red-700 px-6 py-3 font-semibold text-white transition hover:scale-105 disabled:opacity-60"
              >
                <Trash2 size={18} />

                {deleting ? "Deleting..." : "Delete Service"}
              </button>

            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
