import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useEntityAliases } from '../filterPermission/hook/useEntityAliases';

/* ─────────────────────────────────────────────────────────────
   Runtime color → token resolver
   ─────────────────────────────────────────────────────────────
   ENTITY_ALIASES comes from a hook, so colors aren't known at
   build time. We map any Tailwind `bg-{color}-500` class to a
   full token set: tinted surface + soft row bg + solid count pill.
   Unknown colors fall back to slate so the UI never breaks.
   ───────────────────────────────────────────────────────────── */
const ENTITY_TOKENS = {
  slate: { dot: 'bg-slate-500', surface: 'bg-slate-50 border-slate-300 text-slate-900', soft: 'bg-slate-100 text-slate-900', pill: 'bg-slate-700 text-white' },
  gray: { dot: 'bg-gray-500', surface: 'bg-gray-50 border-gray-300 text-gray-900', soft: 'bg-gray-100 text-gray-900', pill: 'bg-gray-700 text-white' },
  red: { dot: 'bg-red-500', surface: 'bg-red-50 border-red-300 text-red-900', soft: 'bg-red-100 text-red-900', pill: 'bg-red-700 text-white' },
  orange: { dot: 'bg-orange-500', surface: 'bg-orange-50 border-orange-300 text-orange-900', soft: 'bg-orange-100 text-orange-900', pill: 'bg-orange-700 text-white' },
  amber: { dot: 'bg-amber-500', surface: 'bg-amber-50 border-amber-300 text-amber-900', soft: 'bg-amber-100 text-amber-900', pill: 'bg-amber-300 text-amber-950' },
  yellow: { dot: 'bg-yellow-500', surface: 'bg-yellow-50 border-yellow-300 text-yellow-900', soft: 'bg-yellow-100 text-yellow-900', pill: 'bg-yellow-300 text-yellow-950' },
  lime: { dot: 'bg-lime-500', surface: 'bg-lime-50 border-lime-300 text-lime-900', soft: 'bg-lime-100 text-lime-900', pill: 'bg-lime-300 text-lime-950' },
  green: { dot: 'bg-green-500', surface: 'bg-green-50 border-green-300 text-green-900', soft: 'bg-green-100 text-green-900', pill: 'bg-green-700 text-white' },
  emerald: { dot: 'bg-emerald-500', surface: 'bg-emerald-50 border-emerald-300 text-emerald-900', soft: 'bg-emerald-100 text-emerald-900', pill: 'bg-emerald-700 text-white' },
  teal: { dot: 'bg-teal-500', surface: 'bg-teal-50 border-teal-300 text-teal-900', soft: 'bg-teal-100 text-teal-900', pill: 'bg-teal-700 text-white' },
  cyan: { dot: 'bg-cyan-500', surface: 'bg-cyan-50 border-cyan-300 text-cyan-900', soft: 'bg-cyan-100 text-cyan-900', pill: 'bg-cyan-700 text-white' },
  sky: { dot: 'bg-sky-500', surface: 'bg-sky-50 border-sky-300 text-sky-900', soft: 'bg-sky-100 text-sky-900', pill: 'bg-sky-700 text-white' },
  blue: { dot: 'bg-blue-500', surface: 'bg-blue-50 border-blue-300 text-blue-900', soft: 'bg-blue-100 text-blue-900', pill: 'bg-blue-700 text-white' },
  indigo: { dot: 'bg-indigo-500', surface: 'bg-indigo-50 border-indigo-300 text-indigo-900', soft: 'bg-indigo-100 text-indigo-900', pill: 'bg-indigo-700 text-white' },
  violet: { dot: 'bg-violet-500', surface: 'bg-violet-50 border-violet-300 text-violet-900', soft: 'bg-violet-100 text-violet-900', pill: 'bg-violet-700 text-white' },
  purple: { dot: 'bg-purple-500', surface: 'bg-purple-50 border-purple-300 text-purple-900', soft: 'bg-purple-100 text-purple-900', pill: 'bg-purple-700 text-white' },
  fuchsia: { dot: 'bg-fuchsia-500', surface: 'bg-fuchsia-50 border-fuchsia-300 text-fuchsia-900', soft: 'bg-fuchsia-100 text-fuchsia-900', pill: 'bg-fuchsia-700 text-white' },
  pink: { dot: 'bg-pink-500', surface: 'bg-pink-50 border-pink-300 text-pink-900', soft: 'bg-pink-100 text-pink-900', pill: 'bg-pink-700 text-white' },
  rose: { dot: 'bg-rose-500', surface: 'bg-rose-50 border-rose-300 text-rose-900', soft: 'bg-rose-100 text-rose-900', pill: 'bg-rose-700 text-white' },
};

