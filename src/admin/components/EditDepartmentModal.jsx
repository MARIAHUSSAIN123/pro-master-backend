import { AnimatePresence, motion } from "framer-motion";
import { X, Building2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function EditDepartmentModal({
  open,
  onClose,
  onSave,
  department,
  saving,
}) {
  const [form, setForm] = useState({
    departmentName: "",
    description: "",
    color: "#06b6d4",
    status: "Active",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (department) {
      setForm({
        departmentName: department.departmentName || "",
        description: department.description || "",
        color: department.color || "#06b6d4",
        status: department.status || "Active",
      });
      setError("");
    }
  }, [department]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.departmentName.trim()) {
      setError("Department name is required.");
      return;
    }

    try {
      await onSave(form);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Could not update department."
      );
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
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-[#111827] shadow-2xl"
          >
            {/* Header */}

            <div className="flex items-center justify-between border-b border-slate-800 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-cyan-500/20 p-3">
                  <Building2 className="text-cyan-400" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Edit Department
                  </h2>

                  <p className="text-sm text-slate-400">
                    Update department details
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

            {/* Form */}

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <input
                name="departmentName"
                value={form.departmentName}
                onChange={handleChange}
                placeholder="Department Name"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white"
              />

              <textarea
                rows="4"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Department Description"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white"
              />

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-slate-400">
                    Color
                  </label>
                  <input
                    type="color"
                    name="color"
                    value={form.color}
                    onChange={handleChange}
                    className="h-12 w-full rounded-xl border border-slate-700 bg-slate-900 p-1"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-400">
                    Status
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="h-12 w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white"
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
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
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 font-semibold text-white transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && <Loader2 size={18} className="animate-spin" />}
                  {saving ? "Updating..." : "Update Department"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}