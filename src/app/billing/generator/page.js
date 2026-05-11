import React, { Suspense } from 'react'
import MonthlyBillGeneratorComp from '@/modules/billing/demo/generator/MonthlyBillGeneratorComp'

const page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MonthlyBillGeneratorComp />
    </Suspense>
  )
}

export default page