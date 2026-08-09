import Service from "../models/Service.js";
import Department from "../models/Department.js";
import Booking from "../models/Booking.js";

// ======================================
// Create Service
// ======================================
export const createService = async (req, res) => {
  try {
    const {
      serviceName,
      category,
      department,
      description,
      duration,
      price,
      employeesRequired,
      image,
      featured,
      status,
    } = req.body;

    if (
      !serviceName ||
      !category ||
      !department ||
      !description ||
      !duration ||
      !price
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    const existingService = await Service.findOne({
      serviceName,
    });

    if (existingService) {
      return res.status(400).json({
        success: false,
        message: "Service already exists.",
      });
    }

    const departmentExists = await Department.findById(department);

    if (!departmentExists) {
      return res.status(404).json({
        success: false,
        message: "Department not found.",
      });
    }

    const service = await Service.create({
      serviceName,
      category,
      department,
      description,
      duration,
      price,
      employeesRequired,
      image,
      featured,
      status,
    });

    res.status(201).json({
      success: true,
      message: "Service created successfully.",
      service,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Get All Services
// ======================================
export const getServices = async (req, res) => {
  try {

    const services = await Service.find()
      .populate("department", "departmentName")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      totalServices: services.length,
      services,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Get Active Services
// ======================================
export const getActiveServices = async (req, res) => {
  try {

    const services = await Service.find({
      status: "Active",
    })
      .populate("department", "departmentName");

    res.status(200).json({
      success: true,
      services,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Get Featured Services
// ======================================
export const getFeaturedServices = async (req, res) => {
  try {

    const services = await Service.find({
      featured: true,
      status: "Active",
    })
      .populate("department", "departmentName");

    res.status(200).json({
      success: true,
      services,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Get Single Service
// ======================================
export const getServiceById = async (req, res) => {
  try {

    const service = await Service.findById(req.params.id)
      .populate("department", "departmentName");

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found.",
      });
    }

    res.status(200).json({
      success: true,
      service,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Update Service
// ======================================
export const updateService = async (req, res) => {
  try {

    if (req.body.department) {

      const departmentExists = await Department.findById(
        req.body.department
      );

      if (!departmentExists) {
        return res.status(404).json({
          success: false,
          message: "Department not found.",
        });
      }

    }

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate("department", "departmentName");

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Service updated successfully.",
      service,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Delete Service
// ======================================
export const deleteService = async (req, res) => {
  try {

    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found.",
      });
    }

    const bookingExists = await Booking.findOne({
      service: service._id,
    });

    if (bookingExists) {
      return res.status(400).json({
        success: false,
        message:
          "Service is already used in bookings. Cannot delete.",
      });
    }

    await service.deleteOne();

    res.status(200).json({
      success: true,
      message: "Service deleted successfully.",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};