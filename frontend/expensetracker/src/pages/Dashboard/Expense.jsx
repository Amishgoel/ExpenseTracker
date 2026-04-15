import React, { useEffect, useState } from "react";
import { api } from "../../api/axios";
import { FiTrash2, FiEdit2, FiDownload, FiSearch } from "react-icons/fi";
import moment from "moment";
import toast from "react-hot-toast";
import DeleteConfirmModal from "../../components/DeleteConfirmModal";
import * as XLSX from "xlsx";

const EXPENSE_CATEGORIES = ["Food", "Transport", "Rent", "Utilities", "Shopping", "Health", "Entertainment", "Other"];

const Expense = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ amount: "", category: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [editTx, setEditTx] = useState(null);
  const [editForm, setEditForm] = useState({ amount: "", category: "", description: "" });
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [search, setSearch] = useState("");
  const [range, setRange] = useState("month");

  const fetchTransactions = async () => {
    try {
      const params = {};
      if (range === "month") {
        params.startDate = moment().startOf("month").toISOString();
        params.endDate = moment().toISOString();
      } else if (range === "year") {
        params.startDate = moment().startOf("year").toISOString();
        params.endDate = moment().toISOString();
      }
      const qs = new URLSearchParams(params).toString();
      const res = await api.get(`/transactions?type=expense${qs ? `&${qs}` : ""}`);
      setTransactions(res.data);
    } catch (err) {
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [range]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.category) {
      toast.error("Amount and category are required");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/transactions", { ...form, type: "expense" });
      toast.success("Expense added");
      setForm({ amount: "", category: "", description: "" });
      fetchTransactions();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add expense");
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (tx) => {
    setEditTx(tx);
    setEditForm({ amount: String(tx.amount), category: tx.category, description: tx.description || "" });
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editForm.amount || !editForm.category) return;
    try {
      await api.patch(`/transactions/${editTx._id}`, editForm);
      toast.success("Expense updated");
      setEditTx(null);
      fetchTransactions();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/transactions/${id}`);
      toast.success("Deleted");
      fetchTransactions();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const filtered = transactions.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.category?.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      String(t.amount).includes(q)
    );
  });

  const total = filtered.reduce((sum, t) => sum + t.amount, 0);

  const handleExport = () => {
    const rows = filtered.map((t) => ({
      Date: moment(t.date).format("YYYY-MM-DD"),
      Category: t.category,
      Amount: t.amount,
      Description: t.description || "",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Expense");
    XLSX.writeFile(wb, `expense-${moment().format("YYYY-MM-DD")}.xlsx`);
    toast.success("Expenses exported");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-8">Expense</h1>

      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search category, description, amount..."
            className="w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="md:w-48 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
        >
          <option value="month">This month</option>
          <option value="year">This year</option>
          <option value="all">All time</option>
        </select>
        <button
          onClick={handleExport}
          className="md:w-44 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 text-slate-900 rounded-xl hover:bg-amber-600 font-semibold"
        >
          <FiDownload />
          Export
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="font-semibold text-slate-800 dark:text-white mb-4">Add Expense</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">Select category</option>
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Description (optional)</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Note"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 disabled:opacity-50 font-medium"
              >
                Add Expense
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-slate-800 dark:text-white">Expense History</h2>
              <p className="text-red-600 font-bold">Total: ₹{total.toLocaleString()}</p>
            </div>
            {loading ? (
              <p className="text-slate-500 dark:text-slate-400">Loading...</p>
            ) : filtered.length === 0 ? (
              <p className="text-slate-400 dark:text-slate-500 text-center py-12">No expenses recorded yet</p>
            ) : (
              <div className="space-y-2">
                {filtered.map((tx) => (
                  <div
                    key={tx._id}
                    className="flex justify-between items-center py-3 px-4 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-100">{tx.category}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {tx.description || "—"} · {moment(tx.date).format("MMM D")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-red-600 font-semibold">-₹{tx.amount.toLocaleString()}</span>
                      <button onClick={() => openEdit(tx)} className="text-slate-400 hover:text-amber-600 p-1" title="Edit">
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        onClick={() => setDeleteModal({ open: true, id: tx._id })}
                        className="text-slate-400 hover:text-red-500 p-1"
                        title="Delete"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {editTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setEditTx(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-xl w-full max-w-sm mx-4 border border-slate-200 dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">Edit Expense</h3>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Amount (₹)</label>
                <input type="number" min="0" step="0.01" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                  className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Category</label>
                <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-500" required>
                  {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Description</label>
                <input type="text" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-500" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setEditTx(null)} className="flex-1 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={() => deleteModal.id && handleDelete(deleteModal.id)}
        title="Delete Expense"
        message="This expense entry will be permanently removed."
      />
    </div>
  );
};

export default Expense;
