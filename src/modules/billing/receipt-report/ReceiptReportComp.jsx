'use client';

import React, { useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFilters } from '../shared/helpers/hooks/useFilters';
import { useFetchList } from '../shared/helpers/hooks/useFetchList';
import { saveLimit } from '../shared/constants';
import FilterBar from '../shared/filters/FilterBar';
import ReceiptList from './component/ReceiptList';
import SummaryCard from './component/SummaryCard';
import Pagination from '@/shared/ui/pagination/Pagination';
import { RECEIPT_FIELDS } from '../shared/filters/filterFieldRegistry';
import { RotateCw } from 'lucide-react';

const ENDPOINT = '/billing/sale/monthly/orders/receipt/';

const URL_FILTER_KEYS = [
  'search', 'stateCode', 'entityId', 'active', 'bsoId',
  'companyGroupId', 'orderType', 'productId',
  'periodType', 'year', 'month', 'startDate', 'endDate',
  'fromMonth', 'toMonth', 'page', 'limit',
];

const ReceiptReportComp = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

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
    totalOrders:   data?.summary?.totalOrders   || 0,
    received:      data?.summary?.received      || 0,
    tdsConfirm:    data?.summary?.tdsConfirm    || 0,
    tdsProvision:  data?.summary?.tdsProvision  || 0,
    totalReceipts: data?.summary?.totalReceipts || 0,
    creditNote:    data?.summary?.creditNote    || 0,
    orderType:     data?.summary?.orderType     || data?.summary?.orderTypeCounts || {},
    productCode:   data?.summary?.productCode   || data?.summary?.productCounts   || {},
    entity:        data?.summary?.entity        || data?.summary?.entityCounts    || {},
  };

  const totalCount = pagination?.total || 0;

  // ── Sync ALL filter keys to URL ─────────────────────────────────────────
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
      className="min-h-screen bg-gray-50 p-5 md:px-6 md:py-2"
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <header className="mx-auto mb-4 flex items-start justify-between gap-4">
        <div>

          {/* ✅ Title + Refresh button — same as Outstanding */}
          <div className="flex gap-2">
            <h1 className="text-3xl font-semibold text-gray-900">
              Receipt Report Overview
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
            Receipts, CN & TDS by Order
          </p>
        </div>

        <SummaryCard summary={apiSummary} />
      </header>

      <main className="mx-auto space-y-5">

        <FilterBar
          filters={filters}
          onChange={handleFilterChange}
          onClear={handleResetFilters}
          hasActive={hasActiveFilters}
          apiSummary={apiSummary}
          totalCount={totalCount}
          fields={RECEIPT_FIELDS}
        />

        <ReceiptList
          data={data}
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

export default ReceiptReportComp;