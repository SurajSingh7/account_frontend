import BulkPaymentComp from "@/modules/customers/billing/bulkPayment/BulkPaymentComp";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BulkPaymentComp />
    </Suspense>
  );
};