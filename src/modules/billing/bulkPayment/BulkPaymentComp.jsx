'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { API_BACKEND_URL } from '@/config/getEnvVariables';
import toast from 'react-hot-toast';
import {
  Search, ChevronDown, Building2, Loader2, IndianRupee,
  CheckCircle2, AlertCircle, Send, X, CreditCard, Wallet, Smartphone,
  Building, Zap, PenLine, RotateCcw, Eye,
} from 'lucide-react';

// ─── Utilities ────────────────────────────────────────────────────────────────

const fmt = (n) =>
  (n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const PAYMENT_METHODS = [
  { value: 'NEFT',   label: 'NEFT',   icon: Building   },
  { value: 'CHEQUE', label: 'Cheque', icon: CreditCard  },
  { value: 'CASH',   label: 'Cash',   icon: Wallet      },
  { value: 'UPI',    label: 'UPI',    icon: Smartphone  },
];

const DIST_MODES = [
  { value: 'AUTO',   label: 'Auto Split', icon: Zap     },
  { value: 'MANUAL', label: 'Manual',     icon: PenLine },
];

const getInitialPaymentForm = () => ({
  method:          'NEFT',
  paymentDate:     new Date().toISOString().split('T')[0],
  referenceNumber: '',
  bankName:        '',
  chequeNumber:    '',
  chequeDate:      '',
  receiptId:       '',
  remarks:         '',
});

// ─── Helper: format Date → "MM-YYYY" ─────────────────────────────────────────

const toMonthYear = (date) => {
  const mm   = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${mm}-${yyyy}`;
};

// ─── CompanyGroupDropdown ─────────────────────────────────────────────────────

const CompanyGroupDropdown = ({ value, onChange }) => {
  const [open, setOpen]       = useState(false);
  const [search, setSearch]   = useState('');
  const [groups, setGroups]   = useState([]);
  const [loading, setLoading] = useState(false);
  const ref                   = useRef(null);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_BACKEND_URL}/company/group/all`, { credentials: 'include' });
      const json = await res.json();
      if (json.success) setGroups(json.data || []);
    } catch { toast.error('Failed to load company groups'); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const filtered = groups.filter((g) =>
    (g.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (g.companyName || '').toLowerCase().includes(search.toLowerCase())
  );
  const selected = groups.find((g) => g._id === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm hover:border-violet-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-50 transition-all shadow-sm"
      >
        <span className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-violet-50">
            <Building2 className="h-3.5 w-3.5 text-violet-600" />
          </span>
          <span className={selected ? 'text-gray-800 font-semibold' : 'text-gray-400'}>
            {selected ? selected.name : 'Select company group...'}
          </span>
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-2.5 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-50">
              <Search className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Search company or group..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
              />
            </div>
          </div>
          <div className="overflow-y-auto max-h-[28rem]">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400">No results found</div>
            ) : (
              filtered.map((g) => (
                <button
                  key={g._id}
                  type="button"
                  onClick={() => { onChange(g._id); setOpen(false); setSearch(''); }}
                  className={`w-full flex items-center justify-between px-4 py-4 hover:bg-violet-50/60 transition-colors text-left border-b border-gray-50 last:border-0 ${value === g._id ? 'bg-violet-50' : ''}`}
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{g.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{g.companyName}</p>
                  </div>
                  {value === g._id
                    ? <CheckCircle2 className="h-4 w-4 text-violet-500 shrink-0" />
                    : <span className="text-xs font-bold bg-gray-100 text-gray-500 rounded-lg px-2.5 py-1">{g.panNumber?.slice(-4)}</span>
                  }
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── MonthYearPicker ──────────────────────────────────────────────────────────

const MonthYearPicker = ({ value, onChange, disabled }) => {
  // value is "MM-YYYY" string e.g. "09-2026"
  // native <input type="month"> uses "YYYY-MM", so we convert both ways
  const nativeValue = value
    ? `${value.split('-')[1]}-${value.split('-')[0]}`  // "MM-YYYY" → "YYYY-MM"
    : '';

  const handleChange = (e) => {
    if (!e.target.value) { onChange(''); return; }
    const [yyyy, mm] = e.target.value.split('-');
    onChange(`${mm}-${yyyy}`);                          // "YYYY-MM" → "MM-YYYY"
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-3 border rounded-xl transition-all focus-within:ring-2 ${
      disabled
        ? 'bg-gray-50 border-gray-200 cursor-not-allowed'
        : 'bg-white border-gray-200 focus-within:border-violet-400 focus-within:ring-violet-50'
    }`}>
      <input
        type="month"
        value={nativeValue}
        onChange={handleChange}
        disabled={disabled}
        className="w-full text-sm text-gray-900 font-bold outline-none bg-transparent disabled:cursor-not-allowed disabled:text-gray-400 accent-violet-600"
      />
    </div>
  );
};

// ─── PaymentDetailsPanel ──────────────────────────────────────────────────────

const PaymentDetailsPanel = ({ paymentForm, setPaymentForm, summary, manualTotalAllocated, onSubmit, submitting }) => {
  const update = (obj) => setPaymentForm((p) => ({ ...p, ...obj }));

  const handleMethodChange = (method) => {
    setPaymentForm((p) => ({
      ...p, method,
      referenceNumber: '', bankName: '', chequeNumber: '', chequeDate: '', receiptId: '',
    }));
  };

  const handleSubmit = () => {
    if (!paymentForm.method)      { toast.error('Select a payment method'); return; }
    if (!paymentForm.paymentDate) { toast.error('Enter payment date'); return; }
    if (paymentForm.method === 'NEFT') {
      if (!paymentForm.referenceNumber?.trim()) { toast.error('Reference number required'); return; }
      if (!paymentForm.bankName?.trim())        { toast.error('Bank name required'); return; }
    }
    if (paymentForm.method === 'CHEQUE') {
      if (!paymentForm.chequeNumber?.trim()) { toast.error('Cheque number required'); return; }
      if (!paymentForm.chequeDate)           { toast.error('Cheque date required'); return; }
      if (!paymentForm.bankName?.trim())     { toast.error('Bank name required'); return; }
    }
    if (paymentForm.method === 'UPI') {
      if (!paymentForm.receiptId?.trim()) { toast.error('Receipt ID required'); return; }
    }
    onSubmit();
  };

  const inputCls = "w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-50 transition-all placeholder-gray-400 text-gray-800 font-medium";
  const labelCls = "block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5";

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-6 flex flex-col gap-5 flex-1">

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5">Payment Method</label>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_METHODS.map((m) => {
              const Icon   = m.icon;
              const active = paymentForm.method === m.value;
              return (
                <button key={m.value} type="button" onClick={() => handleMethodChange(m.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    active
                      ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-200'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {paymentForm.method === 'NEFT' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Payment Date <span className="text-red-400">*</span></label>
                <input type="date" value={paymentForm.paymentDate}
                  onChange={(e) => update({ paymentDate: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Reference No. <span className="text-red-400">*</span></label>
                <input type="text" placeholder="UTR / Reference number"
                  value={paymentForm.referenceNumber} onChange={(e) => update({ referenceNumber: e.target.value })}
                  className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Bank Name <span className="text-red-400">*</span></label>
              <input type="text" placeholder="e.g. HDFC Bank"
                value={paymentForm.bankName} onChange={(e) => update({ bankName: e.target.value })}
                className={inputCls} />
            </div>
          </>
        )}

        {paymentForm.method === 'CHEQUE' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Payment Date <span className="text-red-400">*</span></label>
                <input type="date" value={paymentForm.paymentDate}
                  onChange={(e) => update({ paymentDate: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Cheque Number <span className="text-red-400">*</span></label>
                <input type="text" placeholder="e.g. 123456"
                  value={paymentForm.chequeNumber} onChange={(e) => update({ chequeNumber: e.target.value })}
                  className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Cheque Date <span className="text-red-400">*</span></label>
                <input type="date" value={paymentForm.chequeDate}
                  onChange={(e) => update({ chequeDate: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Bank Name <span className="text-red-400">*</span></label>
                <input type="text" placeholder="e.g. ICICI Bank"
                  value={paymentForm.bankName} onChange={(e) => update({ bankName: e.target.value })}
                  className={inputCls} />
              </div>
            </div>
          </>
        )}

        {paymentForm.method === 'CASH' && (
          <div>
            <label className={labelCls}>Payment Date <span className="text-red-400">*</span></label>
            <input type="date" value={paymentForm.paymentDate}
              onChange={(e) => update({ paymentDate: e.target.value })} className={inputCls} />
          </div>
        )}

        {paymentForm.method === 'UPI' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Payment Date <span className="text-red-400">*</span></label>
              <input type="date" value={paymentForm.paymentDate}
                onChange={(e) => update({ paymentDate: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Receipt ID <span className="text-red-400">*</span></label>
              <input type="text" placeholder="UPI Receipt ID"
                value={paymentForm.receiptId} onChange={(e) => update({ receiptId: e.target.value })}
                className={inputCls} />
            </div>
          </div>
        )}

        <div>
          <label className={labelCls}>Remarks</label>
          <textarea
            rows={3}
            placeholder="Optional note about this payment..."
            value={paymentForm.remarks}
            onChange={(e) => update({ remarks: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-50 transition-all placeholder-gray-400 text-gray-800 font-medium resize-none"
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-auto">
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Allocated Amount</p>
            <p className="text-lg font-bold text-emerald-600">₹{fmt(manualTotalAllocated)}</p>
            {(summary?.remainingAdvance || 0) > 0 && (
              <p className="text-xs text-amber-600 font-semibold mt-0.5">
                Advance: ₹{fmt(summary.remainingAdvance)}
              </p>
            )}
          </div>
          <button type="button" onClick={handleSubmit} disabled={submitting}
            className="flex items-center gap-2.5 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-emerald-100 hover:shadow-emerald-200"
          >
            {submitting
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
              : <><Send className="h-4 w-4" /> Submit Payment</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── StatusBadge ──────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  if (status === 'PAID') return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
      <CheckCircle2 className="h-3 w-3" /> Paid
    </span>
  );
  if (status === 'PARTIAL') return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
      <AlertCircle className="h-3 w-3" /> Partial
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
      <X className="h-3 w-3" /> Unpaid
    </span>
  );
};

// ─── OrderRow ─────────────────────────────────────────────────────────────────

const OrderRow = ({ group, manualAmounts, onManualChange, mode }) => {
  const [expanded, setExpanded] = useState(true);

  const isPrimary    = group.circuitKey?.includes('-primary');
  const isSecondary  = group.circuitKey?.includes('-secondary');
  const isSplit      = isPrimary || isSecondary;
  const circuitLabel = isPrimary ? 'Primary' : isSecondary ? 'Secondary' : null;
  const circuitColor = isPrimary
    ? 'bg-blue-100 text-blue-600 border border-blue-200'
    : 'bg-purple-100 text-purple-600 border border-purple-200';

  // ✅ totalDue = last allocation's currentOutStanding (running cumulative — last row = true total)
  const totalDue = group.allocations.length > 0
    ? (group.allocations[group.allocations.length - 1].currentOutStanding || 0)
    : 0;

  const totalAllocated = mode === 'MANUAL'
    ? group.allocations.reduce((s, a) => s + (Number(manualAmounts[a.projectionId]) || 0), 0)
    : group.totalAllocated;

  const pct      = totalDue > 0 ? Math.min(100, (totalAllocated / totalDue) * 100) : 0;
  const pctColor = pct >= 100 ? 'bg-emerald-400' : pct > 50 ? 'bg-violet-400' : 'bg-amber-400';

  const totalMonthlyBill = group.allocations.reduce((s, a) => s + (a.currentMonthBill || 0), 0);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div
        className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50/60 transition-colors"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-sm font-bold text-gray-900">{group.orderId}</span>
            {isSplit && (
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${circuitColor}`}>
                {circuitLabel}
              </span>
            )}
          </div>
          {group.company && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">{group.company}</p>
          )}
        </div>

        <div className="hidden md:flex flex-col items-end gap-1.5 w-44 shrink-0">
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${pctColor}`} style={{ width: `${pct}%` }} />
          </div>
          <span className="text-[11px] font-semibold text-gray-400">{pct.toFixed(0)}% covered</span>
        </div>

        <div className="flex items-center gap-6 shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Due</p>
            <p className="text-sm font-bold text-red-500">₹{fmt(totalDue)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Allocated</p>
            <p className="text-sm font-bold text-emerald-600">₹{fmt(totalAllocated)}</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Entries</p>
            <p className="text-sm font-bold text-gray-600">{group.totalEntries}</p>
          </div>
          <div className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200 ${expanded ? 'bg-violet-50 rotate-180' : 'bg-gray-50'}`}>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-5 py-3 text-left   text-[10px] font-bold text-gray-500 uppercase tracking-widest">Month</th>
                <th className="px-5 py-3 text-right  text-[10px] font-bold text-gray-500 uppercase tracking-widest">Monthly Bill</th>
                <th className="px-5 py-3 text-right  text-[10px] font-bold text-gray-500 uppercase tracking-widest">Outstanding</th>
                <th className="px-5 py-3 text-right  text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  {mode === 'MANUAL' ? 'Allocated (edit)' : 'Allocated'}
                </th>
                <th className="px-5 py-3 text-right  text-[10px] font-bold text-gray-500 uppercase tracking-widest">Remaining</th>
                <th className="px-5 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {group.allocations.map((alloc) => {
                const monthlyBill = alloc.currentMonthBill   || 0;
                const outstanding = alloc.currentOutStanding  || 0;
                const allocated   = alloc.allocatedAmount     || 0;
                const remaining   = alloc.remainingAfter      ?? 0;

                const manualVal        = manualAmounts[alloc.projectionId];
                const displayAllocated = mode === 'MANUAL' ? (Number(manualVal) || 0) : allocated;
                const displayRemaining = mode === 'MANUAL'
                  ? Math.max(0, outstanding - (Number(manualVal) || 0))
                  : remaining;

                const displayStatus = mode === 'MANUAL'
                  ? (() => {
                      const v = Number(manualVal) || 0;
                      if (v <= 0)                  return 'UNPAID';
                      if (v >= outstanding - 0.01) return 'PAID';
                      return 'PARTIAL';
                    })()
                  : alloc.status;

                return (
                  <tr key={alloc.projectionId} className="hover:bg-violet-50/30 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-gray-700">
                      {MONTH_NAMES[(alloc.billingMonth || 1) - 1]} {alloc.billingYear}
                    </td>
                    <td className="px-5 py-3.5 text-right text-gray-500 font-medium">₹{fmt(monthlyBill)}</td>
                    <td className="px-5 py-3.5 text-right font-bold text-red-500">₹{fmt(outstanding)}</td>
                    <td className="px-5 py-3.5 text-right">
                      {mode === 'MANUAL' ? (
                        <input
                          type="number"
                          value={manualVal ?? allocated}
                          onChange={(e) => onManualChange(alloc.projectionId, e.target.value)}
                          className="w-32 text-right text-sm font-bold text-emerald-700 border border-emerald-200 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 bg-emerald-50 transition-all"
                          min={0} step="0.01"
                        />
                      ) : (
                        <span className="font-bold text-emerald-600">₹{fmt(displayAllocated)}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right text-gray-400 font-medium">₹{fmt(displayRemaining)}</td>
                    <td className="px-5 py-3.5 text-center">
                      <StatusBadge status={displayStatus} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 border-t-2 border-gray-200">
                <td className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Total</td>
                <td className="px-5 py-3 text-right text-sm font-bold text-gray-600">
                  ₹{fmt(totalMonthlyBill)}
                </td>
                <td className="px-5 py-3 text-right text-sm font-bold text-red-500">
                  ₹{fmt(totalDue)}
                </td>
                <td className="px-5 py-3 text-right text-sm font-bold text-emerald-600">
                  ₹{fmt(totalAllocated)}
                </td>
                <td className="px-5 py-3 text-right text-sm font-bold text-gray-400">
                  ₹{fmt(Math.max(0, totalDue - totalAllocated))}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};

// ─── DistributionPanel ────────────────────────────────────────────────────────

const DistributionPanel = ({ previewData, mode, setMode, manualAmounts, setManualAmounts }) => {
  const { groupedDistributions } = previewData;

  // ✅ FIXED: init manualAmounts from groupedDistributions (not rawDistributions)
  //           so it stays in sync with the same data source used by buildAllocations
  useEffect(() => {
    if (mode === 'MANUAL' && groupedDistributions?.length) {
      const init = {};
      groupedDistributions.forEach((group) => {
        group.allocations.forEach((a) => {
          init[a.projectionId] = a.allocatedAmount;
        });
      });
      setManualAmounts(init);
    }
  }, [mode, groupedDistributions, setManualAmounts]);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mt-4">
      <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-gray-100 bg-gray-50/40 flex-wrap">
        <p className="text-sm font-bold text-gray-900">Distribution Mode</p>
        <div className="flex items-center gap-2">
          {DIST_MODES.map((dm) => {
            const Icon   = dm.icon;
            const active = mode === dm.value;
            return (
              <button key={dm.value} type="button" onClick={() => setMode(dm.value)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                  active
                    ? 'bg-violet-600 text-white border-violet-600 shadow-lg shadow-violet-200'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {dm.label}
              </button>
            );
          })}
          {mode === 'MANUAL' && (
            <button type="button"
              onClick={() => {
                // ✅ Reset also reads from groupedDistributions
                const r = {};
                groupedDistributions.forEach((group) => {
                  group.allocations.forEach((a) => { r[a.projectionId] = a.allocatedAmount; });
                });
                setManualAmounts(r);
                toast.success('Reset to auto amounts');
              }}
              className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
          )}
        </div>
      </div>

      <div className="p-5 space-y-3">
        {groupedDistributions.map((group) => (
          <OrderRow
            key={group.circuitKey || group.orderId}
            group={group}
            mode={mode}
            manualAmounts={manualAmounts}
            onManualChange={(projId, val) => setManualAmounts((prev) => ({ ...prev, [projId]: val }))}
          />
        ))}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const BulkPaymentComp = () => {
  const [companyGroupId, setCompanyGroupId] = useState('');
  const [amount, setAmount]                 = useState('');
  const [monthYear, setMonthYear]           = useState(() => toMonthYear(new Date()));
  const [loading, setLoading]               = useState(false);
  const [submitting, setSubmitting]         = useState(false);
  const [previewData, setPreviewData]       = useState(null);
  const [mode, setMode]                     = useState('AUTO');
  const [manualAmounts, setManualAmounts]   = useState({});
  const [paymentForm, setPaymentForm]       = useState(getInitialPaymentForm());

  const isAmountDisabled = !companyGroupId;

  const fetchPreview = async () => {
    if (!companyGroupId) { toast.error('Please select company group'); return; }
    if (!amount || isNaN(amount) || Number(amount) <= 0) { toast.error('Please enter valid amount'); return; }
    if (!monthYear) { toast.error('Please select billing month & year'); return; }
    setLoading(true);
    setPreviewData(null);
    try {
      const res  = await fetch(`${API_BACKEND_URL}/billing/sale/ledger/bulk/payment-prev`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyGroupId, amount: Number(amount), monthYear }),
      });
      const json = await res.json();
      if (json.success) {
        setPreviewData(json.data);
        setMode('AUTO');
        setManualAmounts({});
      } else {
        toast.error(json.message || 'Preview failed');
      }
    } catch { toast.error('Failed to fetch preview'); }
    finally  { setLoading(false); }
  };

  const buildMeta = () => {
    const base = { paymentDate: paymentForm.paymentDate };
    if (paymentForm.method === 'NEFT')
      return { ...base, referenceNumber: paymentForm.referenceNumber.trim(), bankName: paymentForm.bankName.trim() };
    if (paymentForm.method === 'CHEQUE')
      return { ...base, chequeNumber: paymentForm.chequeNumber.trim(), chequeDate: paymentForm.chequeDate, bankName: paymentForm.bankName.trim() };
    if (paymentForm.method === 'UPI')
      return { ...base, receiptId: paymentForm.receiptId.trim() };
    return base;
  };

  // ✅ FIXED: iterate groupedDistributions → group.monthlyOrderBillingId is correctly on the group
  const buildAllocations = useCallback(() => {
    if (!previewData?.groupedDistributions) return [];
    const { groupedDistributions } = previewData;
    const result = [];

    groupedDistributions.forEach((group) => {
      const allocsToInclude = mode === 'AUTO'
        ? group.allocations
        : group.allocations.filter((a) => Number(manualAmounts[a.projectionId]) > 0);

      allocsToInclude.forEach((a) => {
        result.push({
          projectionId:          a.projectionId,
          orderId:               group.orderId,
          monthlyOrderBillingId: group.monthlyOrderBillingId,  // ✅ always the correct group-level ID
          allocatedAmount:       String(
            mode === 'AUTO'
              ? a.allocatedAmount
              : (Number(manualAmounts[a.projectionId]) || 0)
          ),
          month: a.billingMonth,
          ...(group.circuitKey?.includes('-primary')   && { type: 'primary'   }),
          ...(group.circuitKey?.includes('-secondary') && { type: 'secondary' }),
        });
      });
    });

    return result;
  }, [previewData, mode, manualAmounts]);

  const handleSubmit = async () => {
    if (!previewData) { toast.error('Please preview payment first'); return; }
    setSubmitting(true);
    try {
      const payload = {
        companyGroupId, amount: Number(amount),
        allocationType: mode, transactionType: 'PAYMENT',
        method: paymentForm.method, remarks: paymentForm.remarks || '',
        meta: buildMeta(), allocations: buildAllocations(),
      };
      const res  = await fetch(`${API_BACKEND_URL}/billing/sale/ledger/bulk/payment-submit`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Payment submitted successfully!');
        setPreviewData(null); setAmount(''); setCompanyGroupId('');
        setMonthYear(toMonthYear(new Date()));
        setManualAmounts({}); setMode('AUTO'); setPaymentForm(getInitialPaymentForm());
      } else {
        toast.error(json.message || 'Submission failed');
      }
    } catch { toast.error('Failed to submit payment'); }
    finally  { setSubmitting(false); }
  };

  const manualTotalAllocated = useMemo(() => {
    if (!previewData) return 0;
    if (mode !== 'MANUAL') return previewData.summary.totalAllocated;
    return Object.values(manualAmounts).reduce((s, v) => s + (Number(v) || 0), 0);
  }, [mode, manualAmounts, previewData]);

  return (
    <div className="min-h-screen bg-gray-50/80 p-4 md:px-8 md:py-6">

      <div className="mb-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-violet-600 shadow-lg shadow-violet-200">
            <IndianRupee className="h-3 w-3 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Bulk Payment Update</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] gap-4 items-start">

        {/* LEFT — Setup */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
          <div className="p-6 space-y-5">

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest mb-2">Company Group</label>
              <CompanyGroupDropdown value={companyGroupId} onChange={(id) => {
                setCompanyGroupId(id);
                setPreviewData(null);
              }} />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest mb-2">
                Billing Month &amp; Year
              </label>
              <MonthYearPicker
                value={monthYear}
                onChange={(val) => { setMonthYear(val); setPreviewData(null); }}
                disabled={isAmountDisabled}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest mb-2">Payment Amount</label>
              <div className={`flex items-center gap-3 px-4 py-3 border rounded-xl transition-all focus-within:ring-2 ${
                isAmountDisabled
                  ? 'bg-gray-50 border-gray-200 cursor-not-allowed'
                  : loading
                  ? 'bg-white border-violet-300 focus-within:ring-violet-50'
                  : previewData
                  ? 'bg-white border-emerald-300 focus-within:ring-emerald-50'
                  : 'bg-white border-gray-200 focus-within:border-violet-400 focus-within:ring-violet-50'
              }`}>
                <span className={`flex items-center justify-center w-7 h-7 rounded-lg shrink-0 ${
                  isAmountDisabled ? 'bg-gray-100' : previewData ? 'bg-emerald-50' : 'bg-violet-50'
                }`}>
                  <IndianRupee className={`h-3.5 w-3.5 ${isAmountDisabled ? 'text-gray-300' : previewData ? 'text-emerald-500' : 'text-violet-500'}`} />
                </span>
                <input
                  type="number"
                  placeholder={isAmountDisabled ? 'Select a company group first...' : 'Enter amount...'}
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setPreviewData(null); }}
                  disabled={isAmountDisabled}
                  className="w-full text-sm text-gray-900 font-bold outline-none placeholder-gray-400 bg-transparent disabled:cursor-not-allowed disabled:text-gray-400"
                />
                {loading    && <Loader2      className="h-4 w-4 animate-spin text-violet-500 shrink-0" />}
                {!loading && previewData && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />}
              </div>
            </div>

            <button type="button" onClick={fetchPreview}
              disabled={isAmountDisabled || !amount || Number(amount) <= 0 || !monthYear || loading}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-violet-100 hover:shadow-violet-200"
            >
              {loading
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Loading Preview...</>
                : <><Eye className="h-4 w-4" /> Preview Distribution</>}
            </button>

            {loading && (
              <div className="grid grid-cols-2 gap-3 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 space-y-2">
                    <div className="h-2 w-16 bg-gray-200 rounded-full" />
                    <div className="h-4 w-24 bg-gray-200 rounded-full" />
                  </div>
                ))}
              </div>
            )}

            {!loading && previewData && (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Total Received',    value: previewData.summary.totalReceived,    color: 'text-violet-700',  bg: 'bg-violet-50',  border: 'border-violet-100',  dot: 'bg-violet-400'  },
                  { label: 'Total Allocated',   value: manualTotalAllocated,                  color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100', dot: 'bg-emerald-400' },
                  { label: 'Remaining Advance', value: previewData.summary.remainingAdvance, color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-100',   dot: 'bg-amber-400'   },
                  { label: 'Total Orders',      value: previewData.summary.totalOrders,      color: 'text-sky-700',     bg: 'bg-sky-50',     border: 'border-sky-100',     dot: 'bg-sky-400', isCount: true },
                ].map((item) => (
                  <div key={item.label} className={`${item.bg} border ${item.border} rounded-xl px-4 py-3`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`h-1.5 w-1.5 rounded-full ${item.dot}`} />
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{item.label}</p>
                    </div>
                    <p className={`text-sm font-bold ${item.color}`}>
                      {item.isCount ? item.value : `₹${fmt(item.value)}`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — Payment Details */}
        {(previewData || loading) ? (
          <PaymentDetailsPanel
            paymentForm={paymentForm}
            setPaymentForm={setPaymentForm}
            summary={previewData?.summary}
            manualTotalAllocated={manualTotalAllocated}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        ) : (
          <div className="bg-white border border-dashed border-gray-200 rounded-2xl flex items-center justify-center min-h-[220px]">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 mx-auto mb-3">
                <Eye className="h-5 w-5 text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-300">Payment details appear after preview</p>
            </div>
          </div>
        )}
      </div>

      {/* DISTRIBUTION */}
      {!loading && previewData && (
        <DistributionPanel
          previewData={previewData}
          mode={mode} setMode={setMode}
          manualAmounts={manualAmounts} setManualAmounts={setManualAmounts}
        />
      )}
    </div>
  );
};

export default BulkPaymentComp;