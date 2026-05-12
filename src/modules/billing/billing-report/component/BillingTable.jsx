'use client'
import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { FileText, X, Info } from 'lucide-react'
import { truncateWithMore } from '@/modules/billing/shared/buildListParams/utils'

const fmt = (n) =>
  (n || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

const getStateBadgeStyle = (state) => {
  const map = {
    'Delhi':          'bg-blue-50 text-blue-700 border-blue-200',
    'Maharashtra':    'bg-orange-50 text-orange-700 border-orange-200',
    'Karnataka':      'bg-purple-50 text-purple-700 border-purple-200',
    'Tamil Nadu':     'bg-pink-50 text-pink-700 border-pink-200',
    'Uttar Pradesh':  'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Uttar pradesh':  'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Haryana':        'bg-teal-50 text-teal-700 border-teal-200',
    'Punjab':         'bg-cyan-50 text-cyan-700 border-cyan-200',
    'Gujarat':        'bg-yellow-50 text-yellow-700 border-yellow-200',
    'West Bengal':    'bg-green-50 text-green-700 border-green-200',
    'Rajasthan':      'bg-rose-50 text-rose-700 border-rose-200',
    'Bihar':          'bg-amber-50 text-amber-700 border-amber-200',
    'Kerala':         'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Andhra Pradesh': 'bg-lime-50 text-lime-700 border-lime-200',
    'Goa':            'bg-sky-50 text-sky-700 border-sky-200',
  }
  return map[state] || 'bg-slate-100 text-slate-700 border-slate-200'
}

// ── Text Popup ────────────────────────────────────────────────
const TextPopup = ({ text, onClose }) => {
  React.useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[70vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <p className="font-semibold text-slate-800">Full Text</p>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <p className="px-5 py-4 text-sm text-slate-700 break-words whitespace-pre-wrap">{text}</p>
      </div>
    </div>,
    document.body
  )
}

// ── Row ───────────────────────────────────────────────────────
const BillingRow = ({ item }) => {
  const router = useRouter()
  const [popupText, setPopupText] = useState(null)

  const getStateByCode = (code) => {
    if (item.endA?.stateCode === code) return item.endA.state
    if (item.endB?.stateCode === code) return item.endB.state
    return item.endB?.state || item.endA?.state || '–'
  }

  const stateValue = getStateByCode(item.stateCode)
  const stateBadge = getStateBadgeStyle(stateValue)

  const buildQuery = () =>
    new URLSearchParams({
      orderId:       item.orderId,
      billingReadId: item.billingReadId,
      dsrId:         item.dsrId,
      circuitKey:    item.circuitKey || '',
      ledgerName:"bill"
    }).toString()

  const handleViewBreakdown = () => router.push(`/billing/account/ledger?${buildQuery()}`)

  // ✅ Normalized field access for new API shape
  const billingAmt    = item.billing    ?? 0
  const miscAmt       = item.miscCharge ?? 0   // was: item.misc
  const creditNoteAmt = item.creditNote ?? 0   // was: item.creditNotes
  const netBillingAmt = item.netBilling ?? 0

  return (
    <>
      <tr className="hover:bg-indigo-50/20 transition-colors border-b border-slate-100">

        {/* Order ID */}
        <td className="px-4 py-2.5">
          <span className="text-sm font-bold text-blue-600">{item.orderId}</span>
        </td>

        {/* End A */}
        <td className="px-4 py-2.5 text-sm text-slate-700">
          {truncateWithMore(item.endA?.address, 18, '...more', (t) => setPopupText(t))}
        </td>

        {/* End B */}
        <td className="px-4 py-2.5 text-sm text-slate-700">
          {truncateWithMore(item.endB?.address, 18, '...more', (t) => setPopupText(t))}
        </td>

        {/* Company */}
        <td className="px-4 py-2.5 max-w-[200px]">
          {truncateWithMore(item.company, 18, '...more', (t) => setPopupText(t))}
        </td>

        {/* State */}
        <td className="px-4 py-2.5">
          <span className={`inline-flex px-3 py-1 text-xs font-bold rounded border ${stateBadge}`}>
            {stateValue}
          </span>
        </td>

        {/* Billing */}
        <td className="px-4 py-2.5 text-right">
          <span className="text-base font-extrabold text-indigo-600 tabular-nums">
            ₹{fmt(billingAmt)}
          </span>
        </td>

        {/* Misc */}
        <td className="px-4 py-2.5 text-right bg-purple-50/40">
          <span className="text-base font-extrabold text-purple-600 tabular-nums">
            ₹{fmt(miscAmt)}
          </span>
        </td>

        {/* Credit Notes incl. GST */}
        <td className="px-4 py-2.5 text-right bg-cyan-50/40">
          <span className="text-base font-extrabold text-cyan-700 tabular-nums">
            ₹{fmt(creditNoteAmt)}
          </span>
        </td>

        {/* Net Billing + Info button */}
        <td className="px-4 py-2.5 text-right bg-rose-50/40">
          <div className="flex items-center justify-end gap-2">
            <span className="text-base font-extrabold text-rose-600 tabular-nums">
              ₹{fmt(netBillingAmt)}
            </span>
            <button
              onClick={handleViewBreakdown}
              title="View breakdown"
              className="p-1.5 hover:bg-rose-100 rounded-lg transition-colors"
            >
              <Info className="w-4 h-4 text-rose-400" />
            </button>
          </div>
        </td>

        {/* Split % */}
        <td className="px-4 py-2.5 text-center">
          <span className="inline-flex px-3 py-1 bg-purple-50 text-purple-700 text-sm font-bold rounded">
            {item.splitPercent}%
          </span>
        </td>

      </tr>

      {popupText && (
        <TextPopup text={popupText} onClose={() => setPopupText(null)} />
      )}
    </>
  )
}

// ── Main Table ────────────────────────────────────────────────
const BillingTable = ({ data }) => {
  // ✅ API shape: data.data.data is the rows array
  const rows = data?.data?.data || data?.data || []

  if (!rows.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <FileText className="w-10 h-10 mb-3 text-slate-300" />
        <p className="text-sm font-medium">No billing records found</p>
      </div>
    )
  }

  const columns = [
    { label: 'Order ID',                 align: 'left'   },
    { label: 'End A',                    align: 'left'   },
    { label: 'End B',                    align: 'left'   },
    { label: 'Company',                  align: 'left'   },
    { label: 'State',                    align: 'left'   },
    { label: 'Billing',                  align: 'right'  },
    { label: 'Misc',                     align: 'right'  },
    { label: 'Credit Notes (incl. GST)', align: 'right'  },
    { label: 'Net Billing',              align: 'right'  },
    { label: 'Split',                    align: 'center' },
  ]

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-indigo-50 border-b-2 border-gray-200">
              {columns.map(({ label, align }) => (
                <th
                  key={label}
                  className={`px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider text-${align}`}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {rows.map((item, index) => (
              <BillingRow
                key={`${item.orderId}-${item.stateCode}-${index}`}
                item={item}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default BillingTable