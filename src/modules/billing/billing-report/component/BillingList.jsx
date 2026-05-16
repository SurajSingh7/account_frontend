'use client';

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import BillingTable from './BillingTable';

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const SkeletonTable = () => (
  <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden animate-pulse">
    <div className="border-b border-gray-200 p-5">
      <div className="h-6 bg-gray-200 rounded w-1/4" />
    </div>
    <div className="p-5 space-y-4">
      {[1, 2, 3, 4, 5].map((item) => (
        <div key={item} className="grid grid-cols-5 gap-4">
          <div className="h-5 bg-gray-200 rounded" />
          <div className="h-5 bg-gray-200 rounded" />
          <div className="h-5 bg-gray-200 rounded" />
          <div className="h-5 bg-gray-200 rounded" />
          <div className="h-5 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  </div>
);

// ─── BillingList ──────────────────────────────────────────────────────────────
// Sirf teen kaam: loading / error / table — pagination yahan nahi
const BillingList = ({
  data,
  loading,
  error,
  onRefetch,
}) => {

  if (loading) {
    return <div className="space-y-5"><SkeletonTable /></div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white rounded-lg border border-gray-200 border-dashed text-center gap-4">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <div>
          <p className="text-xl font-semibold text-gray-700">Failed to load billing records</p>
          <p className="text-base font-semibold text-gray-400 mt-1">{error}</p>
        </div>
        <button
          onClick={onRefetch}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  const rows = data?.data || [];

  if (!rows.length) {
    return (
      <div className="text-center text-gray-500 py-20 bg-white rounded-lg border border-gray-200 border-dashed">
        <p className="text-xl font-semibold">No billing records found.</p>
        <p className="text-base font-semibold text-gray-400 mt-2">Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <BillingTable data={data} onRefetch={onRefetch} />
  );
};

export default BillingList;