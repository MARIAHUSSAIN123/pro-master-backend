import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import CustomerTable from "../components/CustomerTable";
import CustomerHeader from "../components/CustomerHeader";
import CustomerModal from "../components/CustomerModal";
import DeleteCustomerModal from "../components/DeleteCustomerModal";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../api/customerApi";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setLoadError("");
      const data = await getCustomers();
      setCustomers(data?.customers || []);
    } catch (error) {
      console.log("Customers Error:", error);
      setLoadError(
        error?.response?.data?.message || "Could not load customers."
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.toLowerCase();
    return customers.filter(
      (c) =>
        c.fullName?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.city?.toLowerCase().includes(q)
    );
  }, [customers, search]);

  const handleAddClick = () => {
    setEditingCustomer(null);
    setModalOpen(true);
  };

  const handleEditClick = (customer) => {
    setEditingCustomer(customer);
    setModalOpen(true);
  };

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      if (editingCustomer) {
        const data = await updateCustomer(editingCustomer._id, formData);
        setCustomers((prev) =>
          prev.map((c) => (c._id === editingCustomer._id ? data.customer : c))
        );
      } else {
        const data = await createCustomer(formData);
        setCustomers((prev) => [data.customer, ...prev]);
      }
      setModalOpen(false);
      setEditingCustomer(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (customer) => {
    setDeleteError("");
    setDeleteTarget(customer);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteCustomer(deleteTarget._id);
      setCustomers((prev) => prev.filter((c) => c._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (error) {
      setDeleteError(
        error?.response?.data?.message || "Could not delete customer."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <CustomerHeader total={customers.length} onAdd={handleAddClick} />

        <CustomerTable
          customers={filteredCustomers}
          loading={loading}
          loadError={loadError}
          search={search}
          onSearchChange={setSearch}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      </div>

      <CustomerModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingCustomer(null);
        }}
        onSave={handleSave}
        customer={editingCustomer}
        saving={saving}
      />

      <DeleteCustomerModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDelete={handleConfirmDelete}
        customerName={deleteTarget?.fullName}
        deleting={deleting}
        error={deleteError}
      />
    </Layout>
  );
}
