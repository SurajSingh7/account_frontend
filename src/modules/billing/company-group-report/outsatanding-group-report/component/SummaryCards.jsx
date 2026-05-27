// SummaryCards.jsx
import { Eye, EyeOff } from 'lucide-react'

const SummaryCards = ({ summary, showLsi, onToggleLsi }) => {
  const fmt = (n) =>
    (n || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

  return (
    <div className="flex items-center gap-3">
      {/* Orders Card */}
      <div className="flex flex-col items-center justify-center px-5 py-3 bg-white rounded-2xl shadow-sm border border-gray-100 min-w-[90px]">
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
          Orders
        </span>
        <span className="text-3xl font-bold text-gray-900 leading-none">
          {summary?.totalOrders ?? 0}
        </span>
      </div>

      {/* Total Balance Card */}
      <div className="flex flex-col items-center justify-center px-5 py-3 bg-rose-50 rounded-2xl shadow-sm border border-rose-100 min-w-[160px]">
        <span className="text-[10px] font-semibold text-rose-500 uppercase tracking-widest mb-1">
          Total Balance
        </span>
        <span className="text-2xl font-bold text-rose-700 leading-none">
          ₹{fmt(summary?.totalBalance)}
        </span>
      </div>


    </div>
  )
}

export default SummaryCards