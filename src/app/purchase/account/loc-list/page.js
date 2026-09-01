import LocListComp from '@/modules/purchase/loc-list/list/LocListComp';
import React, { Suspense } from 'react';

const page = () => {
    return (
        <div>
            <Suspense fallback={<div>Loading...</div>}>
                <LocListComp />
            </Suspense>
        </div>
    )
}

export default page