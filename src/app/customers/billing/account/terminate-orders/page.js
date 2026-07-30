import TerminateOrderComp from '@/modules/customers/billing/terminate-orders/TerminateOrderComp';
import React from 'react'
import { Suspense } from 'react';

const page = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <TerminateOrderComp />
      </Suspense>
    </div>
  )
}

export default page;