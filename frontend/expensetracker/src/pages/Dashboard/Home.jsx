import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/axios";
import { FiTrendingUp, FiTrendingDown, FiPocket, FiDownload, FiZap } from "react-icons/fi";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import moment from "moment";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import AiInsightsModal from "../../components/AiInsightsModal";

const COLORS = { income: "#10b981", expense: "#ef4444" };

const DATE_RANGES = [
  { label: "All time", value: "" },
  { label: "This month", value: "month" },
  { label: "Last month", value: "lastMonth" },
  { label: "This year", value: "year" },
];

const getDateParams = (range) => {
  if (!range) return {};
  const now = moment();
  if (range === "month") {
    return { startDate: now.startOf("month").toISOString(), endDate: now.toISOString() };
  }
  if (range === "lastMonth") {
    const last = now.clone().subtract(1, "month");
    return { startDate: last.startOf("month").toISOString(), endDate: last.endOf("month").toISOString() };
  }
  if (range === "year") {
    return { startDate: now.startOf("year").toISOString(), endDate: now.toISOString() };
  }
  return {};
};

const Home = () => {
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("");
  const [aiOpen, setAiOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMode, setAiMode] = useState("offline");
  const [aiData, setAiData] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const params = getDateParams(dateRange);
      const query = new URLSearchParams(params).toString();
      const suffix = query ? `?${query}` : "";
      try {
        const [sumRes, txRes] = await Promise.all([
          api.get(`/transactions/summary${suffix}`),
          api.get(`/transactions?limit=10${query ? "&" + query : ""}`),
        ]);
        setSummary(sumRes.data);
        setTransactions(txRes.data);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [dateRange]);

  const handleExportExcel = async () => {
    try {
      const res = await api.get("/transactions?limit=1000");
      const rows = res.data.map((t) => ({
        Date: moment(t.date).format("YYYY-MM-DD"),
        Type: t.type,
        Category: t.category,
        Amount: t.amount,
        Description: t.description || "",
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Transactions");
      XLSX.writeFile(wb, `expense-tracker-${moment().format("YYYY-MM-DD")}.xlsx`);
      toast.success("Excel file downloaded");
    } catch (err) {
      toast.error("Failed to export");
    }
  };

  const handleAiInsights = async () => {
    setAiOpen(true);
    setAiLoading(true);
    setAiData(null);
    try {
      const params = getDateParams(dateRange);
      const query = new URLSearchParams(params).toString();
      const res = await api.get(`/ai/insights${query ? `?${query}` : ""}`);
      setAiMode(res.data.mode);
      setAiData(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate insights");
    } finally {
      setAiLoading(false);
    }
  };

  const chartData = [
    { name: "Income", value: summary.totalIncome, color: COLORS.income },
    { name: "Expense", value: summary.totalExpense, color: COLORS.expense },
  ].filter((d) => d.value > 0);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard</h1>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            {DATE_RANGES.map((r) => (
              <option key={r.value || "all"} value={r.value}>{r.label}</option>
            ))}
          </select>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-slate-900 rounded-lg hover:bg-amber-600 font-medium text-sm"
          >
            <FiDownload size={18} />
            Export Excel
          </button>
          <button
            onClick={handleAiInsights}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 font-medium text-sm"
          >
            <FiZap size={18} />
            Insights
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-slate-500 dark:text-slate-400">Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <FiTrendingUp className="text-emerald-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Total Income</p>
                <p className="text-xl font-bold text-emerald-600">₹{summary.totalIncome.toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <FiTrendingDown className="text-red-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Total Expense</p>
                <p className="text-xl font-bold text-red-600">₹{summary.totalExpense.toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <FiPocket className="text-amber-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Balance</p>
                <p className={`text-xl font-bold ${summary.balance >= 0 ? "text-slate-800 dark:text-white" : "text-red-600"}`}>
                  ₹{summary.balance.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <h2 className="font-semibold text-slate-800 dark:text-white mb-4">Income vs Expense</h2>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {chartData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-400 dark:text-slate-500 text-center py-12">No data to display</p>
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-slate-800 dark:text-white">Recent Transactions</h2>
                <div className="flex gap-3">
                  <Link to="/income" className="text-emerald-600 text-sm hover:underline">Add Income</Link>
                  <Link to="/expense" className="text-red-600 text-sm hover:underline">Add Expense</Link>
                </div>
              </div>
              {transactions.length === 0 ? (
                <p className="text-slate-400 dark:text-slate-500 text-center py-8">No transactions yet</p>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div
                      key={tx._id}
                      className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700 last:border-0"
                    >
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-100">{tx.category}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{moment(tx.date).format("MMM D, YYYY")}</p>
                      </div>
                      <p className={tx.type === "income" ? "text-emerald-600 font-medium" : "text-red-600 font-medium"}>
                        {tx.type === "income" ? "+" : "-"}₹{tx.amount.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <AiInsightsModal
        isOpen={aiOpen}
        onClose={() => setAiOpen(false)}
        loading={aiLoading}
        insights={aiData}
        mode={aiMode}
      />
    </div>
  );
};

export default Home;
