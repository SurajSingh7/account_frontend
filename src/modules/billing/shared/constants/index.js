// ─── Period / Month helpers ───────────────────────────────────────────────────
export const ALL_MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

export const getCurrentYear  = () => new Date().getFullYear();
export const getCurrentMonth = () => new Date().getMonth(); // 0-indexed

export const getYearOptions = () => [...Array.from({ length: 10 }, (_, i) => getCurrentYear() - i)];

export const getAvailableMonths = (selectedYear) => {
  if (selectedYear === getCurrentYear()) return ALL_MONTHS.slice(0, getCurrentMonth() + 1);
  return ALL_MONTHS;
};

// ─── Pagination preference helpers  ──────────────────────────────────────────
// localStorage sirf preference save karta hai — source of truth filters hai
const LIMIT_STORAGE_KEY  = 'pagination_limit';
export const PAGE_SIZE_OPTIONS  = [10, 25, 50, 75, 100];

export const getSavedLimit = () => {
  try {
    const v = parseInt(localStorage.getItem(LIMIT_STORAGE_KEY), 10);
    return PAGE_SIZE_OPTIONS.includes(v) ? v : 10;
  } catch { return 10; }
};

export const saveLimit = (limit) => {
  try { localStorage.setItem(LIMIT_STORAGE_KEY, String(limit)); } catch { /* noop */ }
};

// ─── Default filter state ─────────────────────────────────────────────────────
export const getDefaultFilters = () => ({
  search:         '',
  stateCode:      '',
  entityId:       '',
  active:         'true',
  bsoId:          '',
  companyGroupId: '',
  periodType:     'period',
  year:           getCurrentYear(),
  month:          getCurrentMonth() + 1,
  startDate:      '',
  endDate:        '',
  page:           1,
  limit:          10,
});

// ─── API param builders ───────────────────────────────────────────────────────
export const buildListParams = (filters) => {
  const params = new URLSearchParams();
  params.set('page',  String(filters.page));
  params.set('limit', String(filters.limit));

  if (filters.search)         params.set('search',         filters.search);
  if (filters.stateCode)      params.set('stateCode',      filters.stateCode);
  if (filters.entityId)       params.set('entityId',       filters.entityId);
  if (filters.bsoId)          params.set('bsoId',          filters.bsoId);
  if (filters.companyGroupId) params.set('companyGroupId', filters.companyGroupId);

  params.set('Active', filters.active);

  if (filters.periodType === 'period') {
    if (filters.year && filters.year !== 'All') params.set('year',  String(filters.year));
    if (filters.month)                          params.set('month', String(filters.month));
  } else {
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate)   params.set('endDate',   filters.endDate);
  }

  return params.toString();
};