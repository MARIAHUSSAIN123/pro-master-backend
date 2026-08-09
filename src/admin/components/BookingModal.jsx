import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Wrench, Calendar, Clock, MapPin, CreditCard, FileText, Users } from "lucide-react";
import { getCustomers } from "../api/customerApi";
import { getServices } from "../api/serviceApi";
import { getEmployees } from "../api/employeeApi";

const emptyForm = {
  customer: "",
  service: "",
  bookingDate: "",
  bookingTime: "",
  address: "",
  paymentMethod: "Cash",
  notes: "",
};

export default function BookingModal({ open, onClose, onSave, booking, saving }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [assignedEmployees, setAssignedEmployees] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const isEdit = !!booking;

  useEffect(() => {
    if (!open) return;

    const loadOptions = async () => {
      setLoadingOptions(true);
      try {
        const [customersRes, servicesRes, employeesRes] = await Promise.all([
          getCustomers(),
          getServices(),
          getEmployees(),
        ]);
        setCustomers(customersRes?.customers || []);
        setServices(servicesRes?.services || []);
        setEmployees(employeesRes?.employees || []);
      } catch (err) {
        console.error("BookingModal options error:", err);
      } finally {
        setLoadingOptions(false);
      }
    };

    loadOptions();
  }, [open]);

  useEffect(() => {
    if (booking) {
      setForm({
        customer: booking.customer?._id || booking.customer || "",
        service: booking.service?._id || booking.service || "",
        bookingDate: booking.bookingDate
          ? new Date(booking.bookingDate).toISOString().slice(0, 10)
          : "",
        bookingTime: booking.bookingTime || "",
        address: booking.address || "",
        paymentMethod: booking.paymentMethod || "Cash",
        notes: booking.notes || "",
      });
      setAssignedEmployees(
        (booking.assignedEmployees || []).map((e) => e?._id || e)
      );
    } else {
      setForm(emptyForm);
      setAssignedEmployees([]);
    }
    setError("");
  }, [booking, open]);

  const selectedService = useMemo(
    () => services.find((s) => s._id === form.service),
    [services, form.service]
  );

  if (!open) return null;

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const toggleEmployee = (id) => {
    setAssignedEmployees((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!form.customer || !form.service || !form.bookingDate || !form.bookingTime || !form.address) {
      setError("Customer, service, date, time aur address zaroori hain.");
      return;
    }
    if (form.address.trim().length < 10) {
      setError("Address mukammal likhein (kam az kam 10 characters).");
      return;
    }

    try {
      setError("");
      await onSave(form, assignedEmployees);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Booking save nahi hui. Dobara try karein."
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
          <div className="absolute -top-20 left-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl"></div>
          <div className="absolute bottom-0 right-10 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl"></div>

          <div className="relative flex items-center justify-between border-b border-slate-800 p-8">
            <div>
              <h2 className="text-3xl font-bold text-white">
                {isEdit ? "Edit Booking" : "Create Booking"}
              </h2>
              <p className="mt-2 text-slate-400">
                {isEdit ? "Update booking details." : "Fill customer booking details."}
              </p>
            </div>

            <button
              onClick={onClose}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 hover:bg-red-500 transition"
            >
              <X className="text-white" />
            </button>
          </div>

          {error && (
            <div className="mx-8 mt-6 rounded-xl bg-red-500/20 text-red-400 p-3">
              {error}
            </div>
          )}

          <div className="relative grid gap-6 p-8 md:grid-cols-2">
            <Select
              icon={<User size={18} />}
              value={form.customer}
              onChange={handleChange("customer")}
              disabled={loadingOptions}
              placeholder="Select Customer *"
              options={customers.map((c) => ({ value: c._id, label: c.fullName }))}
            />

            <Select
              icon={<Wrench size={18} />}
              value={form.service}
              onChange={handleChange("service")}
              disabled={loadingOptions}
              placeholder="Select Service *"
              options={services.map((s) => ({
                value: s._id,
                label: `${s.serviceName} — $${s.price}`,
              }))}
            />

            <Input
              icon={<Calendar size={18} />}
              type="date"
              value={form.bookingDate}
              onChange={handleChange("bookingDate")}
            />

            <Input
              icon={<Clock size={18} />}
              type="time"
              value={form.bookingTime}
              onChange={handleChange("bookingTime")}
            />

            <Select
              icon={<CreditCard size={18} />}
              value={form.paymentMethod}
              onChange={handleChange("paymentMethod")}
              options={["Cash", "Credit Card", "Debit Card", "E-Transfer"].map((v) => ({
                value: v,
                label: v,
              }))}
            />

            {selectedService && (
              <div className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 p-4 text-slate-300">
                <CreditCard size={18} className="text-cyan-400" />
                Total Amount:
                <span className="font-semibold text-white">${selectedService.price}</span>
              </div>
            )}

            <div className="md:col-span-2 relative">
              <MapPin size={18} className="absolute left-4 top-5 text-slate-400" />
              <textarea
                rows="2"
                placeholder="Service Address *"
                value={form.address}
                onChange={handleChange("address")}
                className="w-full rounded-2xl border border-slate-700 bg-slate-900 pl-12 pr-4 pt-4 text-white outline-none focus:border-cyan-500"
              />
            </div>

            <div className="md:col-span-2 relative">
              <FileText size={18} className="absolute left-4 top-5 text-slate-400" />
              <textarea
                rows="3"
                placeholder="Additional Notes (optional)"
                value={form.notes}
                onChange={handleChange("notes")}
                className="w-full rounded-2xl border border-slate-700 bg-slate-900 pl-12 pr-4 pt-4 text-white outline-none focus:border-cyan-500"
              />
            </div>

            {isEdit && (
              <div className="md:col-span-2">
                <p className="mb-3 flex items-center gap-2 text-slate-400">
                  <Users size={18} />
                  Assign Employees
                </p>
                <div className="flex flex-wrap gap-3 rounded-2xl border border-slate-700 bg-slate-900 p-4">
                  {employees.length === 0 && (
                    <span className="text-slate-500 text-sm">No employees found.</span>
                  )}
                  {employees.map((emp) => (
                    <label
                      key={emp._id}
                      className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-sm transition ${
                        assignedEmployees.includes(emp._id)
                          ? "border-cyan-500 bg-cyan-500/15 text-cyan-300"
                          : "border-slate-700 text-slate-400 hover:border-slate-500"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={assignedEmployees.includes(emp._id)}
                        onChange={() => toggleEmployee(emp._id)}
                      />
                      {emp.fullName}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative flex justify-end gap-4 p-8 pt-0">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl border border-slate-700 text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 text-white font-semibold hover:scale-105 transition disabled:opacity-50"
            >
              {saving ? "Saving..." : isEdit ? "Update Booking" : "Save Booking"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Input({ icon, ...props }) {
  return (
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
      <input
        {...props}
        className="w-full rounded-2xl border border-slate-700 bg-slate-900 py-4 pl-12 pr-4 text-white outline-none focus:border-cyan-500"
      />
    </div>
  );
}

function Select({ icon, options = [], placeholder, ...props }) {
  return (
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
      <select
        {...props}
        className="w-full appearance-none rounded-2xl border border-slate-700 bg-slate-900 py-4 pl-12 pr-4 text-white outline-none focus:border-cyan-500"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
