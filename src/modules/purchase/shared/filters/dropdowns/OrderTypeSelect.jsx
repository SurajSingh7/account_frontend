import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   Palette rules (same system as ProductSelect)
   ─────────────────────────────────────────────────────────────
   surface : tinted background + matching border + dark text
             (dark text on 50-tint ≈ 12:1 contrast — very easy to read)
   soft    : active row background in the dropdown
   pill    : the count badge — solid, saturated, high contrast.
             All colours use 600–700 with white text (≥5:1).
   dot     : saturated marker for quick colour recognition

   FUTURE COLORS IF REQUIRED :
    Add a new order type with a pale color (yellow, lime, cyan-300), 
    keep the pill at 600–700 or switch to dark text on a light pill 
    — never white text on a light fill.
   ───────────────────────────────────────────────────────────── */
const ORDER_TYPES = [
  {
    key: 'NEW-ORDER',
    label: 'New Order',
    dot: 'bg-blue-500',
    surface: 'bg-blue-50 border-blue-300 text-blue-900',
    soft: 'bg-blue-100 text-blue-900',
    pill: 'bg-blue-600 text-white',
  },
  {
    key: 'UPGRADE',
    label: 'Upgrade',
    dot: 'bg-emerald-500',
    surface: 'bg-emerald-50 border-emerald-300 text-emerald-900',
    soft: 'bg-emerald-100 text-emerald-900',
    pill: 'bg-emerald-700 text-white',
  },
  {
    key: 'DOWNGRADE',
    label: 'Downgrade',
    dot: 'bg-orange-500',
    surface: 'bg-orange-50 border-orange-300 text-orange-900',
    soft: 'bg-orange-100 text-orange-900',
    pill: 'bg-orange-700 text-white',
  },
  {
    key: 'SHIFT',
    label: 'Shift',
    dot: 'bg-red-500',
    surface: 'bg-red-50 border-red-300 text-red-900',
    soft: 'bg-red-100 text-red-900',
    pill: 'bg-red-700 text-white',
  },
  {
    key: 'TERMINATION',
    label: 'Termination',
    dot: 'bg-indigo-500',
    surface: 'bg-indigo-50 border-indigo-300 text-indigo-900',
    soft: 'bg-indigo-100 text-indigo-900',
    pill: 'bg-indigo-700 text-white',
  },
];

/* Slate tokens for the "All Order" state */
const ALL = {
  dot: 'bg-slate-400',
  surface: 'bg-slate-50 border-slate-300 text-slate-900',
  soft: 'bg-slate-100 text-slate-900',
  pill: 'bg-slate-700 text-white',
};

const OrderTypeSelect = ({ summary = {}, totalCount = 0, selected = '', onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const getCount = (val) => (typeof val === 'object' ? val?.count : val) ?? 0;

  /* Resolve every order type once: key + count */
  const items = useMemo(
    () =>
      ORDER_TYPES.map((o) => ({
        ...o,
        count: getCount(summary[o.key]),
      })),
    [summary],
  );

  const allCount = useMemo(
    () => items.reduce((s, i) => s + i.count, 0) || totalCount,
    [items, totalCount],
  );

  const selectedItem = items.find((i) => i.key === selected) ?? null;

  /* Close on outside click / Escape */
  useEffect(() => {
    const onMouseDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const handleSelect = (key) => {
    onChange(key);
    setOpen(false);
  };

  const triggerTokens = selectedItem ?? ALL;

  return (
    <div ref={ref} className="relative flex-1 min-w-[200px]">
      {/* ── Trigger ─────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`
          w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2
          text-base font-semibold text-left transition-all duration-200
          focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
          focus-visible:ring-slate-400
          ${triggerTokens.surface}
          ${open ? 'ring-2 ring-offset-1 ring-slate-300' : ''}
        `}
      >
        {/* Colour marker */}
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${triggerTokens.dot}`} />

        <span className="flex-1 truncate">
          {selectedItem ? selectedItem.label : 'All Order'}
        </span>

        {/* Count badge — solid, bold, tabular so 25 vs 26 is instantly readable */}
        <span
          className={`
            shrink-0 min-w-[32px] rounded-full px-2.5 py-0.5
            text-center text-sm font-bold tabular-nums shadow-sm
            ${triggerTokens.pill}
          `}
        >
          {selectedItem ? selectedItem.count : allCount}
        </span>

        <ChevronDown
          className={`
            h-4 w-4 shrink-0 opacity-60 transition-transform duration-200
            ${open ? 'rotate-180' : ''}
          `}
        />
      </button>

      {/* ── Dropdown ────────────────────────────────────────── */}
      {open && (
        <div
          role="listbox"
          className="
            absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200
            bg-white py-1 shadow-lg shadow-slate-900/10
          "
        >
          {/* All option */}
          <button
            type="button"
            role="option"
            aria-selected={!selected}
            onClick={() => handleSelect('')}
            className={`
              flex w-full items-center gap-3 px-3 py-2.5 text-sm font-semibold
              transition-colors duration-150
              ${!selected ? ALL.soft : 'text-slate-700 hover:bg-slate-50'}
            `}
          >
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${ALL.dot}`} />
            <span className="flex-1 text-left">All Order</span>
            <span
              className={`
                min-w-[32px] rounded-full px-2.5 py-0.5 text-center
                text-sm font-bold tabular-nums
                ${!selected ? ALL.pill : 'bg-slate-100 text-slate-600'}
              `}
            >
              {allCount}
            </span>
            <span className="flex w-4 shrink-0 justify-center">
              {!selected && <Check className="h-4 w-4" strokeWidth={3} />}
            </span>
          </button>

          <div className="my-1 h-px bg-slate-100" />

          {/* One row per order type */}
          {items.map((item) => {
            const isActive = selected === item.key;

            return (
              <button
                key={item.key}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => handleSelect(item.key)}
                className={`
                  flex w-full items-center gap-3 px-3 py-2.5 text-sm font-semibold
                  transition-colors duration-150
                  ${isActive ? item.soft : 'text-slate-700 hover:bg-slate-50'}
                `}
              >
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.dot}`} />
                <span className="flex-1 text-left">{item.label}</span>

                <span
                  className={`
                    min-w-[32px] rounded-full px-2.5 py-0.5 text-center
                    text-sm font-bold tabular-nums
                    ${isActive ? item.pill : 'bg-slate-100 text-slate-600'}
                  `}
                >
                  {item.count}
                </span>

                <span className="flex w-4 shrink-0 justify-center">
                  {isActive && <Check className="h-4 w-4" strokeWidth={3} />}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default React.memo(OrderTypeSelect)