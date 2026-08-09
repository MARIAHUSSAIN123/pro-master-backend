import { motion } from "framer-motion";
import {
  Settings,
  Save,
  ShieldCheck,
} from "lucide-react";

export default function SettingsHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-[#0B1220] via-[#111827] to-[#1E293B] p-8 shadow-2xl"
    >
      {/* Glow Effects */}

      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl"></div>

      <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl"></div>

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

        {/* Left */}

        <div>

          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-5 py-2 text-cyan-400">

            <Settings size={18} />

            System Settings

          </div>

          <h1 className="mt-5 text-4xl font-bold text-white lg:text-5xl">

            Settings

          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-slate-400">

            Configure your company information, administrator
            account, payment gateway, email services,
            notifications and system preferences.

          </p>

          <div className="mt-6 flex items-center gap-3 text-slate-300">

            <ShieldCheck
              size={18}
              className="text-green-400"
            />

            Secure Configuration • Last Updated Today

          </div>

        </div>

        {/* Right */}

        <div className="flex flex-wrap gap-4">

          <button className="rounded-2xl border border-slate-700 bg-slate-900 px-6 py-4 text-white transition hover:border-cyan-500 hover:bg-slate-800">

            Preview

          </button>

          <button className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 px-8 py-4 font-semibold text-white shadow-xl transition-all duration-300 hover:scale-105">

            <Save size={20} />

            Save Changes

          </button>

        </div>

      </div>

    </motion.div>
  );
}