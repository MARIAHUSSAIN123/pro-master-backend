import AuditLog from "../models/AuditLog.js";

// Fire-and-forget style logger — a logging failure should never
// break the actual request, so errors are swallowed and printed.
export const logAction = async ({
  user,
  action,
  targetType = "",
  targetId = null,
  details = {},
  req = null,
}) => {
  try {
    await AuditLog.create({
      user: user || null,
      action,
      targetType,
      targetId,
      details,
      ipAddress: req?.ip || "",
    });
  } catch (error) {
    console.error("Audit log error:", error.message);
  }
};
