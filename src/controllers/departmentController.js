import Department from "../models/Department.js";
import Employee from "../models/Employee.js";
import Service from "../models/Service.js";

// ======================================
// Create Department
// ======================================
export const createDepartment = async (req, res) => {
  try {
    const {
      departmentName,
      description,
      manager,
      color,
      status,
    } = req.body;

    if (!departmentName) {
      return res.status(400).json({
        success: false,
        message: "Department name is required.",
      });
    }

    const existingDepartment = await Department.findOne({
      departmentName,
    });

    if (existingDepartment) {
      return res.status(400).json({
        success: false,
        message: "Department already exists.",
      });
    }

    if (manager) {
      const managerExists = await Employee.findById(manager);

      if (!managerExists) {
        return res.status(404).json({
          success: false,
          message: "Manager not found.",
        });
      }
    }

    const department = await Department.create({
      departmentName,
      description,
      manager,
      color,
      status,
    });

    res.status(201).json({
      success: true,
      message: "Department created successfully.",
      department,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Get All Departments
// ======================================
export const getDepartments = async (req, res) => {
  try {

    const departments = await Department.find()
      .populate("manager", "fullName designation email")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      totalDepartments: departments.length,
      departments,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Get Single Department
// ======================================
export const getDepartmentById = async (req, res) => {
  try {

    const department = await Department.findById(req.params.id)
      .populate("manager", "fullName designation email");

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found.",
      });
    }

    const totalEmployees = await Employee.countDocuments({
      department: department._id,
    });

    const totalServices = await Service.countDocuments({
      department: department._id,
    });

    res.status(200).json({
      success: true,
      department,
      totalEmployees,
      totalServices,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Update Department
// ======================================
export const updateDepartment = async (req, res) => {
  try {

    if (req.body.manager) {

      const managerExists = await Employee.findById(
        req.body.manager
      );

      if (!managerExists) {
        return res.status(404).json({
          success: false,
          message: "Manager not found.",
        });
      }

    }

    const department = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate("manager", "fullName designation email");

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Department updated successfully.",
      department,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Delete Department
// ======================================
export const deleteDepartment = async (req, res) => {
  try {

    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found.",
      });
    }

    const employeeExists = await Employee.findOne({
      department: department._id,
    });

    if (employeeExists) {
      return res.status(400).json({
        success: false,
        message:
          "Department has employees assigned. Remove them first.",
      });
    }

    const serviceExists = await Service.findOne({
      department: department._id,
    });

    if (serviceExists) {
      return res.status(400).json({
        success: false,
        message:
          "Department has services assigned. Remove them first.",
      });
    }

    await department.deleteOne();

    res.status(200).json({
      success: true,
      message: "Department deleted successfully.",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};