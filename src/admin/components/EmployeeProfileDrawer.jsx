import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mail,
  Phone,
  MapPin,
  Building2,
  Briefcase,
  Calendar,
  DollarSign,
  Clock3,
  Star,
} from "lucide-react";

export default function EmployeeProfileDrawer({
  open,
  onClose,
}) {
  if (!open) return null;

  return (
    <AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
      >

        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: .35 }}
          className="absolute right-0 top-0 h-full w-full max-w-lg overflow-y-auto bg-[#0f172a] border-l border-slate-700 shadow-2xl"
        >

          {/* Header */}

          <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-800 bg-[#0f172a]/90 p-6 backdrop-blur">

            <h2 className="text-2xl font-bold text-white">
              Employee Profile
            </h2>

            <button
              onClick={onClose}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 transition hover:bg-red-500"
            >
              <X className="text-white" />
            </button>

          </div>

          {/* Body */}

          <div className="p-6">

            {/* Profile */}

            <div className="flex flex-col items-center">

              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-5xl font-bold text-white shadow-xl">

                A

              </div>

              <h3 className="mt-5 text-3xl font-bold text-white">
                Ali Khan
              </h3>

              <p className="text-cyan-400">
                Senior Cleaner
              </p>

              <span className="mt-4 rounded-full bg-green-500/20 px-5 py-2 text-sm text-green-400">
                Active Employee
              </span>

            </div>

            {/* Stats */}

            <div className="mt-8 grid grid-cols-2 gap-4">

              <StatCard
                title="Attendance"
                value="98%"
              />

              <StatCard
                title="Performance"
                value="4.9 ⭐"
              />

              <StatCard
                title="Salary"
                value="$4,200"
              />

              <StatCard
                title="Experience"
                value="3 Years"
              />

            </div>

            {/* Information */}

            <div className="mt-10 space-y-5">

              <Info
                icon={<Mail size={18} />}
                title="Email"
                value="ali@hillsatcham.ca"
              />

              <Info
                icon={<Phone size={18} />}
                title="Phone"
                value="+1 403 555 5544"
              />

              <Info
                icon={<Building2 size={18} />}
                title="Department"
                value="Cleaning"
              />

              <Info
                icon={<Briefcase size={18} />}
                title="Position"
                value="Senior Cleaner"
              />

              <Info
                icon={<Calendar size={18} />}
                title="Joined"
                value="12 January 2024"
              />

              <Info
                icon={<DollarSign size={18} />}
                title="Monthly Salary"
                value="$4,200"
              />

              <Info
                icon={<Clock3 size={18} />}
                title="Working Hours"
                value="09:00 AM - 05:00 PM"
              />

              <Info
                icon={<MapPin size={18} />}
                title="Address"
                value="Calgary, Alberta, Canada"
              />

            </div>

            {/* Performance */}

            <div className="mt-10 rounded-3xl border border-slate-800 bg-slate-900 p-6">

              <div className="flex items-center gap-2">

                <Star className="text-yellow-400" />

                <h3 className="text-lg font-bold text-white">
                  Monthly Performance
                </h3>

              </div>

              <div className="mt-6 h-3 rounded-full bg-slate-800">

                <div className="h-3 w-[92%] rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"></div>

              </div>

              <p className="mt-3 text-slate-400">
                Employee performance is excellent this month.
              </p>

            </div>

            {/* Buttons */}

            <div className="mt-10 flex gap-4">

              <button className="flex-1 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 py-4 font-semibold text-white transition hover:scale-105">
                Edit Employee
              </button>

              <button className="flex-1 rounded-2xl border border-red-500 py-4 font-semibold text-red-400 transition hover:bg-red-500 hover:text-white">
                Delete
              </button>

            </div>

          </div>

        </motion.div>

      </motion.div>

    </AnimatePresence>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-center">

      <h4 className="text-slate-400 text-sm">
        {title}
      </h4>

      <p className="mt-2 text-2xl font-bold text-white">
        {value}
      </p>

    </div>
  );
}

function Info({
  icon,
  title,
  value,
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5">

      <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-400">
        {icon}
      </div>

      <div>

        <p className="text-sm text-slate-400">
          {title}
        </p>

        <h4 className="mt-1 text-white">
          {value}
        </h4>

      </div>

    </div>
  );
}