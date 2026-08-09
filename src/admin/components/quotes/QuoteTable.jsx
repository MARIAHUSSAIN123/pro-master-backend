import { motion } from "framer-motion";
import { Search, Send, Repeat, Trash2 } from "lucide-react";

const fmt = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);

const statusClass = (status) =>
  ({
    Draft: "bg-slate-500/20 text-slate-300",
    Sent: "bg-blue-500/20 text-blue-400",
    Accepted: "bg-green-500/20 text-green-400",
    Rejected: "bg-red-500/20 text-red-400",
    Expired: "bg-orange-500/20 text-orange-400",
    Converted: "bg-purple-500/20 text-purple-400",
  }[status] || "bg-slate-500/20 text-slate-300");

export default function QuoteTable({
  quotes = [],
  loading,
  search,
  onSearchChange,
  status,
  onStatusChange,
  onSend,
  onConvert,
  onDelete,
  page = 1,
  pageSize = 8,
  total = 0,
  onPageChange,
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
      <div className="flex flex-col gap-4 border-b border-slate-800 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Quotes</h2>
          <p className="mt-1 text-slate-400">All quotes raised for customers</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search quote / customer..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-64 rounded-2xl border border-slate-700 bg-slate-900 py-3 pl-12 pr-4 text-white outline-none focus:border-cyan-500"
            />
          </div>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-white outline-none focus:border-cyan-500"
          >
            <option value="">All Status</option>
            {["Draft", "Sent", "Accepted", "Rejected", "Expired", "Converted"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-900">
            <tr>
              <th className="px-6 py-4 text-left text-sm text-slate-400">Quote #</th>
              <th className="px-6 py-4 text-left text-sm text-slate-400">Customer</th>
              <th className="px-6 py-4 text-left text-sm text-slate-400">Type</th>
              <th className="px-6 py-4 text-left text-sm text-slate-400">Valid Until</th>
              <th className="px-6 py-4 text-left text-sm text-slate-400">Total</th>
              <th className="px-6 py-4 text-left text-sm text-slate-400">Status</th>
              <th className="px-6 py-4 text-center text-sm text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-slate-400">
                  Loading quotes...
                </td>
              </tr>
            )}
            {!loading && quotes.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-slate-400">
                  No quotes found.
                </td>
              </tr>
            )}
            {!loading &&
              quotes.map((q) => (
                <tr key={q._id} className="border-b border-slate-800 transition hover:bg-slate-900/60">
                  <td className="px-6 py-5 font-semibold text-white">{q.quoteNumber}</td>
                  <td className="px-6 py-5 text-slate-300">{q.customer?.fullName || "--"}</td>
                  <td className="px-6 py-5 text-slate-300">
                    {q.intendedUse === "RecurringContract" ? "Recurring" : "One-Time"}
                  </td>
                  <td className="px-6 py-5 text-slate-300">
                    {q.validUntil ? new Date(q.validUntil).toLocaleDateString() : "--"}
                  </td>
                  <td className="px-6 py-5 text-cyan-400 font-semibold">{fmt(q.totalAmount)}</td>
                  <td className="px-6 py-5">
                    <span className={`rounded-full px-4 py-2 text-sm font-semibold ${statusClass(q.status)}`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center gap-2">
                      {q.status === "Draft" && (
                        <button
                          onClick={() => onSend(q)}
                          title="Send to customer"
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 transition hover:bg-blue-500 hover:text-white"
                        >
                          <Send size={16} />
                        </button>
                      )}
                      {q.status === "Accepted" && (
                        <button
                          onClick={() => onConvert(q)}
                          title="Convert"
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/20 text-green-400 transition hover:bg-green-500 hover:text-white"
                        >
                          <Repeat size={16} />
                        </button>
                      )}
                      {q.status !== "Converted" && (
                        <button
                          onClick={() => onDelete(q)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20 text-red-400 transition hover:bg-red-500 hover:text-white"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-800 p-6 sm:flex-row">
        <p className="text-sm text-slate-400">
          Showing {start}–{end} of {total} quotes
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
