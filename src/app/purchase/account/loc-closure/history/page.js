import OrderPurchaseInvoiceHistoryModal from '@/modules/purchase/loc-closure/modal/HistoryModal'
import React, { Suspense } from 'react'

const page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderPurchaseInvoiceHistoryModal />
    </Suspense>
  )
}

export default page