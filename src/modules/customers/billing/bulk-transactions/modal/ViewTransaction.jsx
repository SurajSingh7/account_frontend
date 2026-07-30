"use client";

import React from "react";
import {
  ArrowUpRight,
  Banknote,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileText,
  IndianRupee,
  Landmark,
  Loader2,
  Receipt,
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

const MetaPill = ({ icon: Icon, label, value }) => (
  <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4">
    <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </div>
    <p className="break-words text-sm font-semibold text-gray-900">{value || "-"}</p>
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
          <p className={`mt-2 text-2xl font-bold tracking-tight ${t.value}`}>
            {value}
          </p>
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
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-500">
            Allocated
          </p>
          <p className="mt-1 text-sm font-bold text-emerald-700">
            ₹ {fmtCurrency(group.amount)}
          </p>
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
            {group.billings?.map((billing) => (
              <tr key={billing.projectionId} className="hover:bg-violet-50/30">
                <td className="px-5 py-4 font-semibold text-gray-700">
                  {MONTH_NAMES[(billing.month || 1) - 1]} {billing.year}
                </td>
                <td className="px-5 py-4 text-right font-medium text-gray-700">
                  ₹ {fmtCurrency(billing.currentMonthBill)}
                </td>
                <td className="px-5 py-4 text-right font-bold text-red-600">
                  ₹ {fmtCurrency(billing.outstandingAmount)}
                </td>
                <td className="px-5 py-4 text-right font-bold text-emerald-600">
                  ₹ {fmtCurrency(billing.allocatedAmount)}
                </td>
                <td className="px-5 py-4 text-right font-semibold text-amber-600">
                  ₹ {fmtCurrency(billing.remainingAfter)}
                </td>
                <td className="px-5 py-4 text-center">
                  <BillingStatusBadge status={billing.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ViewTransaction = ({ open, onClose, loading, details }) => {
  const meta = details?.meta;
  const paymentMeta = meta?.meta || {};
  const method = getMethodConfig(meta?.paymentMode);
  const status = getStatusConfig(meta?.remainingAdvance);
  const MethodIcon = method.icon;
  const StatusIcon = status.icon;

  const paymentMetaPills = [
    {
      icon: Receipt,
      label: "Reference No.",
      value: meta?.referenceNumber || paymentMeta?.referenceNumber,
    },
    {
      icon: Landmark,
      label: "Bank Name",
      value: meta?.bankName || paymentMeta?.bankName,
    },
    {
      icon: FileText,
      label: "Remarks",
      value: meta?.remarks,
    },
    {
      icon: Receipt,
      label: "Orders",
      value: meta?.totalOrders != null ? fmtCompact(meta?.totalOrders) : null,
    },
  ].filter(
    (pill) => pill.value !== null && pill.value !== undefined && pill.value !== ""
  );

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
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold ${method.chip}`}
                  >
                    <MethodIcon className="h-3.5 w-3.5" />
                    {method.label}
                  </span>
                )}

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold ${status.className}`}
                >
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
                <p className="text-sm font-semibold text-gray-600">
                  Loading transaction receipt...
                </p>
              </div>
            </div>
          ) : !details ? (
            <div className="flex min-h-[60vh] items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-gray-100">
                  <FileText className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-gray-500">
                  No receipt data available.
                </p>
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
                <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm xl:col-span-2">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900">
                      Transaction Information
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Core receipt and allocation metadata
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <MetaPill
                      icon={CalendarDays}
                      label="Payment Date"
                      value={formatDate(meta?.paymentDate)}
                    />
                    <MetaPill
                      icon={MethodIcon}
                      label="Payment Mode"
                      value={meta?.paymentMode}
                    />
                    <MetaPill
                      icon={Receipt}
                      label="Allocation Type"
                      value={meta?.allocationType}
                    />
                    <MetaPill
                      icon={Clock3}
                      label="Billing Cycle"
                      value={`${MONTH_NAMES[(meta?.month || 1) - 1]} ${meta?.year || ""}`}
                    />
                    <MetaPill
                      icon={Building2}
                      label="Company"
                      value={meta?.companyGroupId?.companyName}
                    />
                    <MetaPill
                      icon={User2}
                      label="Created By"
                      value={meta?.createdBy?.name}
                    />
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
                      {paymentMetaPills.map((pill, index) => (
                        <MetaPill
                          key={`${pill.label}-${index}`}
                          icon={pill.icon}
                          label={pill.label}
                          value={pill.value}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Distribution Breakdown
                    </h3>
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
                    details.distribution.map((group, index) => (
                      <DistributionCard
                        key={`${group.circuitKey}-${index}`}
                        group={group}
                      />
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

export default ViewTransaction;