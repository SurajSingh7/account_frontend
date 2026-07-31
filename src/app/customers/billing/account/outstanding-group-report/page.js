import OutStandingGroupReportComp from '@/modules/customers/billing/company-group-report/outsatanding-group-report/OutStandingGroupReportComp';
import React, { Suspense } from 'react';

const page = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <OutStandingGroupReportComp />
      </Suspense>
    </div>
  );
};

export default page;