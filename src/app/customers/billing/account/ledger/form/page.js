import React, { Suspense } from 'react'
import LedgerUpdateEntry from '@/modules/customers/billing/ledger/single/edit/LedgerUpdateEntry'

const page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LedgerUpdateEntry />
    </Suspense>
  )
}

export default page