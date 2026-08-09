import { motion } from "framer-motion";
import { Trophy } from "lucide-react";

const fmt = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);

export default function AgentProductivityTable({ agents = [] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-3xl border border-slate-800 bg-[#111827] shadow-xl"
    >
      <div className="flex items-center gap-4 border-b border-slate-800 p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
          <Trophy size={22} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Agent Productivity</h2>
          <p className="mt-1 text-slate-400">Top performing employees by completed jobs</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-900">
            <tr>
              <th className="px-6 py-4 text-left text-sm text-slate-400">Employee</th>
              <th className="px-6 py-4 text-left text-sm text-slate-400">Assigned</th>
              <th className="px-6 py-4 text-left text-sm text-slate-400">Completed</th>
              <th className="px-6 py-4 text-left text-sm text-slate-400">Completion Rate</th>
              <th className="px-6 py-4 text-left text-sm text-slate-400">Revenue Generated</th>
            </tr>
          </thead>
          <tbody>
            {agents.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                  No assigned bookings yet.
                </td>
              </tr>
            )}
            {agents.map((a) => (
              <tr key={a.employeeId} className="border-b border-slate-800 transition hover:bg-slate-900/60">
                <td className="px-6 py-4">
                  <p className="font-semibold text-white">{a.fullName}</p>
                  <p className="text-sm text-slate-400">{a.designation}</p>
                </td>
                <td className="px-6 py-4 text-slate-300">{a.totalAssigned}</td>
                <td className="px-6 py-4 text-slate-300">{a.completedJobs}</td>
                <td className="px-6 py-4 text-cyan-400 font-semibold">{a.completionRate}%</td>
                <td className="px-6 py-4 text-green-400 font-semibold">{fmt(a.revenueGenerated)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
