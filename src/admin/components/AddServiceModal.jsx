import { motion, AnimatePresence } from "framer-motion";
import { X, Image as ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { getDepartments } from "../api/departmentApi";
import { createService } from "../api/serviceApi";

const CATEGORY_OPTIONS = [
  "Residential",
  "Commercial",
  "Deep Cleaning",
  "Carpet Cleaning",
  "Window Cleaning",
  "Move In / Move Out",
  "Post Construction",
];

const emptyForm = {
  serviceName: "",
  description: "",
  category: "Residential",
  department: "",
  price: "",
  duration: "",
  employeesRequired: 1,
  image: "",
  featured: false,
  status: "Active",
};

export default function AddServiceModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState(emptyForm);
  const [departments, setDepartments] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setForm(emptyForm);
    setError("");
    getDepartments()
      .then((data) => setDepartments(data?.departments || []))
      .catch((err) => console.error("Departments load error:", err));
  }, [open]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.serviceName || !form.category || !form.department || !form.description || !form.duration || !form.price) {
      setError("Please fill all required fields.");
      return;
    }

    setSaving(true);
    try {
      await createService({
        ...form,
        price: Number(form.price),
        employeesRequired: Number(form.employeesRequired) || 1,
      });
      onCreated?.();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not create service.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-800 bg-[#111827] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 p-6">
              <h2 className="text-2xl font-bold text-white">Add New Service</h2>
              <button onClick={onClose} className="rounded-xl p-2 hover:bg-slate-800">
                <X className="text-white" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              {error && (
                <div className="rounded-xl bg-red-500/20 p-3 text-red-400">{error}</div>
              )}

              <div>
                <label className="mb-2 block text-slate-300">Image URL (optional)</label>
                <div className="relative">
                  <ImageIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="image"
                    value={form.image}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 pl-11 text-white outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-slate-300">Service Name *</label>
                <input
                  type="text"
                  name="serviceName"
                  value={form.serviceName}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-slate-300">Description *</label>
                <textarea
                  rows="4"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-slate-300">Category *</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white"
                  >
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-slate-300">Department *</label>
                  <select
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white"
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.departmentName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-slate-300">Price ($) *</label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-slate-300">Duration *</label>
                  <input
                    type="text"
                    placeholder="2 Hours"
                    name="duration"
                    value={form.duration}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-slate-300">Employees Required</label>
                  <input
                    type="number"
                    min="1"
                    name="employeesRequired"
                    value={form.employeesRequired}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-slate-300">Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white"
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="featured"
                  checked={form.featured}
                  onChange={handleChange}
                  className="h-5 w-5"
                />
                <span className="text-slate-300">Featured Service</span>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl bg-slate-700 px-6 py-3 text-white hover:bg-slate-600"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 font-semibold text-white hover:scale-105 transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Service"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
