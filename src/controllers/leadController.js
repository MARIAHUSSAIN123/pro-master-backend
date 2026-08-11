import Lead from "../models/Lead.js";
import Customer from "../models/Customer.js";
import { logAction } from "../utils/auditLogger.js";
import sendEmail from "../utils/sendEmail.js";
import { sendBulkNotification } from "../utils/sendNotification.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Wraps a promise so it can never hang the whole request past a fixed
// limit. This matters specifically on Vercel: if sendBulkNotification
// or sendEmail (SMTP) stalls — a slow/cold TLS handshake, a rate
// limit, a flaky network path — the whole serverless function
// would hang past Vercel's execution timeout with no response ever
// sent. Vercel's own timeout error has no CORS headers, so the
// browser reports it as "blocked by CORS policy" even though the
// real cause is upstream: the function never responded at all.
const withTimeout = (promise, ms = 5000) =>
  Promise.race([
    promise,
    new Promise((resolve) =>
      setTimeout(() => resolve({ timedOut: true }), ms)
    ),
  ]);

// Where the customer portal actually lives — used to build a
// clickable link in emails so people don't have to guess or be told
// verbally to go type "/portal/login" themselves.
const PORTAL_LOGIN_URL = `${
  (process.env.FRONTEND_URL || "").split(",")[0].trim() ||
  "http://localhost:5173"
}/portal/login`;

// ======================================
// Create Lead (PUBLIC — "Get a Free Quote" website form)
// ======================================
export const createLead = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      companyName,
      customerType,
      serviceInterest,
      address,
      city,
      message,
    } = req.body;

    if (!fullName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name, email and phone are required.",
      });
    }

    const lead = await Lead.create({
      fullName,
      email: String(email).toLowerCase(),
      phone,
      companyName,
      customerType,
      serviceInterest,
      address,
      city,
      message,
    });

    // Notify the whole office, not just one inbox that may or may
    // not be configured. This covers both entry points into this
    // endpoint — "Get a Free Quote" and "Contact Us" both submit
    // here — with an in-app bell notification (visible the moment
    // an admin opens their dashboard, no refresh needed since the
    // Topbar bell polls every 30s) plus an email to each admin/
    // manager's own address.
    try {
      const staffToNotify = await User.find({
        role: { $in: ["admin", "manager"] },
      }).select("_id");

      await withTimeout(
        sendBulkNotification({
          recipients: staffToNotify.map((u) => u._id),
          type: "General",
          title: "New quote request",
          body: `${lead.fullName} (${lead.email}, ${lead.phone}) submitted a ${
            lead.customerType
          } request${
            lead.serviceInterest ? ` — ${lead.serviceInterest}` : ""
          }.`,
          channels: ["InApp", "Email"],
          relatedModel: null,
          relatedId: null,
        })
      );
    } catch (_) {
      // A failed notification must never block the lead from being
      // saved — the visitor's submission already succeeded above.
    }

    // Optional extra copy to a shared sales inbox, if configured —
    // separate from (and in addition to) the per-admin notifications
    // above, since a shared inbox is often watched by non-login staff
    // too (e.g. a sales team distribution list).
    if (process.env.SALES_NOTIFICATION_EMAIL) {
      try {
        await withTimeout(
          sendEmail(
            process.env.SALES_NOTIFICATION_EMAIL,
            `New quote request — ${lead.fullName}`,
            `<p><strong>New lead from the website</strong></p>
             <p>Name: ${lead.fullName}<br/>
             Email: ${lead.email}<br/>
             Phone: ${lead.phone}<br/>
             Type: ${lead.customerType}<br/>
             Service interest: ${lead.serviceInterest || "-"}<br/>
             Message: ${lead.message || "-"}</p>`
          )
        );
      } catch (_) {
        // A failed notification email must never block lead creation.
      }
    }

    res.status(201).json({
      success: true,
      message: "Thanks! We received your request and will be in touch shortly.",
      lead: { id: lead._id },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================
// Get All Leads (Staff)
// ======================================
export const getLeads = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const leads = await Lead.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Lead.countDocuments(filter);

    res.status(200).json({ success: true, count: total, leads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================
// Get Single Lead (Staff)
// ======================================
export const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate(
      "convertedToCustomer"
    );
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found." });
    }
    res.status(200).json({ success: true, lead });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================
// Update Lead Status / Internal Notes (Staff)
// ======================================
export const updateLead = async (req, res) => {
  try {
    const { status, internalNotes } = req.body;

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found." });
    }

    if (status) lead.status = status;
    if (internalNotes !== undefined) lead.internalNotes = internalNotes;

    await lead.save();

    res.status(200).json({ success: true, message: "Lead updated.", lead });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================
// Convert Lead -> Customer record (Staff)
// (A login account for that customer can then be created separately
// via /api/auth/register-customer or by admin via /api/auth/register.)
// ======================================
export const convertLeadToCustomer = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found.",
      });
    }

    if (lead.status === "Converted") {
      return res.status(400).json({
        success: false,
        message: "This lead has already been converted.",
      });
    }

    const existingCustomer = await Customer.findOne({
      email: lead.email.toLowerCase(),
    });

    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: "A customer with this email already exists.",
      });
    }

    const existingUser = await User.findOne({
      email: lead.email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "A user account with this email already exists.",
      });
    }

    const { address, city, province, postalCode, billingMethod } = req.body;

    // Create portal account
    const tempPassword = crypto.randomBytes(8).toString("hex");

    const hashedPassword = await bcrypt.hash(tempPassword, 10);

  
    

    // Create customer
    const user = await User.create({
  fullName: lead.fullName,
  email: lead.email.toLowerCase(),
  password: hashedPassword,
  phone: lead.phone,
  role: "customer",
});

