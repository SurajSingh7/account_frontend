'use client'
import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, History, User, ArrowRight, Loader2, AlertCircle, FileText } from 'lucide-react'
import { API_BACKEND_URL } from '@/config/getEnvVariables'
import { API_ENDPOINTS } from '@/constants/api'

// ── helpers ───────────────────────────────────────────────────
const fmt = (n) =>
    n == null
        ? '—'
        : Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const fmtDate = (iso) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    })
}

const ALLOWED_FIELDS = ['totalAmount', 'notes']

const FIELD_LABELS = {
    totalAmount: 'Total Amount',
    notes: 'Notes',
}

const renderFieldValue = (field, val) => {
    if (val == null || val === '')
        return <span className="italic opacity-50">empty</span>
    if (field === 'totalAmount')
        return <span>₹{fmt(val)}</span>
    return <span className="break-words whitespace-pre-wrap">{String(val)}</span>
}

// ── Single history entry card ─────────────────────────────────
const HistoryEntry = ({ entry, sno }) => {
    const {
        changedBy, changedFields = [], previousData,
        currentData, createdAt, changeType
    } = entry

    const visibleFields = changedFields.filter(f => ALLOWED_FIELDS.includes(f))
    if (visibleFields.length === 0) return null

    return (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* Card Header — S.No + type + changeType + Date (moved here) */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-2 flex-wrap">
                    {/* S.No */}
                    <span className="w-6 h-6 rounded-full bg-slate-700 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                        {sno}
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg border bg-blue-50 text-blue-700 border-blue-200">
                        OPENING ADJUSTMENT
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                        {changeType}
                    </span>
                    {/* ✅ Date shown here (moved from top-right) */}
                    <span className="text-[11px] text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                        {fmtDate(createdAt)}
                    </span>
                </div>

                {/* ✅ Changed By shown here (replaced date) */}
                {changedBy?.name && (
                    <div className="flex items-center gap-1.5 ml-3 flex-shrink-0">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[11px] font-bold text-slate-700 leading-none">
                                {changedBy.name}
                            </span>
                            {changedBy.email && (
                                <span className="text-[10px] text-slate-400 leading-none mt-0.5">
                                    {changedBy.email}
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Changed fields diff */}
            <div className="px-4 py-4 flex flex-col gap-4">
                {visibleFields.map((field) => (
                    <div key={field} className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {FIELD_LABELS[field]}
                        </span>
                        <div className="flex items-start gap-2">
                            {/* Before */}
                            <div className="flex-1 flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Before</span>
                                <div className="px-3 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-mono line-through leading-relaxed min-h-[36px]">
                                    {renderFieldValue(field, previousData?.[field])}
                                </div>
                            </div>
                            {/* Arrow */}
                            <div className="pt-6 flex-shrink-0">
                                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                            </div>
                            {/* After */}
                            <div className="flex-1 flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">After</span>
                                <div className="px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-mono font-semibold leading-relaxed min-h-[36px]">
                                    {renderFieldValue(field, currentData?.[field])}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {/* ✅ changeReason removed completely */}
            </div>
        </div>
    )
}

// ── Main Modal ────────────────────────────────────────────────
const TransactionHistoryModal = ({ circuitKey, onClose, onDataLoaded }) => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!circuitKey) return
        const fetchHistory = async () => {
            setLoading(true)
            setError(null)
            try {
                const res = await fetch(
                    `${API_BACKEND_URL}${API_ENDPOINTS.customers.billing.ledger.transactionsHistory}/${circuitKey}?transactionType=OPENING_ADJUSTMENT`,
                    { credentials: 'include' }
                )
                const json = await res.json()
                if (!res.ok) throw new Error(json?.message || `Failed (${res.status})`)
                setData(json.data)
                onDataLoaded?.(json.data)
            } catch (err) {
                setError(err.message || 'Failed to load history')
            } finally {
                setLoading(false)
            }
        }
        fetchHistory()
    }, [circuitKey])

    useEffect(() => {
        const h = (e) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', h)
        return () => document.removeEventListener('keydown', h)
    }, [onClose])

    const allEntries = data?.data || []

    const visibleEntries = allEntries.filter(entry =>
        (entry.currentTransaction?.type || entry.previousData?.type) === 'OPENING_ADJUSTMENT' &&
        entry.changedFields?.some(f => ALLOWED_FIELDS.includes(f))
    )

    const summary = data?.summary

    // ✅ Current amount & notes from first entry's currentTransaction
    const latestTx = allEntries.find(e =>
        (e.currentTransaction?.type || e.previousData?.type) === 'OPENING_ADJUSTMENT'
    )?.currentTransaction

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-slate-700 to-slate-800 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                            <History className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white">Opening Adjustment History</h3>
                            <p className="text-[11px] text-slate-300 font-mono mt-0.5">{circuitKey}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* ✅ Summary strip — Relevant Changes + Current Amount + Current Notes + Last Changed */}
                {!loading && !error && (
                    <div className="grid grid-cols-4 divide-x divide-slate-200 border-b border-slate-200 flex-shrink-0 bg-slate-50">
                        {/* Relevant Changes (replaces Total Changes) */}
                        <div className="flex flex-col px-6 py-3.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Relevant Changes</span>
                            <span className="text-xl font-bold text-slate-800 mt-0.5">{visibleEntries.length}</span>
                        </div>

                        {/* Current Amount (replaces Transactions) */}
                        <div className="flex flex-col px-6 py-3.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Amount</span>
                            <span className="text-xl font-bold text-slate-800 mt-0.5">
                                {latestTx?.totalAmount != null
                                    ? `₹${fmt(latestTx.totalAmount)}`
                                    : '—'}
                            </span>
                        </div>

                        {/* Current Notes */}
                        <div className="flex flex-col px-6 py-3.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Notes</span>
                            <span className="text-sm font-semibold text-slate-800 mt-1 truncate">
                                {latestTx?.notes || <span className="text-slate-400 font-normal italic">No notes</span>}
                            </span>
                        </div>

                        {/* Last Changed By */}
                        <div className="flex flex-col px-6 py-3.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Changed By</span>
                            <span className="text-sm font-bold text-slate-800 mt-1 truncate">
                                {summary?.recentActivity?.lastChangedBy?.name || '—'}
                            </span>
                            <span className="text-[11px] text-slate-400 truncate">
                                {fmtDate(summary?.recentActivity?.lastChangedAt)}
                            </span>
                        </div>
                    </div>
                )}

                {/* Body */}
                <div className="overflow-y-auto flex-1 px-6 py-6">
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-24 gap-3">
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                            <span className="text-sm text-slate-500 font-medium">Loading history…</span>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-start gap-3 px-5 py-4 bg-rose-50 border border-rose-200 rounded-2xl">
                            <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-rose-700 font-medium">{error}</p>
                        </div>
                    )}

                    {!loading && !error && visibleEntries.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 gap-3">
                            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                                <FileText className="w-8 h-8 text-slate-300" />
                            </div>
                            <p className="text-sm font-semibold text-slate-500">No changes found</p>
                            <p className="text-xs text-slate-400">No Total Amount or Notes edits recorded yet</p>
                        </div>
                    )}

                    {!loading && !error && visibleEntries.length > 0 && (
                        <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
                            {visibleEntries.map((entry, i) => (
                                <HistoryEntry
                                    key={entry._id}
                                    entry={entry}
                                    sno={i + 1}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex-shrink-0">
                    <span className="text-xs text-slate-400">
                        Showing{' '}
                        <span className="font-semibold text-slate-600">{visibleEntries.length}</span>{' '}
                        relevant changes
                        {data?.pagination?.total ? ` of ${data.pagination.total} total` : ''}
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}

export default TransactionHistoryModal