// ─── Period / Month helpers ───────────────────────────────────────────────────
export const ALL_MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

export const getCurrentYear  = () => new Date().getFullYear();
export const getCurrentMonth = () => new Date().getMonth(); // 0-indexed

// export const getYearOptions = () => ['All', ...Array.from({ length: 8 }, (_, i) => getCurrentYear() - i)];
export const getYearOptions = () => [ ...Array.from({ length: 10 }, (_, i) => getCurrentYear() - i)];

export const getAvailableMonths = (selectedYear) => {
  if (selectedYear === getCurrentYear()) return ALL_MONTHS.slice(0, getCurrentMonth() + 1);
  return ALL_MONTHS;
};

// ─── Default filter state ─────────────────────────────────────────────────────
export const getDefaultFilters = () => ({
  search:       '',
  stateCode:    '',
  entityId:     '',
  active:       'true',          // 'true' | 'false'
  bsoId:        '',
  panNumber:    '',              // company filter sent as panNumber
  periodType:   'period',        // 'period' | 'dateRange'
  year:         getCurrentYear(),
  month:        getCurrentMonth() + 1,  // 1-indexed; '' = All
  startDate:    '',
  endDate:      '',
  page:         1,
  limit:        10,
});

// ─── API param builders ───────────────────────────────────────────────────────
export const buildListParams = (filters) => {
  const params = new URLSearchParams();
  params.set('page',  String(filters.page));
  params.set('limit', String(filters.limit));

  if (filters.search)    params.set('search',    filters.search);
  if (filters.stateCode) params.set('stateCode', filters.stateCode);
  if (filters.entityId)  params.set('entityId',  filters.entityId);
  if (filters.bsoId)     params.set('bsoId',     filters.bsoId);
  if (filters.panNumber) params.set('panNumber', filters.panNumber);

  // Active / Inactive
  params.set('Active', filters.active);

  if (filters.periodType === 'period') {
    if (filters.year && filters.year !== 'All') params.set('year', String(filters.year));
    if (filters.month)                          params.set('month', String(filters.month));
  } else {
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate)   params.set('endDate',   filters.endDate);
  }

  return params.toString();
};