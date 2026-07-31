'use client'
import { Hash, TrendingUp, FileX, CheckCircle, Clock, Receipt } from 'lucide-react'

const SummaryCard = ({ summary }) => {
  const fmt = (n) =>
    (n || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

const cards = [
  {
    label: 'Companies',
    value: summary?.totalCompanies ?? 0,
    icon: Hash,
    border: 'border-blue-100',
    bg: 'from-blue-50/80',
    iconBg: 'bg-blue-100',
    iconClr: 'text-blue-600',
    textClr: 'text-blue-700',
    lblClr: 'text-blue-400',
    isCount: true,
  },

  // {
  //   label: 'Orders',
  //   value: summary?.totalOrders ?? 0,
  //   icon: Receipt,
  //   border: 'border-gray-200',
  //   bg: 'from-gray-50/80',
  //   iconBg: 'bg-gray-100',
  //   iconClr: 'text-gray-600',
  //   textClr: 'text-gray-900',
  //   lblClr: 'text-gray-400',
  //   isCount: true,
  // },

  {
    label: 'Received',
    value: summary?.totalReceived ?? 0,
    icon: TrendingUp,
    border: 'border-emerald-100',
    bg: 'from-emerald-50/80',
    iconBg: 'bg-emerald-100',
    iconClr: 'text-emerald-600',
    textClr: 'text-emerald-600',
    lblClr: 'text-emerald-500',
  },

  {
    label: 'TDS Confirm',
    value: summary?.totalTdsConfirm ?? 0,
    icon: CheckCircle,
    border: 'border-indigo-100',
    bg: 'from-indigo-50/80',
    iconBg: 'bg-indigo-100',
    iconClr: 'text-indigo-600',
    textClr: 'text-indigo-600',
    lblClr: 'text-indigo-400',
  },

  {
    label: 'TDS Provision',
    value: summary?.totalTdsProvision ?? 0,
    icon: Clock,
    border: 'border-orange-100',
    bg: 'from-orange-50/80',
    iconBg: 'bg-orange-100',
    iconClr: 'text-orange-500',
    textClr: 'text-orange-500',
    lblClr: 'text-orange-400',
  },

  {
    label: 'Total Receipts',
    value: summary?.totalReceipts ?? 0,
    icon: Receipt,
    border: 'border-green-100',
    bg: 'from-green-50/80',
    iconBg: 'bg-green-100',
    iconClr: 'text-green-600',
    textClr: 'text-green-700',
    lblClr: 'text-green-500',
  },
]
  return (
    <div className="flex items-center gap-2.5 flex-wrap">
      {cards.map(({ label, value, icon: Icon, border, bg, iconBg, iconClr, textClr, lblClr, isCount }) => (
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
        </div>
      ))}
    </div>
  )
}

export default SummaryCard