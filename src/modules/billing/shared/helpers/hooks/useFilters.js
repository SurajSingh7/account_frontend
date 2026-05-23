import { useState, useCallback } from 'react';
import { getDefaultFilters, getSavedLimit, PAGE_SIZE_OPTIONS } from '../../constants';

// URL se value read karne ka helper — SSR safe
const getUrlParam = (key, fallback) => {
  if (typeof window === 'undefined') return fallback; // SSR safe
  const params = new URLSearchParams(window.location.search);
  const val = params.get(key);
  return val !== null ? val : fallback;
};

export const useFilters = () => {

  const [filters, setFilters] = useState(() => {
    const urlPage  = parseInt(getUrlParam('page',  '1'), 10);
    const urlLimit = parseInt(getUrlParam('limit', '0'), 10);

    return {
      ...getDefaultFilters(),
      limit: urlLimit && PAGE_SIZE_OPTIONS.includes(urlLimit)
               ? urlLimit
               : getSavedLimit(),    // URL mein limit hai toh woh, warna localStorage
      // page: urlPage > 0 ? urlPage : 1, // URL mein page hai toh woh, warna 1
      page: 1,
    };
  });
  
  
  const setFilter = useCallback((partial) => {
    setFilters(prev => ({ ...prev, ...partial }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      ...getDefaultFilters(),
      limit: getSavedLimit(),
    });
  }, []);

  const defaults = getDefaultFilters();
  const hasActiveFilters = (
    filters.search         !== defaults.search         ||
    filters.stateCode      !== defaults.stateCode      ||
    filters.entityId       !== defaults.entityId       ||
    filters.active         !== defaults.active         ||
    filters.bsoId          !== defaults.bsoId          ||
    filters.companyGroupId !== defaults.companyGroupId ||
    filters.periodType     !== defaults.periodType     ||
    filters.year           !== defaults.year           ||
    filters.month          !== defaults.month          ||
    filters.startDate      !== defaults.startDate      ||
    filters.endDate        !== defaults.endDate
  );

  return { filters, setFilter, resetFilters, hasActiveFilters };
};