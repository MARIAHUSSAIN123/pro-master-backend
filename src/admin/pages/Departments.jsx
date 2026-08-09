import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import DepartmentHeader from "../components/DepartmentHeader";
import DepartmentGrid from "../components/DepartmentGrid";
import AddDepartmentModal from "../components/AddDepartmentModal";
import EditDepartmentModal from "../components/EditDepartmentModal";
import DeleteDepartmentModal from "../components/DeleteDepartmentModal";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../api/departmentApi";

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editingDepartment, setEditingDepartment] = useState(null);
  const [editSaving, setEditSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      setLoadError("");
      const data = await getDepartments();
      setDepartments(data?.departments || []);
    } catch (error) {
      setLoadError(
        error?.response?.data?.message || "Could not load departments."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddSave = async (formData) => {
    setSaving(true);
    try {
      const data = await createDepartment(formData);
      setDepartments((prev) => [data.department, ...prev]);
      setAddOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleEditSave = async (formData) => {
    setEditSaving(true);
    try {
      const data = await updateDepartment(editingDepartment._id, formData);
      setDepartments((prev) =>
        prev.map((d) => (d._id === editingDepartment._id ? data.department : d))
      );
      setEditingDepartment(null);
    } finally {
      setEditSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteDepartment(deleteTarget._id);
      setDepartments((prev) => prev.filter((d) => d._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (error) {
      setDeleteError(
        error?.response?.data?.message || "Could not delete department."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <DepartmentHeader
          total={departments.length}
          onAdd={() => setAddOpen(true)}
        />

        <DepartmentGrid
          departments={departments}
          loading={loading}
          loadError={loadError}
          onEdit={(dept) => setEditingDepartment(dept)}
          onDelete={(dept) => {
            setDeleteError("");
            setDeleteTarget(dept);
          }}
        />
      </div>

      <AddDepartmentModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={handleAddSave}
        saving={saving}
      />

      <EditDepartmentModal
        open={!!editingDepartment}
        onClose={() => setEditingDepartment(null)}
        onSave={handleEditSave}
        department={editingDepartment}
        saving={editSaving}
      />

      <DeleteDepartmentModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDelete={handleConfirmDelete}
        department={deleteTarget}
        deleting={deleting}
        error={deleteError}
      />
    </Layout>
  );
}