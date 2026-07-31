import React, { Suspense } from 'react'
import OrderHistoryModal from '@/modules/customers/billing/pcd-closure/modal/OrderHistoryModal';

const page = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OrderHistoryModal />
        </Suspense>
    )
}

export default page