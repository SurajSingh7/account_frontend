'use client';
import React from 'react';
import { useOrders } from './helpers/hooks/useOrders';
import { useFilters } from './helpers/hooks/useFilters';
import FilterBar from './useCompanies/filters/FilterBar';
import OrderList from './useCompanies/orders/OrderList';

const PcdClosureComp = () => {
  
  const { filters, setFilter, resetFilters, hasActiveFilters } = useFilters();
  const { orders, pagination, loading, error, refetch } = useOrders(filters);

  return (
    <div
      className="min-h-screen bg-gray-50 p-5 md:p-6"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
    >
      {/* ── Header — exact original ── */}
      <header className="mx-auto mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">PCD Closure Overview</h1>
        <p className="text-gray-600 text-base font-semibold mt-2">
          Centralized dashboard to monitor, track, and complete all PCD closure and billing operations seamlessly.
        </p>
      </header>

      <main className="mx-auto space-y-5">
        <FilterBar
          filters={filters}
          onChange={setFilter}
          onClear={resetFilters}
          hasActive={hasActiveFilters}
        />
        <OrderList
          orders={orders}
          pagination={pagination}
          loading={loading}
          error={error}
          onRefetch={refetch}
          onPageChange={(page) => setFilter({ page })}
        />
      </main>
    </div>
  );
};

export default PcdClosureComp;