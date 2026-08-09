import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  FileText,
  Wrench,
  Package,
  Briefcase,
  CalendarCheck,
  Building2,
  Wallet,
  BarChart3,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { logout } from "../api/authApi";

const menuItems = [
  {
    title: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Customers",
    path: "/admin/customers",
    icon: Users,
  },
  {
    title: "Bookings",
    path: "/admin/bookings",
    icon: ClipboardList,
  },
  {
    title: "Quotes",
    path: "/admin/quotes",
    icon: FileText,
  },
  {
    title: "Services",
    path: "/admin/services",
    icon: Wrench,
  },
  {
    title: "Inventory",
    path: "/admin/inventory",
    icon: Package,
  },
  {
    title: "Employees",
    path: "/admin/employees",
    icon: Briefcase,
  },
  {
    title: "Attendance",
    path: "/admin/attendance",
    icon: CalendarCheck,
  },
  {
    title: "Departments",
    path: "/admin/departments",
    icon: Building2,
  },
  {
    title: "Accounting",
    path: "/admin/accounting",
    icon: Wallet,
  },
  {
    title: "Reports",
    path: "/admin/reports",
    icon: BarChart3,
  },
  {
    title: "Settings",
    path: "/admin/settings",
    icon: Settings,
  },
];

export default function Sidebar({ open, setOpen }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 min-h-screen flex-col bg-[#0F172A] border-r border-slate-800 shadow-2xl">

        {/* Logo */}
        <div className="h-20 flex items-center justify-center border-b border-slate-800">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Pro Master
          </h1>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-5 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.title}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`
                }
              >
                <Icon size={20} />
                <span className="font-medium">{item.title}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-slate-800 p-5">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-red-400 transition hover:bg-red-500 hover:text-white"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {open && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            {/* Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3 }}
              className="fixed left-0 top-0 z-50 flex h-full w-72 flex-col bg-[#0F172A] border-r border-slate-800 lg:hidden"
            >
              {/* Header */}
              <div className="flex h-20 items-center justify-between border-b border-slate-800 px-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Pro Master
                </h1>

                <button
                  onClick={() => setOpen(false)}
                  className="rounded-xl p-2 hover:bg-slate-800"
                >
                  <X className="text-white" />
                </button>
              </div>

              {/* Menu */}
              <nav className="flex-1 px-5 py-6 space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.title}
                      to={item.path}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-300 ${
                          isActive
                            ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        }`
                      }
                    >
                      <Icon size={20} />
                      <span>{item.title}</span>
                    </NavLink>
                  );
                })}
              </nav>

              {/* Logout */}
              <div className="border-t border-slate-800 p-5">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-red-400 transition hover:bg-red-500 hover:text-white"
                >
                  <LogOut size={20} />
                  Logout
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}