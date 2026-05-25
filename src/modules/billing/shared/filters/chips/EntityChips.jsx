import React from 'react';

// Always render these entity aliases; use API summary for count/id
const ENTITY_ALIASES = ['GTEL', 'WIBRO', 'GISPL'];

const COLORS = {
  GTEL:  { border: 'border-amber-500',  text: 'text-amber-700',  active: 'bg-amber-500'  },
  WIBRO: { border: 'border-cyan-600',   text: 'text-cyan-700',   active: 'bg-cyan-600'   },
  GISPL: { border: 'border-indigo-500', text: 'text-indigo-700', active: 'bg-indigo-500' },
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
Chip.displayName = 'EntityChip';

/**
 * Props:
 *   summary  — { GTEL: { count: 17, entityId: "abc" }, WIBRO: { count: 2, entityId: "xyz" }, ... }
 *   selected — current entityId ('' = none)
 *   onChange — (entityId: string) => void  [sends ID to API]
 */
const EntityChips = ({ summary = {}, selected = '', onChange }) => (
  <div className="flex flex-wrap items-center gap-2">
    {ENTITY_ALIASES.map((alias) => {
      const meta     = summary[alias] ?? {};
      const count    = meta.count ?? 0;
      const id       = meta.entityId ?? meta.id ?? null;
      const isActive = !!id && selected === id;

      return (
        <Chip
          key={alias}
          label={alias}
          count={count}
          colors={COLORS[alias] ?? { border: 'border-gray-400', text: 'text-gray-600', active: 'bg-gray-500' }}
          isActive={isActive}
          disabled={!id}
          onClick={() => id && onChange(isActive ? '' : id)}
        />
      );
    })}
  </div>
);

export default React.memo(EntityChips);
