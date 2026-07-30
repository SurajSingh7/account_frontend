import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import OrderCard from './OrderCard';

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden animate-pulse border-l-4 border-l-gray-300">
    <div className="bg-gray-50 px-6 py-5 border-b border-gray-200 flex justify-between gap-4">
      <div className="space-y-3 flex-1">
        <div className="h-6 bg-gray-200 rounded w-2/3" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
      <div className="space-y-2">
        <div className="h-6 bg-gray-200 rounded w-36" />
        <div className="h-6 bg-gray-200 rounded w-28" />
      </div>
    </div>
    <div className="p-5 space-y-3">
      <div className="h-5 bg-gray-200 rounded w-full" />
      <div className="h-5 bg-gray-200 rounded w-5/6" />
    </div>
  </div>
);

// ─── OrderList ────────────────────────────────────────────────────────────────
// Sirf teen kaam: loading / error / cards — pagination yahan nahi
const OrderList = ({
  orders,
  loading,
  error,
  onRefetch,
}) => {

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-5">
        {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white rounded-lg border border-gray-200 border-dashed text-center gap-4">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <div>
          <p className="text-xl font-semibold text-gray-700">Failed to load orders</p>
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

  
  // ── Empty ──────────────────────────────────────────────────────────────────
  if (!orders?.length) {
    return (
      <div className="text-center text-gray-500 py-20 bg-white rounded-lg border border-gray-200 border-dashed">
        <p className="text-xl font-semibold">No orders found.</p>
        <p className="text-base font-semibold text-gray-400 mt-2">Try adjusting your filters.</p>
      </div>
    );
  }

  // ── Cards only ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {orders.map(order => (
        <OrderCard key={order._id} order={order} onRefetch={onRefetch} />
      ))}
    </div>
  );
};

export default OrderList;