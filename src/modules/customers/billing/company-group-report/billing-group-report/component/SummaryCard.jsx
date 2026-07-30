'use client'
import {
  Building2,
  Hash,
  FileText,
  Layers,
  FileX,
  TrendingUp,
} from 'lucide-react'

const SummaryCard = ({ summary }) => {
  const fmt = (n) =>
    (n || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

  // ✅ New API summary shape:
  // {
  //   totalCompanies,
  //   totalOrders,
  //   totalBilling,
  //   totalMiscCharge,
  //   totalCreditNote,
  //   totalNetBilling
  // }

  const cards = [
    {
      label: 'Companies',
      value: summary?.totalCompanies ?? 0,
      icon: Building2,
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
    //   icon: Hash,
    //   border: 'border-gray-200',
    //   bg: 'from-gray-50/80',
    //   iconBg: 'bg-gray-100',
    //   iconClr: 'text-gray-600',
    //   textClr: 'text-gray-900',
    //   lblClr: 'text-gray-400',
    //   isCount: true,
    // },
    {
      label: 'Billing',
      value: summary?.totalBilling ?? 0,
      icon: FileText,
      border: 'border-indigo-100',
      bg: 'from-indigo-50/80',
      iconBg: 'bg-indigo-100',
      iconClr: 'text-indigo-600',
      textClr: 'text-indigo-600',
      lblClr: 'text-indigo-400',
    },
    {
      label: 'Misc',
      value: summary?.totalMiscCharge ?? 0,
      icon: Layers,
      border: 'border-purple-100',
      bg: 'from-purple-50/80',
      iconBg: 'bg-purple-100',
      iconClr: 'text-purple-600',
      textClr: 'text-purple-600',
      lblClr: 'text-purple-400',
    },
    {
      label: 'Credit Notes',
      value: summary?.totalCreditNote ?? 0,
      icon: FileX,
      border: 'border-cyan-100',
      bg: 'from-cyan-50/80',
      iconBg: 'bg-cyan-100',
      iconClr: 'text-cyan-600',
      textClr: 'text-cyan-700',
      lblClr: 'text-cyan-400',
    },
    {
      label: 'Net Billing',
      value: summary?.totalNetBilling ?? 0,
      icon: TrendingUp,
      border: 'border-rose-100',
      bg: 'from-rose-50/80',
      iconBg: 'bg-rose-100',
      iconClr: 'text-rose-500',
      textClr: 'text-rose-600',
      lblClr: 'text-rose-400',
    },
  ]

  return (
    <div className="flex items-center gap-2.5 flex-wrap">
      {cards.map(
        ({
          label,
          value,
          icon: Icon,
          border,
          bg,
          iconBg,
          iconClr,
          textClr,
          lblClr,
          isCount,
        }) => (
          <div
            key={label}
            className={`relative flex items-center gap-3 px-4 py-2.5 bg-white rounded-xl border ${border} shadow-sm overflow-hidden`}
            style={{ minWidth: isCount ? '110px' : '180px' }}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${bg} to-transparent pointer-events-none rounded-xl`}
            />

            <div
              className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-lg ${iconBg} shrink-0`}
            >
              <Icon className={`w-4 h-4 ${iconClr}`} />
            </div>

            <div className="relative z-10">
              <p
                className={`text-[10px] font-bold uppercase tracking-widest leading-none mb-0.5 ${lblClr}`}
              >
                {label}
              </p>

              <p
                className={`font-extrabold leading-none tabular-nums ${textClr} ${
                  isCount ? 'text-2xl' : 'text-xl'
                }`}
              >
                {isCount ? value : `₹${fmt(value)}`}
              </p>
            </div>
          </div>
        )
      )}
    </div>
  )
}

export default SummaryCard