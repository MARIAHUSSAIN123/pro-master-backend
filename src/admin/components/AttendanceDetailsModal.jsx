import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  User,
  CalendarDays,
  Clock,
  MapPin,
  TimerReset,
  BadgeCheck,
} from "lucide-react";

const fmtTime = (v) =>
  v ? new Date(v).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "--";

const fmtDate = (v) =>
  v ? new Date(v).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }) : "--";

export default function AttendanceDetailsModal({
  open = true,
  onClose = () => {},
  record,
  departmentName = "--",
  onEdit,
}) {
  if (!open || !record) return null;

  const hours = record.hoursWorked ? `${record.hoursWorked.toFixed ? record.hoursWorked.toFixed(1) : record.hoursWorked}h` : "--";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-700 bg-[#111827] shadow-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between border-b border-slate-700 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10">
                <User size={30} className="text-cyan-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Attendance Details</h2>
                <p className="text-slate-400">Employee Daily Attendance Record</p>
              </div>
            </div>
            <button onClick={onClose} className="rounded-xl p-2 transition hover:bg-slate-800">
              <X className="text-white" />
            </button>
          </div>

          <div className="grid gap-6 p-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
              <h3 className="mb-5 text-xl font-bold text-white">Employee</h3>
              <div className="space-y-4">
                <Info icon={<User size={18} />} label="Name" value={record.employee?.fullName || "--"} />
                <Info icon={<BadgeCheck size={18} />} label="Department" value={departmentName} />
                <Info icon={<MapPin size={18} />} label="Location" value={record.checkInLocation ? `${record.checkInLocation.lat}, ${record.checkInLocation.lng}` : "Not recorded"} />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
              <h3 className="mb-5 text-xl font-bold text-white">Attendance</h3>
              <div className="space-y-4">
                <Info icon={<CalendarDays size={18} />} label="Date" value={fmtDate(record.date)} />
                <Info icon={<Clock size={18} />} label="Check In" value={fmtTime(record.checkIn)} />
                <Info icon={<Clock size={18} />} label="Check Out" value={fmtTime(record.checkOut)} />
              </div>
            </div>
          </div>

          <div className="grid gap-5 px-6 pb-6 md:grid-cols-3">
            <Card title="Hours Worked" value={hours} color="cyan" icon={<Clock size={28} />} />
            <Card title="Remarks" value={record.remarks || "--"} color="purple" icon={<TimerReset size={28} />} />
            <Card title="Status" value={record.status} color="green" icon={<BadgeCheck size={28} />} />
          </div>

          <div className="flex justify-end gap-4 border-t border-slate-700 p-6">
            <button
              onClick={onClose}
              className="rounded-2xl border border-slate-700 px-6 py-3 text-white transition hover:border-red-500"
            >
              Close
            </button>
            <button
              onClick={onEdit}
              className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-3 font-semibold text-white transition hover:scale-105"
            >
              Edit Attendance
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Info({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4">
      <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-400">{icon}</div>
      <div>
        <p className="text-sm text-slate-400">{label}</p>
        <h4 className="font-semibold text-white break-words">{value}</h4>
      </div>
    </div>
  );
}

function Card({ title, value, color, icon }) {
  const colors = {
    cyan: "from-cyan-500 to-blue-500",
    purple: "from-purple-500 to-pink-500",
    green: "from-green-500 to-emerald-500",
  };

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
      <div className={`mb-5 inline-flex rounded-xl bg-gradient-to-r ${colors[color]} p-3 text-white`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-white break-words">{value}</h3>
      <p className="mt-2 text-slate-400">{title}</p>
    </div>
  );
}
