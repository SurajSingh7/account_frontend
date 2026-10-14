import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical } from 'lucide-react';

/**
 * ActionMenu – a compact "three dots" trigger with a dropdown of actions.
 *
 * Props
 *  - items: Array<
 *      | { type: 'divider' }
 *      | {
 *          key: string,
 *          label: string,
 *          description?: string,      // optional helper text under the label
 *          icon?: LucideIcon,
 *          onClick: () => void,
 *          hidden?: boolean,          // set true to remove (e.g. permission checks)
 *          disabled?: boolean,
 *          tone?: 'default' | 'danger',
 *          iconClassName?: string,    // colour of the icon, e.g. 'text-blue-600'
 *        }
 *    >
 *  - label: aria-label for the trigger button
 *  - width: menu width in px (default 248)
 *
 * The menu is rendered in a portal with fixed positioning, so it is never
 * clipped by parents that use `overflow-hidden` (like the order card).
 */

const GAP = 6; // px between trigger and menu
const EDGE = 8; // min distance from the viewport edge

const ActionMenu = ({ items = [], label = 'More actions', width = 248 }) => {
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0, origin: 'top right' });
    const triggerRef = useRef(null);
    const menuRef = useRef(null);

    // Drop hidden items, then tidy dividers (no leading / trailing / double dividers)
    const visible = items
        .filter((i) => !i.hidden)
        .filter((item, idx, arr) => {
            if (item.type !== 'divider') return true;
            const prev = arr[idx - 1];
            const next = arr[idx + 1];
            return idx !== 0 && idx !== arr.length - 1 && prev?.type !== 'divider' && next;
        });

    const actionable = visible.filter((i) => i.type !== 'divider' && !i.disabled);

    const close = useCallback((returnFocus = true) => {
        setOpen(false);
        if (returnFocus) triggerRef.current?.focus();
    }, []);

    // ── Position: right-align to trigger, flip upwards if there is no room below ──
    const reposition = useCallback(() => {
        const trigger = triggerRef.current;
        const menu = menuRef.current;
        if (!trigger || !menu) return;

        const t = trigger.getBoundingClientRect();
        const m = menu.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        let left = t.right - m.width;
        left = Math.max(EDGE, Math.min(left, vw - m.width - EDGE));

        const spaceBelow = vh - t.bottom - GAP - EDGE;
        const flipUp = spaceBelow < m.height && t.top > spaceBelow;
        const top = flipUp ? Math.max(EDGE, t.top - m.height - GAP) : t.bottom + GAP;

        setPos({ top, left, origin: flipUp ? 'bottom right' : 'top right' });
    }, []);

    useLayoutEffect(() => {
        if (open) reposition();
    }, [open, reposition, visible.length]);

    // ── Close on outside click / scroll / resize / Escape ──
    useEffect(() => {
        if (!open) return;

        const onPointerDown = (e) => {
            if (menuRef.current?.contains(e.target) || triggerRef.current?.contains(e.target)) return;
            close(false);
        };
        const onKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.stopPropagation();
                close();
            }
        };
        const onViewportChange = () => close(false);

        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        window.addEventListener('resize', onViewportChange);
        window.addEventListener('scroll', onViewportChange, true);
        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('resize', onViewportChange);
            window.removeEventListener('scroll', onViewportChange, true);
        };
    }, [open, close]);

    // Focus the first enabled item when opened
    useEffect(() => {
        if (!open) return;
        const first = menuRef.current?.querySelector('[role="menuitem"]:not([disabled])');
        first?.focus();
    }, [open]);

    // ── Arrow-key navigation inside the menu ──
    const onMenuKeyDown = (e) => {
        const nodes = Array.from(menuRef.current.querySelectorAll('[role="menuitem"]:not([disabled])'));
        if (!nodes.length) return;
        const current = nodes.indexOf(document.activeElement);

        const move = (idx) => {
            e.preventDefault();
            nodes[(idx + nodes.length) % nodes.length].focus();
        };

        if (e.key === 'ArrowDown') move(current + 1);
        else if (e.key === 'ArrowUp') move(current - 1);
        else if (e.key === 'Home') move(0);
        else if (e.key === 'End') move(nodes.length - 1);
        else if (e.key === 'Tab') close(false);
    };

    const handleSelect = (item) => {
        if (item.disabled) return;
        close(false);
        item.onClick?.();
    };

    if (actionable.length === 0) return null;

    return (
        <>
            <button
                ref={triggerRef}
                type="button"
                aria-label={label}
                aria-haspopup="menu"
                aria-expanded={open}
                title={label}
                onClick={() => setOpen((o) => !o)}
                className={`inline-flex cursor-pointer h-9 w-9 items-center justify-center rounded-lg border transition-colors
          focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1
          ${open
                        ? 'border-gray-300 bg-gray-100 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-200 hover:bg-gray-100 hover:text-gray-800'
                    }`}
            >
                <MoreVertical className="h-5 w-5" />
            </button>

            {open &&
                createPortal(
                    <div
                        ref={menuRef}
                        role="menu"
                        aria-label={label}
                        onKeyDown={onMenuKeyDown}
                        style={{
                            position: 'fixed',
                            top: pos.top,
                            left: pos.left,
                            width,
                            transformOrigin: pos.origin,
                        }}
                        className="z-[60] animate-menuIn overflow-hidden rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl ring-1 ring-black/5"
                    >
                        {visible.map((item, idx) => {
                            if (item.type === 'divider') {
                                return <div key={`divider-${idx}`} role="separator" className="my-1.5 h-px bg-gray-100" />;
                            }

                            const Icon = item.icon;
                            const danger = item.tone === 'danger';

                            return (
                                <button
                                    key={item.key}
                                    type="button"
                                    role="menuitem"
                                    disabled={item.disabled}
                                    onClick={() => handleSelect(item)}
                                    className={`group flex cursor-pointer w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors
                    focus:outline-none
                    ${item.disabled
                                            ? 'cursor-not-allowed opacity-50'
                                            : danger
                                                ? 'hover:bg-red-50 focus:bg-red-50'
                                                : 'hover:bg-gray-50 focus:bg-gray-100'
                                        }`}
                                >
                                    {Icon && (
                                        <span
                                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 transition-colors
                        ${danger ? 'group-hover:bg-red-100' : 'group-hover:bg-white group-hover:shadow-sm'}`}
                                        >
                                            <Icon className={`h-4 w-4 ${item.iconClassName || (danger ? 'text-red-600' : 'text-gray-600')}`} />
                                        </span>
                                    )}
                                    <span className="min-w-0">
                                        <span className={`block text-sm font-medium ${danger ? 'text-red-700' : 'text-gray-900'}`}>
                                            {item.label}
                                        </span>
                                        {item.description && (
                                            <span className="block truncate text-xs text-gray-500">{item.description}</span>
                                        )}
                                    </span>
                                </button>
                            );
                        })}
                    </div>,
                    document.body
                )}

            {/* Tiny entrance animation – move to globals.css / tailwind.config if you prefer */}
            <style jsx global>{`
        @keyframes menuIn {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(-4px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-menuIn {
          animation: menuIn 120ms ease-out;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-menuIn {
            animation: none;
          }
        }
      `}</style>
        </>
    );
};

export default ActionMenu;