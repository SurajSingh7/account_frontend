export const CUSTOMER_API = {
  billing: {
    companyGroup: {
      all: '/company/group/all',
    },
    config: {
      indianStates: '/config/indian-states/',
    },
    bso: {
      parentAll: '/bso/parent/all/',
    },
    ledger: {
      monthlyOrder: '/billing/sale/monthly/order',
      transactionsHistory: '/billing/sale/ledger/transactions/history',
      openingAdjustment: '/billing/sale/ledger/opening-adjustment',
      statement: '/billing/sale/ledger/statement',
      entry: '/billing/sale/ledger/entry',
      modify: '/billing/sale/ledger/modify',
      moveProvisionToConfirm: '/billing/sale/ledger/move-provision-to-confirm/',
      calculateCreditNoteAmount: '/billing/sale/ledger/calculate-credit-note-amount',
      bulk: {
        paymentPrev: '/billing/sale/ledger/bulk/payment-prev',
        paymentSubmit: '/billing/sale/ledger/bulk/payment-submit',
        transactionsAll: '/billing/sale/ledger/bulk/transactions/all',
        transactionDetails: '/billing/sale/ledger/bulk/transactions/details',
        openingAdjustment: '/billing/sale/ledger/bulk/opening-adjustment',
        openingAdjustmentHistory: '/billing/sale/ledger/bulk/opening-adjustment-history',
      },
    },
    readyOrder: {
      all: '/billing/sale/ready-order/all',
      base: '/billing/sale/ready-order',
      modify: '/billing/sale/ready-order/modify',
    },
    monthly: {
      generate: '/billing/sale/monthly/generate',
    },
    report: {
      sell: '/billing/sale/report/sell',
      outstanding: '/billing/sale/report/outstanding/',
      receipt: '/billing/sale/report/receipt/',
      company: {
        sell: '/billing/sale/report/company/sell',
        outstanding: '/billing/sale/report/company/outstanding',
        receipt: '/billing/sale/report/company/receipt',
      },
    },
  },
};

export const EXTERNAL_API = {
  entityAliasGist:
    'https://gist.githubusercontent.com/SurajSingh7/ee934466c4ac158ebb20dd8eee7604fc/raw/entity-alias.json',
};
