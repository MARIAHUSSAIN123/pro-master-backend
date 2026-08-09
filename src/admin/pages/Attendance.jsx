import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";

import AttendanceHeader from "../components/AttendanceHeader";
import AttendanceStats from "../components/AttendanceStats";
import AttendanceFilters from "../components/AttendanceFilters";
import AttendanceTable from "../components/AttendanceTable";
import MarkAttendanceModal from "../components/MarkAttendanceModal";
import AttendanceDetailsModal from "../components/AttendanceDetailsModal";
import DeleteAttendanceModal from "../components/DeleteAttendanceModal";

import {
  getAttendance,
  markAttendance,
  updateAttendance,
  deleteAttendance,
  checkInEmployee,
  checkOutEmployee,
} from "../api/attendanceApi";
import { getEmployees } from "../api/employeeApi";

const PAGE_SIZE = 8;

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [saving, setSaving] = useState(false);

  const [detailsRecord, setDetailsRecord] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [attRes, empRes] = await Promise.all([getAttendance(), getEmployees()]);
      setRecords(attRes.attendance || []);
      setEmployees(empRes.employees || []);
    } catch (err) {
      console.error("Failed to load attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Map: departmentId -> departmentName (built from the employees list,
  // since the attendance API only returns the raw department id)
  const departmentMap = useMemo(() => {
    const map = {};
    employees.forEach((e) => {
      if (e.department?._id) map[e.department._id] = e.department.departmentName;
    });
    return map;
  }, [employees]);

  const departmentNames = useMemo(
    () => [...new Set(Object.values(departmentMap))],
    [departmentMap]
  );

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const name = (r.employee?.fullName || "").toLowerCase();
      const matchesSearch = !search || name.includes(search.toLowerCase());
      const matchesDept =
        !department || departmentMap[r.employee?.department] === department;
      const matchesStatus = !status || r.status === status;
      const matchesDate =
        !date || (r.date && new Date(r.date).toISOString().slice(0, 10) === date);
      return matchesSearch && matchesDept && matchesStatus && matchesDate;
    });
  }, [records, search, department, status, date, departmentMap]);

  const paginatedRecords = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredRecords.slice(start, start + PAGE_SIZE);
  }, [filteredRecords, page]);

  useEffect(() => {
    setPage(1);
  }, [search, department, status, date]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todays = records.filter(
      (r) => r.date && new Date(r.date).toISOString().slice(0, 10) === today
    );
    return {
      present: todays.filter((r) => r.status === "Present").length,
      absent: todays.filter((r) => r.status === "Absent").length,
      late: todays.filter((r) => r.status === "Late").length,
      leave: todays.filter((r) => r.status === "Leave" || r.status === "Half Day").length,
    };
  }, [records]);

  // ---- Mark / Edit ----
  const openMarkModal = () => {
    setEditingRecord(null);
    setModalOpen(true);
  };
  const openEditModal = (record) => {
    setEditingRecord(record);
    setModalOpen(true);
    setDetailsRecord(null);
  };

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (editingRecord) {
        await updateAttendance(editingRecord._id, form);
      } else {
        await markAttendance(form);
      }
      setModalOpen(false);
      setEditingRecord(null);
      await loadData();
    } finally {
      setSaving(false);
    }
  };

  // ---- Delete ----
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteAttendance(deleteTarget._id);
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      setDeleteError(err?.response?.data?.message || "Failed to delete record.");
    } finally {
      setDeleting(false);
    }
  };

  // ---- Check In / Out ----
  const handleCheckIn = async (record) => {
    try {
      await checkInEmployee(record._id);
      await loadData();
    } catch (err) {
      alert(err?.response?.data?.message || "Check-in failed.");
    }
  };

  const handleCheckOut = async (record) => {
    try {
      await checkOutEmployee(record._id);
      await loadData();
    } catch (err) {
      alert(err?.response?.data?.message || "Check-out failed.");
    }
  };

  // ---- Export CSV ----
  const handleExport = () => {
    const rows = [
      ["Employee", "Department", "Date", "Check In", "Check Out", "Hours", "Status"],
      ...filteredRecords.map((r) => [
        r.employee?.fullName || "",
        departmentMap[r.employee?.department] || "",
        r.date ? new Date(r.date).toISOString().slice(0, 10) : "",
        r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : "",
        r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : "",
        r.hoursWorked || "",
        r.status,
      ]),
    ];
    const csv = rows.map((row) => row.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "attendance.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="space-y-8">
        <AttendanceHeader onMark={openMarkModal} />

        <AttendanceStats stats={stats} />

        <AttendanceFilters
          search={search}
          onSearchChange={setSearch}
          department={department}
          onDepartmentChange={setDepartment}
          departments={departmentNames}
          status={status}
          onStatusChange={setStatus}
          date={date}
          onDateChange={setDate}
          onExport={handleExport}
          onMark={openMarkModal}
        />

        <AttendanceTable
          records={paginatedRecords}
          loading={loading}
          departmentMap={departmentMap}
          page={page}
          pageSize={PAGE_SIZE}
          total={filteredRecords.length}
          onPageChange={setPage}
          onView={setDetailsRecord}
          onEdit={openEditModal}
          onDelete={setDeleteTarget}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
        />
      </div>

      <MarkAttendanceModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingRecord(null);
        }}
        onSave={handleSave}
        record={editingRecord}
        saving={saving}
        employees={employees}
      />

      <AttendanceDetailsModal
        open={!!detailsRecord}
        onClose={() => setDetailsRecord(null)}
        record={detailsRecord}
        departmentName={
          detailsRecord ? departmentMap[detailsRecord.employee?.department] || "--" : "--"
        }
        onEdit={() => openEditModal(detailsRecord)}
      />

      <DeleteAttendanceModal
        open={!!deleteTarget}
        onClose={() => {
          setDeleteTarget(null);
          setDeleteError("");
        }}
        onDelete={handleDelete}
        recordLabel={deleteTarget ? `${deleteTarget.employee?.fullName}'s record` : ""}
        deleting={deleting}
        error={deleteError}
      />
    </Layout>
  );
}
