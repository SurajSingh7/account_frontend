import React, { Suspense } from 'react'
import ViewPcdModal from '@/modules/billing/pcd-closure/modal/ViewPcdModal'

const page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ViewPcdModal />
    </Suspense>
  )
}

export default page