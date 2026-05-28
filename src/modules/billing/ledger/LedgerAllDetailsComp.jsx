'use client';
import React from 'react';
import { useSearchParams } from 'next/navigation';
import { useLedgerList } from './hook/useLedgerList';
import LedgerList from './component/LedgerList';

const HIDDEN_COLUMNS_MAP = {
  bill:        ['runningOutstanding', 'outstandingAfterAdjustment', 'receiptAmount','actions','tdsConfirm','tdsProvision','received'],
  recipt:      ['runningOutstanding','miscBill', 'outstandingAfterAdjustment', ,'actions','netBilling','days','period','basicBill','cgst','sgst','igst','basicGst'],
  outstanding: [,'receiptAmount','netBilling'],
};

const LedgerAllDetailsComp = () => {
  const searchParams = useSearchParams();

  const orderId       = searchParams.get('orderId')       ?? '';
  const billingReadId = searchParams.get('billingReadId') ?? '';
  const circuitKey    = searchParams.get('circuitKey')    ?? '';
  const ledgerName    = searchParams.get('ledgerName')    ?? '';   

  const hiddenColumns = HIDDEN_COLUMNS_MAP[ledgerName] ?? [];     

  const { data, pagination, loading, error, refetch, setPage } = useLedgerList({
    endpoint: '/billing/sale/monthly/order',
    payload: { circuitKey, orderId },
  });

  return (
    <div className="min-h-screen mx-auto  p-7 md:p-6">
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
          hiddenColumns={hiddenColumns}
          ledgerName={ledgerName}
        />
      </main>
    </div>
  );
};

export default LedgerAllDetailsComp;