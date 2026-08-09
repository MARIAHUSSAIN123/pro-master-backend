import { Building2, Upload, Globe, Mail, Phone, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function CompanySettings() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-3xl border border-slate-800 bg-[#111827] p-8 shadow-xl"
    >
      {/* Header */}

      <div className="flex items-center gap-4 mb-8">

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600">

          <Building2 className="text-white" size={28} />

        </div>

        <div>

          <h2 className="text-2xl font-bold text-white">
            Company Information
          </h2>

          <p className="text-slate-400">
            Update your company details.
          </p>

        </div>

      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        {/* Company Name */}

        <div>

          <label className="mb-2 block text-sm text-slate-400">
            Company Name
          </label>

          <div className="relative">

            <Building2
              size={18}
              className="absolute left-4 top-4 text-cyan-400"
            />

            <input
              type="text"
              defaultValue="Pro Master Cleaning & Maintenance"
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 py-3 pl-12 pr-4 text-white outline-none focus:border-cyan-500"
            />

          </div>

        </div>

        {/* Email */}

        <div>

          <label className="mb-2 block text-sm text-slate-400">
            Company Email
          </label>

          <div className="relative">

            <Mail
              size={18}
              className="absolute left-4 top-4 text-cyan-400"
            />

            <input
              type="email"
              placeholder="company@email.com"
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 py-3 pl-12 pr-4 text-white outline-none focus:border-cyan-500"
            />

          </div>

        </div>

        {/* Phone */}

        <div>

          <label className="mb-2 block text-sm text-slate-400">
            Phone Number
          </label>

          <div className="relative">

            <Phone
              size={18}
              className="absolute left-4 top-4 text-cyan-400"
            />

            <input
              type="text"
              placeholder="+1 (000) 000-0000"
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 py-3 pl-12 pr-4 text-white outline-none focus:border-cyan-500"
            />

          </div>

        </div>

        {/* Website */}

        <div>

          <label className="mb-2 block text-sm text-slate-400">
            Website
          </label>

          <div className="relative">

            <Globe
              size={18}
              className="absolute left-4 top-4 text-cyan-400"
            />

            <input
              type="text"
              placeholder="https://yourwebsite.com"
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 py-3 pl-12 pr-4 text-white outline-none focus:border-cyan-500"
            />

          </div>

        </div>

      </div>

      {/* Address */}

      <div className="mt-6">

        <label className="mb-2 block text-sm text-slate-400">
          Company Address
        </label>

        <div className="relative">

          <MapPin
            size={18}
            className="absolute left-4 top-4 text-cyan-400"
          />

          <textarea
            rows="4"
            placeholder="Enter company address..."
            className="w-full rounded-2xl border border-slate-700 bg-slate-900 py-3 pl-12 pr-4 text-white outline-none focus:border-cyan-500"
          />

        </div>

      </div>

      {/* Logo Upload */}

      <div className="mt-8">

        <label className="mb-3 block text-sm text-slate-400">
          Company Logo
        </label>

        <div className="cursor-pointer rounded-3xl border-2 border-dashed border-cyan-500/40 bg-slate-900 p-10 transition hover:border-cyan-500">

          <div className="flex flex-col items-center justify-center">

            <div className="mb-5 rounded-full bg-cyan-500/20 p-5">

              <Upload
                size={30}
                className="text-cyan-400"
              />

            </div>

            <h3 className="text-lg font-semibold text-white">
              Upload Company Logo
            </h3>

            <p className="mt-2 text-center text-slate-400">
              PNG, JPG or SVG
              <br />
              Maximum size 5MB
            </p>

            <button className="mt-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 font-semibold text-white transition hover:scale-105">

              Choose File

            </button>

          </div>

        </div>

      </div>

    </motion.div>
  );
}