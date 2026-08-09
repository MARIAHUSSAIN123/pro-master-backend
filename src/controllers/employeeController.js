import Employee from "../models/Employee.js";
import Department from "../models/Department.js";
import Booking from "../models/Booking.js";

// ======================================
// Create Employee
// ======================================
export const createEmployee = async (req, res) => {
  try {
    const {
      user,
      fullName,
      email,
      phone,
      cnic,
      designation,
      department,
      salary,
      address,
      emergencyContact,
      joiningDate,
      employmentType,
      notes,
    } = req.body;

    if (
      !fullName ||
      !email ||
      !phone ||
      !cnic ||
      !designation ||
      !department ||
      !salary ||
      !address
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    const existingEmployee = await Employee.findOne({
      $or: [
        { email: email.toLowerCase() },
        { cnic },
      ],
    });

    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: "Employee already exists.",
      });
    }

    const departmentExists = await Department.findById(department);

    if (!departmentExists) {
      return res.status(404).json({
        success: false,
        message: "Department not found.",
      });
    }

    const employee = await Employee.create({
      ...(user ? { user } : {}),
      fullName,
      email: email.toLowerCase(),
      phone,
      cnic,
      designation,
      department,
      salary,
      address,
      emergencyContact,
      joiningDate,
      employmentType,
      notes,
    });

    res.status(201).json({
      success: true,
      message: "Employee created successfully.",
      employee,
    });

  } catch (error) {

    // Duplicate key (email/cnic/user) — return a clean 400 instead
    // of a raw Mongo error with a 500 status.
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "An employee with this email, CNIC, or linked account already exists.",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Get All Employees
// ======================================
export const getEmployees = async (req, res) => {
  try {

    const employees = await Employee.find()
      .populate("department")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      totalEmployees: employees.length,
      employees,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Get Employee By ID
// ======================================
export const getEmployeeById = async (req, res) => {
  try {

    const employee = await Employee.findById(req.params.id)
      .populate("department");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    res.status(200).json({
      success: true,
      employee,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Update Employee
// ======================================
export const updateEmployee = async (req, res) => {
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

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate("department");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Employee updated successfully.",
      employee,
    });

  } catch (error) {

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "An employee with this email, CNIC, or linked account already exists.",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Delete Employee
// ======================================
export const deleteEmployee = async (req, res) => {
  try {

    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    // Fix: Booking stores assignees in `assignedEmployees` (an array).
    // The old query used a field name `assignedEmployee` that doesn't
    // exist on the schema, so it always matched nothing — employees
    // could be deleted even while actively assigned to bookings,
    // leaving orphaned references behind.
    const assignedBooking = await Booking.findOne({
      assignedEmployees: employee._id,
      status: { $nin: ["Completed", "Cancelled"] },
    });

    if (assignedBooking) {
      return res.status(400).json({
        success: false,
        message:
          "Employee is assigned to active bookings. Remove assignments first.",
      });
    }

    await employee.deleteOne();

    res.status(200).json({
      success: true,
      message: "Employee deleted successfully.",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};