const FALLBACK_TOKENS = ENTITY_TOKENS.slate;

const resolveTokens = (colorClass) => {
  if (!colorClass) return FALLBACK_TOKENS;
  const match = /^bg-([a-z]+)-\d+$/.exec(colorClass);
  return ENTITY_TOKENS[match?.[1]] ?? FALLBACK_TOKENS;
};

/* Slate tokens for the "All Entities" state */
const ALL = {
  dot: 'bg-slate-400',
  surface: 'bg-slate-50 border-slate-300 text-slate-900',
  soft: 'bg-slate-100 text-slate-900',
  pill: 'bg-slate-700 text-white',
};

const getId = (meta) => meta?.entityId ?? meta?.id ?? null;

/**
 * Props:
 *   summary  — { GTEL: { count: 17, entityId: "abc" }, WIBRO: { count: 2, entityId: "xyz" }, ... }
 *   selected — current entityId ('' = none)
 *   onChange — (entityId: string) => void
 */
const EntitySelect = ({ summary = {}, selected = '', onChange }) => {
  const ENTITY_ALIASES = useEntityAliases();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  /* Resolve every entity once: id + count + token set */
  const items = useMemo(
    () =>
      ENTITY_ALIASES.map((e) => {
        const meta = summary[e.alias] ?? {};
        return {
          alias: e.alias,
          id: getId(meta),
          count: meta.count ?? 0,
          tokens: resolveTokens(e.color),
        };
      }),
    [ENTITY_ALIASES, summary],
  );

  const totalCount = useMemo(
    () => items.reduce((s, i) => s + i.count, 0),
    [items],
  );

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

  const triggerTokens = selectedItem?.tokens ?? ALL;

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
          ${triggerTokens.surface}
          ${open ? 'ring-2 ring-offset-1 ring-slate-300' : ''}
        `}
      >
        {/* Colour marker */}
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${triggerTokens.dot}`} />

        <span className="flex-1 truncate">
          {selectedItem ? selectedItem.alias : 'Filter by Entity'}
        </span>

        {/* Count badge — solid, bold, tabular so 17 vs 18 is instantly readable */}
        <span
          className={`
            shrink-0 min-w-8 rounded-full px-2.5 py-0.5
            text-center text-sm font-bold tabular-nums shadow-sm
            ${triggerTokens.pill}
          `}
        >
          {selectedItem ? selectedItem.count : totalCount}
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
          {/* All entities */}
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
            <span className="flex-1 text-left">All Entities</span>
            <span
              className={`
                min-w-8 rounded-full px-2.5 py-0.5 text-center
                text-sm font-bold tabular-nums
                ${!selected ? ALL.pill : 'bg-slate-100 text-slate-600'}
              `}
            >
              {totalCount}
            </span>
            <span className="flex w-4 shrink-0 justify-center">
              {!selected && <Check className="h-4 w-4" strokeWidth={3} />}
            </span>
          </button>

          <div className="my-1 h-px bg-slate-100" />

          {/* One row per entity */}
          {items.map((item) => {
            const isActive = !!item.id && selected === item.id;
            const isDisabled = !item.id;
            const t = item.tokens;

            return (
              <button
                key={item.alias}
                type="button"
                role="option"
                aria-selected={isActive}
                disabled={isDisabled}
                onClick={() => handleSelect(isActive ? '' : item.id ?? '')}
                className={`
                  flex w-full items-center gap-3 px-3 py-2.5 text-sm font-semibold
                  transition-colors duration-150
                  ${isActive ? t.soft : 'text-slate-700 hover:bg-slate-50'}
                  ${isDisabled ? 'cursor-not-allowed opacity-40 hover:bg-transparent' : ''}
                `}
              >
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${t.dot}`} />
                <span className="flex-1 text-left">{item.alias}</span>

                <span
                  className={`
                    min-w-8 rounded-full px-2.5 py-0.5 text-center
                    text-sm font-bold tabular-nums
                    ${isActive ? t.pill : 'bg-slate-100 text-slate-600'}
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

export default React.memo(EntitySelect);