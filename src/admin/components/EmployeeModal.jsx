import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  DollarSign,
  Calendar,
  MapPin,
  Shield,
  CreditCard,
  Loader2,
} from "lucide-react";

const DESIGNATIONS = [
  "Cleaner",
  "Supervisor",
  "Driver",
  "Office Staff",
  "Manager",
];

const EMPLOYMENT_TYPES = ["Full Time", "Part Time", "Contract"];

const STATUSES = ["Active", "On Leave", "Inactive"];

const DEFAULT_FORM = {
  fullName: "",
  email: "",
  phone: "",
  cnic: "",
  designation: "",
  department: "",
  salary: "",
  address: "",
  city: "",
  emergencyContact: "",
  joiningDate: "",
  employmentType: "Full Time",
  status: "Active",
  notes: "",
};

export default function EmployeeModal({
  open,
  onClose,
  onSave,
  employee,
  departments = [],
  saving,
}) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [error, setError] = useState("");

  useEffect(() => {
    if (employee) {
      setForm({
        fullName: employee.fullName || "",
        email: employee.email || "",
        phone: employee.phone || "",
        cnic: employee.cnic || "",
        designation: employee.designation || "",
        department: employee.department?._id || employee.department || "",
        salary: employee.salary || "",
        address: employee.address || "",
        city: employee.city || "",
        emergencyContact: employee.emergencyContact || "",
        joiningDate: employee.joiningDate
          ? employee.joiningDate.slice(0, 10)
          : "",
        employmentType: employee.employmentType || "Full Time",
        status: employee.status || "Active",
        notes: employee.notes || "",
      });
    } else {
      setForm(DEFAULT_FORM);
    }
    setError("");
  }, [employee, open]);

  if (!open) return null;

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !form.fullName ||
      !form.email ||
      !form.phone ||
      !form.cnic ||
      !form.designation ||
      !form.department ||
      !form.salary ||
      !form.address
    ) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      await onSave(form);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not save employee.");
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
          className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-700 bg-[#0f172a] shadow-[0_0_60px_rgba(6,182,212,.15)]"
        >
          {/* Header */}

          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-[#0f172a] p-8">
            <div>
              <h2 className="text-3xl font-bold text-white">
                {employee ? "Edit Employee" : "Add New Employee"}
              </h2>
              <p className="mt-2 text-slate-400">
                {employee
                  ? "Update employee profile."
                  : "Create a new employee profile."}
              </p>
            </div>

            <button
              onClick={onClose}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 hover:bg-red-500 transition"
            >
              <X className="text-white" />
            </button>
          </div>

          {/* Body */}

          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 p-8 md:grid-cols-2">
              {error && (
                <div className="md:col-span-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <Input
                icon={<User size={18} />}
                placeholder="Full Name"
                value={form.fullName}
                onChange={handleChange("fullName")}
              />

              <Input
                icon={<Mail size={18} />}
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange("email")}
              />

              <Input
                icon={<Phone size={18} />}
                placeholder="Phone Number"
                value={form.phone}
                onChange={handleChange("phone")}
              />

              <Input
                icon={<CreditCard size={18} />}
                placeholder="CNIC"
                value={form.cnic}
                onChange={handleChange("cnic")}
              />

              <Select
                icon={<Building2 size={18} />}
                value={form.department}
                onChange={handleChange("department")}
                options={departments.map((d) => ({
                  value: d._id,
                  label: d.departmentName,
                }))}
                placeholder={
                  departments.length === 0
                    ? "No departments yet — add one first"
                    : "Select Department"
                }
              />

              <Select
                icon={<Briefcase size={18} />}
                value={form.designation}
                onChange={handleChange("designation")}
                options={DESIGNATIONS.map((d) => ({ value: d, label: d }))}
                placeholder="Select Designation"
              />

              <Input
                icon={<DollarSign size={18} />}
                type="number"
                placeholder="Monthly Salary"
                value={form.salary}
                onChange={handleChange("salary")}
              />

              <Input
                type="date"
                icon={<Calendar size={18} />}
                value={form.joiningDate}
                onChange={handleChange("joiningDate")}
              />

              <Select
                icon={<Shield size={18} />}
                value={form.employmentType}
                onChange={handleChange("employmentType")}
                options={EMPLOYMENT_TYPES.map((t) => ({ value: t, label: t }))}
              />

              <Select
                icon={<Shield size={18} />}
                value={form.status}
                onChange={handleChange("status")}
                options={STATUSES.map((s) => ({ value: s, label: s }))}
              />

              <Input
                icon={<Phone size={18} />}
                placeholder="Emergency Contact"
                value={form.emergencyContact}
                onChange={handleChange("emergencyContact")}
              />

              <Input
                icon={<MapPin size={18} />}
                placeholder="City"
                value={form.city}
                onChange={handleChange("city")}
              />

              {/* Address */}

              <div className="md:col-span-2 relative">
                <MapPin
                  size={18}
                  className="absolute left-4 top-5 text-slate-400"
                />
                <textarea
                  rows="3"
                  placeholder="Employee Address"
                  value={form.address}
                  onChange={handleChange("address")}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 pl-12 pr-4 pt-4 text-white outline-none focus:border-cyan-500"
                />
              </div>

              {/* Notes */}

              <div className="md:col-span-2">
                <textarea
                  rows="2"
                  placeholder="Notes (optional)"
                  value={form.notes}
                  onChange={handleChange("notes")}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-4 text-white outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Footer */}

            <div className="sticky bottom-0 flex justify-end gap-4 border-t border-slate-800 bg-[#0f172a] p-6">
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-slate-700 px-8 py-3 text-white transition hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 px-10 py-3 font-semibold text-white transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving && <Loader2 size={18} className="animate-spin" />}
                {saving ? "Saving..." : "Save Employee"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Input({ icon, type = "text", placeholder = "", value, onChange }) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-4 text-slate-400">{icon}</div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="h-14 w-full rounded-2xl border border-slate-700 bg-slate-900 pl-12 pr-4 text-white outline-none transition focus:border-cyan-500"
      />
    </div>
  );
}

function Select({ icon, value, onChange, options, placeholder = "Select" }) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-4 text-slate-400">{icon}</div>
      <select
        value={value}
        onChange={onChange}
        className="h-14 w-full rounded-2xl border border-slate-700 bg-slate-900 pl-12 pr-4 text-white outline-none focus:border-cyan-500"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}