import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import Booking from "../models/Booking.js";

// Normalizes any date/time input to midnight so a whole calendar
// day is treated as one attendance record, regardless of the time
// portion that was submitted.
const toDayStart = (value) => {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d;
};

// ======================================
// Mark Attendance
// ======================================
export const markAttendance = async (req, res) => {
  try {
    const {
      employee,
      booking,
      date,
      status,
      remarks,
    } = req.body;

    if (!employee || !date) {
      return res.status(400).json({
        success: false,
        message: "Employee and date are required.",
      });
    }

    // Check Employee
    const employeeExists = await Employee.findById(employee);

    if (!employeeExists) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    // Check Booking (Optional)
    if (booking) {
      const bookingExists = await Booking.findById(booking);

      if (!bookingExists) {
        return res.status(404).json({
          success: false,
          message: "Booking not found.",
        });
      }
    }

    const dayStart = toDayStart(date);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    // Already marked? (Fix: was comparing exact Date incl. time,
    // so two marks on the same day with different times both went
    // through. Now matched against the whole calendar day.)
    const attendanceExists = await Attendance.findOne({
      employee,
      date: { $gte: dayStart, $lt: dayEnd },
    });

    if (attendanceExists) {
      return res.status(400).json({
        success: false,
        message: "Attendance already marked for this day.",
      });
    }

    const attendance = await Attendance.create({
      employee,
      booking,
      date: dayStart,
      status,
      remarks,
    });

    res.status(201).json({
      success: true,
      message: "Attendance marked successfully.",
      attendance,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Employee Check In
// (Spec 3.3 — Geolocated check-in by the agent)
// ======================================
export const checkInEmployee = async (req, res) => {
  try {

    const { lat, lng } = req.body;

    const attendance = await Attendance.findById(req.params.id).populate(
      "employee"
    );

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance not found.",
      });
    }

    // Ownership check: an "employee" role user may only check
    // themselves in — not any attendance record by id. Admin/manager
    // can still act on behalf of an agent.
    if (req.user.role === "employee") {
      const ownEmployeeId = attendance.employee?.user?.toString();

      if (!ownEmployeeId || ownEmployeeId !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only check yourself in.",
        });
      }
    }

    if (attendance.checkIn) {
      return res.status(400).json({
        success: false,
        message: "Already checked in.",
      });
    }

    attendance.checkIn = new Date();

    if (typeof lat === "number" && typeof lng === "number") {
      attendance.checkInLocation = { lat, lng };
    }

    await attendance.save();

    res.status(200).json({
      success: true,
      message: "Check In successful.",
      attendance,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Employee Check Out
// (Spec 3.3 — Geolocated check-out by the agent)
// ======================================
export const checkOutEmployee = async (req, res) => {
  try {

    const { lat, lng } = req.body;

    const attendance = await Attendance.findById(req.params.id).populate(
      "employee"
    );

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance not found.",
      });
    }

    if (req.user.role === "employee") {
      const ownEmployeeId = attendance.employee?.user?.toString();

      if (!ownEmployeeId || ownEmployeeId !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only check yourself out.",
        });
      }
    }

    if (!attendance.checkIn) {
      return res.status(400).json({
        success: false,
        message: "Cannot check out before checking in.",
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: "Already checked out.",
      });
    }

    attendance.checkOut = new Date();

    if (typeof lat === "number" && typeof lng === "number") {
      attendance.checkOutLocation = { lat, lng };
    }

    const diff = attendance.checkOut - attendance.checkIn;
    attendance.hoursWorked = Number((diff / (1000 * 60 * 60)).toFixed(2));

    await attendance.save();

    res.status(200).json({
      success: true,
      message: "Check Out successful.",
      attendance,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Get All Attendance
// ======================================
export const getAttendance = async (req, res) => {
  try {

    const attendance = await Attendance.find()
      .populate("employee")
      .populate("booking")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      totalAttendance: attendance.length,
      attendance,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Get Single Attendance
// ======================================
export const getAttendanceById = async (req, res) => {
  try {

    const attendance = await Attendance.findById(req.params.id)
      .populate("employee")
      .populate("booking");

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance not found.",
      });
    }

    // An "employee" role user may only view their own attendance record.
    if (
      req.user.role === "employee" &&
      attendance.employee?.user?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Access Denied",
      });
    }

    res.status(200).json({
      success: true,
      attendance,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Update Attendance
// ======================================
export const updateAttendance = async (req, res) => {
  try {

    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Attendance updated successfully.",
      attendance,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Delete Attendance
// ======================================
export const deleteAttendance = async (req, res) => {
  try {

    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance not found.",
      });
    }

    await attendance.deleteOne();

    res.status(200).json({
      success: true,
      message: "Attendance deleted successfully.",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
