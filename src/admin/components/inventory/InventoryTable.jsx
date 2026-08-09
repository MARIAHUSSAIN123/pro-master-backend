import { motion } from "framer-motion";
import { Search, PackagePlus, PackageMinus, UserCheck, Wrench, Pencil, Trash2 } from "lucide-react";

const statusClass = (status) =>
  ({
    Available: "bg-green-500/20 text-green-400",
    Assigned: "bg-cyan-500/20 text-cyan-400",
    "In Maintenance": "bg-yellow-500/20 text-yellow-400",
    Retired: "bg-slate-500/20 text-slate-400",
  }[status] || "bg-slate-500/20 text-slate-400");

export default function InventoryTable({
  items = [],
  loading,
  search,
  onSearchChange,
  itemType,
  onItemTypeChange,
  lowStockOnly,
  onLowStockToggle,
  onStockIn,
  onStockOut,
  onAssign,
  onMaintenance,
  onEdit,
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
          <h2 className="text-2xl font-bold text-white">Inventory Items</h2>
          <p className="mt-1 text-slate-400">Supplies, machinery, vehicles & PPE</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search item / SKU..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-56 rounded-2xl border border-slate-700 bg-slate-900 py-3 pl-12 pr-4 text-white outline-none focus:border-cyan-500"
            />
          </div>
          <select
            value={itemType}
            onChange={(e) => onItemTypeChange(e.target.value)}
            className="rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-white outline-none focus:border-cyan-500"
          >
            <option value="">All Types</option>
            {["Cleaning Supply", "Machinery", "Vehicle", "PPE", "Tool", "Other"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <button
            onClick={() => onLowStockToggle(!lowStockOnly)}
            className={`rounded-2xl border px-5 py-3 transition ${
              lowStockOnly
                ? "border-red-500 bg-red-500/20 text-red-300"
                : "border-slate-700 bg-slate-900 text-slate-300 hover:border-red-500"
            }`}
          >
            Low Stock Only
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-900">
            <tr>
              <th className="px-6 py-4 text-left text-sm text-slate-400">Item</th>
              <th className="px-6 py-4 text-left text-sm text-slate-400">Type</th>
              <th className="px-6 py-4 text-left text-sm text-slate-400">Stock</th>
              <th className="px-6 py-4 text-left text-sm text-slate-400">Location</th>
              <th className="px-6 py-4 text-left text-sm text-slate-400">Assigned To</th>
              <th className="px-6 py-4 text-left text-sm text-slate-400">Status</th>
              <th className="px-6 py-4 text-center text-sm text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-slate-400">
                  Loading inventory...
                </td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-slate-400">
                  No items found.
                </td>
              </tr>
            )}
            {!loading &&
              items.map((it) => {
                const low = it.quantity <= it.reorderThreshold;
                return (
                  <tr key={it._id} className="border-b border-slate-800 transition hover:bg-slate-900/60">
                    <td className="px-6 py-5">
                      <p className="font-semibold text-white">{it.itemName}</p>
                      {it.sku && <p className="text-sm text-slate-400">SKU: {it.sku}</p>}
                    </td>
                    <td className="px-6 py-5 text-slate-300">{it.itemType}</td>
                    <td className="px-6 py-5">
                      <span className={low ? "font-semibold text-red-400" : "text-slate-300"}>
                        {it.quantity} {it.unit}
                      </span>
                      {low && <p className="text-xs text-red-400">Below threshold ({it.reorderThreshold})</p>}
                    </td>
                    <td className="px-6 py-5 text-slate-300">{it.location}</td>
                    <td className="px-6 py-5 text-slate-300">{it.assignedTo?.fullName || "--"}</td>
                    <td className="px-6 py-5">
                      <span className={`rounded-full px-4 py-2 text-sm font-semibold ${statusClass(it.status)}`}>
                        {it.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap justify-center gap-2">
                        <button onClick={() => onStockIn(it)} title="Stock In" className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/20 text-green-400 transition hover:bg-green-500 hover:text-white">
                          <PackagePlus size={16} />
                        </button>
                        <button onClick={() => onStockOut(it)} title="Stock Out" className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20 text-red-400 transition hover:bg-red-500 hover:text-white">
                          <PackageMinus size={16} />
                        </button>
                        <button onClick={() => onAssign(it)} title="Assign" className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 transition hover:bg-cyan-500 hover:text-white">
                          <UserCheck size={16} />
                        </button>
                        <button onClick={() => onMaintenance(it)} title="Maintenance" className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/20 text-yellow-400 transition hover:bg-yellow-500 hover:text-white">
                          <Wrench size={16} />
                        </button>
                        <button onClick={() => onEdit(it)} title="Edit" className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 transition hover:bg-blue-500 hover:text-white">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => onDelete(it)} title="Delete" className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20 text-red-400 transition hover:bg-red-500 hover:text-white">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-800 p-6 sm:flex-row">
        <p className="text-sm text-slate-400">
          Showing {start}–{end} of {total} items
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
