'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // ← ye wapas add karo
import { useFilters } from '../shared/helpers/hooks/useFilters';
import { useFetchList } from '../shared/helpers/hooks/useFetchList';
import { saveLimit } from '../shared/constants';
import FilterBar from '../shared/filters/FilterBar';
import OutstandingList from './component/OutstandingList';
import SummaryCards from './component/SummaryCards';
import Pagination from '@/shared/ui/pagination/Pagination';

const ENDPOINT = '/billing/sale/monthly/orders/outstanding/';

const OutStandingReportComp = () => {
  const router = useRouter();             // ← wapas add karo
  const searchParams = useSearchParams(); // ← wapas add karo
  const [showLsi, setShowLsi] = useState(false);

  const { filters, setFilter, resetFilters, hasActiveFilters } = useFilters();
  const { data, pagination, loading, error, refetch } = useFetchList({
    filters,
    endpoint: ENDPOINT,
  });

  const summary = data?.data?.summary || data?.summary || {};

  // ── Single URL sync helper ────────────────────────────────────────────────
const syncUrl = (updates) => {
  const params = new URLSearchParams(searchParams.toString());
  params.set('page',  String(filters.page));
  params.set('limit', String(filters.limit));
  Object.entries(updates).forEach(([k, v]) => params.set(k, String(v)));
  router.push(`?${params.toString()}`, { scroll: false });
};

  // Page change — filters + URL dono update
  const handlePageChange = (page) => {
    setFilter({ page });
    syncUrl({ page }); // ← ye missing tha
  };

  // Limit change — filters + URL dono update, page reset
  const handleLimitChange = (limit) => {
    saveLimit(limit);
    setFilter({ limit, page: 1 });
    syncUrl({ limit, page: 1 }); // ← ye bhi add karo
  };

  return (
    <div
      className="min-h-screen bg-gray-50 p-5 md:p-6"
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <header className="mx-auto mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
            Outstanding Report Overview
          </h1>
          <p className="text-gray-600 text-base font-semibold mt-2">
            Cumulative balances per order up to selected period
          </p>
        </div>
        <SummaryCards
          summary={summary}
          showLsi={showLsi}
          onToggleLsi={() => setShowLsi(v => !v)}
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
          loading={loading}
          error={error}
          onRefetch={refetch}
          showLsi={showLsi}
          onToggleLsi={() => setShowLsi(v => !v)}
        />

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

export default OutStandingReportComp;