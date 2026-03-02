'use client'
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import {
  Search, X, Filter, Eye, Printer, Building2, Calendar,
  IndianRupee, FileText, CheckCircle2, AlertCircle,
  Loader2, RefreshCw, Hash, Layers, Wallet, CreditCard,
  Building, Smartphone, Banknote, ChevronDown, ChevronUp,
  MapPin, Clock
} from 'lucide-react'

// ─── Constants ────────────────────────────────────────────────
const PAYMENT_TYPES = [
  {
    value: 'receivedDetails',
    label: 'Received',
    shortLabel: 'RCV',
    color: 'emerald',
    badgeCls: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    activeCls: 'bg-emerald-600 text-white border-emerald-600',
    dotCls: 'bg-emerald-400',
  },
  {
    value: 'tdsProvision',
    label: 'TDS Provision',
    shortLabel: 'TDS-P',
    color: 'amber',
    badgeCls: 'bg-amber-50 text-amber-700 border border-amber-200',
    activeCls: 'bg-amber-500 text-white border-amber-500',
    dotCls: 'bg-amber-400',
  },
  {
    value: 'tdsConfirm',
    label: 'TDS Confirm',
    shortLabel: 'TDS-C',
    color: 'violet',
    badgeCls: 'bg-violet-50 text-violet-700 border border-violet-200',
    activeCls: 'bg-violet-600 text-white border-violet-600',
    dotCls: 'bg-violet-400',
  },
]

