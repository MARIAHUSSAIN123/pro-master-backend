import { motion } from "framer-motion";
import { DollarSign, FileClock, FileCheck2, Undo2 } from "lucide-react";

const fmt = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);

export default function AccountingStats({ revenue, invoiceStats }) {
  const cards = [
    {
      title: "Total Revenue",
      value: fmt(revenue),
      icon: DollarSign,
      gradient: "from-green-500 to-emerald-600",
    },
    {
      title: "Pending Invoices",
      value: invoiceStats?.pendingInvoices ?? 0,
      icon: FileClock,
      gradient: "from-yellow-400 to-orange-500",
    },
    {
      title: "Paid Invoices",
      value: invoiceStats?.paidInvoices ?? 0,
      icon: FileCheck2,
      gradient: "from-cyan-500 to-blue-600",
    },
    {
      title: "Refunded Invoices",
      value: invoiceStats?.refundedInvoices ?? 0,
      icon: Undo2,
      gradient: "from-red-500 to-rose-600",
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
