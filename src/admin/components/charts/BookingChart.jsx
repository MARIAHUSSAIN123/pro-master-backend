import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";
import { motion } from "framer-motion";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

export default function BookingChart() {
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],

    datasets: [
      {
        label: "Bookings",

        data: [30, 45, 52, 38, 65, 74],

        backgroundColor: [
          "#06B6D4",
          "#0EA5E9",
          "#3B82F6",
          "#8B5CF6",
          "#10B981",
          "#F59E0B",
        ],

        borderRadius: 10,
      },
    ],
  };

  const options = {
    responsive: true,

    plugins: {
      legend: {
        labels: {
          color: "#fff",
        },
      },
    },

    scales: {
      x: {
        ticks: {
          color: "#94A3B8",
        },
      },

      y: {
        ticks: {
          color: "#94A3B8",
        },
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#111827] rounded-2xl p-6 border border-slate-800 shadow-xl"
    >
      <h2 className="text-2xl font-bold text-white mb-6">
        Monthly Bookings
      </h2>

      <Bar
        data={data}
        options={options}
      />
    </motion.div>
  );
}