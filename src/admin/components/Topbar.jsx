import { motion } from "framer-motion";
import {
  Menu,
  Bell,
  Search,
  UserCircle2,
} from "lucide-react";

export default function Topbar({
  sidebarOpen,
  setOpen,
}) {
  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-30 border-b border-slate-800 bg-[#101828]/80 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">

        {/* Left */}

        <div className="flex items-center gap-4">

          {/* Mobile Menu */}

          <button
            onClick={() => setOpen(!sidebarOpen)}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 text-white transition hover:bg-cyan-500 lg:hidden"
          >
            <Menu size={22} />
          </button>

          <div>

            <h1 className="text-2xl font-bold text-white">
              Dashboard
            </h1>

            <p className="hidden text-sm text-slate-400 sm:block">
              Welcome back, Administrator 👋
            </p>

          </div>

        </div>

        {/* Right */}

        <div className="flex items-center gap-3">

          {/* Search */}

          <div className="hidden items-center gap-3 rounded-2xl bg-slate-800 px-4 py-3 md:flex">

            <Search
              size={18}
              className="text-cyan-400"
            />

            <input
              type="text"
              placeholder="Search..."
              className="w-48 bg-transparent text-white outline-none placeholder:text-slate-500 xl:w-64"
            />

          </div>

          {/* Notification */}

          <button className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 transition hover:bg-cyan-500">

            <Bell
              size={20}
              className="text-white"
            />

            <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-red-500"></span>

          </button>

          {/* Profile */}

          <div className="flex items-center gap-3 rounded-2xl bg-slate-800 px-3 py-2">

            <UserCircle2
              size={38}
              className="text-cyan-400"
            />

            <div className="hidden lg:block">

              <h3 className="font-semibold text-white">
                Admin
              </h3>

              <p className="text-xs text-slate-400">
                Super Administrator
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* Mobile Search */}

      <div className="px-4 pb-4 md:hidden">

        <div className="flex items-center gap-3 rounded-2xl bg-slate-800 px-4 py-3">

          <Search
            size={18}
            className="text-cyan-400"
          />

          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
          />

        </div>

      </div>

    </motion.header>
  );
}