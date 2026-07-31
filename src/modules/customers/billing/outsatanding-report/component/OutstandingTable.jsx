'use client'
import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { FileText, X, Info, FileSpreadsheet } from 'lucide-react'
import { truncateWithMore } from '@/modules/customers/billing/shared/buildListParams/utils'
import { ROUTES } from '@/constants/routes'

// ── helpers ───────────────────────────────────────────────────
const fmt = (n) =>
    (n || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })

const statusStyle = (status) => {
    switch (status) {
        case 'PAID':
        case 'Fully Paid':
            return { bg: 'bg-emerald-100 text-emerald-800 border border-emerald-200', dot: 'bg-emerald-500', label: 'Fully Paid' }
        case 'PARTIAL':
        case 'Partially Paid':
            return { bg: 'bg-amber-100 text-amber-800 border border-amber-200', dot: 'bg-amber-500', label: 'Partially Paid' }
        case 'UNPAID':
        case 'Not Paid':
        default:
            return { bg: 'bg-rose-100 text-rose-800 border border-rose-200', dot: 'bg-rose-500', label: 'Not Paid' }
    }
}

const getStateBadgeStyle = (state) => {
    const map = {
        'Delhi': 'bg-blue-50 text-blue-700 border-blue-200',
        'Maharashtra': 'bg-orange-50 text-orange-700 border-orange-200',
        'Karnataka': 'bg-purple-50 text-purple-700 border-purple-200',
        'Tamil Nadu': 'bg-pink-50 text-pink-700 border-pink-200',
        'Uttar Pradesh': 'bg-indigo-50 text-indigo-700 border-indigo-200',
        'Uttar pradesh': 'bg-indigo-50 text-indigo-700 border-indigo-200',
        'Haryana': 'bg-teal-50 text-teal-700 border-teal-200',
        'Punjab': 'bg-cyan-50 text-cyan-700 border-cyan-200',
        'Gujarat': 'bg-yellow-50 text-yellow-700 border-yellow-200',
        'West Bengal': 'bg-green-50 text-green-700 border-green-200',
        'Rajasthan': 'bg-rose-50 text-rose-700 border-rose-200',
        'Bihar': 'bg-amber-50 text-amber-700 border-amber-200',
        'Kerala': 'bg-emerald-50 text-emerald-700 border-emerald-200',
        'Andhra Pradesh': 'bg-lime-50 text-lime-700 border-lime-200',
        'Jharkhand': 'bg-green-50 text-green-700 border-green-200',
        'Goa': 'bg-sky-50 text-sky-700 border-sky-200',
    }
    return map[state] || 'bg-slate-100 text-slate-700 border-slate-200'
}

// ── Full Text Popup via Portal ────────────────────────────────
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

