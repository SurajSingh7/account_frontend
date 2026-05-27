'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFilters } from '../shared/helpers/hooks/useFilters';
import { useFetchList } from '../shared/helpers/hooks/useFetchList';
import { saveLimit } from '../shared/constants';
import FilterBar from '../shared/filters/FilterBar';
import BillingList from './component/BillingList';
import SummaryCard from './component/SummaryCard';
import Pagination from '@/shared/ui/pagination/Pagination';
import { BILLING_FIELDS } from '../shared/filters/filterFieldRegistry';

const ENDPOINT = '/billing/sale/monthly/orders/report';

const BillingReportComp = () => {
  const router = useRouter();
  const searchParams = useSearchParams();





  const { filters, setFilter, resetFilters, hasActiveFilters } = useFilters();

  // // ✅ For parent company group connect with its child 
  // const companyGroupId = searchParams.get('companyGroupId');
  // useEffect(() => {
  //   if (companyGroupId) {
  //     setFilter({
  //       companyGroupId,
  //       page: 1,
  //     });
  //   }
  // }, [companyGroupId,setFilter]);

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

  const apiSummary = {
    totalOrders:
      data?.summary?.totalOrders || 0,

    billing:
      data?.summary?.billing || 0,

    miscCharge:
      data?.summary?.miscCharge || 0,

    creditNote:
      data?.summary?.creditNote || 0,

    netBilling:
      data?.summary?.netBilling || 0,

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
  };

  const totalCount =
    pagination?.total ||
    0;

  const syncUrl = (updates) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(filters.page));
    params.set('limit', String(filters.limit));
    Object.entries(updates).forEach(([k, v]) => params.set(k, String(v)));
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handlePageChange = (page) => {
    setFilter({ page });
    syncUrl({ page });
  };

  const handleLimitChange = (limit) => {
    saveLimit(limit);
    setFilter({ limit, page: 1 });
    syncUrl({ limit, page: 1 });
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
            Billing Report Overview
          </h1>
          <p className="text-gray-600 text-base font-semibold mt-2">
            Month-wise billing summary per order up to selected period
          </p>
        </div>
        <SummaryCard summary={apiSummary} />
      </header>

      <main className="mx-auto space-y-5">

        <FilterBar
          filters={filters}
          onChange={setFilter}
          onClear={resetFilters}
          hasActive={hasActiveFilters}
          apiSummary={apiSummary}
          totalCount={totalCount}
          fields={BILLING_FIELDS}
        />

        <BillingList
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

export default BillingReportComp;