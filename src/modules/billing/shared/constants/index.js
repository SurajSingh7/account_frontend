export const ALL_MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

export const getCurrentYear  = () => new Date().getFullYear();
export const getCurrentMonth = () => new Date().getMonth(); // 0-indexed

export const getYearOptions = () =>
  Array.from({ length: 10 }, (_, i) => getCurrentYear() - i);

export const getAvailableMonths = (selectedYear) =>
  selectedYear === getCurrentYear()
    ? ALL_MONTHS.slice(0, getCurrentMonth() + 1)
    : ALL_MONTHS;

const LIMIT_STORAGE_KEY = 'pagination_limit';
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 75, 100];

export const getSavedLimit = () => {
  try {
    const v = parseInt(localStorage.getItem(LIMIT_STORAGE_KEY), 10);
    return PAGE_SIZE_OPTIONS.includes(v) ? v : 10;
  } catch { return 10; }
};
export const roundUp = (val) => Math.round(val ?? 0);

export const saveLimit = (limit) => {
  try { localStorage.setItem(LIMIT_STORAGE_KEY, String(limit)); } catch { /* noop */ }
};

export const getDefaultFilters = () => ({
  search:         '',
  stateCode:      '',
  entityId:       '',
  active:         '',
  bsoId:          '',
  companyGroupId: '',
  orderType:      '',   // NEW — send NAME to API
  productId:      '',   // NEW — send ID to API
  periodType:     'period',
  year:           getCurrentYear(),
  month:          getCurrentMonth() + 1,
  startDate:      '',
  endDate:        '',
  fromMonth:      '',   // NEW — MM-YYYY format
  toMonth:        '',   // NEW — MM-YYYY format
  page:           1,
  limit:          10,
});