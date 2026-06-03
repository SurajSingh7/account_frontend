/**
 * FilterBar.jsx
 *
 * Renders only the fields in `fields` prop, in that order.
 *
 * Period keys work independently:
 *   'period'      → year + month picker tab
 *   'dateRange'   → date range tab
 *   'monthRange'  → month range tab
 *
 * Pass any combination. The tabs shown in PeriodSelector are
 * derived automatically from whichever period keys are present.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Search, Filter, X } from 'lucide-react';

import SearchableDropdown  from './SearchableDropdown';
import PeriodSelector      from './period/PeriodSelector';
import OrderTypeSelect     from './dropdowns/OrderTypeSelect';
import ProductSelect       from './dropdowns/ProductSelect';
import EntitySelect        from './dropdowns/EntitySelect';

import { useStates, useBsos, useCompanies } from '../helpers/hooks/useFilterOptions';
import { ALL_FIELDS }                        from './filterFieldRegistry';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const truncateLabel = (str, n) =>
  !str ? '' : str.length > n ? str.slice(0, n) + '…' : str;

// Keys that belong in the flex-wrap inline row
const INLINE_FIELD_KEYS = new Set([
  'search', 'stateCode', 'orderType', 'productId',
  'entityId', 'active', 'bsoId', 'companyGroupId',
]);

// All 3 period-mode keys — when any are present they merge into one PeriodSelector
const PERIOD_KEYS = new Set(['period', 'dateRange', 'monthRange']);

// ─── Inline field renderers ───────────────────────────────────────────────────
const FIELD_RENDERERS = {

  search: (ctx) => (
    <div key="search" className="flex items-center gap-2 flex-1 min-w-[200px] border border-gray-300 rounded-lg px-4 py-3 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
      <Search className="w-5 h-5 text-gray-400 shrink-0" />
      <input
        type="text"
        placeholder="Search order / circuit ID..."
        value={ctx.filters.search}
        onChange={e => ctx.onChange({ search: e.target.value, page: 1 })}
        className="bg-transparent outline-none text-base font-semibold w-full text-gray-700 placeholder-gray-400"
      />
      {ctx.filters.search && (
        <button onClick={() => ctx.onChange({ search: '', page: 1 })}>
          <X className="w-4 h-4 text-gray-400" />
        </button>
      )}
    </div>
  ),

  stateCode: (ctx) => (
    <div key="stateCode" className="flex items-center gap-2 flex-1 min-w-[200px] border border-gray-300 rounded-lg px-4 py-3 bg-white">
      <Filter className="w-5 h-5 text-gray-400 shrink-0" />
      <select
        className="bg-transparent outline-none text-base font-semibold w-full text-gray-700"
        value={ctx.filters.stateCode}
        onChange={e => ctx.onChange({ stateCode: e.target.value, page: 1 })}
      >
        <option value="">Filter by State</option>
        {ctx.states.map(s => <option key={s.key} value={s.code}>{s.name}</option>)}
      </select>
    </div>
  ),

  orderType: (ctx) => (
    <div key="orderType" className="flex-1 min-w-[200px]">
      <OrderTypeSelect
        summary={ctx.apiSummary.orderType ?? {}}
        totalCount={ctx.totalCount}
        selected={ctx.filters.orderType}
        onChange={ctx.handleOrderType}
      />
    </div>
  ),

  productId: (ctx) => (
    <div key="productId" className="flex-1 min-w-[200px]">
      <ProductSelect
        summary={ctx.apiSummary.productCode ?? {}}
        selected={ctx.filters.productId}
        onChange={ctx.handleProductId}
      />
    </div>
  ),

  entityId: (ctx) => (
    <div key="entityId" className="flex-1 min-w-[200px]">
      <EntitySelect
        summary={ctx.apiSummary.entity ?? {}}
        selected={ctx.filters.entityId}
        onChange={ctx.handleEntityId}
      />
    </div>
  ),

  active: (ctx) => (
    <div key="active" className="flex items-center gap-2 flex-1 min-w-[200px] border border-gray-300 rounded-lg px-4 py-3 bg-white">
      <Filter className="w-5 h-5 text-gray-400 shrink-0" />
      <select
        className="bg-transparent outline-none text-base font-semibold w-full text-gray-700"
        value={ctx.filters.active}
        onChange={e => ctx.onChange({ active: e.target.value, page: 1 })}
      >
        <option value="">ALL</option>
        <option value="true">Active</option>
        <option value="false">Inactive</option>
      </select>
    </div>
  ),

  bsoId: (ctx) => (
    <div key="bsoId" className="flex-1 min-w-[200px]">
      <SearchableDropdown
        options={ctx.bsoOptions}
        value={ctx.filters.bsoId}
        onChange={v => ctx.onChange({ bsoId: v, page: 1 })}
        placeholder="Filter by BSO"
        loading={ctx.bsosLoading}
      />
    </div>
  ),

  companyGroupId: (ctx) => (
    <div key="companyGroupId" className="flex-1 min-w-[200px]">
      <SearchableDropdown
        options={ctx.companyOptions}
        value={ctx.filters.companyGroupId}
        onChange={v => ctx.onChange({ companyGroupId: v, page: 1 })}
        placeholder="Filter by Company"
        onSearch={ctx.setCompanySearch}
        loading={ctx.companiesLoading}
      />
    </div>
  ),
};

// ─── FilterBar ────────────────────────────────────────────────────────────────
const FilterBar = ({
  filters,
  onChange,
  onClear,
  hasActive,
  apiSummary = {},
  totalCount = 0,
  fields = ALL_FIELDS,
}) => {
  // Hooks — always called unconditionally
  const { states }                               = useStates();
  const { bsos, loading: bsosLoading }           = useBsos();
  const [companySearch, setCompanySearch]         = useState('');
  const { companies, loading: companiesLoading }  = useCompanies(companySearch);

  const handleOrderType = useCallback((orderType) => onChange({ orderType, page: 1 }), [onChange]);
  const handleProductId = useCallback((productId) => onChange({ productId, page: 1 }), [onChange]);
  const handleEntityId  = useCallback((entityId)  => onChange({ entityId,  page: 1 }), [onChange]);

  const bsoOptions = useMemo(
    () => bsos.map(b => ({ value: b._id, label: b.name, sublabel: b.completeCompanyName })),
    [bsos],
  );
  const companyOptions = useMemo(
    () => companies.map(c => ({
      value: c?._id,
      label: truncateLabel(c.companyName, 15),
      sublabel: c.panNumber,
    })),
    [companies],
  );

  const ctx = {
    filters, onChange, apiSummary, totalCount,
    states,
    bsoOptions, bsosLoading,
    companyOptions, companiesLoading, setCompanySearch,
    handleOrderType, handleProductId, handleEntityId,
  };

  // ── Separate inline fields from period keys ──────────────────────────────────
  const inlineKeys = fields.filter(k => INLINE_FIELD_KEYS.has(k));

  // Collect whichever period modes were requested, preserving order
  const allowedPeriodTabs = fields.filter(k => PERIOD_KEYS.has(k));
  const hasPeriodSection  = allowedPeriodTabs.length > 0;

  return (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 space-y-4">

      {/* ── Inline row ──────────────────────────────────────────────────── */}
      {inlineKeys.length > 0 && (
        <div className="flex flex-wrap gap-4 items-center">
          {inlineKeys.map(key => {
            const render = FIELD_RENDERERS[key];
            return render ? render(ctx) : null;
          })}

          {hasActive && (
            <button
              onClick={onClear}
              className="flex items-center gap-2 px-4 py-3 bg-red-50 border-2 border-red-500 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-all shadow-sm"
            >
              <X className="w-5 h-5" /> Clear Filter
            </button>
          )}
        </div>
      )}

      {/* ── Period section — rendered once, tabs driven by allowedPeriodTabs ── */}
      {hasPeriodSection && (
        <div className="border-t border-gray-200 pt-4">
          <PeriodSelector
            filters={filters}
            onChange={p => onChange({ ...p, page: 1 })}
            allowedTabs={allowedPeriodTabs}   // ← only these tabs are shown
          />
        </div>
      )}

    </div>
  );
};

export default React.memo(FilterBar);