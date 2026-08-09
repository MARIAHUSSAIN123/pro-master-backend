import { motion } from "framer-motion";
import {
  CreditCard,
  BadgeCheck,
  Clock3,
  CircleDollarSign,
} from "lucide-react";

const payments = [
  {
    customer: "John Smith",
    amount: "$450",
    method: "Visa",
    status: "Paid",
  },
  {
    customer: "Sarah Wilson",
    amount: "$220",
    method: "Cash",
    status: "Pending",
  },
  {
    customer: "David Brown",
    amount: "$790",
    method: "Bank Transfer",
    status: "Paid",
  },
];

export default function RecentPayments() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-[#111827] border border-slate-800 rounded-3xl p-6 shadow-xl"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white text-2xl font-bold">
          Recent Payments
        </h2>

        <CreditCard className="text-cyan-400" size={26} />
      </div>

      <div className="space-y-5">

        {payments.map((payment, index) => (

          <div
            key={index}
            className="flex justify-between items-center bg-slate-900 rounded-2xl p-4 hover:bg-slate-800 duration-300"
          >

            <div>

              <h3 className="text-white font-semibold">
                {payment.customer}
              </h3>

              <p className="text-slate-400 text-sm">
                {payment.method}
              </p>

            </div>

            <div className="text-right">

              <p className="text-cyan-400 font-bold text-lg">
                {payment.amount}
              </p>

              <span
                className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full mt-2 ${
                  payment.status === "Paid"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-yellow-500/20 text-yellow-300"
                }`}
              >
                {payment.status === "Paid" ? (
                  <BadgeCheck size={14} />
                ) : (
                  <Clock3 size={14} />
                )}

                {payment.status}
              </span>

            </div>

          </div>

        ))}

      </div>

      <div className="mt-6 flex justify-between border-t border-slate-800 pt-4">

        <span className="text-slate-400">
          Total Collected
        </span>

        <span className="text-green-400 font-bold flex items-center gap-2">
          <CircleDollarSign size={18} />
          $1,460
        </span>

      </div>

    </motion.div>
  );
}