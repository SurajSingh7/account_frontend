'use client';


import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { API_BACKEND_URL } from '@/config/getEnvVariables';


// ─── Constants ────────────────────────────────────────────────────────────────
const TRANSACTION_TYPES = [
  {
    value: 'PAYMENT',
    label: 'Payment',
    icon: '💰',
    pill: 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100',
    pillActive: 'bg-emerald-500 text-white border border-emerald-500 shadow-sm',
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
    badge: 'bg-orange-100 text-orange-700',
    inputBorder: 'border-orange-300 focus:ring-orange-300',
    btnBg: 'bg-orange-500 hover:bg-orange-600',
  },
];


const SUB_TYPES = [
  { value: 'MANUAL_ADJUSTMENT', label: 'Manual Adjustment' },
  { value: 'ADVANCE',           label: 'Advance' },
  { value: 'REVERSAL',          label: 'Reversal' },
  { value: 'PENALTY',           label: 'Penalty' },
];


const MONTH_SCOPED_TYPES = ['PAYMENT', 'TDS_CONFIRMED', 'TDS_PROVISION', 'MISC_CHARGE'];


// ─── Helpers ──────────────────────────────────────────────────────────────────
const todayISO      = () => new Date().toISOString().split('T')[0];
const getTypeConfig = (v) => TRANSACTION_TYPES.find((t) => t.value === v) ?? TRANSACTION_TYPES[0];
const fmtINR        = (v) =>
  v != null ? `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—';


function getMonthBounds(dateStr) {
  if (!dateStr) return { start: '', end: '' };
  const [year, month] = dateStr.split('-').map(Number);
  const start   = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end     = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { start, end };
}


const MONTH_NAME_MAP = {
  jan: 1, feb: 2, mar: 3, apr: 4,  may: 5,  jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};
function parseMonthParam(monthStr) {
  if (!monthStr) return null;
  let year, month;


  const mmmYYYY = monthStr.match(/^([a-zA-Z]{3})-(\d{4})$/);
  if (mmmYYYY) {
    month = MONTH_NAME_MAP[mmmYYYY[1].toLowerCase()];
    year  = parseInt(mmmYYYY[2], 10);
  }
  if (!month) {
    const iso = monthStr.match(/^(\d{4})-(\d{2})/);
    if (iso) {
      year  = parseInt(iso[1], 10);
      month = parseInt(iso[2], 10);
    }
  }
  if (!year || !month || month < 1 || month > 12) return null;


  const mm      = String(month).padStart(2, '0');
  const minDate = `${year}-${mm}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const maxDate = `${year}-${mm}-${String(lastDay).padStart(2, '0')}`;
  const label   = new Date(year, month - 1, 1).toLocaleString('en-IN', {
    month: 'long', year: 'numeric',
  });
  return { minDate, maxDate, label };
}


function extractEntries(raw) {
  if (!raw) return [];
  if (Array.isArray(raw))                return raw;
  if (Array.isArray(raw.entries))        return raw.entries;
  if (Array.isArray(raw.ledgerEntries))  return raw.ledgerEntries;
  if (raw._id)                           return [raw];
  return [];
}


// ─── API ──────────────────────────────────────────────────────────────────────
const apiHeaders = () => ({ 'Content-Type': 'application/json' });


async function fetchStatement(billId) {
  const res = await fetch(
    `${API_BACKEND_URL}/billing/sale/ledger/statement/${billId}`,
    { method: 'GET', headers: apiHeaders(), credentials: 'include' },
  );
  if (!res.ok) throw new Error(`Failed to load (${res.status})`);
  return res.json();
}


async function postLedgerEntry(payload) {
  const res = await fetch(`${API_BACKEND_URL}/billing/sale/ledger/entry`, {
    method: 'POST', headers: apiHeaders(), credentials: 'include',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.message || `Submit failed (${res.status})`);
  }
  return res.json();
}


// ─── Credit Note period-amount API ───────────────────────────────────────────
async function fetchCreditNoteAmount({ startDate, endDate, monthlyBillingId }) {
  const res = await fetch(`${API_BACKEND_URL}/billing/sale/ledger/amount-period`, {
    method: 'POST',
    headers: apiHeaders(),
    credentials: 'include',
    body: JSON.stringify({ startDate, endDate, monthlyBillingId }),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.message || `Amount lookup failed (${res.status})`);
  }
  const json = await res.json();
  const d = json?.data ?? json;
  const amount =
    d?.basicAmount   ??
    d?.totalAmount   ??
    d?.amount        ??
    null;
  return {
    amount,
    selectedDays: d?.selectedDays ?? null,
    billingDays:  d?.billingDays  ?? null,
    cgst:         d?.cgst         ?? null,
    sgst:         d?.sgst         ?? null,
    igst:         d?.igst         ?? null,
    totalGST:     d?.totalGST     ?? null,
    totalAmount:  d?.totalAmount  ?? null,
  };
}


// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ h = 'h-10', w = 'w-full' }) {
  return <div className={`${h} ${w} rounded-lg bg-gray-100 animate-pulse`} />;
}


// ─── LedgerTable ──────────────────────────────────────────────────────────────
function LedgerTable({ entries }) {
  if (!entries?.length)
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm py-12 flex flex-col items-center gap-2">
        <span className="text-3xl">📭</span>
        <p className="text-gray-500 text-sm font-semibold">No entries yet</p>
        <p className="text-gray-400 text-xs">Submitted entries will appear here.</p>
      </div>
    );


  return (
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
              {['Date', 'Type', 'Sub Type', 'Amount', 'Notes'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => {
              const cfg  = getTypeConfig(e.type ?? e.transactionType);
              const date = e.transactionDate
                ? e.transactionDate.split('T')[0]
                : (e.date ?? '—');
              return (
                <tr
                  key={e._id ?? i}
                  className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors"
                >
                  <td className="px-4 py-3 text-gray-600 text-xs font-medium whitespace-nowrap">
                    {date}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${cfg.badge}`}>
                      {cfg.icon} {e.type ?? e.transactionType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{e.subType ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-800 font-bold text-sm tabular-nums">
                    {fmtINR(e.basicAmount ?? e.amount)}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs max-w-[180px] truncate">
                    {e.notes ?? '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}


// ─── TransactionTypePills ─────────────────────────────────────────────────────
function TransactionTypePills({ selected, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {TRANSACTION_TYPES.map((t) => {
        const active = selected === t.value;
        return (
          <button
            key={t.value}
            type="button"
            onClick={() => onChange(t.value)}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-150 ${
              active ? t.pillActive : t.pill
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
          <p className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-0.5">
            Basic Amount
          </p>
          <p className="text-xl font-extrabold text-cyan-700 tabular-nums leading-tight">
            {fmtINR(data.amount)}
          </p>
        </div>
        {hasGST && (
          <>
            <div className="text-cyan-300 text-lg font-light hidden sm:block">+</div>
            <div>
              <p className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-0.5">
                GST
              </p>
              <p className="text-xl font-extrabold text-cyan-700 tabular-nums leading-tight">
                {fmtINR(data.totalGST)}
              </p>
            </div>
            <div className="text-cyan-300 text-lg font-light hidden sm:block">=</div>
            <div>
              <p className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-0.5">
                Total Amount
              </p>
              <p className="text-xl font-extrabold text-cyan-800 tabular-nums leading-tight">
                {fmtINR(data.totalAmount)}
              </p>
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


// ─── EntryForm ────────────────────────────────────────────────────────────────
function EntryForm({ monthlyBillingId, isEditMode, onSuccess, monthBounds }) {
  const defaultDate = monthBounds?.minDate ?? todayISO();


  const [form, setForm] = useState({
    transactionType: 'PAYMENT',
    date:            defaultDate,
    periodStart:     '',
    periodEnd:       '',
    subType:         'MANUAL_ADJUSTMENT',
    basicAmount:     '',
    notes:           '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState('');


  const [cnData,    setCnData]    = useState(null);
  const [cnError,   setCnError]   = useState('');
  const [cnLoading, setCnLoading] = useState(false);
  const debounceRef = useRef(null);


  useEffect(() => {
    setForm((p) => ({ ...p, date: defaultDate, periodStart: '', periodEnd: '' }));
  }, [defaultDate]);


  // ── Auto-fetch when CREDIT_NOTE + both period dates are valid ──────────────
  useEffect(() => {
    const isCreditNote = form.transactionType === 'CREDIT_NOTE';
    if (!isCreditNote || !form.periodStart || !form.periodEnd) {
      setCnData(null);
      setCnError('');
      // ✅ FIX: Reset basicAmount when period is cleared
      if (isCreditNote) {
        setForm((p) => ({ ...p, basicAmount: '' }));
      }
      return;
    }
    if (form.periodEnd < form.periodStart) {
      setCnData(null);
      setCnError('Period End must be on or after Period Start.');
      // ✅ FIX: Reset basicAmount on invalid range
      setForm((p) => ({ ...p, basicAmount: '' }));
      return;
    }


    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setCnLoading(true);
      setCnError('');
      setCnData(null);
      try {
        const result = await fetchCreditNoteAmount({
          startDate:        form.periodStart,
          endDate:          form.periodEnd,
          monthlyBillingId,
        });
        setCnData(result);
        // ✅ FIX: Auto-fill basicAmount from fetched credit note amount
        if (result.amount != null) {
          setForm((p) => ({ ...p, basicAmount: String(result.amount) }));
        }
      } catch (err) {
        setCnError(err.message);
        // ✅ FIX: Reset basicAmount on fetch error
        setForm((p) => ({ ...p, basicAmount: '' }));
      } finally {
        setCnLoading(false);
      }
    }, 400);


    return () => clearTimeout(debounceRef.current);
  }, [form.transactionType, form.periodStart, form.periodEnd, monthlyBillingId]);


  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const cfg = getTypeConfig(form.transactionType);


  const isMonthScoped = MONTH_SCOPED_TYPES.includes(form.transactionType);
  const isCreditNote  = form.transactionType === 'CREDIT_NOTE';


  const dateAttrs = monthBounds
    ? { min: monthBounds.minDate, max: monthBounds.maxDate }
    : {};


  const handleTypeChange = (v) => {
    setCnData(null);
    setCnError('');
    setForm((p) => ({
      ...p,
      transactionType: v,
      date:            defaultDate,
      periodStart:     '',
      periodEnd:       '',
      basicAmount:     '',
    }));
  };


  const buildPayload = () => {
    let periodStart = form.periodStart;
    let periodEnd   = form.periodEnd;


    if (isMonthScoped) {
      const bounds = getMonthBounds(form.date);
      periodStart  = bounds.start;
      periodEnd    = bounds.end;
    }


    const date = isCreditNote ? form.periodStart : form.date;


    const payload = {
      monthlyBillingId,
      transactionType: form.transactionType,
      date,
      subType: form.subType,
      ...(form.notes ? { notes: form.notes } : {}),
    };


    if (periodStart && periodEnd) {
      payload.transactionPeriod = { start: periodStart, end: periodEnd };
    }
    // ✅ FIX: basicAmount is now always sent (including for CREDIT_NOTE)
    payload.basicAmount = Number(form.basicAmount);

    return payload;
  };


  const validate = () => {
    if (!form.basicAmount || isNaN(Number(form.basicAmount)))
      return 'Enter a valid basic amount.';
    if (isCreditNote) {
      if (!form.periodStart) return 'Period Start is required for Credit Note.';
      if (!form.periodEnd)   return 'Period End is required for Credit Note.';
      if (form.periodEnd < form.periodStart)
        return 'Period End must be on or after Period Start.';
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
      await postLedgerEntry(buildPayload());
      setSuccess('Entry submitted successfully!');
      setCnData(null);
      setForm((p) => ({
        ...p,
        basicAmount: '',
        notes:       '',
        periodStart: '',
        periodEnd:   '',
        date:        defaultDate,
      }));
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
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm font-bold text-gray-700">Add New Entry</p>
        <div className="flex items-center gap-2 flex-wrap">
          {monthBounds && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              📅 {monthBounds.label} only
            </span>
          )}
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${cfg.badge}`}>
            {cfg.icon} {cfg.label}
          </span>
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


        <div>
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">
            Transaction Type
          </label>
          <TransactionTypePills selected={form.transactionType} onChange={handleTypeChange} />
        </div>


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">


          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">
              Sub Type
            </label>
            <select
              value={form.subType}
              onChange={(e) => set('subType', e.target.value)}
              className={inp}
            >
              {SUB_TYPES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>


          {isMonthScoped && (
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">
                Date *{' '}
                <span className="normal-case font-normal text-gray-300">(auto fills month period)</span>
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => set('date', e.target.value)}
                required
                {...dateAttrs}
                className={inp}
              />
              {form.date && (() => {
                const { start, end } = getMonthBounds(form.date);
                return (
                  <p className="mt-1 text-[11px] text-gray-400">
                    Period:{' '}
                    <span className="font-semibold text-gray-500">{start}</span>
                    {' → '}
                    <span className="font-semibold text-gray-500">{end}</span>
                  </p>
                );
              })()}
            </div>
          )}


          {/* ✅ FIX: basicAmount field shown for ALL types including CREDIT_NOTE */}
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">
              Basic Amount *
              {isCreditNote && cnLoading && (
                <span className="normal-case font-normal text-cyan-400 ml-1">(fetching…)</span>
              )}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">
                ₹
              </span>
              <input
                type="number"
                value={form.basicAmount}
                onChange={(e) => set('basicAmount', e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
                // ✅ FIX: Make read-only when auto-filled from credit note API
                readOnly={isCreditNote && cnData?.amount != null}
                className={`${inp} pl-7 ${isCreditNote && cnData?.amount != null ? 'bg-cyan-50 cursor-not-allowed' : ''}`}
              />
            </div>
            {isCreditNote && cnData?.amount != null && (
              <p className="mt-1 text-[11px] text-cyan-500 font-semibold">
                ✅ Auto-filled from period calculation
              </p>
            )}
          </div>


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
                {...dateAttrs}
                className={inp}
              />
            </div>
          )}


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
                {...dateAttrs}
                className={inp}
              />
            </div>
          )}


          {isCreditNote && (
            <CreditNoteAmountBadge
              loading={cnLoading}
              data={cnData}
              error={cnError}
            />
          )}


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
              Submitting…
            </>
          ) : (
            <>{cfg.icon} Submit {cfg.label}</>
          )}
        </button>
      </form>
    </div>
  );
}


// ─── BillPanel ────────────────────────────────────────────────────────────────
function BillPanel({ billId, isEditMode, monthBounds }) {
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [entries, setEntries] = useState([]);


  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchStatement(billId);
      const raw = res?.data ?? res;
      setEntries(extractEntries(raw));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [billId]);


  useEffect(() => { load(); }, [load]);


  if (loading)
    return (
      <div className="space-y-3">
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
          <button
            onClick={load}
            className="px-4 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-colors"
          >
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
      />
      <LedgerTable entries={entries} />
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
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all border ${
            activeTab === i
              ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
              : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700'
          }`}
        >
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
            activeTab === i ? 'bg-white text-gray-900' : 'bg-gray-100 text-gray-500'
          }`}>
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
  const router       = useRouter();


  const mode       = searchParams.get('mode')    ?? 'view';
  const billIdsRaw = searchParams.get('billIds') ?? '';
  const month      = searchParams.get('month')   ?? '';


  const billIds     = billIdsRaw.split(',').map((s) => s.trim()).filter(Boolean);
  const isEditMode  = mode === 'edit';
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
            Add{' '}
            <code className="bg-gray-100 px-1 rounded font-mono text-xs">?billIds=</code>
            {' '}to the URL.
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
              <svg
                width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"
              >
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


          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
            isEditMode
              ? 'bg-blue-50 text-blue-600 border-blue-200'
              : 'bg-gray-100 text-gray-500 border-gray-200'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full inline-block bg-current opacity-80" />
            {isEditMode ? 'Edit Mode' : 'View Mode'}
          </span>
        </div>


        <BillTabs billIds={billIds} activeTab={activeTab} setActiveTab={setActiveTab} />


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