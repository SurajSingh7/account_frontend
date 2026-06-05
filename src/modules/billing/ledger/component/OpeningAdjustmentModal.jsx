'use client'
import React, { useState } from 'react'
import { X, SlidersHorizontal, AlertCircle, Loader2 } from 'lucide-react'
import { API_BACKEND_URL } from '@/config/getEnvVariables'
import { toast } from 'react-hot-toast'

const OpeningAdjustmentModal = ({ orderId, stateCode, openingAdjustment,circuitKey, onClose, onSuccess }) => {
  const [amount, setAmount] = useState(openingAdjustment ?? '')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async () => {
    if (!amount && amount !== 0) {
      setError('Opening adjustment amount is required.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`${API_BACKEND_URL}/billing/sale/ledger/opening-adjustment`, {
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

      if (!res.ok) {
        throw new Error(json?.message || `Request failed (${res.status})`)
      }

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
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
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
            <div className="flex flex-col gap-1 items-end">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">State Code</span>
              <span className="text-base font-bold text-slate-800">{stateCode ?? '–'}</span>
            </div>
          </div>

          {/* Opening Adjustment Amount */}
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
                Previous: <span className="font-semibold text-slate-600">₹{openingAdjustment}</span>
              </p>
            )}
          </div>

          {/* Notes */}
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
  )
}

export default OpeningAdjustmentModal;