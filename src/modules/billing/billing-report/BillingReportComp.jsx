'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFilters } from '../shared/helpers/hooks/useFilters';
import { useFetchList } from '../shared/helpers/hooks/useFetchList';
import FilterBar from '../shared/filters/FilterBar';
import BillingList from './component/BillingList';
import SummaryCard from './component/SummaryCard';

const ENDPOINT = '/billing/sale/monthly/orders/report';

const BillingReportComp = () => {
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

  const summary = data?.data?.summary || data?.summary || {};

  const handlePageChange = (page) => {
    setFilter({ page });
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div
      className="min-h-screen bg-gray-50 p-5 md:p-6"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* ── Header ── */}
      <header className="mx-auto mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
            Billing Report Overview
          </h1>
          <p className="text-gray-600 text-base font-semibold mt-2">
            Month-wise billing summary per order up to selected period
          </p>
        </div>

        <SummaryCard summary={summary} />
      </header>

      <main className="mx-auto space-y-5">
        <FilterBar
          filters={filters}
          onChange={setFilter}
          onClear={resetFilters}
          hasActive={hasActiveFilters}
        />

        <BillingList
          data={data}
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

export default BillingReportComp;