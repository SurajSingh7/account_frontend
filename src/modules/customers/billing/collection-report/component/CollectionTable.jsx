'use client'
import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { FileText, X, Info } from 'lucide-react'
import { truncateWithMore } from '@/modules/customers/billing/shared/buildListParams/utils'
import { ROUTES } from '@/constants/routes'

const fmt = (n) =>
    (n || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })

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
        'Goa': 'bg-sky-50 text-sky-700 border-sky-200',
        'Jharkhand': 'bg-orange-50 text-orange-700 border-orange-200',
    }
    return map[state] || 'bg-slate-100 text-slate-700 border-slate-200'
}

// ── Full Text Popup ───────────────────────────────────────────
const TextPopup = ({ text, onClose }) => {
    React.useEffect(() => {
        const h = (e) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', h)
        return () => document.removeEventListener('keydown', h)
    }, [onClose])

    return createPortal(
        <div
            className="fixed inset-0 bg-black/50 z-9999 flex items-center justify-center p-4"
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
                <p className="px-5 py-4 text-sm text-slate-700 wrap-break-word whitespace-pre-wrap">{text}</p>
            </div>
        </div>,
        document.body
    )
}

// ── Row ───────────────────────────────────────────────────────

const CollectionRow = ({ item }) => {
    const router = useRouter();
    const [popupText, setPopupText] = useState(null);

    const addresses = Array.isArray(item.installationAddress)
        ? item.installationAddress
        : [];

    const endA =
        item.endA ||
        addresses.find(address => address.label?.toUpperCase() === "END-A");

    const endB =
        item.endB ||
        addresses.find(address => address.label?.toUpperCase() === "END-B");

    const companyName =
        typeof item.company === "string"
            ? item.company
            : item.company?.name || item.companyName || "—";

    const productName =
        typeof item.product === "string"
            ? item.product
            : item.product?.code || "—";

    const entityName =
        typeof item.entity === "string"
            ? item.entity
            : item.entity?.alias || item.entity?.name || "—";

    const stateValue =
        item.currentState ||
        endB?.state ||
        endA?.state ||
        item.entity?.state ||
        "—";

    const stateBadge = getStateBadgeStyle(stateValue);

    const buildQuery = () =>
        new URLSearchParams({
            orderId: String(item.orderId ?? ""),
            billingReadId: String(item.billingReadId ?? ""),
            dsrId: String(item.dsrId ?? ""),
            circuitKey: String(item.circuitKey ?? ""),
            companyName: companyName === "—" ? "" : companyName,
            ledgerName: "outstanding",
        }).toString();

    const handleViewBreakdown = () =>
        router.push(`${ROUTES.customers.billing.ledger.list}?${buildQuery()}`);

    const previousMonthOutstanding = item.previousMonthOutstanding ?? 0;
    const currentMonthBilling = item.currentMonthBilling ?? 0;
    const paymentReceived = item.paymentReceived ?? 0;
    const totalOutstanding = item.totalOutstanding ?? 0;
    const netOutstanding = item.netOutstanding ?? 0;

    return (
        <>
            <tr className="hover:bg-emerald-50/20 transition-colors border-b border-slate-100">
                <td className="px-4 py-2.5">
                    <span className="text-sm font-bold text-blue-600">
                        {item.orderId ?? "—"}
                    </span>
                </td>

                {/* Customer Company */}
                <td className="px-4 py-2.5 max-w-50 text-sm text-slate-700">
                    {truncateWithMore(
                        companyName,
                        18,
                        "...more",
                        setPopupText
                    )}
                </td>

                {/* Order Type */}
                <td className="px-4 py-2.5 text-sm font-semibold text-slate-700">
                    {item.orderType || "—"}
                </td>

                {/* Entity */}
                <td className="px-4 py-2.5 text-sm font-semibold text-slate-700">
                    {entityName}
                </td>

                {/* Product */}
                <td className="px-4 py-2.5 text-sm font-semibold text-slate-700">
                    {productName}
                </td>

                {/* State */}
                <td className="px-4 py-2.5">
                    <span
                        className={`inline-flex px-3 py-1 text-xs font-bold rounded border ${stateBadge}`}
                    >
                        {stateValue}
                    </span>
                </td>

                <td className="px-4 py-2.5 text-right">
                    <span className="text-base font-extrabold text-orange-600 tabular-nums">
                        ₹{fmt(previousMonthOutstanding)}
                    </span>
                </td>

                <td className="px-4 py-2.5 text-right bg-indigo-50/40">
                    <span className="text-base font-extrabold text-blue-600 tabular-nums">
                        ₹{fmt(currentMonthBilling)}
                    </span>
                </td>

                <td className="px-4 py-2.5 text-right bg-green-50/60">
                    <div className="flex items-center justify-end gap-2">
                        <span className="text-base font-extrabold text-red-500 tabular-nums">
                            ₹{fmt(totalOutstanding)}
                        </span>


                    </div>
                </td>
                <td className="px-4 py-2.5 text-right bg-orange-50/40">
                    <span className="text-base font-extrabold text-green-600 tabular-nums">
                        ₹{fmt(paymentReceived)}
                    </span>
                </td>
                <td className="px-4 py-2.5 text-right bg-orange-50/40">
                    ₹{fmt(netOutstanding)}
                    <button
                        type="button"
                        onClick={handleViewBreakdown}
                        title="View breakdown"
                        className="p-1.5 hover:bg-green-100 rounded-lg transition-colors"
                    >
                        <Info className="w-4 h-4 text-purple-500" />
                    </button>
                </td>
            </tr>

            {popupText && (
                <TextPopup
                    text={popupText}
                    onClose={() => setPopupText(null)}
                />
            )}
        </>
    );
};


const CollectionTable = (data) => {
    const rows = data?.data?.data || data?.data || [];

    if (!rows.length) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <FileText className="w-10 h-10 mb-3 text-slate-300" />
                <p className="text-sm font-medium">No receipt records found</p>
            </div>
        )
    }

    const columns = [
        { label: 'Order ID', align: 'left' },
        { label: 'Company', align: 'left' },
        { label: 'Order Type', align: 'left' },
        { label: 'Entity', align: 'left' },
        { label: 'Product', align: 'left' },
        { label: 'State', align: 'left' },
        { label: 'Prev. month outstanding', align: 'right' },
        { label: 'Curr. month billing', align: 'right' },
        { label: 'Total outstanding', align: 'right' },
        { label: 'Received', align: 'right' },
        { label: 'Net outstanding', align: 'right' },
    ]

    return (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-linear-to-r from-gray-50 to-emerald-50 border-b-2 border-gray-200">
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
                            <CollectionRow
                                key={`${item.circuitKey}-${index}`}
                                item={item}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default CollectionTable