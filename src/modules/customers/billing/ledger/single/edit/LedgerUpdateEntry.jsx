'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { API_BACKEND_URL } from '@/config/getEnvVariables';
import { API_ENDPOINTS } from '@/constants/api';

// ─── Constants ────────────────────────────────────────────────────────────────
const TRANSACTION_TYPES = [
  {
    value: 'PAYMENT',
    label: 'Payment',
    icon: '💰',
    pill: 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100',
    pillActive: 'bg-emerald-500 text-white border border-emerald-500 shadow-sm',
    pillDisabled: 'bg-emerald-100 text-emerald-400 border border-emerald-200 opacity-60 cursor-not-allowed',
    badge: 'bg-emerald-100 text-emerald-700',
    inputBorder: 'border-emerald-300 focus:ring-emerald-300',
    btnBg: 'bg-emerald-500 hover:bg-emerald-600',
  },
  {
    value: 'TDS_CONFIRMED',
    label: 'TDS Confirmed',
    icon: '✅',
    pill: 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100',
    pillActive: 'bg-blue-500 text-white border border-blue-500 shadow-sm',
    pillDisabled: 'bg-blue-100 text-blue-400 border border-blue-200 opacity-60 cursor-not-allowed',
    badge: 'bg-blue-100 text-blue-700',
    inputBorder: 'border-blue-300 focus:ring-blue-300',
    btnBg: 'bg-blue-500 hover:bg-blue-600',
  },
  {
    value: 'TDS_PROVISION',
    label: 'TDS Provision',
    icon: '📋',
    pill: 'bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100',
    pillActive: 'bg-violet-500 text-white border border-violet-500 shadow-sm',
    pillDisabled: 'bg-violet-100 text-violet-400 border border-violet-200 opacity-60 cursor-not-allowed',
    badge: 'bg-violet-100 text-violet-700',
    inputBorder: 'border-violet-300 focus:ring-violet-300',
    btnBg: 'bg-violet-500 hover:bg-violet-600',
  },
  {
    value: 'CREDIT_NOTE',
    label: 'Credit Note',
    icon: '🧾',
    pill: 'bg-cyan-50 text-cyan-700 border border-cyan-200 hover:bg-cyan-100',
    pillActive: 'bg-cyan-500 text-white border border-cyan-500 shadow-sm',
    pillDisabled: 'bg-cyan-100 text-cyan-400 border border-cyan-200 opacity-60 cursor-not-allowed',
    badge: 'bg-cyan-100 text-cyan-700',
    inputBorder: 'border-cyan-300 focus:ring-cyan-300',
    btnBg: 'bg-cyan-500 hover:bg-cyan-600',
  },
  {
    value: 'MISC_CHARGE',
    label: 'Misc Charge',
    icon: '🔖',
    pill: 'bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100',
    pillActive: 'bg-orange-500 text-white border border-orange-500 shadow-sm',
    pillDisabled: 'bg-orange-100 text-orange-400 border border-orange-200 opacity-60 cursor-not-allowed',
    badge: 'bg-orange-100 text-orange-700',
    inputBorder: 'border-orange-300 focus:ring-orange-300',
    btnBg: 'bg-orange-500 hover:bg-orange-600',
  },
];

// Types shown in "Add New Entry" form pills — TDS_CONFIRMED excluded (created only via Move)
const FORM_TRANSACTION_TYPES = TRANSACTION_TYPES.filter((t) => t.value !== 'TDS_CONFIRMED');

const SUB_TYPES =[
  { value: 'MANUAL_ADJUSTMENT', label: 'Manual Adjustment' },
  { value: 'ADVANCE', label: 'Advance' },
  { value: 'REVERSAL', label: 'Reversal' },
  { value: 'PENALTY', label: 'Penalty' },
];

