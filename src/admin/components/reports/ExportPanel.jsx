import { motion } from "framer-motion";
import { FileText, FileSpreadsheet, FileDown } from "lucide-react";

export default function ExportPanel({
  onBookingsCSV,
  onBookingsExcel,
  onBookingsPDF,
  onInvoicesCSV,
  onInvoicesExcel,
  onInvoicesPDF,
}) {
  const Row = ({ title, onCSV, onExcel, onPDF }) => (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="font-semibold text-white">{title}</p>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onCSV}
          className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-500 hover:text-white"
        >
          <FileText size={16} /> CSV
        </button>
        <button
          onClick={onExcel}
          className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-500 hover:text-white"
        >
          <FileSpreadsheet size={16} /> Excel
        </button>
        <button
          onClick={onPDF}
          className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-500 hover:text-white"
        >
          <FileDown size={16} /> PDF
        </button>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-slate-800 bg-[#111827] p-6 shadow-xl"
    >
      <h2 className="mb-6 text-2xl font-bold text-white">Export Data</h2>
      <div className="space-y-4">
        <Row title="Bookings" onCSV={onBookingsCSV} onExcel={onBookingsExcel} onPDF={onBookingsPDF} />
        <Row title="Invoices" onCSV={onInvoicesCSV} onExcel={onInvoicesExcel} onPDF={onInvoicesPDF} />
      </div>
    </motion.div>
  );
}
