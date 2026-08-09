import Employee from "../models/Employee.js";
import Customer from "../models/Customer.js";
import Service from "../models/Service.js";
import Booking from "../models/Booking.js";
import Attendance from "../models/Attendance.js";
import Invoice from "../models/Invoice.js";
import Payment from "../models/Payment.js";
import Complaint from "../models/Complaint.js";
import { toExcelXML, buildPdfReport } from "../utils/exportFormats.js";

// ===========================
// Helper: date range for "today"
// ===========================
const getTodayRange = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  return { today, tomorrow };
};

// ===========================
// Main Dashboard Stats
// (Spec 3.9 — Reporting and Management)
// ===========================
export const getDashboardStats = async (req, res) => {
  try {
    const { today, tomorrow } = getTodayRange();

    // ===========================
    // Basic Counts
    // ===========================

    const totalEmployees = await Employee.countDocuments({ status: "Active" });
    const totalCustomers = await Customer.countDocuments({ isActive: true });
    const totalServices = await Service.countDocuments({ status: "Active" });
    const totalBookings = await Booking.countDocuments();

    // ===========================
    // Employee Breakdown
    // ===========================

    const activeEmployees = totalEmployees;
    const onLeaveEmployees = await Employee.countDocuments({ status: "On Leave" });
    const inactiveEmployees = await Employee.countDocuments({ status: "Inactive" });

    const employeesByDesignation = await Employee.aggregate([
      { $match: { status: "Active" } },
      { $group: { _id: "$designation", count: { $sum: 1 } } },
      { $project: { _id: 0, designation: "$_id", count: 1 } },
      { $sort: { count: -1 } },
    ]);

    // ===========================
    // Booking Status Breakdown
    // ===========================

    const pendingBookings = await Booking.countDocuments({ status: "Pending" });
    const confirmedBookings = await Booking.countDocuments({ status: "Confirmed" });
    const assignedBookings = await Booking.countDocuments({ status: "Assigned" });
    const inProgressBookings = await Booking.countDocuments({ status: "In Progress" });
    const completedBookings = await Booking.countDocuments({ status: "Completed" });
    const cancelledBookings = await Booking.countDocuments({ status: "Cancelled" });

    // Completion / cancellation rate (Spec 3.9: "completion rate")
    const completionRate =
      totalBookings > 0
        ? Number(((completedBookings / totalBookings) * 100).toFixed(2))
        : 0;

    const cancellationRate =
      totalBookings > 0
        ? Number(((cancelledBookings / totalBookings) * 100).toFixed(2))
        : 0;

    // ===========================
    // Billing & Revenue (Spec 3.5 — Quotes and Billing)
    // Based on actual Invoice / Payment records
    // ===========================

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    // Money actually collected
    const paymentsAgg = await Payment.aggregate([
      { $match: { paymentStatus: "Completed" } },
      { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
    ]);
    const totalRevenue = paymentsAgg.length > 0 ? paymentsAgg[0].totalRevenue : 0;

    // Invoicing totals
    const totalInvoices = await Invoice.countDocuments();
    const paidInvoices = await Invoice.countDocuments({ paymentStatus: "Paid" });
    const pendingInvoices = await Invoice.countDocuments({ paymentStatus: "Pending" });
    const overdueInvoices = await Invoice.countDocuments({
      paymentStatus: { $ne: "Paid" },
      dueDate: { $lt: new Date() },
    });

    const invoiceTotalsAgg = await Invoice.aggregate([
      {
        $group: {
          _id: null,
          totalInvoiced: { $sum: "$totalAmount" },
          totalTaxCollected: { $sum: "$tax" },
          totalDiscountsGiven: { $sum: "$discount" },
        },
      },
    ]);
    const invoiceTotals =
      invoiceTotalsAgg.length > 0
        ? invoiceTotalsAgg[0]
        : { totalInvoiced: 0, totalTaxCollected: 0, totalDiscountsGiven: 0 };

    const outstandingAmount = Number(
      (invoiceTotals.totalInvoiced - totalRevenue).toFixed(2)
    );

    const avgBookingValue =
      completedBookings > 0
        ? Number((totalRevenue / completedBookings).toFixed(2))
        : 0;

    const avgInvoiceValue =
      totalInvoices > 0
        ? Number((invoiceTotals.totalInvoiced / totalInvoices).toFixed(2))
        : 0;

    // Payment method breakdown — from actual Payment records
    const paymentMethodBreakdown = await Payment.aggregate([
      { $match: { paymentStatus: "Completed" } },
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
      { $project: { _id: 0, paymentMethod: "$_id", count: 1, totalAmount: 1 } },
    ]);

    // Invoice payment-status breakdown
    const invoiceStatusBreakdown = await Invoice.aggregate([
      {
        $group: {
          _id: "$paymentStatus",
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
        },
      },
      { $project: { _id: 0, paymentStatus: "$_id", count: 1, totalAmount: 1 } },
    ]);

    // Revenue trend — last 6 months, based on actual collected payments
    const revenueTrend = await Payment.aggregate([
      { $match: { paymentStatus: "Completed", paidAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$paidAt" }, month: { $month: "$paidAt" } },
          revenue: { $sum: "$amount" },
          paymentsCount: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          revenue: 1,
          paymentsCount: 1,
        },
      },
    ]);

    // ===========================
    // Today's Bookings
    // ===========================

    const todaysBookings = await Booking.countDocuments({
      bookingDate: { $gte: today, $lt: tomorrow },
    });

    // ===========================
    // Upcoming
    // ===========================

    const upcomingBookings = await Booking.countDocuments({
      bookingDate: { $gt: new Date() },
      status: { $nin: ["Completed", "Cancelled"] },
    });

    // ===========================
    // Featured Services
    // ===========================

    const featuredServices = await Service.countDocuments({ featured: true });

    // ===========================
    // Attendance Summary (Today)
    // (Spec 3.4 — Team Planning, feeds into 3.9 productivity)
    // ===========================

    const attendanceAgg = await Attendance.aggregate([
      { $match: { date: { $gte: today, $lt: tomorrow } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const attendanceSummary = {
      Present: 0,
      Absent: 0,
      Leave: 0,
      "Half Day": 0,
      Late: 0,
    };
    attendanceAgg.forEach((a) => {
      attendanceSummary[a._id] = a.count;
    });

    // ===========================
    // Agent Productivity (Spec 3.9 — "productivity per agent")
    // ===========================

    const agentProductivity = await Booking.aggregate([
      { $match: { assignedEmployees: { $exists: true, $ne: [] } } },
      { $unwind: "$assignedEmployees" },
      {
        $group: {
          _id: "$assignedEmployees",
          totalAssigned: { $sum: 1 },
          completedJobs: {
            $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] },
          },
          revenueGenerated: {
            $sum: {
              $cond: [{ $eq: ["$status", "Completed"] }, "$totalAmount", 0],
            },
          },
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "_id",
          foreignField: "_id",
          as: "employeeInfo",
        },
      },
      { $unwind: "$employeeInfo" },
      {
        $project: {
          _id: 0,
          employeeId: "$_id",
          fullName: "$employeeInfo.fullName",
          designation: "$employeeInfo.designation",
          totalAssigned: 1,
          completedJobs: 1,
          revenueGenerated: 1,
          completionRate: {
            $cond: [
              { $eq: ["$totalAssigned", 0] },
              0,
              {
                $round: [
                  { $multiply: [{ $divide: ["$completedJobs", "$totalAssigned"] }, 100] },
                  2,
                ],
              },
            ],
          },
        },
      },
      { $sort: { completedJobs: -1 } },
      { $limit: 10 },
    ]);

    // ===========================
    // Quality / Non-Compliance (Spec 3.7 & 3.9 — "non-compliance rate")
    // ===========================

    const totalComplaints = await Complaint.countDocuments();
    const openComplaints = await Complaint.countDocuments({
      status: { $in: ["Open", "In Progress"] },
    });
    const resolvedComplaints = await Complaint.countDocuments({
      status: { $in: ["Resolved", "Closed"] },
    });

    const nonComplianceRate =
      totalBookings > 0
        ? Number(((totalComplaints / totalBookings) * 100).toFixed(2))
        : 0;

    const complaintsBySeverity = await Complaint.aggregate([
      { $group: { _id: "$severity", count: { $sum: 1 } } },
      { $project: { _id: 0, severity: "$_id", count: 1 } },
    ]);

    // ===========================
    // Customer Growth (new customers this month)
    // ===========================

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const newCustomersThisMonth = await Customer.countDocuments({
      createdAt: { $gte: startOfMonth },
    });

    // ===========================
    // Recent Bookings
    // ===========================

    const recentBookings = await Booking.find()
      .populate("customer", "fullName")
      .populate("service", "serviceName")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      dashboard: {
        totalEmployees,
        totalCustomers,
        totalServices,
        totalBookings,

        employees: {
          active: activeEmployees,
          onLeave: onLeaveEmployees,
          inactive: inactiveEmployees,
          byDesignation: employeesByDesignation,
        },

        bookingStatus: {
          pendingBookings,
          confirmedBookings,
          assignedBookings,
          inProgressBookings,
          completedBookings,
          cancelledBookings,
          completionRate,
          cancellationRate,
        },

        billing: {
          totalRevenue,
          avgBookingValue,
          avgInvoiceValue,
          outstandingAmount,
          totalTaxCollected: invoiceTotals.totalTaxCollected,
          totalDiscountsGiven: invoiceTotals.totalDiscountsGiven,
          invoices: {
            total: totalInvoices,
            paid: paidInvoices,
            pending: pendingInvoices,
            overdue: overdueInvoices,
            statusBreakdown: invoiceStatusBreakdown,
          },
          paymentMethodBreakdown,
          revenueTrend,
        },

        todaysBookings,
        upcomingBookings,
        featuredServices,

        attendanceSummary,
        agentProductivity,

        newCustomersThisMonth,

        recentBookings,

        quality: {
          totalComplaints,
          openComplaints,
          resolvedComplaints,
          nonComplianceRate,
          complaintsBySeverity,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===========================
// CSV Export — Bookings
// (Spec 3.9 — "Data exports CSV/Excel/PDF")
// ===========================
export const exportBookingsCSV = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;

    const filter = {};
    if (startDate || endDate) {
      filter.bookingDate = {};
      if (startDate) filter.bookingDate.$gte = new Date(startDate);
      if (endDate) filter.bookingDate.$lte = new Date(endDate);
    }
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate("customer", "fullName email")
      .populate("service", "serviceName")
      .populate("assignedEmployees", "fullName")
      .sort({ bookingDate: -1 });

    const header = [
      "Booking Number",
      "Customer",
      "Service",
      "Assigned Employees",
      "Booking Date",
      "Status",
      "Payment Status",
      "Total Amount",
    ];

    const escapeCSV = (value) => {
      const str = String(value ?? "");
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = bookings.map((b) => [
      b.bookingNumber,
      b.customer?.fullName || "",
      b.service?.serviceName || "",
      (b.assignedEmployees || []).map((e) => e.fullName).join(" | "),
      b.bookingDate ? b.bookingDate.toISOString().split("T")[0] : "",
      b.status,
      b.paymentStatus,
      b.totalAmount,
    ]);

    const csvContent = [header, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="bookings_export_${Date.now()}.csv"`
    );
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===========================
// CSV Export — Invoices
// (Spec 3.9 — "Data exports CSV/Excel/PDF")
// ===========================
export const exportInvoicesCSV = async (req, res) => {
  try {
    const { startDate, endDate, paymentStatus } = req.query;

    const filter = {};
    if (startDate || endDate) {
      filter.issuedDate = {};
      if (startDate) filter.issuedDate.$gte = new Date(startDate);
      if (endDate) filter.issuedDate.$lte = new Date(endDate);
    }
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const invoices = await Invoice.find(filter)
      .populate("customer", "fullName email")
      .sort({ issuedDate: -1 });

    const header = [
      "Invoice Number",
      "Customer",
      "Subtotal",
      "Tax",
      "Discount",
      "Total Amount",
      "Payment Status",
      "Issued Date",
      "Due Date",
    ];

    const escapeCSV = (value) => {
      const str = String(value ?? "");
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = invoices.map((inv) => [
      inv.invoiceNumber,
      inv.customer?.fullName || "",
      inv.subtotal,
      inv.tax,
      inv.discount,
      inv.totalAmount,
      inv.paymentStatus,
      inv.issuedDate ? inv.issuedDate.toISOString().split("T")[0] : "",
      inv.dueDate ? inv.dueDate.toISOString().split("T")[0] : "",
    ]);

    const csvContent = [header, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="invoices_export_${Date.now()}.csv"`
    );
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===========================
// Excel Export — Bookings
// (Spec 3.9 — "Data exports CSV/Excel/PDF")
// ===========================
export const exportBookingsExcel = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;

    const filter = {};
    if (startDate || endDate) {
      filter.bookingDate = {};
      if (startDate) filter.bookingDate.$gte = new Date(startDate);
      if (endDate) filter.bookingDate.$lte = new Date(endDate);
    }
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate("customer", "fullName email")
      .populate("service", "serviceName")
      .populate("assignedEmployees", "fullName")
      .sort({ bookingDate: -1 });

    const header = [
      "Booking Number",
      "Customer",
      "Service",
      "Assigned Employees",
      "Booking Date",
      "Status",
      "Payment Status",
      "Total Amount",
    ];

    const rows = bookings.map((b) => [
      b.bookingNumber,
      b.customer?.fullName || "",
      b.service?.serviceName || "",
      (b.assignedEmployees || []).map((e) => e.fullName).join(" | "),
      b.bookingDate ? b.bookingDate.toISOString().split("T")[0] : "",
      b.status,
      b.paymentStatus,
      b.totalAmount,
    ]);

    const xml = toExcelXML(header, rows, "Bookings");

    res.setHeader("Content-Type", "application/vnd.ms-excel");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="bookings_export_${Date.now()}.xls"`
    );
    res.status(200).send(xml);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===========================
// PDF Export — Bookings
// (Spec 3.9 — "Data exports CSV/Excel/PDF")
// ===========================
export const exportBookingsPDF = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;

    const filter = {};
    if (startDate || endDate) {
      filter.bookingDate = {};
      if (startDate) filter.bookingDate.$gte = new Date(startDate);
      if (endDate) filter.bookingDate.$lte = new Date(endDate);
    }
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate("customer", "fullName email")
      .populate("service", "serviceName")
      .sort({ bookingDate: -1 });

    const headers = ["Booking #", "Customer", "Service", "Date", "Status", "Amount"];
    const rows = bookings.map((b) => [
      b.bookingNumber,
      b.customer?.fullName || "",
      b.service?.serviceName || "",
      b.bookingDate ? b.bookingDate.toISOString().split("T")[0] : "",
      b.status,
      b.totalAmount,
    ]);

    const pdf = buildPdfReport({ title: "Bookings Report", headers, rows });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="bookings_export_${Date.now()}.pdf"`
    );
    res.status(200).send(pdf);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===========================
// Excel Export — Invoices
// (Spec 3.9 — "Data exports CSV/Excel/PDF")
// ===========================
export const exportInvoicesExcel = async (req, res) => {
  try {
    const { startDate, endDate, paymentStatus } = req.query;

    const filter = {};
    if (startDate || endDate) {
      filter.issuedDate = {};
      if (startDate) filter.issuedDate.$gte = new Date(startDate);
      if (endDate) filter.issuedDate.$lte = new Date(endDate);
    }
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const invoices = await Invoice.find(filter)
      .populate("customer", "fullName email")
      .sort({ issuedDate: -1 });

    const header = [
      "Invoice Number",
      "Customer",
      "Subtotal",
      "Tax",
      "Discount",
      "Total Amount",
      "Payment Status",
      "Issued Date",
      "Due Date",
    ];

    const rows = invoices.map((inv) => [
      inv.invoiceNumber,
      inv.customer?.fullName || "",
      inv.subtotal,
      inv.tax,
      inv.discount,
      inv.totalAmount,
      inv.paymentStatus,
      inv.issuedDate ? inv.issuedDate.toISOString().split("T")[0] : "",
      inv.dueDate ? inv.dueDate.toISOString().split("T")[0] : "",
    ]);

    const xml = toExcelXML(header, rows, "Invoices");

    res.setHeader("Content-Type", "application/vnd.ms-excel");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="invoices_export_${Date.now()}.xls"`
    );
    res.status(200).send(xml);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===========================
// PDF Export — Invoices
// (Spec 3.9 — "Data exports CSV/Excel/PDF")
// ===========================
export const exportInvoicesPDF = async (req, res) => {
  try {
    const { startDate, endDate, paymentStatus } = req.query;

    const filter = {};
    if (startDate || endDate) {
      filter.issuedDate = {};
      if (startDate) filter.issuedDate.$gte = new Date(startDate);
      if (endDate) filter.issuedDate.$lte = new Date(endDate);
    }
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const invoices = await Invoice.find(filter)
      .populate("customer", "fullName email")
      .sort({ issuedDate: -1 });

    const headers = ["Invoice #", "Customer", "Total", "Status", "Issued", "Due"];
    const rows = invoices.map((inv) => [
      inv.invoiceNumber,
      inv.customer?.fullName || "",
      inv.totalAmount,
      inv.paymentStatus,
      inv.issuedDate ? inv.issuedDate.toISOString().split("T")[0] : "",
      inv.dueDate ? inv.dueDate.toISOString().split("T")[0] : "",
    ]);

    const pdf = buildPdfReport({ title: "Invoices Report", headers, rows });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="invoices_export_${Date.now()}.pdf"`
    );
    res.status(200).send(pdf);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===========================
// Reporting API for external BI tool
// (Spec 3.9 — "reporting API for an external BI tool")
// ===========================
export const getBIReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.bookingDate = {};
      if (startDate) dateFilter.bookingDate.$gte = new Date(startDate);
      if (endDate) dateFilter.bookingDate.$lte = new Date(endDate);
    }

    const bookingsByStatus = await Booking.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { _id: 0, status: "$_id", count: 1 } },
    ]);

    const paymentDateFilter = {};
    if (startDate || endDate) {
      paymentDateFilter.paidAt = {};
      if (startDate) paymentDateFilter.paidAt.$gte = new Date(startDate);
      if (endDate) paymentDateFilter.paidAt.$lte = new Date(endDate);
    }

    const revenueByDay = await Payment.aggregate([
      { $match: { ...paymentDateFilter, paymentStatus: "Completed" } },
      {
        $group: {
          _id: {
            year: { $year: "$paidAt" },
            month: { $month: "$paidAt" },
            day: { $dayOfMonth: "$paidAt" },
          },
          revenue: { $sum: "$amount" },
          paymentsCount: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      {
        $project: {
          _id: 0,
          date: {
            $dateFromParts: {
              year: "$_id.year",
              month: "$_id.month",
              day: "$_id.day",
            },
          },
          revenue: 1,
          paymentsCount: 1,
        },
      },
    ]);

    const overdueInvoicesList = await Invoice.find({
      paymentStatus: { $ne: "Paid" },
      dueDate: { $lt: new Date() },
    })
      .populate("customer", "fullName email")
      .select("invoiceNumber totalAmount dueDate paymentStatus customer")
      .sort({ dueDate: 1 })
      .limit(20);

    const complaintFilter = {};
    if (startDate || endDate) {
      complaintFilter.createdAt = {};
      if (startDate) complaintFilter.createdAt.$gte = new Date(startDate);
      if (endDate) complaintFilter.createdAt.$lte = new Date(endDate);
    }

    const complaintsByStatus = await Complaint.aggregate([
      { $match: complaintFilter },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { _id: 0, status: "$_id", count: 1 } },
    ]);

    const servicePopularity = await Booking.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$service", bookingsCount: { $sum: 1 } } },
      {
        $lookup: {
          from: "services",
          localField: "_id",
          foreignField: "_id",
          as: "serviceInfo",
        },
      },
      { $unwind: "$serviceInfo" },
      {
        $project: {
          _id: 0,
          serviceName: "$serviceInfo.serviceName",
          bookingsCount: 1,
        },
      },
      { $sort: { bookingsCount: -1 } },
    ]);

    res.status(200).json({
      success: true,
      report: {
        generatedAt: new Date(),
        filters: { startDate: startDate || null, endDate: endDate || null },
        bookingsByStatus,
        revenueByDay,
        servicePopularity,
        overdueInvoices: overdueInvoicesList,
        complaintsByStatus,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
