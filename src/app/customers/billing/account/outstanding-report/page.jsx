import OutStandingReportComp from '@/modules/customers/billing/outsatanding-report/OutStandingReportComp';
import React, { Suspense } from 'react';

const page = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <OutStandingReportComp />
      </Suspense>
    </div>
  );
};

export default page;