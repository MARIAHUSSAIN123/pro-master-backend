import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";

import QuoteHeader from "../components/quotes/QuoteHeader";
import QuoteStats from "../components/quotes/QuoteStats";
import QuoteTable from "../components/quotes/QuoteTable";
import QuoteModal from "../components/quotes/QuoteModal";
import ConvertQuoteModal from "../components/quotes/ConvertQuoteModal";
import DeleteQuoteModal from "../components/quotes/DeleteQuoteModal";

import {
  getQuotes,
  createQuote,
  deleteQuote,
  sendQuote,
  convertQuote,
  getQuoteStatistics,
} from "../api/quoteApi";
import { getCustomers } from "../api/customerApi";
import { getActiveServices } from "../api/serviceApi";

const PAGE_SIZE = 8;

export default function Quotes() {
  const [quotes, setQuotes] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [convertTarget, setConvertTarget] = useState(null);
  const [converting, setConverting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [quotesRes, statsRes, customersRes, servicesRes] = await Promise.all([
        getQuotes(),
        getQuoteStatistics(),
        getCustomers(),
        getActiveServices(),
      ]);
      setQuotes(quotesRes.quotes || []);
      setStats(statsRes.statistics);
      setCustomers(customersRes.customers || []);
      setServices(servicesRes.services || []);
    } catch (err) {
      console.error("Failed to load quotes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredQuotes = useMemo(() => {
    return quotes.filter((q) => {
      const matchesSearch =
        !search ||
        q.quoteNumber?.toLowerCase().includes(search.toLowerCase()) ||
        q.customer?.fullName?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !status || q.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [quotes, search, status]);

  const paginatedQuotes = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredQuotes.slice(start, start + PAGE_SIZE);
  }, [filteredQuotes, page]);

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  const handleCreate = async (form) => {
    setSaving(true);
    try {
      await createQuote(form);
      setModalOpen(false);
      await loadData();
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async (quote) => {
    try {
      await sendQuote(quote._id);
      await loadData();
    } catch (err) {
      alert(err?.response?.data?.message || "Could not send quote.");
    }
  };

  const handleConvert = async (id, payload) => {
    setConverting(true);
    try {
      await convertQuote(id, payload);
      setConvertTarget(null);
      await loadData();
    } finally {
      setConverting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteQuote(deleteTarget._id);
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      setDeleteError(err?.response?.data?.message || "Failed to delete quote.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <QuoteHeader onAdd={() => setModalOpen(true)} />

        <QuoteStats stats={stats} />

        <QuoteTable
          quotes={paginatedQuotes}
          loading={loading}
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          onSend={handleSend}
          onConvert={setConvertTarget}
          onDelete={setDeleteTarget}
          page={page}
          pageSize={PAGE_SIZE}
          total={filteredQuotes.length}
          onPageChange={setPage}
        />
      </div>

      <QuoteModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleCreate}
        saving={saving}
        customers={customers}
        services={services}
      />

      <ConvertQuoteModal
        open={!!convertTarget}
        onClose={() => setConvertTarget(null)}
        onConvert={handleConvert}
        quote={convertTarget}
        saving={converting}
      />

      <DeleteQuoteModal
        open={!!deleteTarget}
        onClose={() => {
          setDeleteTarget(null);
          setDeleteError("");
        }}
        onDelete={handleDelete}
        quoteLabel={deleteTarget?.quoteNumber}
        deleting={deleting}
        error={deleteError}
      />
    </Layout>
  );
}
