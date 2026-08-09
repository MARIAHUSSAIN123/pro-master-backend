import {
  Search,
  Download,
  Plus,
  Filter,
} from "lucide-react";

export default function DepartmentFilters() {
  return (
    <div className="rounded-3xl border border-slate-800 bg-[#111827] p-6 shadow-xl">

      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

        {/* Left */}

        <div className="flex flex-1 flex-col gap-4 lg:flex-row">

          {/* Search */}

          <div className="relative flex-1">

            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search department..."
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 py-3 pl-12 pr-4 text-white outline-none transition focus:border-cyan-500"
            />

          </div>

          {/* Manager */}

          <select className="rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-white outline-none focus:border-cyan-500">

            <option>All Managers</option>
            <option>John Smith</option>
            <option>Sarah Wilson</option>
            <option>Ali Khan</option>
            <option>Ahmed Ali</option>

          </select>

          {/* Status */}

          <select className="rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-white outline-none focus:border-cyan-500">

            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>

          </select>

        </div>

        {/* Right */}

        <div className="flex flex-wrap gap-3">

          <button className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-white transition hover:border-cyan-500 hover:bg-slate-800">

            <Filter size={18} />

            Filters

          </button>

          <button className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-white transition hover:border-cyan-500 hover:bg-slate-800">

            <Download size={18} />

            Export

          </button>

          <button className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105">

            <Plus size={18} />

            Add Department

          </button>

        </div>

      </div>

    </div>
  );
}