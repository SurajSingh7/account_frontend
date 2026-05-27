'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import { Eye, Pencil, FileText, ArrowLeft, CheckCheck } from 'lucide-react'
import { enrichOutstandingLedger } from '../helpers/buildOutstandingLedger'


const fmt = (n) =>
  (n || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })


const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]


const normalizeRow = (item) => {
  const monthYear =
    item.monthYear ??
    (item.billingMonth && item.billingYear
      ? `${MONTH_NAMES[(item.billingMonth ?? 1) - 1]}-${item.billingYear}`
      : item.month ?? '–')

  const fmtDate = (iso) => {
    if (!iso) return '–'
    const d = new Date(iso)
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`
  }

  return {
    ...item,
    monthYear,
    startDate: item.startDate ?? fmtDate(item.billingStartDate),
    endDate: item.endDate ?? fmtDate(item.billingEndDate),
    basicBill: item.basicAmount ?? item.monthlyBilling ?? item.basicBill ?? 0,
    cgst: item.cgst ?? 0,
    sgst: item.sgst ?? 0,
    igst: item.igst ?? 0,
    basicGst: item.totalPlusGst ?? item.totalWithGst ?? item.basicGst ?? 0,
    miscBill: item.miscPlusGst ?? item.miscSell ?? item.miscBill ?? 0,
    netBilling: item.netBilling ?? 0,
    receiptAmount: item.receiptAmount ?? 0,
    received: item.received ?? item.totalReceived ?? 0,
    creditNotes: item.creditNote ?? item.creditNotes ?? item.totalCreditNotes ?? 0,
    tdsConfirm: item.tdsConf ?? item.tdsConfirm ?? item.tdsConfirmed ?? 0,
    tdsProvision: item.tdsProvision ?? 0,
    totalBalance: item.totalBalance ?? item.balance ?? 0,
    remainingAdj: item.remainingAdjustment ?? item.remainingAdj ?? item.remaining ?? item.totalBalance ?? 0,
    billingDays: item.billingDays ?? item.days ?? '–',
    billIds: item.billIds ?? [],
    runningOutstanding: item.runningOutstanding ?? 0,
    outstandingAfterAdjustment: item.outstandingAfterAdjustment ?? 0,
  }
}


// ─── COLUMN DEFINITIONS ───────────────────────────────────────────────────────
// To reorder any column: just change its `order` number. Lowest = leftmost.
// ─────────────────────────────────────────────────────────────────────────────
export const LEDGER_COLUMNS = [
  { id: 'month', label:  <> Billing <br /> Month  </>, align: 'right', align: 'left', order: 1 },
  { id: 'days', label: 'Days', align: 'center', order: 2 },
  { id: 'period', label: 'Period', align: 'left', order: 3 },
  { id: 'basicBill', label: 'Basic Bill', align: 'right', order: 4 },
  { id: 'cgst', label: 'CGST (9%)', align: 'right', order: 5 },
  { id: 'sgst', label: 'SGST (9%)', align: 'right', order: 6 },
  { id: 'igst', label: 'IGST (18%)', align: 'right', order: 7 },
  { id: 'basicGst', label: 'Basic + GST', align: 'right', order: 8 },
  { id: 'miscBill', label: 'Misc+GST Bill', align: 'right', order: 9 },
  { id: 'netBilling', label: 'Net Billing', align: 'right', order: 18 },
  { id: 'receiptAmount', label: 'Receipt Amount', align: 'right', order: 19 },
  { id: 'received', label: 'Received', align: 'right', order: 10 },
  { id: 'creditNotes', label: 'Credit Notes', align: 'right', order: 11 },
  { id: 'tdsConfirm', label: 'TDS Conf', align: 'right', order: 12 },
  { id: 'tdsProvision', label: 'TDS Prov', align: 'right', order: 13 },
  // { id: 'totalBalance',               label: 'Total Balance',                            align: 'right',  order: 14 },
  { id: 'runningOutstanding', label: <> Running <br /> Outstanding </>, align: 'right', order: 15 },
  { id: 'outstandingAfterAdjustment', label: <> Outstanding <br /> After Adjustment </>, align: 'right', order: 16 },
  // { id: 'remaining',                  label: 'Remaining Adj',                            align: 'right',  order: 17 },
  { id: 'actions', label: 'Actions', align: 'center', order: 20 },
]


// ─── ROW CELL RENDERER ────────────────────────────────────────────────────────
// Returns one <td> per column id. Called inside a .map() over sorted visibleDefs.
// ─────────────────────────────────────────────────────────────────────────────
const renderRowCell = (id, item, router) => {
  switch (id) {

    case 'month':
      return (
        <td key={id} className="px-3 py-3 font-semibold text-slate-900 whitespace-nowrap">
          {item.monthYear}
        </td>
      )

    case 'days':
      return (
        <td key={id} className="px-3 py-3 text-center font-bold text-slate-700">
          {item.billingDays}
        </td>
      )

    case 'period':
      return (
        <td key={id} className="px-3 py-3 text-xs text-slate-500 whitespace-nowrap">
          <div>{item.startDate}</div>
          <div>{item.endDate}</div>
        </td>
      )

    case 'basicBill':
      return (
        <td key={id} className="px-3 py-3 text-right font-bold text-slate-800">
          ₹{fmt(item.basicBill)}
        </td>
      )

    case 'cgst':
      return (
        <td key={id} className="px-3 py-3 text-right text-slate-600">
          {item.cgst > 0 ? `₹${fmt(item.cgst)}` : <span className="text-slate-300">₹0.00</span>}
        </td>
      )

    case 'sgst':
      return (
        <td key={id} className="px-3 py-3 text-right text-slate-600">
          {item.sgst > 0 ? `₹${fmt(item.sgst)}` : <span className="text-slate-300">₹0.00</span>}
        </td>
      )

    case 'igst':
      return (
        <td key={id} className="px-3 py-3 text-right text-slate-600">
          {item.igst > 0 ? `₹${fmt(item.igst)}` : <span className="text-slate-300">₹0.00</span>}
        </td>
      )

    case 'basicGst':
      return (
        <td key={id} className="px-3 py-3 text-right font-bold text-indigo-600">
          ₹{fmt(item.basicGst)}
        </td>
      )

    case 'miscBill':
      return (
        <td key={id} className="px-3 py-3 text-right font-bold text-purple-600 bg-purple-50/30">
          ₹{fmt(item.miscBill)}
        </td>
      )

    case 'netBilling':
      return (
        <td key={id} className="px-3 py-3 text-right font-bold text-teal-700 bg-teal-50/30">
          ₹{fmt(item.netBilling)}
        </td>
      )

    case 'receiptAmount':
      return (
        <td key={id} className="px-3 py-3 text-right font-bold text-emerald-700 bg-emerald-50/20">
          ₹{fmt(item.receiptAmount)}
        </td>
      )

    case 'received':
      return (
        <td key={id} className="px-3 py-3 text-right font-bold text-emerald-600 bg-emerald-50/30">
          ₹{fmt(item.received)}
        </td>
      )

    case 'creditNotes':
      return (
        <td key={id} className="px-3 py-3 text-right font-bold text-cyan-700 bg-cyan-50/30">
          ₹{fmt(item.creditNotes)}
        </td>
      )

    case 'tdsConfirm':
      return (
        <td key={id} className="px-3 py-3 text-right font-bold text-indigo-500 bg-indigo-50/30">
          ₹{fmt(item.tdsConfirm)}
        </td>
      )

    case 'tdsProvision':
      return (
        <td key={id} className="px-3 py-3 text-right font-bold text-orange-500 bg-orange-50/30">
          ₹{fmt(item.tdsProvision)}
        </td>
      )

    case 'totalBalance':
      return (
        <td key={id} className="px-3 py-3 text-right font-extrabold text-rose-600 bg-rose-50/40">
          ₹{fmt(item.totalBalance)}
        </td>
      )

    case 'runningOutstanding':
      return (
        <td key={id} className="px-3 py-3 text-right font-extrabold text-rose-600 bg-rose-50/40">
          ₹{fmt(item.runningOutstanding)}
        </td>
      )

    case 'outstandingAfterAdjustment':
      return (
        <td key={id} className="px-3 py-3 text-right bg-yellow-50/40">
          {item.outstandingAfterAdjustment <= 0 ? (
            <span className="inline-flex items-center gap-1 font-extrabold text-emerald-600">
              <CheckCheck className="w-4 h-4 stroke-[3]" />
              ₹0.00
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-extrabold text-rose-600">
              <span className="text-rose-400 font-bold">×</span>
              ₹{fmt(item.outstandingAfterAdjustment)}
            </span>
          )}
        </td>
      )

    case 'remaining':
      return (
        <td key={id} className="px-3 py-3 text-right bg-yellow-50/40">
          <span className="inline-flex items-center gap-1 font-extrabold text-rose-600">
            <span className="text-rose-400 font-bold">×</span>
            ₹{fmt(item.remainingAdj)}
          </span>
        </td>
      )

    case 'actions':
      return (
        <td key={id} className="px-3 py-3">
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              title="View details"
              onClick={() =>
                router.push(
                  `/billing/account/ledger/form?mode=view?month=${item.monthYear}&billIds=${(item.billIds ?? []).join(',')}`
                )
              }
              className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>

            {console.log("fgh", item)}
            <button
              type="button"
              title="Edit record"
              onClick={() =>
                router.push(
                  `/billing/account/ledger/form?mode=edit&month=${item.monthYear}&billIds=${(item.billIds ?? []).join(',')}`
                )
              }
              className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-lg transition-colors"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>
        </td>
      )

    default:
      return <td key={id} className="px-3 py-3" />
  }
}


// ─── FOOTER CELL RENDERER ─────────────────────────────────────────────────────
const renderFooterCell = (id, t) => {
  switch (id) {
    case 'month': return <td key={id} className="px-3 py-3 text-gray-900">TOTAL</td>
    case 'days': return <td key={id} className="px-3 py-3" />
    case 'period': return <td key={id} className="px-3 py-3" />
    case 'basicBill': return <td key={id} className="px-3 py-3 text-right text-slate-900">₹{fmt(t.basicTotal ?? 0)}</td>
    case 'cgst': return <td key={id} className="px-3 py-3 text-right text-slate-700">₹{fmt(t.cgst ?? 0)}</td>
    case 'sgst': return <td key={id} className="px-3 py-3 text-right text-slate-700">₹{fmt(t.sgst ?? 0)}</td>
    case 'igst': return <td key={id} className="px-3 py-3 text-right text-slate-700">₹{fmt(t.igst ?? 0)}</td>
    case 'basicGst': return <td key={id} className="px-3 py-3 text-right text-indigo-700">₹{fmt(t.totalPlusGst ?? 0)}</td>
    case 'miscBill': return <td key={id} className="px-3 py-3 text-right text-purple-700">₹{fmt(t.miscPlusGst ?? 0)}</td>
    case 'netBilling': return <td key={id} className="px-3 py-3 text-right text-teal-700">₹{fmt(t.netBilling ?? 0)}</td>
    case 'receiptAmount': return <td key={id} className="px-3 py-3 text-right text-emerald-700">₹{fmt(t.receiptAmount ?? 0)}</td>
    case 'received': return <td key={id} className="px-3 py-3 text-right text-emerald-700">₹{fmt(t.received ?? 0)}</td>
    case 'creditNotes': return <td key={id} className="px-3 py-3 text-right text-cyan-700">₹{fmt(t.creditNote ?? 0)}</td>
    case 'tdsConfirm': return <td key={id} className="px-3 py-3 text-right text-indigo-600">₹{fmt(t.tdsConf ?? 0)}</td>
    case 'tdsProvision': return <td key={id} className="px-3 py-3 text-right text-orange-600">₹{fmt(t.tdsProvision ?? 0)}</td>
    case 'totalBalance': return <td key={id} className="px-3 py-3 text-right text-rose-700 bg-rose-50">₹{fmt(t.totalBalance ?? 0)}</td>
    case 'runningOutstanding': return <td key={id} className="px-3 py-3 text-right text-rose-700 bg-rose-50">₹{fmt(t.runningOutstanding ?? 0)}</td>
    case 'outstandingAfterAdjustment': return <td key={id} className="px-3 py-3 text-right text-rose-700 bg-yellow-50">₹{fmt(t.outstandingAfterAdjustment ?? 0)}</td>
    case 'remaining': return <td key={id} className="px-3 py-3 text-right text-rose-700 bg-yellow-50">₹{fmt(t.remainingAdjustment ?? 0)}</td>
    case 'actions': return <td key={id} className="px-3 py-3" />
    default: return <td key={id} className="px-3 py-3" />
  }
}


// ─── ROW COMPONENT ────────────────────────────────────────────────────────────
// Receives visibleDefs (sorted by order) and maps over it → cells in exact order
const LedgerRow = ({ item: rawItem, visibleDefs }) => {
  const router = useRouter()
  const item = normalizeRow(rawItem)

  return (
    <tr className="hover:bg-blue-50/20 transition-colors border-b border-slate-100">
      {visibleDefs.map(({ id }) => renderRowCell(id, item, router))}
    </tr>
  )
}


// ─── FOOTER COMPONENT ─────────────────────────────────────────────────────────
const LedgerFooter = ({ totals, visibleDefs }) => {
  const t = totals ?? {}

  return (
    <tfoot className="bg-gradient-to-r from-gray-100 to-blue-100 border-t-2 border-gray-300">
      <tr className="font-bold text-sm">
        {visibleDefs.map(({ id }) => renderFooterCell(id, t))}
      </tr>
    </tfoot>
  )
}


// ─── HEADER BAR ───────────────────────────────────────────────────────────────
const LedgerHeader = ({ title, meta, chips, onBack ,ledgerName}) => {
  const router = useRouter()

  const handleBack = () => {
    if (onBack) { onBack() } else { router.back() }
  }

  return (
    <div className={`flex items-center gap-5 px-1 py-4 rounded-t-xl ${ledgerName?.toLowerCase() === 'receipt'
        ? 'bg-green-600'
        : ledgerName?.toLowerCase() === 'outstanding'
          ? 'bg-blue-600'
          : ledgerName?.toLowerCase() === 'bill'
            ? 'bg-red-600'
            : 'bg-gradient-to-r from-blue-600 to-blue-700'
      }`}>


      <button
        type="button"
        onClick={handleBack}
        className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-semibold text-sm transition-all shrink-0 ml-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="flex items-center gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 shrink-0" />
            {title ?? 'Monthly Billing Breakdown'}
          </h2>
          {meta && <p className="text-blue-100 text-sm mt-0.5">{meta}</p>}
        </div>

        {chips && chips.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {chips.map(({ label, value }) => (
              <div key={label} className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5">
                <p className="text-[10px] font-bold text-blue-100 uppercase leading-none">
                  <span className="leading-tight">{label}</span>
                </p>
                <p className="text-sm font-bold text-white leading-none mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


// ─── MAIN TABLE ───────────────────────────────────────────────────────────────
const LedgerTable = ({
  data,
  hiddenColumns = [],
  title,
  meta,
  chips,
  onBack,
  showHeader = true,
  ledgerName
}) => {

  const rawRows =
    data?.data?.data ??
    data?.data ??
    data ??
    []

  const apiTotals =
    data?.data?.totals ??
    data?.totals ??
    {}

  const { rows, totals } = enrichOutstandingLedger(rawRows, apiTotals)

  console.log("rows-->", rows)
  console.log("data", data)
  console.log("totals-->", totals)

  // Single source of truth: sort by `order` once here.
  // Header, every row cell, and footer all receive this same sorted array.
  const visibleDefs = LEDGER_COLUMNS
    .filter((col) => !hiddenColumns.includes(col.id))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  if (!rows.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        {showHeader && <LedgerHeader title={title} meta={meta} chips={chips} onBack={onBack} LedgerName={ledgerName}/>}
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <FileText className="w-10 h-10 mb-3 text-slate-300" />
          <p className="text-sm font-medium">No ledger records found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      {showHeader && <LedgerHeader title={title} meta={meta} chips={chips} onBack={onBack} LedgerName={ledgerName} />}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-blue-50 border-b-2 border-gray-200">
              {visibleDefs.map(({ id, label, align }) => (
                <th
                  key={id}
                  className={`px-3 py-3.5 text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap text-${align}`}
                >
                  <span className="leading-tight">{label}</span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-slate-100">
            {rows.map((item, index) => (
              <LedgerRow
                key={item._id ?? item.id ?? index}
                item={item}
                visibleDefs={visibleDefs}
              />
            ))}
          </tbody>

          <LedgerFooter totals={totals} visibleDefs={visibleDefs} />
        </table>
      </div>
    </div>
  )
}


export default LedgerTable