import { useState, useCallback } from 'react';
import { getDefaultFilters, getSavedLimit, PAGE_SIZE_OPTIONS } from '../../constants';

const getUrlParam = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;
  const val = new URLSearchParams(window.location.search).get(key);
  return val !== null ? val : fallback;
};

export const useFilters = () => {
  const [filters, setFilters] = useState(() => {
    const urlLimit = parseInt(getUrlParam('limit', '0'), 10);
    return {
      ...getDefaultFilters(),
      limit: urlLimit && PAGE_SIZE_OPTIONS.includes(urlLimit) ? urlLimit : getSavedLimit(),
      page: 1,
    };
  });

  const setFilter = useCallback((partial) => {
    setFilters(prev => ({ ...prev, ...partial }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ ...getDefaultFilters(), limit: getSavedLimit() });
  }, []);

  const defaults = getDefaultFilters();
  const hasActiveFilters =
    filters.search         !== defaults.search         ||
    filters.stateCode      !== defaults.stateCode      ||
    filters.entityId       !== defaults.entityId       ||
    filters.active         !== defaults.active         ||
    filters.bsoId          !== defaults.bsoId          ||
    filters.companyGroupId !== defaults.companyGroupId ||
    filters.orderType      !== defaults.orderType      ||
    filters.productId      !== defaults.productId      ||
    filters.periodType     !== defaults.periodType     ||
    filters.year           !== defaults.year           ||
    filters.month          !== defaults.month          ||
    filters.startDate      !== defaults.startDate      ||
    filters.endDate        !== defaults.endDate        ||
    filters.fromMonth      !== defaults.fromMonth      ||
    filters.toMonth        !== defaults.toMonth;

  return { filters, setFilter, resetFilters, hasActiveFilters };
};