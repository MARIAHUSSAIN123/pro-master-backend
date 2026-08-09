import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    // Links this customer profile to their login account so the
    // customer portal can scope requests to "my own data" only
    // (Spec 3.2 — "Customer Portal").
    //
    // No `default` here on purpose: a sparse unique index only
    // excludes documents where this field is truly absent. If it had
    // a default of `null`, every customer without a linked login
    // account would be saved with an *explicit* `user: null`, and a
    // sparse index still counts explicit nulls as a value — so the
    // second such customer would collide with the first ("duplicate
    // key" / "customer already exists" error) even though their
    // emails are completely different.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      sparse: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    companyName: {
      type: String,
      default: "",
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    province: {
      type: String,
      default: "",
      trim: true,
    },

    postalCode: {
      type: String,
      default: "",
      trim: true,
    },

    profileImage: {
      type: String,
      default: "",
    },

    customerType: {
      type: String,
      enum: [
        "Residential",
        "Commercial",
      ],
      default: "Residential",
    },

    // Spec 3.2 — "billing method"
    billingMethod: {
      type: String,
      enum: ["Cash", "Credit Card", "Debit Card", "E-Transfer", "Bank Transfer"],
      default: "Cash",
    },

    // Stripe customer object — created once, reused for all future
    // charges so we don't need to re-collect card details each time.
    stripeCustomerId: {
      type: String,
      default: "",
    },

    // The saved card's Stripe PaymentMethod ID, used for off-session
    // (automatic) recurring charges.
    savedPaymentMethodId: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Customer", customerSchema);