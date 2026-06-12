"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import  { API_BACKEND_URL, } from "@/config/getEnvVariables";
import toast from "react-hot-toast";
import {
  ArrowUpRight,
  Banknote,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  Eye,
  FileText,
  IndianRupee,
  Landmark,
  Loader2,
  Receipt,
  RefreshCcw,
  Search,
  ShieldCheck,
  Smartphone,
  User2,
  Wallet,
  X,
  XCircle,
} from "lucide-react";

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

const fmtCompact = (n) =>
  Number(n || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });

const formatDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

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
        soft: "bg-blue-50 text-blue-700",
      };
    case "UPI":
      return {
        label: "UPI",
        icon: Smartphone,
        chip: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700",
        soft: "bg-fuchsia-50 text-fuchsia-700",
      };
    case "CHEQUE":
      return {
        label: "Cheque",
        icon: CreditCard,
        chip: "border-amber-200 bg-amber-50 text-amber-700",
        soft: "bg-amber-50 text-amber-700",
      };
    case "CASH":
      return {
        label: "Cash",
        icon: Wallet,
        chip: "border-emerald-200 bg-emerald-50 text-emerald-700",
        soft: "bg-emerald-50 text-emerald-700",
      };
    default:
      return {
        label: method || "Unknown",
        icon: Banknote,
        chip: "border-gray-200 bg-gray-50 text-gray-700",
        soft: "bg-gray-50 text-gray-700",
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

const MetaPill = ({ icon: Icon, label, value }) => (
  <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4">
    <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </div>
    <p className="text-sm font-semibold text-gray-900 break-words">{value || "-"}</p>
  </div>
);

const SummaryCard = ({ icon: Icon, label, value, tone = "violet" }) => {
  const tones = {
    violet: {
      wrap: "border-violet-100 bg-violet-50/80",
      icon: "bg-violet-600 text-white",
      value: "text-violet-700",
    },
    emerald: {
      wrap: "border-emerald-100 bg-emerald-50/80",
      icon: "bg-emerald-600 text-white",
      value: "text-emerald-700",
    },
    amber: {
      wrap: "border-amber-100 bg-amber-50/80",
      icon: "bg-amber-500 text-white",
      value: "text-amber-700",
    },
    sky: {
      wrap: "border-sky-100 bg-sky-50/80",
      icon: "bg-sky-600 text-white",
      value: "text-sky-700",
    },
  };

  const t = tones[tone] || tones.violet;

  return (
    <div className={`rounded-3xl border p-5 shadow-sm ${t.wrap}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">
            {label}
          </p>
          <p className={`mt-2 text-2xl font-bold tracking-tight ${t.value}`}>{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm ${t.icon}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

const BillingStatusBadge = ({ status }) => {
  if (status === "PAID") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Paid
      </span>
    );
  }

  if (status === "PARTIAL") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-700">
        <Clock3 className="h-3.5 w-3.5" />
        Partial
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[11px] font-bold text-red-700">
      <XCircle className="h-3.5 w-3.5" />
      Unpaid
    </span>
  );
};

const DistributionCard = ({ group }) => {
  const isPrimary = group.circuitKey?.includes("primary");
  const isSecondary = group.circuitKey?.includes("secondary");

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-gray-100 bg-gray-50/80 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-bold text-gray-900">Order #{group.orderId}</p>
            {isPrimary && (
              <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                Primary
              </span>
            )}
            {isSecondary && (
              <span className="rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 text-[11px] font-bold text-purple-700">
                Secondary
              </span>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-500">Allocated</p>
          <p className="mt-1 text-sm font-bold text-emerald-700">₹ {fmtCurrency(group.amount)}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-white">
              <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">
                Month
              </th>
              <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">
                Current Bill
              </th>
              <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">
                Outstanding
              </th>
              <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">
                Allocated
              </th>
              <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">
                Remaining
              </th>
              <th className="px-5 py-3 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {group.billings?.map((b) => (
              <tr key={b.projectionId} className="hover:bg-violet-50/30">
                <td className="px-5 py-4 font-semibold text-gray-700">
                  {MONTH_NAMES[(b.month || 1) - 1]} {b.year}
                </td>
                <td className="px-5 py-4 text-right font-medium text-gray-700">
                  ₹ {fmtCurrency(b.currentMonthBill)}
                </td>
                <td className="px-5 py-4 text-right font-bold text-red-600">
                  ₹ {fmtCurrency(b.outstandingAmount)}
                </td>
                <td className="px-5 py-4 text-right font-bold text-emerald-600">
                  ₹ {fmtCurrency(b.allocatedAmount)}
                </td>
                <td className="px-5 py-4 text-right font-semibold text-amber-600">
                  ₹ {fmtCurrency(b.remainingAfter)}
                </td>
                <td className="px-5 py-4 text-center">
                  <BillingStatusBadge status={b.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ReceiptModal = ({ open, onClose, loading, details }) => {
  const meta = details?.meta;
  const paymentMeta = meta?.meta || {}; // nested method-specific meta
  const method = getMethodConfig(meta?.paymentMode);
  const status = getStatusConfig(meta?.remainingAdvance);
  const MethodIcon = method.icon;
  const StatusIcon = status.icon;

  // Build list of payment meta pills - only include if value exists
  const paymentMetaPills = [
    { icon: Receipt, label: "Reference No.", value: meta?.referenceNumber || paymentMeta?.referenceNumber },
    { icon: Landmark, label: "Bank Name", value: meta?.bankName || paymentMeta?.bankName },
    { icon: FileText, label: "Remarks", value: meta?.remarks },
    { icon: Receipt, label: "Orders", value: meta?.totalOrders != null ? fmtCompact(meta?.totalOrders) : null },
  ].filter((pill) => pill.value !== null && pill.value !== undefined && pill.value !== "");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] transition-opacity duration-200"
      />

      <div className="relative flex h-[92vh] w-full max-w-[1100px] flex-col overflow-hidden rounded-[28px] border border-gray-200 bg-[#fcfcfd] shadow-2xl">
        <div className="border-b border-gray-200 bg-white/90 px-6 py-5 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[11px] font-bold text-violet-700">
                  <Receipt className="h-3.5 w-3.5" />
                  Bulk Receipt
                </span>
                {meta?.paymentMode && (
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold ${method.chip}`}>
                    <MethodIcon className="h-3.5 w-3.5" />
                    {method.label}
                  </span>
                )}
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold ${status.className}`}>
                  <StatusIcon className="h-3.5 w-3.5" />
                  {status.label}
                </span>
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                {meta?.companyGroupId?.companyName || "Transaction Details"}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-500 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loading ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-violet-100">
                  <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
                </div>
                <p className="text-sm font-semibold text-gray-600">Loading transaction receipt...</p>
              </div>
            </div>
          ) : !details ? (
            <div className="flex min-h-[60vh] items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-gray-100">
                  <FileText className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-gray-500">No receipt data available.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                  icon={IndianRupee}
                  label="Total Amount"
                  value={`₹ ${fmtCurrency(meta?.totalAmount)}`}
                  tone="violet"
                />
                <SummaryCard
                  icon={ShieldCheck}
                  label="Allocated"
                  value={`₹ ${fmtCurrency(meta?.totalAllocated)}`}
                  tone="emerald"
                />
                <SummaryCard
                  icon={ArrowUpRight}
                  label="Advance"
                  value={`₹ ${fmtCurrency(meta?.remainingAdvance)}`}
                  tone="amber"
                />
                <SummaryCard
                  icon={Receipt}
                  label="Entries"
                  value={fmtCompact(meta?.totalEntries)}
                  tone="sky"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <div className="xl:col-span-2 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Transaction Information</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Core receipt and allocation metadata
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <MetaPill icon={CalendarDays} label="Payment Date" value={formatDate(meta?.paymentDate)} />
                    <MetaPill icon={MethodIcon} label="Payment Mode" value={meta?.paymentMode} />
                    <MetaPill icon={Receipt} label="Allocation Type" value={meta?.allocationType} />
                    <MetaPill
                      icon={Clock3}
                      label="Billing Cycle"
                      value={`${MONTH_NAMES[(meta?.month || 1) - 1]} ${meta?.year || ""}`}
                    />
                    <MetaPill icon={Building2} label="Company" value={meta?.companyGroupId?.companyName} />
                    <MetaPill icon={User2} label="Created By" value={meta?.createdBy?.name} />
                  </div>
                </div>

                {paymentMetaPills.length > 0 && (
                  <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-gray-900">Payment Meta</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Method-specific references and notes
                      </p>
                    </div>

                    <div className="space-y-3">
                      {paymentMetaPills.map((pill, idx) => (
                        <MetaPill key={idx} icon={pill.icon} label={pill.label} value={pill.value} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Distribution Breakdown</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Order-wise billing allocation mapped from the receipt
                    </p>
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm font-semibold text-gray-600">
                    Groups: {details?.distribution?.length || 0}
                  </div>
                </div>

                <div className="space-y-4">
                  {details?.distribution?.length ? (
                    details.distribution.map((group, idx) => (
                      <DistributionCard key={`${group.circuitKey}-${idx}`} group={group} />
                    ))
                  ) : (
                    <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center">
                      <p className="text-sm font-semibold text-gray-500">
                        No distribution records found.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const BulkTransactionsComp = () => {
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [detailData, setDetailData] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BACKEND_URL}/billing/sale/ledger/bulk/transactions/all`, {
        method: "GET",
        credentials: "include",
      });

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
                    <div key={i} className="h-12 w-full animate-pulse rounded-2xl bg-gray-100" />
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
                      const isActive = selectedId === item._id && modalOpen;

                      return (
                        <tr
                          key={item._id}
                          className={`transition-colors ${
                            isActive ? "bg-violet-50/60" : "hover:bg-violet-50/30"
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
                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold ${method.chip}`}>
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
                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold ${status.className}`}>
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
                            <button
                              type="button"
                              onClick={() => fetchDetails(item._id)}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-violet-700"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View
                            </button>
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

      <ReceiptModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        loading={detailLoading}
        details={detailData}
      />
    </>
  );
};

export default BulkTransactionsComp;