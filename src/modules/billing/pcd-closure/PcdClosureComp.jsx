'use client';
import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFilters } from '../shared/helpers/hooks/useFilters';
import FilterBar from '../shared/filters/FilterBar';
import OrderList from './orders/OrderList';
import { useFetchList } from '../shared/helpers/hooks/useFetchList';

const ENDPOINT = '/billing/sale/ready-order/all';

const PcdClosureComp = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialPage = Number(searchParams.get('page')) || 1;

  const { filters, setFilter, resetFilters, hasActiveFilters } = useFilters({
    page: initialPage,
  });

  const { data, pagination, loading, error, refetch } = useFetchList({
    filters,
    endpoint: ENDPOINT,
  });

  const handlePageChange = (page) => {
    setFilter({ page });
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page);
    router.push(`?${params.toString()}`, { scroll: false });
  };

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
          orders={data}
          pagination={pagination}
          loading={loading}
          error={error}
          onRefetch={refetch}
          onPageChange={handlePageChange}
        />
      </main>
    </div>
  );
};

export default PcdClosureComp;