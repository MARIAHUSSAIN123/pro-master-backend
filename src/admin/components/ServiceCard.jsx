import { motion } from "framer-motion";
import {
  Clock3,
  DollarSign,
  Users,
  Pencil,
  Trash2,
} from "lucide-react";

export default function ServiceCard({
  service = {
    name: "Deep House Cleaning",
    category: "Residential",
    duration: "4 Hours",
    price: "$180",
    employees: 4,
    status: "Active",
  },
  onEdit = () => {},
  onDelete = () => {},
}) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className="overflow-hidden rounded-3xl border border-slate-800 bg-[#111827] shadow-xl"
    >
      {/* Top */}

      <div className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 p-6">

        <div className="flex items-center justify-between">

          <div>

            <span className="rounded-full bg-white/20 px-3 py-1 text-xs text-white">

              {service.category}

            </span>

            <h2 className="mt-4 text-2xl font-bold text-white">

              {service.name}

            </h2>

          </div>

          <span
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              service.status === "Active"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {service.status}
          </span>

        </div>

      </div>

      {/* Body */}

      <div className="space-y-5 p-6">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-3">

            <Clock3
              size={20}
              className="text-cyan-400"
            />

            <span className="text-slate-300">

              Duration

            </span>

          </div>

          <span className="font-semibold text-white">

            {service.duration}

          </span>

        </div>

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-3">

            <DollarSign
              size={20}
              className="text-green-400"
            />

            <span className="text-slate-300">

              Price

            </span>

          </div>

          <span className="font-semibold text-green-400">

            {service.price}

          </span>

        </div>

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-3">

            <Users
              size={20}
              className="text-purple-400"
            />

            <span className="text-slate-300">

              Employees

            </span>

          </div>

          <span className="font-semibold text-white">

            {service.employees}

          </span>

        </div>

      </div>

      {/* Footer */}

      <div className="flex gap-4 border-t border-slate-800 p-5">

        <button
          onClick={onEdit}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-500 py-3 font-semibold text-white transition hover:bg-cyan-600"
        >
          <Pencil size={18} />
          Edit
        </button>

        <button
          onClick={onDelete}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 py-3 font-semibold text-white transition hover:bg-red-600"
        >
          <Trash2 size={18} />
          Delete
        </button>

      </div>

    </motion.div>
  );
}