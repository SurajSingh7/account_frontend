export const PURCHASE_API = {
  companyGroup: {
    all: '/company/group/all',
  },
  entity: {
    all: '/config/parent/internal-company/all',
  },
  config: {
    indianStates: '/config/indian-states/',
  },
  bso: {
    parentAll: '/bso/parent/all/',
  },
  ledger: {
    monthlyOrder: '/billing/purchase/monthly/order',
    transactionsHistory: '/billing/purchase/ledger/transactions/history',
    openingAdjustment: '/billing/purchase/ledger/opening-adjustment',
    statement: '/billing/purchase/ledger/statement',
    entry: '/billing/purchase/ledger/entry',
    modify: '/billing/purchase/ledger/modify',
    moveProvisionToConfirm: '/billing/purchase/ledger/move-provision-to-confirm/',
    calculateCreditNoteAmount: '/billing/purchase/ledger/calculate-credit-note-amount',
    calculateTdsRate: '/billing/purchase/ledger/calculate-tds-rate',
    bulk: {
      paymentPrev: '/billing/purchase/ledger/bulk/payment-prev',
      paymentSubmit: '/billing/purchase/ledger/bulk/payment-submit',
      transactionsAll: '/billing/purchase/ledger/bulk/transactions/all',
      transactionDetails: '/billing/purchase/ledger/bulk/transactions/details',
      openingAdjustment: '/billing/purchase/ledger/bulk/opening-adjustment',
      openingAdjustmentHistory: '/billing/purchase/ledger/bulk/opening-adjustment-history',
    },
  },
  locList : {
    all : "/bso/loc/all"
  },
  readyOrder: {
    all: '/billing/purchase/ready-order/all',
    base: '/billing/purchase/ready-order',
    modify: '/billing/purchase/ready-order/modify',
  },
  monthly: {
    generate: '/billing/purchase/monthly/generate',
    detail: '/billing/purchase/monthly',
    remarks: '/billing/purchase/monthly/remarks',
    sync: '/billing/purchase/monthly/sync',
  },
  report: {
    sell: '/billing/purchase/report/sell',
    outstanding: '/billing/purchase/report/outstanding/',
    receipt: '/billing/purchase/report/receipt/',
    company: {
      sell: '/billing/purchase/report/company/sell',
      outstanding: '/billing/purchase/report/company/outstanding',
      receipt: '/billing/purchase/report/company/receipt',
    },
  },
};
