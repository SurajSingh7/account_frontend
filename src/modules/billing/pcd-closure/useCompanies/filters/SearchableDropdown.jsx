import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

/**
 * SearchableDropdown — styled to match the original filter controls:
 * px-4 py-3, text-base font-semibold, border-gray-300 rounded-lg
 */
const SearchableDropdown = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select…',
  onSearch,
  loading = false,
}) => {
  const [open,       setOpen]       = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef                = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!onSearch) return;
    const id = setTimeout(() => onSearch(searchTerm), 300);
    return () => clearTimeout(id);
  }, [searchTerm, onSearch]);

  const visible = onSearch
    ? options
    : options.filter(o =>
        o.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.sublabel && o.sublabel.toLowerCase().includes(searchTerm.toLowerCase()))
      );

  const selected = options.find(o => o.value === value);

  const handleSelect = (opt) => {
    onChange(opt.value);
    setOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger — matches original filter control height/padding */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`
          w-full flex items-center gap-2 px-4 py-3
          border rounded-lg text-base font-semibold text-gray-700
          bg-white transition-all text-left
          ${open
            ? 'border-blue-500 ring-2 ring-blue-100'
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
      >
        <Search className="w-5 h-5 text-gray-400 shrink-0" />
        <span className={`flex-1 truncate ${selected ? 'text-gray-700' : 'text-gray-400'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {value && (
            <span
              onClick={handleClear}
              className="p-0.5 rounded hover:bg-gray-100"
            >
              <X className="w-4 h-4 text-gray-400" />
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[220px] bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-md">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                autoFocus
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search…"
                className="bg-transparent outline-none text-sm font-semibold text-gray-700 w-full placeholder-gray-400"
              />
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-4 text-sm text-gray-400 text-center font-semibold">Loading…</div>
            ) : visible.length === 0 ? (
              <div className="px-4 py-4 text-sm text-gray-400 text-center font-semibold">No results</div>
            ) : (
              visible.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt)}
                  className={`
                    w-full text-left px-4 py-3 text-sm transition-colors font-semibold
                    ${opt.value === value
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <div>{opt.label}</div>
                  {opt.sublabel && (
                    <div className="text-xs text-gray-400 font-normal mt-0.5">{opt.sublabel}</div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;