import Message from "../models/Message.js";
import User from "../models/User.js";
import Employee from "../models/Employee.js";
import { sendNotification } from "../utils/sendNotification.js";

// ======================================
// Send a Direct Message (manager <-> agent, or any two internal users)
// ======================================
export const sendMessage = async (req, res) => {
  try {
    const { recipient, subject, body, attachments } = req.body;

    if (!recipient || !body) {
      return res.status(400).json({
        success: false,
        message: "Recipient and body are required.",
      });
    }

    const recipientUser = await User.findById(recipient);
    if (!recipientUser) {
      return res.status(404).json({
        success: false,
        message: "Recipient not found.",
      });
    }

    const message = await Message.create({
      sender: req.user._id,
      audience: "Direct",
      recipient,
      subject,
      body,
      attachments,
    });

    // Also drop an in-app notification so it shows up in the bell icon
    await sendNotification({
      recipient,
      type: "Message",
      title: subject || `New message from ${req.user.fullName}`,
      body,
      channels: ["InApp"],
      relatedModel: "Message",
      relatedId: message._id,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Message sent.",
      data: message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Send an Announcement — Admin/Manager only.
// audience: "Role" | "Department" | "All"
// ======================================
export const sendAnnouncement = async (req, res) => {
  try {
    const { audience, role, department, subject, body, attachments } =
      req.body;

    if (!audience || !body) {
      return res.status(400).json({
        success: false,
        message: "Audience and body are required.",
      });
    }

    if (audience === "Role" && !role) {
      return res.status(400).json({
        success: false,
        message: "Role is required when audience is 'Role'.",
      });
    }

    if (audience === "Department" && !department) {
      return res.status(400).json({
        success: false,
        message: "Department is required when audience is 'Department'.",
      });
    }

    const announcement = await Message.create({
      sender: req.user._id,
      audience,
      role: audience === "Role" ? role : null,
      department: audience === "Department" ? department : null,
      isAnnouncement: true,
      subject,
      body,
      attachments,
    });

    // Fan out an in-app notification to everyone in the target audience
    let recipientUserIds = [];

    if (audience === "All") {
      const users = await User.find({ isActive: true }).select("_id");
      recipientUserIds = users.map((u) => u._id);
    } else if (audience === "Role") {
      const users = await User.find({ role, isActive: true }).select("_id");
      recipientUserIds = users.map((u) => u._id);
    } else if (audience === "Department") {
      const employees = await Employee.find({ department }).select("user");
      recipientUserIds = employees.filter((e) => e.user).map((e) => e.user);
    }

    await Promise.all(
      recipientUserIds.map((userId) =>
        sendNotification({
          recipient: userId,
          type: "Announcement",
          title: subject || "New Announcement",
          body,
          channels: ["InApp"],
          relatedModel: "Message",
          relatedId: announcement._id,
          createdBy: req.user._id,
        })
      )
    );

    res.status(201).json({
      success: true,
      message: `Announcement sent to ${recipientUserIds.length} user(s).`,
      data: announcement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// My Inbox — direct messages sent to me + announcements that target
// my role / department / everyone
// ======================================
export const getInbox = async (req, res) => {
  try {
    let myDepartment = null;
    const employee = await Employee.findOne({ user: req.user._id }).select(
      "department"
    );
    if (employee) myDepartment = employee.department;

    const orConditions = [
      { audience: "Direct", recipient: req.user._id },
      { audience: "All" },
      { audience: "Role", role: req.user.role },
    ];

    if (myDepartment) {
      orConditions.push({ audience: "Department", department: myDepartment });
    }

    const messages = await Message.find({ $or: orConditions })
      .populate("sender", "fullName role")
      .populate("department", "departmentName")
      .sort({ createdAt: -1 })
      .limit(Number(req.query.limit) || 100);

    res.status(200).json({
      success: true,
      totalMessages: messages.length,
      messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Messages I Sent
// ======================================
export const getSentMessages = async (req, res) => {
  try {
    const messages = await Message.find({ sender: req.user._id })
      .populate("recipient", "fullName role")
      .populate("department", "departmentName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      totalMessages: messages.length,
      messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get Single Message
// ======================================
export const getMessageById = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate("sender", "fullName role")
      .populate("recipient", "fullName role")
      .populate("department", "departmentName");

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Mark Message As Read (adds current user to readBy if not present)
// ======================================
export const markMessageAsRead = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    const alreadyRead = message.readBy.some(
      (entry) => entry.user.toString() === req.user._id.toString()
    );

    if (!alreadyRead) {
      message.readBy.push({ user: req.user._id, readAt: new Date() });
      await message.save();
    }

    res.status(200).json({
      success: true,
      message: "Message marked as read.",
      data: message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Delete Message — sender or admin only
// ======================================
export const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    const isSender = message.sender.toString() === req.user._id.toString();
    if (!isSender && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access Denied",
      });
    }

    await message.deleteOne();

    res.status(200).json({
      success: true,
      message: "Message deleted.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};