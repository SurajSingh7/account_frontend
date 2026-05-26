import React, { useMemo } from 'react';

// Maps API key → display label + stable color scheme
const ORDER_TYPES = [
  { key: 'NEW-ORDER', label: 'New Order',  colors: 'border-blue-500   text-blue-700   bg-blue-600'   },
  { key: 'UPGRADE',   label: 'Upgrade',    colors: 'border-green-600  text-green-700  bg-green-600'  },
  { key: 'DOWNGRADE', label: 'Downgrade',  colors: 'border-orange-500 text-orange-700 bg-orange-500' },
  { key: 'SHIFT',     label: 'Shift',      colors: 'border-red-500    text-red-700    bg-red-500'    },
];

const Chip = React.memo(({ label, count, borderColor, textColor, activeColor, isActive, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 font-bold text-sm
      transition-all duration-200 select-none whitespace-nowrap active:scale-95
      ${isActive
        ? `${activeColor} text-white shadow-md scale-[1.03]`
        : `bg-white ${borderColor} ${textColor} hover:shadow-sm`
      }
    `}
  >
    {label} <span className="opacity-75">({count ?? 0})</span>
  </button>
));
Chip.displayName = 'OrderTypeChip';

/**
 * Props:
 *   summary    — { "NEW-ORDER": 9, "UPGRADE": 4, "DOWNGRADE": 1, "SHIFT": 0 }
 *   totalCount — used for "All" chip
 *   selected   — current orderType value ('' = All)
 *   onChange   — (orderType: string) => void  [sends NAME, not ID]
 */
const OrderTypeChips = ({ summary = {}, totalCount = 0, selected = '', onChange }) => {
  const getCount = (val) => (typeof val === 'object' ? val?.count : val) ?? 0;

  const allCount = useMemo(
    () => Object.values(summary).reduce((s, n) => s + getCount(n), 0) || totalCount,
    [summary, totalCount],
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Chip
        label="All"
        count={allCount}
        borderColor="border-gray-500"
        textColor="text-gray-700"
        activeColor="bg-gray-600"
        isActive={selected === ''}
        onClick={() => onChange('')}
      />
      {ORDER_TYPES.map(({ key, label, colors }) => {
        const [border, text, active] = colors.split(/\s+/);
        return (
          <Chip
            key={key}
            label={label}
            count={getCount(summary[key])}
            borderColor={border}
            textColor={text}
            activeColor={active}
            isActive={selected === key}
            onClick={() => onChange(selected === key ? '' : key)}
          />
        );
      })}
    </div>
  );
};

export default React.memo(OrderTypeChips);