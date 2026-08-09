import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";

import ServiceHeader from "../components/ServiceHeader";
import ServiceStats from "../components/ServiceStats";
import ServiceFilters from "../components/ServiceFilters";
import ServiceGrid from "../components/ServiceGrid";
import AddServiceModal from "../components/AddServiceModal";
import EditServiceModal from "../components/EditServiceModal";
import DeleteServiceModal from "../components/DeleteServiceModal";

import { getServices, deleteService } from "../api/serviceApi";

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [status, setStatus] = useState("All Status");

  const [addOpen, setAddOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      setLoadError("");
      const data = await getServices();
      setServices(data?.services || []);
    } catch (error) {
      console.log("Services Error:", error);
      setLoadError(error?.response?.data?.message || "Could not load services.");
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchesSearch =
        !search.trim() || s.serviceName?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "All Categories" || s.category === category;
      const matchesStatus = status === "All Status" || s.status === status;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [services, search, category, status]);

  const handleExport = () => {
    const header = ["Service Name", "Category", "Department", "Price", "Duration", "Status", "Featured"];
    const rows = filteredServices.map((s) => [
      s.serviceName,
      s.category,
      s.department?.departmentName || "",
      s.price,
      s.duration,
      s.status,
      s.featured ? "Yes" : "No",
    ]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "services.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteClick = (service) => {
    setDeleteError("");
    setDeleteTarget(service);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteService(deleteTarget._id);
      setServices((prev) => prev.filter((s) => s._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (error) {
      setDeleteError(error?.response?.data?.message || "Could not delete service.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <ServiceHeader onAddClick={() => setAddOpen(true)} />

        <ServiceStats services={services} loading={loading} />

        <ServiceFilters
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          status={status}
          onStatusChange={setStatus}
          onExport={handleExport}
          onAddClick={() => setAddOpen(true)}
        />

        <ServiceGrid
          services={filteredServices}
          loading={loading}
          loadError={loadError}
          onEdit={(service) => setEditingService(service)}
          onDelete={handleDeleteClick}
        />
      </div>

      <AddServiceModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={loadServices}
      />

      <EditServiceModal
        open={!!editingService}
        onClose={() => setEditingService(null)}
        service={editingService}
        onUpdated={loadServices}
      />

      <DeleteServiceModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDelete={handleConfirmDelete}
        service={deleteTarget}
        deleting={deleting}
        error={deleteError}
      />
    </Layout>
  );
}
