import { motion } from "framer-motion";
import {
  Pencil,
  Trash2,
  Mail,
  Phone,
  Calendar,
  BadgeDollarSign,
} from "lucide-react";

export default function EmployeeTable({
  employees,
  loading,
  loadError,
  onEdit,
  onDelete,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-3xl border border-slate-800 bg-[#111827] shadow-2xl"
    >
      {/* Header */}

      <div className="flex items-center justify-between border-b border-slate-800 p-6">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Employee Directory
          </h2>
          <p className="mt-1 text-slate-400">
            Manage all employees from one place.
          </p>
        </div>

        <div className="rounded-xl bg-cyan-500/10 px-4 py-2 text-cyan-400">
          {employees?.length || 0} Employees
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">
          Loading employees...
        </div>
      ) : loadError ? (
        <div className="p-12 text-center text-red-400">{loadError}</div>
      ) : !employees || employees.length === 0 ? (
        <div className="p-12 text-center text-slate-400">
          No employees yet. Click "Add Employee" to create the first one.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1150px]">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50">
                <th className="px-6 py-4 text-left text-slate-400">
                  Employee
                </th>
                <th className="px-6 py-4 text-left text-slate-400">
                  Department
                </th>
                <th className="px-6 py-4 text-left text-slate-400">Salary</th>
                <th className="px-6 py-4 text-left text-slate-400">
                  Employment
                </th>
                <th className="px-6 py-4 text-left text-slate-400">Joined</th>
                <th className="px-6 py-4 text-left text-slate-400">Status</th>
                <th className="px-6 py-4 text-center text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {employees.map((emp) => (
                <tr
                  key={emp._id}
                  className="border-b border-slate-800 transition-all duration-300 hover:bg-slate-900/60"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-xl font-bold text-white">
                        {emp.fullName?.charAt(0)}
                      </div>

                      <div>
                        <h3 className="font-semibold text-white">
                          {emp.fullName}
                        </h3>
                        <p className="mt-1 flex items-center gap-2 text-sm text-slate-400">
                          <Mail size={14} />
                          {emp.email}
                        </p>
                        <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                          <Phone size={14} />
                          {emp.phone}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6">
                    <div>
                      <span className="rounded-full bg-cyan-500/15 px-4 py-2 text-sm text-cyan-400">
                        {emp.department?.departmentName || "—"}
                      </span>
                      <p className="mt-3 text-sm text-slate-400">
                        {emp.designation}
                      </p>
                    </div>
                  </td>

                  <td className="px-6">
                    <div className="flex items-center gap-2 font-semibold text-emerald-400">
                      <BadgeDollarSign size={18} />${emp.salary}
                    </div>
                  </td>

                  <td className="px-6 text-slate-300">
                    {emp.employmentType}
                  </td>

                  <td className="px-6">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Calendar size={16} />
                      {emp.joiningDate
                        ? new Date(emp.joiningDate).toLocaleDateString(
                            "en-US",
                            { day: "2-digit", month: "short", year: "numeric" }
                          )
                        : "—"}
                    </div>
                  </td>

                  <td className="px-6">
                    <span
                      className={`rounded-full px-4 py-2 text-sm font-medium ${
                        emp.status === "Active"
                          ? "bg-green-500/20 text-green-400"
                          : emp.status === "On Leave"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {emp.status}
                    </span>
                  </td>

                  <td className="px-6">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => onEdit(emp)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 transition hover:scale-110 hover:bg-blue-500 hover:text-white"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        onClick={() => onDelete(emp)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20 text-red-400 transition hover:scale-110 hover:bg-red-500 hover:text-white"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}