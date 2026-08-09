import { motion } from "framer-motion";
import {
  User,
  Pencil,
  Trash2,
} from "lucide-react";

export default function DepartmentGrid({
  departments,
  loading,
  loadError,
  onEdit,
  onDelete,
}) {
  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-[#111827] p-12 text-center text-slate-400">
        Loading departments...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-12 text-center text-red-400">
        {loadError}
      </div>
    );
  }

  if (!departments || departments.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-[#111827] p-12 text-center text-slate-400">
        No departments yet. Click "Add Department" to create the first one.
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {departments.map((dept, index) => (
        <motion.div
          key={dept._id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ y: -8, scale: 1.02 }}
          className="relative overflow-hidden rounded-3xl border border-slate-800 bg-[#111827] p-6 shadow-xl"
        >
          {/* Glow */}

          <div
            className="absolute -right-20 -top-20 h-44 w-44 rounded-full opacity-10 blur-3xl"
            style={{ backgroundColor: dept.color || "#06b6d4" }}
          ></div>

          {/* Top */}

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: dept.color || "#06b6d4" }}
                ></span>
                <h2 className="text-2xl font-bold text-white">
                  {dept.departmentName}
                </h2>
              </div>

              <p className="mt-1 text-slate-400">
                {dept.description || "No description"}
              </p>
            </div>

            <span
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                dept.status === "Active"
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {dept.status}
            </span>
          </div>

          {/* Info */}

          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3 text-slate-300">
              <User size={18} className="text-cyan-400" />
              {dept.manager?.fullName || "No manager assigned"}
            </div>
          </div>

          {/* Buttons */}

          <div className="mt-8 flex gap-3">
            <button
              onClick={() => onEdit(dept)}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/20 text-yellow-400 transition hover:bg-yellow-500 hover:text-white"
            >
              <Pencil size={18} />
            </button>

            <button
              onClick={() => onDelete(dept)}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/20 text-red-400 transition hover:bg-red-500 hover:text-white"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
