'use client';

import React from 'react';
import { useFilters } from '../shared/helpers/hooks/useFilters';
import { useFetchList } from '../shared/helpers/hooks/useFetchList';
import FilterBar from '../shared/filters/FilterBar';
import ReceiptList from './component/ReceiptList';
import SummaryCard from './component/SummaryCard';

const ENDPOINT = '/billing/sale/monthly/orders/receipt/';

const ReceiptReportComp = () => {
  const { filters, setFilter, resetFilters, hasActiveFilters } = useFilters();

  const { data, pagination, loading, error, refetch } = useFetchList({
    filters,
    endpoint: ENDPOINT,
  });

  const summary = data?.data?.summary || data?.summary || {};

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
        {/* Left: Title + subtitle */}
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
            Receipt Report Overview
          </h1>
          <p className="text-gray-600 text-base font-semibold mt-2">
            Receipts, CN & TDS by Order
          </p>
        </div>

        {/* Right: Summary Card — no showLsi */}
        <SummaryCard summary={summary} />
      </header>

      <main className="mx-auto space-y-5">
        <FilterBar
          filters={filters}
          onChange={setFilter}
          onClear={resetFilters}
          hasActive={hasActiveFilters}
        />

        <ReceiptList
          data={data}
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

export default ReceiptReportComp;