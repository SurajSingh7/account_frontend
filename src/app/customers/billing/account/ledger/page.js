import React, { Suspense } from 'react'
import LedgerAllDetailsComp from '@/modules/customers/billing/ledger/LedgerAllDetailsComp'

const page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LedgerAllDetailsComp />
    </Suspense>
  )
}

export default page