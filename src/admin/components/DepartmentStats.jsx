import { motion } from "framer-motion";
import {
  Building2,
  Users,
  UserCheck,
  Activity,
} from "lucide-react";

const stats = [
  {
    title: "Departments",
    value: "12",
    subtitle: "Active Departments",
    icon: Building2,
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    title: "Employees",
    value: "86",
    subtitle: "Working Employees",
    icon: Users,
    gradient: "from-green-500 to-emerald-600",
  },
  {
    title: "Managers",
    value: "12",
    subtitle: "Department Heads",
    icon: UserCheck,
    gradient: "from-violet-500 to-indigo-600",
  },
  {
    title: "Performance",
    value: "98%",
    subtitle: "Overall Efficiency",
    icon: Activity,
    gradient: "from-orange-500 to-red-500",
  },
];

export default function DepartmentStats() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">

      {stats.map((item, index) => {
        const Icon = item.icon;

        return (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: index * 0.1,
            }}
            whileHover={{
              y: -8,
              scale: 1.02,
            }}
            className="relative overflow-hidden rounded-3xl border border-slate-800 bg-[#111827] p-6 shadow-xl"
          >
            {/* Background Glow */}

            <div
              className={`absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-r ${item.gradient} opacity-20 blur-3xl`}
            ></div>

            <div className="relative flex items-center justify-between">

              <div>

                <p className="text-sm uppercase tracking-wider text-slate-400">
                  {item.title}
                </p>

                <h2 className="mt-3 text-4xl font-bold text-white">
                  {item.value}
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  {item.subtitle}
                </p>

              </div>

              <div
                className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r ${item.gradient} shadow-lg`}
              >
                <Icon
                  size={30}
                  className="text-white"
                />
              </div>

            </div>

          </motion.div>
        );
      })}

    </div>
  );
}