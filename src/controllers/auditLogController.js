import AuditLog from "../models/AuditLog.js";

// ======================================
// Get Audit Logs
// (Spec 3.1 — "Connection history and audit log of sensitive actions")
// ======================================
export const getAuditLogs = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const { userId, action, startDate, endDate } = req.query;

    const query = {};

    if (userId) query.user = userId;
    if (action) query.action = action;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const totalLogs = await AuditLog.countDocuments(query);

    const logs = await AuditLog.find(query)
      .populate("user", "fullName email role")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      totalLogs,
      currentPage: page,
      totalPages: Math.ceil(totalLogs / limit),
      logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get login history for a single user (their own "connection history")
// ======================================
export const getUserLoginHistory = async (req, res) => {
  try {
    const logs = await AuditLog.find({
      user: req.params.id,
      action: { $in: ["LOGIN", "LOGIN_FAILED"] },
    })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
