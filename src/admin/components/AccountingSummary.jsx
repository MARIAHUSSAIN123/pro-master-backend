import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";

export default function AccountingSummary() {
  return (
    <div className="bg-[#111827] rounded-2xl p-6 border border-slate-800 shadow-xl">

      <h2 className="text-2xl text-white font-bold mb-6">
        Accounting Summary
      </h2>

      <div className="space-y-5">

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <DollarSign className="text-green-400" />
            <span className="text-slate-300">Income</span>
          </div>

          <span className="text-green-400 font-bold">
            $18,500
          </span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <TrendingDown className="text-red-400" />
            <span className="text-slate-300">Expenses</span>
          </div>

          <span className="text-red-400 font-bold">
            $4,700
          </span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-cyan-400" />
            <span className="text-slate-300">Profit</span>
          </div>

          <span className="text-cyan-400 font-bold">
            $13,800
          </span>
        </div>

      </div>

    </div>
  );
}