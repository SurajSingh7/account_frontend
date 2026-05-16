'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFilters } from '../shared/helpers/hooks/useFilters';
import { useFetchList } from '../shared/helpers/hooks/useFetchList';
import { saveLimit } from '../shared/constants';
import FilterBar from '../shared/filters/FilterBar';
import OrderList from './orders/OrderList';
import Pagination from '@/shared/ui/pagination/Pagination';

const ENDPOINT = '/billing/sale/ready-order/all';

const PcdClosureComp = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { filters, setFilter, resetFilters, hasActiveFilters } = useFilters();

  const { data, pagination, loading, error, refetch } = useFetchList({
    filters,
    endpoint: ENDPOINT,
  });

  // ── Single URL sync helper ──────────────────────────────────────────────────
  const syncUrl = (updates) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(filters.page));
    params.set('limit', String(filters.limit));
    Object.entries(updates).forEach(([k, v]) => params.set(k, String(v)));
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handlePageChange = (page) => {
    setFilter({ page });
    syncUrl({ page });
  };

  const handleLimitChange = (limit) => {
    saveLimit(limit);
    setFilter({ limit, page: 1 });
    syncUrl({ limit, page: 1 });
  };

  return (
    <div
      className="min-h-screen bg-gray-50 p-5 md:p-6"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
    >
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

        {/* OrderList — sirf table/cards, pagination yahan nahi */}
        <OrderList
          orders={data}
          loading={loading}
          error={error}
          onRefetch={refetch}
        />

        {/* Pagination — same level as FilterBar */}
        {pagination?.total > 0 && (
          <Pagination
            currentPage={filters.page}
            totalItems={pagination.total}
            itemsPerPage={filters.limit}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleLimitChange}
          />
        )}

      </main>
    </div>
  );
};

export default PcdClosureComp;