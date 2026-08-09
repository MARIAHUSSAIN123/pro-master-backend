import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, KeyRound, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function SecuritySettings({ onChangePassword, saving }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    try {
      await onChangePassword(currentPassword, newPassword);
      setSuccess("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to change password.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-3xl border border-slate-800 bg-[#111827] p-8 shadow-xl"
    >
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-red-500 to-pink-600">
          <ShieldCheck size={28} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Security Settings</h2>
          <p className="text-slate-400">Protect your administrator account.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-slate-400">Current Password</label>
          <div className="relative">
            <Lock size={18} className="absolute left-4 top-4 text-cyan-400" />
            <input
              type={show ? "text" : "password"}
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 py-3 pl-12 pr-12 text-white outline-none focus:border-cyan-500"
            />
            {show ? (
              <EyeOff onClick={() => setShow(false)} size={18} className="absolute right-4 top-4 cursor-pointer text-slate-400" />
            ) : (
              <Eye onClick={() => setShow(true)} size={18} className="absolute right-4 top-4 cursor-pointer text-slate-400" />
            )}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-400">New Password</label>
          <div className="relative">
            <KeyRound size={18} className="absolute left-4 top-4 text-cyan-400" />
            <input
              type={show ? "text" : "password"}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 py-3 pl-12 pr-12 text-white outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <label className="mb-2 block text-sm text-slate-400">Confirm Password</label>
        <div className="relative">
          <KeyRound size={18} className="absolute left-4 top-4 text-cyan-400" />
          <input
            type={show ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-2xl border border-slate-700 bg-slate-900 py-3 pl-12 pr-12 text-white outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 rounded-xl bg-green-500/10 border border-green-500/30 px-4 py-3 text-green-400 text-sm">
          {success}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={saving}
        className="mt-6 rounded-2xl bg-gradient-to-r from-red-500 to-pink-600 px-8 py-3 font-semibold text-white transition hover:scale-105 disabled:opacity-60"
      >
        {saving ? "Updating..." : "Update Password"}
      </button>
    </motion.div>
  );
}
