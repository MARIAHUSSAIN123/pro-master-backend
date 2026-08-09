import { motion } from "framer-motion";
import { Clock3, BadgeCheck, CheckCircle2, XCircle, TrendingUp } from "lucide-react";

export default function BookingStats({ statistics, loading }) {
  const stats = [
    {
      title: "Pending",
      value: statistics?.pending ?? 0,
      icon: Clock3,
      color: "from-amber-400 via-orange-500 to-red-500",
      glow: "shadow-orange-500/20",
    },
    {
      title: "Confirmed / Assigned",
      value: (statistics?.confirmed ?? 0) + (statistics?.assigned ?? 0),
      icon: BadgeCheck,
      color: "from-cyan-400 via-blue-500 to-indigo-600",
      glow: "shadow-cyan-500/20",
    },
    {
      title: "Completed",
      value: statistics?.completed ?? 0,
      icon: CheckCircle2,
      color: "from-emerald-400 via-green-500 to-teal-600",
      glow: "shadow-green-500/20",
    },
    {
      title: "Cancelled",
      value: statistics?.cancelled ?? 0,
      icon: XCircle,
      color: "from-rose-500 via-red-500 to-pink-600",
      glow: "shadow-red-500/20",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((item, index) => {
        const Icon = item.icon;

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.45 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className={`relative overflow-hidden rounded-3xl border border-slate-800 bg-[#0f172a] p-6 shadow-2xl ${item.glow} transition-all`}
          >
            <div
              className={`absolute -top-10 -right-10 h-40 w-40 rounded-full bg-gradient-to-br ${item.color} opacity-20 blur-3xl`}
            />

            <div
              className={`mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r ${item.color} shadow-xl`}
            >
              <Icon className="text-white" size={30} />
            </div>

            <p className="text-slate-400 text-sm tracking-wide uppercase">{item.title}</p>

            <h2 className="mt-2 text-5xl font-extrabold text-white">
              {loading ? "…" : item.value}
            </h2>

            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <TrendingUp size={18} />
                {statistics?.totalBookings ?? 0} Total
              </div>
              <span className="text-slate-500 text-sm">All Time</span>
            </div>

            <div className={`mt-6 h-1 rounded-full bg-gradient-to-r ${item.color}`} />
          </motion.div>
        );
      })}
    </div>
  );
}
