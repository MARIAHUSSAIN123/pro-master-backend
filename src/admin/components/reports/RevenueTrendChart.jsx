import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { motion } from "framer-motion";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend);

const MONTHS = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function RevenueTrendChart({ revenueTrend = [] }) {
  const labels = revenueTrend.map((r) => `${MONTHS[r.month]} ${r.year}`);
  const data = {
    labels,
    datasets: [
      {
        label: "Revenue Collected ($)",
        data: revenueTrend.map((r) => r.revenue),
        backgroundColor: "#06B6D4",
        borderRadius: 10,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { labels: { color: "#fff" } },
    },
    scales: {
      x: { ticks: { color: "#94A3B8" }, grid: { color: "#1e293b" } },
      y: { ticks: { color: "#94A3B8" }, grid: { color: "#1e293b" } },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-slate-800 bg-[#111827] p-6 shadow-xl"
    >
      <h2 className="mb-6 text-2xl font-bold text-white">Revenue Trend (last 6 months)</h2>
      {revenueTrend.length === 0 ? (
        <p className="text-slate-400">No collected payments in this period yet.</p>
      ) : (
        <Bar data={data} options={options} />
      )}
    </motion.div>
  );
}
