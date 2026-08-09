import { motion } from "framer-motion";
import { Clock3, DollarSign, Star, Pencil, Trash2, Users } from "lucide-react";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800";

export default function ServiceGrid({
  services = [],
  loading = false,
  loadError = "",
  onEdit,
  onDelete,
}) {
  if (loading) {
    return <div className="py-16 text-center text-slate-400">Loading services...</div>;
  }

  if (loadError) {
    return <div className="py-16 text-center text-red-400">{loadError}</div>;
  }

  if (services.length === 0) {
    return <div className="py-16 text-center text-slate-500">No services found.</div>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {services.map((service) => (
        <motion.div
          key={service._id}
          whileHover={{ y: -8 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden rounded-3xl border border-slate-800 bg-[#111827] shadow-2xl"
        >
          <div className="relative h-56 overflow-hidden">
            <img
              src={service.image || FALLBACK_IMAGE}
              alt={service.serviceName}
              className="h-full w-full object-cover transition duration-500 hover:scale-110"
            />

            <div className="absolute top-4 left-4 rounded-full bg-cyan-500 px-4 py-1 text-xs font-semibold text-white">
              {service.category}
            </div>

            {service.featured && (
              <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-yellow-500 px-3 py-1 text-xs font-semibold text-white">
                <Star size={14} fill="white" />
                Featured
              </div>
            )}
          </div>

          <div className="space-y-5 p-6">
            <div>
              <h2 className="text-2xl font-bold text-white">{service.serviceName}</h2>
              <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                {service.department?.departmentName || "No Department"}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">{service.description}</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-400">
                <DollarSign size={18} />
                <span className="text-lg font-bold">${service.price}</span>
              </div>

              <div className="flex items-center gap-2 text-slate-300">
                <Clock3 size={18} />
                {service.duration}
              </div>

              <div className="flex items-center gap-2 text-slate-300">
                <Users size={18} />
                {service.employeesRequired}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span
                className={`rounded-full px-4 py-1 text-sm font-semibold ${
                  service.status === "Active"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {service.status}
              </span>

              <div className="flex gap-3">
                <button
                  onClick={() => onEdit?.(service)}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 transition hover:bg-cyan-500 hover:text-white"
                >
                  <Pencil size={18} />
                </button>

                <button
                  onClick={() => onDelete?.(service)}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/20 text-red-400 transition hover:bg-red-500 hover:text-white"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
