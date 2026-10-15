import CollectionReportComp from '@/modules/customers/billing/collection-report/CollectionReportComp';
import React, { Suspense } from 'react';

const page = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <CollectionReportComp />
      </Suspense>
    </div>
  );
};

export default page;