import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Landmark,
  Hash,
  CreditCard,
  FileText,
} from "lucide-react";

const emptyForm = {
  fullName: "",
  email: "",
  phone: "",
  companyName: "",
  address: "",
  city: "",
  province: "",
  postalCode: "",
  customerType: "Residential",
  billingMethod: "Cash",
  notes: "",
};

export default function CustomerModal({ open, onClose, onSave, customer, saving }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (customer) {
      setForm({
        fullName: customer.fullName || "",
        email: customer.email || "",
        phone: customer.phone || "",
        companyName: customer.companyName || "",
        address: customer.address || "",
        city: customer.city || "",
        province: customer.province || "",
        postalCode: customer.postalCode || "",
        customerType: customer.customerType || "Residential",
        billingMethod: customer.billingMethod || "Cash",
        notes: customer.notes || "",
      });
    } else {
      setForm(emptyForm);
    }
    setError("");
  }, [customer, open]);

  if (!open) return null;

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!form.fullName || !form.email || !form.phone || !form.address || !form.city) {
      setError("Please fill all required fields (name, email, phone, address, city).");
      return;
    }

    try {
      setError("");
      await onSave(form);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Something went wrong. Please try again."
      );
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
          className="relative w-full max-w-4xl rounded-3xl border border-slate-700 bg-[#0f172a] shadow-[0_0_60px_rgba(6,182,212,.15)] overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          {/* Glow */}
          <div className="absolute -top-20 left-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl"></div>
          <div className="absolute bottom-0 right-10 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl"></div>

          {/* Header */}
          <div className="relative flex items-center justify-between border-b border-slate-800 p-8">
            <div>
              <h2 className="text-3xl font-bold text-white">
                {customer ? "Edit Customer" : "Add New Customer"}
              </h2>
              <p className="mt-2 text-slate-400">
                {customer ? "Update customer information." : "Create a new customer profile."}
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
          <div className="relative grid gap-6 p-8 md:grid-cols-2">
            <Input
              icon={<User size={18} />}
              placeholder="Full Name *"
              value={form.fullName}
              onChange={handleChange("fullName")}
            />

            <Input
              icon={<Mail size={18} />}
              placeholder="Email Address *"
              value={form.email}
              onChange={handleChange("email")}
            />

            <Input
              icon={<Phone size={18} />}
              placeholder="Phone Number *"
              value={form.phone}
              onChange={handleChange("phone")}
            />

            <Input
              icon={<Building2 size={18} />}
              placeholder="Company Name (optional)"
              value={form.companyName}
              onChange={handleChange("companyName")}
            />

            <Select
              icon={<Landmark size={18} />}
              value={form.customerType}
              onChange={handleChange("customerType")}
              options={["Residential", "Commercial"]}
            />

            <Select
              icon={<CreditCard size={18} />}
              value={form.billingMethod}
              onChange={handleChange("billingMethod")}
              options={["Cash", "Credit Card", "Debit Card", "E-Transfer", "Bank Transfer"]}
            />

            <Input
              icon={<Hash size={18} />}
              placeholder="City *"
              value={form.city}
              onChange={handleChange("city")}
            />

            <Input
              icon={<Hash size={18} />}
              placeholder="Province"
              value={form.province}
              onChange={handleChange("province")}
            />

            <Input
              icon={<Hash size={18} />}
              placeholder="Postal Code"
              value={form.postalCode}
              onChange={handleChange("postalCode")}
            />

            <div className="md:col-span-2 relative">
              <MapPin size={18} className="absolute left-4 top-5 text-slate-400" />
              <textarea
                rows="2"
                placeholder="Address *"
                value={form.address}
                onChange={handleChange("address")}
                className="w-full rounded-2xl border border-slate-700 bg-slate-900 pl-12 pr-4 pt-4 text-white outline-none focus:border-cyan-500"
              />
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

          {/* Footer */}
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
              {saving ? "Saving..." : customer ? "Save Changes" : "Save Customer"}
            </button>
          </div>
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

function Select({ icon, options, value, onChange }) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-4 text-slate-400">{icon}</div>
      <select
        value={value}
        onChange={onChange}
        className="h-14 w-full rounded-2xl border border-slate-700 bg-slate-900 pl-12 pr-4 text-white outline-none focus:border-cyan-500"
      >
        {options.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </div>
  );
}
