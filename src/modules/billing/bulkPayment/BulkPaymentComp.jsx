'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { API_BACKEND_URL } from '@/config/getEnvVariables';
import toast from 'react-hot-toast';
import {
  Search, ChevronDown, ChevronUp, Building2, Loader2, IndianRupee,
  CheckCircle2, AlertCircle, Send, X, CreditCard, Wallet, Smartphone,
  Building, Zap, PenLine, RotateCcw, TrendingUp, Info,
} from 'lucide-react';

// Helpers
const fmt = (n) => (n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const PAYMENT_METHODS = [
  { value: 'NEFT',   label: 'NEFT',   icon: Building,   color: 'violet'  },
  { value: 'RTGS',   label: 'RTGS',   icon: Building,   color: 'blue'    },
  { value: 'IMPS',   label: 'IMPS',   icon: Smartphone, color: 'orange'  },
  { value: 'CHEQUE', label: 'Cheque', icon: CreditCard, color: 'sky'     },
  { value: 'CASH',   label: 'Cash',   icon: Wallet,     color: 'emerald' },
  { value: 'UPI',    label: 'UPI',    icon: Smartphone, color: 'pink'    },
];
const DIST_MODES = [
  { value: 'AUTO',   label: 'Auto Split', icon: Zap,     desc: 'Auto chronological allocation' },
  { value: 'MANUAL', label: 'Manual',     icon: PenLine, desc: 'Edit allocations manually'     },
];

// CompanyGroupDropdown
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
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchGroups(); }, [fetchGroups]);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const filtered = groups.filter(g =>
    (g.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (g.companyName || '').toLowerCase().includes(search.toLowerCase())
  );
  const selected = groups.find(g => g._id === value);
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-violet-400 focus:outline-none focus:border-violet-500 transition-colors">
        <span className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-violet-500 shrink-0" />
          <span className={selected ? 'text-gray-800 font-medium' : 'text-gray-400'}>
            {selected ? selected.name : 'Select company group...'}
          </span>
        </span>
        {open ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
      </button>
      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-violet-300 rounded-lg">
              <Search className="h-4 w-4 text-gray-400 shrink-0" />
              <input autoFocus type="text" placeholder="Search company or group..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none" />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {loading ? <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-violet-500" /></div>
            : filtered.length === 0 ? <div className="py-6 text-center text-sm text-gray-400">No results found</div>
            : filtered.map(g => (
              <button key={g._id} type="button"
                onClick={() => { onChange(g._id); setOpen(false); setSearch(''); }}
                className={`w-full flex items-center justify-between px-4 py-3 hover:bg-violet-50 transition-colors text-left ${value === g._id ? 'bg-violet-50' : ''}`}>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{g.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{g.companyName}</p>
                </div>
                <span className="text-xs font-semibold bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 ml-2">{g.panNumber?.slice(-4)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// SummaryCards
const SummaryCards = ({ summary }) => {
  if (!summary) return null;
  const cards = [
    { label: 'Total Received',    val: summary.totalReceived,    bg: 'bg-violet-50',  border: 'border-violet-200', text: 'text-violet-700'  },
    { label: 'Total Allocated',   val: summary.totalAllocated,   bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
    { label: 'Remaining Advance', val: summary.remainingAdvance, bg: 'bg-amber-50',   border: 'border-amber-200',  text: 'text-amber-700'   },
    { label: 'Total Orders',      val: summary.totalOrders,      bg: 'bg-sky-50',     border: 'border-sky-200',    text: 'text-sky-700',    isCount: true },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
      {cards.map(c => (
        <div key={c.label} className={`${c.bg} border ${c.border} rounded-xl p-4`}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{c.label}</p>
          <p className={`text-lg font-bold ${c.text}`}>{c.isCount ? c.val : `₹${fmt(c.val)}`}</p>
        </div>
      ))}
    </div>
  );
};

// OrderRow
const OrderRow = ({ group, manualAmounts, onManualChange, mode }) => {
  const [expanded, setExpanded] = useState(false);
  const isPrimary   = group.circuitKey?.includes('-primary');
  const isSecondary = group.circuitKey?.includes('-secondary');
  const isSplit     = isPrimary || isSecondary;
  const circuitLabel = isPrimary ? 'Primary' : isSecondary ? 'Secondary' : null;
  const circuitColor = isPrimary ? 'bg-blue-100 text-blue-700' : isSecondary ? 'bg-purple-100 text-purple-700' : '';
  const totalDue = group.allocations.reduce((s, a) => s + (a.dueAmount || 0), 0);
  const totalAllocated = mode === 'MANUAL'
    ? group.allocations.reduce((s, a) => s + (Number(manualAmounts[a.projectionId]) || 0), 0)
    : group.totalAllocated;
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden mb-3">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => setExpanded(e => !e)}>
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-800">{group.orderId}</span>
              {isSplit && <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${circuitColor}`}>{circuitLabel}</span>}
            </div>
            {group.customer?.name && <p className="text-xs text-gray-400 mt-0.5">{group.customer.name}</p>}
          </div>
        </div>
        <div className="flex items-center gap-5">
          <div className="text-right hidden sm:block"><p className="text-xs text-gray-400">Due</p><p className="text-sm font-semibold text-red-600">₹{fmt(totalDue)}</p></div>
          <div className="text-right"><p className="text-xs text-gray-400">Allocated</p><p className="text-sm font-bold text-emerald-600">₹{fmt(totalAllocated)}</p></div>
          <div className="text-right hidden sm:block"><p className="text-xs text-gray-400">Entries</p><p className="text-sm font-semibold text-gray-700">{group.totalEntries}</p></div>
          {expanded ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />}
        </div>
      </div>
      {expanded && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white border-b border-gray-100">
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Month</th>
                <th className="px-4 py-2 text-right text-xs font-bold text-gray-500 uppercase">Monthly Bill</th>
                <th className="px-4 py-2 text-right text-xs font-bold text-gray-500 uppercase">Due Amount</th>
                <th className="px-4 py-2 text-right text-xs font-bold text-gray-500 uppercase">{mode === 'MANUAL' ? 'Allocated (Edit)' : 'Allocated'}</th>
                <th className="px-4 py-2 text-right text-xs font-bold text-gray-500 uppercase">Remaining</th>
                <th className="px-4 py-2 text-center text-xs font-bold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {group.allocations.map((alloc, idx) => {
                const manualVal        = manualAmounts[alloc.projectionId];
                const displayAllocated = mode === 'MANUAL' ? (Number(manualVal) || 0) : alloc.allocatedAmount;
                const displayRemaining = mode === 'MANUAL' ? Math.max(0, alloc.dueAmount - (Number(manualVal) || 0)) : alloc.remainingAfter;
                const isPaid    = displayAllocated >= alloc.dueAmount - 0.01;
                const isPartial = displayAllocated > 0 && !isPaid;
                return (
                  <tr key={alloc.projectionId} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
                    <td className="px-4 py-2.5 font-semibold text-gray-700">{MONTH_NAMES[(alloc.billingMonth || 1) - 1]} {alloc.billingYear}</td>
                    <td className="px-4 py-2.5 text-right text-gray-600">₹{fmt(alloc.monthlyBill)}</td>
                    <td className="px-4 py-2.5 text-right text-red-600 font-semibold">₹{fmt(alloc.dueAmount)}</td>
                    <td className="px-4 py-2.5 text-right">
                      {mode === 'MANUAL' ? (
                        <input type="number" value={manualVal ?? alloc.allocatedAmount}
                          onChange={e => onManualChange(alloc.projectionId, e.target.value)}
                          className="w-32 text-right text-sm font-semibold text-emerald-700 border border-emerald-300 rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-500 bg-emerald-50"
                          min={0} step="0.01" />
                      ) : (
                        <span className="font-semibold text-emerald-700">₹{fmt(alloc.allocatedAmount)}</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right text-gray-500">₹{fmt(displayRemaining)}</td>
                    <td className="px-4 py-2.5 text-center">
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full"><CheckCircle2 className="h-3 w-3" /> Paid</span>
                      ) : isPartial ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full"><AlertCircle className="h-3 w-3" /> Partial</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-full"><X className="h-3 w-3" /> Unpaid</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 border-t-2 border-gray-200 font-bold">
                <td className="px-4 py-2.5 text-xs font-bold text-gray-600 uppercase">Total</td>
                <td className="px-4 py-2.5 text-right text-gray-600">₹{fmt(group.allocations.reduce((s, a) => s + (a.monthlyBill || 0), 0))}</td>
                <td className="px-4 py-2.5 text-right text-red-600">₹{fmt(totalDue)}</td>
                <td className="px-4 py-2.5 text-right text-emerald-700">₹{fmt(totalAllocated)}</td>
                <td className="px-4 py-2.5 text-right text-gray-500">₹{fmt(Math.max(0, totalDue - totalAllocated))}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};

// DistributionTable
const DistributionTable = ({ previewData, mode, setMode, manualAmounts, setManualAmounts, onSubmit, submitting, paymentForm, setPaymentForm }) => {
  const { summary, groupedDistributions, rawDistributions } = previewData;
  useEffect(() => {
    if (mode === 'MANUAL' && rawDistributions?.length) {
      const init = {};
      rawDistributions.forEach(r => { init[r.projectionId] = r.allocatedAmount; });
      setManualAmounts(init);
    }
  }, [mode]);
  const manualTotalAllocated = useMemo(() => {
    if (mode !== 'MANUAL') return summary.totalAllocated;
    return Object.values(manualAmounts).reduce((s, v) => s + (Number(v) || 0), 0);
  }, [mode, manualAmounts, summary.totalAllocated]);
  const buildAllocations = () => {
    const source = mode === 'AUTO'
      ? rawDistributions
      : rawDistributions.filter(r => Number(manualAmounts[r.projectionId]) > 0);
    return source.map(r => ({
      projectionId:          r.projectionId,
      orderId:               r.orderId,
      monthlyOrderBillingId: r.monthlyOrderBillingId || r.projectionId,
      allocatedAmount:       String(mode === 'AUTO' ? r.allocatedAmount : (Number(manualAmounts[r.projectionId]) || 0)),
      month:                 r.billingMonth,
      ...(r.circuitKey?.includes('-primary')   && { type: 'primary'   }),
      ...(r.circuitKey?.includes('-secondary') && { type: 'secondary' }),
    }));
  };
  const handleSubmit = () => {
    if (!paymentForm.method)      { toast.error('Select a payment method'); return; }
    if (!paymentForm.paymentDate) { toast.error('Enter payment date'); return; }
    if (['NEFT','RTGS','IMPS'].includes(paymentForm.method) && !paymentForm.referenceNumber) { toast.error('Reference number required for ' + paymentForm.method); return; }
    onSubmit(buildAllocations());
  };
  return (
    <div className="mt-6 space-y-5">
      <SummaryCards summary={{ ...summary, totalAllocated: manualTotalAllocated }} />
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Distribution Mode:</span>
        {DIST_MODES.map(dm => {
          const Icon = dm.icon;
          return (
            <button key={dm.value} onClick={() => setMode(dm.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${mode === dm.value ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-200' : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300'}`}>
              <Icon className="h-3.5 w-3.5" />{dm.label}
            </button>
          );
        })}
        {mode === 'MANUAL' && (
          <button onClick={() => { const r = {}; rawDistributions.forEach(x => { r[x.projectionId] = x.allocatedAmount; }); setManualAmounts(r); toast.success('Reset to auto amounts'); }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        )}
      </div>
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-violet-500" />
          Order-wise Allocation
          <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{groupedDistributions.length} circuits</span>
        </h3>
        {groupedDistributions.map(group => (
          <OrderRow key={group.circuitKey || group.orderId} group={group} mode={mode}
            manualAmounts={manualAmounts}
            onManualChange={(projId, val) => setManualAmounts(prev => ({ ...prev, [projId]: val }))} />
        ))}
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2"><CreditCard className="h-4 w-4 text-violet-500" /> Payment Details</h3>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Payment Method</label>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_METHODS.map(m => { const Icon = m.icon; return (
              <button key={m.value} type="button" onClick={() => setPaymentForm(p => ({ ...p, method: m.value }))}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${paymentForm.method === m.value ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300'}`}>
                <Icon className="h-3.5 w-3.5" />{m.label}
              </button>
            ); })}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Payment Date <span className="text-red-500">*</span></label>
            <input type="date" value={paymentForm.paymentDate} onChange={e => setPaymentForm(p => ({ ...p, paymentDate: e.target.value }))}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-violet-500 bg-white" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Reference No.{['NEFT','RTGS','IMPS'].includes(paymentForm.method) && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            <input type="text" placeholder={paymentForm.method === 'CHEQUE' ? 'Cheque number...' : 'NEFT/RTGS/UTR ref...'}
              value={paymentForm.referenceNumber} onChange={e => setPaymentForm(p => ({ ...p, referenceNumber: e.target.value }))}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-violet-500 bg-white" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Remarks</label>
          <input type="text" placeholder="Add remarks..." value={paymentForm.remarks}
            onChange={e => setPaymentForm(p => ({ ...p, remarks: e.target.value }))}
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-violet-500 bg-white" />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-5 text-sm">
            <span className="text-gray-500">Allocated: <span className="font-bold text-emerald-600">₹{fmt(manualTotalAllocated)}</span></span>
            {(summary.remainingAdvance || 0) > 0 && <span className="text-gray-500">Advance: <span className="font-bold text-amber-600">₹{fmt(summary.remainingAdvance)}</span></span>}
          </div>
          <button type="button" onClick={handleSubmit} disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors shadow-md shadow-emerald-200">
            {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</> : <><Send className="h-4 w-4" /> Submit Payment</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
const BulkPaymentComp = () => {
  const [companyGroupId, setCompanyGroupId] = useState('');
  const [amount, setAmount]                 = useState('');
  const [loading, setLoading]               = useState(false);
  const [submitting, setSubmitting]         = useState(false);
  const [previewData, setPreviewData]       = useState(null);
  const [mode, setMode]                     = useState('AUTO');
  const [manualAmounts, setManualAmounts]   = useState({});
  const [paymentForm, setPaymentForm]       = useState({
    method: 'NEFT', paymentDate: new Date().toISOString().split('T')[0], referenceNumber: '', remarks: '',
  });
  const debounceTimer = useRef(null);

  useEffect(() => {
    if (!companyGroupId || !amount || isNaN(amount) || Number(amount) <= 0) { setPreviewData(null); return; }
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(fetchPreview, 600);
    return () => clearTimeout(debounceTimer.current);
  }, [companyGroupId, amount]);

  const fetchPreview = async () => {
    setLoading(true); setPreviewData(null);
    try {
      const res  = await fetch(`${API_BACKEND_URL}/billing/sale/ledger/bulk/payment-prev`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ companyGroupId, amount: Number(amount) }),
      });
      const json = await res.json();
      if (json.success) { setPreviewData(json.data); setMode('AUTO'); setManualAmounts({}); }
      else toast.error(json.message || 'Preview failed');
    } catch { toast.error('Failed to fetch preview'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (allocations) => {
    setSubmitting(true);
    try {
      const payload = {
        companyGroupId,
        amount:          Number(amount),
        allocationType:  mode,
        transactionType: 'PAYMENT',
        method:          paymentForm.method,
        remarks:         paymentForm.remarks || '',
        meta: { paymentDate: paymentForm.paymentDate, referenceNumber: paymentForm.referenceNumber || '' },
        allocations,
      };
      const res  = await fetch(`${API_BACKEND_URL}/billing/sale/ledger/bulk/payment-submit`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Payment submitted successfully!');
        setPreviewData(null); setAmount(''); setCompanyGroupId(''); setManualAmounts({});
        setPaymentForm({ method: 'NEFT', paymentDate: new Date().toISOString().split('T')[0], referenceNumber: '', remarks: '' });
      } else { toast.error(json.message || 'Submission failed'); }
    } catch { toast.error('Failed to submit payment'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:px-6 md:py-2">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bulk Payment Update</h1>
        <p className="text-gray-500 text-sm mt-1">Select company group and enter amount — distribution preview loads automatically.</p>
      </header>
      <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-2xl space-y-5">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Company Group</label>
          <CompanyGroupDropdown value={companyGroupId} onChange={setCompanyGroupId} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Amount</label>
          <div className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl focus-within:border-violet-500 transition-colors">
            <IndianRupee className="h-4 w-4 text-gray-400 shrink-0" />
            <input type="number" placeholder="Enter amount... (preview auto-loads)" value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full text-sm text-gray-800 font-medium outline-none placeholder-gray-400 bg-transparent" />
            {loading     && <Loader2       className="h-4 w-4 animate-spin text-violet-500 shrink-0" />}
            {!loading && previewData && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />}
          </div>
          {companyGroupId && amount && !loading && !previewData && Number(amount) > 0 && (
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Info className="h-3 w-3" /> Calculating distribution...</p>
          )}
        </div>
      </div>
      {loading && (
        <div className="max-w-2xl mt-6 flex items-center justify-center py-12 bg-white border border-gray-200 rounded-2xl">
          <div className="text-center"><Loader2 className="h-8 w-8 animate-spin text-violet-500 mx-auto mb-3" /><p className="text-sm text-gray-500">Calculating distribution preview...</p></div>
        </div>
      )}
      {!loading && previewData && (
        <div className="max-w-5xl">
          <DistributionTable previewData={previewData} mode={mode} setMode={setMode}
            manualAmounts={manualAmounts} setManualAmounts={setManualAmounts}
            onSubmit={handleSubmit} submitting={submitting}
            paymentForm={paymentForm} setPaymentForm={setPaymentForm} />
        </div>
      )}
    </div>
  );
};

export default BulkPaymentComp;