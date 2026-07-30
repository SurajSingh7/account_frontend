'use client';

import React, { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFilters } from '../shared/helpers/hooks/useFilters';
import { useFetchList } from '../shared/helpers/hooks/useFetchList';
import { saveLimit } from '../shared/constants';
import FilterBar from '../shared/filters/FilterBar';
import OrderList from '../loc-closure/orders/OrderList';
import Pagination from '@/shared/ui/pagination/Pagination';
import { OrdersTerminate_FIELDS } from '../shared/filters/filterFieldRegistry';
import { RotateCw } from 'lucide-react';
import { API_ENDPOINTS } from '@/constants/api';

const ENDPOINT = API_ENDPOINTS.purchase.readyOrder.all;

const URL_FILTER_KEYS = [
  'search', 'stateCode', 'entityId', 'bsoId',
  'companyGroupId', 'orderType', 'productId',
  'periodType', 'year', 'month', 'startDate', 'endDate',
  'fromMonth', 'toMonth', 'page', 'limit',
  // note: 'active' intentionally excluded — replaced by isTerminate:true
];

const TerminateOrderComp = () => {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const { filters, setFilter, resetFilters, hasActiveFilters } = useFilters();

  // Strip 'active' and inject isTerminate for the API call
  const { active, ...restFilters } = filters;
  const terminateFilters = { ...restFilters, isTerminate: true };

  const { data, pagination, loading, error, refetch } = useFetchList({
    filters: terminateFilters,
    endpoint: ENDPOINT,
  });

  const apiSummary = data?.summary ?? {};
  const totalCount = pagination?.total ?? 0;

  // ── Sync ALL filter keys to URL ───────────────────────────────────────────
  const syncFiltersToUrl = useCallback((updatedFilters) => {
    const params = new URLSearchParams();
    URL_FILTER_KEYS.forEach((key) => {
      const val = updatedFilters[key];
      if (val !== '' && val !== null && val !== undefined) {
        params.set(key, String(val));
      }
    });
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router]);

  // FilterBar onChange — update state AND URL
  const handleFilterChange = useCallback((partial) => {
    setFilter(partial);
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
      className="min-h-screen bg-red-500/3 p-2 md:px-6 md:py-2"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
    >
      <header className="mx-auto mb-4">
        <div className="flex items-center gap-3">
          {/* Red accent bar */}
          <div className="h-9 w-1 rounded-full bg-red-500" />
          <div>
            <div className="flex gap-2">
              <h1 className="text-3xl font-semibold text-red-700">
                Purchase Terminate Order Overview
              </h1>
              <button
                type="button"
                onClick={handleResetFilters}
                className="font-bold items-center py-3 text-red-500 hover:text-red-600 hover:underline"
                title="Refresh report"
              >
                <RotateCw className="h-5 w-5" />
              </button>
            </div>
            <p className="text-red-500 text-base font-medium mt-0.5">
              Centralized dashboard to monitor, track, and manage all terminate order operations seamlessly.
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto space-y-5">

        <FilterBar
          filters={filters}
          onChange={handleFilterChange}
          onClear={handleResetFilters}
          hasActive={hasActiveFilters}
          apiSummary={apiSummary}
          totalCount={totalCount}
          fields={OrdersTerminate_FIELDS}
        />

        <OrderList
          orders={data?.data}
          loading={loading}
          error={error}
          onRefetch={refetch}
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

export default TerminateOrderComp;