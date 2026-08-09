import { motion } from "framer-motion";
import { Trophy, Star } from "lucide-react";

const employees = [
  {
    name: "Ali Khan",
    jobs: 42,
    rating: 4.9,
  },
  {
    name: "Ahmed Ali",
    jobs: 37,
    rating: 4.8,
  },
  {
    name: "Usman",
    jobs: 31,
    rating: 4.7,
  },
];

export default function TopEmployees() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-[#111827] border border-slate-800 rounded-3xl p-6 shadow-xl"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-white text-2xl font-bold">
          Top Employees
        </h2>

        <Trophy className="text-yellow-400" />
      </div>

      <div className="space-y-5">

        {employees.map((employee, index) => (

          <div
            key={index}
            className="flex justify-between items-center bg-slate-900 rounded-xl p-4 hover:bg-slate-800 duration-300"
          >

            <div>

              <h3 className="text-white font-semibold">
                {employee.name}
              </h3>

              <p className="text-slate-400 text-sm">
                {employee.jobs} Completed Jobs
              </p>

            </div>

            <div className="flex items-center gap-1 text-yellow-400">

              <Star size={16} fill="currentColor" />

              {employee.rating}

            </div>

          </div>

        ))}

      </div>
    </motion.div>
  );
}