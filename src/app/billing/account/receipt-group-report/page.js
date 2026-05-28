import ReceiptGroupReportComp from '@/modules/billing/company-group-report/receipt-group-report/ReceiptGroupReportComp';
import React, { Suspense } from 'react';

const page = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <ReceiptGroupReportComp />
      </Suspense>
    </div>
  );
};

export default page;