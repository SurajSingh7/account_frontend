import PcdClosureComp from '@/modules/billing/pcd-closure/PcdClosureComp';
import React, { Suspense } from 'react';

const page = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <PcdClosureComp />
      </Suspense>
    </div>
  );
};

export default page;