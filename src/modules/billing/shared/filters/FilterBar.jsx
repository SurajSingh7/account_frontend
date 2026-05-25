import React, { useState, useCallback } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import SearchableDropdown from './SearchableDropdown';
import PeriodSelector from './period/PeriodSelector';
import OrderTypeSelect from './dropdowns/OrderTypeSelect';
import ProductSelect from './dropdowns/ProductSelect';
import EntitySelect from './dropdowns/EntitySelect';

// ── Chip imports (commented — restore if switching back to chip UI) ──────────
import OrderTypeChips from './chips/OrderTypeChips';
import ProductChips from './chips/ProductChips';
import EntityChips from './chips/EntityChips';

import { useStates, useBsos, useCompanies } from '../helpers/hooks/useFilterOptions';

const truncateLabel = (str, n) => (!str ? '' : str.length > n ? str.slice(0, n) + '…' : str);

/**
 * FilterBar
 *
 * Props:
 *   filters       — full filter state
 *   onChange      — setFilter partial updater
 *   onClear       — resetFilters
 *   hasActive     — boolean: show Clear button
 *   apiSummary    — { orderType: {}, productCode: {}, entity: {} }  from list API response
 *   totalCount    — total records (used for "All" count in OrderTypeSelect)
 *
 * ── UI Mode note ─────────────────────────────────────────────────────────────
 * Currently using DROPDOWN mode for orderType / product / entity filters.
 * To switch back to CHIP (radio-pill) mode:
 *   1. Uncomment the chip imports above
 *   2. Comment out <OrderTypeSelect>, <ProductSelect>, <EntitySelect> in Row 1
 *   3. Uncomment Row 2 (Order Type Chips), Row 3 (Product Chips), Row 4 (Entity Chips) below
 *   4. For EntityChips you also need to pass `entities` prop from parent (useEntities hook)
 * ─────────────────────────────────────────────────────────────────────────────
 */
