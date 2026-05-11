'use client';
import React from 'react';
import { useSearchParams } from 'next/navigation';
import { useLedgerList } from './hook/useLedgerList';
import LedgerList from './component/LedgerList';

const LedgerAllDetailsComp = () => {
  const searchParams = useSearchParams();

  const orderId = searchParams.get('orderId') ?? '';
  const billingReadId = searchParams.get('billingReadId') ?? '';
  const circuitKey = searchParams.get('circuitKey') ?? '';

  const {  data, pagination, loading, error, refetch, setPage, } = useLedgerList({
    endpoint: '/billing/sale/monthly/order',
    payload: {
      circuitKey,
      orderId,
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-5 md:p-6">
      <main className="mx-auto space-y-5">
        <LedgerList
          data={data}
          pagination={pagination}
          loading={loading}
          error={error}
          onRefetch={refetch}
          onPageChange={(page) => setPage(page)}
          title="Monthly Billing Breakdown"
          meta={`Order: ${orderId || '–'}`}

        />
      </main>
    </div>
  );
};

export default LedgerAllDetailsComp;