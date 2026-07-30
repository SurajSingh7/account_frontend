'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { API_BACKEND_URL } from '@/config/getEnvVariables';
import { API_ENDPOINTS } from '@/constants/api';
import toast from 'react-hot-toast';
import {
  Search,
  ChevronDown,
  Building2,
  Loader2,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  Send,
  X,
  CreditCard,
  Wallet,
  Smartphone,
  Building,
  Zap,
  RotateCcw,
  Eye,
  ChevronsUpDown,
  MapPin,
  User2,
} from 'lucide-react';

const fmt = (n) =>
  (n || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const PAYMENT_METHODS = [
  { value: 'NEFT', label: 'NEFT', icon: Building },
  { value: 'CHEQUE', label: 'Cheque', icon: CreditCard },
  { value: 'CASH', label: 'Cash', icon: Wallet },
  { value: 'UPI', label: 'UPI', icon: Smartphone },
];

const DIST_MODES = [{ value: 'AUTO', label: 'Auto Split', icon: Zap }];

const getInitialPaymentForm = () => ({
  method: 'NEFT',
  paymentDate: new Date().toISOString().split('T')[0],
  referenceNumber: '',
  bankName: '',
  chequeNumber: '',
  chequeDate: '',
  receiptId: '',
  remarks: '',
});

const toMonthYear = (date) => {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${mm}-${yyyy}`;
};

const CompanyGroupDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BACKEND_URL}${API_ENDPOINTS.customers.billing.companyGroup.all}`, {
        credentials: 'include',
      });
      const json = await res.json();
      if (json.success) setGroups(json.data || []);
    } catch {
      toast.error('Failed to load company groups');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const filtered = groups.filter(
    (g) =>
      (g.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (g.companyName || '').toLowerCase().includes(search.toLowerCase())
  );

  const selected = groups.find((g) => g._id === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm transition-all hover:border-violet-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-50"
      >
        <span className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50">
            <Building2 className="h-3.5 w-3.5 text-violet-600" />
          </span>
          <span className={selected ? 'font-semibold text-gray-800' : 'text-gray-400'}>
            {selected ? selected.name : 'Select company group...'}
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          <div className="border-b border-gray-100 bg-gray-50/50 p-2.5">
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-50">
              <Search className="h-3.5 w-3.5 shrink-0 text-gray-400" />
              <input
                autoFocus
                type="text"
                placeholder="Search company or group..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="max-h-[28rem] overflow-y-auto">
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
                  onClick={() => {
                    onChange(g._id);
                    setOpen(false);
                    setSearch('');
                  }}
                  className={`flex w-full items-center justify-between border-b border-gray-50 px-4 py-4 text-left transition-colors last:border-0 hover:bg-violet-50/60 ${
                    value === g._id ? 'bg-violet-50' : ''
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{g.name}</p>
                    <p className="mt-0.5 text-xs text-gray-400">{g.companyName}</p>
                  </div>

                  {value === g._id ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-violet-500" />
                  ) : (
                    <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-500">
                      {g.panNumber?.slice(-4)}
                    </span>
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

const MonthYearPicker = ({ value, onChange, disabled }) => {
  const nativeValue = value ? `${value.split('-')[1]}-${value.split('-')[0]}` : '';

  const handleChange = (e) => {
    if (!e.target.value) {
      onChange('');
      return;
    }
    const [yyyy, mm] = e.target.value.split('-');
    onChange(`${mm}-${yyyy}`);
  };

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all focus-within:ring-2 ${
        disabled
          ? 'cursor-not-allowed border-gray-200 bg-gray-50'
          : 'border-gray-200 bg-white focus-within:border-violet-400 focus-within:ring-violet-50'
      }`}
    >
      <input
        type="month"
        value={nativeValue}
        onChange={handleChange}
        disabled={disabled}
        className="w-full bg-transparent text-sm font-bold text-gray-900 outline-none accent-violet-600 disabled:cursor-not-allowed disabled:text-gray-400"
      />
    </div>
  );
};

const PaymentDetailsPanel = ({
  paymentForm,
  setPaymentForm,
  summary,
  manualTotalAllocated,
  onSubmit,
  submitting,
}) => {
  const update = (obj) => setPaymentForm((p) => ({ ...p, ...obj }));

  const handleMethodChange = (method) => {
    setPaymentForm((p) => ({
      ...p,
      method,
      referenceNumber: '',
      bankName: '',
      chequeNumber: '',
      chequeDate: '',
      receiptId: '',
    }));
  };

  const handleSubmit = () => {
    if (!paymentForm.method) {
      toast.error('Select a payment method');
      return;
    }
    if (!paymentForm.paymentDate) {
      toast.error('Enter payment date');
      return;
    }
    if (paymentForm.method === 'NEFT') {
      if (!paymentForm.referenceNumber?.trim()) {
        toast.error('Reference number required');
        return;
      }
      if (!paymentForm.bankName?.trim()) {
        toast.error('Bank name required');
        return;
      }
    }
    if (paymentForm.method === 'CHEQUE') {
      if (!paymentForm.chequeNumber?.trim()) {
        toast.error('Cheque number required');
        return;
      }
      if (!paymentForm.chequeDate) {
        toast.error('Cheque date required');
        return;
      }
      if (!paymentForm.bankName?.trim()) {
        toast.error('Bank name required');
        return;
      }
    }
    if (paymentForm.method === 'UPI') {
      if (!paymentForm.receiptId?.trim()) {
        toast.error('Receipt ID required');
        return;
      }
    }
    onSubmit();
  };

  const inputCls =
    'w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-800 transition-all placeholder:text-gray-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-50';
  const labelCls = 'mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-gray-500';

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-1 flex-col gap-5 p-6">
        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest">Payment Method</label>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_METHODS.map((m) => {
              const Icon = m.icon;
              const active = paymentForm.method === m.value;

              return (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => handleMethodChange(m.value)}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold transition-all ${
                    active
                      ? 'border-violet-600 bg-violet-600 text-white shadow-md shadow-violet-200'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600'
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={labelCls}>
                  Payment Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={paymentForm.paymentDate}
                  onChange={(e) => update({ paymentDate: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>
                  Reference No. <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="UTR / Reference number"
                  value={paymentForm.referenceNumber}
                  onChange={(e) => update({ referenceNumber: e.target.value })}
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>
                Bank Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. HDFC Bank"
                value={paymentForm.bankName}
                onChange={(e) => update({ bankName: e.target.value })}
                className={inputCls}
              />
            </div>
          </>
        )}

        {paymentForm.method === 'CHEQUE' && (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={labelCls}>
                  Payment Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={paymentForm.paymentDate}
                  onChange={(e) => update({ paymentDate: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>
                  Cheque Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 123456"
                  value={paymentForm.chequeNumber}
                  onChange={(e) => update({ chequeNumber: e.target.value })}
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={labelCls}>
                  Cheque Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={paymentForm.chequeDate}
                  onChange={(e) => update({ chequeDate: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>
                  Bank Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. ICICI Bank"
                  value={paymentForm.bankName}
                  onChange={(e) => update({ bankName: e.target.value })}
                  className={inputCls}
                />
              </div>
            </div>
          </>
        )}

        {paymentForm.method === 'CASH' && (
          <div>
            <label className={labelCls}>
              Payment Date <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={paymentForm.paymentDate}
              onChange={(e) => update({ paymentDate: e.target.value })}
              className={inputCls}
            />
          </div>
        )}

        {paymentForm.method === 'UPI' && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className={labelCls}>
                Payment Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={paymentForm.paymentDate}
                onChange={(e) => update({ paymentDate: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>
                Receipt ID <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="UPI Receipt ID"
                value={paymentForm.receiptId}
                onChange={(e) => update({ receiptId: e.target.value })}
                className={inputCls}
              />
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
            className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-800 transition-all placeholder:text-gray-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-50"
          />
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-2">
          <div>
            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Allocated Amount</p>
            <p className="text-lg font-bold text-emerald-600">₹{fmt(manualTotalAllocated)}</p>
            {(summary?.remainingAdvance || 0) > 0 && (
              <p className="mt-0.5 text-xs font-semibold text-amber-600">Advance: ₹{fmt(summary.remainingAdvance)}</p>
            )}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2.5 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-100 transition-all hover:bg-emerald-700 hover:shadow-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit Payment
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  if (status === 'PAID') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
        <CheckCircle2 className="h-3 w-3" /> Paid
      </span>
    );
  }

  if (status === 'PARTIAL') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-700">
        <AlertCircle className="h-3 w-3" /> Partial
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[11px] font-bold text-red-600">
      <X className="h-3 w-3" /> Unpaid
    </span>
  );
};

const OrderRow = ({ group, manualAmounts, onManualChange, mode, forceExpanded }) => {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (forceExpanded !== undefined) {
      setExpanded(forceExpanded);
    }
  }, [forceExpanded]);

  const isPrimary = group.circuitKey?.includes('-primary');
  const isSecondary = group.circuitKey?.includes('-secondary');
  const isSplit = isPrimary || isSecondary;
  const circuitLabel = isPrimary ? 'Primary' : isSecondary ? 'Secondary' : null;
  const circuitColor = isPrimary
    ? 'border border-blue-200 bg-blue-100 text-blue-600'
    : 'border border-purple-200 bg-purple-100 text-purple-600';

  const totalDue =
    group.allocations.length > 0 ? group.allocations[group.allocations.length - 1].currentOutStanding || 0 : 0;

  const totalAllocated =
    mode === 'MANUAL'
      ? group.allocations.reduce((s, a) => s + (Number(manualAmounts[a.projectionId]) || 0), 0)
      : group.totalAllocated;

  const pct = totalDue > 0 ? Math.min(100, (totalAllocated / totalDue) * 100) : 0;
  const pctColor = pct >= 100 ? 'bg-emerald-400' : pct > 50 ? 'bg-violet-400' : 'bg-amber-400';

  const entity = group.entity;
  const state = group.billingItem?.state;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-gray-50/60">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-gray-900">{group.orderId}</span>

            {isSplit && <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${circuitColor}`}>{circuitLabel}</span>}

            {entity && (
              <span className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-[11px] font-bold text-teal-700">
                <User2 className="h-2.5 w-2.5" />
                {entity}
              </span>
            )}

            {state && (
              <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[11px] font-bold text-orange-700">
                <MapPin className="h-2.5 w-2.5" />
                {state}
              </span>
            )}
          </div>

          {group.company && <p className="mt-0.5 truncate text-xs text-gray-400">{group.company}</p>}
        </div>

        <div className="hidden w-44 shrink-0 flex-col items-end gap-1.5 md:flex">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div className={`h-full rounded-full transition-all duration-700 ${pctColor}`} style={{ width: `${pct}%` }} />
          </div>
          <span className="text-[11px] font-semibold text-gray-400">{pct.toFixed(0)}% covered</span>
        </div>

        <div className="flex shrink-0 items-center gap-6">
          <div className="hidden text-right sm:block">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Due</p>
            <p className="text-sm font-bold text-red-500">₹{fmt(totalDue)}</p>
          </div>

          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Allocated</p>
            <p className="text-sm font-bold text-emerald-600">₹{fmt(totalAllocated)}</p>
          </div>

          <div className="hidden text-right sm:block">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Entries</p>
            <p className="text-sm font-bold text-gray-600">{group.totalEntries}</p>
          </div>

          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-200 ${
              expanded ? 'rotate-180 bg-violet-50' : 'bg-gray-50'
            }`}
          >
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="overflow-x-auto border-t border-gray-100">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th rowSpan={2} className="border-b border-gray-100 bg-gray-50 px-5 py-3 text-left align-middle text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Month
                </th>
                <th rowSpan={2} className="border-b border-gray-100 bg-gray-50 px-5 py-3 text-right align-middle text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Remaining
                  <br />
                  Monthly Amount
                </th>
                <th colSpan={2} className="border-b px-5 py-2 text-center text-[10px] font-bold uppercase tracking-widest" style={{ background: '#FEF2F2', color: '#DC2626', borderColor: '#FECACA' }}>
                  Current
                </th>
                <th rowSpan={2} className="border-b border-gray-100 bg-gray-50 px-5 py-3 text-right align-middle text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  {mode === 'MANUAL' ? 'Allocated (edit)' : 'Allocated'}
                </th>
                <th colSpan={2} className="border-b px-5 py-2 text-center text-[10px] font-bold uppercase tracking-widest" style={{ background: '#F0FDF4', color: '#15803D', borderColor: '#BBF7D0' }}>
                  Future
                </th>
              </tr>
              <tr>
                <th className="border-b px-5 py-2.5 text-right text-[10px] font-bold uppercase tracking-widest" style={{ background: '#FEF2F2', color: '#DC2626', borderColor: '#FECACA' }}>
                  Outstanding Adjustment
                </th>
                <th className="border-b px-5 py-2.5 text-center text-[10px] font-bold uppercase tracking-widest" style={{ background: '#FEF2F2', color: '#DC2626', borderColor: '#FECACA' }}>
                  Status
                </th>
                <th className="border-b px-5 py-2.5 text-right text-[10px] font-bold uppercase tracking-widest" style={{ background: '#F0FDF4', color: '#15803D', borderColor: '#BBF7D0' }}>
                  Outstanding Adjustment
                </th>
                <th className="border-b px-5 py-2.5 text-center text-[10px] font-bold uppercase tracking-widest" style={{ background: '#F0FDF4', color: '#15803D', borderColor: '#BBF7D0' }}>
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {group.allocations.map((alloc) => {
                const outstanding = alloc.currentOutStanding || 0;
                const allocated = alloc.allocatedAmount || 0;
                const remaining = alloc.remainingAfter ?? 0;
                const manualVal = manualAmounts[alloc.projectionId];
                const displayAllocated = mode === 'MANUAL' ? Number(manualVal) || 0 : allocated;
                const displayRemaining = mode === 'MANUAL' ? Math.max(0, outstanding - (Number(manualVal) || 0)) : remaining;

                const displayStatus =
                  mode === 'MANUAL'
                    ? (() => {
                        const v = Number(manualVal) || 0;
                        if (v <= 0) return 'UNPAID';
                        if (v >= outstanding - 0.01) return 'PAID';
                        return 'PARTIAL';
                      })()
                    : alloc.status;

                const futureStatus = displayRemaining === 0 ? 'PAID' : 'PARTIAL';
                const remainingMonthlyAmount = displayAllocated + displayRemaining;

                return (
                  <tr key={alloc.projectionId} className="transition-colors hover:bg-violet-50/30">
                    <td className="px-5 py-3.5 font-semibold text-gray-700">
                      {MONTH_NAMES[(alloc.billingMonth || 1) - 1]} {alloc.billingYear}
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium text-gray-600">₹{fmt(remainingMonthlyAmount)}</td>
                    <td className="px-5 py-3.5 text-right font-bold" style={{ background: '#FEF2F2', color: '#DC2626' }}>
                      ₹{fmt(outstanding)}
                    </td>
                    <td className="px-5 py-3.5 text-center" style={{ background: '#FEF2F2' }}>
                      <StatusBadge status={displayStatus} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {mode === 'MANUAL' ? (
                        <input
                          type="number"
                          value={manualVal ?? allocated}
                          onChange={(e) => onManualChange(alloc.projectionId, e.target.value)}
                          className="w-32 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-right text-sm font-bold text-emerald-700 transition-all focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50"
                          min={0}
                          step="0.01"
                        />
                      ) : (
                        <span className="font-bold text-emerald-600">₹{fmt(displayAllocated)}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium" style={{ background: '#F0FDF4', color: '#15803D' }}>
                      ₹{fmt(displayRemaining)}
                    </td>
                    <td className="px-5 py-3.5 text-center" style={{ background: '#F0FDF4' }}>
                      {futureStatus === 'PAID' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-700">
                          <CheckCircle2 className="h-3 w-3" /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-300 bg-orange-100 px-3 py-1 text-[11px] font-bold text-orange-700">
                          <AlertCircle className="h-3 w-3" /> Partial
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>

            <tfoot>
              <tr className="border-t-2 border-gray-200 bg-gray-50">
                <td className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-500">Total</td>
                <td className="px-5 py-3 text-right text-sm font-bold text-gray-600">
                  ₹
                  {fmt(
                    group.allocations.reduce((s, a) => {
                      const alloc2 =
                        mode === 'MANUAL' ? Number(manualAmounts[a.projectionId]) || 0 : a.allocatedAmount || 0;
                      const rem2 =
                        mode === 'MANUAL'
                          ? Math.max(0, (a.currentOutStanding || 0) - (Number(manualAmounts[a.projectionId]) || 0))
                          : a.remainingAfter ?? 0;
                      return s + alloc2 + rem2;
                    }, 0)
                  )}
                </td>
                <td className="px-5 py-3 text-right text-sm font-bold" style={{ background: '#FEF2F2', color: '#DC2626' }}>
                  ₹{fmt(totalDue)}
                </td>
                <td style={{ background: '#FEF2F2' }} />
                <td className="px-5 py-3 text-right text-sm font-bold text-emerald-600">₹{fmt(totalAllocated)}</td>
                <td className="px-5 py-3 text-right text-sm font-bold" style={{ background: '#F0FDF4', color: '#15803D' }}>
                  ₹{fmt(Math.max(0, totalDue - totalAllocated))}
                </td>
                <td style={{ background: '#F0FDF4' }} />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};

const DistributionPanel = ({ previewData, mode, setMode, manualAmounts, setManualAmounts }) => {
  const { groupedDistributions } = previewData;
  const [allExpanded, setAllExpanded] = useState(false);

  const handleToggleAll = () => {
    setAllExpanded((prev) => (prev === true ? false : true));
  };

  const allAreExpanded = allExpanded === true;

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
    <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 bg-gray-50/40 px-6 py-4">
        <p className="text-sm font-bold text-gray-900">Distribution Mode</p>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleToggleAll}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2.5 text-xs font-bold text-gray-500 transition-all hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
            title={allAreExpanded ? 'Collapse all accordions' : 'Expand all accordions'}
          >
            <ChevronsUpDown className="h-3.5 w-3.5" />
            {allAreExpanded ? 'Collapse All' : 'Expand All'}
          </button>

          {DIST_MODES.map((dm) => {
            const Icon = dm.icon;
            const active = mode === dm.value;

            return (
              <button
                key={dm.value}
                type="button"
                onClick={() => setMode(dm.value)}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-all ${
                  active
                    ? 'border-violet-600 bg-violet-600 text-white shadow-lg shadow-violet-200'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {dm.label}
              </button>
            );
          })}

          {mode === 'MANUAL' && (
            <button
              type="button"
              onClick={() => {
                const r = {};
                groupedDistributions.forEach((group) => {
                  group.allocations.forEach((a) => {
                    r[a.projectionId] = a.allocatedAmount;
                  });
                });
                setManualAmounts(r);
                toast.success('Reset to auto amounts');
              }}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2.5 text-xs font-bold text-gray-500 transition-all hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3 p-5">
        {groupedDistributions.map((group) => (
          <OrderRow
            key={group.circuitKey || group.orderId}
            group={group}
            mode={mode}
            manualAmounts={manualAmounts}
            onManualChange={(projId, val) => setManualAmounts((prev) => ({ ...prev, [projId]: val }))}
            forceExpanded={allExpanded}
          />
        ))}
      </div>
    </div>
  );
};

const BulkPaymentComp = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [companyGroupId, setCompanyGroupId] = useState('');
  const [amount, setAmount] = useState('');
  const [monthYear, setMonthYear] = useState(() => toMonthYear(new Date()));
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [mode, setMode] = useState('AUTO');
  const [manualAmounts, setManualAmounts] = useState({});
  const [paymentForm, setPaymentForm] = useState(getInitialPaymentForm());

  const urlCompanyGroupId = searchParams.get('companyGroupId') || '';

  useEffect(() => {
    if (urlCompanyGroupId && urlCompanyGroupId !== companyGroupId) {
      setCompanyGroupId(urlCompanyGroupId);
      setPreviewData(null);
    }

    if (!urlCompanyGroupId && companyGroupId) {
      setCompanyGroupId('');
      setPreviewData(null);
    }
  }, [urlCompanyGroupId]);

  const updateQueryParam = useCallback(
    (key, value) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const handleCompanyGroupChange = useCallback(
    (id) => {
      setCompanyGroupId(id);
      setPreviewData(null);
      updateQueryParam('companyGroupId', id);
    },
    [updateQueryParam]
  );

  const clearCompanyGroupSelection = useCallback(() => {
    setCompanyGroupId('');
    setPreviewData(null);
    updateQueryParam('companyGroupId', '');
  }, [updateQueryParam]);

  const isAmountDisabled = !companyGroupId;

  const fetchPreview = async () => {
    if (!companyGroupId) {
      toast.error('Please select company group');
      return;
    }
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      toast.error('Please enter valid amount');
      return;
    }
    if (!monthYear) {
      toast.error('Please select billing month & year');
      return;
    }

    setLoading(true);
    setPreviewData(null);

    try {
      const res = await fetch(`${API_BACKEND_URL}${API_ENDPOINTS.customers.billing.ledger.bulk.paymentPrev}`, {
        method: 'POST',
        credentials: 'include',
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
    } catch {
      toast.error('Failed to fetch preview');
    } finally {
      setLoading(false);
    }
  };

  const buildMeta = () => {
    const base = { paymentDate: paymentForm.paymentDate };

    if (paymentForm.method === 'NEFT') {
      return {
        ...base,
        referenceNumber: paymentForm.referenceNumber.trim(),
        bankName: paymentForm.bankName.trim(),
      };
    }

    if (paymentForm.method === 'CHEQUE') {
      return {
        ...base,
        chequeNumber: paymentForm.chequeNumber.trim(),
        chequeDate: paymentForm.chequeDate,
        bankName: paymentForm.bankName.trim(),
      };
    }

    if (paymentForm.method === 'UPI') {
      return {
        ...base,
        receiptId: paymentForm.receiptId.trim(),
      };
    }

    return base;
  };

  const buildAllocations = useCallback(() => {
    if (!previewData?.groupedDistributions) return [];

    const { groupedDistributions } = previewData;
    const result = [];

    groupedDistributions.forEach((group) => {
      const allocsToInclude =
        mode === 'AUTO'
          ? group.allocations
          : group.allocations.filter((a) => Number(manualAmounts[a.projectionId]) > 0);

      allocsToInclude.forEach((a) => {
        result.push({
          projectionId: a.projectionId,
          orderId: group.orderId,
          monthlyOrderBillingId: group.monthlyOrderBillingId,
          allocatedAmount: String(mode === 'AUTO' ? a.allocatedAmount : Number(manualAmounts[a.projectionId]) || 0),
          month: a.billingMonth,
          ...(group.circuitKey?.includes('-primary') && { type: 'primary' }),
          ...(group.circuitKey?.includes('-secondary') && { type: 'secondary' }),
        });
      });
    });

    return result;
  }, [previewData, mode, manualAmounts]);

  const handleSubmit = async () => {
    if (!previewData) {
      toast.error('Please preview payment first');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        companyGroupId,
        amount: Number(amount),
        allocationType: mode,
        transactionType: 'PAYMENT',
        method: paymentForm.method,
        remarks: paymentForm.remarks || '',
        meta: buildMeta(),
        allocations: buildAllocations(),
      };

      const res = await fetch(`${API_BACKEND_URL}${API_ENDPOINTS.customers.billing.ledger.bulk.paymentSubmit}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (json.success) {
        toast.success('Payment submitted successfully!');
        setPreviewData(null);
        setAmount('');
        clearCompanyGroupSelection();
        setMonthYear(toMonthYear(new Date()));
        setManualAmounts({});
        setMode('AUTO');
        setPaymentForm(getInitialPaymentForm());
      } else {
        toast.error(json.message || 'Submission failed');
      }
    } catch {
      toast.error('Failed to submit payment');
    } finally {
      setSubmitting(false);
    }
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
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 shadow-lg shadow-violet-200">
            <IndianRupee className="h-3 w-3 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Bulk Payment Update</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="space-y-5 p-6">
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500">Company Group</label>
                {companyGroupId && (
                  <button
                    type="button"
                    onClick={clearCompanyGroupSelection}
                    className="text-xs font-semibold text-violet-600 transition-colors hover:text-violet-700"
                  >
                    Clear
                  </button>
                )}
              </div>

              <CompanyGroupDropdown value={companyGroupId} onChange={handleCompanyGroupChange} />
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-gray-500">
                Billing Month &amp; Year
              </label>
              <MonthYearPicker
                value={monthYear}
                onChange={(val) => {
                  setMonthYear(val);
                  setPreviewData(null);
                }}
                disabled={isAmountDisabled}
              />
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-gray-500">
                Payment Amount
              </label>

              <div
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all focus-within:ring-2 ${
                  isAmountDisabled
                    ? 'cursor-not-allowed border-gray-200 bg-gray-50'
                    : loading
                    ? 'border-violet-300 bg-white focus-within:ring-violet-50'
                    : previewData
                    ? 'border-emerald-300 bg-white focus-within:ring-emerald-50'
                    : 'border-gray-200 bg-white focus-within:border-violet-400 focus-within:ring-violet-50'
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                    isAmountDisabled ? 'bg-gray-100' : previewData ? 'bg-emerald-50' : 'bg-violet-50'
                  }`}
                >
                  <IndianRupee
                    className={`h-3.5 w-3.5 ${
                      isAmountDisabled ? 'text-gray-300' : previewData ? 'text-emerald-500' : 'text-violet-500'
                    }`}
                  />
                </span>

                <input
                  type="number"
                  placeholder={isAmountDisabled ? 'Select a company group first...' : 'Enter amount...'}
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setPreviewData(null);
                  }}
                  disabled={isAmountDisabled}
                  className="w-full bg-transparent text-sm font-bold text-gray-900 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:text-gray-400"
                />

                {loading && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-violet-500" />}
                {!loading && previewData && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />}
              </div>
            </div>

            <button
              type="button"
              onClick={fetchPreview}
              disabled={isAmountDisabled || !amount || Number(amount) <= 0 || !monthYear || loading}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-violet-100 transition-all hover:bg-violet-700 hover:shadow-violet-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading Preview...
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Preview Distribution
                </>
              )}
            </button>

            {loading && (
              <div className="grid grid-cols-2 gap-3 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                    <div className="h-2 w-16 rounded-full bg-gray-200" />
                    <div className="h-4 w-24 rounded-full bg-gray-200" />
                  </div>
                ))}
              </div>
            )}

            {!loading && previewData && (
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: 'Total Received',
                    value: previewData.summary.totalReceived,
                    color: 'text-violet-700',
                    bg: 'bg-violet-50',
                    border: 'border-violet-100',
                    dot: 'bg-violet-400',
                  },
                  {
                    label: 'Total Allocated',
                    value: manualTotalAllocated,
                    color: 'text-emerald-700',
                    bg: 'bg-emerald-50',
                    border: 'border-emerald-100',
                    dot: 'bg-emerald-400',
                  },
                  {
                    label: 'Remaining Advance',
                    value: previewData.summary.remainingAdvance,
                    color: 'text-amber-700',
                    bg: 'bg-amber-50',
                    border: 'border-amber-100',
                    dot: 'bg-amber-400',
                  },
                  {
                    label: 'Total Orders',
                    value: previewData.summary.totalOrders,
                    color: 'text-sky-700',
                    bg: 'bg-sky-50',
                    border: 'border-sky-100',
                    dot: 'bg-sky-400',
                    isCount: true,
                  },
                ].map((item) => (
                  <div key={item.label} className={`${item.bg} ${item.border} rounded-xl border px-4 py-3`}>
                    <div className="mb-1 flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full ${item.dot}`} />
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{item.label}</p>
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

        {previewData || loading ? (
          <PaymentDetailsPanel
            paymentForm={paymentForm}
            setPaymentForm={setPaymentForm}
            summary={previewData?.summary}
            manualTotalAllocated={manualTotalAllocated}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        ) : (
          <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-100 bg-gray-50">
                <Eye className="h-5 w-5 text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-300">Payment details appear after preview</p>
            </div>
          </div>
        )}
      </div>

      {!loading && previewData && (
        <DistributionPanel
          previewData={previewData}
          mode={mode}
          setMode={setMode}
          manualAmounts={manualAmounts}
          setManualAmounts={setManualAmounts}
        />
      )}
    </div>
  );
};

export default BulkPaymentComp;