let customer;

try {
  customer = await Customer.create({
    user: user._id,
    fullName: lead.fullName,
    email: lead.email.toLowerCase(),
    phone: lead.phone,
    companyName: lead.companyName,
    customerType: lead.customerType,
    address: address || lead.address || "N/A",
    city: city || lead.city || "N/A",
    province,
    postalCode,
    billingMethod,
  });
} catch (err) {
  await User.findByIdAndDelete(user._id);
  throw err;
}
    // Update lead
    lead.status = "Converted";
    lead.convertedToCustomer = customer._id;
    await lead.save();

    // Audit log
    await logAction({
      user: req.user._id,
      action: "LEAD_CONVERTED",
      targetType: "Customer",
      targetId: customer._id,
      details: {
        leadId: lead._id,
      },
      req,
    });

    // Send portal activation email
 // Send portal activation email
try {
  await withTimeout(
    sendEmail(
      customer.email,
      "Welcome to Pro Master Cleaning Customer Portal",
      `
      <h2>Welcome ${customer.fullName}</h2>

      <p>Your customer account has been created successfully.</p>

      <p><strong>Email:</strong> ${customer.email}</p>
      <p><strong>Temporary Password:</strong> ${tempPassword}</p>

      <p>
        <a href="${PORTAL_LOGIN_URL}"
           style="display:inline-block;padding:12px 24px;background:#0891b2;
                   color:#ffffff;text-decoration:none;border-radius:8px;
                   font-weight:600;margin:12px 0;">
          Log in to your account
        </a>
      </p>
      <p style="font-size:13px;color:#64748b;">
        Or copy this link into your browser: ${PORTAL_LOGIN_URL}
      </p>

      <p>Please login and change your password after your first login.</p>
      `
    )
  );
} catch (err) {
  console.log("Portal email failed:", err.message);
}
    res.status(201).json({
      success: true,
      message: "Lead converted successfully.",
      customer,
      lead,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
 

// ======================================
// Delete Lead (Staff — admin only, wired in routes)
// ======================================
export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found." });
    }
    res.status(200).json({ success: true, message: "Lead deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
