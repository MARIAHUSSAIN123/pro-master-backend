import { motion } from "framer-motion";
import { FileSignature, Plus } from "lucide-react";

export default function QuoteHeader({ onAdd }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e293b] p-8 shadow-2xl"
    >
      <div className="absolute -top-28 -left-24 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl"></div>
      <div className="absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl"></div>

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-5 py-2 text-cyan-400">
            <FileSignature size={18} />
            Quotes
          </div>
          <h1 className="mt-5 text-4xl font-bold text-white lg:text-5xl">
            Quotes & Proposals
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-slate-400">
            Build quotes from the service catalog, send them to customers,
            and convert accepted ones into bookings or recurring contracts.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <button
            onClick={onAdd}
            className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 px-8 py-4 font-semibold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-cyan-500/30"
          >
            <Plus size={22} />
            New Quote
          </button>
        </div>
      </div>
    </motion.div>
  );
}