const FilterBar = ({
  filters,
  onChange,
  onClear,
  hasActive,
  apiSummary = {},
  totalCount = 0,
  // entities,   // ← uncomment when switching back to chip mode (pass from PcdClosureComp)
}) => {
  const { states }                               = useStates();
  const { bsos,     loading: bsosLoading     }   = useBsos();
  const [companySearch, setCompanySearch]         = useState('');
  const { companies, loading: companiesLoading }  = useCompanies(companySearch);

  const bsoOptions = bsos.map(b => ({
    value: b._id, label: b.name, sublabel: b.completeCompanyName,
  }));
  const companyOptions = companies.map(c => ({
    value: c?._id,
    label: truncateLabel(c.companyName, 15),
    sublabel: c.panNumber,
  }));

  // Stable handler refs — prevent unnecessary child re-renders
  const handleOrderType = useCallback(
    (orderType) => onChange({ orderType, page: 1 }), [onChange],
  );
  const handleProductId = useCallback(
    (productId) => onChange({ productId, page: 1 }), [onChange],
  );
  const handleEntityId = useCallback(
    (entityId) => onChange({ entityId, page: 1 }), [onChange],
  );

  return (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 space-y-4">

      {/* ── Row 1: all filter controls ──────────────────────────────────────── */}
      <div className="flex flex-wrap gap-4 items-center">

        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-[200px] border border-gray-300 rounded-lg px-4 py-3 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search order / circuit ID..."
            value={filters.search}
            onChange={e => onChange({ search: e.target.value, page: 1 })}
            className="bg-transparent outline-none text-base font-semibold w-full text-gray-700 placeholder-gray-400"
          />
          {filters.search && (
            <button onClick={() => onChange({ search: '', page: 1 })}>
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Filter by State */}
        <div className="flex items-center gap-2 flex-1 min-w-[200px] border border-gray-300 rounded-lg px-4 py-3 bg-white">
          <Filter className="w-5 h-5 text-gray-400 shrink-0" />
          <select
            className="bg-transparent outline-none text-base font-semibold w-full text-gray-700"
            value={filters.stateCode}
            onChange={e => onChange({ stateCode: e.target.value, page: 1 })}
          >
            <option value="">Filter by State</option>
            {states.map(s => <option key={s.key} value={s.code}>{s.name}</option>)}
          </select>
        </div>

        {/*
          ── DROPDOWN MODE (current) ───────────────────────────────────────────
          OrderType / Product / Entity as native <select> with count in options.
          To switch to CHIP mode: comment these 3 out, uncomment chip rows below.
        */}
        <OrderTypeSelect
          summary={apiSummary.orderType ?? {}}
          totalCount={totalCount}
          selected={filters.orderType}
          onChange={handleOrderType}
        />

        <ProductSelect
          summary={apiSummary.productCode ?? {}}
          selected={filters.productId}
          onChange={handleProductId}
        />

        <EntitySelect
          summary={apiSummary.entity ?? {}}
          selected={filters.entityId}
          onChange={handleEntityId}
        />

        {/* Active / Inactive */}
        <div className="flex items-center gap-2 flex-1 min-w-[200px] border border-gray-300 rounded-lg px-4 py-3 bg-white">
          <Filter className="w-5 h-5 text-gray-400 shrink-0" />
          <select
            className="bg-transparent outline-none text-base font-semibold w-full text-gray-700"
            value={filters.active}
            onChange={e => onChange({ active: e.target.value, page: 1 })}
          >
            <option value="true">Active (PCD)</option>
            <option value="false">Inactive (Terminate)</option>
          </select>
        </div>

        {/* Filter by BSO */}
        <div className="flex-1 min-w-[200px]">
          <SearchableDropdown
            options={bsoOptions}
            value={filters.bsoId}
            onChange={v => onChange({ bsoId: v, page: 1 })}
            placeholder="Filter by BSO"
            loading={bsosLoading}
          />
        </div>

        {/* Filter by Company */}
        <div className="flex-1 min-w-[200px]">
          <SearchableDropdown
            options={companyOptions}
            value={filters.companyGroupId}
            onChange={v => onChange({ companyGroupId: v, page: 1 })}
            placeholder="Filter by Company"
            onSearch={setCompanySearch}
            loading={companiesLoading}
          />
        </div>

        {/* Clear Filter */}
        {hasActive && (
          <button
            onClick={onClear}
            className="flex items-center gap-2 px-4 py-3 bg-red-50 border-2 border-red-500 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-all shadow-sm"
          >
            <X className="w-5 h-5" /> Clear Filter
          </button>
        )}
      </div>

      
        ── CHIP MODE rows (Row 2–4) — currently disabled ─────────────────────
        Uncomment all 3 blocks below + swap Row 1 dropdowns to re-enable chip UI.

        Row 2 — Order Type Chips
        <div className="border-t border-gray-100 pt-3">
          <OrderTypeChips
            summary={apiSummary.orderType ?? {}}
            totalCount={totalCount}
            selected={filters.orderType}
            onChange={handleOrderType}
          />
        </div>

        Row 3 — Product Chips
        <div className="border-t border-gray-100 pt-3">
          <ProductChips
            summary={apiSummary.productCode ?? {}}
            selected={filters.productId}
            onChange={handleProductId}
          />
        </div>

        Row 4 — Entity Chips
        <div className="border-t border-gray-100 pt-3">
          <EntityChips
            summary={apiSummary.entity ?? {}}
            selected={filters.entityId}
            onChange={handleEntityId}
          />
        </div>
      


      {/* ── Row 5 (currently Row 2): Period / Date Range / Month Range ──────── */}
      <div className="border-t border-gray-200 pt-4">
        <PeriodSelector
          filters={filters}
          onChange={p => onChange({ ...p, page: 1 })}
        />
      </div>

    </div>
  );
};

export default React.memo(FilterBar);