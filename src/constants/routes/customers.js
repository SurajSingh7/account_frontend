const BILLING_BASE = '/customers/billing';

export const CUSTOMER_ROUTES = {
  billing: {
    ledger: {
      list: `${BILLING_BASE}/account/ledger`,
      form: `${BILLING_BASE}/account/ledger/form`,
    },
    pcdClosure: {
      root: `${BILLING_BASE}/account/pcd-closure`,
      view: `${BILLING_BASE}/account/pcd-closure/view`,
      generateBill: `${BILLING_BASE}/account/pcd-closure/generate-bill`,
    },
    terminateOrders: `${BILLING_BASE}/account/terminate-orders`,
    orderLinks: `${BILLING_BASE}/account/order-links`,
    bulkPayment: `${BILLING_BASE}/account/bulk-payment`,
    bulkTransactions: `${BILLING_BASE}/account/bulk-transactions`,
    billingReport: `${BILLING_BASE}/account/billing-report`,
    outstandingReport: `${BILLING_BASE}/account/outstanding-report`,
    receiptReport: `${BILLING_BASE}/account/receipt-report`,
    billingGroupReport: `${BILLING_BASE}/account/billing-group-report`,
    outstandingGroupReport: `${BILLING_BASE}/account/outstanding-group-report`,
    receiptGroupReport: `${BILLING_BASE}/account/receipt-group-report`,
    uploadExcel: `${BILLING_BASE}/account/upload-excel`,
    generator: `${BILLING_BASE}/generator`,
    collectionOutstandingReport: `${BILLING_BASE}/collection/outstanding-report`,
    ordersLink: `${BILLING_BASE}/orders`,
    demo: {
      viewCircuit: `${BILLING_BASE}/account/view-circuit1`,
      outstandingReport: `${BILLING_BASE}/account/outstanding-report1`,
      billingReport: `${BILLING_BASE}/account/billing-report1`,
      receiptReport: `${BILLING_BASE}/account/receipt1`,
      bulkUpdate: `${BILLING_BASE}/account/bulk-update1`,
    },
  },
  testPage: '/test-page',
};
