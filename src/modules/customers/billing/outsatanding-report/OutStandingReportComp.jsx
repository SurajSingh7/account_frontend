'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // ← ye wapas add karo
import { useFilters } from '../shared/helpers/hooks/useFilters';
import { useFetchList } from '../shared/helpers/hooks/useFetchList';
import { saveLimit } from '../shared/constants';
import FilterBar from '../shared/filters/FilterBar';
import OutstandingList from './component/OutstandingList';
import SummaryCards from './component/SummaryCards';
import Pagination from '@/shared/ui/pagination/Pagination';
import { OUTSTANDING_FIELDS } from '../shared/filters/filterFieldRegistry';
import { RotateCw } from 'lucide-react';
import { API_ENDPOINTS } from '@/constants/api';

const ENDPOINT = API_ENDPOINTS.customers.billing.report.outstanding;
const URL_FILTER_KEYS = [
  'search', 'stateCode', 'entityId', 'active', 'bsoId',        
  'companyGroupId', 'orderType', 'productId',                  
  'periodType', 'year', 'month', 'startDate', 'endDate',
  'fromMonth', 'toMonth', 'page', 'limit',
];

const OutStandingReportComp = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showLsi, setShowLsi] = useState(false);

  const { filters, setFilter, resetFilters, hasActiveFilters } = useFilters();

  // ✅ For parent company group connect with its child
  const companyGroupId = searchParams.get('companyGroupId');

  useEffect(() => {
    if (companyGroupId) {
      setFilter({ companyGroupId, page: 1 });

      const params = new URLSearchParams(searchParams.toString());
      params.delete('companyGroupId');
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [companyGroupId, setFilter, router, searchParams]);

  const { data, pagination, loading, error, refetch } = useFetchList({
    filters,
    endpoint: ENDPOINT,
  });

  const apiSummary = {
    orderType: data?.summary?.orderType || data?.summary?.orderTypeCounts || {},
    productCode: data?.summary?.productCode || data?.summary?.productCounts || {},
    entity: data?.summary?.entity || data?.summary?.entityCounts || {},
    totalOrders: data?.summary?.totalOrders || 0,
    totalBalance: data?.summary?.totalBalance || 0,
  };

  const totalCount = pagination?.total || 0;

  // ── Sync ALL filter keys to URL ───────────────────────────────────────────
  const syncFiltersToUrl = useCallback((updatedFilters) => {
    const params = new URLSearchParams();
    URL_FILTER_KEYS.forEach((key) => {
      const val = updatedFilters[key];
      // Only write non-empty, non-default values to keep URL clean
      if (val !== '' && val !== null && val !== undefined) {
        params.set(key, String(val));
      }
    });
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router]);

  // FilterBar onChange — update state AND URL
  const handleFilterChange = useCallback((partial) => {
    setFilter(partial);
    // Merge partial into current filters for URL sync
    syncFiltersToUrl({ ...filters, ...partial });
  }, [filters, setFilter, syncFiltersToUrl]);

  // Clear all filters — reset state AND clear URL
  const handleResetFilters = useCallback(() => {
    resetFilters();
    router.push('?', { scroll: false });
  }, [resetFilters, router]);

  // Page change
  const handlePageChange = useCallback((page) => {
    setFilter({ page });
    syncFiltersToUrl({ ...filters, page });
  }, [filters, setFilter, syncFiltersToUrl]);

  // Limit change — reset to page 1
  const handleLimitChange = useCallback((limit) => {
    saveLimit(limit);
    setFilter({ limit, page: 1 });
    syncFiltersToUrl({ ...filters, limit, page: 1 });
  }, [filters, setFilter, syncFiltersToUrl]);

  return (
    <div
      className="min-h-screen bg-gray-50 p-5 md:px-6 md:py-2"
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <header className="mx-auto mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="flex   gap-2">
            <h1 className="text-3xl font-semibold text-gray-900">
              Outstanding Report Overview
            </h1>

            <button
              type="button"
              onClick={handleResetFilters}
              className=" font-medium font-bold items-center py-3 text-blue-600 hover:text-blue-700 hover:underline"
              title="Refresh report"
            >
              <RotateCw className="h-5 w-5" />
            </button>
          </div>

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
          onChange={handleFilterChange}
          onClear={handleResetFilters}
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
          syncEndpoint={API_ENDPOINTS.customers.billing.monthly.sync}
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