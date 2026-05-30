'use client';
import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFilters } from '../shared/helpers/hooks/useFilters';
import { useFetchList } from '../shared/helpers/hooks/useFetchList';
import { saveLimit } from '../shared/constants';
import FilterBar from '../shared/filters/FilterBar';
import OrderList from '../pcd-closure/orders/OrderList';
import Pagination from '@/shared/ui/pagination/Pagination';
import { GENERAL_FIELDS } from '../shared/filters/filterFieldRegistry';

const ENDPOINT = '/billing/sale/ready-order/all';

const TerminateOrderComp = () => {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const { filters, setFilter, resetFilters, hasActiveFilters } = useFilters();
  
  const { active, ...restFilters } = filters;
 const terminateFilters = { ...restFilters, isTerminate: true };

  const { data, pagination, loading, error, refetch } = useFetchList({
    filters: terminateFilters,
    endpoint: ENDPOINT,
  });

  const apiSummary = data?.summary ?? {};
  const totalCount = pagination?.total ?? 0;

  const syncUrl = (updates) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => params.set(k, String(v)));
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handlePageChange  = (page)  => { setFilter({ page });                             syncUrl({ page }); };
  const handleLimitChange = (limit) => { saveLimit(limit); setFilter({ limit, page: 1 }); syncUrl({ limit, page: 1 }); };

  return (
    <div
      className="min-h-screen bg-red-50 p-2 md:px-6 md:py-2"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
    >
  

      <header className="mx-auto mb-4">
        <div className="flex items-center gap-3">
          {/* Red accent bar */}
          <div className="h-9 w-1 rounded-full bg-red-500" />
          <div>
            <h1 className="text-3xl font-semibold text-red-700">Terminate Order Overview</h1>
            <p className="text-red-500 text-base font-medium mt-0.5">
              Centralized dashboard to monitor, track, and manage all terminate order operations seamlessly.
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto space-y-5">

        <FilterBar
          filters={filters}
          onChange={setFilter}
          onClear={resetFilters}
          hasActive={hasActiveFilters}
          apiSummary={apiSummary}
          totalCount={totalCount}
          fields={GENERAL_FIELDS}
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