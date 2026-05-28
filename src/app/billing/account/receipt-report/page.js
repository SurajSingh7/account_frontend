import ReceiptReportComp from '@/modules/billing/receipt-report/ReceiptReportComp';
import React, { Suspense } from 'react';

const page = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <ReceiptReportComp />
      </Suspense>
    </div>
  );
};

export default page;