const PAYMENT_METHOD_META = {
  cash:   { label: 'Cash',   icon: Wallet,     color: 'emerald', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  cheque: { label: 'Cheque', icon: CreditCard, color: 'blue',    bg: 'bg-blue-100',    text: 'text-blue-700'    },
  neft:   { label: 'NEFT',   icon: Building,   color: 'violet',  bg: 'bg-violet-100',  text: 'text-violet-700'  },
  upi:    { label: 'UPI',    icon: Smartphone, color: 'orange',  bg: 'bg-orange-100',  text: 'text-orange-700'  },
}

// ─── Helpers ──────────────────────────────────────────────────
const fmt = (n) => (n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtShort = (n) => {
  if (!n) return '₹0'
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`
  if (n >= 100000)   return `₹${(n / 100000).toFixed(2)}L`
  if (n >= 1000)     return `₹${(n / 1000).toFixed(1)}K`
  return `₹${n.toFixed(0)}`
}
const typeInfo = (val) => PAYMENT_TYPES.find(t => t.value === val) || PAYMENT_TYPES[0]
const fmtCreatedAt = (iso) => {
  if (!iso) return '-'
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}
const getPaymentMethodMeta = (method) => PAYMENT_METHOD_META[method] || PAYMENT_METHOD_META.cash

// ─── Compute monthly total for an entry ──────────────────────
// Sum of (adjustedAmount + remainingAmount) across all monthlyAdjustments
const getMonthlyTotal = (entry) => {
  const adjs = entry.monthlyAdjustments || []
  if (!adjs.length) return null // no adj data — show dash
  return adjs.reduce((s, a) => s + (Number(a.adjustedAmount) || 0) + (Number(a.remainingAmount) || 0), 0)
}

// ─── Status Pill ──────────────────────────────────────────────
const StatusPill = ({ adj }) => {
  if (adj.amountStatus === 'Fully Paid') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide bg-emerald-100 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-2.5 h-2.5 flex-shrink-0" />Fully Paid
      </span>
    )
  }
  if (adj.amountStatus === 'Partially Paid') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide bg-amber-100 text-amber-700 border border-amber-200">
        <AlertCircle className="w-2.5 h-2.5 flex-shrink-0" />Partial
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide bg-red-100 text-red-600 border border-red-200">
      <X className="w-2.5 h-2.5 flex-shrink-0" />Not Paid
    </span>
  )
}

// ─── PDF Entry Card (single column, compact, print-optimized) ─
const PdfEntryCard = ({ entry, index }) => {
  const adjs = (entry.monthlyAdjustments || []).filter(adj => Number(adj.adjustedAmount) > 0)
  const hasAdjs = adjs.length > 0
  const monthlyTotal = getMonthlyTotal(entry)

  return (
    <div style={{
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      overflow: 'hidden',
      marginBottom: '10px',
      breakInside: 'avoid',
      pageBreakInside: 'avoid',
      backgroundColor: '#fff'
    }}>
      {/* Card Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '22px', height: '22px', borderRadius: '6px',
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '10px', fontWeight: 900, color: '#fff', flexShrink: 0
          }}>{index + 1}</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 900, color: '#fff', fontFamily: 'monospace', letterSpacing: '-0.3px' }}>
                {entry.orderId}
              </span>
              {entry.isSplit && (
                <span style={{
                  fontSize: '8px', fontWeight: 900, color: '#c4b5fd',
                  background: 'rgba(139,92,246,0.3)', border: '1px solid rgba(167,139,250,0.3)',
                  padding: '1px 6px', borderRadius: '4px', textTransform: 'uppercase'
                }}>Split {entry.splitPct}%</span>
              )}
            </div>
            {entry.companyName && (
              <p style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px', marginBottom: 0 }}>{entry.companyName}</p>
            )}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '8px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px', marginTop: 0 }}>Amount</p>
          <p style={{ fontSize: '16px', fontWeight: 900, color: '#34d399', marginTop: 0, marginBottom: 0, lineHeight: 1 }}>₹{fmt(entry.amount)}</p>
          {monthlyTotal !== null && (
            <p style={{ fontSize: '9px', color: '#94a3b8', marginTop: '3px', marginBottom: 0 }}>
              Monthly Total: <span style={{ color: '#fbbf24', fontWeight: 800 }}>₹{fmt(monthlyTotal)}</span>
            </p>
          )}
        </div>
      </div>

      {/* Meta row */}
      <div style={{
        padding: '7px 14px',
        background: '#f8fafc',
        borderBottom: '1px solid #f1f5f9',
        display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ fontSize: '8px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>State:</span>
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#4338ca', background: '#eef2ff', border: '1px solid #e0e7ff', padding: '1px 7px', borderRadius: '5px' }}>
            {entry.state || '-'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ fontSize: '8px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Payment Date:</span>
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#374151', fontFamily: 'monospace' }}>{entry.date || '-'}</span>
        </div>
        {entry.month && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ fontSize: '8px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Billing:</span>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#374151' }}>{entry.month}</span>
          </div>
        )}
      </div>

      {/* Invoice Adjustments */}
      {hasAdjs && (
        <div style={{ padding: '10px 14px' }}>
          <p style={{ fontSize: '8px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px', marginTop: 0 }}>
            Invoice Adjustments ({adjs.length})
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                {['#', 'Month', 'Invoice No', 'Invoice Date', 'Status', 'Adjusted Amt', 'Remaining', 'Monthly Total'].map(h => (
                  <th key={h} style={{
                    padding: '5px 8px', textAlign: 'left', fontSize: '8px',
                    fontWeight: 900, color: '#64748b', textTransform: 'uppercase',
                    letterSpacing: '0.8px', borderBottom: '1px solid #e2e8f0',
                    whiteSpace: 'nowrap'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {adjs.map((adj, i) => {
                const isFullyPaid   = adj.amountStatus === 'Fully Paid'
                const isPartialPaid = adj.amountStatus === 'Partially Paid'
                const rowBg = isFullyPaid ? 'rgba(209,250,229,0.3)' : isPartialPaid ? 'rgba(254,243,199,0.3)' : 'rgba(254,226,226,0.3)'
                const rowMonthlyTotal = (Number(adj.adjustedAmount) || 0) + (Number(adj.remainingAmount) || 0)
                return (
                  <tr key={i} style={{ background: i % 2 === 0 ? rowBg : '#fff', borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '5px 8px', fontWeight: 700, color: '#94a3b8' }}>{i + 1}</td>
                    <td style={{ padding: '5px 8px', fontWeight: 800, color: '#1e293b' }}>{adj.month}</td>
                    <td style={{ padding: '5px 8px', fontWeight: 700, color: '#2563eb', fontFamily: 'monospace', fontSize: '9px' }}>
                      {adj.invoiceNumber && adj.invoiceNumber !== '-' ? adj.invoiceNumber : '—'}
                    </td>
                    <td style={{ padding: '5px 8px', color: '#475569' }}>
                      {adj.invoiceDate && adj.invoiceDate !== '-' ? adj.invoiceDate : '—'}
                    </td>
                    <td style={{ padding: '5px 8px' }}>
                      <span style={{
                        fontSize: '8px', fontWeight: 900, padding: '2px 6px', borderRadius: '20px',
                        background: isFullyPaid ? '#d1fae5' : isPartialPaid ? '#fef3c7' : '#fee2e2',
                        color: isFullyPaid ? '#065f46' : isPartialPaid ? '#92400e' : '#991b1b',
                        border: `1px solid ${isFullyPaid ? '#a7f3d0' : isPartialPaid ? '#fde68a' : '#fecaca'}`,
                        textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap'
                      }}>
                        {isFullyPaid ? 'Fully Paid' : isPartialPaid ? 'Partial' : 'Not Paid'}
                      </span>
                    </td>
                    <td style={{ padding: '5px 8px', fontWeight: 900, color: isFullyPaid ? '#059669' : isPartialPaid ? '#d97706' : '#dc2626', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      ₹{fmt(adj.adjustedAmount)}
                    </td>
                    <td style={{ padding: '5px 8px', color: '#d97706', fontWeight: 700, textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {adj.remainingAmount > 0 ? `₹${fmt(adj.remainingAmount)}` : '—'}
                    </td>
                    <td style={{ padding: '5px 8px', fontWeight: 900, color: '#7c3aed', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      ₹{fmt(rowMonthlyTotal)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            {/* Adj totals footer */}
            <tfoot>
              <tr style={{ background: '#f1f5f9', borderTop: '2px solid #e2e8f0' }}>
                <td colSpan="5" style={{ padding: '5px 8px', fontSize: '8px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase' }}>Totals</td>
                <td style={{ padding: '5px 8px', fontWeight: 900, color: '#1e293b', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  ₹{fmt(adjs.reduce((s, a) => s + (Number(a.adjustedAmount) || 0), 0))}
                </td>
                <td style={{ padding: '5px 8px', fontWeight: 900, color: '#d97706', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  ₹{fmt(adjs.reduce((s, a) => s + (Number(a.remainingAmount) || 0), 0))}
                </td>
                <td style={{ padding: '5px 8px', fontWeight: 900, color: '#7c3aed', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  ₹{fmt(adjs.reduce((s, a) => s + (Number(a.adjustedAmount) || 0) + (Number(a.remainingAmount) || 0), 0))}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Sub-total */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginTop: '8px', paddingTop: '7px', borderTop: '1px solid #e2e8f0'
          }}>
            <span style={{ fontSize: '8px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {adjs.length} line{adjs.length !== 1 ? 's' : ''} · Entry Total
            </span>
            <span style={{ fontSize: '12px', fontWeight: 900, color: '#1e293b' }}>₹{fmt(entry.amount)}</span>
          </div>
        </div>
      )}

      {!hasAdjs && (
        <div style={{ padding: '8px 14px', borderTop: '1px solid #f1f5f9' }}>
          <p style={{ fontSize: '10px', color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>Manual distribution — no invoice details</p>
        </div>
      )}
    </div>
  )
}

// ─── Report Modal ─────────────────────────────────────────────
const ReportModal = React.memo(({ record, onClose }) => {
  const t  = typeInfo(record.paymentType)
  const pm = getPaymentMethodMeta(record.paymentMethod)
  const PmIcon = pm.icon

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  useEffect(() => {
    const style = document.createElement('style')
    style.id = 'dist-report-print'
    style.innerHTML = `
      @media print {
        body > * { visibility: hidden !important; }
        #dist-report-printable, #dist-report-printable * { visibility: visible !important; }
        #dist-report-printable {
          position: fixed !important; top: 0 !important; left: 0 !important;
          width: 100vw !important; padding: 20px !important;
          background: white !important; z-index: 99999 !important;
          font-size: 11px !important;
        }
        @page { margin: 15mm; size: A4; }
      }
    `
    document.head.appendChild(style)
    return () => { document.getElementById('dist-report-print')?.remove() }
  }, [])

  const entries        = (record.entries || []).filter(e => Number(e.amount) > 0)
  const totalAllocated = entries.reduce((s, e) => s + (Number(e.amount) || 0), 0)
  const splitCount     = entries.filter(e => e.isSplit).length
  const uniqueOrders   = new Set(entries.map(e => e.orderId)).size
  const now            = new Date()
  const generatedOn    = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
  const generatedAt    = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const recordRef      = record._id?.slice(-8).toUpperCase() || 'N/A'

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-3 overflow-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full flex flex-col overflow-hidden"
        style={{ maxWidth: '860px', maxHeight: '97vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-3 bg-slate-900 rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-slate-300" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-none">Payment Distribution Report</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Ref #{recordRef}</p>
            </div>
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${t.badgeCls}`}>{t.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all">
              <Printer className="w-3.5 h-3.5" />Print / PDF
            </button>
            <button onClick={onClose} className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/10">
              <X className="w-3.5 h-3.5" />Close
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-auto flex-1 bg-slate-100 p-4">
          <div id="dist-report-printable" className="bg-white rounded-xl shadow-sm mx-auto" style={{ maxWidth: '800px', fontFamily: 'system-ui, sans-serif' }}>

            {/* ── PDF HEADER ── */}
            <div style={{ padding: '24px 28px 18px', borderBottom: '2px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                    <div style={{ width: '42px', height: '42px', background: '#0f172a', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Banknote style={{ width: '22px', height: '22px', color: '#fff' }} />
                    </div>
                    <div>
                      <h1 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.5px', lineHeight: 1 }}>
                        PAYMENT DISTRIBUTION REPORT
                      </h1>
                      <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                        Confidential · Internal Use Only
                      </p>
                    </div>
                  </div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                    background: t.value === 'receivedDetails' ? '#ecfdf5' : t.value === 'tdsProvision' ? '#fffbeb' : '#f5f3ff',
                    color:      t.value === 'receivedDetails' ? '#065f46' : t.value === 'tdsProvision' ? '#92400e' : '#5b21b6',
                    border:     `1px solid ${t.value === 'receivedDetails' ? '#a7f3d0' : t.value === 'tdsProvision' ? '#fde68a' : '#ddd6fe'}`,
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: t.value === 'receivedDetails' ? '#34d399' : t.value === 'tdsProvision' ? '#fbbf24' : '#8b5cf6' }} />
                    {t.label}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', marginTop: 0 }}>Generated</p>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '2px', marginTop: 0 }}>{generatedOn}</p>
                  <p style={{ fontSize: '10px', color: '#64748b', marginBottom: '6px', marginTop: 0 }}>{generatedAt}</p>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '4px 10px', display: 'inline-block' }}>
                    <p style={{ fontSize: '9px', fontFamily: 'monospace', color: '#64748b', fontWeight: 700, margin: 0 }}>#{recordRef}</p>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: '18px 28px' }}>

              {/* ── INFO GRID 4-col ── */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '14px' }}>
                {[
                  { label: 'Company Group', value: record.companyGroup, bg: '#eff6ff', border: '#bfdbfe', color: '#1e40af' },
                  { label: 'Payment Date',  value: record.paymentDate,  bg: '#f8fafc', border: '#e2e8f0', color: '#1e293b' },
                  { label: 'Billing Month', value: record.billingMonth, bg: '#eef2ff', border: '#c7d2fe', color: '#3730a3' },
                  { label: 'Payment Type',  value: t.label,             bg: '#f8fafc', border: '#e2e8f0', color: '#1e293b' },
                ].map(({ label, value, bg, border, color }) => (
                  <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: '8px', padding: '10px 12px' }}>
                    <p style={{ fontSize: '8px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', marginTop: 0 }}>{label}</p>
                    <p style={{ fontSize: '13px', fontWeight: 900, color, margin: 0, lineHeight: 1.2 }}>{value || '—'}</p>
                  </div>
                ))}
              </div>

              {/* ── PAYMENT METHOD ── */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 16px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: pm.color === 'blue' ? '#dbeafe' : pm.color === 'violet' ? '#ede9fe' : pm.color === 'orange' ? '#ffedd5' : '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PmIcon style={{ width: '16px', height: '16px' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '8px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px', marginTop: 0 }}>Payment Method</p>
                    <p style={{ fontSize: '13px', fontWeight: 900, textTransform: 'uppercase', color: '#1e293b', margin: 0 }}>{pm.label}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {record.bankName && (
                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 10px' }}>
                      <p style={{ fontSize: '8px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px', marginTop: 0 }}>Bank</p>
                      <p style={{ fontSize: '11px', fontWeight: 700, color: '#374151', margin: 0 }}>{record.bankName}</p>
                    </div>
                  )}
                  {record.chequeNumber && (
                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 10px' }}>
                      <p style={{ fontSize: '8px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px', marginTop: 0 }}>Cheque No.</p>
                      <p style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 700, color: '#2563eb', margin: 0 }}>{record.chequeNumber}</p>
                    </div>
                  )}
                  {record.chequeDate && (
                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 10px' }}>
                      <p style={{ fontSize: '8px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px', marginTop: 0 }}>Cheque Date</p>
                      <p style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 700, color: '#2563eb', margin: 0 }}>{record.chequeDate}</p>
                    </div>
                  )}
                  {record.neftId && (
                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 10px' }}>
                      <p style={{ fontSize: '8px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px', marginTop: 0 }}>NEFT ID</p>
                      <p style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 700, color: '#7c3aed', margin: 0 }}>{record.neftId}</p>
                    </div>
                  )}
                  {record.transactionId && (
                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 10px' }}>
                      <p style={{ fontSize: '8px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px', marginTop: 0 }}>Transaction ID</p>
                      <p style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 700, color: '#ea580c', margin: 0, wordBreak: 'break-all' }}>{record.transactionId}</p>
                    </div>
                  )}
                  {record.paymentNote && (
                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 10px' }}>
                      <p style={{ fontSize: '8px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px', marginTop: 0 }}>Note</p>
                      <p style={{ fontSize: '11px', color: '#374151', margin: 0 }}>{record.paymentNote}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* ── TOTAL AMOUNT BANNER ── */}
              <div style={{
                background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
                borderRadius: '12px', padding: '16px 20px',
                marginBottom: '14px', position: 'relative', overflow: 'hidden'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                  <div>
                    <p style={{ fontSize: '9px', fontWeight: 900, color: '#a7f3d0', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px', marginTop: 0 }}>
                      Total Amount Distributed
                    </p>
                    <p style={{ fontSize: '32px', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-1px', lineHeight: 1 }}>
                      ₹{fmt(record.totalAmount)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {[
                      { label: 'Orders',     value: uniqueOrders   },
                      { label: 'Entries',    value: entries.length },
                      { label: 'Split Rows', value: splitCount     },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '8px', padding: '8px 14px', textAlign: 'center' }}>
                        <p style={{ fontSize: '20px', fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1 }}>{value}</p>
                        <p style={{ fontSize: '8px', fontWeight: 700, color: '#a7f3d0', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '4px', marginBottom: 0 }}>{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Notes */}
              {record.notes && (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px' }}>
                  <p style={{ fontSize: '8px', fontWeight: 900, color: '#d97706', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', marginTop: 0 }}>Reference / Notes</p>
                  <p style={{ fontSize: '11px', color: '#92400e', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>{record.notes}</p>
                </div>
              )}

              {/* ── DISTRIBUTION BREAKDOWN ── */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <h2 style={{ fontSize: '10px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '2px', margin: 0, whiteSpace: 'nowrap' }}>
                    Distribution Breakdown
                  </h2>
                  <div style={{ height: '1px', flex: 1, background: '#e2e8f0' }} />
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', background: '#f1f5f9', padding: '3px 10px', borderRadius: '20px', whiteSpace: 'nowrap' }}>
                    {entries.length} entr{entries.length !== 1 ? 'ies' : 'y'}
                  </span>
                  {splitCount > 0 && (
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#7c3aed', background: '#ede9fe', padding: '3px 10px', borderRadius: '20px', whiteSpace: 'nowrap' }}>
                      {splitCount} split
                    </span>
                  )}
                </div>

                {entries.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px', background: '#f8fafc', borderRadius: '10px', border: '1px dashed #e2e8f0', color: '#94a3b8' }}>
                    <p style={{ fontSize: '13px', fontWeight: 700, margin: 0 }}>No entries recorded</p>
                  </div>
                ) : (
                  <>
                    <div>
                      {entries.map((entry, idx) => (
                        <PdfEntryCard
                          key={`${entry.orderId}-${entry.state}-${idx}`}
                          entry={entry}
                          index={idx}
                        />
                      ))}
                    </div>

                    {/* Grand total */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 18px', background: '#0f172a', borderRadius: '10px', marginTop: '4px'
                    }}>
                      <div>
                        <p style={{ fontSize: '9px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '2px', marginTop: 0 }}>
                          Grand Total — {entries.length} entr{entries.length !== 1 ? 'ies' : 'y'} · {uniqueOrders} order{uniqueOrders !== 1 ? 's' : ''}
                        </p>
                        {Math.abs(totalAllocated - record.totalAmount) > 0.01 && (
                          <p style={{ fontSize: '9px', color: '#fbbf24', fontWeight: 700, margin: 0 }}>
                            ⚠ Sum ₹{fmt(totalAllocated)} vs Recorded ₹{fmt(record.totalAmount)}
                          </p>
                        )}
                      </div>
                      <p style={{ fontSize: '22px', fontWeight: 900, color: '#fff', margin: 0 }}>₹{fmt(totalAllocated)}</p>
                    </div>
                  </>
                )}
              </div>

              {/* ── FOOTER ── */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '14px', borderTop: '2px dashed #e2e8f0' }}>
                <div>
                  <p style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 500, marginBottom: '2px', marginTop: 0 }}>
                    This is a system-generated report. No signature required.
                  </p>
                  <p style={{ fontSize: '9px', color: '#94a3b8', margin: 0 }}>
                    Generated on {generatedOn} at {generatedAt} · Record #{recordRef}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '28px', height: '28px', background: '#0f172a', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Banknote style={{ width: '14px', height: '14px', color: '#fff' }} />
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 900, color: '#475569', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Billing Management System
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})
ReportModal.displayName = 'ReportModal'

// ─── Confirm Delete Popover ────────────────────────────────────
const DeleteConfirm = ({ onConfirm, onCancel }) => (
  <div className="absolute right-0 top-full mt-1.5 z-50 bg-white border border-red-200 rounded-xl shadow-xl p-3 w-52" onClick={e => e.stopPropagation()}>
    <p className="text-xs font-bold text-slate-700 mb-2">Delete this record?</p>
    <p className="text-[10px] text-slate-400 mb-3">This cannot be undone.</p>
    <div className="flex gap-2">
      <button onClick={onCancel} className="flex-1 px-2.5 py-1.5 text-xs font-bold border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">Cancel</button>
      <button onClick={onConfirm} className="flex-1 px-2.5 py-1.5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg">Delete</button>
    </div>
  </div>
)

// ─── Stat Card ────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, iconCls, borderCls }) => (
  <div className={`bg-white rounded-2xl border shadow-sm p-5 ${borderCls || 'border-slate-200'}`}>
    <div className="mb-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconCls || 'bg-slate-100'}`}>
        <Icon style={{ width: '18px', height: '18px' }} />
      </div>
    </div>
    <p className="text-2xl font-black text-slate-900 leading-none mb-1">{value}</p>
    {sub && <p className="text-xs font-semibold text-slate-400 mb-1">{sub}</p>}
    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">{label}</p>
  </div>
)

// ─── Main Page ────────────────────────────────────────────────
export default function DistributedPaymentsPage() {
  const [records, setRecords]       = useState([])
  const [groups, setGroups]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [groupQuery, setGroupQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [textSearch, setTextSearch] = useState('')
  const [viewRecord, setViewRecord] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [toast, setToast]           = useState(null)
  const groupInputRef               = useRef(null)

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (groupQuery.trim()) params.set('companyGroup', groupQuery.trim())
      if (typeFilter)        params.set('paymentType', typeFilter)
      const res  = await fetch(`/api/billing/distributed?${params}`)
      const json = await res.json()
      if (json.success) {
        setRecords(json.data  || [])
        setGroups(json.groups || [])
      } else {
        showToast(json.error || 'Failed to load records', 'error')
      }
    } catch (e) {
      console.error('[DistributedPage] fetch error', e)
      showToast('Failed to load records', 'error')
    } finally {
      setLoading(false)
    }
  }, [groupQuery, typeFilter, showToast])

  useEffect(() => { fetchRecords() }, [fetchRecords])

  const filteredRecords = useMemo(() => {
    if (!textSearch.trim()) return records
    const q = textSearch.toLowerCase().trim()
    return records.filter(r =>
      r.companyGroup?.toLowerCase().includes(q) ||
      r.billingMonth?.toLowerCase().includes(q) ||
      r.paymentDate?.includes(q) ||
      r.notes?.toLowerCase().includes(q) ||
      r.paymentMethod?.toLowerCase().includes(q) ||
      r.entries?.some(e =>
        e.orderId?.toLowerCase().includes(q) ||
        e.companyName?.toLowerCase().includes(q) ||
        e.state?.toLowerCase().includes(q)
      )
    )
  }, [records, textSearch])

  const stats = useMemo(() => {
    const totalAmt     = filteredRecords.reduce((s, r) => s + (Number(r.totalAmount) || 0), 0)
    const totalEntries = filteredRecords.reduce((s, r) => s + (r.entryCount || 0), 0)
    const byType = PAYMENT_TYPES.map(t => ({
      ...t,
      count:  filteredRecords.filter(r => r.paymentType === t.value).length,
      amount: filteredRecords.filter(r => r.paymentType === t.value).reduce((s, r) => s + (Number(r.totalAmount) || 0), 0),
    }))
    return { total: filteredRecords.length, totalAmt, totalEntries, byType }
  }, [filteredRecords])

  const hasFilters = groupQuery || typeFilter || textSearch

  const handleDelete = async (id) => {
    try {
      const res  = await fetch(`/api/billing/distributed?id=${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) { showToast('Record deleted'); fetchRecords() }
      else showToast(json.error || 'Delete failed', 'error')
    } catch (e) { showToast('Delete failed', 'error') }
    setDeletingId(null)
  }

  return (
    <div className="min-h-screen bg-slate-50/80 p-4 lg:p-6">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[99999] flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-bold border ${toast.type === 'error' ? 'bg-red-600 text-white border-red-700' : 'bg-emerald-600 text-white border-emerald-700'}`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
          {toast.msg}
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-5">

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Distribution Records</h1>
            </div>
            <p className="text-sm text-slate-400 font-medium ml-10">Search, filter and view all payment distribution reports</p>
          </div>
          <button
            onClick={fetchRecords}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-violet-500' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FileText}    label="Total Records"  value={stats.total}                                             iconCls="bg-slate-100 text-slate-600"   borderCls="border-slate-200" />
          <StatCard icon={IndianRupee} label="Total Amount"   value={fmtShort(stats.totalAmt)} sub={`₹${fmt(stats.totalAmt)}`} iconCls="bg-emerald-100 text-emerald-600" borderCls="border-emerald-200" />
          <StatCard icon={Hash}        label="Order Entries"  value={stats.totalEntries}                                      iconCls="bg-violet-100 text-violet-600"  borderCls="border-violet-200" />
          <StatCard icon={Building2}   label="Company Groups" value={groups.length}                                           iconCls="bg-blue-100 text-blue-600"      borderCls="border-blue-200" />
        </div>

        {/* Type Summary Strip */}
        <div className="grid grid-cols-3 gap-3">
          {stats.byType.map(t => (
            <div
              key={t.value}
              className={`rounded-xl border p-4 bg-white shadow-sm cursor-pointer transition-all hover:shadow-md ${typeFilter === t.value ? 'ring-2 ring-offset-1 ring-slate-900' : ''}`}
              onClick={() => setTypeFilter(v => v === t.value ? '' : t.value)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-black px-2.5 py-1 rounded-full border ${t.badgeCls}`}>{t.label}</span>
                <span className="text-xs font-bold text-slate-400">{t.count} records</span>
              </div>
              <p className="text-xl font-black text-slate-900">{fmtShort(t.amount)}</p>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">₹{fmt(t.amount)}</p>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <h2 className="text-sm font-bold text-slate-800">Search & Filter</h2>
            {hasFilters && (
              <span className="text-[10px] font-black text-violet-600 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full uppercase">Filters active</span>
            )}
          </div>
          <div className="p-5">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[220px]">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Company Group</label>
                <div className="relative">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input ref={groupInputRef} type="text" value={groupQuery} onChange={e => setGroupQuery(e.target.value)}
                    placeholder="Search company group…" list="grp-suggestions"
                    className="w-full pl-9 pr-8 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white font-medium text-slate-700 placeholder:text-slate-300" />
                  <datalist id="grp-suggestions">{groups.map(g => <option key={g} value={g} />)}</datalist>
                  {groupQuery && (
                    <button onClick={() => setGroupQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 hover:bg-slate-100 rounded-md">
                      <X className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  )}
                </div>
              </div>
              <div className="min-w-[340px]">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Payment Type</label>
                <div className="flex gap-1.5">
                  <button onClick={() => setTypeFilter('')} className={`flex-1 px-3 py-2.5 rounded-xl text-xs font-black border transition-all ${!typeFilter ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>All</button>
                  {PAYMENT_TYPES.map(t => (
                    <button key={t.value} onClick={() => setTypeFilter(v => v === t.value ? '' : t.value)}
                      className={`flex-1 px-3 py-2.5 rounded-xl text-xs font-black border transition-all whitespace-nowrap ${typeFilter === t.value ? t.activeCls + ' shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>
                      {t.shortLabel}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 min-w-[220px]">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Quick Search</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input type="text" value={textSearch} onChange={e => setTextSearch(e.target.value)}
                    placeholder="Order ID, company, month, date…"
                    className="w-full pl-9 pr-8 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white font-medium text-slate-700 placeholder:text-slate-300" />
                  {textSearch && (
                    <button onClick={() => setTextSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 hover:bg-slate-100 rounded-md">
                      <X className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  )}
                </div>
              </div>
              {hasFilters && (
                <button onClick={() => { setGroupQuery(''); setTypeFilter(''); setTextSearch('') }}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-50 text-rose-600 text-sm rounded-xl border border-rose-200 hover:bg-rose-100 font-bold transition-all self-end">
                  <X className="w-3.5 h-3.5" />Clear All
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-xl bg-violet-100 flex items-center justify-center">
                <FileText className="w-3.5 h-3.5 text-violet-600" />
              </div>
              <h2 className="text-sm font-bold text-slate-800">Records</h2>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
              {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''}
              {filteredRecords.length !== records.length && ` (of ${records.length})`}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
                <p className="text-sm text-slate-400 font-semibold">Loading records…</p>
              </div>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                <FileText className="w-7 h-7 text-slate-300" />
              </div>
              <p className="text-sm font-bold text-slate-500 mb-1">No records found</p>
              <p className="text-xs text-slate-400 text-center max-w-xs">
                {hasFilters ? 'Try clearing some filters, or' : ''} Submit payments from the Bulk Update page to create distribution records.
              </p>
              {hasFilters && (
                <button onClick={() => { setGroupQuery(''); setTypeFilter(''); setTextSearch('') }}
                  className="mt-3 text-xs font-bold text-violet-600 hover:text-violet-800 underline">
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {['#', 'Company Group', 'Billing Month', 'Payment Date', 'Method', 'Type', 'Total Amount', 'Monthly Amt', 'Entries', 'Submitted At', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3.5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.map((rec, idx) => {
                    const t      = typeInfo(rec.paymentType)
                    const pm     = getPaymentMethodMeta(rec.paymentMethod)
                    const PmIcon = pm.icon

                    // Monthly Amount = sum of (adjustedAmount + remainingAmount) across ALL entries' adjustments
                    const monthlyAmt = (rec.entries || []).reduce((sum, entry) => {
                      const entryTotal = getMonthlyTotal(entry)
                      return entryTotal !== null ? sum + entryTotal : sum
                    }, 0)
                    const hasMonthlyData = (rec.entries || []).some(e => (e.monthlyAdjustments || []).length > 0)

                    return (
                      <tr key={rec._id} className="hover:bg-violet-50/30 transition-colors group relative">
                        <td className="px-4 py-3.5 text-xs font-black text-slate-300">{idx + 1}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-violet-100 transition-colors">
                              <Building2 className="w-3.5 h-3.5 text-slate-500 group-hover:text-violet-600 transition-colors" />
                            </div>
                            <span className="font-black text-slate-800">{rec.companyGroup}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100">{rec.billingMonth}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg">{rec.paymentDate}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${pm.bg} ${pm.text}`}>
                            <PmIcon className="w-3 h-3" />{pm.label}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg border ${t.badgeCls}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${t.dotCls}`} />{t.label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-base font-black text-emerald-700">₹{fmt(rec.totalAmount)}</span>
                        </td>
                        {/* ── NEW: Monthly Amount column ── */}
                        <td className="px-4 py-3.5">
                          {hasMonthlyData ? (
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-violet-700">₹{fmt(monthlyAmt)}</span>
                              <span className="text-[9px] font-semibold text-slate-400 mt-0.5">adj + remaining</span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-300 font-semibold">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg">{rec.entryCount || 0} entries</span>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-400 font-medium whitespace-nowrap">{fmtCreatedAt(rec.createdAt)}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2 relative">
                            <button onClick={() => setViewRecord(rec)}
                              className="flex items-center gap-1.5 px-3.5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-black transition-all shadow-sm hover:shadow whitespace-nowrap">
                              <Eye className="w-3.5 h-3.5" />View Report
                            </button>
                            <div className="relative">
                              <button onClick={() => setDeletingId(v => v === rec._id ? null : rec._id)}
                                className="p-2 hover:bg-red-50 rounded-xl text-slate-300 hover:text-red-500 transition-colors border border-transparent hover:border-red-200">
                                <X className="w-3.5 h-3.5" />
                              </button>
                              {deletingId === rec._id && (
                                <DeleteConfirm onConfirm={() => handleDelete(rec._id)} onCancel={() => setDeletingId(null)} />
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {deletingId && <div className="fixed inset-0 z-40" onClick={() => setDeletingId(null)} />}
      {viewRecord && <ReportModal record={viewRecord} onClose={() => setViewRecord(null)} />}
    </div>
  )
}