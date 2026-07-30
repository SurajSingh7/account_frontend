'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/constants/routes'

const BillingList = ({ data, loading, error }) => {
  const router = useRouter()

  const rows = data?.data?.data || data?.data || []

  const fmt = (n) =>
    (n || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

  const columns = [
    { label: 'Sr', align: 'left' },
    { label: 'Company', align: 'left' },
    { label: 'Orders', align: 'center' },
    { label: 'Billing', align: 'right' },
    { label: 'Misc', align: 'right' },
    { label: 'Credit Note', align: 'right' },
    { label: 'Net Billing', align: 'right' },
    { label: 'Action', align: 'center' },
  ]

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
        <p className="text-gray-500 font-medium">Loading billing report...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-red-200 p-10 text-center">
        <p className="text-red-500 font-semibold">
          Failed to load billing report.
        </p>
      </div>
    )
  }

  if (!rows.length) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
        <p className="text-lg font-semibold text-gray-600">
          No billing records found
        </p>
        <p className="text-sm text-gray-400 mt-1">
          Try adjusting your filters
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.label}
                  className={`px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap
                    ${
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                    }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {rows.map((item, index) => (
              <tr
                key={`${item.companyGroupId}-${index}`}
                className="hover:bg-gray-50 transition-colors"
              >
                {/* Sr */}
                <td className="px-4 py-3 text-sm font-semibold text-gray-700">
                  {index + 1}
                </td>

                {/* Company */}
                <td className="px-4 py-3">
                  <div className="font-semibold text-gray-900">
                    {item.company || '-'}
                  </div>
                </td>

                {/* Orders */}
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center justify-center min-w-[36px] h-8 px-2 rounded-full bg-gray-100 text-gray-700 text-sm font-bold">
                    {item.totalOrders || 0}
                  </span>
                </td>

                {/* Billing */}
                <td className="px-4 py-3 text-right">
                  <span className="font-bold text-indigo-600 tabular-nums">
                    ₹{fmt(item.totalBilling)}
                  </span>
                </td>

                {/* Misc */}
                <td className="px-4 py-3 text-right">
                  <span className="font-semibold text-purple-600 tabular-nums">
                    ₹{fmt(item.totalMiscCharge)}
                  </span>
                </td>

                {/* Credit Note */}
                <td className="px-4 py-3 text-right">
                  <span className="font-semibold text-cyan-600 tabular-nums">
                    ₹{fmt(item.totalCreditNote)}
                  </span>
                </td>

                {/* Net Billing */}
                <td className="px-4 py-3 text-right">
                  <span className="font-bold text-rose-600 tabular-nums">
                    ₹{fmt(item.totalNetBilling)}
                  </span>
                </td>

                {/* Action */}
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() =>
                      router.push(
                        `${ROUTES.customers.billing.billingReport}?companyGroupId=${item.companyGroupId}`
                      )
                    }
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default BillingList