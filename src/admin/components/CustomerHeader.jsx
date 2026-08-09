import { Users, Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function CustomerHeader({ total = 0, onAdd }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col lg:flex-row justify-between items-center gap-5"
    >
      <div>
        <h1 className="text-4xl font-bold text-white">
          Customers
        </h1>

        <p className="text-slate-400 mt-2">
          Manage all customer information.
        </p>
      </div>

      <div className="flex gap-4">
        <div className="bg-[#111827] border border-slate-800 rounded-xl px-5 py-3 flex items-center gap-3">
          <Users className="text-cyan-400" />

          <div>
            <p className="text-slate-400 text-sm">
              Total Customers
            </p>

            <h2 className="text-white text-xl font-bold">
              {total}
            </h2>
          </div>
        </div>

        <button
          onClick={onAdd}
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 px-5 rounded-xl text-white font-semibold hover:scale-105 duration-300"
        >
          <Plus size={20} />
          Add Customer
        </button>
      </div>
    </motion.div>
  );
}
