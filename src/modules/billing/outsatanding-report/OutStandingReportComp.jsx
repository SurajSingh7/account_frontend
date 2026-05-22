'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFilters } from '../shared/helpers/hooks/useFilters';
import { useFetchList } from '../shared/helpers/hooks/useFetchList';
import FilterBar from '../shared/filters/FilterBar';
import OutstandingList from './component/OutstandingList';
import SummaryCards from './component/SummaryCards';


const ENDPOINT = '/billing/sale/monthly/orders/outstanding/';

const OutStandingReportComp = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showLsi, setShowLsi] = useState(false);

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
      {/* ── Header — left text + right summary cards ── */}
      <header className="mx-auto mb-8 flex items-start justify-between gap-4">
        {/* Left: Title + subtitle */}
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
            Outstanding Report Overview
          </h1>
          <p className="text-gray-600 text-base font-semibold mt-2">
            Cumulative balances per order up to selected period
          </p>
        </div>

        {/* Right: Summary Cards */}
        <SummaryCards
          summary={summary}
          showLsi={showLsi}
          onToggleLsi={() => setShowLsi((v) => !v)}
        />
      </header>

      <main className="mx-auto space-y-5">
        <FilterBar
          filters={filters}
          onChange={setFilter}
          onClear={resetFilters}
          hasActive={hasActiveFilters}
        />

        <OutstandingList
          data={data}
          pagination={pagination}
          loading={loading}
          error={error}
          onRefetch={refetch}
          onPageChange={handlePageChange}
          showLsi={showLsi}
          onToggleLsi={() => setShowLsi((v) => !v)}
        />
      </main>
    </div>
  );
};

export default OutStandingReportComp;