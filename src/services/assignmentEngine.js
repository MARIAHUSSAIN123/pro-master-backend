import Booking from "../models/Booking.js";
import Employee from "../models/Employee.js";
import Service from "../models/Service.js";
import Attendance from "../models/Attendance.js";

// Spec 3.4 — "An assignment engine that takes into account availability,
// skills, geographic location, and workload."
//
// Field designations that actually perform on-site services. Office
// staff / managers are excluded from the candidate pool.
const FIELD_DESIGNATIONS = ["Cleaner", "Supervisor", "Driver"];

// Scoring weights (sum to 100)
const WEIGHTS = {
  workload: 40,
  location: 35,
  continuity: 15,
  seniority: 10,
};

const startOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d;
};

const endOfWeek = (date) => {
  const d = startOfWeek(date);
  d.setDate(d.getDate() + 7);
  return d;
};

/**
 * Employees already booked at the same date/time (hard conflict —
 * an agent cannot be in two places at once).
 */
const getConflictingEmployeeIds = async (booking) => {
  const conflicts = await Booking.find({
    bookingDate: booking.bookingDate,
    bookingTime: booking.bookingTime,
    status: { $nin: ["Cancelled", "Completed", "Approved"] },
    _id: { $ne: booking._id },
  }).select("assignedEmployees");

  const ids = new Set();
  conflicts.forEach((b) =>
    b.assignedEmployees.forEach((id) => ids.add(id.toString()))
  );
  return ids;
};

/**
 * Employees marked absent/on leave for that specific date
 * (Spec 3.4 — "Management of employee absences, leave, and unavailability").
 */
