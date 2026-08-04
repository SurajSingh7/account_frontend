'use client'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Hash, FileText, Layers, FileX, TrendingUp, Wallet, Info, X } from 'lucide-react'

const SummaryCard = ({ summary }) => {
  const [showInfo, setShowInfo] = useState(false)

  const fmt = (n) =>
    (n || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

  const billing      = summary?.billing ?? 0
  const miscCharge    = summary?.miscCharge ?? 0
  const openingAdjustment = summary?.openingAdjustment ?? 0
  const creditNote    = summary?.creditNote ?? 0
  const netBilling    = summary?.netBilling ?? 0

  // ✅ New API summary shape:
  // { totalOrders, billing, miscCharge, openingAdjustment, creditNote, netBilling }
  const cards = [
    {
      label:   'Orders',
      value:   summary?.totalOrders ?? 0,
      icon:    Hash,
      border:  'border-gray-200',
      bg:      'from-gray-50/80',
      iconBg:  'bg-gray-100',
      iconClr: 'text-gray-600',
      textClr: 'text-gray-900',
      lblClr:  'text-gray-400',
      isCount: true,
    },
    {
      label:   'Billing',
      value:   billing,           // was: totalBilling / totalBilled
      icon:    FileText,
      border:  'border-indigo-100',
      bg:      'from-indigo-50/80',
      iconBg:  'bg-indigo-100',
      iconClr: 'text-indigo-600',
      textClr: 'text-indigo-600',
      lblClr:  'text-indigo-400',
    },
    {
      label:   'Misc',
      value:   miscCharge,        // was: totalMisc
      icon:    Layers,
      border:  'border-purple-100',
      bg:      'from-purple-50/80',
      iconBg:  'bg-purple-100',
      iconClr: 'text-purple-600',
      textClr: 'text-purple-600',
      lblClr:  'text-purple-400',
    },
    {
      label:   'Opening Adj',
      value:   openingAdjustment,
      icon:    Wallet,
      border:  'border-amber-100',
      bg:      'from-amber-50/80',
      iconBg:  'bg-amber-100',
      iconClr: 'text-amber-600',
      textClr: 'text-amber-600',
      lblClr:  'text-amber-400',
    },
    {
      label:   'Credit Notes +GST',
      value:   creditNote,        // was: totalCreditNotes
      icon:    FileX,
      border:  'border-cyan-100',
      bg:      'from-cyan-50/80',
      iconBg:  'bg-cyan-100',
      iconClr: 'text-cyan-600',
      textClr: 'text-cyan-700',
      lblClr:  'text-cyan-400',
    },
    {
      label:   'Net Billing',
      value:   netBilling,        // was: totalNetBilling / totalBalance
      icon:    TrendingUp,
      border:  'border-rose-100',
      bg:      'from-rose-50/80',
      iconBg:  'bg-rose-100',
      iconClr: 'text-rose-500',
      textClr: 'text-rose-600',
      lblClr:  'text-rose-400',
      showInfo: true,
    },
  ]

  return (
    <div className="flex items-center gap-2.5 flex-wrap">
      {cards.map(({ label, value, icon: Icon, border, bg, iconBg, iconClr, textClr, lblClr, isCount, showInfo: hasInfo }) => (
        <div
          key={label}
          className={`relative flex items-center gap-3 px-4 py-2.5 bg-white rounded-xl border ${border} shadow-sm overflow-hidden`}
          style={{ minWidth: isCount ? '100px' : '170px' }}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${bg} to-transparent pointer-events-none rounded-xl`} />
          <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-lg ${iconBg} shrink-0`}>
            <Icon className={`w-4 h-4 ${iconClr}`} />
          </div>
          <div className="relative z-10">
            <p className={`text-[10px] font-bold uppercase tracking-widest leading-none mb-0.5 ${lblClr}`}>
              {label}
            </p>
            <p className={`font-extrabold leading-none tabular-nums ${textClr} ${isCount ? 'text-2xl' : 'text-xl'}`}>
              {isCount ? value : `₹${fmt(value)}`}
            </p>
          </div>
          {hasInfo && (
            <button
              type="button"
              onClick={() => setShowInfo(true)}
              title="How Net Billing is calculated"
              className="relative z-10 p-1 -ml-1 hover:bg-rose-100 rounded-lg transition-colors shrink-0"
            >
              <Info className="w-4 h-4 text-rose-400" />
            </button>
          )}
        </div>
      ))}

      {showInfo && createPortal(
        <div
          className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4"
          onClick={() => setShowInfo(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <p className="font-semibold text-slate-800">Net Billing Calculation</p>
              <button onClick={() => setShowInfo(false)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Billing</span>
                <span className="font-semibold text-indigo-600 tabular-nums">₹{fmt(billing)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">+ Misc</span>
                <span className="font-semibold text-purple-600 tabular-nums">₹{fmt(miscCharge)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">+ Opening Adj</span>
                <span className="font-semibold text-amber-600 tabular-nums">₹{fmt(openingAdjustment)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">- Credit Notes +GST</span>
                <span className="font-semibold text-cyan-700 tabular-nums">₹{fmt(creditNote)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 mt-1 border-t border-slate-200">
                <span className="font-semibold text-slate-700">= Net Billing</span>
                <span className="font-extrabold text-rose-600 tabular-nums">₹{fmt(netBilling)}</span>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default SummaryCard
