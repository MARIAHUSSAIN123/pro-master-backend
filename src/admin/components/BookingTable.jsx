import { motion } from "framer-motion";
import { Pencil, Trash2, CalendarDays, DollarSign, User } from "lucide-react";
import { useState } from "react";

const STATUS_OPTIONS = [
  "Pending",
  "Confirmed",
  "Assigned",
  "In Progress",
  "Completed",
  "Approved",
  "In Dispute",
  "Cancelled",
];

const PAYMENT_OPTIONS = ["Pending", "Partially Paid", "Paid", "Refunded"];

const statusColor = (status) => {
  switch (status) {
    case "Completed":
    case "Approved":
      return "bg-green-500/20 text-green-400";
    case "Confirmed":
    case "Assigned":
      return "bg-blue-500/20 text-blue-400";
    case "Pending":
      return "bg-orange-500/20 text-orange-400";
    case "In Progress":
      return "bg-cyan-500/20 text-cyan-400";
    default:
      return "bg-red-500/20 text-red-400";
  }
};

const paymentColor = (status) =>
  status === "Paid"
    ? "bg-emerald-500/20 text-emerald-400"
    : status === "Refunded"
    ? "bg-slate-500/20 text-slate-300"
    : "bg-yellow-500/20 text-yellow-400";

export default function BookingTable({
  bookings = [],
  loading = false,
  loadError = "",
  onEdit,
  onDelete,
  onStatusChange,
  onPaymentChange,
}) {
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(bookings.length / pageSize));
  const pageItems = bookings.slice((page - 1) * pageSize, page * pageSize);

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border border-slate-800 bg-[#0f172a] shadow-2xl"
    >
      <div className="absolute -top-32 left-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl"></div>
      <div className="absolute -bottom-32 right-20 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl"></div>

      <div className="relative p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white">Recent Bookings</h2>
            <p className="mt-2 text-slate-400">Manage and monitor all customer bookings.</p>
          </div>
          <span className="rounded-full bg-cyan-500/20 px-4 py-2 text-cyan-400">
            {bookings.length} Records
          </span>
        </div>

        {loading && (
          <div className="py-16 text-center text-slate-400">Loading bookings...</div>
        )}

        {!loading && loadError && (
          <div className="py-16 text-center text-red-400">{loadError}</div>
        )}

        {!loading && !loadError && bookings.length === 0 && (
          <div className="py-16 text-center text-slate-500">No bookings found.</div>
        )}

        {!loading && !loadError && bookings.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="pb-5 text-left text-slate-400">Customer</th>
                    <th className="pb-5 text-left text-slate-400">Service</th>
                    <th className="pb-5 text-left text-slate-400">Employees</th>
                    <th className="pb-5 text-left text-slate-400">Schedule</th>
                    <th className="pb-5 text-left text-slate-400">Amount</th>
                    <th className="pb-5 text-left text-slate-400">Payment</th>
                    <th className="pb-5 text-left text-slate-400">Status</th>
                    <th className="pb-5 text-center text-slate-400">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {pageItems.map((item) => (
                    <tr
                      key={item._id}
                      className="border-b border-slate-800 transition hover:bg-slate-900/60"
                    >
                      <td className="py-5">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-white">
                            {item.customer?.fullName?.charAt(0) || "?"}
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">
                              {item.customer?.fullName || "Unknown"}
                            </h3>
                            <p className="text-sm text-slate-500">{item.bookingNumber}</p>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="rounded-full bg-cyan-500/15 px-4 py-2 text-cyan-400">
                          {item.service?.serviceName || "—"}
                        </span>
                      </td>

                      <td>
                        <div className="flex items-center gap-2 text-slate-300">
                          <User size={16} />
                          {item.assignedEmployees?.length
                            ? item.assignedEmployees.map((e) => e.fullName).join(", ")
                            : "Unassigned"}
                        </div>
                      </td>

                      <td>
                        <div className="flex items-center gap-2 text-slate-300">
                          <CalendarDays size={16} />
                          <div>
                            <div>
                              {item.bookingDate
                                ? new Date(item.bookingDate).toLocaleDateString()
                                : "—"}
                            </div>
                            <div className="text-xs text-slate-500">{item.bookingTime}</div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="flex items-center gap-2 font-semibold text-green-400">
                          <DollarSign size={16} />
                          {item.totalAmount}
                        </div>
                      </td>

                      <td>
                        <select
                          value={item.paymentStatus}
                          onChange={(e) => onPaymentChange?.(item, e.target.value)}
                          className={`rounded-full border-none px-3 py-2 text-sm font-medium outline-none ${paymentColor(
                            item.paymentStatus
                          )}`}
                        >
                          {PAYMENT_OPTIONS.map((opt) => (
                            <option key={opt} value={opt} className="bg-slate-900 text-white">
                              {opt}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td>
                        <select
                          value={item.status}
                          onChange={(e) => onStatusChange?.(item, e.target.value)}
                          className={`rounded-full border-none px-3 py-2 text-sm font-medium outline-none ${statusColor(
                            item.status
                          )}`}
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt} value={opt} className="bg-slate-900 text-white">
                              {opt}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td>
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => onEdit?.(item)}
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 transition hover:scale-110 hover:bg-blue-500 hover:text-white"
                          >
                            <Pencil size={18} />
                          </button>

                          <button
                            onClick={() => onDelete?.(item)}
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20 text-red-400 transition hover:scale-110 hover:bg-red-500 hover:text-white"
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

            <div className="mt-8 flex items-center justify-between">
              <p className="text-slate-500">
                Showing {(page - 1) * pageSize + 1}-
                {Math.min(page * pageSize, bookings.length)} of {bookings.length} bookings
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-xl border border-slate-700 px-5 py-2 text-slate-300 hover:border-cyan-500 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 font-semibold text-white disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
