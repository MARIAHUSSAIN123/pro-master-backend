import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B1220] flex overflow-hidden">

      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex flex-1 flex-col min-w-0">

        {/* Topbar */}
        <Topbar
          sidebarOpen={sidebarOpen}
          setOpen={setSidebarOpen}
        />

        {/* Page Content */}
        <main
          className="
            flex-1
            overflow-y-auto
            overflow-x-hidden
            p-4
            sm:p-6
            lg:p-8
          "
        >
          {children}
        </main>

      </div>

    </div>
  );
}