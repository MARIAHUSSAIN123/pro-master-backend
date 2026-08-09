import { motion } from "framer-motion";

const bookings = [
  {
    customer: "John Smith",
    service: "House Cleaning",
    employee: "Ali Khan",
    status: "Completed",
  },
  {
    customer: "Sarah Wilson",
    service: "Office Cleaning",
    employee: "Ahmed Ali",
    status: "Pending",
  },
  {
    customer: "David Brown",
    service: "Deep Cleaning",
    employee: "Usman",
    status: "Confirmed",
  },
];

export default function RecentBookings() {
  const getStatusClass = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-500/20 text-green-400";

      case "Pending":
        return "bg-yellow-500/20 text-yellow-400";

      case "Confirmed":
        return "bg-cyan-500/20 text-cyan-400";

      default:
        return "bg-slate-500/20 text-slate-300";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[#111827] rounded-3xl p-8 shadow-2xl border border-slate-800 w-full"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">
          Recent Bookings
        </h2>

        <button className="text-cyan-400 hover:text-cyan-300 transition">
          View All
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl">
        <table className="w-full min-w-[800px]">
          <thead className="bg-slate-800">
            <tr>
              <th className="px-6 py-4 text-left text-slate-300 font-semibold">
                Customer
              </th>

              <th className="px-6 py-4 text-left text-slate-300 font-semibold">
                Service
              </th>

              <th className="px-6 py-4 text-left text-slate-300 font-semibold">
                Employee
              </th>

              <th className="px-6 py-4 text-left text-slate-300 font-semibold">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {bookings.map((item, index) => (
              <tr
                key={index}
                className="border-b border-slate-800 hover:bg-slate-800/60 transition-all duration-300"
              >
                <td className="px-6 py-5 text-white font-medium">
                  {item.customer}
                </td>

                <td className="px-6 py-5 text-slate-300">
                  {item.service}
                </td>

                <td className="px-6 py-5 text-slate-300">
                  {item.employee}
                </td>

                <td className="px-6 py-5">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusClass(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}