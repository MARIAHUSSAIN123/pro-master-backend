import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import EmployeeHeader from "../components/EmployeeHeader";
import EmployeeTable from "../components/EmployeeTable";
import EmployeeModal from "../components/EmployeeModal";
import DeleteEmployeeModal from "../components/DeleteEmployeeModal";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../api/employeeApi";
import { getDepartments } from "../api/departmentApi";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [departments, setDepartments] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    loadEmployees();
    loadDepartments();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setLoadError("");
      const data = await getEmployees();
      setEmployees(data?.employees || []);
    } catch (error) {
      setLoadError(
        error?.response?.data?.message || "Could not load employees."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const data = await getDepartments();
      setDepartments(data?.departments || []);
    } catch (error) {
      // Non-fatal — the modal will just show an empty department list.
      console.log("Departments Error:", error);
    }
  };

  const handleAddClick = () => {
    setEditingEmployee(null);
    setModalOpen(true);
  };

  const handleEditClick = (employee) => {
    setEditingEmployee(employee);
    setModalOpen(true);
  };

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      if (editingEmployee) {
        const data = await updateEmployee(editingEmployee._id, formData);
        setEmployees((prev) =>
          prev.map((e) => (e._id === editingEmployee._id ? data.employee : e))
        );
      } else {
        const data = await createEmployee(formData);
        setEmployees((prev) => [data.employee, ...prev]);
      }
      setModalOpen(false);
      setEditingEmployee(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (employee) => {
    setDeleteError("");
    setDeleteTarget(employee);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteEmployee(deleteTarget._id);
      setEmployees((prev) => prev.filter((e) => e._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (error) {
      setDeleteError(
        error?.response?.data?.message || "Could not delete employee."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <EmployeeHeader onAdd={handleAddClick} />

        <EmployeeTable
          employees={employees}
          loading={loading}
          loadError={loadError}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      </div>

      <EmployeeModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingEmployee(null);
        }}
        onSave={handleSave}
        employee={editingEmployee}
        departments={departments}
        saving={saving}
      />

      <DeleteEmployeeModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDelete={handleConfirmDelete}
        employeeName={deleteTarget?.fullName}
        deleting={deleting}
        error={deleteError}
      />
    </Layout>
  );
}