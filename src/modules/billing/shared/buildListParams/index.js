export const buildListParams = (filters) => {
  const params = new URLSearchParams();
  params.set('page',  String(filters.page));
  params.set('limit', String(filters.limit));

  if (filters.search)         params.set('search',         filters.search);
  if (filters.stateCode)      params.set('stateCode',      filters.stateCode);
  if (filters.entityId)       params.set('entityId',       filters.entityId);
  if (filters.bsoId)          params.set('bsoId',          filters.bsoId);
  if (filters.companyGroupId) params.set('companyGroupId', filters.companyGroupId);
  if (filters.orderType)      params.set('orderType',      filters.orderType);
  if (filters.productId)      params.set('productId',      filters.productId);

  params.set('Active', filters.active);

  if (filters.periodType === 'period') {
    if (filters.year && filters.year !== 'All') params.set('year',  String(filters.year));
    if (filters.month)                          params.set('month', String(filters.month));
  } else if (filters.periodType === 'dateRange') {
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate)   params.set('endDate',   filters.endDate);
  } else if (filters.periodType === 'monthRange') {
    if (filters.fromMonth) params.set('fromMonth', filters.fromMonth);
    if (filters.toMonth)   params.set('toMonth',   filters.toMonth);
  }

  return params.toString();
};