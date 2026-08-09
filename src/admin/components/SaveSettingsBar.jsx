import { motion } from "framer-motion";
import {
  Save,
  RotateCcw,
  CheckCircle2,
  Clock,
} from "lucide-react";

export default function SaveSettingsBar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 80 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="sticky bottom-5 z-50 mt-10"
    >
      <div className="rounded-3xl border border-slate-700 bg-[#0F172A]/95 backdrop-blur-xl shadow-2xl">

        <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">

          {/* Left */}

          <div className="flex items-center gap-5">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/20">

              <CheckCircle2
                size={30}
                className="text-green-400"
              />

            </div>

            <div>

              <h3 className="text-lg font-bold text-white">
                Ready to Save Changes
              </h3>

              <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-slate-400">

                <span className="flex items-center gap-2">

                  <Clock size={15} />

                  Last Updated: Just Now

                </span>

                <span className="rounded-full bg-green-500/20 px-3 py-1 text-green-400">

                  Auto Save Enabled

                </span>

              </div>

            </div>

          </div>

          {/* Right */}

          <div className="flex flex-wrap gap-4">

            <button className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-6 py-3 font-medium text-white transition hover:border-red-500 hover:bg-red-500/10">

              <RotateCcw size={18} />

              Reset Changes

            </button>

            <button className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 px-8 py-3 font-semibold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-cyan-500/30">

              <Save size={20} />

              Save All Settings

            </button>

          </div>

        </div>

      </div>

    </motion.div>
  );
}