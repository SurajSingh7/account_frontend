'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { FileText } from 'lucide-react'

const fmt = (n) =>
  (n || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

// ── Row ─────────────────────────────────────────────
const ReceiptRow = ({ item, index }) => {
  const router = useRouter()

  const handleView = () => {
    router.push(
      `/billing/account/receipt-report?companyGroupId=${item.companyGroupId}`
    )
  }

  return (
    <tr className="hover:bg-emerald-50/20 transition-colors border-b border-slate-100">

      {/* Sr */}
      <td className="px-4 py-3 text-sm font-semibold text-slate-600">
        {index + 1}
      </td>

      {/* Company */}
      <td className="px-4 py-3">
        <div className="font-bold text-slate-800 text-sm">
          {item.company || '—'}
        </div>
      </td>

      {/* Orders */}
      <td className="px-4 py-3 text-center">
        <span className="inline-flex px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-sm font-bold">
          {item.totalOrders || 0}
        </span>
      </td>

      {/* Received */}
      <td className="px-4 py-3 text-right">
        <span className="text-base font-extrabold text-emerald-600 tabular-nums">
          ₹{fmt(item.totalReceived)}
        </span>
      </td>

      {/* TDS Confirm */}
      <td className="px-4 py-3 text-right bg-indigo-50/40">
        <span className="text-base font-extrabold text-indigo-600 tabular-nums">
          ₹{fmt(item.totalTdsConfirm)}
        </span>
      </td>

      {/* TDS Provision */}
      <td className="px-4 py-3 text-right bg-orange-50/40">
        <span className="text-base font-extrabold text-orange-600 tabular-nums">
          ₹{fmt(item.totalTdsProvision)}
        </span>
      </td>

      {/* Total Receipts */}
      <td className="px-4 py-3 text-right bg-green-50/40">
        <span className="text-base font-extrabold text-green-700 tabular-nums">
          ₹{fmt(item.totalReceipts)}
        </span>
      </td>

      {/* Action */}
      <td className="px-4 py-3 text-center">
        <button
          onClick={handleView}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition-all"
        >
          View
        </button>
      </td>

    </tr>
  )
}

// ── Main Table ──────────────────────────────────────
const ReceiptTable = ({ data }) => {
  // ✅ API Shape
  const rows = data?.data?.data || data?.data || []

  if (!rows.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <FileText className="w-10 h-10 mb-3 text-slate-300" />
        <p className="text-sm font-medium">
          No receipt records found
        </p>
      </div>
    )
  }

  const columns = [
    { label: 'Sr', align: 'left' },
    { label: 'Company', align: 'left' },
    { label: 'Orders', align: 'center' },
    { label: 'Received', align: 'right' },
    { label: 'TDS Confirm', align: 'right' },
    { label: 'TDS Provision', align: 'right' },
    { label: 'Total Receipts', align: 'right' },
    { label: 'Action', align: 'center' },
  ]

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">

          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-emerald-50 border-b-2 border-gray-200">
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
              <ReceiptRow
                key={`${item.companyGroupId}-${index}`}
                item={item}
                index={index}
              />
            ))}
          </tbody>

        </table>
      </div>
    </div>
  )
}

export default ReceiptTable