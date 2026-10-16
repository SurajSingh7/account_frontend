import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   Palette rules
   ─────────────────────────────────────────────────────────────
   surface : tinted background + matching border + dark text
             (dark text on 50-tint ≈ 12:1 contrast — very easy to read)
   soft    : active row background in the dropdown
   pill    : the count badge — solid, saturated, high contrast.
             Orange/Teal/Violet use 600–700 with white text (≥5:1).
             ILL+H8 uses a light amber pill with near-black text
             because white-on-yellow is never readable.
   dot     : saturated marker for quick colour recognition
   ───────────────────────────────────────────────────────────── */
const PRODUCT_CODES = [
  {
    code: 'ILL',
    dot: 'bg-violet-500',
    surface: 'bg-violet-50 border-violet-300 text-violet-900',
    soft: 'bg-violet-100 text-violet-900',
    pill: 'bg-violet-600 text-white',
  },
  {
    code: 'GLL',
    dot: 'bg-orange-500',
    surface: 'bg-orange-50 border-orange-300 text-orange-900',
    soft: 'bg-orange-100 text-orange-900',
    pill: 'bg-orange-700 text-white',
  },
  {
    code: 'DIA',
    dot: 'bg-teal-500',
    surface: 'bg-teal-50 border-teal-300 text-teal-900',
    soft: 'bg-teal-100 text-teal-900',
    pill: 'bg-teal-700 text-white',
  },
  {
    code: 'ILL+H8',
    dot: 'bg-amber-400',
    surface: 'bg-amber-50 border-amber-300 text-amber-900',
    soft: 'bg-amber-100 text-amber-900',
    pill: 'bg-amber-300 text-amber-950',
  },
  {
    code: 'FBL',
    dot: 'bg-indigo-400',
    surface: 'bg-indigo-50 border-indigo-300 text-indigo-900',
    soft: 'bg-indigo-100 text-indigo-900',
    pill: 'bg-indigo-300 text-amber-950',
  },
];

const getId = (meta) => meta?.productId ?? meta?.id ?? null;

/**
 * Props:
 *   summary  — { ILL: { count: 15, productId: "abc" }, GLL: { count: 4, productId: "xyz" }, ... }
 *   selected — current productId ('' = none)
 *   onChange — (productId: string) => void
 */
const ProductSelect = ({ summary = {}, selected = '', onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  /* Resolve every product once: id + count */
  const items = useMemo(
    () =>
      PRODUCT_CODES.map((p) => {
        const meta = summary[p.code] ?? {};
        return { ...p, id: getId(meta), count: meta.count ?? 0 };
      }),
    [summary]
  );

  const totalCount = items.reduce((sum, i) => sum + i.count, 0);
  const selectedItem = items.find((i) => i.id && i.id === selected) ?? null;

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

  const handleSelect = (id) => {
    onChange(id);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative flex-1 min-w-50">
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
          ${selectedItem
            ? selectedItem.surface
            : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400 hover:bg-slate-50'
          }
          ${open ? 'ring-2 ring-offset-1 ring-slate-300' : ''}
        `}
      >
        {/* Colour marker */}
        <span
          className={`
            h-2.5 w-2.5 shrink-0 rounded-full
            ${selectedItem ? selectedItem.dot : 'border-2 border-slate-300 bg-white'}
          `}
        />

        <span className="flex-1 truncate">
          {selectedItem ? selectedItem.code : 'Filter by Product'}
        </span>

        {/* Count badge — solid, bold, tabular so 25 vs 26 is instantly readable */}
        <span
          className={`
            shrink-0 min-w-8 rounded-full px-2.5 py-0.5
            text-center text-sm font-bold tabular-nums shadow-sm
            ${selectedItem ? selectedItem.pill : 'bg-slate-100 text-slate-500 shadow-none'}
          `}
        >
          {selectedItem ? selectedItem.count : totalCount}
        </span>

        <ChevronDown
          className={`
            h-4 w-4 shrink-0 transition-transform duration-200
            ${selectedItem ? 'opacity-60' : 'text-slate-400'}
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
          {/* All products */}
          <button
            type="button"
            role="option"
            aria-selected={!selected}
            onClick={() => handleSelect('')}
            className={`
              flex w-full items-center gap-3 px-3 py-2.5 text-sm font-semibold
              transition-colors duration-150
              ${!selected ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'}
            `}
          >
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-slate-400" />
            <span className="flex-1 text-left">All Products</span>
            <span
              className={`
                min-w-8 rounded-full px-2.5 py-0.5 text-center
                text-sm font-bold tabular-nums
                ${!selected ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'}
              `}
            >
              {totalCount}
            </span>
            <span className="flex w-4 shrink-0 justify-center">
              {!selected && <Check className="h-4 w-4" strokeWidth={3} />}
            </span>
          </button>

          <div className="my-1 h-px bg-slate-100" />

          {/* One row per product */}
          {items.map((item) => {
            const isActive = !!item.id && selected === item.id;
            const isDisabled = !item.id;

            return (
              <button
                key={item.code}
                type="button"
                role="option"
                aria-selected={isActive}
                disabled={isDisabled}
                onClick={() => handleSelect(isActive ? '' : item.id ?? '')}
                className={`
                  flex w-full items-center gap-3 px-3 py-2.5 text-sm font-semibold
                  transition-colors duration-150
                  ${isActive
                    ? `${item.soft}`
                    : 'text-slate-700 hover:bg-slate-50'
                  }
                  ${isDisabled ? 'cursor-not-allowed opacity-40 hover:bg-transparent' : ''}
                `}
              >
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.dot}`} />
                <span className="flex-1 text-left">{item.code}</span>

                <span
                  className={`
                    min-w-8 rounded-full px-2.5 py-0.5 text-center
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

export default React.memo(ProductSelect);