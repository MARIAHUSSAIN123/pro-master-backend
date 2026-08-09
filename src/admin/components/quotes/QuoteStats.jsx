import { motion } from "framer-motion";
import { FileText, Send, CheckCircle2, Repeat } from "lucide-react";

export default function QuoteStats({ stats }) {
  const cards = [
    {
      title: "Total Quotes",
      value: stats?.totalQuotes ?? 0,
      icon: FileText,
      gradient: "from-cyan-500 to-blue-600",
    },
    {
      title: "Sent (Awaiting)",
      value: stats?.sentQuotes ?? 0,
      icon: Send,
      gradient: "from-yellow-400 to-orange-500",
    },
    {
      title: "Acceptance Rate",
      value: `${stats?.acceptanceRate ?? 0}%`,
      icon: CheckCircle2,
      gradient: "from-green-500 to-emerald-600",
    },
    {
      title: "Converted",
      value: stats?.convertedQuotes ?? 0,
      icon: Repeat,
      gradient: "from-purple-500 to-pink-600",
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((item, index) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="relative overflow-hidden rounded-3xl border border-slate-800 bg-[#111827] p-6 shadow-xl"
          >
            <div
              className={`absolute -right-14 -top-14 h-44 w-44 rounded-full bg-gradient-to-r ${item.gradient} opacity-20 blur-3xl`}
            ></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-widest text-slate-400">{item.title}</p>
                <h2 className="mt-3 text-4xl font-bold text-white">{item.value}</h2>
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
