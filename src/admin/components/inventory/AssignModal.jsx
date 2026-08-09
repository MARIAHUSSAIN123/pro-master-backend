import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserCheck, UserX } from "lucide-react";

export default function AssignModal({ open, onClose, onAssign, onUnassign, item, employees = [], saving }) {
  const [employeeId, setEmployeeId] = useState("");
  const [error, setError] = useState("");

  if (!open || !item) return null;

  const handleAssign = async () => {
    if (!employeeId) {
      setError("Please select an employee.");
      return;
    }
    try {
      setError("");
      await onAssign(item._id, employeeId);
      setEmployeeId("");
    } catch (err) {
      setError(err?.response?.data?.message || "Assignment failed.");
    }
  };

  const handleUnassign = async () => {
    try {
      setError("");
      await onUnassign(item._id);
    } catch (err) {
      setError(err?.response?.data?.message || "Unassign failed.");
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
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                <UserCheck size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Assign Item</h2>
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
            {item.assignedTo?.fullName && (
              <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 px-4 py-3 text-sm text-cyan-300">
                Currently assigned to <b>{item.assignedTo.fullName}</b>
              </div>
            )}

            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="h-14 w-full appearance-none rounded-2xl border border-slate-700 bg-slate-900 px-4 text-white outline-none focus:border-cyan-500"
            >
              <option value="">Select Employee *</option>
              {employees.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.fullName}
                </option>
              ))}
            </select>

            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>

          <div className="flex justify-between gap-4 border-t border-slate-800 p-6">
            {item.assignedTo && (
              <button
                onClick={handleUnassign}
                disabled={saving}
                className="flex items-center gap-2 rounded-2xl border border-red-500/30 px-6 py-3 text-red-400 transition hover:bg-red-500/10 disabled:opacity-60"
              >
                <UserX size={18} /> Unassign
              </button>
            )}
            <button
              onClick={handleAssign}
              disabled={saving}
              className="ml-auto rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 px-8 py-3 font-semibold text-white transition hover:scale-105 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Assign"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
