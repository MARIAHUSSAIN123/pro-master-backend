import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Repeat, CalendarDays, Clock3, MapPin, Hash } from "lucide-react";

export default function ConvertQuoteModal({ open, onClose, onConvert, quote, saving }) {
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [address, setAddress] = useState("");
  const [contractNumber, setContractNumber] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [billingCycle, setBillingCycle] = useState("Monthly");
  const [error, setError] = useState("");

  if (!open || !quote) return null;

  const isContract = quote.intendedUse === "RecurringContract";

  const handleSubmit = async () => {
    setError("");
    try {
      if (isContract) {
        if (!contractNumber || !startDate) {
          setError("Contract number and start date are required.");
          return;
        }
        await onConvert(quote._id, { contractNumber, startDate, endDate: endDate || undefined, billingCycle });
      } else {
        if (!bookingDate || !bookingTime) {
          setError("Booking date and time are required.");
          return;
        }
        await onConvert(quote._id, { bookingDate, bookingTime, address: address || undefined });
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Conversion failed.");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-lg rounded-3xl border border-slate-700 bg-[#0f172a] shadow-[0_0_60px_rgba(6,182,212,.15)] overflow-hidden"
        >
          <div className="absolute -top-20 left-20 h-60 w-60 rounded-full bg-cyan-500/10 blur-3xl"></div>

          <div className="relative flex items-center justify-between border-b border-slate-800 p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                <Repeat size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Convert to {isContract ? "Contract" : "Booking"}
                </h2>
                <p className="text-sm text-slate-400">{quote.quoteNumber}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 hover:bg-red-500 transition"
            >
              <X className="text-white" size={18} />
            </button>
          </div>

          <div className="relative space-y-4 p-7">
            {isContract ? (
              <>
                <div className="relative">
                  <Hash size={18} className="absolute left-4 top-4 text-slate-400" />
                  <input
                    placeholder="Contract Number *"
                    value={contractNumber}
                    onChange={(e) => setContractNumber(e.target.value)}
                    className="h-14 w-full rounded-2xl border border-slate-700 bg-slate-900 pl-12 pr-4 text-white outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <CalendarDays size={18} className="absolute left-4 top-4 text-slate-400" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="h-14 w-full rounded-2xl border border-slate-700 bg-slate-900 pl-12 pr-4 text-white outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="relative">
                    <CalendarDays size={18} className="absolute left-4 top-4 text-slate-400" />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      placeholder="End (optional)"
                      className="h-14 w-full rounded-2xl border border-slate-700 bg-slate-900 pl-12 pr-4 text-white outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
                <select
                  value={billingCycle}
                  onChange={(e) => setBillingCycle(e.target.value)}
                  className="h-14 w-full appearance-none rounded-2xl border border-slate-700 bg-slate-900 px-4 text-white outline-none focus:border-cyan-500"
                >
                  {["Monthly", "Quarterly", "Yearly"].map((v) => (
                    <option key={v} value={v}>
                      {v} Billing
                    </option>
                  ))}
                </select>
                {!quote.site && (
                  <p className="rounded-xl bg-yellow-500/10 border border-yellow-500/30 px-4 py-3 text-sm text-yellow-300">
                    This quote has no site attached — the backend requires a
                    site before it can be converted to a contract.
                  </p>
                )}
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <CalendarDays size={18} className="absolute left-4 top-4 text-slate-400" />
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="h-14 w-full rounded-2xl border border-slate-700 bg-slate-900 pl-12 pr-4 text-white outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="relative">
                    <Clock3 size={18} className="absolute left-4 top-4 text-slate-400" />
                    <input
                      type="time"
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="h-14 w-full rounded-2xl border border-slate-700 bg-slate-900 pl-12 pr-4 text-white outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
                <div className="relative">
                  <MapPin size={18} className="absolute left-4 top-4 text-slate-400" />
                  <input
                    placeholder="Service Address (optional if quote has a site)"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="h-14 w-full rounded-2xl border border-slate-700 bg-slate-900 pl-12 pr-4 text-white outline-none focus:border-cyan-500"
                  />
                </div>
              </>
            )}

            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4 border-t border-slate-800 p-6">
            <button
              onClick={onClose}
              className="rounded-2xl border border-slate-700 px-6 py-3 text-white transition hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 px-8 py-3 font-semibold text-white transition hover:scale-105 disabled:opacity-60"
            >
              {saving ? "Converting..." : "Convert"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
