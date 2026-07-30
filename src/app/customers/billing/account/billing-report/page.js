import BillingReportComp from '@/modules/customers/billing/billing-report/BillingReportComp';
import React, { Suspense } from 'react';

const page = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <BillingReportComp />
      </Suspense>
    </div>
  );
};

export default page;