import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const PRODUCT_CODES = [
  { code: 'ILL', color: 'bg-purple-500' },
  { code: 'GLL', color: 'bg-orange-500' },
  { code: 'DIA', color: 'bg-teal-500'   },
];

const DEFAULT_COLOR    = 'bg-slate-500';
const UNSELECTED_STYLE = 'bg-white text-gray-700 border-gray-300 hover:border-gray-400';

/**
 * Props:
 *   summary  — { ILL: { count: 15, productId: "abc" }, GLL: { count: 4, productId: "xyz" }, ... }
 *   selected — current productId ('' = none)
 *   onChange — (productId: string) => void
 */
const ProductSelect = ({ summary = {}, selected = '', onChange }) => {
  const [open, setOpen] = useState(false);
  const ref             = useRef(null);

  const getId = (meta) => meta?.productId ?? meta?.id ?? null;

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectedProduct = PRODUCT_CODES.find(p => getId(summary[p.code]) === selected && selected !== '');
  const triggerLabel    = selectedProduct ? selectedProduct.code : 'Filter by Product';
  const triggerColor    = selectedProduct ? selectedProduct.color : null;
  const triggerCount    = selectedProduct ? (summary[selectedProduct.code]?.count ?? 0) : null;

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
          ${selectedProduct
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
          ${selectedProduct ? 'text-white' : 'text-gray-400'}
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
            All Products
          </button>

          {PRODUCT_CODES.map(({ code, color }) => {
            const meta     = summary[code] ?? {};
            const id       = getId(meta);
            const isActive = !!id && selected === id;

            return (
              <button
                key={code}
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
                {code}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default React.memo(ProductSelect);
