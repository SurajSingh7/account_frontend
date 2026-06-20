"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { API_BACKEND_URL } from "@/config/getEnvVariables";
import toast from "react-hot-toast";
import {
  Building2,
  Eye,
  FileText,
  RefreshCcw,
  Search,
  User2,
  Receipt,
  Banknote,
  Landmark,
  Smartphone,
  CreditCard,
  Wallet,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import ViewTransaction from "./modal/ViewTransaction";
import PdfTransctionComp from "./modal/PdfTransctionComp";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const fmtCurrency = (n) =>
  Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatDateTime = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getMethodConfig = (method) => {
  switch (method) {
    case "NEFT":
      return {
        label: "NEFT",
        icon: Landmark,
        chip: "border-blue-200 bg-blue-50 text-blue-700",
      };
    case "UPI":
      return {
        label: "UPI",
        icon: Smartphone,
        chip: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700",
      };
    case "CHEQUE":
      return {
        label: "Cheque",
        icon: CreditCard,
        chip: "border-amber-200 bg-amber-50 text-amber-700",
      };
    case "CASH":
      return {
        label: "Cash",
        icon: Wallet,
        chip: "border-emerald-200 bg-emerald-50 text-emerald-700",
      };
    default:
      return {
        label: method || "Unknown",
        icon: Banknote,
        chip: "border-gray-200 bg-gray-50 text-gray-700",
      };
  }
};

const getStatusConfig = (remaining) => {
  const val = Number(remaining || 0);

  if (val <= 0) {
    return {
      label: "Fully Allocated",
      icon: CheckCircle2,
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  return {
    label: "Advance Remaining",
    icon: XCircle,
    className: "border-amber-200 bg-amber-50 text-amber-700",
  };
};

const BulkTransactionsComp = () => {
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);

  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [detailData, setDetailData] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfSelectedId, setPdfSelectedId] = useState("");
  const [pdfData, setPdfData] = useState(null);
  const [pdfOpen, setPdfOpen] = useState(false);

  const [search, setSearch] = useState("");

  const fetchTransactions = useCallback(async () => {
    setLoading(true);

    try {
      const res = await fetch(
        `${API_BACKEND_URL}/billing/sale/ledger/bulk/transactions/all`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const json = await res.json();

      if (json?.success) {
        setRows(Array.isArray(json.data) ? json.data : []);
        setPagination(json.pagination || null);
      } else {
        toast.error(json?.message || "Failed to fetch bulk transactions");
      }
    } catch (error) {
      toast.error("Failed to fetch bulk transactions");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDetails = useCallback(async (id) => {
    if (!id) return;

    setDetailLoading(true);
    setModalOpen(true);
    setSelectedId(id);
    setDetailData(null);

    try {
      const res = await fetch(
        `${API_BACKEND_URL}/billing/sale/ledger/bulk/transactions/details/${id}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const json = await res.json();

      if (json?.success) {
        setDetailData(json.data || null);
      } else {
        toast.error(json?.message || "Failed to fetch transaction details");
      }
    } catch (error) {
      toast.error("Failed to fetch transaction details");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const fetchPdfDetails = useCallback(async (id) => {
    if (!id) return;

    setPdfLoading(true);
    setPdfOpen(true);
    setPdfSelectedId(id);
    setPdfData(null);

    try {
      const res = await fetch(
        `${API_BACKEND_URL}/billing/sale/ledger/bulk/transactions/details/${id}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const json = await res.json();

      if (json?.success) {
        setPdfData(json.data || null);
      } else {
        toast.error(json?.message || "Failed to fetch PDF transaction details");
      }
    } catch (error) {
      toast.error("Failed to fetch PDF transaction details");
    } finally {
      setPdfLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((item) => {
      const values = [
        item?._id,
        item?.companyGroupId?.companyName,
        item?.method,
        item?.transactionType,
        item?.allocationType,
        item?.createdBy?.name,
        item?.meta?.referenceNumber,
        item?.meta?.receiptId,
        item?.meta?.bankName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return values.includes(q);
    });
  }, [rows, search]);

  return (
    <>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.08),_transparent_28%),linear-gradient(to_bottom,_#fafafe,_#f7f8fc)] p-4 md:p-6">
        <div className="mx-auto max-w-[1600px]">
          <div className="mb-6 overflow-hidden rounded-[32px] border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-5 border-b border-gray-100 px-6 py-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-200">
                  <Receipt className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                    Bulk Transactions
                  </h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Premium receipt history with allocation insight and per-order distribution
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 shadow-sm focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-50">
                  <Search className="h-4 w-4 shrink-0 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by company, method, reference, user..."
                    className="w-full min-w-[260px] bg-transparent text-sm font-medium text-gray-800 outline-none placeholder:text-gray-400"
                  />
                </div>

                <button
                  type="button"
                  onClick={fetchTransactions}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 transition-all hover:bg-violet-700"
                >
                  <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-2 border-b border-gray-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Receipt Timeline</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {pagination?.total ?? filteredRows.length} total records • showing premium transaction table
                </p>
              </div>

              {pagination && (
                <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-600">
                  Page {pagination.page} / {pagination.totalPages}
                </div>
              )}
            </div>

            <div className="overflow-x-auto p-2 sm:p-4">
              {loading ? (
                <div className="space-y-3 p-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-12 w-full animate-pulse rounded-2xl bg-gray-100"
                    />
                  ))}
                </div>
              ) : filteredRows.length ? (
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/80">
                      <th className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">
                        Company
                      </th>
                      <th className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">
                        Cycle
                      </th>
                      <th className="whitespace-nowrap px-4 py-3 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">
                        Method
                      </th>
                      <th className="whitespace-nowrap px-4 py-3 text-right text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">
                        Amount
                      </th>
                      <th className="whitespace-nowrap px-4 py-3 text-right text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">
                        Allocated
                      </th>
                      <th className="whitespace-nowrap px-4 py-3 text-right text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">
                        Remaining
                      </th>
                      <th className="whitespace-nowrap px-4 py-3 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">
                        Status
                      </th>
                      <th className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">
                        Created By
                      </th>
                      <th className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">
                        Date
                      </th>
                      <th className="whitespace-nowrap px-4 py-3 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-50">
                    {filteredRows.map((item) => {
                      const method = getMethodConfig(item.method);
                      const status = getStatusConfig(item.remaining);
                      const MethodIcon = method.icon;
                      const StatusIcon = status.icon;
                      const isViewActive = selectedId === item._id && modalOpen;
                      const isPdfActive = pdfSelectedId === item._id && pdfOpen;

                      return (
                        <tr
                          key={item._id}
                          className={`transition-colors ${
                            isViewActive || isPdfActive
                              ? "bg-violet-50/60"
                              : "hover:bg-violet-50/30"
                          }`}
                        >
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                                <Building2 className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-gray-900">
                                  {item.companyGroupId?.companyName || "Company"}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {item.transactionType || "PAYMENT"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-gray-700">
                            {MONTH_NAMES[(item.month || 1) - 1]} {item.year}
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold ${method.chip}`}
                            >
                              <MethodIcon className="h-3.5 w-3.5" />
                              {method.label}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-bold text-gray-900">
                            ₹ {fmtCurrency(item.amount)}
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-bold text-emerald-600">
                            ₹ {fmtCurrency(item.allocated)}
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-bold text-amber-600">
                            ₹ {fmtCurrency(item.remaining)}
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold ${status.className}`}
                            >
                              <StatusIcon className="h-3.5 w-3.5" />
                              {status.label}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600">
                            <span className="inline-flex items-center gap-1.5">
                              <User2 className="h-3.5 w-3.5 text-gray-400" />
                              {item.createdBy?.name || "-"}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500">
                            {formatDateTime(item.transactionDate)}
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => fetchDetails(item._id)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-violet-700"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                View
                              </button>

                              <button
                                type="button"
                                onClick={() => fetchPdfDetails(item._id)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-700"
                              >
                                <FileText className="h-3.5 w-3.5" />
                                PDF
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="rounded-[28px] border border-dashed border-gray-200 bg-gray-50 px-6 py-16 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-white shadow-sm">
                    <Receipt className="h-6 w-6 text-gray-300" />
                  </div>
                  <h3 className="text-base font-bold text-gray-700">No transactions found</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Try a different search keyword or refresh the list.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ViewTransaction
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        loading={detailLoading}
        details={detailData}
      />

      <PdfTransctionComp
        open={pdfOpen}
        onClose={() => setPdfOpen(false)}
        loading={pdfLoading}
        details={pdfData}
      />
    </>
  );
};

export default BulkTransactionsComp;