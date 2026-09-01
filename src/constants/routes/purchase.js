const PURCHASE_BASE = '/purchase';

export const PURCHASE_ROUTES = {

  // Mirrors CUSTOMER_ROUTES.billing structure/keys 1:1 (see src/constants/routes/customers.js)
  ledger: {
    list: `${PURCHASE_BASE}/account/ledger`,
    form: `${PURCHASE_BASE}/account/ledger/form`,
  },
  locClosure: {
    root: `${PURCHASE_BASE}/account/loc-closure`,
    view: `${PURCHASE_BASE}/account/loc-closure/view`,
    generateBill: `${PURCHASE_BASE}/account/loc-closure/generate-bill`,
  },
  locList : `${PURCHASE_BASE}/account/loc-list`,
  terminateOrders: `${PURCHASE_BASE}/account/terminate-orders`,
  orderLinks: `${PURCHASE_BASE}/account/order-links`,
  bulkPayment: `${PURCHASE_BASE}/account/bulk-payment`,
  bulkTransactions: `${PURCHASE_BASE}/account/bulk-transactions`,
  billingReport: `${PURCHASE_BASE}/account/billing-report`,
  outstandingReport: `${PURCHASE_BASE}/account/outstanding-report`,
  receiptReport: `${PURCHASE_BASE}/account/receipt-report`,
  billingGroupReport: `${PURCHASE_BASE}/account/billing-group-report`,
  outstandingGroupReport: `${PURCHASE_BASE}/account/outstanding-group-report`,
  receiptGroupReport: `${PURCHASE_BASE}/account/receipt-group-report`,
  uploadExcel: `${PURCHASE_BASE}/account/upload-excel`,
  generator: `${PURCHASE_BASE}/generator`,
  collectionOutstandingReport: `${PURCHASE_BASE}/collection/outstanding-report`,
  ordersLink: `${PURCHASE_BASE}/orders`,
};
