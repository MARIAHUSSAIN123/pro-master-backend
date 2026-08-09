import { motion } from "framer-motion";
import { DollarSign, CheckCircle2, XCircle, ShieldAlert, Wallet, TrendingUp } from "lucide-react";

const fmt = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);

export default function ReportStatsCards({ dashboard }) {
  if (!dashboard) return null;

  const cards = [
    {
      title: "Total Revenue",
      value: fmt(dashboard.billing?.totalRevenue),
      icon: DollarSign,
      gradient: "from-green-500 to-emerald-600",
    },
    {
      title: "Completion Rate",
      value: `${dashboard.bookingStatus?.completionRate ?? 0}%`,
      icon: CheckCircle2,
      gradient: "from-cyan-500 to-blue-600",
    },
    {
      title: "Cancellation Rate",
      value: `${dashboard.bookingStatus?.cancellationRate ?? 0}%`,
      icon: XCircle,
      gradient: "from-red-500 to-rose-600",
    },
    {
      title: "Non-Compliance Rate",
      value: `${dashboard.quality?.nonComplianceRate ?? 0}%`,
      icon: ShieldAlert,
      gradient: "from-yellow-400 to-orange-500",
    },
    {
      title: "Outstanding Amount",
      value: fmt(dashboard.billing?.outstandingAmount),
      icon: Wallet,
      gradient: "from-purple-500 to-pink-600",
    },
    {
      title: "Avg. Booking Value",
      value: fmt(dashboard.billing?.avgBookingValue),
      icon: TrendingUp,
      gradient: "from-indigo-500 to-blue-600",
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((item, index) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07 }}
            whileHover={{ y: -6, scale: 1.02 }}
            className="relative overflow-hidden rounded-3xl border border-slate-800 bg-[#111827] p-6 shadow-xl"
          >
            <div
              className={`absolute -right-14 -top-14 h-44 w-44 rounded-full bg-gradient-to-r ${item.gradient} opacity-20 blur-3xl`}
            ></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-widest text-slate-400">{item.title}</p>
                <h2 className="mt-3 text-3xl font-bold text-white">{item.value}</h2>
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
