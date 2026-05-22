import { useState, useCallback } from 'react';
import { getDefaultFilters, getCurrentYear, getCurrentMonth } from '../../constants';

// ─── useFilters ───────────────────────────────────────────────────────────────
// Centralised filter state management.
// Returns: { filters, setFilter, resetFilters, hasActiveFilters }
export const useFilters = () => {
  const [filters, setFilters] = useState(getDefaultFilters);

  // Merge partial update (also handles page resets)
  const setFilter = useCallback((partial) => {
    setFilters(prev => ({ ...prev, ...partial }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(getDefaultFilters());
  }, []);

  // Determine if any filter deviates from defaults (excluding page/limit)
  const defaults = getDefaultFilters();
  const hasActiveFilters = (
    filters.search    !== defaults.search    ||
    filters.stateCode !== defaults.stateCode ||
    filters.entityId  !== defaults.entityId  ||
    filters.active    !== defaults.active    ||
    filters.bsoId     !== defaults.bsoId     ||
    filters.companyGroupId !== defaults.companyGroupId ||
    filters.periodType !== defaults.periodType ||
    filters.year      !== defaults.year      ||
    filters.month     !== defaults.month     ||
    filters.startDate !== defaults.startDate ||
    filters.endDate   !== defaults.endDate
  );

  return { filters, setFilter, resetFilters, hasActiveFilters };
};