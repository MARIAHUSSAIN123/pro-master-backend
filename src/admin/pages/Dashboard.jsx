import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import DashboardCard from "../components/DashboardCard";
import RecentBookings from "../components/RecentBookings";
import BookingChart from "../components/charts/BookingChart";
import AccountingSummary from "../components/AccountingSummary";
import RecentPayments from "../components/RecentPayments";
import TopEmployees from "../components/TopEmployees";
import Notifications from "../components/Notifications";
import StripeButton from "../components/StripeButton";

import {
  Users,
  Briefcase,
  ClipboardList,
  DollarSign,
} from "lucide-react";

import { getDashboard } from "../services/dashboardService";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalCustomers: 0,
    totalBookings: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await getDashboard();

      if (data?.dashboard) {
        setStats(data.dashboard);
      }
    } catch (error) {
      console.log("Dashboard Error:", error);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white">
            Welcome Back 👋
          </h1>

          <p className="text-slate-400 mt-2">
            Here's what's happening today.
          </p>
        </div>

        {/* ================= Dashboard Cards ================= */}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          <DashboardCard
            title="Employees"
            value={stats.totalEmployees}
            icon={Briefcase}
            gradient="bg-gradient-to-r from-cyan-500 to-blue-600"
          />

          <DashboardCard
            title="Customers"
            value={stats.totalCustomers}
            icon={Users}
            gradient="bg-gradient-to-r from-purple-500 to-pink-500"
          />

          <DashboardCard
            title="Bookings"
            value={stats.totalBookings}
            icon={ClipboardList}
            gradient="bg-gradient-to-r from-orange-500 to-red-500"
          />

          <DashboardCard
            title="Revenue"
            value={`$${stats.totalRevenue}`}
            icon={DollarSign}
            gradient="bg-gradient-to-r from-green-500 to-emerald-600"
          />

        </div>

        {/* ================= Chart + Accounting ================= */}

        <div className="grid gap-6 xl:grid-cols-3">

          <div className="xl:col-span-2">
            <BookingChart />
          </div>

          <AccountingSummary />
          <StripeButton />

        </div>

        {/* ================= Payments + Employees + Notifications ================= */}

        <div className="grid gap-6 lg:grid-cols-3">

          <RecentPayments />

          <TopEmployees />

          <Notifications />

        </div>

        {/* ================= Recent Bookings ================= */}

        <RecentBookings />

      </div>
    </Layout>
  );
}