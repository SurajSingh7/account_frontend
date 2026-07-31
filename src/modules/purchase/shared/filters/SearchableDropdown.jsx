import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

// ─── Type reference ────────────────────────────────────────────────────────────
// Option shape:
//   { value: string, label: string, sublabel?: string }
//
// Props:
//   options     — full list of options to display
//   value       — currently selected value (controlled)
//   onChange    — called with the new value string (or '' when cleared)
//   placeholder — text shown when nothing is selected
//   onSearch    — optional: if provided, search filtering is delegated to the parent
//                 (useful for async/server-side search); fires after 300ms debounce
//   loading     — show a loading state inside the dropdown (for async search)
// ──────────────────────────────────────────────────────────────────────────────

// ─── Sub-component: the button that opens/closes the dropdown ─────────────────
const DropdownTrigger = ({ selected, placeholder, isOpen, onOpen, onClear }) => (
  <button
    type="button"
    onClick={onOpen}
    className={`
      w-full flex items-center gap-2 px-4 py-3
      border rounded-lg text-base font-semibold text-gray-700
      bg-white transition-all text-left
      ${isOpen
        ? 'border-blue-500 ring-2 ring-blue-100'
        : 'border-gray-300 hover:border-gray-400'
      }
    `}
  >
    <Search className="w-5 h-5 text-gray-400 shrink-0" />

    {/* Selected label or placeholder */}
    <span className={`flex-1 truncate ${selected ? 'text-gray-700' : 'text-gray-400'}`}>
      {selected ? selected.label : placeholder}
    </span>

    {/* Clear button (only shown when something is selected) + chevron */}
    <div className="flex items-center gap-1 shrink-0">
      {selected && (
        <span
          onClick={(e) => { e.stopPropagation(); onClear(); }}
          className="p-0.5 rounded hover:bg-gray-100"
        >
          <X className="w-4 h-4 text-gray-400" />
        </span>
      )}
      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </div>
  </button>
);

// ─── Sub-component: search input inside the open dropdown ─────────────────────
const SearchInput = ({ value, onChange }) => (
  <div className="p-2 border-b border-gray-100">
    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-md">
      <Search className="w-4 h-4 text-gray-400 shrink-0" />
      <input
        autoFocus
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search…"
        className="bg-transparent outline-none text-sm font-semibold text-gray-700 w-full placeholder-gray-400"
      />
    </div>
  </div>
);

// ─── Sub-component: the scrollable list of options ────────────────────────────
const OptionList = ({ options, selectedValue, onSelect, loading }) => {
  if (loading) {
    return <div className="px-4 py-4 text-sm text-gray-400 text-center font-semibold">Loading…</div>;
  }
  if (options.length === 0) {
    return <div className="px-4 py-4 text-sm text-gray-400 text-center font-semibold">No results</div>;
  }
  return options.map((opt) => (
    <button
      key={opt.value}
      type="button"
      onClick={() => onSelect(opt)}
      className={`
        w-full text-left px-4 py-3 text-sm transition-colors font-semibold
        ${opt.value === selectedValue
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
  ));
};

// ─── Main component ───────────────────────────────────────────────────────────
const SearchableDropdown = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select…',
  onSearch,        // optional: delegate search to parent (async/server-side)
  loading = false,
}) => {
  const [isOpen,     setIsOpen]     = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef                = useRef(null);

  // Close dropdown when user clicks outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // If parent handles search (async), debounce and call onSearch
  useEffect(() => {
    if (!onSearch) return;
    const timer = setTimeout(() => onSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);

  // If parent does NOT handle search, filter locally
  const visibleOptions = onSearch
    ? options
    : options.filter((opt) => {
        const q = searchTerm.toLowerCase();
        return (
          opt.label.toLowerCase().includes(q) ||
          (opt.sublabel && opt.sublabel.toLowerCase().includes(q))
        );
      });

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (opt) => {
    onChange(opt.value);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    onChange('');
    setSearchTerm('');
  };

  return (
    <div ref={containerRef} className="relative">
      <DropdownTrigger
        selected={selectedOption}
        placeholder={placeholder}
        isOpen={isOpen}
        onOpen={() => setIsOpen((prev) => !prev)}
        onClear={handleClear}
      />

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full min-w-[220px] bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <SearchInput value={searchTerm} onChange={setSearchTerm} />
          <div className="max-h-56 overflow-y-auto">
            <OptionList
              options={visibleOptions}
              selectedValue={value}
              onSelect={handleSelect}
              loading={loading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;