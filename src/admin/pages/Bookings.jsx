import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import BookingHeader from "../components/BookingHeader";
import BookingStats from "../components/BookingStats";
import BookingFilters from "../components/BookingFilters";
import BookingTable from "../components/BookingTable";
import BookingModal from "../components/BookingModal";
import DeleteBookingModal from "../components/DeleteBookingModal";
import {
  getBookings,
  createBooking,
  updateBooking,
  deleteBooking,
  assignEmployees,
  updateBookingStatus,
  updatePaymentStatus,
  getBookingStatistics,
} from "../api/bookingApi";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Status");
  const [date, setDate] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [bookingsRes, statsRes] = await Promise.all([
        getBookings(),
        getBookingStatistics().catch(() => null),
      ]);
      setBookings(bookingsRes?.bookings || []);
      if (statsRes) setStatistics(statsRes.statistics);
    } catch (error) {
      console.log("Bookings Error:", error);
      setLoadError(error?.response?.data?.message || "Could not load bookings.");
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = async () => {
    try {
      const statsRes = await getBookingStatistics();
      setStatistics(statsRes.statistics);
    } catch (error) {
      console.log("Stats refresh error:", error);
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchesSearch =
        !search.trim() ||
        b.customer?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        b.service?.serviceName?.toLowerCase().includes(search.toLowerCase()) ||
        b.bookingNumber?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = status === "All Status" || b.status === status;

      const matchesDate =
        !date || new Date(b.bookingDate).toISOString().slice(0, 10) === date;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [bookings, search, status, date]);

  const handleResetFilters = () => {
    setSearch("");
    setStatus("All Status");
    setDate("");
  };

  const handleExport = () => {
    const header = ["Booking #", "Customer", "Service", "Date", "Time", "Amount", "Payment", "Status"];
    const rows = filteredBookings.map((b) => [
      b.bookingNumber,
      b.customer?.fullName || "",
      b.service?.serviceName || "",
      b.bookingDate ? new Date(b.bookingDate).toLocaleDateString() : "",
      b.bookingTime,
      b.totalAmount,
      b.paymentStatus,
      b.status,
    ]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bookings.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddClick = () => {
    setEditingBooking(null);
    setModalOpen(true);
  };

  const handleEditClick = (booking) => {
    setEditingBooking(booking);
    setModalOpen(true);
  };

  const handleSave = async (formData, assignedEmployeeIds) => {
    setSaving(true);
    try {
      if (editingBooking) {
        const data = await updateBooking(editingBooking._id, formData);
        let updatedBooking = data.booking;

        // Sync employee assignment separately (dedicated endpoint)
        if (
          JSON.stringify(
            (editingBooking.assignedEmployees || []).map((e) => e?._id || e).sort()
          ) !== JSON.stringify([...assignedEmployeeIds].sort())
        ) {
          if (assignedEmployeeIds.length > 0) {
            const assignData = await assignEmployees(editingBooking._id, assignedEmployeeIds);
            updatedBooking = assignData.booking;
          }
        }

        setBookings((prev) =>
          prev.map((b) => (b._id === editingBooking._id ? updatedBooking : b))
        );
      } else {
        const data = await createBooking(formData);
        setBookings((prev) => [data.booking, ...prev]);
      }
      setModalOpen(false);
      setEditingBooking(null);
      refreshStats();
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (booking) => {
    setDeleteError("");
    setDeleteTarget(booking);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteBooking(deleteTarget._id);
      setBookings((prev) => prev.filter((b) => b._id !== deleteTarget._id));
      setDeleteTarget(null);
      refreshStats();
    } catch (error) {
      setDeleteError(error?.response?.data?.message || "Could not delete booking.");
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChange = async (booking, newStatus) => {
    const prevBookings = bookings;
    setBookings((prev) =>
      prev.map((b) => (b._id === booking._id ? { ...b, status: newStatus } : b))
    );
    try {
      await updateBookingStatus(booking._id, newStatus);
      refreshStats();
    } catch (error) {
      setBookings(prevBookings);
      alert(error?.response?.data?.message || "Status update failed.");
    }
  };

  const handlePaymentChange = async (booking, newPaymentStatus) => {
    const prevBookings = bookings;
    setBookings((prev) =>
      prev.map((b) => (b._id === booking._id ? { ...b, paymentStatus: newPaymentStatus } : b))
    );
    try {
      const data = await updatePaymentStatus(booking._id, newPaymentStatus);
      setBookings((prev) => prev.map((b) => (b._id === booking._id ? data.booking : b)));
    } catch (error) {
      setBookings(prevBookings);
      alert(error?.response?.data?.message || "Payment update failed.");
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <BookingHeader onAddClick={handleAddClick} />

        <BookingStats statistics={statistics} loading={loading} />

        <BookingFilters
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          date={date}
          onDateChange={setDate}
          onReset={handleResetFilters}
          onExport={handleExport}
        />

        <BookingTable
          bookings={filteredBookings}
          loading={loading}
          loadError={loadError}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          onStatusChange={handleStatusChange}
          onPaymentChange={handlePaymentChange}
        />

        <BookingModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingBooking(null);
          }}
          onSave={handleSave}
          booking={editingBooking}
          saving={saving}
        />

        <DeleteBookingModal
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDelete={handleConfirmDelete}
          bookingLabel={deleteTarget?.bookingNumber}
          deleting={deleting}
          error={deleteError}
        />
      </div>
    </Layout>
  );
}
