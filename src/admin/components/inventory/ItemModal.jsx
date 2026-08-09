import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Tag, Hash, MapPin, DollarSign, Layers, FileText } from "lucide-react";

const emptyForm = {
  itemName: "",
  itemType: "Cleaning Supply",
  sku: "",
  description: "",
  unit: "pcs",
  quantity: 0,
  reorderThreshold: 0,
  location: "Main Warehouse",
  unitCost: 0,
  department: "",
};

export default function ItemModal({ open, onClose, onSave, item, saving, departments = [] }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (item) {
      setForm({
        itemName: item.itemName || "",
        itemType: item.itemType || "Cleaning Supply",
        sku: item.sku || "",
        description: item.description || "",
        unit: item.unit || "pcs",
        quantity: item.quantity ?? 0,
        reorderThreshold: item.reorderThreshold ?? 0,
        location: item.location || "Main Warehouse",
        unitCost: item.unitCost ?? 0,
        department: item.department?._id || item.department || "",
      });
    } else {
      setForm(emptyForm);
    }
    setError("");
  }, [item, open]);

  if (!open) return null;

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.itemName || !form.itemType) {
      setError("Item name and type are required.");
      return;
    }
    try {
      setError("");
      await onSave({
        ...form,
        quantity: Number(form.quantity) || 0,
        reorderThreshold: Number(form.reorderThreshold) || 0,
        unitCost: Number(form.unitCost) || 0,
        department: form.department || undefined,
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
          className="relative w-full max-w-3xl rounded-3xl border border-slate-700 bg-[#0f172a] shadow-[0_0_60px_rgba(6,182,212,.15)] overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          <div className="absolute -top-20 left-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl"></div>

          <div className="relative flex items-center justify-between border-b border-slate-800 p-8">
            <div>
              <h2 className="text-3xl font-bold text-white">
                {item ? "Edit Item" : "Add Inventory Item"}
              </h2>
              <p className="mt-2 text-slate-400">
                {item ? "Update item details." : "Add a new supply, machine, vehicle or PPE item."}
              </p>
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
              <Tag size={18} className="absolute left-4 top-4 text-slate-400" />
              <input
                placeholder="Item Name *"
                value={form.itemName}
                onChange={handleChange("itemName")}
                className="h-14 w-full rounded-2xl border border-slate-700 bg-slate-900 pl-12 pr-4 text-white outline-none focus:border-cyan-500"
              />
            </div>

            <select
              value={form.itemType}
              onChange={handleChange("itemType")}
              className="h-14 w-full appearance-none rounded-2xl border border-slate-700 bg-slate-900 px-4 text-white outline-none focus:border-cyan-500"
            >
              {["Cleaning Supply", "Machinery", "Vehicle", "PPE", "Tool", "Other"].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <div className="relative">
              <Hash size={18} className="absolute left-4 top-4 text-slate-400" />
              <input
                placeholder="SKU (optional)"
                value={form.sku}
                onChange={handleChange("sku")}
                className="h-14 w-full rounded-2xl border border-slate-700 bg-slate-900 pl-12 pr-4 text-white outline-none focus:border-cyan-500"
              />
            </div>

            <input
              type="number"
              min="0"
              placeholder="Quantity"
              value={form.quantity}
              onChange={handleChange("quantity")}
              className="h-14 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 text-white outline-none focus:border-cyan-500"
            />

            <div className="relative">
              <Layers size={18} className="absolute left-4 top-4 text-slate-400" />
              <input
                placeholder="Unit (pcs, box, ltr...)"
                value={form.unit}
                onChange={handleChange("unit")}
                className="h-14 w-full rounded-2xl border border-slate-700 bg-slate-900 pl-12 pr-4 text-white outline-none focus:border-cyan-500"
              />
            </div>

            <input
              type="number"
              min="0"
              placeholder="Reorder Threshold"
              value={form.reorderThreshold}
              onChange={handleChange("reorderThreshold")}
              className="h-14 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 text-white outline-none focus:border-cyan-500"
            />

            <div className="relative">
              <MapPin size={18} className="absolute left-4 top-4 text-slate-400" />
              <input
                placeholder="Location / Warehouse"
                value={form.location}
                onChange={handleChange("location")}
                className="h-14 w-full rounded-2xl border border-slate-700 bg-slate-900 pl-12 pr-4 text-white outline-none focus:border-cyan-500"
              />
            </div>

            <div className="relative">
              <DollarSign size={18} className="absolute left-4 top-4 text-slate-400" />
              <input
                type="number"
                min="0"
                placeholder="Unit Cost"
                value={form.unitCost}
                onChange={handleChange("unitCost")}
                className="h-14 w-full rounded-2xl border border-slate-700 bg-slate-900 pl-12 pr-4 text-white outline-none focus:border-cyan-500"
              />
            </div>

            <select
              value={form.department}
              onChange={handleChange("department")}
              className="h-14 w-full appearance-none rounded-2xl border border-slate-700 bg-slate-900 px-4 text-white outline-none focus:border-cyan-500"
            >
              <option value="">No Department</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.departmentName}
                </option>
              ))}
            </select>

            <div className="md:col-span-2 relative">
              <FileText size={18} className="absolute left-4 top-5 text-slate-400" />
              <textarea
                rows="3"
                placeholder="Description / Notes"
                value={form.description}
                onChange={handleChange("description")}
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
              className="rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 px-10 py-3 font-semibold text-white transition hover:scale-105 disabled:opacity-60"
            >
              {saving ? "Saving..." : item ? "Save Changes" : "Add Item"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
