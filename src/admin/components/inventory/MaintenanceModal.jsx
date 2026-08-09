import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wrench, CalendarDays } from "lucide-react";

export default function MaintenanceModal({ open, onClose, onSubmit, item, saving }) {
  const [nextMaintenanceDate, setNextMaintenanceDate] = useState("");
  const [notes, setNotes] = useState("");
  const [markAsInMaintenance, setMarkAsInMaintenance] = useState(false);
  const [error, setError] = useState("");

  if (!open || !item) return null;

  const handleSubmit = async () => {
    try {
      setError("");
      await onSubmit(item._id, { nextMaintenanceDate: nextMaintenanceDate || undefined, notes, markAsInMaintenance });
      setNextMaintenanceDate("");
      setNotes("");
      setMarkAsInMaintenance(false);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to log maintenance.");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-md rounded-3xl border border-slate-700 bg-[#0f172a] shadow-[0_0_60px_rgba(6,182,212,.15)] overflow-hidden"
        >
          <div className="relative flex items-center justify-between border-b border-slate-800 p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-400">
                <Wrench size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Log Maintenance</h2>
                <p className="text-sm text-slate-400">{item.itemName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 hover:bg-red-500 transition"
            >
              <X className="text-white" size={18} />
            </button>
          </div>

          <div className="space-y-4 p-7">
            <div className="relative">
              <CalendarDays size={18} className="absolute left-4 top-4 text-slate-400" />
              <input
                type="date"
                value={nextMaintenanceDate}
                onChange={(e) => setNextMaintenanceDate(e.target.value)}
                placeholder="Next Maintenance Date"
                className="h-14 w-full rounded-2xl border border-slate-700 bg-slate-900 pl-12 pr-4 text-white outline-none focus:border-cyan-500"
              />
            </div>

            <textarea
              rows="3"
              placeholder="Maintenance notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 p-4 text-white outline-none focus:border-cyan-500"
            />

            <label className="flex items-center gap-3 text-slate-300">
              <input
                type="checkbox"
                checked={markAsInMaintenance}
                onChange={(e) => setMarkAsInMaintenance(e.target.checked)}
                className="h-5 w-5 accent-cyan-500"
              />
              Pull this item out of service now (mark "In Maintenance")
            </label>

            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4 border-t border-slate-800 p-6">
            <button
              onClick={onClose}
              className="rounded-2xl border border-slate-700 px-6 py-3 text-white transition hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-600 px-8 py-3 font-semibold text-white transition hover:scale-105 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