const MONTH_SCOPED_TYPES = ['PAYMENT', 'TDS_CONFIRMED', 'TDS_PROVISION', 'MISC_CHARGE'];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const todayISO = () => new Date().toISOString().split('T')[0];
const getTypeConfig = (v) => TRANSACTION_TYPES.find((t) => t.value === v) ?? TRANSACTION_TYPES[0];
const fmtINR = (v) =>
  v != null ? `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—';

function getMonthBounds(dateStr) {
  if (!dateStr) return { start: '', end: '' };
  const [year, month] = dateStr.split('-').map(Number);
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { start, end };
}

const MONTH_NAME_MAP = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

function parseMonthParam(monthStr) {
  if (!monthStr) return null;
  let year, month;
  const mmmYYYY = monthStr.match(/^([a-zA-Z]{3})-(\d{4})$/);
  if (mmmYYYY) {
    month = MONTH_NAME_MAP[mmmYYYY[1].toLowerCase()];
    year = parseInt(mmmYYYY[2], 10);
  }
  if (!month) {
    const iso = monthStr.match(/^(\d{4})-(\d{2})/);
    if (iso) { year = parseInt(iso[1], 10); month = parseInt(iso[2], 10); }
  }
  if (!year || !month || month < 1 || month > 12) return null;
  const mm = String(month).padStart(2, '0');
  const minDate = `${year}-${mm}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const maxDate = `${year}-${mm}-${String(lastDay).padStart(2, '0')}`;
  const label = new Date(year, month - 1, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });
  return { minDate, maxDate, label };
}

function extractEntries(raw) {
  if (!raw) return [];
  if (raw.data && Array.isArray(raw.data.data)) return raw.data.data;
  if (Array.isArray(raw.data)) return raw.data;
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.entries)) return raw.entries;
  if (Array.isArray(raw.ledgerEntries)) return raw.ledgerEntries;
  if (raw._id) return [raw];
  return [];
}

function extractSummary(raw) {
  if (!raw) return null;
  if (raw.data && raw.data.summary) return raw.data.summary;
  return null;
}

// ─── API ──────────────────────────────────────────────────────────────────────
const apiHeaders = () => ({ 'Content-Type': 'application/json' });

async function fetchStatement(billId) {
  const res = await fetch(
    `${API_BACKEND_URL}${API_ENDPOINTS.customers.billing.ledger.statement}/${billId}`,
    { method: 'GET', headers: apiHeaders(), credentials: 'include' },
  );
  if (!res.ok) throw new Error(`Failed to load (${res.status})`);
  return res.json();
}

async function postLedgerEntry(payload) {
  const res = await fetch(`${API_BACKEND_URL}${API_ENDPOINTS.customers.billing.ledger.entry}`, {
    method: 'POST', headers: apiHeaders(), credentials: 'include',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.message || `Submit failed (${res.status})`);
  }
  return res.json();
}

async function putLedgerEntry(id, payload) {
  const res = await fetch(`${API_BACKEND_URL}${API_ENDPOINTS.customers.billing.ledger.modify}/${id}`, {
    method: 'PUT', headers: apiHeaders(), credentials: 'include',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.message || `Update failed (${res.status})`);
  }
  return res.json();
}

async function moveProvisionToConfirm({ monthlyBillingId, notes }) {
  const res = await fetch(`${API_BACKEND_URL}${API_ENDPOINTS.customers.billing.ledger.moveProvisionToConfirm}`, {
    method: 'POST', headers: apiHeaders(), credentials: 'include',
    body: JSON.stringify({ monthlyBillingId, notes }),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.message || `Move failed (${res.status})`);
  }
  return res.json();
}

