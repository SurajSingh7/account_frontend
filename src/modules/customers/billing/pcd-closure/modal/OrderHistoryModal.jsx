"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { API_BACKEND_URL } from "@/config/getEnvVariables";

const OrderHistoryModal = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");

  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState(null);

  useEffect(() => {
    if (!orderId) return;
    fetchHistory();
  }, [orderId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BACKEND_URL}/billing/sale/ready-order/history/${orderId}`,
        {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch history");
      }
      setHistory(result.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex items-center gap-3 text-slate-400">
          <svg className="h-4 w-4 animate-spin text-slate-300" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
          </svg>
          <span className="text-sm font-medium tracking-wide">Loading order history…</span>
        </div>
      </div>
    );
  }

  if (!history) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-24 text-center">
        <p className="text-sm font-medium text-slate-500">No history found</p>
        <p className="text-xs text-slate-400">This order does not have any recorded versions yet.</p>
      </div>
    );
  }

  const versions = [history.current, ...history.history];

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      {/* Header with back button and centered title */}
      <div className="relative mb-10 border-b border-slate-200 pb-6">
        <div className="flex items-center justify-between">
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm cursor-pointer font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Go back"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>

          {/* Centered title block */}
          <div className="flex-1 text-center">
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Billing · Order Record
            </p>
            <h2 className="text-[26px] font-semibold tracking-tight text-slate-900">
              Order <span className="font-medium text-blue-500"> #{orderId} </span> history
            </h2>
          </div>

          {/* Invisible spacer to keep centering balanced */}
          <div className="w-20" />
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {versions.map((item, index) => {
          const isLast = index === versions.length - 1;
          return (
            <div key={item.versionNumber} className="relative flex gap-5 pb-8 last:pb-0">
              {/* Connector rail */}
              <div className="relative flex w-6 flex-none flex-col items-center">
                <span
                  className={`z-10 flex h-6 w-6 flex-none items-center justify-center rounded-full text-[11px] font-semibold ring-4 ring-white ${item.isCurrent
                    ? "bg-amber-500 text-white"
                    : "bg-slate-200 text-slate-600"
                    }`}
                >
                  {item.versionNumber}
                </span>
                {!isLast && <span className="mt-1 w-px flex-1 bg-slate-200" />}
              </div>

              {/* Card */}
              <div
                className={`min-w-0 flex-1 rounded-xl border bg-white transition-shadow ${item.isCurrent
                  ? "border-amber-200 shadow-[0_2px_16px_-4px_rgba(217,119,6,0.18)]"
                  : "border-slate-200 shadow-sm hover:shadow-md"
                  }`}
              >
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
                  <div>
                    <h3 className="text-[15px] font-semibold text-slate-900">
                      Version {item.versionNumber}
                    </h3>
                    <p className="mt-0.5 text-xs font-medium text-slate-400">
                      {item.orderType}
                    </p>
                  </div>
                  {item.isCurrent && (
                    <span className="inline-flex flex-none items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-700 ring-1 ring-inset ring-amber-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      Current
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-5 px-5 py-5 md:grid-cols-3">
                  <Info label="Rate" value={`₹ ${item.rate}`} emphasize />
                  <Info label="Capacity" value={`${item.capacity} Mbps`} />
                  <Info label="PCD date" value={formatDate(item.pcdDate)} />
                  <Info label="Operational date" value={formatDate(item.operationalDate)} />
                  <Info label="Created at" value={formatDate(item.createdAt)} />
                  {item.revisionDate && (
                    <Info label="Revision date" value={formatDate(item.revisionDate)} />
                  )}
                  <Info label="remarks" value={`${item?.remarks}`} emphasize />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Info = ({ label, value, emphasize, maxLength = 30 }) => {
  const shouldTruncate = value?.length > maxLength;
  const displayValue = shouldTruncate ? `${value?.slice(0, maxLength)}...` : value;

  return (
    <div className="min-w-0">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <div className="relative group">
        <p
          className={`truncate text-[15px] text-slate-800 ${emphasize ? "font-serif font-semibold text-slate-900" : "font-medium"
            }`}
        >
          {displayValue || '-'}
        </p>
        {shouldTruncate && (
          <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute z-50 left-0 top-full mt-1 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-xl max-w-xs whitespace-normal wrap-break-word pointer-events-none">
            {value}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryModal;