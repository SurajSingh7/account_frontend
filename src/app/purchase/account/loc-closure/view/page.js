import React, { Suspense } from 'react'
import ViewLocModal from '@/modules/purchase/loc-closure/modal/ViewLocModal'

const page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ViewLocModal />
    </Suspense>
  )
}

export default page