async function fetchCreditNoteAmount({ startDate, endDate, monthlyBillingId }) {
  const res = await fetch(`${API_BACKEND_URL}${API_ENDPOINTS.customers.billing.ledger.calculateCreditNoteAmount}`, {
    method: 'POST', headers: apiHeaders(), credentials: 'include',
    body: JSON.stringify({ startDate, endDate, monthlyBillingId }),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.message || `Amount lookup failed (${res.status})`);
  }
  const json = await res.json();
  const d = json?.data ?? json;
  return {
    amount: d?.basicAmount ?? d?.totalAmount ?? d?.amount ?? null,
    selectedDays: d?.selectedDays ?? null,
    billingDays: d?.billingDays ?? null,
    cgst: d?.cgst ?? null,
    sgst: d?.sgst ?? null,
    igst: d?.igst ?? null,
    totalGST: d?.totalGST ?? null,
    totalAmount: d?.totalAmount ?? null,
  };
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ h = 'h-10', w = 'w-full' }) {
  return <div className={`${h} ${w} rounded-lg bg-gray-100 animate-pulse`} />;
}

// ─── SummaryBar ───────────────────────────────────────────────────────────────
function SummaryBar({ summary }) {
  if (!summary) return null;
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-3 flex flex-wrap gap-x-8 gap-y-2 items-center">
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Total Transactions</p>
        <p className="text-sm font-extrabold text-gray-800 tabular-nums">{summary.totalTransactions ?? '—'}</p>
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Total Amount</p>
        <p className="text-sm font-extrabold text-gray-800 tabular-nums">{fmtINR(summary.totalAmount)}</p>
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Total Credit</p>
        <p className="text-sm font-extrabold text-emerald-600 tabular-nums">{fmtINR(summary.totalCredit)}</p>
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Total Debit</p>
        <p className="text-sm font-extrabold text-red-500 tabular-nums">{fmtINR(summary.totalDebit)}</p>
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Net Amount</p>
        <p className="text-sm font-extrabold text-gray-800 tabular-nums">{fmtINR(summary.netAmount)}</p>
      </div>
    </div>
  );
}

// ─── MoveModal ────────────────────────────────────────────────────────────────
function MoveModal({ monthlyBillingId, onClose, onSuccess }) {
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await moveProvisionToConfirm({ monthlyBillingId, notes });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700">
              ✅ Move to TDS Confirmed
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-sm text-gray-500">
            This will move the TDS Provision entry to TDS Confirmed. Add an optional note below.
          </p>
          {error && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
              <span>⚠️</span> {error}
            </div>
          )}
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. first testing of prov to confirm"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors text-gray-800 placeholder-gray-400"
            />
          </div>
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg text-sm font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white bg-blue-500 hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Moving…
                </>
              ) : '✅ Confirm Move'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── LedgerTable ──────────────────────────────────────────────────────────────
