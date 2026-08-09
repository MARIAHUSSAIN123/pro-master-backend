import { motion } from "framer-motion";
import { Wrench, Star, BadgeCheck, DollarSign } from "lucide-react";

export default function ServiceStats({ services = [], loading }) {
  const total = services.length;
  const featured = services.filter((s) => s.featured).length;
  const active = services.filter((s) => s.status === "Active").length;
  const avgPrice = total
    ? Math.round(services.reduce((sum, s) => sum + (s.price || 0), 0) / total)
    : 0;

  const stats = [
    { title: "Total Services", value: total, icon: Wrench, gradient: "from-cyan-500 to-blue-600" },
    { title: "Featured", value: featured, icon: Star, gradient: "from-yellow-400 to-orange-500" },
    { title: "Active", value: active, icon: BadgeCheck, gradient: "from-green-500 to-emerald-600" },
    { title: "Average Price", value: `$${avgPrice}`, icon: DollarSign, gradient: "from-purple-500 to-pink-600" },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((item, index) => {
        const Icon = item.icon;

        return (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -6, scale: 1.02 }}
            className="relative overflow-hidden rounded-3xl border border-slate-800 bg-[#111827] p-6 shadow-xl"
          >
            <div
              className={`absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-r ${item.gradient} opacity-20 blur-3xl`}
            ></div>

            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-wider text-slate-400">{item.title}</p>
                <h2 className="mt-3 text-4xl font-bold text-white">
                  {loading ? "…" : item.value}
                </h2>
              </div>

              <div
                className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r ${item.gradient} text-white shadow-lg`}
              >
                <Icon size={30} />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
