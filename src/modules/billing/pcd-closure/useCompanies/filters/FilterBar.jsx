import React, { useState } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import SearchableDropdown from './SearchableDropdown';
import PeriodSelector from './PeriodSelector';
import {useStates, useEntities, useBsos, useCompanies } from '../../helpers/hooks/useFilterOptions';


const truncateLabel = (str, n) => (!str ? '' : str.length > n ? str.slice(0, n) + '…' : str);

/**
 * FilterBar — sizing matches the original component exactly:
 * px-4 py-3 inputs, text-base font-semibold, gap-4, min-w-[200px]
 */
const FilterBar = ({ filters, onChange, onClear, hasActive }) => {
  const { states,   loading: statesLoading   } = useStates();
  const { entities, loading: entitiesLoading } = useEntities();
  const { bsos,     loading: bsosLoading     } = useBsos();

  // Need search from api if like 50+ 
  const [companySearch, setCompanySearch] = useState('');
  const { companies, loading: companiesLoading } = useCompanies(companySearch);

  const stateOptions = states.map(s => ({ value: s.code, label: s.name }));
  
  const entityOptions = entities.map(e => ({
    value: e._id,
    label: e.alias || e.name,
    sublabel: e.name !== (e.alias || e.name) ? e.name : undefined,
  }));

  const bsoOptions = bsos.map(b => ({ value: b._id, label: b.name, sublabel: b.completeCompanyName }));
  const companyOptions = companies.map(c => ({
    value: c.panNumber,
    label: truncateLabel(c.companyName, 15),
    sublabel: c.panNumber,
  }));

  return (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 space-y-4">
      {/* ── Row 1: filter controls ── */}
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

        {/* Filter by Entity */}
        <div className={`flex items-center gap-2 flex-1 min-w-[200px] border rounded-lg px-4 py-3 transition-all ${
          filters.entityId
            ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-400 ring-2 ring-orange-200'
            : 'bg-white border-gray-300'
        }`}>
          <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
          <select
            className="bg-transparent outline-none text-base font-semibold w-full text-gray-700"
            value={filters.entityId}
            onChange={e => onChange({ entityId: e.target.value, page: 1 })}
          >
            <option value="">Filter by Entity</option>
            {entities.map(e => <option key={e._id} value={e._id}>{e.alias || e.name}</option>)}
          </select>
        </div>

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
            value={filters.panNumber}
            onChange={v => onChange({ panNumber: v, page: 1 })}
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

      {/* ── Row 2: Period / Date Range ── */}
      <div className="border-t border-gray-200 pt-4">
        <PeriodSelector filters={filters} onChange={p => onChange({ ...p, page: 1 })} />
      </div>
    </div>
  );
};

export default FilterBar;