function LedgerTable({ entries, isEditMode, monthlyBillingId, onRefresh, onEditEntry }) {
  const [showMoveFor, setShowMoveFor] = useState(null);

  const filteredEntries = entries?.filter(
    (e) =>
      !(
        (e.type ?? e.transactionType) === 'TDS_PROVISION' &&
        Number(e.totalAmount ?? 0) === 0
      )
  );

  if (!filteredEntries?.length)
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm py-12 flex flex-col items-center gap-2">
        <span className="text-3xl">📭</span>
        <p className="text-gray-500 text-sm font-semibold">No entries yet</p>
        <p className="text-gray-400 text-xs">Submitted entries will appear here.</p>
      </div>
    );

  return (
    <>
      {showMoveFor && (
        <MoveModal
          monthlyBillingId={monthlyBillingId}
          onClose={() => setShowMoveFor(null)}
          onSuccess={() => { setShowMoveFor(null); onRefresh(); }}
        />
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm font-bold text-gray-700">Ledger Entries</p>
          <span className="text-xs text-gray-400 font-medium">
            {entries.length} record{entries.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Date', 'Type', 'Sub Type', 'Basic Amt', 'GST', 'Total Amt', 'Notes', ...(isEditMode ? ['Actions'] : [])].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((e, i) => {
                const cfg = getTypeConfig(e.type ?? e.transactionType);
                const date = e.transactionDate ? e.transactionDate.split('T')[0] : (e.date ?? '—');
                const gst = (e.igst ?? 0) + (e.cgst ?? 0) + (e.sgst ?? 0);
                const isTdsProvision = (e.type ?? e.transactionType) === 'TDS_PROVISION';

                return (
                  <tr key={e._id ?? i} className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3 text-gray-600 text-xs font-medium whitespace-nowrap">{date}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${cfg.badge}`}>
                        {cfg.icon} {e.type ?? e.transactionType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{e.subType ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-800 font-bold text-sm tabular-nums">{fmtINR(e.basicAmount ?? e.amount)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs tabular-nums">  {(e.type === 'OPENING_ADJUSTMENT')
                      ? '—' : gst > 0 ? fmtINR(gst) : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-800 font-semibold text-sm tabular-nums">{fmtINR(e.totalAmount)}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs max-w-[180px] truncate">{e.notes ?? '—'}</td>

                    {isEditMode && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {(e.type !== 'OPENING_ADJUSTMENT') && (
                            <button
                              onClick={() => onEditEntry(e)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors whitespace-nowrap"
                            >
                              ✏️ Edit
                            </button>
                          )}

                          {isTdsProvision && (
                            <button
                              onClick={() => setShowMoveFor(e._id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors whitespace-nowrap"
                            >
                              ✅ Move
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ─── TransactionTypePills ─────────────────────────────────────────────────────
// In edit mode: all types shown but non-selected ones are disabled (locked to current type)
// In add mode: TDS_CONFIRMED excluded
function TransactionTypePills({ selected, onChange, isEditMode }) {
  const typesToShow = isEditMode ? TRANSACTION_TYPES : FORM_TRANSACTION_TYPES;

  return (
    <div className="flex flex-wrap gap-2">
      {typesToShow.map((t) => {
        const active = selected === t.value;
        const isLocked = isEditMode && !active; // in edit mode, only the selected type is clickable

        return (
          <button
            key={t.value}
            type="button"
            disabled={isLocked}
            onClick={() => !isLocked && onChange(t.value)}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-150 ${active
              ? t.pillActive
              : isLocked
                ? t.pillDisabled
                : t.pill
              }`}
          >
            <span className="text-base leading-none">{t.icon}</span>
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── CreditNoteAmountBadge ────────────────────────────────────────────────────
function CreditNoteAmountBadge({ loading, data, error }) {
  if (loading)
    return (
      <div className="col-span-full flex items-center gap-2 px-4 py-2.5 bg-cyan-50 border border-cyan-200 rounded-xl text-sm text-cyan-600 animate-pulse">
        <svg className="animate-spin w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        Fetching amount for selected period…
      </div>
    );

  if (error)
    return (
      <div className="col-span-full flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
        <span>⚠️</span> {error}
      </div>
    );

  if (!data || data.amount == null) return null;
  const hasGST = data.totalGST != null && data.totalGST > 0;

  return (
    <div className="col-span-full rounded-xl border border-cyan-200 bg-cyan-50 overflow-hidden">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 border-b border-cyan-100">
        <div>
          <p className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-0.5">Basic Amount</p>
          <p className="text-xl font-extrabold text-cyan-700 tabular-nums leading-tight">{fmtINR(data.amount)}</p>
        </div>
        {hasGST && (
          <>
            <div className="text-cyan-300 text-lg font-light hidden sm:block">+</div>
            <div>
              <p className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-0.5">GST</p>
              <p className="text-xl font-extrabold text-cyan-700 tabular-nums leading-tight">{fmtINR(data.totalGST)}</p>
            </div>
            <div className="text-cyan-300 text-lg font-light hidden sm:block">=</div>
            <div>
              <p className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-0.5">Total Amount</p>
              <p className="text-xl font-extrabold text-cyan-800 tabular-nums leading-tight">{fmtINR(data.totalAmount)}</p>
            </div>
          </>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2 px-4 py-2">
        {data.selectedDays != null && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white border border-cyan-200 text-cyan-600">
            📅 {data.selectedDays} selected day{data.selectedDays !== 1 ? 's' : ''}
          </span>
        )}
        {data.billingDays != null && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white border border-cyan-200 text-cyan-600">
            🗓 {data.billingDays} billing day{data.billingDays !== 1 ? 's' : ''}
          </span>
        )}
        {data.cgst != null && data.cgst > 0 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white border border-cyan-200 text-cyan-600">
            CGST {fmtINR(data.cgst)}
          </span>
        )}
        {data.sgst != null && data.sgst > 0 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white border border-cyan-200 text-cyan-600">
            SGST {fmtINR(data.sgst)}
          </span>
        )}
        {data.igst != null && data.igst > 0 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white border border-cyan-200 text-cyan-600">
            IGST {fmtINR(data.igst)}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── EntryForm ───────────────────────────────────────────────────────────────
// editingEntry: the ledger row object being edited, or null for "add" mode
function EntryForm({ monthlyBillingId, isEditMode, onSuccess, monthBounds, editingEntry, onCancelEdit, formRef }) {
  const defaultDate = monthBounds?.minDate ?? todayISO();
  const isEditing = !!editingEntry;

  const blankForm = () => ({
    transactionType: 'PAYMENT',
    date: defaultDate,
    periodStart: '',
    periodEnd: '',
    subType: 'MANUAL_ADJUSTMENT',
    basicAmount: '',
    notes: '',
  });

  const [form, setForm] = useState(blankForm());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [cnData, setCnData] = useState(null);
  const [cnError, setCnError] = useState('');
  const [cnLoading, setCnLoading] = useState(false);
  const debounceRef = useRef(null);

  // ── Populate form when editingEntry changes ───────────────────────────────
  useEffect(() => {
    if (editingEntry) {
      const rawDate =
        (editingEntry.transactionDate ?? editingEntry.date ?? '').split('T')[0] || defaultDate;
      const periodStart =
        editingEntry.transactionPeriod?.start
          ? editingEntry.transactionPeriod.start.split('T')[0]
          : '';
      const periodEnd =
        editingEntry.transactionPeriod?.end
          ? editingEntry.transactionPeriod.end.split('T')[0]
          : '';

      setForm({
        transactionType: editingEntry.type ?? editingEntry.transactionType ?? 'PAYMENT',
        date: rawDate,
        periodStart,
        periodEnd,
        subType: editingEntry.subType ?? 'MANUAL_ADJUSTMENT',
        basicAmount: String(editingEntry.basicAmount ?? editingEntry.amount ?? ''),
        notes: editingEntry.notes ?? '',
      });
      setError('');
      setSuccess('');
      setCnData(null);
      setCnError('');
    } else {
      setForm((p) => ({ ...blankForm(), date: defaultDate }));
      setError('');
      setSuccess('');
      setCnData(null);
      setCnError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingEntry, defaultDate]);

  // Reset date when monthBounds changes (add mode only)
  useEffect(() => {
    if (!editingEntry) {
      setForm((p) => ({ ...p, date: defaultDate, periodStart: '', periodEnd: '' }));
    }
  }, [defaultDate, editingEntry]);

  // ── Credit Note auto-fetch ────────────────────────────────────────────────
  useEffect(() => {
    const isCreditNote = form.transactionType === 'CREDIT_NOTE';
    if (!isCreditNote || !form.periodStart || !form.periodEnd) {
      setCnData(null);
      setCnError('');
      if (isCreditNote && !isEditing) setForm((p) => ({ ...p, basicAmount: '' }));
      return;
    }
    if (form.periodEnd < form.periodStart) {
      setCnData(null);
      setCnError('Period End must be on or after Period Start.');
      if (!isEditing) setForm((p) => ({ ...p, basicAmount: '' }));
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setCnLoading(true);
      setCnError('');
      setCnData(null);
      try {
        const result = await fetchCreditNoteAmount({
          startDate: form.periodStart,
          endDate: form.periodEnd,
          monthlyBillingId,
        });
        setCnData(result);
        if (result.amount != null && !isEditing) {
          setForm((p) => ({ ...p, basicAmount: String(result.amount) }));
        }
      } catch (err) {
        setCnError(err.message);
        if (!isEditing) setForm((p) => ({ ...p, basicAmount: '' }));
      } finally {
        setCnLoading(false);
      }
    }, 400);

    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.transactionType, form.periodStart, form.periodEnd, monthlyBillingId]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const cfg = getTypeConfig(form.transactionType);

  const isMonthScoped = MONTH_SCOPED_TYPES.includes(form.transactionType);
  const isCreditNote = form.transactionType === 'CREDIT_NOTE';
  const dateAttrs = monthBounds ? { min: monthBounds.minDate, max: monthBounds.maxDate } : {};

  const handleTypeChange = (v) => {
    if (isEditing) return; // locked in edit mode
    setCnData(null);
    setCnError('');
    setForm((p) => ({ ...p, transactionType: v, date: defaultDate, periodStart: '', periodEnd: '', basicAmount: '' }));
  };

  const buildAddPayload = () => {
    let periodStart = form.periodStart;
    let periodEnd = form.periodEnd;
    if (isMonthScoped) {
      const bounds = getMonthBounds(form.date);
      periodStart = bounds.start;
      periodEnd = bounds.end;
    }
    const date = isCreditNote ? form.periodStart : form.date;
    const payload = {
      monthlyBillingId,
      transactionType: form.transactionType,
      date,
      subType: form.subType,
      ...(form.notes ? { notes: form.notes } : {}),
    };
    if (periodStart && periodEnd) payload.transactionPeriod = { start: periodStart, end: periodEnd };
    payload.basicAmount = Number(form.basicAmount);
    return payload;
  };

  const buildEditPayload = () => ({
    basicAmount: Number(form.basicAmount),
    notes: form.notes,
    subType: form.subType,
    date: form.date,
    ...(form.periodStart && form.periodEnd
      ? { transactionPeriod: { start: form.periodStart, end: form.periodEnd } }
      : {}),
  });

  const validate = () => {
    if (!form.basicAmount || isNaN(Number(form.basicAmount))) return 'Enter a valid basic amount.';
    if (isCreditNote) {
      if (!form.periodStart) return 'Period Start is required for Credit Note.';
      if (!form.periodEnd) return 'Period End is required for Credit Note.';
      if (form.periodEnd < form.periodStart) return 'Period End must be on or after Period Start.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    const err = validate();
    if (err) { setError(err); return; }
    setSubmitting(true);
    try {
      if (isEditing) {
        await putLedgerEntry(editingEntry._id, buildEditPayload());
        setSuccess('Entry updated successfully!');
        onCancelEdit?.(); // exit edit mode
      } else {
        await postLedgerEntry(buildAddPayload());
        setSuccess('Entry submitted successfully!');
        setCnData(null);
        setForm({ ...blankForm(), date: defaultDate });
      }
      onSuccess?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isEditMode) return null;

  const inp = `w-full px-3 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 transition-colors text-gray-800 placeholder-gray-400 ${cfg.inputBorder}`;
  const inpNeutral = `w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors text-gray-800 placeholder-gray-400`;

  return (
    <div ref={formRef} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${isEditing ? 'border-amber-300 ring-2 ring-amber-100' : 'border-gray-200'}`}>
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {isEditing && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
              ✏️ Editing Entry
            </span>
          )}
          <p className="text-sm font-bold text-gray-700">
            {isEditing ? 'Update Entry' : 'Add New Entry'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {monthBounds && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              📅 {monthBounds.label} only
            </span>
          )}
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${cfg.badge}`}>
            {cfg.icon} {cfg.label}
          </span>
          {isEditing && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
            >
              ✕ Cancel Edit
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-5">
        {error && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
            <span>⚠️</span> {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg">
            <span>✅</span> {success}
          </div>
        )}

        {/* Transaction Type Pills */}
        <div>
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">
            Transaction Type
            {isEditing && (
              <span className="ml-2 normal-case font-normal text-amber-400">(locked while editing)</span>
            )}
          </label>
          <TransactionTypePills
            selected={form.transactionType}
            onChange={handleTypeChange}
            isEditMode={isEditing}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Sub Type */}
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">
              Sub Type
            </label>
            <select value={form.subType} onChange={(e) => set('subType', e.target.value)} className={inp}>
              {SUB_TYPES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Date — shown for month-scoped types OR in edit mode */}
          {(isMonthScoped || isEditing) && (
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">
                Date *{' '}
                {isMonthScoped && !isEditing && (
                  <span className="normal-case font-normal text-gray-300">(auto fills month period)</span>
                )}
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => set('date', e.target.value)}
                required
                {...(!isEditing ? dateAttrs : {})}
                className={inp}
              />
              {isMonthScoped && !isEditing && form.date && (() => {
                const { start, end } = getMonthBounds(form.date);
                return (
                  <p className="mt-1 text-[11px] text-gray-400">
                    Period: <span className="font-semibold text-gray-500">{start}</span>{' → '}
                    <span className="font-semibold text-gray-500">{end}</span>
                  </p>
                );
              })()}
            </div>
          )}

          {/* Basic Amount */}
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">
              Basic Amount *
              {isCreditNote && cnLoading && (
                <span className="normal-case font-normal text-cyan-400 ml-1">(fetching…)</span>
              )}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">₹</span>
              <input
                type="text"
                value={
                  form.basicAmount
                    ? Number(String(form.basicAmount).replace(/,/g, '')).toLocaleString('en-IN')
                    : ''
                }
                onChange={(e) =>
                  set(
                    'basicAmount',
                    e.target.value.replace(/,/g, '')
                  )
                }
                placeholder="0.00"
                required
                readOnly={isCreditNote && cnData?.amount != null && !isEditing}
                className={`${inp} pl-7 ${isCreditNote && cnData?.amount != null && !isEditing
                    ? 'bg-cyan-50 cursor-not-allowed'
                    : ''
                  }`}
              />
            </div>
            {isCreditNote && cnData?.amount != null && !isEditing && (
              <p className="mt-1 text-[11px] text-cyan-500 font-semibold">✅ Auto-filled from period calculation</p>
            )}
          </div>

          {/* Period Start — Credit Note */}
          {isCreditNote && (
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">
                Period Start <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={form.periodStart}
                onChange={(e) => set('periodStart', e.target.value)}
                required
                {...(!isEditing ? dateAttrs : {})}
                className={inp}
              />
            </div>
          )}

          {/* Period End — Credit Note */}
          {isCreditNote && (
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">
                Period End <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={form.periodEnd}
                onChange={(e) => set('periodEnd', e.target.value)}
                required
                {...(!isEditing ? dateAttrs : {})}
                className={inp}
              />
            </div>
          )}

          {/* Credit Note amount badge */}
          {isCreditNote && (
            <CreditNoteAmountBadge loading={cnLoading} data={cnData} error={cnError} />
          )}

          {/* Notes */}
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">
              Notes
            </label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Optional…"
              className={inpNeutral}
            />
          </div>
        </div>

        {/* Submit / Update */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className={`inline-flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed ${cfg.btnBg}`}
          >
            {submitting ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                {isEditing ? 'Updating…' : 'Submitting…'}
              </>
            ) : isEditing ? (
              `✏️ Update ${cfg.label}`
            ) : (
              `${cfg.icon} Submit ${cfg.label}`
            )}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-4 py-2 rounded-lg text-sm font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

// ─── BillPanel ────────────────────────────────────────────────────────────────
function BillPanel({ billId, isEditMode, monthBounds }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null); // row being edited

  const formRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const json = await fetchStatement(billId);
      setEntries(extractEntries(json));
      setSummary(extractSummary(json));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [billId]);

  useEffect(() => { load(); }, [load]);

  // Scroll to form when edit starts
  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleCancelEdit = () => setEditingEntry(null);

  if (loading)
    return (
      <div className="space-y-3">
        <Skeleton h="h-12" />
        <Skeleton h="h-32" />
        <Skeleton h="h-40" />
        <Skeleton h="h-56" />
      </div>
    );

  if (error)
    return (
      <div className="bg-white rounded-2xl border border-red-200 p-5 flex items-start gap-3 text-sm text-red-600">
        <span className="text-xl">⚠️</span>
        <div>
          <p className="font-bold mb-1">Failed to load</p>
          <p className="text-red-400 mb-3">{error}</p>
          <button onClick={load} className="px-4 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-colors">
            Retry
          </button>
        </div>
      </div>
    );

  return (
    <div className="space-y-4">
      <EntryForm
        monthlyBillingId={billId}
        isEditMode={isEditMode}
        onSuccess={load}
        monthBounds={monthBounds}
        editingEntry={editingEntry}
        onCancelEdit={handleCancelEdit}
        formRef={formRef}
      />
      <SummaryBar summary={summary} />
      <LedgerTable
        entries={entries}
        isEditMode={isEditMode}
        monthlyBillingId={billId}
        onRefresh={load}
        onEditEntry={handleEditEntry}
      />
    </div>
  );
}

// ─── Bill Tabs ────────────────────────────────────────────────────────────────
function BillTabs({ billIds, activeTab, setActiveTab }) {
  if (billIds.length < 2) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {billIds.map((id, i) => (
        <button
          key={id}
          onClick={() => setActiveTab(i)}
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all border ${activeTab === i
            ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
            : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700'
            }`}
        >
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${activeTab === i ? 'bg-white text-gray-900' : 'bg-gray-100 text-gray-500'}`}>
            {i + 1}
          </span>
          Bill {i + 1}
          <span className={`font-mono text-[11px] ${activeTab === i ? 'text-gray-400' : 'text-gray-300'}`}>
            …{id.slice(-5)}
          </span>
        </button>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const LedgerUpdateEntry = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const mode = searchParams.get('mode') ?? 'view';
  const billIdsRaw = searchParams.get('billIds') ?? '';
  const month = searchParams.get('month') ?? '';

  const billIds = billIdsRaw.split(',').map((s) => s.trim()).filter(Boolean);
  const isEditMode = mode === 'edit';
  const monthBounds = parseMonthParam(month);

  const [activeTab, setActiveTab] = useState(0);
  useEffect(() => { setActiveTab(0); }, [billIdsRaw]);

  if (!billIds.length)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center max-w-xs">
          <div className="text-4xl mb-3">📄</div>
          <p className="font-bold text-gray-700 mb-1">No Bill IDs</p>
          <p className="text-gray-400 text-sm">
            Add <code className="bg-gray-100 px-1 rounded font-mono text-xs">?billIds=</code> to the URL.
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              aria-label="Go back"
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm text-gray-500 hover:text-gray-800 hover:border-gray-300 transition-all"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <div>
              <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-widest leading-none mb-0.5">
                Billing / Ledger
              </p>
              <h1 className="text-lg font-extrabold text-gray-800 leading-tight">
                {month ? `${month} — Ledger Entry` : 'Ledger Entry'}
              </h1>
            </div>
          </div>

          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${isEditMode ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-gray-100 text-gray-500 border-gray-200'
            }`}>
            <span className="w-1.5 h-1.5 rounded-full inline-block bg-current opacity-80" />
            {isEditMode ? 'Edit Mode' : 'View Mode'}
          </span>
        </div>

        <BillTabs billIds={billIds} activeTab={activeTab} setActiveTab={setActiveTab}/>

        <BillPanel
          key={billIds[activeTab]}
          billId={billIds[activeTab]}
          isEditMode={isEditMode}
          monthBounds={monthBounds}
        />
      </div>
    </div>
  );
};

export default LedgerUpdateEntry;