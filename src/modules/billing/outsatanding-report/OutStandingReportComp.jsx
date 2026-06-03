'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFilters } from '../shared/helpers/hooks/useFilters';
import { useFetchList } from '../shared/helpers/hooks/useFetchList';
import { saveLimit } from '../shared/constants';
import FilterBar from '../shared/filters/FilterBar';
import OutstandingList from './component/OutstandingList';
import SummaryCards from './component/SummaryCards';
import Pagination from '@/shared/ui/pagination/Pagination';
import { OUTSTANDING_FIELDS } from '../shared/filters/filterFieldRegistry';

const ENDPOINT = '/billing/sale/report/outstanding/';

const OutStandingReportComp = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showLsi, setShowLsi] = useState(false);

  const { filters, setFilter, resetFilters, hasActiveFilters } = useFilters();

  // ✅ For parent company group connect with its child
  const companyGroupId = searchParams.get('companyGroupId');

  useEffect(() => {
    if (companyGroupId) {

      setFilter({
        companyGroupId,
        page: 1,
      });

      const params = new URLSearchParams(searchParams.toString());

      params.delete('companyGroupId');

      router.replace(`?${params.toString()}`, {
        scroll: false,
      });
    }
  }, [companyGroupId, setFilter, router, searchParams]);


  const { data, pagination, loading, error, refetch } = useFetchList({
    filters,
    endpoint: ENDPOINT,
  });

  // API summary — comes back with every list response
  const apiSummary = {
    orderType:
      data?.summary?.orderType ||
      data?.summary?.orderTypeCounts ||
      {},

    productCode:
      data?.summary?.productCode ||
      data?.summary?.productCounts ||
      {},

    entity:
      data?.summary?.entity ||
      data?.summary?.entityCounts ||
      {},

    totalOrders:
      data?.summary?.totalOrders || 0,

    totalBalance:
      data?.summary?.totalBalance || 0,
  };

  const totalCount = pagination?.total || 0;

  // ── Single URL sync helper ────────────────────────────────────────────────
  const syncUrl = (updates) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(filters.page));
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
          summary={apiSummary}
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
          apiSummary={apiSummary}
          totalCount={totalCount}
          fields={OUTSTANDING_FIELDS}
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