import { motion } from "framer-motion";

export default function DashboardCard({
  title,
  value,
  icon: Icon,
  gradient,
}) {
  return (
    <motion.div
      whileHover={{
        y: -6,
        scale: 1.02,
      }}
      transition={{ duration: 0.25 }}
      className="relative overflow-hidden rounded-3xl border border-slate-800 bg-[#111827] p-6 shadow-xl"
    >
      {/* Glow */}

      <div
        className={`absolute -right-10 -top-10 h-36 w-36 rounded-full opacity-20 blur-3xl ${gradient}`}
      />

      <div className="relative flex items-center justify-between">

        <div className="min-w-0">

          <p className="text-sm uppercase tracking-wider text-slate-400">
            {title}
          </p>

          <h2 className="mt-3 break-words text-3xl font-bold text-white sm:text-4xl">
            {value}
          </h2>

        </div>

        <div
          className={`flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-lg ${gradient}`}
        >
          <Icon size={30} />
        </div>

      </div>

    </motion.div>
  );
}