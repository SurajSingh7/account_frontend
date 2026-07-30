import BillingGroupReportComp from '@/modules/customers/billing/company-group-report/billing-group-report/BillingGroupReportComp';
import React, { Suspense } from 'react';

const page = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <BillingGroupReportComp />
      </Suspense>
    </div>
  );
};

export default page;