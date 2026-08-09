import Notification from "../models/Notification.js";
import { sendNotification, sendBulkNotification } from "../utils/sendNotification.js";

// ======================================
// Get My Notifications (any logged-in user — admin, manager, agent
// or customer, since 3.8 covers all app clients)
// ======================================
export const getMyNotifications = async (req, res) => {
  try {
    const query = { recipient: req.user._id };
    if (req.query.isRead !== undefined) {
      query.isRead = req.query.isRead === "true";
    }
    if (req.query.type) query.type = req.query.type;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(req.query.limit) || 100);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      unreadCount,
      totalNotifications: notifications.length,
      notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get Single Notification
// ======================================
export const getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access Denied",
      });
    }

    res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Mark One Notification As Read
// ======================================
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access Denied",
      });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Mark All My Notifications As Read
// ======================================
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Delete Notification
// ======================================
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access Denied",
      });
    }

    await notification.deleteOne();

    res.status(200).json({
      success: true,
      message: "Notification deleted.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Admin/Manager — manually send a notification to one user
// (e.g. a one-off appointment/schedule/invoice alert)
// ======================================
export const createNotification = async (req, res) => {
  try {
    const { recipient, type, title, body, channels, relatedModel, relatedId } =
      req.body;

    if (!recipient || !title || !body) {
      return res.status(400).json({
        success: false,
        message: "Recipient, title and body are required.",
      });
    }

    const notification = await sendNotification({
      recipient,
      type,
      title,
      body,
      channels,
      relatedModel,
      relatedId,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Notification sent.",
      notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Admin/Manager — send the same notification to several users at once
// ======================================
export const createBulkNotification = async (req, res) => {
  try {
    const { recipients, type, title, body, channels, relatedModel, relatedId } =
      req.body;

    if (!Array.isArray(recipients) || recipients.length === 0 || !title || !body) {
      return res.status(400).json({
        success: false,
        message: "Recipients (array), title and body are required.",
      });
    }

    const notifications = await sendBulkNotification({
      recipients,
      type,
      title,
      body,
      channels,
      relatedModel,
      relatedId,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: `Notification sent to ${notifications.length} user(s).`,
      notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};