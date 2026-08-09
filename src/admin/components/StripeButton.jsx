import { CreditCard, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

export default function StripeButton() {
  const openStripe = () => {
    window.open("https://dashboard.stripe.com/", "_blank");
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={openStripe}
      className="w-full flex items-center justify-between rounded-2xl
      bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700
      p-5 shadow-xl hover:shadow-indigo-500/30 transition"
    >
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
          <CreditCard size={30} className="text-white" />
        </div>

        <div className="text-left">
          <h3 className="text-white text-lg font-bold">
            Stripe Dashboard
          </h3>

          <p className="text-slate-200 text-sm">
            Manage Payments & Invoices
          </p>
        </div>
      </div>

      <ExternalLink className="text-white" size={24} />
    </motion.button>
  );
}