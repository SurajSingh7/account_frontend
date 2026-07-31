import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';

const ORDER_TYPES = [
  { key: 'NEW-ORDER', label: 'New Order', color: 'bg-blue-500'   },
  { key: 'UPGRADE',   label: 'Upgrade',   color: 'bg-green-500'  },
  { key: 'DOWNGRADE', label: 'Downgrade', color: 'bg-orange-500' },
  { key: 'SHIFT',     label: 'Shift',     color: 'bg-red-500'    },
];

const ALL_COLOR = 'bg-slate-500';

const OrderTypeSelect = ({ summary = {}, totalCount = 0, selected = '', onChange }) => {
  const [open, setOpen] = useState(false);
  const ref             = useRef(null);

  const getCount = (val) => (typeof val === 'object' ? val?.count : val) ?? 0;

  const allCount = useMemo(
    () => Object.values(summary).reduce((s, n) => s + getCount(n), 0) || totalCount,
    [summary, totalCount],
  );

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectedMeta  = ORDER_TYPES.find(o => o.key === selected);
  const triggerLabel  = selectedMeta ? selectedMeta.label : 'All Order';
  const triggerColor  = selectedMeta ? selectedMeta.color : ALL_COLOR;
  const triggerCount  = selectedMeta ? getCount(summary[selected]) : allCount;

  const handleSelect = (key) => {
    onChange(key);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative flex-1 min-w-[200px]">

      {/* ── Trigger — always coloured, always shows count ── */}
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className={`
          w-full flex items-center gap-2 px-4 py-3 rounded-lg
          font-semibold text-base text-white border-2 border-transparent
          transition-all duration-200
          ${triggerColor}
          ${open ? 'ring-2 ring-offset-1 ring-gray-400' : ''}
        `}
      >
        <span className="flex-1 text-left">{triggerLabel}</span>
        <span className="bg-white/25 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[26px] text-center">
          {triggerCount}
        </span>
        <ChevronDown className={`w-4 h-4 text-white shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* ── Dropdown panel — NO count badges in rows ── */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">

          {/* All option */}
          <button
            type="button"
            onClick={() => handleSelect('')}
            className={`
              w-full text-left px-4 py-2.5 text-sm font-semibold
              transition-colors duration-150
              ${selected === ''
                ? `${ALL_COLOR} text-white`
                : 'text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            All Order 
          </button>

          {ORDER_TYPES.map(({ key, label, color }) => (
            <button
              key={key}
              type="button"
              onClick={() => handleSelect(key)}
              className={`
                w-full text-left px-4 py-2.5 text-sm font-semibold
                transition-colors duration-150
                ${selected === key
                  ? `${color} text-white`
                  : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(OrderTypeSelect);