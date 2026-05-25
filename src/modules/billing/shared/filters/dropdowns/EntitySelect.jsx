import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const ENTITY_ALIASES = [
  { alias: 'GTEL',  color: 'bg-amber-500'  },
  { alias: 'WIBRO', color: 'bg-cyan-600'   },
  // { alias: 'GISPL', color: 'bg-indigo-500' },
];

const DEFAULT_COLOR    = 'bg-slate-500';
const UNSELECTED_STYLE = 'bg-white text-gray-700 border-gray-300 hover:border-gray-400';

/**
 * Props:
 *   summary  — { GTEL: { count: 17, entityId: "abc" }, WIBRO: { count: 2, entityId: "xyz" }, ... }
 *   selected — current entityId ('' = none)
 *   onChange — (entityId: string) => void
 */
const EntitySelect = ({ summary = {}, selected = '', onChange }) => {
  const [open, setOpen] = useState(false);
  const ref             = useRef(null);

  const getId = (meta) => meta?.entityId ?? meta?.id ?? null;

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectedEntity = ENTITY_ALIASES.find(e => getId(summary[e.alias]) === selected && selected !== '');
  const triggerLabel   = selectedEntity ? selectedEntity.alias : 'Filter by Entity';
  const triggerColor   = selectedEntity ? selectedEntity.color : null;
  const triggerCount   = selectedEntity ? (summary[selectedEntity.alias]?.count ?? 0) : null;

  const handleSelect = (id) => {
    onChange(id);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative flex-1 min-w-[200px]">

      {/* ── Trigger ── */}
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className={`
          w-full flex items-center gap-2 px-4 py-3 rounded-lg border-2
          font-semibold text-base transition-all duration-200
          ${selectedEntity
            ? `${triggerColor} text-white border-transparent`
            : `${UNSELECTED_STYLE}`
          }
          ${open ? 'ring-2 ring-offset-1 ring-gray-300' : ''}
        `}
      >
        <span className="flex-1 text-left">{triggerLabel}</span>
        {triggerCount !== null && (
          <span className="bg-white/25 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[26px] text-center">
            {triggerCount}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200
          ${selectedEntity ? 'text-white' : 'text-gray-400'}
          ${open ? 'rotate-180' : ''}
        `} />
      </button>

      {/* ── Dropdown panel ── */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">

          <button
            type="button"
            onClick={() => handleSelect('')}
            className={`
              w-full text-left px-4 py-2.5 text-sm font-semibold
              transition-colors duration-150
              ${!selected
                ? `${DEFAULT_COLOR} text-white`
                : 'text-gray-500 hover:bg-gray-50'
              }
            `}
          >
            All Entities
          </button>

          {ENTITY_ALIASES.map(({ alias, color }) => {
            const meta     = summary[alias] ?? {};
            const id       = getId(meta);
            const isActive = !!id && selected === id;

            return (
              <button
                key={alias}
                type="button"
                onClick={() => handleSelect(isActive ? '' : (id ?? ''))}
                className={`
                  w-full text-left px-4 py-2.5 text-sm font-semibold
                  transition-colors duration-150
                  ${isActive
                    ? `${color} text-white`
                    : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                {alias}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default React.memo(EntitySelect);
