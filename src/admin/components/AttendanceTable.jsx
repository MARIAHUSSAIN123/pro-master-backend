import { motion } from "framer-motion";
import { Eye, Pencil, Trash2, LogIn, LogOut } from "lucide-react";

const fmtTime = (v) =>
  v ? new Date(v).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "--";

const statusClass = (status) =>
  status === "Present"
    ? "bg-green-500/20 text-green-400"
    : status === "Absent"
    ? "bg-red-500/20 text-red-400"
    : status === "Late"
    ? "bg-yellow-500/20 text-yellow-400"
    : "bg-blue-500/20 text-blue-400";

export default function AttendanceTable({
  records = [],
  loading,
  departmentMap = {},
  page = 1,
  pageSize = 8,
  total = 0,
  onPageChange,
  onView,
  onEdit,
  onDelete,
  onCheckIn,
  onCheckOut,
}) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="overflow-hidden rounded-3xl border border-slate-800 bg-[#111827] shadow-xl"
    >
      <div className="border-b border-slate-800 p-6">
        <h2 className="text-2xl font-bold text-white">Employee Attendance</h2>
        <p className="mt-2 text-slate-400">Daily attendance records</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-900">
            <tr>
              <th className="px-6 py-4 text-left text-sm text-slate-400">Employee</th>
              <th className="px-6 py-4 text-left text-sm text-slate-400">Department</th>
              <th className="px-6 py-4 text-left text-sm text-slate-400">Check In</th>
              <th className="px-6 py-4 text-left text-sm text-slate-400">Check Out</th>
              <th className="px-6 py-4 text-left text-sm text-slate-400">Hours</th>
              <th className="px-6 py-4 text-left text-sm text-slate-400">Status</th>
              <th className="px-6 py-4 text-center text-sm text-slate-400">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-slate-400">
                  Loading attendance...
                </td>
              </tr>
            )}

            {!loading && records.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-slate-400">
                  No attendance records found.
                </td>
              </tr>
            )}

            {!loading &&
              records.map((r) => (
                <tr
                  key={r._id}
                  className="border-b border-slate-800 transition hover:bg-slate-900/60"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400 font-semibold">
                        {(r.employee?.fullName || "?").charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">
                          {r.employee?.fullName || "Unknown"}
                        </h3>
                        <p className="text-sm text-slate-400">
                          {r.employee?.designation || ""}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5 text-slate-300">
                    {departmentMap[r.employee?.department] || "--"}
                  </td>

                  <td className="px-6 py-5 text-slate-300">{fmtTime(r.checkIn)}</td>
                  <td className="px-6 py-5 text-slate-300">{fmtTime(r.checkOut)}</td>

                  <td className="px-6 py-5 text-cyan-400 font-semibold">
                    {r.hoursWorked ? `${r.hoursWorked.toFixed ? r.hoursWorked.toFixed(1) : r.hoursWorked}h` : "--"}
                  </td>

                  <td className="px-6 py-5">
                    <span className={`rounded-full px-4 py-2 text-sm font-semibold ${statusClass(r.status)}`}>
                      {r.status}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex flex-wrap justify-center gap-2">
                      {!r.checkIn && (
                        <button
                          onClick={() => onCheckIn(r)}
                          title="Check In"
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/20 text-green-400 transition hover:bg-green-500 hover:text-white"
                        >
                          <LogIn size={18} />
                        </button>
                      )}
                      {r.checkIn && !r.checkOut && (
                        <button
                          onClick={() => onCheckOut(r)}
                          title="Check Out"
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400 transition hover:bg-orange-500 hover:text-white"
                        >
                          <LogOut size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => onView(r)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 transition hover:bg-cyan-500 hover:text-white"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => onEdit(r)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/20 text-yellow-400 transition hover:bg-yellow-500 hover:text-white"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => onDelete(r)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20 text-red-400 transition hover:bg-red-500 hover:text-white"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-800 p-6 sm:flex-row">
        <p className="text-sm text-slate-400">
          Showing {start}–{end} of {total} records
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="rounded-xl bg-slate-800 px-4 py-2 text-white hover:bg-slate-700 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-white">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="rounded-xl bg-slate-800 px-4 py-2 text-white hover:bg-slate-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </motion.div>
  );
}
