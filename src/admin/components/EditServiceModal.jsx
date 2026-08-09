import { motion, AnimatePresence } from "framer-motion";
import { X, Image as ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { getDepartments } from "../api/departmentApi";
import { updateService } from "../api/serviceApi";

const CATEGORY_OPTIONS = [
  "Residential",
  "Commercial",
  "Deep Cleaning",
  "Carpet Cleaning",
  "Window Cleaning",
  "Move In / Move Out",
  "Post Construction",
];

export default function EditServiceModal({ open, onClose, service, onUpdated }) {
  const [form, setForm] = useState({
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
  });
  const [departments, setDepartments] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    getDepartments()
      .then((data) => setDepartments(data?.departments || []))
      .catch((err) => console.error("Departments load error:", err));
  }, [open]);

  useEffect(() => {
    if (service) {
      setForm({
        serviceName: service.serviceName || "",
        description: service.description || "",
        category: service.category || "Residential",
        department: service.department?._id || service.department || "",
        price: service.price ?? "",
        duration: service.duration || "",
        employeesRequired: service.employeesRequired ?? 1,
        image: service.image || "",
        featured: service.featured || false,
        status: service.status || "Active",
      });
    }
    setError("");
  }, [service, open]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
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
      await updateService(service._id, {
        ...form,
        price: Number(form.price),
        employeesRequired: Number(form.employeesRequired) || 1,
      });
      onUpdated?.();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not update service.");
    } finally {
      setSaving(false);
    }
  };

  if (!service) return null;

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
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#111827] border border-slate-800"
          >
            <div className="flex items-center justify-between border-b border-slate-800 p-6">
              <h2 className="text-2xl font-bold text-white">Edit Service</h2>
              <button onClick={onClose}>
                <X className="text-white" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              {error && (
                <div className="rounded-xl bg-red-500/20 p-3 text-red-400">{error}</div>
              )}

              <div className="relative">
                <ImageIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="Image URL"
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 p-3 pl-11 text-white"
                />
              </div>

              <input
                name="serviceName"
                value={form.serviceName}
                onChange={handleChange}
                placeholder="Service Name"
                className="w-full rounded-xl bg-slate-900 border border-slate-700 p-3 text-white"
              />

              <textarea
                rows="4"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Description"
                className="w-full rounded-xl bg-slate-900 border border-slate-700 p-3 text-white"
              />

              <div className="grid gap-5 md:grid-cols-2">
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="rounded-xl bg-slate-900 border border-slate-700 p-3 text-white"
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>

                <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  className="rounded-xl bg-slate-900 border border-slate-700 p-3 text-white"
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.departmentName}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="Price"
                  className="rounded-xl bg-slate-900 border border-slate-700 p-3 text-white"
                />

                <input
                  name="duration"
                  value={form.duration}
                  onChange={handleChange}
                  placeholder="Duration"
                  className="rounded-xl bg-slate-900 border border-slate-700 p-3 text-white"
                />

                <input
                  type="number"
                  min="1"
                  name="employeesRequired"
                  value={form.employeesRequired}
                  onChange={handleChange}
                  placeholder="Employees Required"
                  className="rounded-xl bg-slate-900 border border-slate-700 p-3 text-white"
                />

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="rounded-xl bg-slate-900 border border-slate-700 p-3 text-white"
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="featured"
                  checked={form.featured}
                  onChange={handleChange}
                />
                <span className="text-slate-300">Featured Service</span>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl bg-slate-700 px-6 py-3 text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-white font-semibold disabled:opacity-50"
                >
                  {saving ? "Updating..." : "Update Service"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
