import React, { Suspense } from 'react'
import LedgerAllDetailsComp from '@/modules/billing/ledger/LedgerAllDetailsComp'

const page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LedgerAllDetailsComp />
    </Suspense>
  )
}

export default page