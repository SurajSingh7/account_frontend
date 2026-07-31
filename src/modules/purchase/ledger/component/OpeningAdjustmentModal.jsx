'use client'
import React, { useState, useEffect } from 'react'
import { X, SlidersHorizontal, AlertCircle, Loader2, History } from 'lucide-react'
import { API_BACKEND_URL } from '@/config/getEnvVariables'
import { API_ENDPOINTS } from '@/constants/api'
import { toast } from 'react-hot-toast'
import TransactionHistoryModal from './TransactionHistoryModal'

const OpeningAdjustmentModal = ({
    orderId,
    stateCode,
    openingAdjustment,
    circuitKey,
    onClose,
    onSuccess
}) => {
    const [amount, setAmount] = useState(openingAdjustment ?? '')
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [showHistory, setShowHistory] = useState(false)

    // ✅ Latest notes state
    const [latestNotes, setLatestNotes] = useState(null)
    const [notesLoading, setNotesLoading] = useState(false)

    // ✅ Modal open hote hi silently latest notes fetch karo
    useEffect(() => {
        if (!circuitKey) return

        const fetchLatestNotes = async () => {
            setNotesLoading(true)
            try {
                const res = await fetch(
                    `${API_BACKEND_URL}${API_ENDPOINTS.purchase.ledger.transactionsHistory}/${circuitKey}?transactionType=OPENING_ADJUSTMENT`,
                    { credentials: 'include' }
                )
                const json = await res.json()
                if (!res.ok) return 

                // ✅ First entry ka currentTransaction.notes = latest saved notes
                const firstEntry = json?.data?.data?.[0]
                const savedNotes = firstEntry?.currentTransaction?.notes ?? null
                setLatestNotes(savedNotes)
                  setNotes(savedNotes ?? '') 
            } catch {
                // silent fail — notes section pe koi error nahi dikhana
            } finally {
                setNotesLoading(false)
            }
        }

        fetchLatestNotes()
    }, [circuitKey])

    const handleSubmit = async () => {
        if (!amount && amount !== 0) {
            setError('Opening adjustment amount is required.')
            return
        }
        setLoading(true)
        setError(null)
        try {
            const res = await fetch(`${API_BACKEND_URL}${API_ENDPOINTS.purchase.ledger.openingAdjustment}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    orderId: String(orderId),
                    stateCode: Number(stateCode),
                    openingAdjustmentAmount: String(amount),
                    notes: notes ?? '',
                }),
            })
            const json = await res.json()
            if (!res.ok) throw new Error(json?.message || `Request failed (${res.status})`)
            toast.success('Opening adjustment saved successfully!')
            onSuccess?.()
            onClose()
            window.location.reload()
        } catch (err) {
            setError(err.message || 'Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            >
                <div
                    className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg mx-4 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-blue-600 to-blue-700">
                        <div className="flex items-center gap-2.5">
                            <SlidersHorizontal className="w-5 h-5 text-white" />
                            <h3 className="text-base font-bold text-white">Opening Adjustment</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            {circuitKey && (
                                <button
                                    type="button"
                                    onClick={() => setShowHistory(true)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-colors"
                                    title="View history"
                                >
                                    <History className="w-4 h-4" />
                                    History
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={onClose}
                                className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-6 flex flex-col gap-5">

                        {/* Read-only info row */}
                        <div className="flex items-center justify-between bg-slate-50 rounded-xl px-5 py-4 border border-slate-200">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order ID</span>
                                <span className="text-base font-bold text-slate-800">{orderId ?? '–'}</span>
                            </div>
                            <div className="w-px h-10 bg-slate-200" />

                             {/* Amount field */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                Opening Adjustment Amount
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₹</span>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Enter amount"
                                    className="w-full pl-8 pr-4 py-3 text-sm font-semibold text-slate-800 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                />
                            </div>
                            {openingAdjustment !== undefined && openingAdjustment !== null && (
                                <p className="text-[11px] text-slate-400 pl-1">
                                    Current value: <span className="font-semibold text-slate-600">₹{openingAdjustment}</span>
                                </p>
                            )}
                        </div>
                            {/* <div className="flex flex-col gap-1 items-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">State Code</span>
                                <span className="text-base font-bold text-slate-800">{stateCode ?? '–'}</span>
                            </div> */}
                            {/* {circuitKey && (
                                <>
                                    <div className="w-px h-10 bg-slate-200" />
                                    <div className="flex flex-col gap-1 items-end">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Circuit Key</span>
                                        <span className="text-xs font-bold text-orange-600 font-mono">{circuitKey}</span>
                                    </div>
                                </>
                            )} */}
                        </div>

                       

                        {/* Notes field */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                Notes <span className="text-slate-400 font-normal normal-case">(optional)</span>
                            </label>
                            <textarea
                                rows={4}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add a note..."
                                className="w-full px-4 py-3 text-sm text-slate-700 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition"
                            />
                            
                            {/* {openingAdjustment !== undefined && openingAdjustment !== null && (
                                <div className="flex flex-col gap-2 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Latest Saved Amount</span>
                                            <span className="text-sm font-bold text-blue-700">
                                                ₹{Number(openingAdjustment).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-blue-400 font-medium">Current on record</span>
                                    </div>

                                 
                                    <div className="border-t border-blue-100 pt-2 flex flex-col gap-0.5">
                                        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Latest Saved Notes</span>
                                        {notesLoading ? (
                                            <span className="flex items-center gap-1.5 text-xs text-blue-400">
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                Loading…
                                            </span>
                                        ) : latestNotes ? (
                                            <span className="text-xs text-blue-700 font-medium leading-relaxed">{latestNotes}</span>
                                        ) : (
                                            <span className="text-xs text-blue-400 italic">No notes saved</span>
                                        )}
                                    </div>
                                </div>
                            )} */}


                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-start gap-2.5 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl">
                                <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-rose-700 font-medium">{error}</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/60">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading
                                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>
                                : 'Save Adjustment'
                            }
                        </button>
                    </div>
                </div>
            </div>

            {showHistory && (
                <TransactionHistoryModal
                    circuitKey={circuitKey}
                    onClose={() => setShowHistory(false)}
                />
            )}
        </>
    )
}

export default OpeningAdjustmentModal