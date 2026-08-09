import { motion } from "framer-motion";
import {
  Search,
  Pencil,
  Trash2,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export default function CustomerTable({
  customers = [],
  loading = false,
  loadError = "",
  search = "",
  onSearchChange,
  onEdit,
  onDelete,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#111827] rounded-3xl border border-slate-800 shadow-2xl p-6"
    >
      {/* Header */}

      <div className="flex flex-col lg:flex-row justify-between items-center gap-5 mb-8">
        <h2 className="text-2xl font-bold text-white">
          Customer List
        </h2>

        <div className="relative w-full lg:w-80">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search customer..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white outline-none focus:border-cyan-500 transition"
          />
        </div>
      </div>

      {/* Table */}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-4 text-slate-400">Customer</th>
              <th className="text-left py-4 text-slate-400">Email</th>
              <th className="text-left py-4 text-slate-400">Phone</th>
              <th className="text-left py-4 text-slate-400">Address</th>
              <th className="text-left py-4 text-slate-400">Status</th>
              <th className="text-center py-4 text-slate-400">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-400">
                  Loading customers...
                </td>
              </tr>
            )}

            {!loading && loadError && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-red-400">
                  {loadError}
                </td>
              </tr>
            )}

            {!loading && !loadError && customers.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-400">
                  No customers found.
                </td>
              </tr>
            )}

            {!loading &&
              !loadError &&
              customers.map((customer) => (
                <tr
                  key={customer._id}
                  className="border-b border-slate-800 hover:bg-slate-900 transition-all duration-300"
                >
                  <td className="py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                        {customer.fullName?.charAt(0)?.toUpperCase() || "?"}
                      </div>

                      <div>
                        <h3 className="text-white font-semibold">
                          {customer.fullName}
                        </h3>

                        <p className="text-slate-500 text-sm">
                          {customer.customerType || "Customer"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Mail size={16} />
                      {customer.email}
                    </div>
                  </td>

                  <td>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Phone size={16} />
                      {customer.phone}
                    </div>
                  </td>

                  <td>
                    <div className="flex items-center gap-2 text-slate-300">
                      <MapPin size={16} />
                      {[customer.city, customer.province].filter(Boolean).join(", ") ||
                        customer.address}
                    </div>
                  </td>

                  <td>
                    <span
                      className={`px-4 py-1 rounded-full text-sm font-semibold ${
                        customer.isActive
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {customer.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td>
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => onEdit?.(customer)}
                        className="w-10 h-10 rounded-xl bg-cyan-500/20 hover:bg-cyan-500 text-cyan-400 hover:text-white transition flex items-center justify-center"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        onClick={() => onDelete?.(customer)}
                        className="w-10 h-10 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white transition flex items-center justify-center"
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
    </motion.div>
  );
}
