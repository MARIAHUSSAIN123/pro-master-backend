import { motion } from "framer-motion";

const rows = (bs) => [
  { label: "Pending", value: bs?.pendingBookings, color: "bg-yellow-500" },
  { label: "Confirmed", value: bs?.confirmedBookings, color: "bg-blue-500" },
  { label: "Assigned", value: bs?.assignedBookings, color: "bg-indigo-500" },
  { label: "In Progress", value: bs?.inProgressBookings, color: "bg-cyan-500" },
  { label: "Completed", value: bs?.completedBookings, color: "bg-green-500" },
  { label: "Cancelled", value: bs?.cancelledBookings, color: "bg-red-500" },
];

export default function BookingStatusBreakdown({ bookingStatus, totalBookings = 0 }) {
  const data = rows(bookingStatus);
  const max = Math.max(1, ...data.map((r) => r.value || 0));

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-slate-800 bg-[#111827] p-6 shadow-xl"
    >
      <h2 className="mb-6 text-2xl font-bold text-white">Booking Status Breakdown</h2>

      <div className="space-y-5">
        {data.map((row) => (
          <div key={row.label}>
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-slate-300">{row.label}</span>
              <span className="text-slate-400">{row.value || 0}</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full ${row.color} rounded-full transition-all duration-700`}
                style={{ width: `${((row.value || 0) / max) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 text-sm text-slate-400">Total bookings: {totalBookings}</p>
    </motion.div>
  );
}