// ── Row Component ─────────────────────────────────────────────
const OrderRow = ({ item, index, showLsi }) => {
    const router = useRouter()
    const [popupText, setPopupText] = useState(null)
    const s = statusStyle(item.status)

    // ✅ Use currentState / currentStateCode from API (not endB state)
    const stateValue = item.currentState || item.endB?.state || item.endA?.state || '–'
    const stateBadge = getStateBadgeStyle(stateValue)

    // ✅ Fixed: was item.stateCode (undefined) → item.currentStateCode
    const buildQuery = () =>
        new URLSearchParams({
            orderId: item.orderId,
            billingReadId: item.billingReadId,
            stateCode: item.currentStateCode,
            circuitKey: item.circuitKey || '',
            ledgerName: 'outstanding',
        }).toString()

    const handleViewBreakdown = () => router.push(`${ROUTES.customers.billing.ledger.list}?${buildQuery()}`)
    const handleGenerate = () => router.push(`${ROUTES.customers.billing.ledger.list}?${buildQuery()}`)

    return (
        <tr className="hover:bg-blue-50/30 transition-colors border-b border-slate-100">
            {/* Order ID */}
            <td className="px-4 py-3">
                <span className="text-sm font-bold text-blue-600">{item.orderId}</span>
            </td>

            {/* ✅ Circuit ID column (was incorrectly reading item.lsi which doesn't exist) */}
            {showLsi && (
                <td className="px-4 py-2.5 text-sm text-orange-600 font-semibold">
                    {truncateWithMore(item.circuitId, 18, '...more', (t) => setPopupText(t))}
                </td>
            )}

            {/* END A */}
            <td className="px-4 py-3 text-sm text-slate-700">
                {truncateWithMore(item.endA?.address, 18, '...more', (t) => setPopupText(t))}
            </td>

            {/* END B */}
            <td className="px-4 py-3 text-sm text-slate-700">
                {truncateWithMore(item.endB?.address, 18, '...more', (t) => setPopupText(t))}
            </td>

            {/* Company */}
            <td className="px-4 py-3 max-w-50">
                {truncateWithMore(item.company, 18, '...more', (t) => setPopupText(t))}
            </td>

            <td className="px-4 py-3 max-w-50">
                {truncateWithMore(item?.additionalCompanyName || "-", 18, '...more', (t) => setPopupText(t))}
            </td>

            {/* Order Type */}
            <td className="px-4 py-3 text-sm font-semibold text-slate-700">
                {item.orderType || '—'}
            </td>

            {/* Entity */}
            <td className="px-4 py-3 text-sm font-semibold text-slate-700">
                {item.entity?.alias || '—'}
            </td>

            {/* Product */}
            <td className="px-4 py-3 text-sm font-semibold text-slate-700">
                {item.product || '—'}
            </td>

            {/* State — now correctly uses currentState */}
            <td className="px-4 py-3">
                <span className={`inline-flex px-3 py-1 text-xs font-bold rounded border ${stateBadge}`}>
                    {stateValue}
                </span>
            </td>

            {/* Balance */}
            <td className="px-4 py-3 text-right bg-yellow-50/60">
                <div className="flex items-center justify-end gap-2">
                    {/* ✅ balance is always a positive outstanding amount; rose is correct default */}
                    <span className={`text-base font-extrabold ${item.balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        ₹{fmt(item.balance)}
                    </span>
                    <button
                        onClick={handleViewBreakdown}
                        title="View breakdown"
                        className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                        <Info className="w-4 h-4 text-blue-500" />
                    </button>
                </div>
            </td>

            {/* Amount Status */}
            <td className="px-4 py-3 bg-slate-50/40">
                <div className="flex flex-col gap-0.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap w-fit ${s.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
                        {s.label}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium pl-1">
                        {item.product} · {item.entity?.alias}
                    </span>
                </div>
            </td>

            {/* Split % */}
            <td className="px-4 py-3 text-center">
                <span className="inline-flex px-3 py-1 bg-purple-50 text-purple-700 text-sm font-bold rounded">
                    {item.splitPercent}%
                </span>
            </td>

            {/* Actions */}
            <td className="px-4 py-3 text-center">
                <button
                    onClick={handleGenerate}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                >
                    <FileSpreadsheet className="w-4 h-4" />
                    Generate
                </button>
            </td>

            {/* Portal popup */}
            {popupText && (
                <td style={{ display: 'none' }}>
                    <TextPopup text={popupText} onClose={() => setPopupText(null)} />
                </td>
            )}
        </tr>
    )
}

// ── Main Table Component ──────────────────────────────────────
const OutstandingTable = ({ data, onRefetch, showLsi }) => {
    const rows = data?.data || []

    if (!rows.length) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <FileText className="w-10 h-10 mb-3 text-slate-300" />
                <p className="text-sm font-medium">No outstanding records found</p>
            </div>
        )
    }

    // ✅ Column header label corrected: "LSI ID" → "Circuit ID"
    const columns = [
        { label: 'Order ID', align: 'left' },
        ...(showLsi ? [{ label: 'Circuit ID', align: 'left' }] : []),
        { label: 'End A', align: 'left' },
        { label: 'End B', align: 'left' },
        { label: 'Company', align: 'left' },
        { label: 'Add. Company/Partner name', align: 'left' },
        { label: 'Order Type', align: 'left' },
        { label: 'Entity', align: 'left' },
        { label: 'Product', align: 'left' },
        { label: 'State', align: 'left' },
        { label: 'Balance', align: 'right' },
        { label: 'Amount Status', align: 'left' },
        { label: 'Split', align: 'center' },
        { label: 'Actions', align: 'center' },
    ]

    return (
        <div className="flex flex-col gap-3">
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gradient-to-r from-gray-50 to-blue-50 border-b-2 border-gray-200">
                                {columns.map(({ label, align }) => (
                                    <th
                                        key={label}
                                        className={`px-4 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider text-${align}`}
                                    >
                                        {label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {rows.map((item, index) => (
                                <OrderRow
                                    // ✅ Fixed key: was item.stateCode (undefined) → item.currentStateCode
                                    key={`${item.orderId}-${item.currentStateCode}-${index}`}
                                    item={item}
                                    index={index}
                                    showLsi={showLsi}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default OutstandingTable