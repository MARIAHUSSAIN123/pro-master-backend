import ChecklistTemplate from "../models/ChecklistTemplate.js";
import Service from "../models/Service.js";

// ======================================
// Create Checklist Template
// ======================================
export const createChecklistTemplate = async (req, res) => {
  try {
    const { name, service, items } = req.body;

    if (!name || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Name and at least one checklist item are required.",
      });
    }

    if (service) {
      const serviceExists = await Service.findById(service);
      if (!serviceExists) {
        return res.status(404).json({
          success: false,
          message: "Service not found.",
        });
      }
    }

    const template = await ChecklistTemplate.create({
      name,
      service: service || null,
      items,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Checklist template created successfully.",
      template,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get All Checklist Templates
// ======================================
export const getChecklistTemplates = async (req, res) => {
  try {
    const query = {};
    if (req.query.service) query.service = req.query.service;
    if (req.query.isActive !== undefined)
      query.isActive = req.query.isActive === "true";

    const templates = await ChecklistTemplate.find(query)
      .populate("service", "serviceName category")
      .populate("createdBy", "fullName role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      totalTemplates: templates.length,
      templates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get Single Checklist Template
// ======================================
export const getChecklistTemplateById = async (req, res) => {
  try {
    const template = await ChecklistTemplate.findById(req.params.id).populate(
      "service",
      "serviceName category"
    );

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Checklist template not found.",
      });
    }

    res.status(200).json({
      success: true,
      template,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Update Checklist Template
// ======================================
export const updateChecklistTemplate = async (req, res) => {
  try {
    const { name, service, items, isActive } = req.body;

    const template = await ChecklistTemplate.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Checklist template not found.",
      });
    }

    if (name) template.name = name;
    if (service !== undefined) template.service = service || null;
    if (items) {
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: "A checklist must contain at least one item.",
        });
      }
      template.items = items;
    }
    if (isActive !== undefined) template.isActive = isActive;

    await template.save();

    res.status(200).json({
      success: true,
      message: "Checklist template updated successfully.",
      template,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Delete Checklist Template (soft — deactivate)
// ======================================
export const deleteChecklistTemplate = async (req, res) => {
  try {
    const template = await ChecklistTemplate.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Checklist template not found.",
      });
    }

    template.isActive = false;
    await template.save();

    res.status(200).json({
      success: true,
      message: "Checklist template deactivated successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
