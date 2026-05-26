import React from 'react';

// Always render these codes; use API summary for count/id
const PRODUCT_CODES = ['ILL', 'GLL', 'DIA'];

const COLORS = {
  ILL: { border: 'border-purple-500', text: 'text-purple-700', active: 'bg-purple-500' },
  GLL: { border: 'border-orange-500', text: 'text-orange-700', active: 'bg-orange-500' },
  DIA: { border: 'border-teal-600',   text: 'text-teal-700',   active: 'bg-teal-600'   },
};

const Chip = React.memo(({ label, count, colors, isActive, disabled, onClick }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={`
      inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 font-bold text-sm
      transition-all duration-200 select-none whitespace-nowrap
      ${isActive
        ? `${colors.active} text-white shadow-md scale-[1.03]`
        : `bg-white ${colors.border} ${colors.text} hover:shadow-sm`
      }
      ${disabled ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'}
    `}
  >
    {label} <span className="opacity-75">({count ?? 0})</span>
  </button>
));
Chip.displayName = 'ProductChip';

/**
 * Props:
 *   summary  — { ILL: { count: 15, productId: "abc" }, GLL: { count: 4, productId: "xyz" }, ... }
 *   selected — current productId ('' = none)
 *   onChange — (productId: string) => void  [sends ID to API]
 */
const ProductChips = ({ summary = {}, selected = '', onChange }) => (
  <div className="flex flex-wrap items-center gap-2">
    <span className="text-sm font-semibold text-gray-600 mr-1">Product:</span>
    {PRODUCT_CODES.map((code) => {
      const meta     = summary[code] ?? {};
      const count    = meta.count ?? 0;
      const id       = meta.productId ?? meta.id ?? null;
      const isActive = !!id && selected === id;

      return (
        <Chip
          key={code}
          label={code}
          count={count}
          colors={COLORS[code] ?? { border: 'border-gray-400', text: 'text-gray-600', active: 'bg-gray-500' }}
          isActive={isActive}
          disabled={!id}
          onClick={() => id && onChange(isActive ? '' : id)}
        />
      );
    })}
  </div>
);

export default React.memo(ProductChips);
