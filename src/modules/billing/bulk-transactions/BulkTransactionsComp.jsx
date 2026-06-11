"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import  { API_BACKEND_URL, API_BASE_URL } from "@/config/getEnvVariables";
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

const TransactionRow = ({ item, active, onClick }) => {
  const method = getMethodConfig(item.method);
  const status = getStatusConfig(item.remaining);
  const MethodIcon = method.icon;
  const StatusIcon = status.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full rounded-3xl border p-5 text-left transition-all duration-200 ${
        active
          ? "border-violet-300 bg-violet-50/70 shadow-lg shadow-violet-100"
          : "border-gray-200 bg-white shadow-sm hover:border-violet-200 hover:bg-violet-50/40 hover:shadow-md"
      }`}
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-bold tracking-wide text-gray-600">
              #{item._id?.slice(-8)}
            </span>
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold ${method.chip}`}>
              <MethodIcon className="h-3.5 w-3.5" />
              {method.label}
            </span>
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold ${status.className}`}>
              <StatusIcon className="h-3.5 w-3.5" />
              {status.label}
            </span>
          </div>

          <div className="mt-3 flex items-start gap-3">
            <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-gray-600">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-base font-bold text-gray-900">
                {item.companyGroupId?.companyName || "Company"}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {MONTH_NAMES[(item.month || 1) - 1]} {item.year} • {item.transactionType || "PAYMENT"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:min-w-[520px]">
          <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">Amount</p>
            <p className="mt-1 text-sm font-bold text-gray-900">₹ {fmtCurrency(item.amount)}</p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-500">Allocated</p>
            <p className="mt-1 text-sm font-bold text-emerald-700">₹ {fmtCurrency(item.allocated)}</p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-500">Remaining</p>
            <p className="mt-1 text-sm font-bold text-amber-700">₹ {fmtCurrency(item.remaining)}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">Created</p>
            <p className="mt-1 text-sm font-bold text-gray-700">{formatDate(item.createdAt)}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-500">
          <span className="inline-flex items-center gap-1.5">
            <User2 className="h-3.5 w-3.5" />
            {item.createdBy?.name || "-"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDateTime(item.transactionDate)}
          </span>
        </div>

        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-violet-600">
          View receipt
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </button>
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
          <p className="mt-1 text-sm text-gray-500 break-all">{group.circuitKey}</p>
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

const DetailDrawer = ({ open, onClose, loading, details }) => {
  const meta = details?.meta;
  const method = getMethodConfig(meta?.paymentMode);
  const status = getStatusConfig(meta?.remainingAdvance);
  const MethodIcon = method.icon;
  const StatusIcon = status.icon;

  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-slate-950/35 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-[920px] transform overflow-hidden border-l border-gray-200 bg-[#fcfcfd] shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
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
                <p className="mt-1 text-sm text-gray-500">
                  Receipt ID: {meta?.bulkTransactionId || "-"}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50"
              >
                Close
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

                  <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-gray-900">Payment Meta</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Method-specific references and notes
                      </p>
                    </div>

                    <div className="space-y-3">
                      <MetaPill icon={Receipt} label="Reference No." value={details?.meta?.referenceNumber || details?.meta?.meta?.referenceNumber} />
                      <MetaPill icon={Landmark} label="Bank Name" value={details?.meta?.bankName || details?.meta?.meta?.bankName} />
                      <MetaPill icon={FileText} label="Remarks" value={meta?.remarks || "-"} />
                      <MetaPill icon={Receipt} label="Orders" value={fmtCompact(meta?.totalOrders)} />
                    </div>
                  </div>
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
      </aside>
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
  const [drawerOpen, setDrawerOpen] = useState(false);
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
    setDrawerOpen(true);
    setSelectedId(id);

    try {
      const res = await fetch(
        `${API_BASE_URL}/billing/sale/ledger/bulk/transactions/details/${id}`,
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

  const totals = useMemo(() => {
    return filteredRows.reduce(
      (acc, item) => {
        acc.amount += Number(item.amount || 0);
        acc.allocated += Number(item.allocated || 0);
        acc.remaining += Number(item.remaining || 0);
        return acc;
      },
      { amount: 0, allocated: 0, remaining: 0 }
    );
  }, [filteredRows]);

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

            <div className="grid grid-cols-1 gap-4 px-6 py-6 md:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                icon={IndianRupee}
                label="Total Amount"
                value={`₹ ${fmtCurrency(totals.amount)}`}
                tone="violet"
              />
              <SummaryCard
                icon={CheckCircle2}
                label="Allocated"
                value={`₹ ${fmtCurrency(totals.allocated)}`}
                tone="emerald"
              />
              <SummaryCard
                icon={ArrowUpRight}
                label="Remaining"
                value={`₹ ${fmtCurrency(totals.remaining)}`}
                tone="amber"
              />
              <SummaryCard
                icon={Receipt}
                label="Transactions"
                value={fmtCompact(filteredRows.length)}
                tone="sky"
              />
            </div>
          </div>

          <div className="rounded-[32px] border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-2 border-b border-gray-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Receipt Timeline</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {pagination?.total ?? filteredRows.length} total records • showing premium transaction cards
                </p>
              </div>

              {pagination && (
                <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-600">
                  Page {pagination.page} / {pagination.totalPages}
                </div>
              )}
            </div>

            <div className="p-6">
              {loading ? (
                <div className="grid gap-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="animate-pulse rounded-3xl border border-gray-200 bg-white p-5"
                    >
                      <div className="mb-4 flex gap-2">
                        <div className="h-7 w-20 rounded-full bg-gray-100" />
                        <div className="h-7 w-24 rounded-full bg-gray-100" />
                      </div>
                      <div className="mb-4 h-5 w-64 rounded-full bg-gray-100" />
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        {[1, 2, 3, 4].map((k) => (
                          <div key={k} className="h-20 rounded-2xl bg-gray-100" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredRows.length ? (
                <div className="space-y-4">
                  {filteredRows.map((item) => (
                    <TransactionRow
                      key={item._id}
                      item={item}
                      active={selectedId === item._id && drawerOpen}
                      onClick={() => fetchDetails(item._id)}
                    />
                  ))}
                </div>
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

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        loading={detailLoading}
        details={detailData}
      />
    </>
  );
};

export default BulkTransactionsComp;