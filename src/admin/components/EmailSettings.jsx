import { motion } from "framer-motion";
import {
  Mail,
  Server,
  Globe,
  ShieldCheck,
  Send,
  Save,
} from "lucide-react";

export default function EmailSettings() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="rounded-3xl border border-slate-800 bg-[#111827] p-8 shadow-xl"
    >
      {/* Header */}

      <div className="mb-8 flex items-center gap-4">

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-600">

          <Mail className="text-white" size={28} />

        </div>

        <div>

          <h2 className="text-2xl font-bold text-white">
            Email Configuration
          </h2>

          <p className="text-slate-400">
            Configure SMTP email service for notifications.
          </p>

        </div>

      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        {/* SMTP Host */}

        <div>

          <label className="mb-2 block text-sm text-slate-400">
            SMTP Host
          </label>

          <div className="relative">

            <Server
              size={18}
              className="absolute left-4 top-4 text-cyan-400"
            />

            <input
              type="text"
              placeholder="smtp.gmail.com"
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 py-3 pl-12 pr-4 text-white outline-none focus:border-cyan-500"
            />

          </div>

        </div>

        {/* SMTP Port */}

        <div>

          <label className="mb-2 block text-sm text-slate-400">
            SMTP Port
          </label>

          <input
            type="number"
            placeholder="587"
            className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-500"
          />

        </div>

        {/* Email */}

        <div>

          <label className="mb-2 block text-sm text-slate-400">
            Email Address
          </label>

          <div className="relative">

            <Mail
              size={18}
              className="absolute left-4 top-4 text-cyan-400"
            />

            <input
              type="email"
              placeholder="admin@promaster.ca"
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 py-3 pl-12 pr-4 text-white outline-none focus:border-cyan-500"
            />

          </div>

        </div>

        {/* Password */}

        <div>

          <label className="mb-2 block text-sm text-slate-400">
            App Password
          </label>

          <div className="relative">

            <ShieldCheck
              size={18}
              className="absolute left-4 top-4 text-cyan-400"
            />

            <input
              type="password"
              placeholder="****************"
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 py-3 pl-12 pr-4 text-white outline-none focus:border-cyan-500"
            />

          </div>

        </div>

        {/* Sender Name */}

        <div>

          <label className="mb-2 block text-sm text-slate-400">
            Sender Name
          </label>

          <input
            type="text"
            placeholder="Pro Master Cleaning"
            className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-500"
          />

        </div>

        {/* Website */}

        <div>

          <label className="mb-2 block text-sm text-slate-400">
            Website URL
          </label>

          <div className="relative">

            <Globe
              size={18}
              className="absolute left-4 top-4 text-cyan-400"
            />

            <input
              type="text"
              placeholder="https://promaster.ca"
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 py-3 pl-12 pr-4 text-white outline-none focus:border-cyan-500"
            />

          </div>

        </div>

      </div>

      {/* Status */}

      <div className="mt-8 rounded-2xl border border-green-500/20 bg-green-500/10 p-5">

        <div className="flex items-center justify-between">

          <div>

            <h3 className="font-semibold text-white">
              Email Service Status
            </h3>

            <p className="text-sm text-slate-400">
              SMTP server is connected successfully.
            </p>

          </div>

          <span className="rounded-full bg-green-500 px-4 py-2 text-sm font-semibold text-white">
            Connected
          </span>

        </div>

      </div>

      {/* Buttons */}

      <div className="mt-8 flex flex-wrap justify-end gap-4">

        <button className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-6 py-3 text-white transition hover:border-cyan-500">

          <Send size={18} />

          Send Test Email

        </button>

        <button className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-600 px-8 py-3 font-semibold text-white shadow-xl transition hover:scale-105">

          <Save size={18} />

          Save Email Settings

        </button>

      </div>

    </motion.div>
  );
}