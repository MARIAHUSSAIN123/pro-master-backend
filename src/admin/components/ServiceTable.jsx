import { motion } from "framer-motion";
import {
  Clock3,
  DollarSign,
  Users,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react";

const services = [
  {
    id: 1,
    name: "Deep House Cleaning",
    category: "Residential",
    duration: "4 Hours",
    price: "$180",
    employees: 4,
    status: "Active",
  },
  {
    id: 2,
    name: "Office Cleaning",
    category: "Commercial",
    duration: "6 Hours",
    price: "$350",
    employees: 8,
    status: "Active",
  },
  {
    id: 3,
    name: "Carpet Cleaning",
    category: "Special",
    duration: "2 Hours",
    price: "$120",
    employees: 2,
    status: "Inactive",
  },
  {
    id: 4,
    name: "Window Cleaning",
    category: "Residential",
    duration: "3 Hours",
    price: "$160",
    employees: 3,
    status: "Active",
  },
];

export default function ServiceTable() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-3xl border border-slate-800 bg-[#111827] shadow-xl"
    >
      {/* Header */}

      <div className="border-b border-slate-800 p-6">

        <h2 className="text-2xl font-bold text-white">
          Services List
        </h2>

        <p className="mt-2 text-slate-400">
          Manage all available cleaning services.
        </p>

      </div>

      {/* Table */}

      <div className="overflow-x-auto">

        <table className="min-w-full">

          <thead className="bg-slate-900">

            <tr>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                Service
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                Category
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                Duration
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                Price
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                Employees
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                Status
              </th>

              <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {services.map((service) => (

              <tr
                key={service.id}
                className="border-b border-slate-800 transition hover:bg-slate-900/50"
              >

                {/* Name */}

                <td className="px-6 py-5">

                  <h3 className="font-semibold text-white">
                    {service.name}
                  </h3>

                </td>

                {/* Category */}

                <td className="px-6 py-5">

                  <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-sm text-cyan-400">
                    {service.category}
                  </span>

                </td>

                {/* Duration */}

                <td className="px-6 py-5">

                  <div className="flex items-center gap-2 text-slate-300">

                    <Clock3 size={16} />

                    {service.duration}

                  </div>

                </td>

                {/* Price */}

                <td className="px-6 py-5">

                  <div className="flex items-center gap-2 font-semibold text-green-400">

                    <DollarSign size={16} />

                    {service.price}

                  </div>

                </td>

                {/* Employees */}

                <td className="px-6 py-5">

                  <div className="flex items-center gap-2 text-white">

                    <Users
                      size={16}
                      className="text-purple-400"
                    />

                    {service.employees}

                  </div>

                </td>

                {/* Status */}

                <td className="px-6 py-5">

                  <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${
                      service.status === "Active"
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {service.status}
                  </span>

                </td>

                {/* Actions */}

                <td className="px-6 py-5">

                  <div className="flex justify-center gap-3">

                    <button className="rounded-xl bg-blue-500 p-2 text-white transition hover:bg-blue-600">

                      <Eye size={18} />

                    </button>

                    <button className="rounded-xl bg-cyan-500 p-2 text-white transition hover:bg-cyan-600">

                      <Pencil size={18} />

                    </button>

                    <button className="rounded-xl bg-red-500 p-2 text-white transition hover:bg-red-600">

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