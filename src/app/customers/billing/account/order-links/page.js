import { Suspense } from 'react';
import OrderLinksComp from '@/modules/customers/billing/order-links/OrderLinksComp';
import React from 'react'

const page = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <OrderLinksComp />
      </Suspense>
    </div>
  )
}

export default page;