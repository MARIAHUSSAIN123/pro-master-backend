import { motion } from "framer-motion";
import {
  Users,
  UserCheck,
  UserMinus,
  Wallet,
  TrendingUp,
} from "lucide-react";

const stats = [
  {
    title: "Total Employees",
    value: "48",
    icon: Users,
    gradient: "from-cyan-500 to-blue-600",
    glow: "shadow-cyan-500/20",
    change: "+8%",
  },
  {
    title: "Active Employees",
    value: "43",
    icon: UserCheck,
    gradient: "from-emerald-500 to-green-600",
    glow: "shadow-green-500/20",
    change: "+4%",
  },
  {
    title: "On Leave",
    value: "5",
    icon: UserMinus,
    gradient: "from-orange-500 to-red-500",
    glow: "shadow-orange-500/20",
    change: "-2%",
  },
  {
    title: "Monthly Payroll",
    value: "$48,250",
    icon: Wallet,
    gradient: "from-violet-500 to-indigo-600",
    glow: "shadow-violet-500/20",
    change: "+12%",
  },
];

export default function EmployeeStats() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((item, index) => {
        const Icon = item.icon;

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{
              y: -8,
              scale: 1.02,
            }}
            className={`relative overflow-hidden rounded-3xl border border-slate-800 bg-[#111827] p-6 shadow-xl transition-all duration-300 ${item.glow}`}
          >
            {/* Glow */}
            <div
              className={`absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-r ${item.gradient} opacity-10 blur-3xl`}
            ></div>

            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  {item.title}
                </p>

                <h2 className="mt-3 text-4xl font-bold text-white">
                  {item.value}
                </h2>

                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-400">
                  <TrendingUp size={14} />
                  {item.change} this month
                </div>
              </div>

              <div
                className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r ${item.gradient}`}
              >
                <Icon size={30} className="text-white" />
              </div>
            </div>

            <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${item.gradient}`}
                style={{
                  width:
                    index === 0
                      ? "90%"
                      : index === 1
                      ? "82%"
                      : index === 2
                      ? "35%"
                      : "95%",
                }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}