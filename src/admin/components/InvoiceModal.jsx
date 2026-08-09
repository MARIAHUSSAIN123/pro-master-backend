import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Briefcase, Percent, Tag, CalendarDays, CreditCard, FileText } from "lucide-react";

const emptyForm = {
  booking: "",
  customer: "",
  tax: 0,
  discount: 0,
  dueDate: "",
  paymentMethod: "Cash",
  notes: "",
};

export default function InvoiceModal({ open, onClose, onSave, saving, bookings = [] }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) setForm(emptyForm);
    setError("");
  }, [open]);

  if (!open) return null;

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    if (field === "booking") {
      const b = bookings.find((bk) => bk._id === value);
      setForm((prev) => ({ ...prev, booking: value, customer: b?.customer?._id || "" }));
      return;
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.booking || !form.customer || !form.dueDate) {
      setError("Please select a booking and a due date.");
      return;
    }
    try {
      setError("");
      await onSave({
        ...form,
        tax: Number(form.tax) || 0,
        discount: Number(form.discount) || 0,
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong. Please try again.");
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
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-2xl rounded-3xl border border-slate-700 bg-[#0f172a] shadow-[0_0_60px_rgba(6,182,212,.15)] overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          <div className="absolute -top-20 left-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl"></div>

          <div className="relative flex items-center justify-between border-b border-slate-800 p-8">
            <div>
              <h2 className="text-3xl font-bold text-white">New Invoice</h2>
              <p className="mt-2 text-slate-400">Raise an invoice for a booking.</p>
            </div>
            <button
              onClick={onClose}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 hover:bg-red-500 transition"
            >
              <X className="text-white" />
            </button>
          </div>

          <div className="relative grid gap-6 p-8 md:grid-cols-2">
            <div className="relative md:col-span-2">
              <Briefcase size={18} className="absolute left-4 top-4 text-slate-400" />
              <select
                value={form.booking}
                onChange={handleChange("booking")}
                className="h-14 w-full appearance-none rounded-2xl border border-slate-700 bg-slate-900 pl-12 pr-4 text-white outline-none focus:border-cyan-500"
              >
                <option value="">Select Booking *</option>
                {bookings.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.bookingNumber} — {b.customer?.fullName} — {b.service?.serviceName} (${b.totalAmount})
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Percent size={18} className="absolute left-4 top-4 text-slate-400" />
              <input
                type="number"
                min="0"
                placeholder="Tax"
                value={form.tax}
                onChange={handleChange("tax")}
                className="h-14 w-full rounded-2xl border border-slate-700 bg-slate-900 pl-12 pr-4 text-white outline-none focus:border-cyan-500"
              />
            </div>

            <div className="relative">
              <Tag size={18} className="absolute left-4 top-4 text-slate-400" />
              <input
                type="number"
                min="0"
                placeholder="Discount"
                value={form.discount}
                onChange={handleChange("discount")}
                className="h-14 w-full rounded-2xl border border-slate-700 bg-slate-900 pl-12 pr-4 text-white outline-none focus:border-cyan-500"
              />
            </div>

            <div className="relative">
              <CalendarDays size={18} className="absolute left-4 top-4 text-slate-400" />
              <input
                type="date"
                value={form.dueDate}
                onChange={handleChange("dueDate")}
                className="h-14 w-full rounded-2xl border border-slate-700 bg-slate-900 pl-12 pr-4 text-white outline-none focus:border-cyan-500"
              />
            </div>

            <div className="relative">
              <CreditCard size={18} className="absolute left-4 top-4 text-slate-400" />
              <select
                value={form.paymentMethod}
                onChange={handleChange("paymentMethod")}
                className="h-14 w-full appearance-none rounded-2xl border border-slate-700 bg-slate-900 pl-12 pr-4 text-white outline-none focus:border-cyan-500"
              >
                {["Cash", "Credit Card", "Debit Card", "E-Transfer"].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 relative">
              <FileText size={18} className="absolute left-4 top-5 text-slate-400" />
              <textarea
                rows="3"
                placeholder="Notes (optional)"
                value={form.notes}
                onChange={handleChange("notes")}
                className="w-full rounded-2xl border border-slate-700 bg-slate-900 pl-12 pr-4 pt-4 text-white outline-none focus:border-cyan-500"
              />
            </div>

            {error && (
              <div className="md:col-span-2 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4 border-t border-slate-800 p-6">
            <button
              onClick={onClose}
              className="rounded-2xl border border-slate-700 px-8 py-3 text-white transition hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 px-10 py-3 font-semibold text-white transition hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
            >
              {saving ? "Creating..." : "Create Invoice"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
