import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";

import InventoryHeader from "../components/inventory/InventoryHeader";
import InventoryStats from "../components/inventory/InventoryStats";
import InventoryTable from "../components/inventory/InventoryTable";
import ItemModal from "../components/inventory/ItemModal";
import StockModal from "../components/inventory/StockModal";
import AssignModal from "../components/inventory/AssignModal";
import MaintenanceModal from "../components/inventory/MaintenanceModal";
import DeleteItemModal from "../components/inventory/DeleteItemModal";

import {
  getInventoryItems,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  stockIn,
  stockOut,
  assignInventoryItem,
  unassignInventoryItem,
  logMaintenance,
} from "../api/inventoryApi";
import { getDepartments } from "../api/departmentApi";
import { getEmployees } from "../api/employeeApi";

const PAGE_SIZE = 8;

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [itemType, setItemType] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [page, setPage] = useState(1);

  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);

  const [stockTarget, setStockTarget] = useState(null);
  const [stockMode, setStockMode] = useState("in");
  const [stockSaving, setStockSaving] = useState(false);

  const [assignTarget, setAssignTarget] = useState(null);
  const [assignSaving, setAssignSaving] = useState(false);

  const [maintenanceTarget, setMaintenanceTarget] = useState(null);
  const [maintenanceSaving, setMaintenanceSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [itemsRes, deptRes, empRes] = await Promise.all([
        getInventoryItems(),
        getDepartments(),
        getEmployees(),
      ]);
      setItems(itemsRes.items || []);
      setDepartments(deptRes.departments || []);
      setEmployees(empRes.employees || []);
    } catch (err) {
      console.error("Failed to load inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((it) => {
      const matchesSearch =
        !search ||
        it.itemName?.toLowerCase().includes(search.toLowerCase()) ||
        it.sku?.toLowerCase().includes(search.toLowerCase());
      const matchesType = !itemType || it.itemType === itemType;
      const matchesLowStock = !lowStockOnly || it.quantity <= it.reorderThreshold;
      return matchesSearch && matchesType && matchesLowStock;
    });
  }, [items, search, itemType, lowStockOnly]);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, page]);

  useEffect(() => {
    setPage(1);
  }, [search, itemType, lowStockOnly]);

  const lowStockCount = useMemo(
    () => items.filter((i) => i.quantity <= i.reorderThreshold).length,
    [items]
  );

  // ---- Item CRUD ----
  const openAddModal = () => {
    setEditingItem(null);
    setItemModalOpen(true);
  };
  const openEditModal = (item) => {
    setEditingItem(item);
    setItemModalOpen(true);
  };

  const handleSaveItem = async (form) => {
    setSaving(true);
    try {
      if (editingItem) {
        await updateInventoryItem(editingItem._id, form);
      } else {
        await createInventoryItem(form);
      }
      setItemModalOpen(false);
      setEditingItem(null);
      await loadData();
    } finally {
      setSaving(false);
    }
  };

  // ---- Stock In/Out ----
  const openStockModal = (item, mode) => {
    setStockTarget(item);
    setStockMode(mode);
  };
  const handleStockSubmit = async (id, payload) => {
    setStockSaving(true);
    try {
      if (stockMode === "in") await stockIn(id, payload);
      else await stockOut(id, payload);
      setStockTarget(null);
      await loadData();
    } finally {
      setStockSaving(false);
    }
  };

  // ---- Assign ----
  const handleAssign = async (id, employeeId) => {
    setAssignSaving(true);
    try {
      await assignInventoryItem(id, employeeId);
      setAssignTarget(null);
      await loadData();
    } finally {
      setAssignSaving(false);
    }
  };
  const handleUnassign = async (id) => {
    setAssignSaving(true);
    try {
      await unassignInventoryItem(id);
      setAssignTarget(null);
      await loadData();
    } finally {
      setAssignSaving(false);
    }
  };

  // ---- Maintenance ----
  const handleMaintenance = async (id, payload) => {
    setMaintenanceSaving(true);
    try {
      await logMaintenance(id, payload);
      setMaintenanceTarget(null);
      await loadData();
    } finally {
      setMaintenanceSaving(false);
    }
  };

  // ---- Delete ----
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteInventoryItem(deleteTarget._id);
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      setDeleteError(err?.response?.data?.message || "Failed to delete item.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <InventoryHeader onAdd={openAddModal} lowStockCount={lowStockCount} />

        <InventoryStats items={items} />

        <InventoryTable
          items={paginatedItems}
          loading={loading}
          search={search}
          onSearchChange={setSearch}
          itemType={itemType}
          onItemTypeChange={setItemType}
          lowStockOnly={lowStockOnly}
          onLowStockToggle={setLowStockOnly}
          onStockIn={(item) => openStockModal(item, "in")}
          onStockOut={(item) => openStockModal(item, "out")}
          onAssign={setAssignTarget}
          onMaintenance={setMaintenanceTarget}
          onEdit={openEditModal}
          onDelete={setDeleteTarget}
          page={page}
          pageSize={PAGE_SIZE}
          total={filteredItems.length}
          onPageChange={setPage}
        />
      </div>

      <ItemModal
        open={itemModalOpen}
        onClose={() => {
          setItemModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
        item={editingItem}
        saving={saving}
        departments={departments}
      />

      <StockModal
        open={!!stockTarget}
        onClose={() => setStockTarget(null)}
        onSubmit={handleStockSubmit}
        item={stockTarget}
        mode={stockMode}
        saving={stockSaving}
      />

      <AssignModal
        open={!!assignTarget}
        onClose={() => setAssignTarget(null)}
        onAssign={handleAssign}
        onUnassign={handleUnassign}
        item={assignTarget}
        employees={employees}
        saving={assignSaving}
      />

      <MaintenanceModal
        open={!!maintenanceTarget}
        onClose={() => setMaintenanceTarget(null)}
        onSubmit={handleMaintenance}
        item={maintenanceTarget}
        saving={maintenanceSaving}
      />

      <DeleteItemModal
        open={!!deleteTarget}
        onClose={() => {
          setDeleteTarget(null);
          setDeleteError("");
        }}
        onDelete={handleDelete}
        itemLabel={deleteTarget?.itemName}
        deleting={deleting}
        error={deleteError}
      />
    </Layout>
  );
}
