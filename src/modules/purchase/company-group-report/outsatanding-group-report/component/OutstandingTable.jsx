'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import {
  FileText,
  Eye,
  ReceiptIndianRupee,
} from 'lucide-react'
import { ROUTES } from '@/constants/routes'

const fmt = (n) =>
  (n || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

// ── Row ─────────────────────────────────────────────
const OutstandingRow = ({ item, index }) => {
  const router = useRouter()

  const handleView = () => {
    router.push(
      `${ROUTES.purchase.outstandingReport}?companyGroupId=${item.companyGroupId}`
    )
  }
  const handleBulkPayment = () => {
    router.push(
      `${ROUTES.purchase.bulkPayment}?companyGroupId=${item.companyGroupId}`
    )
  }

  return (
    <tr className="hover:bg-rose-50/20 transition-colors border-b border-slate-100">

      {/* Sr */}
      <td className="px-4 py-3 text-sm font-semibold text-slate-600">
        {index + 1}
      </td>

      {/* Company */}
      <td className="px-4 py-3">
        <div className="font-bold text-slate-800 text-sm">
          {item.company || '—'}
        </div>

        <div className="text-xs text-slate-500 mt-1">
          {item.entity?.alias || '—'}
        </div>
      </td>

      {/* Orders */}
      <td className="px-4 py-3 text-center">
        <span className="inline-flex px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-sm font-bold">
          {item.totalOrders || 0}
        </span>
      </td>

      {/* Total Balance */}
      <td className="px-4 py-3 text-right">
        <span className="text-base font-extrabold text-rose-600 tabular-nums">
          ₹{fmt(item.totalBalance)}
        </span>
      </td>

      {/* Action */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-3">
          {/* View */}
          <button
            onClick={handleView}
            className="
                  group flex items-center gap-2
                  px-4 py-2.5
                  rounded-xl
                  bg-white
                  border border-slate-200
                  text-slate-700
                  text-xs font-semibold
                  shadow-sm
                  hover:shadow-lg
                  hover:border-violet-300
                  hover:bg-violet-50
                  hover:text-violet-700
                  transition-all duration-300
                   "
          >
            <Eye className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
            View
          </button>

          {/* Bulk Payment */}
          <button
            onClick={handleBulkPayment}
            className="
            group flex items-center gap-2
            px-4 py-2.5
            rounded-xl
            bg-gradient-to-r from-emerald-500 to-green-600
            text-white
            text-xs font-semibold
            shadow-md shadow-emerald-100
            hover:shadow-xl hover:shadow-emerald-200
            hover:-translate-y-0.5
            transition-all duration-300"
          >
            <ReceiptIndianRupee className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
            Bulk Pay
          </button>
        </div>
      </td>

    </tr>
  )
}

// ── Main Table ──────────────────────────────────────
const OutstandingTable = ({ data }) => {

  // ✅ API Shape
  const rows = data?.data?.data || data?.data || []

  if (!rows.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <FileText className="w-10 h-10 mb-3 text-slate-300" />
        <p className="text-sm font-medium">
          No outstanding records found
        </p>
      </div>
    )
  }

  const columns = [
    { label: 'Sr', align: 'left' },
    { label: 'Company', align: 'left' },
    { label: 'Orders', align: 'center' },
    { label: 'Total Balance', align: 'right' },
    { label: 'Action', align: 'center' },
  ]

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">

      <div className="overflow-x-auto">
        <table className="w-full">

          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-rose-50 border-b-2 border-gray-200">
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
              <OutstandingRow
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

export default OutstandingTable