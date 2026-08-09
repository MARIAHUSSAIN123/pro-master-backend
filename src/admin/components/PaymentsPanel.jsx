import { motion } from "framer-motion";
import { Receipt } from "lucide-react";

const fmt = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);

const statusClass = (status) =>
  status === "Completed"
    ? "bg-green-500/20 text-green-400"
    : status === "Refunded"
    ? "bg-purple-500/20 text-purple-400"
    : status === "Failed"
    ? "bg-red-500/20 text-red-400"
    : "bg-yellow-500/20 text-yellow-400";

export default function PaymentsPanel({ payments = [], loading }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="overflow-hidden rounded-3xl border border-slate-800 bg-[#111827] shadow-xl"
    >
      <div className="flex items-center gap-4 border-b border-slate-800 p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
          <Receipt size={22} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Recent Payments</h2>
          <p className="mt-1 text-slate-400">Payments recorded against invoices</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-900">
            <tr>
              <th className="px-6 py-4 text-left text-sm text-slate-400">Payment #</th>
              <th className="px-6 py-4 text-left text-sm text-slate-400">Customer</th>
              <th className="px-6 py-4 text-left text-sm text-slate-400">Method</th>
              <th className="px-6 py-4 text-left text-sm text-slate-400">Amount</th>
              <th className="px-6 py-4 text-left text-sm text-slate-400">Status</th>
              <th className="px-6 py-4 text-left text-sm text-slate-400">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                  Loading payments...
                </td>
              </tr>
            )}
            {!loading && payments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                  No payments recorded yet.
                </td>
              </tr>
            )}
            {!loading &&
              payments.slice(0, 10).map((p) => (
                <tr key={p._id} className="border-b border-slate-800 transition hover:bg-slate-900/60">
                  <td className="px-6 py-4 font-semibold text-white">{p.paymentNumber}</td>
                  <td className="px-6 py-4 text-slate-300">{p.customer?.fullName || "--"}</td>
                  <td className="px-6 py-4 text-slate-300">{p.paymentMethod}</td>
                  <td className="px-6 py-4 text-cyan-400 font-semibold">{fmt(p.amount)}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusClass(p.paymentStatus)}`}>
                      {p.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "--"}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
