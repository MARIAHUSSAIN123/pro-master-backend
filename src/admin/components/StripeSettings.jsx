import { motion } from "framer-motion";
import {
  CreditCard,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  RefreshCcw,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";

export default function StripeSettings() {
  const [showSecret, setShowSecret] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);
  const [liveMode, setLiveMode] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="rounded-3xl border border-slate-800 bg-[#111827] p-8 shadow-xl"
    >
      {/* Header */}

      <div className="mb-8 flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600">

            <CreditCard className="text-white" size={28} />

          </div>

          <div>

            <h2 className="text-2xl font-bold text-white">
              Stripe Payment Settings
            </h2>

            <p className="text-slate-400">
              Configure your Stripe payment gateway.
            </p>

          </div>

        </div>

        <div className="rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-400">

          Connected

        </div>

      </div>

      {/* Publishable */}

      <div className="space-y-6">

        <div>

          <label className="mb-2 block text-sm text-slate-400">

            Publishable Key

          </label>

          <div className="relative">

            <KeyRound
              size={18}
              className="absolute left-4 top-4 text-cyan-400"
            />

            <input
              placeholder="pk_live_xxxxxxxxxxxxxxxxxxxxxx"
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 py-3 pl-12 pr-4 text-white outline-none focus:border-cyan-500"
            />

          </div>

        </div>

        {/* Secret */}

        <div>

          <label className="mb-2 block text-sm text-slate-400">

            Secret Key

          </label>

          <div className="relative">

            <ShieldCheck
              size={18}
              className="absolute left-4 top-4 text-cyan-400"
            />

            <input
              type={showSecret ? "text" : "password"}
              placeholder="sk_live_xxxxxxxxxxxxxxxxxxxxxx"
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 py-3 pl-12 pr-12 text-white outline-none focus:border-cyan-500"
            />

            <button
              type="button"
              onClick={() => setShowSecret(!showSecret)}
              className="absolute right-4 top-3 text-slate-400"
            >
              {showSecret ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>

          </div>

        </div>

        {/* Webhook */}

        <div>

          <label className="mb-2 block text-sm text-slate-400">

            Webhook Secret

          </label>

          <div className="relative">

            <ShieldCheck
              size={18}
              className="absolute left-4 top-4 text-cyan-400"
            />

            <input
              type={showWebhook ? "text" : "password"}
              placeholder="whsec_xxxxxxxxxxxxxxxxx"
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 py-3 pl-12 pr-12 text-white outline-none focus:border-cyan-500"
            />

            <button
              type="button"
              onClick={() => setShowWebhook(!showWebhook)}
              className="absolute right-4 top-3 text-slate-400"
            >
              {showWebhook ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>

          </div>

        </div>

      </div>

      {/* Live Mode */}

      <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-900 p-5">

        <div className="flex items-center justify-between">

          <div>

            <h3 className="font-semibold text-white">

              Live Mode

            </h3>

            <p className="text-sm text-slate-400">

              Enable production Stripe payments.

            </p>

          </div>

          <button
            onClick={() => setLiveMode(!liveMode)}
            className={`relative h-8 w-16 rounded-full transition ${
              liveMode ? "bg-green-500" : "bg-slate-600"
            }`}
          >

            <span
              className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${
                liveMode ? "right-1" : "left-1"
              }`}
            ></span>

          </button>

        </div>

      </div>

      {/* Buttons */}

      <div className="mt-8 flex flex-wrap justify-end gap-4">

        <button className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-6 py-3 text-white hover:border-cyan-500">

          <RefreshCcw size={18}/>

          Verify Connection

        </button>

        <button className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-600 px-8 py-3 font-semibold text-white shadow-xl hover:scale-105 transition">

          <CheckCircle2 size={18}/>

          Save Stripe Settings

        </button>

      </div>

    </motion.div>
  );
}