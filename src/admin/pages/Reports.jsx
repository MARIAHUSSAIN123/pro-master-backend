import { useEffect, useState } from "react";
import Layout from "../components/Layout";

import ReportsHeader from "../components/reports/ReportsHeader";
import ReportStatsCards from "../components/reports/ReportStatsCards";
import RevenueTrendChart from "../components/reports/RevenueTrendChart";
import BookingStatusBreakdown from "../components/reports/BookingStatusBreakdown";
import AgentProductivityTable from "../components/reports/AgentProductivityTable";
import ExportPanel from "../components/reports/ExportPanel";

import { getDashboardStats } from "../api/reportApi";
import {
  exportBookingsCSV,
  exportBookingsExcel,
  exportBookingsPDF,
  exportInvoicesCSV,
  exportInvoicesExcel,
  exportInvoicesPDF,
} from "../api/reportApi";

export default function Reports() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getDashboardStats();
      setDashboard(res.dashboard);
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExport = async (fn, label) => {
    try {
      await fn();
    } catch (err) {
      alert(`Failed to export ${label}.`);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex h-64 items-center justify-center text-slate-400">
          Loading reports...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <ReportsHeader onExport={() => handleExport(exportBookingsCSV, "bookings")} />

        <ReportStatsCards dashboard={dashboard} />

        <div className="grid gap-8 xl:grid-cols-2">
          <RevenueTrendChart revenueTrend={dashboard?.billing?.revenueTrend} />
          <BookingStatusBreakdown
            bookingStatus={dashboard?.bookingStatus}
            totalBookings={dashboard?.totalBookings}
          />
        </div>

        <AgentProductivityTable agents={dashboard?.agentProductivity} />

        <ExportPanel
          onBookingsCSV={() => handleExport(exportBookingsCSV, "bookings CSV")}
          onBookingsExcel={() => handleExport(exportBookingsExcel, "bookings Excel")}
          onBookingsPDF={() => handleExport(exportBookingsPDF, "bookings PDF")}
          onInvoicesCSV={() => handleExport(exportInvoicesCSV, "invoices CSV")}
          onInvoicesExcel={() => handleExport(exportInvoicesExcel, "invoices Excel")}
          onInvoicesPDF={() => handleExport(exportInvoicesPDF, "invoices PDF")}
        />
      </div>
    </Layout>
  );
}
