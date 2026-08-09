import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, CalendarDays, Percent, Tag, FileText, Plus, Trash2 } from "lucide-react";

const emptyLine = () => ({ service: "", quantity: 1 });

const emptyForm = () => ({
  customer: "",
  items: [emptyLine()],
  tax: 0,
  discount: 0,
  validUntil: "",
  intendedUse: "OneTime",
  recurringFrequency: "Monthly",
  notes: "",
});

export default function QuoteModal({ open, onClose, onSave, saving, customers = [], services = [] }) {
  const [form, setForm] = useState(emptyForm());
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) setForm(emptyForm());
    setError("");
  }, [open]);

  if (!open) return null;

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleLineChange = (index, field) => (e) => {
    const value = e.target.value;
    setForm((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
  };

  const addLine = () => setForm((prev) => ({ ...prev, items: [...prev.items, emptyLine()] }));
  const removeLine = (index) =>
    setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));

  const estimatedSubtotal = form.items.reduce((sum, line) => {
    const svc = services.find((s) => s._id === line.service);
    return sum + (svc ? svc.price * (Number(line.quantity) || 1) : 0);
  }, 0);
  const estimatedTotal = Math.max(
    0,
    estimatedSubtotal + (Number(form.tax) || 0) - (Number(form.discount) || 0)
  );

  const handleSubmit = async () => {
    if (!form.customer || !form.validUntil) {
      setError("Please select a customer and a valid-until date.");
      return;
    }
    if (form.items.some((l) => !l.service)) {
      setError("Please select a service for every line item.");
      return;
    }
    if (form.intendedUse === "RecurringContract" && !form.recurringFrequency) {
      setError("Please select a recurring frequency.");
      return;
    }

    try {
      setError("");
      await onSave({
        ...form,
        tax: Number(form.tax) || 0,
        discount: Number(form.discount) || 0,
        items: form.items.map((l) => ({ service: l.service, quantity: Number(l.quantity) || 1 })),
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
          className="relative w-full max-w-3xl rounded-3xl border border-slate-700 bg-[#0f172a] shadow-[0_0_60px_rgba(6,182,212,.15)] overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          <div className="absolute -top-20 left-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl"></div>

          <div className="relative flex items-center justify-between border-b border-slate-800 p-8">
            <div>
              <h2 className="text-3xl font-bold text-white">New Quote</h2>
              <p className="mt-2 text-slate-400">Build a quote from the service catalog.</p>
            </div>
            <button
              onClick={onClose}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 hover:bg-red-500 transition"
            >
              <X className="text-white" />
            </button>
          </div>

          <div className="relative grid gap-6 p-8">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="relative">
                <User size={18} className="absolute left-4 top-4 text-slate-400" />
                <select
                  value={form.customer}
                  onChange={handleChange("customer")}
                  className="h-14 w-full appearance-none rounded-2xl border border-slate-700 bg-slate-900 pl-12 pr-4 text-white outline-none focus:border-cyan-500"
                >
                  <option value="">Select Customer *</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <CalendarDays size={18} className="absolute left-4 top-4 text-slate-400" />
                <input
                  type="date"
                  value={form.validUntil}
                  onChange={handleChange("validUntil")}
                  className="h-14 w-full rounded-2xl border border-slate-700 bg-slate-900 pl-12 pr-4 text-white outline-none focus:border-cyan-500"
                  title="Valid Until"
                />
              </div>
            </div>

            {/* Line items */}
            <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-white">Service Line Items</h3>
                <button
                  onClick={addLine}
                  className="flex items-center gap-1 rounded-xl border border-cyan-500/30 px-3 py-1.5 text-sm text-cyan-400 transition hover:bg-cyan-500/10"
                >
                  <Plus size={16} /> Add Line
                </button>
              </div>

              <div className="space-y-3">
                {form.items.map((line, index) => {
                  const svc = services.find((s) => s._id === line.service);
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <select
                        value={line.service}
                        onChange={handleLineChange(index, "service")}
                        className="h-12 flex-1 appearance-none rounded-xl border border-slate-700 bg-slate-900 px-4 text-white outline-none focus:border-cyan-500"
                      >
                        <option value="">Select Service *</option>
                        {services.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.serviceName} — ${s.price}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        value={line.quantity}
                        onChange={handleLineChange(index, "quantity")}
                        className="h-12 w-24 rounded-xl border border-slate-700 bg-slate-900 px-3 text-white outline-none focus:border-cyan-500"
                        title="Quantity"
                      />
                      <span className="w-24 text-right text-cyan-400 font-semibold">
                        {svc ? `$${(svc.price * (Number(line.quantity) || 1)).toFixed(2)}` : "--"}
                      </span>
                      {form.items.length > 1 && (
                        <button
                          onClick={() => removeLine(index)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20 text-red-400 transition hover:bg-red-500 hover:text-white"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
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
              <select
                value={form.intendedUse}
                onChange={handleChange("intendedUse")}
                className="h-14 w-full appearance-none rounded-2xl border border-slate-700 bg-slate-900 px-4 text-white outline-none focus:border-cyan-500"
              >
                <option value="OneTime">One-Time Purchase</option>
                <option value="RecurringContract">Recurring Contract</option>
              </select>
            </div>

            {form.intendedUse === "RecurringContract" && (
              <select
                value={form.recurringFrequency}
                onChange={handleChange("recurringFrequency")}
                className="h-14 w-full appearance-none rounded-2xl border border-slate-700 bg-slate-900 px-4 text-white outline-none focus:border-cyan-500"
              >
                {["Daily", "Weekly", "Bi-Weekly", "Monthly", "Quarterly", "One-Time"].map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            )}

            <div className="relative">
              <FileText size={18} className="absolute left-4 top-5 text-slate-400" />
              <textarea
                rows="3"
                placeholder="Notes (optional)"
                value={form.notes}
                onChange={handleChange("notes")}
                className="w-full rounded-2xl border border-slate-700 bg-slate-900 pl-12 pr-4 pt-4 text-white outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-cyan-500/20 bg-cyan-500/5 px-6 py-4">
              <span className="text-slate-300">Estimated Total</span>
              <span className="text-2xl font-bold text-cyan-400">${estimatedTotal.toFixed(2)}</span>
            </div>

            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-red-400 text-sm">
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
              {saving ? "Creating..." : "Create Quote"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
