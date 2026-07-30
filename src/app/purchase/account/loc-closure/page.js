import LocClosureComp from '@/modules/purchase/loc-closure/LocClosureComp';
import React, { Suspense } from 'react';

const page = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <LocClosureComp />
      </Suspense>
    </div>
  );
};

export default page;