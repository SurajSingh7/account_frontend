import React, { Suspense } from 'react'
import GenerateBillModal from '@/modules/customers/billing/pcd-closure/modal/GenerateBillModal'

const page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GenerateBillModal />
    </Suspense>
  )
}

export default page