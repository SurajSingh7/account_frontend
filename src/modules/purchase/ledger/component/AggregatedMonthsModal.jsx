'use client'
import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Calendar } from 'lucide-react'

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

const fmt = (n) =>
  (n || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

const fmtDate = (iso) => {
  if (!iso) return '–'
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`
}

const AggregatedMonthsModal = ({ aggregatedMonths = [], monthYear, totalDays, onClose }) => {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Flatten all bills into rows with their month context
  const allRows = aggregatedMonths.flatMap((am) => {
    const monthLabel = `${MONTH_NAMES[(am.billingMonth ?? 1) - 1]}-${am.billingYear}`
    return (am.bills ?? []).map((bill) => ({ ...bill, monthLabel, amDays: am.billingDays, amStart: am.billingStartDate, amEnd: am.billingEndDate }))
  })

  // Totals
  const grandBasic = allRows.reduce((s, b) => s + (b.basicAmount ?? 0), 0)
  const grandIgst  = allRows.reduce((s, b) => s + (b.igst ?? 0), 0)
  const grandCgst  = allRows.reduce((s, b) => s + (b.cgst ?? 0), 0)
  const grandSgst  = allRows.reduce((s, b) => s + (b.sgst ?? 0), 0)
  const grandTotal = allRows.reduce((s, b) => s + (b.totalAmount ?? 0), 0)

  const modal = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-6"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(3px)' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden border border-orange-100"
        style={{ width: '70vw', maxHeight: '82vh' }}
        onMouseDown={(e) => e.stopPropagation()}
      >

        {/* ── Modal Header — light orange ── */}
        <div className="flex items-center justify-between px-5 py-3.5 shrink-0"
          style={{ background: 'linear-gradient(90deg, #fff7ed 0%, #ffedd5 100%)', borderBottom: '2px solid #fed7aa' }}>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-orange-100 border border-orange-200 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-orange-900">Aggregated Months Breakdown</h2>
              {monthYear && (
                <p className="text-orange-600 text-xs mt-0.5">
                  Billing Period: <span className="font-semibold">{monthYear}</span>
                  {totalDays && <span className="ml-2">· <span className="font-semibold">{totalDays} total days</span></span>}
                  <span className="ml-2">· <span className="font-semibold">{aggregatedMonths.length} month{aggregatedMonths.length !== 1 ? 's' : ''}</span></span>
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center bg-orange-100 hover:bg-orange-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-orange-600" />
          </button>
        </div>

        {/* ── Table ── */}
        <div className="overflow-auto flex-1">
          <table className="w-full text-sm border-collapse">

            {/* Column header — matches ledger table style */}
            <thead className="sticky top-0 z-10">
              <tr style={{ background: 'linear-gradient(90deg, #fff7ed 0%, #ffedd5 100%)', borderBottom: '2px solid #fed7aa' }}>
                <th className="px-4 py-3 text-left text-xs font-bold text-orange-800 uppercase tracking-wider whitespace-nowrap">
                  Billing Month
                </th>
                <th className="px-4 py-3 text-center text-xs font-bold text-orange-800 uppercase tracking-wider whitespace-nowrap">
                  Days
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-orange-800 uppercase tracking-wider whitespace-nowrap">
                  Period
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold text-orange-800 uppercase tracking-wider whitespace-nowrap">
                  Basic Bill
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold text-orange-800 uppercase tracking-wider whitespace-nowrap">
                  CGST (9%)
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold text-orange-800 uppercase tracking-wider whitespace-nowrap">
                  SGST (9%)
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold text-orange-800 uppercase tracking-wider whitespace-nowrap">
                  IGST (18%)
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold text-orange-800 uppercase tracking-wider whitespace-nowrap">
                  Basic + GST
                </th>
                <th className="px-4 py-3 text-center text-xs font-bold text-orange-800 uppercase tracking-wider whitespace-nowrap">
                  Prorated
                </th>
              </tr>
            </thead>

            {/* Rows — grouped by month with a subtle divider between months */}
            <tbody className="bg-white">
              {aggregatedMonths.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-slate-400">
                    No aggregated month data available.
                  </td>
                </tr>
              ) : (
                aggregatedMonths.map((am, amIdx) => {
                  const monthLabel = `${MONTH_NAMES[(am.billingMonth ?? 1) - 1]}-${am.billingYear}`
                  const bills = am.bills ?? []

                  return (
                    <React.Fragment key={amIdx}>
                      {bills.length > 0 ? (
                        bills.map((bill, bIdx) => (
                          <tr
                            key={`${amIdx}-${bIdx}`}
                            className="border-b border-slate-100 hover:bg-orange-50/30 transition-colors"
                          >
                            {/* Billing Month — only show on first bill of this month */}
                            <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">
                              {bIdx === 0 ? (
                                <span className="inline-flex items-center gap-1.5">
                                  {monthLabel}
                                  {bill.isProrated && (
                                    <span className="bg-amber-100 text-amber-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                                      Prorated
                                    </span>
                                  )}
                                </span>
                              ) : ''}
                            </td>

                            {/* Days — only show on first bill */}
                            <td className="px-4 py-3 text-center font-bold text-slate-700">
                              {bIdx === 0 ? (
                                <span className="inline-flex items-center justify-center gap-1">
                                  <span>{am.billingDays}</span>
                                </span>
                              ) : ''}
                            </td>

                            {/* Period */}
                            <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                              <div>{fmtDate(bill.billingStartDate)}</div>
                              <div>{fmtDate(bill.billingEndDate)}</div>
                            </td>

                            {/* Basic Bill */}
                            <td className="px-4 py-3 text-right font-bold text-slate-800">
                              ₹{fmt(bill.basicAmount)}
                            </td>

                            {/* CGST */}
                            <td className="px-4 py-3 text-right text-slate-600">
                              {bill.cgst > 0
                                ? `₹${fmt(bill.cgst)}`
                                : <span className="text-slate-300">₹0.00</span>}
                            </td>

                            {/* SGST */}
                            <td className="px-4 py-3 text-right text-slate-600">
                              {bill.sgst > 0
                                ? `₹${fmt(bill.sgst)}`
                                : <span className="text-slate-300">₹0.00</span>}
                            </td>

                            {/* IGST */}
                            <td className="px-4 py-3 text-right text-slate-600">
                              {bill.igst > 0
                                ? `₹${fmt(bill.igst)}`
                                : <span className="text-slate-300">₹0.00</span>}
                            </td>

                            {/* Basic + GST */}
                            <td className="px-4 py-3 text-right font-bold text-indigo-600">
                              ₹{fmt(bill.totalAmount)}
                            </td>

                            {/* Prorated */}
                            <td className="px-4 py-3 text-center">
                              {bill.isProrated ? (
                                <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full">
                                  Yes
                                </span>
                              ) : (
                                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
                                  No
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr className="border-b border-slate-100">
                          <td className="px-4 py-3 font-semibold text-slate-900">{monthLabel}</td>
                          <td className="px-4 py-3 text-center text-slate-500">{am.billingDays}</td>
                          <td colSpan={7} className="px-4 py-3 text-xs text-slate-400">No bills for this month.</td>
                        </tr>
                      )}

                      {/* Subtle month-group separator (not after last group) */}
                      {amIdx < aggregatedMonths.length - 1 && (
                        <tr>
                          <td colSpan={9} className="p-0">
                            <div style={{ height: 1, background: '#fed7aa', opacity: 0.6 }} />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })
              )}
            </tbody>

            {/* ── TOTAL footer row ── */}
            <tfoot className="sticky bottom-0">
              <tr style={{ background: 'linear-gradient(90deg, #fff7ed 0%, #ffedd5 100%)', borderTop: '2px solid #fed7aa' }}>
                <td className="px-4 py-3 text-sm font-extrabold text-orange-900">TOTAL</td>
                <td className="px-4 py-3" />
                <td className="px-4 py-3" />
                <td className="px-4 py-3 text-right text-sm font-extrabold text-slate-900">
                  ₹{fmt(grandBasic)}
                </td>
                <td className="px-4 py-3 text-right text-sm font-extrabold text-slate-700">
                  ₹{fmt(grandCgst)}
                </td>
                <td className="px-4 py-3 text-right text-sm font-extrabold text-slate-700">
                  ₹{fmt(grandSgst)}
                </td>
                <td className="px-4 py-3 text-right text-sm font-extrabold text-slate-700">
                  ₹{fmt(grandIgst)}
                </td>
                <td className="px-4 py-3 text-right text-sm font-extrabold text-indigo-700">
                  ₹{fmt(grandTotal)}
                </td>
                <td className="px-4 py-3" />
              </tr>
            </tfoot>
          </table>
        </div>

      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

export default AggregatedMonthsModal