const getUnavailableEmployeeIds = async (bookingDate) => {
  const dayStart = new Date(bookingDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const records = await Attendance.find({
    date: { $gte: dayStart, $lt: dayEnd },
    status: { $in: ["Leave", "Absent"] },
  }).select("employee");

  return new Set(records.map((r) => r.employee.toString()));
};

/**
 * How many active bookings the employee is already carrying that week
 * (Spec 3.4 — workload balancing).
 */
const getWeeklyWorkload = async (bookingDate) => {
  const bookings = await Booking.find({
    bookingDate: { $gte: startOfWeek(bookingDate), $lt: endOfWeek(bookingDate) },
    status: { $in: ["Assigned", "Confirmed", "In Progress"] },
  }).select("assignedEmployees");

  const counts = {};
  bookings.forEach((b) =>
    b.assignedEmployees.forEach((id) => {
      const key = id.toString();
      counts[key] = (counts[key] || 0) + 1;
    })
  );
  return counts;
};

/**
 * Employees who have previously served this customer — small bonus for
 * continuity (customer familiarity tends to raise quality/productivity,
 * cf. Spec 3.7 quality metrics).
 */
const getPriorEmployeeIdsForCustomer = async (customerId, excludeBookingId) => {
  const past = await Booking.find({
    customer: customerId,
    status: "Completed",
    _id: { $ne: excludeBookingId },
  }).select("assignedEmployees");

  const ids = new Set();
  past.forEach((b) => b.assignedEmployees.forEach((id) => ids.add(id.toString())));
  return ids;
};

const scoreCandidate = ({
  employee,
  booking,
  customerCity,
  weeklyWorkload,
  priorEmployeeIds,
}) => {
  const reasons = [];
  let score = 0;

  // --- Workload (lower current load scores higher) ---
  const load = weeklyWorkload[employee._id.toString()] || 0;
  const workloadScore = Math.max(0, WEIGHTS.workload - load * 8);
  score += workloadScore;
  reasons.push(
    load === 0
      ? "No other jobs scheduled this week"
      : `Already has ${load} job(s) this week`
  );

  // --- Geographic proximity (single-service-area assumption -> city match) ---
  if (employee.city && customerCity) {
    if (employee.city.trim().toLowerCase() === customerCity.trim().toLowerCase()) {
      score += WEIGHTS.location;
      reasons.push(`Based in ${employee.city} — same city as customer`);
    } else {
      reasons.push(`Based in ${employee.city}, job is in ${customerCity}`);
    }
  } else {
    // Missing location data shouldn't unfairly zero out a candidate.
    score += WEIGHTS.location * 0.4;
    reasons.push("Location on file is incomplete");
  }

  // --- Continuity with this customer ---
  if (priorEmployeeIds.has(employee._id.toString())) {
    score += WEIGHTS.continuity;
    reasons.push("Has served this customer before");
  }

  // --- Seniority / team-lead fit for multi-agent jobs ---
  if (booking.employeesRequired > 1 && employee.designation === "Supervisor") {
    score += WEIGHTS.seniority;
    reasons.push("Supervisor — good fit to lead a multi-agent job");
  }

  return { score: Math.round(score), reasons };
};

/**
 * Rank eligible employees for a booking.
 * Returns { suggestions, understaffed, employeesRequired }
 */
export const suggestAgentsForBooking = async (bookingId) => {
  const booking = await Booking.findById(bookingId).populate("customer service");
  if (!booking) {
    const err = new Error("Booking not found.");
    err.statusCode = 404;
    throw err;
  }

  const service = booking.service;
  if (!service) {
    const err = new Error("Booking has no linked service.");
    err.statusCode = 400;
    throw err;
  }

  const [conflictingIds, unavailableIds, weeklyWorkload, priorEmployeeIds] =
    await Promise.all([
      getConflictingEmployeeIds(booking),
      getUnavailableEmployeeIds(booking.bookingDate),
      getWeeklyWorkload(booking.bookingDate),
      getPriorEmployeeIdsForCustomer(booking.customer._id, booking._id),
    ]);

  // Skill match — same department as the requested service, and a
  // field-facing designation (Spec 3.4 "skills").
  const candidates = await Employee.find({
    status: "Active",
    department: service.department,
    designation: { $in: FIELD_DESIGNATIONS },
  });

  const eligible = candidates.filter(
    (e) =>
      !conflictingIds.has(e._id.toString()) &&
      !unavailableIds.has(e._id.toString())
  );

  const scored = eligible
    .map((employee) =>
      Object.assign(
        {
          employeeId: employee._id,
          fullName: employee.fullName,
          designation: employee.designation,
          city: employee.city,
        },
        scoreCandidate({
          employee,
          booking: { employeesRequired: service.employeesRequired },
          customerCity: booking.customer.city,
          weeklyWorkload,
          priorEmployeeIds,
        })
      )
    )
    .sort((a, b) => b.score - a.score);

  const employeesRequired = service.employeesRequired || 1;

  return {
    employeesRequired,
    suggestions: scored,
    understaffed: scored.length < employeesRequired,
    excludedCount: candidates.length - eligible.length,
  };
};

/**
 * Scan a date range for staffing problems (Spec 3.4 — "Detection of
 * scheduling conflicts and alerts for understaffing or overstaffing").
 */
export const getStaffingAlerts = async ({ from, to }) => {
  const start = from ? new Date(from) : new Date();
  start.setHours(0, 0, 0, 0);
  const end = to ? new Date(to) : new Date(start);
  if (!to) end.setDate(end.getDate() + 7);
  end.setHours(23, 59, 59, 999);

  const bookings = await Booking.find({
    bookingDate: { $gte: start, $lte: end },
    status: { $in: ["Pending", "Confirmed", "Assigned", "In Progress"] },
  }).populate("service", "employeesRequired department serviceName");

  const alerts = [];

  for (const booking of bookings) {
    const required = booking.service?.employeesRequired || 1;
    const assigned = booking.assignedEmployees.length;

    if (assigned < required) {
      alerts.push({
        type: "understaffed",
        bookingId: booking._id,
        bookingNumber: booking.bookingNumber,
        date: booking.bookingDate,
        service: booking.service?.serviceName,
        required,
        assigned,
        message: `Needs ${required - assigned} more agent(s)`,
      });
    }
  }

  // Overstaffing signal: department has many idle Active employees
  // relative to how many unassigned/upcoming jobs exist for it in range.
  const byDepartment = {};
  bookings.forEach((b) => {
    const dep = b.service?.department?.toString();
    if (!dep) return;
    byDepartment[dep] = (byDepartment[dep] || 0) + 1;
  });

  const departments = Object.keys(byDepartment);
  for (const dep of departments) {
    const activeCount = await Employee.countDocuments({
      status: "Active",
      department: dep,
      designation: { $in: FIELD_DESIGNATIONS },
    });
    // Heuristic: if there are more than 2x idle agents than jobs in the
    // window, flag possible overstaffing for that department.
    if (activeCount > byDepartment[dep] * 2 && activeCount > 3) {
      alerts.push({
        type: "overstaffed",
        department: dep,
        activeEmployees: activeCount,
        jobsInRange: byDepartment[dep],
        message: `${activeCount} active agents vs only ${byDepartment[dep]} job(s) in this period`,
      });
    }
  }

  return alerts;
};
