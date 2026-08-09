import Stripe from "stripe";

// Don't let a missing/not-yet-configured Stripe key take down the
// entire backend at boot — payments should be the one thing that
// fails when unconfigured, not every other module (bookings, auth,
// etc.) that happens to import this file indirectly.
let stripe;

if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
} else {
  console.warn(
    "⚠️  STRIPE_SECRET_KEY is not set — online payment endpoints will fail until it's configured in .env."
  );
  stripe = new Proxy(
    {},
    {
      get() {
        throw new Error(
          "Stripe is not configured. Set STRIPE_SECRET_KEY in your .env file."
        );
      },
    }
  );
}

export default stripe;