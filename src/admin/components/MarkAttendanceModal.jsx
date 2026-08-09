import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, CalendarDays, FileText } from "lucide-react";

const emptyForm = {
  employee: "",
  date: new Date().toISOString().slice(0, 10),
  status: "Present",
  remarks: "",
};

export default function MarkAttendanceModal({
  open,
  onClose,
  onSave,
  record,
  saving,
  employees = [],
}) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (record) {
      setForm({
        employee: record.employee?._id || record.employee || "",
        date: record.date ? new Date(record.date).toISOString().slice(0, 10) : "",
        status: record.status || "Present",
        remarks: record.remarks || "",
      });
    } else {
      setForm(emptyForm);
    }
    setError("");
  }, [record, open]);

  if (!open) return null;

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.employee || !form.date) {
      setError("Please select an employee and a date.");
      return;
    }
    try {
      setError("");
      await onSave(form);
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
              <h2 className="text-3xl font-bold text-white">
                {record ? "Edit Attendance" : "Mark Attendance"}
              </h2>
              <p className="mt-2 text-slate-400">
                {record ? "Update this attendance record." : "Record an employee's attendance for a day."}
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
              <User size={18} className="absolute left-4 top-4 text-slate-400" />
              <select
                value={form.employee}
                onChange={handleChange("employee")}
                disabled={!!record}
                className="h-14 w-full appearance-none rounded-2xl border border-slate-700 bg-slate-900 pl-12 pr-4 text-white outline-none focus:border-cyan-500 disabled:opacity-60"
              >
                <option value="">Select Employee *</option>
                {employees.map((e) => (
                  <option key={e._id} value={e._id}>
                    {e.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <CalendarDays size={18} className="absolute left-4 top-4 text-slate-400" />
              <input
                type="date"
                value={form.date}
                onChange={handleChange("date")}
                disabled={!!record}
                className="h-14 w-full rounded-2xl border border-slate-700 bg-slate-900 pl-12 pr-4 text-white outline-none focus:border-cyan-500 disabled:opacity-60"
              />
            </div>

            <select
              value={form.status}
              onChange={handleChange("status")}
              className="h-14 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 text-white outline-none focus:border-cyan-500"
            >
              {["Present", "Absent", "Leave", "Half Day", "Late"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <div className="md:col-span-2 relative">
              <FileText size={18} className="absolute left-4 top-5 text-slate-400" />
              <textarea
                rows="3"
                placeholder="Remarks (optional)"
                value={form.remarks}
                onChange={handleChange("remarks")}
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
              {saving ? "Saving..." : record ? "Save Changes" : "Mark Attendance"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
