import React, { Suspense } from 'react'
import LedgerAllDetailsComp from '@/modules/purchase/ledger/LedgerAllDetailsComp'

const page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LedgerAllDetailsComp />
    </Suspense>
  )
}

export default page