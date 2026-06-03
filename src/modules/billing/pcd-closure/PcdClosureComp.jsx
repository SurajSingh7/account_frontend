'use client';

import React, { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFilters } from '../shared/helpers/hooks/useFilters';
import { useFetchList } from '../shared/helpers/hooks/useFetchList';
import { saveLimit } from '../shared/constants';
import FilterBar from '../shared/filters/FilterBar';
import OrderList from './orders/OrderList';
import Pagination from '@/shared/ui/pagination/Pagination';
import { PCD_FIELDS } from '../shared/filters/filterFieldRegistry';
import { RotateCw } from 'lucide-react';

const ENDPOINT = '/billing/sale/ready-order/all';

const URL_FILTER_KEYS = [
  'search', 'stateCode', 'entityId', 'active', 'bsoId',
  'companyGroupId', 'orderType', 'productId',
  'periodType', 'year', 'month', 'startDate', 'endDate',
  'fromMonth', 'toMonth', 'page', 'limit',
];

const PcdClosureComp = () => {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const { filters, setFilter, resetFilters, hasActiveFilters } = useFilters();

  const { data, pagination, loading, error, refetch } = useFetchList({
    filters,
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
      className="min-h-screen bg-gray-50 p-2 md:px-6 md:py-2"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
    >
      <header className="mx-auto mb-4">
        <div className="flex gap-2">
          <h1 className="text-3xl font-semibold text-gray-900">
            PCD Closure Overview
          </h1>
          <button
            type="button"
            onClick={handleResetFilters}
            className="font-medium font-bold items-center py-3 text-blue-600 hover:text-blue-700 hover:underline"
            title="Refresh report"
          >
            <RotateCw className="h-5 w-5" />
          </button>
        </div>
        <p className="text-gray-600 text-base font-semibold mt-2">
          Centralized dashboard to monitor, track, and complete all PCD closure and billing operations seamlessly.
        </p>
      </header>

      <main className="mx-auto space-y-5">

        <FilterBar
          filters={filters}
          onChange={handleFilterChange}
          onClear={handleResetFilters}
          hasActive={hasActiveFilters}
          apiSummary={apiSummary}
          totalCount={totalCount}
          fields={PCD_FIELDS}
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

export default PcdClosureComp;