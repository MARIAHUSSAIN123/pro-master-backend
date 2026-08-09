import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, ShieldCheck, Check } from "lucide-react";

export default function AdminProfile({ user, onSave, saving, saved }) {
  const [form, setForm] = useState({ fullName: "", phone: "" });

  useEffect(() => {
    if (user) {
      setForm({ fullName: user.fullName || "", phone: user.phone || "" });
    }
  }, [user]);

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-3xl border border-slate-800 bg-[#111827] p-8 shadow-xl"
    >
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600">
          <User size={28} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Administrator Profile</h2>
          <p className="text-slate-400">Manage administrator account details.</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="flex flex-col items-center">
          <img
            src={
              user?.profileImage ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user?.fullName || "Admin"
              )}&background=06b6d4&color=fff&size=256`
            }
            alt="Admin"
            className="h-40 w-40 rounded-full border-4 border-cyan-500 object-cover shadow-xl"
          />
        </div>

        <div className="space-y-5 lg:col-span-2">
          <div>
            <label className="mb-2 block text-sm text-slate-400">Full Name</label>
            <div className="relative">
              <User size={18} className="absolute left-4 top-4 text-cyan-400" />
              <input
                value={form.fullName}
                onChange={handleChange("fullName")}
                className="w-full rounded-2xl border border-slate-700 bg-slate-900 py-3 pl-12 pr-4 text-white outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-400">Email Address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-4 text-cyan-400" />
              <input
                type="email"
                value={user?.email || ""}
                disabled
                title="Email cannot be changed here"
                className="w-full rounded-2xl border border-slate-700 bg-slate-900/60 py-3 pl-12 pr-4 text-slate-400 outline-none cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-400">Phone Number</label>
            <div className="relative">
              <Phone size={18} className="absolute left-4 top-4 text-cyan-400" />
              <input
                value={form.phone}
                onChange={handleChange("phone")}
                className="w-full rounded-2xl border border-slate-700 bg-slate-900 py-3 pl-12 pr-4 text-white outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-400">Role</label>
            <div className="relative">
              <ShieldCheck size={18} className="absolute left-4 top-4 text-cyan-400" />
              <input
                value={user?.role || ""}
                disabled
                className="w-full rounded-2xl border border-slate-700 bg-slate-900/60 py-3 pl-12 pr-4 text-slate-400 capitalize outline-none cursor-not-allowed"
              />
            </div>
          </div>

          <button
            onClick={() => onSave(form)}
            disabled={saving}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-3 font-semibold text-white transition hover:scale-105 disabled:opacity-60"
          >
            {saved ? <Check size={18} /> : null}
            {saving ? "Saving..." : saved ? "Saved" : "Save Profile"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
