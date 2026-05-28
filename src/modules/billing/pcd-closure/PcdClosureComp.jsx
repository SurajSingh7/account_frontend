'use client';
import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFilters } from '../shared/helpers/hooks/useFilters';
import { useFetchList } from '../shared/helpers/hooks/useFetchList';
// import { useEntities } from '../shared/helpers/hooks/useFilterOptions';
import { saveLimit } from '../shared/constants';
import FilterBar from '../shared/filters/FilterBar';
import OrderList from './orders/OrderList';
import Pagination from '@/shared/ui/pagination/Pagination';
import { GENERAL_FIELDS, PCD_FIELDS } from '../shared/filters/filterFieldRegistry';

const ENDPOINT = '/billing/sale/ready-order/all';

const PcdClosureComp = () => {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const { filters, setFilter, resetFilters, hasActiveFilters } = useFilters();

  // Fetch entity list once (shared between FilterBar dropdown + EntityChips)
  // const { entities } = useEntities();

  const { data, pagination, loading, error, refetch } = useFetchList({
    filters,
    endpoint: ENDPOINT,
  });

  // API summary — comes back with every list response
  const apiSummary   = data?.summary ?? {};
  const totalCount   = pagination?.total ?? 0;

  const syncUrl = (updates) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => params.set(k, String(v)));
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handlePageChange  = (page)  => { setFilter({ page });   syncUrl({ page }); };
  const handleLimitChange = (limit) => { saveLimit(limit); setFilter({ limit, page: 1 }); syncUrl({ limit, page: 1 }); };

  return (
    <div
      className="min-h-screen bg-gray-50 p-2 md:px-6 md:py-2"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
    >
      <header className="mx-auto mb-4">
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