import React, { useCallback } from 'react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
// input[type=month] gives "YYYY-MM", API wants "MM-YYYY"
const toApiFormat = (htmlMonthValue) => {
  if (!htmlMonthValue) return '';
  const [yyyy, mm] = htmlMonthValue.split('-');
  return `${mm}-${yyyy}`;
};

// Convert "MM-YYYY" back to "YYYY-MM" for input[type=month] value
const toInputFormat = (apiValue) => {
  if (!apiValue) return '';
  const [mm, yyyy] = apiValue.split('-');
  return `${yyyy}-${mm}`;
};

/**
 * Props:
 *   fromMonth — current value in MM-YYYY format (stored in filters)
 *   toMonth   — current value in MM-YYYY format
 *   onChange  — ({ fromMonth?, toMonth? }) => void
 */
const MonthRangeSelector = ({ fromMonth = '', toMonth = '', onChange }) => {
  const handleFrom = useCallback(
    (e) => onChange({ fromMonth: toApiFormat(e.target.value) }),
    [onChange],
  );
  const handleTo = useCallback(
    (e) => onChange({ toMonth: toApiFormat(e.target.value) }),
    [onChange],
  );

  const fromDisplay = fromMonth ? fromMonth.replace('-', '/') : null;
  const toDisplay   = toMonth   ? toMonth.replace('-', '/')   : null;

  return (
    <div className="flex flex-wrap items-center gap-6">
      {/* From Month */}
      <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
        <label className="text-sm font-semibold text-gray-600 whitespace-nowrap">From Month</label>
        <input
          type="month"
          value={toInputFormat(fromMonth)}
          onChange={handleFrom}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 bg-white"
        />
      </div>

      {/* To Month */}
      <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
        <label className="text-sm font-semibold text-gray-600 whitespace-nowrap">To Month</label>
        <input
          type="month"
          value={toInputFormat(toMonth)}
          onChange={handleTo}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 bg-white"
        />
      </div>

      {/* Preview badge */}
      {fromMonth && toMonth && (
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-sm font-semibold text-blue-700">
            {fromDisplay} → {toDisplay}
          </span>
        </div>
      )}
    </div>
  );
};

export default React.memo(MonthRangeSelector);