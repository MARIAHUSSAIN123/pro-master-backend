import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, PackagePlus, PackageMinus } from "lucide-react";

export default function StockModal({ open, onClose, onSubmit, item, mode, saving }) {
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  if (!open || !item) return null;

  const isIn = mode === "in";

  const handleSubmit = async () => {
    if (!quantity || Number(quantity) <= 0) {
      setError("Please enter a valid quantity.");
      return;
    }
    try {
      setError("");
      await onSubmit(item._id, { quantity: Number(quantity), reason, notes });
      setQuantity("");
      setReason("");
      setNotes("");
    } catch (err) {
      setError(err?.response?.data?.message || "Action failed.");
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
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${isIn ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                {isIn ? <PackagePlus size={20} /> : <PackageMinus size={20} />}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{isIn ? "Stock In" : "Stock Out"}</h2>
                <p className="text-sm text-slate-400">{item.itemName} — current: {item.quantity} {item.unit}</p>
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
            <input
              type="number"
              min="1"
              placeholder={`Quantity to ${isIn ? "add" : "remove"} *`}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="h-14 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 text-white outline-none focus:border-cyan-500"
            />
            <input
              placeholder={isIn ? "Reason (e.g. Restock)" : "Reason (e.g. Used On Job)"}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="h-14 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 text-white outline-none focus:border-cyan-500"
            />
            <textarea
              rows="2"
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 p-4 text-white outline-none focus:border-cyan-500"
            />
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
              className={`rounded-2xl px-8 py-3 font-semibold text-white transition hover:scale-105 disabled:opacity-60 ${isIn ? "bg-gradient-to-r from-green-500 to-emerald-600" : "bg-gradient-to-r from-red-500 to-rose-600"}`}
            >
              {saving ? "Saving..." : isIn ? "Add Stock" : "Remove Stock"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
