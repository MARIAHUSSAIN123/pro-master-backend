import { motion } from "framer-motion";
import {
  Palette,
  Moon,
  Languages,
  Globe2,
  Type,
  CalendarDays,
} from "lucide-react";
import { useState } from "react";

export default function AppearanceSettings() {
  const [darkMode, setDarkMode] = useState(true);

  const colors = [
    "#06b6d4",
    "#3b82f6",
    "#8b5cf6",
    "#10b981",
    "#f97316",
    "#ef4444",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="rounded-3xl border border-slate-800 bg-[#111827] p-8 shadow-xl"
    >
      {/* Header */}

      <div className="mb-8 flex items-center gap-4">

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600">

          <Palette
            size={28}
            className="text-white"
          />

        </div>

        <div>

          <h2 className="text-2xl font-bold text-white">
            Appearance
          </h2>

          <p className="text-slate-400">
            Customize your dashboard experience.
          </p>

        </div>

      </div>

      <div className="grid gap-8 lg:grid-cols-2">

        {/* Left Side */}

        <div className="space-y-6">

          {/* Dark Mode */}

          <div className="flex items-center justify-between rounded-2xl border border-slate-700 bg-slate-900 p-5">

            <div className="flex items-center gap-3">

              <Moon className="text-cyan-400" />

              <div>

                <h3 className="font-semibold text-white">
                  Dark Mode
                </h3>

                <p className="text-sm text-slate-400">
                  Enable dark dashboard theme.
                </p>

              </div>

            </div>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative h-8 w-16 rounded-full transition ${
                darkMode
                  ? "bg-cyan-500"
                  : "bg-slate-600"
              }`}
            >
              <span
                className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${
                  darkMode
                    ? "right-1"
                    : "left-1"
                }`}
              />
            </button>

          </div>

          {/* Language */}

          <div>

            <label className="mb-2 flex items-center gap-2 text-sm text-slate-400">

              <Languages size={18} />

              Language

            </label>

            <select className="w-full rounded-2xl border border-slate-700 bg-slate-900 p-3 text-white outline-none focus:border-cyan-500">

              <option>English</option>
              <option>French</option>
              <option>Urdu</option>

            </select>

          </div>

          {/* Timezone */}

          <div>

            <label className="mb-2 flex items-center gap-2 text-sm text-slate-400">

              <Globe2 size={18} />

              Time Zone

            </label>

            <select className="w-full rounded-2xl border border-slate-700 bg-slate-900 p-3 text-white outline-none focus:border-cyan-500">

              <option>America/Toronto</option>
              <option>America/Vancouver</option>
              <option>UTC</option>

            </select>

          </div>

          {/* Date Format */}

          <div>

            <label className="mb-2 flex items-center gap-2 text-sm text-slate-400">

              <CalendarDays size={18} />

              Date Format

            </label>

            <select className="w-full rounded-2xl border border-slate-700 bg-slate-900 p-3 text-white outline-none focus:border-cyan-500">

              <option>DD/MM/YYYY</option>
              <option>MM/DD/YYYY</option>
              <option>YYYY-MM-DD</option>

            </select>

          </div>

          {/* Font Size */}

          <div>

            <label className="mb-2 flex items-center gap-2 text-sm text-slate-400">

              <Type size={18} />

              Font Size

            </label>

            <select className="w-full rounded-2xl border border-slate-700 bg-slate-900 p-3 text-white outline-none focus:border-cyan-500">

              <option>Small</option>
              <option selected>Medium</option>
              <option>Large</option>

            </select>

          </div>

        </div>

        {/* Right Side */}

        <div>

          <h3 className="mb-4 text-lg font-semibold text-white">
            Primary Theme Color
          </h3>

          <div className="mb-8 flex flex-wrap gap-4">

            {colors.map((color) => (
              <button
                key={color}
                style={{ backgroundColor: color }}
                className="h-14 w-14 rounded-2xl border-4 border-transparent transition hover:scale-110 hover:border-white"
              />
            ))}

          </div>

          {/* Preview */}

          <div className="rounded-3xl border border-slate-700 bg-slate-900 p-6">

            <h3 className="mb-5 text-lg font-semibold text-white">
              Live Preview
            </h3>

            <div className="rounded-2xl bg-[#0B1220] p-5">

              <div className="mb-4 flex items-center justify-between">

                <div>

                  <h4 className="font-bold text-white">
                    Dashboard
                  </h4>

                  <p className="text-sm text-slate-400">
                    Preview Card
                  </p>

                </div>

                <button className="rounded-xl bg-cyan-500 px-4 py-2 text-white">

                  Action

                </button>

              </div>

              <div className="h-3 rounded-full bg-slate-700">

                <div className="h-full w-2/3 rounded-full bg-cyan-500"></div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </motion.div>
  );
}