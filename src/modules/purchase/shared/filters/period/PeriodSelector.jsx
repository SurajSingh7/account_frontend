/**
 * PeriodSelector.jsx
 *
 * Props:
 *   filters      — full filter state
 *   onChange     — partial updater
 *   allowedTabs  — string[]: subset of ['period','dateRange','monthRange']
 *                  Controls which tabs are rendered.
 *                  Default = all three (backward-compatible).
 */

import React, { useCallback, useEffect } from 'react';
import {
  ALL_MONTHS, getYearOptions, getAvailableMonths,
  getCurrentYear, getCurrentMonth,
} from '../../constants';
import { toStartOfDayISO, toEndOfDayISO } from '../../buildListParams/utils';
import MonthRangeSelector from './MonthRangeSelector';

// Master tab definitions — label lives here, not scattered across call sites
const TAB_META = {
  period:     { id: 'period',     label: 'Period Selector' },
  dateRange:  { id: 'dateRange',  label: 'Date Range'      },
  monthRange: { id: 'monthRange', label: 'Month Range'     },
};

const ALL_TABS = ['period', 'dateRange', 'monthRange'];

const PeriodSelector = ({
  filters,
  onChange,
  allowedTabs = ALL_TABS,   // default = all (backward-compatible)
}) => {
  const { periodType, year, month, _startRaw, _endRaw, fromMonth, toMonth } = filters;

  // If current periodType is no longer in allowedTabs, auto-reset to first allowed tab
  useEffect(() => {
    if (!allowedTabs.includes(periodType)) {
      onChange({ periodType: allowedTabs[0] });
    }
  }, [allowedTabs]); // eslint-disable-line react-hooks/exhaustive-deps

  const availableMonths = year !== 'All' ? getAvailableMonths(parseInt(year)) : [];

  const handleYearChange = useCallback((y) => {
    if (y === 'All') {
      onChange({ year: 'All', month: '' });
    } else {
      const yr = parseInt(y);
      const defaultMonth = yr === getCurrentYear() ? getCurrentMonth() + 1 : 12;
      onChange({ year: yr, month: defaultMonth });
    }
  }, [onChange]);

  const handleDateChange = useCallback((key, val) => {
    if (key === 'startDate') onChange({ startDate: toStartOfDayISO(val), _startRaw: val });
    if (key === 'endDate')   onChange({ endDate:   toEndOfDayISO(val),   _endRaw:   val });
  }, [onChange]);

  const handleMonthRange = useCallback((partial) => {
    onChange({ ...partial });
  }, [onChange]);

  // Only render the tabs that are allowed
  const visibleTabs = allowedTabs.map(id => TAB_META[id]).filter(Boolean);

  return (
    <div className="space-y-4">

      {/* Tab bar — hidden entirely if only 1 tab allowed */}
      {visibleTabs.length > 1 && (
        <div className="flex gap-2 border-b border-gray-200">
          {visibleTabs.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => onChange({ periodType: id })}
              className={`
                px-5 py-2.5 font-semibold text-sm transition-all border-b-2
                ${periodType === id
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* ── Period Selector ── */}
      {periodType === 'period' && allowedTabs.includes('period') && (
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
            <label className="text-sm font-semibold text-gray-600">Year</label>
            <select
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 bg-white"
              value={year}
              onChange={e => handleYearChange(e.target.value)}
            >
              {getYearOptions().map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          {year !== 'All' && (
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 shadow-sm flex-1 min-w-[420px]">
              <label className="text-sm font-semibold text-gray-600 whitespace-nowrap">Month</label>
              <div className="flex gap-2 flex-wrap justify-center">
                <button
                  type="button"
                  onClick={() => onChange({ month: '' })}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    !month
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md scale-105'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-teal-300'
                  }`}
                >
                  All
                </button>
                {ALL_MONTHS.map((lbl, i) => {
                  const m       = i + 1;
                  const enabled = availableMonths.includes(lbl);
                  const active  = month === m;
                  return (
                    <button
                      key={lbl}
                      type="button"
                      disabled={!enabled}
                      onClick={() => enabled && onChange({ month: m })}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                        active
                          ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md scale-105'
                          : enabled
                            ? 'bg-white text-gray-700 border border-gray-200 hover:border-teal-300'
                            : 'bg-gray-100 text-gray-300 border border-gray-200 cursor-not-allowed'
                      }`}
                    >
                      {lbl}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Date Range ── */}
      {periodType === 'dateRange' && allowedTabs.includes('dateRange') && (
        <div className="flex flex-wrap items-center gap-6">
          {[['From Date:', 'startDate', _startRaw || ''], ['To Date:', 'endDate', _endRaw || '']].map(([lbl, key, val]) => (
            <div key={key} className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
              <label className="text-sm font-semibold text-gray-600 whitespace-nowrap">{lbl}</label>
              <input
                type="date"
                value={val}
                onChange={e => handleDateChange(key, e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 bg-white"
              />
            </div>
          ))}
          {_startRaw && _endRaw && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-sm font-semibold text-blue-700">
                {new Date(_startRaw).toLocaleDateString('en-IN')} – {new Date(_endRaw).toLocaleDateString('en-IN')}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Month Range ── */}
      {periodType === 'monthRange' && allowedTabs.includes('monthRange') && (
        <MonthRangeSelector
          fromMonth={fromMonth}
          toMonth={toMonth}
          onChange={handleMonthRange}
        />
      )}

    </div>
  );
};

export default React.memo(PeriodSelector);