/**
 * filterFieldRegistry.js
 */

export const FILTER_FIELD_KEYS = Object.freeze({
  SEARCH:       'search',
  STATE:        'stateCode',
  ORDER_TYPE:   'orderType',
  PRODUCT:      'productId',
  ENTITY:       'entityId',
  ACTIVE:       'active',
  BSO:          'bsoId',
  COMPANY:      'companyGroupId',
  
  // Period — use ONE or MANY of these three independently:
  PERIOD:       'period',       // year + month picker
  DATE_RANGE:   'dateRange',    // from date / to date
  MONTH_RANGE:  'monthRange',   // from month / to month
});

export const FILTER_REGISTRY = [
  { key: FILTER_FIELD_KEYS.SEARCH,      label: 'Search'          },
  { key: FILTER_FIELD_KEYS.STATE,       label: 'State'           },
  { key: FILTER_FIELD_KEYS.ORDER_TYPE,  label: 'Order Type'      },
  { key: FILTER_FIELD_KEYS.PRODUCT,     label: 'Product'         },
  { key: FILTER_FIELD_KEYS.ENTITY,      label: 'Entity'          },
  { key: FILTER_FIELD_KEYS.ACTIVE,      label: 'Active/Inactive' },
  { key: FILTER_FIELD_KEYS.BSO,         label: 'BSO'             },
  { key: FILTER_FIELD_KEYS.COMPANY,     label: 'Company'         },
  { key: FILTER_FIELD_KEYS.PERIOD,      label: 'Period'          },
  { key: FILTER_FIELD_KEYS.DATE_RANGE,  label: 'Date Range'      },
  { key: FILTER_FIELD_KEYS.MONTH_RANGE, label: 'Month Range'     },
];

// ─── Presets ──────────────────────────────────────────────────────────────────

/** PCD Closure — all 3 period modes */
export const PCD_FIELDS = [
  'search', , 'orderType', 'productId',
  'entityId', 'stateCode','companyGroupId',
  'period', 'dateRange',
];
export const OrderLinks_FIELDS = [
  ...PCD_FIELDS,
   'active',
];

export const OrdersTerminate_FIELDS = [
  ...PCD_FIELDS
];


/** Billing — period + dateRange only, no monthRange */
export const BILLING_FIELDS = [
  'search', , 'orderType', 'productId',
  'entityId', 'stateCode','companyGroupId','active',
  'period', 'monthRange',
];
export const RECEIPT_FIELDS = [
  'search', , 'orderType', 'productId',
  'entityId', 'stateCode','companyGroupId','active',
  'period','monthRange',
];

export const OUTSTANDING_FIELDS = [
 'search', , 'orderType', 'productId',
  'entityId', 'stateCode','companyGroupId','active',
  'period', 
];
export const GENERAL_FIELDS = [
  'search', 'stateCode', 'orderType', 'productId',
  'entityId', 'active', 'companyGroupId',
  'period', 'dateRange', 
];

                                                                                  
/** Everything */
export const ALL_FIELDS = FILTER_REGISTRY.map(f => f.key);