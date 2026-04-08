import React from 'react';
import { ALL_MONTHS, getYearOptions, getAvailableMonths, getCurrentYear, getCurrentMonth } from '../../constants';
import { toStartOfDayISO,toEndOfDayISO } from '../../buildListParams/utils';


/**
 * PeriodSelector — exact original visual:
 * teal underline tabs, rounded-xl month pills, gradient active, shadow-sm wrappers
 */
const PeriodSelector = ({ filters, onChange }) => {
  const { periodType, year, month, _startRaw, _endRaw } = filters;
  const availableMonths = year !== 'All' ? getAvailableMonths(parseInt(year)) : [];

  const handleYearChange = (y) => {
    if (y === 'All') {
      onChange({ year: 'All', month: '' });
    } else {
      const yr = parseInt(y);
      const defaultMonth = yr === getCurrentYear() ? getCurrentMonth() + 1 : 12;
      onChange({ year: yr, month: defaultMonth });
    }
  };

  const handleDateChange = (key, val) => {
    if (key === 'startDate') onChange({ startDate: toStartOfDayISO(val), _startRaw: val });
    if (key === 'endDate')   onChange({ endDate:   toEndOfDayISO(val),   _endRaw:   val });
  };

  return (
    <div className="space-y-4">
      {/* Tab bar — teal underline, exact original style */}
      <div className="flex gap-2 border-b border-gray-200">
        {[['period', 'Period Selector'], ['dateRange', 'Date Range']].map(([type, label]) => (
          <button
            key={type}
            type="button"
            onClick={() => onChange({ periodType: type })}
            className={`px-5 py-2.5 font-semibold text-sm transition-all border-b-2 ${
              periodType === type
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Period Selector */}
      {periodType === 'period' && (
        <div className="flex flex-wrap items-center gap-6">
          {/* Year */}
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

          {/* Month pills */}
          {year !== 'All' && (
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 shadow-sm flex-1 min-w-[420px]">
              <label className="text-sm font-semibold text-gray-600 whitespace-nowrap">Month</label>
              <div className="flex gap-2 flex-wrap justify-center">
                {/* All */}
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

                {ALL_MONTHS.map((label, i) => {
                  const m       = i + 1;
                  const enabled = availableMonths.includes(label);
                  const active  = month === m;
                  return (
                    <button
                      key={label}
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
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Date Range */}
      {periodType === 'dateRange' && (
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
    </div>
  );
};

export default PeriodSelector;