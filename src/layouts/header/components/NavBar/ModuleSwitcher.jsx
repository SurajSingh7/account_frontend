"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { MODULES, MODULE_DEFAULT_ROUTE, MODULE_COLORS } from "./modules";

export const ModuleSwitcher = ({ selectedModule, onSelect }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const current = MODULES.find((m) => m.key === selectedModule) ?? MODULES[0];
  const currentColors = MODULE_COLORS[current.key] ?? { button: "bg-gray-700 hover:bg-gray-600" };

  return (
    <div ref={ref} className="relative ml-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        className={`flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-md transition-colors ${currentColors.button}`}
      >
        <span>{current.label}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 mt-2 w-40 rounded-md shadow-lg bg-gray-800 z-20">
          <div className="py-1">
            {MODULES.map((m) => {
              const colors = MODULE_COLORS[m.key] ?? { active: "bg-green-700 text-white" };
              return (
                <button
                  type="button"
                  key={m.key}
                  onClick={() => {
                    onSelect(m.key);
                    setOpen(false);
                    router.push(MODULE_DEFAULT_ROUTE[m.key]);
                  }}
                  className={`block w-full text-left px-4 py-2 text-xs ${
                    m.key === selectedModule
                      ? colors.active
                      : "text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
