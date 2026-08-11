
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import auditLogRoutes from "./routes/auditLogRoutes.js";
import siteRoutes from "./routes/siteRoutes.js";
import contractRoutes from "./routes/contractRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import checklistTemplateRoutes from "./routes/checklistTemplateRoutes.js";
import inspectionRoutes from "./routes/inspectionRoutes.js";
import surveyRoutes from "./routes/surveyRoutes.js";
import quoteRoutes from "./routes/quoteRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import cronRoutes from "./routes/cronRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
const app = express();
const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/users", userRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/audit-logs", auditLogRoutes);
app.use("/api/sites", siteRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/checklist-templates", checklistTemplateRoutes);
app.use("/api/inspections", inspectionRoutes);
app.use("/api/surveys", surveyRoutes);
app.use("/api/quotes", quoteRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/cron", cronRoutes);
app.use("/api/leads", leadRoutes);


// Home Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Pro Master Cleaning Backend Running 🚀",
  });
});

export default app;
