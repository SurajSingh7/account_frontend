'use client'
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import {
  Search, ChevronDown, X, Building2, CheckSquare, Square,
  IndianRupee, CalendarDays, StickyNote, Zap, AlertCircle,
  CheckCircle2, Loader2, Filter, Users, ArrowRight, RotateCcw,
  Send, TrendingDown, SlidersHorizontal, PenLine, ChevronRight,
  Banknote, LayoutGrid, Layers, ArrowLeft, Lock
} from 'lucide-react'

const INDIAN_STATES = [
  { key:"AP", name:"Andhra Pradesh" }, { key:"AR", name:"Arunachal Pradesh" },
  { key:"AS", name:"Assam" }, { key:"BR", name:"Bihar" },
  { key:"CG", name:"Chhattisgarh" }, { key:"GA", name:"Goa" },
  { key:"GJ", name:"Gujarat" }, { key:"HR", name:"Haryana" },
  { key:"HP", name:"Himachal Pradesh" }, { key:"JH", name:"Jharkhand" },
  { key:"KA", name:"Karnataka" }, { key:"KL", name:"Kerala" },
  { key:"MP", name:"Madhya Pradesh" }, { key:"MH", name:"Maharashtra" },
  { key:"MN", name:"Manipur" }, { key:"ML", name:"Meghalaya" },
  { key:"MZ", name:"Mizoram" }, { key:"NL", name:"Nagaland" },
  { key:"OD", name:"Odisha" }, { key:"PB", name:"Punjab" },
  { key:"RJ", name:"Rajasthan" }, { key:"SK", name:"Sikkim" },
  { key:"TN", name:"Tamil Nadu" }, { key:"TS", name:"Telangana" },
  { key:"TR", name:"Tripura" }, { key:"UP", name:"Uttar Pradesh" },
  { key:"UK", name:"Uttarakhand" }, { key:"WB", name:"West Bengal" },
  { key:"DL", name:"Delhi" }, { key:"JK", name:"Jammu & Kashmir" },
  { key:"LA", name:"Ladakh" }, { key:"CH", name:"Chandigarh" },
  { key:"DN", name:"Dadra & Nagar Haveli and Daman & Diu" },
  { key:"LD", name:"Lakshadweep" }, { key:"AN", name:"Andaman & Nicobar Islands" },
  { key:"PY", name:"Puducherry" },
]

const ENTITIES = ["WIBRO", "GTEL", "GISPL"]
const AMOUNT_TYPES = [
  { value: 'receivedDetails', label: 'Received',      fullLabel: 'Received Details', color: 'emerald', bg: 'bg-emerald-500', light: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'tdsProvision',    label: 'TDS Provision', fullLabel: 'TDS Provision',    color: 'amber',   bg: 'bg-amber-500',   light: 'bg-amber-50 text-amber-700 border-amber-200'   },
  { value: 'tdsConfirm',      label: 'TDS Confirm',  fullLabel: 'TDS Confirm',      color: 'violet',  bg: 'bg-violet-500',  light: 'bg-violet-50 text-violet-700 border-violet-200' },
]
const ALL_MONTHS = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"]
const DIST_MODES = [
  { value: 'auto',    label: 'Auto Split', icon: Zap,          desc: 'Split proportionally by %' },
  { value: 'balance', label: 'By Balance', icon: TrendingDown, desc: 'Fill from outstanding balance' },
  { value: 'manual',  label: 'Manual',     icon: PenLine,      desc: 'Enter amounts manually' },
]
                                                                  
// ─── Helpers ─────────────────────────────────────────────────
const fmt = (n) => (n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const todayISO = () => new Date().toISOString().split('T')[0]
const toDisplayDate = (iso) => { if (!iso) return ''; const [y,m,d] = iso.split('-'); return `${d}-${m}-${y}` }
const todayDDMMYYYY = () => {
  const n = new Date()
  return `${String(n.getDate()).padStart(2,'0')}-${String(n.getMonth()+1).padStart(2,'0')}-${n.getFullYear()}`
}
const monthOptions = () => {
  const now = new Date(); const res = []
  for (let i = 0; i < 24; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    res.push({ value:`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`, label:`${ALL_MONTHS[d.getMonth()]} ${d.getFullYear()}` })
  }
  return res
}
const fmtMonthYear = (m, y) => `${ALL_MONTHS[m]} ${y}`
const getDaysInMonth = (m, y) => new Date(y, m + 1, 0).getDate()
const parseAnyDate = (s) => {
  if (!s) return null
  if (s instanceof Date) return s
  if (s.includes('T') || s.includes('Z')) { const d = new Date(s); return isNaN(d) ? null : d }
  const p = s.split('-'); if (p.length !== 3) return null
  const [dd, mm, yyyy] = p.map(Number)
  if (!dd || !mm || !yyyy) return null
  return new Date(yyyy, mm - 1, dd)
}
const sumAmount = (arr) => (!arr?.length) ? 0 : arr.reduce((s,i) => s + (Number(i.amount)||0), 0)
const sumTotalWithGst = (arr) => (!arr?.length) ? 0 : arr.reduce((s,i) => s + (Number(i.totalWithGst)||Number(i.amount)||0), 0)
const isSplitOrder = (order) => {
  const s1 = order.billing1?.state || '', s2 = order.billing2?.state || ''
  return order.product === 'NLD' && s1 !== s2 && s2 !== ''
}
const expandOrdersToRows = (orders) => {
  const rows = []
  orders.forEach(order => {
    if (isSplitOrder(order)) {
      const s1 = order.billing1?.state || '', s2 = order.billing2?.state || ''
      const pct1 = Number(order.splitFactor?.state1Percentage) || 50
      const pct2 = Number(order.splitFactor?.state2Percentage) || 50
      rows.push({ order, state:s1, splitPct:pct1, rowKey:`${order.orderId}-${s1}`, isSplit:true })
      rows.push({ order, state:s2, splitPct:pct2, rowKey:`${order.orderId}-${s2}`, isSplit:true })
    } else {
      const state = order.billing1?.state || order.billing2?.state || '-'
      rows.push({ order, state, splitPct:100, rowKey:`${order.orderId}-${state}`, isSplit:false })
    }
  })
  return rows
}
const creditPoolBalance = (months) => {
  if (!months?.length) return 0
  const sorted = [...months].sort((a,b) => new Date(a.year,a.month) - new Date(b.year,b.month))
  let running = 0
  sorted.forEach(m => {
    const charges = m.totalWithGst + m.miscSell
    const credits = m.received + m.creditNotes + m.tdsConfirm
    running += charges - credits
  })
  return running
}

// ─── Auto-derive billing month YYYY-MM-01 from payment date ──
const billingMonthFromDate = (dateISO) => {
  if (!dateISO) return monthOptions()[0].value
  const [y, m] = dateISO.split('-')
  return `${y}-${m}-01`
}

// ─── Build locked Point 1 of notes ───────────────────────────
const buildPoint1 = (dateISO, amount) => {
  const d = toDisplayDate(dateISO) || '--'
  const a = amount && !isNaN(Number(amount)) && Number(amount) > 0
    ? `₹${Number(amount).toLocaleString('en-IN')}`
    : '₹--'
  return `1. Payment Date: ${d}, Total Amount: ${a}`
}

const loadBalanceForRow = async (order, state, toDateStr) => {
  const pcdDate = parseAnyDate(order.pcdDate)
  const termDate = order.terminateDate ? parseAnyDate(order.terminateDate) : null
  const toDate = parseAnyDate(toDateStr)
  if (!pcdDate || !toDate) return 0
  let billingData = []
  try {
    const r = await fetch(`/api/billing/monthly?orderId=${order.orderId}`)
    const j = await r.json()
    if (j.success) billingData = j.data
  } catch(e) { return 0 }
  let serviceEnd = toDate
  if (termDate) {
    const lastDay = new Date(termDate); lastDay.setDate(lastDay.getDate() - 1)
    serviceEnd = lastDay < toDate ? lastDay : toDate
    if (serviceEnd < pcdDate) return 0
  }
  const months = []
  let cur = new Date(pcdDate.getFullYear(), pcdDate.getMonth(), 1)
  while (cur <= serviceEnd && cur <= toDate) {
    const m = cur.getMonth(), y = cur.getFullYear()
    const monthName = fmtMonthYear(m, y)
    const rec = billingData.find(b => b.month === monthName && b.state === state)
    if (rec) {
      months.push({
        month: m, year: y,
        totalWithGst: Number(rec.totalWithGst) || 0,
        miscSell: sumTotalWithGst(rec.miscellaneousSell),
        received: sumAmount(rec.receivedDetails),
        creditNotes: sumTotalWithGst(rec.creditNotes),
        tdsConfirm: sumAmount(rec.tdsConfirm),
      })
    } else {
      const daysInM = getDaysInMonth(m, y)
      const isPcd = y === pcdDate.getFullYear() && m === pcdDate.getMonth()
      const isTerm = termDate && y === serviceEnd.getFullYear() && m === serviceEnd.getMonth()
      let splitPct = 1
      if (isSplitOrder(order)) {
        splitPct = state === (order.billing1?.state || '')
          ? (Number(order.splitFactor?.state1Percentage) || 50) / 100
          : (Number(order.splitFactor?.state2Percentage) || 50) / 100
      }
      const cap = Number(order.capacity) || 0
      const rate = Number(order.amount) || 0
      const baseMonthly = cap * rate * splitPct
      const startDay = isPcd ? pcdDate.getDate() : 1
      const endDay = isTerm ? serviceEnd.getDate() : daysInM
      const billingDays = endDay - startDay + 1
      const totalWithGst = (baseMonthly * 1.18 / daysInM) * billingDays
      months.push({ month:m, year:y, totalWithGst, miscSell:0, received:0, creditNotes:0, tdsConfirm:0 })
    }
    if (termDate && cur.getFullYear() === serviceEnd.getFullYear() && cur.getMonth() === serviceEnd.getMonth()) break
    cur = new Date(y, m + 1, 1)
  }
  return creditPoolBalance(months)
}

// ─── Searchable Dropdown ──────────────────────────────────────
const SearchableDropdown = ({ options, value, onChange, placeholder, className='' }) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef(null)
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  const filtered = useMemo(() => options.filter(o => o.label.toLowerCase().includes(query.toLowerCase())), [options, query])
  const selected = options.find(o => o.value === value)
  return (
    <div ref={ref} className={`relative ${className}`}>
      <button type="button" onClick={() => { setOpen(v => !v); setQuery('') }}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all">
        <span className={selected ? 'text-slate-800 font-medium' : 'text-slate-400'}>{selected ? selected.label : placeholder}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${open?'rotate-180':''}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input autoFocus type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search…"
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white" />
            </div>
          </div>
          <div className="max-h-52 overflow-y-auto">
            {value && <button onClick={() => { onChange(''); setOpen(false) }}
              className="w-full px-3 py-2 text-left text-sm text-rose-500 hover:bg-rose-50 flex items-center gap-2 border-b border-slate-100">
              <X className="w-3.5 h-3.5" />Clear</button>}
            {filtered.length === 0 ? <p className="px-3 py-4 text-sm text-slate-400 text-center">No results</p>
              : filtered.map(o => (
                <button key={o.value} onClick={() => { onChange(o.value); setOpen(false) }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-violet-50 ${value===o.value?'bg-violet-50 text-violet-700 font-semibold':'text-slate-700'}`}>
                  {o.label}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Company Group Dropdown ───────────────────────────────────
const CompanyGroupDropdown = ({ groups, selectedGroup, onSelect }) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef(null)
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  const filtered = useMemo(() =>
    groups.filter(g =>
      g.groupName.toLowerCase().includes(query.toLowerCase()) ||
      g.companies.some(c => c.toLowerCase().includes(query.toLowerCase()))
    ), [groups, query])
  return (
    <div ref={ref} className="relative w-full">
      <button type="button" onClick={() => { setOpen(v => !v); setQuery('') }}
        className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white hover:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all">
        <div className="flex items-center gap-2 min-w-0">
          <Building2 className="w-4 h-4 text-violet-500 flex-shrink-0" />
          {selectedGroup
            ? <span className="text-slate-800 font-semibold truncate">
                {selectedGroup.groupName}
                <span className="ml-2 text-xs font-normal text-slate-400">({selectedGroup.orderCount})</span>
              </span>
            : <span className="text-slate-400 font-normal">Select company group…</span>}
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden">
          <div className="p-2.5 border-b border-slate-100 bg-slate-50/80">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input autoFocus type="text" value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Search company or group…"
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white" />
            </div>
          </div>
          <div className="overflow-y-auto"
            style={{ maxHeight: '16rem', minHeight: filtered.length >= 5 ? '16rem' : `${Math.max(filtered.length, 1) * 52 + (selectedGroup ? 40 : 0)}px` }}>
            {selectedGroup && (
              <button onClick={() => { onSelect(null); setOpen(false) }}
                className="w-full px-4 py-2.5 text-left text-sm text-rose-500 hover:bg-rose-50 flex items-center gap-2 border-b border-slate-100">
                <X className="w-3.5 h-3.5" />Clear selection
              </button>
            )}
            {filtered.length === 0
              ? <p className="px-4 py-6 text-sm text-slate-400 text-center">No groups found</p>
              : filtered.map((group, idx) => (
                <button key={idx} onClick={() => { onSelect(group); setOpen(false) }}
                  className={`w-full px-4 py-3 text-left hover:bg-violet-50/60 transition-colors border-b border-slate-50 last:border-0 ${selectedGroup?.groupName === group.groupName ? 'bg-violet-50' : ''}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-semibold ${selectedGroup?.groupName === group.groupName ? 'text-violet-700' : 'text-slate-800'}`}>
                      {group.groupName}
                    </span>
                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">{group.orderCount}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    {group.companies.slice(0, 3).join(', ')}
                    {group.companies.length > 3 ? ` +${group.companies.length - 3} more` : ''}
                  </p>
                </button>
              ))
            }
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Inline Distribution Table ────────────────────────────────
const InlineDistributionTable = ({ billingRows, paymentData, amountType, onBack, onSubmit, loading }) => {
  const typeInfo = AMOUNT_TYPES.find(t => t.value === amountType)
  const todayStr = todayDDMMYYYY()

  const [rows, setRows] = useState(() =>
    billingRows.map(({ order, state, splitPct, rowKey, isSplit }) => ({
      rowKey, orderId: order.orderId, companyName: order.companyName,
      state, entity: order.entity || '-', splitPct, isSplit,
      checked: false, amount: '', notes: paymentData.notes,
      balance: null, balanceLoading: true,
    }))
  )
  const [distMode, setDistMode] = useState('auto')

  useEffect(() => {
    billingRows.forEach(({ order, state, rowKey }) => {
      loadBalanceForRow(order, state, todayStr).then(bal => {
        setRows(prev => prev.map(r => r.rowKey === rowKey ? { ...r, balance: bal, balanceLoading: false } : r))
      })
    })
  }, []) // eslint-disable-line

  const applyMode = useCallback((currentRows, mode) => {
    if (mode === 'auto') {
      const checked = currentRows.filter(r => r.checked)
      if (!checked.length) return currentRows
      const totalPct = checked.reduce((s, r) => s + r.splitPct, 0)
      return currentRows.map(r => {
        if (!r.checked) return { ...r, amount: '' }
        const share = Math.round((paymentData.amount * r.splitPct / totalPct) * 100) / 100
        return { ...r, amount: String(share) }
      })
    }
    if (mode === 'balance') {
      return currentRows.map(r => {
        if (!r.checked) return { ...r, amount: '' }
        if (r.balanceLoading) return r
        const bal = Math.max(0, r.balance || 0)
        return { ...r, amount: String(Math.round(bal * 100) / 100) }
      })
    }
    return currentRows
  }, [paymentData.amount])

  useEffect(() => {
    if (distMode !== 'manual') setRows(prev => applyMode(prev, distMode))
  }, [distMode]) // eslint-disable-line

  const toggle = (key) => setRows(prev => {
    const updated = prev.map(r => r.rowKey !== key ? r : { ...r, checked: !r.checked })
    return applyMode(updated, distMode)
  })
  const toggleAll = () => setRows(prev => {
    const allChecked = prev.every(r => r.checked)
    const updated = prev.map(r => ({ ...r, checked: !allChecked }))
    return applyMode(updated, distMode)
  })
  const setAmt  = (key, val) => setRows(prev => prev.map(r => r.rowKey !== key ? r : { ...r, amount: val }))
  const setNote = (key, val) => setRows(prev => prev.map(r => r.rowKey !== key ? r : { ...r, notes: val }))
  const handleModeChange = (mode) => { setDistMode(mode); setRows(prev => applyMode(prev, mode)) }
  const handleReset = () => {
    setRows(prev => prev.map(r => ({ ...r, checked: false, amount: '', notes: paymentData.notes })))
    setDistMode('manual')
  }

  const totalAlloc = useMemo(() =>
    Math.round(rows.filter(r => r.checked).reduce((s, r) => s + (Number(r.amount) || 0), 0) * 100) / 100,
    [rows]
  )
  const remaining = Math.round((paymentData.amount - totalAlloc) * 100) / 100
  const isOverAllocated = remaining < 0
  const checkedCount = rows.filter(r => r.checked).length
  const anyAmountMissing = rows.filter(r => r.checked).some(r => r.amount === '' || r.amount === null || r.amount === undefined)
  const canSubmit = !loading && checkedCount > 0 && !anyAmountMissing && !isOverAllocated && remaining === 0

  const displayMonth = (() => {
    const [y, m] = paymentData.month.split('-')
    return `${ALL_MONTHS[parseInt(m) - 1]} ${y}`
  })()

  const handleSubmit = () => {
    if (!canSubmit) return
    const selected = rows.filter(r => r.checked && Number(r.amount) >= 0)
    onSubmit(selected.map(r => ({
      orderId: r.orderId, state: r.state,
      amount: Number(r.amount), notes: r.notes,
      date: toDisplayDate(paymentData.date), month: displayMonth,
    })))
  }

  const pct = paymentData.amount > 0 ? Math.min(100, (totalAlloc / paymentData.amount) * 100) : 0

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-slate-900 px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium text-slate-300 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />Back
            </button>
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Distribute Payment</h3>
              <p className="text-slate-400 text-xs">{typeInfo?.fullLabel} · {displayMonth} · {toDisplayDate(paymentData.date)}</p>
            </div>
          </div>
          <button onClick={onBack} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium text-slate-300 transition-colors">
            <X className="w-3.5 h-3.5" />Discard
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-slate-400 font-medium">Allocation Progress</span>
              <span className={`text-xs font-bold ${isOverAllocated ? 'text-red-400' : 'text-slate-300'}`}>{Math.round(pct)}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-300 ${isOverAllocated ? 'bg-red-500' : pct === 100 ? 'bg-emerald-400' : 'bg-violet-400'}`}
                style={{ width: `${Math.min(pct, 100)}%` }} />
            </div>
          </div>
          <div className="flex gap-3">
            {[
              { label: 'Total',     value: `₹${fmt(paymentData.amount)}`, cls: 'text-white' },
              { label: 'Allocated', value: `₹${fmt(totalAlloc)}`,         cls: 'text-emerald-400' },
              { label: 'Remaining', value: `₹${fmt(remaining)}`,          cls: isOverAllocated ? 'text-red-400 font-extrabold' : remaining === 0 && checkedCount > 0 ? 'text-emerald-400' : 'text-amber-400' },
            ].map(({ label, value, cls }) => (
              <div key={label} className="text-right">
                <p className="text-[10px] uppercase text-slate-500 font-bold">{label}</p>
                <p className={`text-sm font-bold tabular-nums ${cls}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>
        {isOverAllocated && (
          <div className="mt-2.5 flex items-center gap-2 bg-red-500/20 border border-red-500/40 rounded-xl px-3 py-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span className="text-xs font-semibold text-red-300">Over-allocated by ₹{fmt(Math.abs(remaining))} — reduce amounts before submitting</span>
          </div>
        )}
      </div>

      {/* Controls bar */}
      <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1 mr-1">
          <SlidersHorizontal className="w-3 h-3" />Mode
        </span>
        {DIST_MODES.map(({ value, label, icon: Icon }) => (
          <button key={value} onClick={() => handleModeChange(value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all
              ${distMode === value
                ? value === 'auto' ? 'bg-violet-600 border-violet-600 text-white shadow-sm'
                  : value === 'balance' ? 'bg-rose-600 border-rose-600 text-white shadow-sm'
                  : 'bg-slate-700 border-slate-700 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'}`}>
            <Icon className="w-3.5 h-3.5" />{label}
          </button>
        ))}
        <div className="flex-1" />
        <button onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-400 text-slate-600 text-xs font-bold rounded-lg transition-colors">
          <RotateCcw className="w-3 h-3" />Reset
        </button>
        <span className="text-xs text-slate-500 font-medium pl-1">{checkedCount}/{rows.length} selected</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50/60 border-b border-slate-200">
              <th className="px-3 py-3 w-10">
                <button onClick={toggleAll}>
                  {rows.length > 0 && rows.every(r => r.checked)
                    ? <CheckSquare className="w-4 h-4 text-violet-600" />
                    : <Square className="w-4 h-4 text-slate-400 hover:text-slate-600" />}
                </button>
              </th>
              {['Order ID','Company','State','Split%','Entity','Date','Month','Outstanding','Amount (₹)','Notes'].map(h => (
                <th key={h} className="px-3 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                  {h === 'Outstanding' ? <span className="text-amber-600">{h}</span> : h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.rowKey}
                className={`transition-colors ${row.checked ? 'bg-violet-50/40' : 'hover:bg-slate-50/60'} ${row.isSplit ? 'border-l-[3px] border-l-violet-300' : ''}`}>
                <td className="px-3 py-2.5">
                  <button onClick={() => toggle(row.rowKey)}>
                    {row.checked
                      ? <CheckSquare className="w-4 h-4 text-violet-600" />
                      : <Square className="w-4 h-4 text-slate-300 hover:text-slate-500" />}
                  </button>
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-violet-700">{row.orderId}</span>
                    {row.isSplit && <span className="text-[9px] font-black text-violet-500 bg-violet-100 px-1.5 py-0.5 rounded uppercase tracking-wide">split</span>}
                  </div>
                </td>
                <td className="px-3 py-2.5 font-medium text-slate-700 text-sm">{row.companyName}</td>
                <td className="px-3 py-2.5">
                  <span className="inline-flex px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-md">{row.state}</span>
                </td>
                <td className="px-3 py-2.5 text-center">
                  <span className={`inline-flex px-2 py-0.5 text-xs font-bold rounded-md ${row.isSplit?'bg-violet-50 text-violet-600':'bg-slate-100 text-slate-500'}`}>{row.splitPct}%</span>
                </td>
                <td className="px-3 py-2.5">
                  <span className="inline-flex px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-md">{row.entity}</span>
                </td>
                <td className="px-3 py-2.5">
                  <span className="text-xs text-slate-500 font-mono bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">{toDisplayDate(paymentData.date)}</span>
                </td>
                <td className="px-3 py-2.5">
                  <span className="text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">{displayMonth}</span>
                </td>
                <td className="px-3 py-2.5 bg-amber-50/50">
                  {row.balanceLoading
                    ? <div className="flex items-center gap-1.5 justify-end">
                        <div className="w-3 h-3 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                        <span className="text-xs text-slate-400">…</span>
                      </div>
                    : <span className={`text-sm font-bold tabular-nums ${(row.balance||0) >= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        ₹{fmt(row.balance || 0)}
                      </span>}
                </td>
                <td className="px-3 py-2.5">
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">₹</span>
                    <input type="number" disabled={!row.checked}
                      value={row.amount} onChange={e => setAmt(row.rowKey, e.target.value)} placeholder="0"
                      className={`w-32 pl-6 pr-2 py-1.5 border rounded-lg text-sm text-right font-bold focus:outline-none focus:ring-2 transition-all
                        ${row.checked
                          ? 'border-violet-300 bg-white text-slate-900 focus:ring-violet-400'
                          : 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'}`} />
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <input type="text" disabled={!row.checked}
                    value={row.notes} onChange={e => setNote(row.rowKey, e.target.value)} placeholder="2. Add note…"
                    className={`w-44 px-2.5 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all
                      ${row.checked
                        ? 'border-violet-300 bg-white text-slate-700 focus:ring-violet-400'
                        : 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'}`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          {isOverAllocated && (
            <div className="flex items-center gap-1.5 text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="text-xs font-bold">Over-allocated by ₹{fmt(Math.abs(remaining))}</span>
            </div>
          )}
          {!isOverAllocated && remaining === 0 && checkedCount > 0 && (
            <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5" /><span className="text-xs font-bold">Fully distributed!</span>
            </div>
          )}
          {!isOverAllocated && remaining > 0 && checkedCount > 0 && (
            <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
              <AlertCircle className="w-3.5 h-3.5" /><span className="text-xs font-bold">₹{fmt(remaining)} unallocated</span>
            </div>
          )}
          {checkedCount === 0 && (
            <div className="flex items-center gap-1.5 text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg">
              <AlertCircle className="w-3.5 h-3.5" /><span className="text-xs font-bold">Select at least one order</span>
            </div>
          )}
        </div>
        <div className="flex gap-2.5">
          <button onClick={onBack}
            className="px-5 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-700 transition-colors flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />Back
          </button>
          <button onClick={handleSubmit} disabled={!canSubmit}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all
              ${canSubmit
                ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm hover:shadow cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {loading ? 'Saving…' : `Submit${checkedCount > 0 ? ` (${checkedCount})` : ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────
export default function BulkUpdate() {
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [amountType, setAmountType] = useState('')
  const [filters, setFilters] = useState({ state: '', entity: '' })
  const months = useMemo(() => monthOptions(), [])

  const initialDate = todayISO()
  const [form, setForm] = useState({
    date: initialDate,
    month: billingMonthFromDate(initialDate),
    amount: '',
    notes: buildPoint1(initialDate, ''),
  })
  const [formErr, setFormErr] = useState('')
  const [paymentData, setPaymentData] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    fetch('/api/billing/orders')
      .then(r => r.json())
      .then(j => { if (j.success) setOrders(j.data) })
      .catch(console.error)
      .finally(() => setLoadingOrders(false))
  }, [])

  const groups = useMemo(() => {
    const map = {}
    orders.forEach(o => {
      const key = o.groupName || o.companyName || 'Unknown'
      if (!map[key]) map[key] = { groupName: key, companies: [], orders: [] }
      if (!map[key].companies.includes(o.companyName)) map[key].companies.push(o.companyName)
      map[key].orders.push(o)
    })
    return Object.values(map).map(g => ({ ...g, orderCount: g.orders.length })).sort((a,b) => a.groupName.localeCompare(b.groupName))
  }, [orders])

  const filteredBillingRows = useMemo(() => {
    if (!selectedGroup) return []
    const filteredOrders = selectedGroup.orders.filter(o => {
      if (filters.entity && o.entity !== filters.entity) return false
      if (filters.state) {
        const s1 = o.billing1?.state || '', s2 = o.billing2?.state || ''
        if (s1 !== filters.state && s2 !== filters.state) return false
      }
      return true
    })
    const allRows = expandOrdersToRows(filteredOrders)
    if (filters.state) return allRows.filter(r => r.state === filters.state)
    return allRows
  }, [selectedGroup, filters])

  const distinctOrderCount = useMemo(() => new Set(filteredBillingRows.map(r => r.order.orderId)).size, [filteredBillingRows])
  const typeInfo = AMOUNT_TYPES.find(t => t.value === amountType)
  const canProceed = selectedGroup && amountType && filteredBillingRows.length > 0

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500) }

  // ── Extract any user-written lines after line 1 ──
  const getUserExtra = (note) => {
    const lines = (note || '').split('\n')
    return lines.slice(1).join('\n')
  }

  // ── Handle field changes — date/amount rebuild point 1 ──
  const handleField = (k, v) => {
    setForm(prev => {
      const next = { ...prev, [k]: v }
      if (k === 'date') {
        next.month = billingMonthFromDate(v)
        const extra = getUserExtra(prev.notes)
        next.notes = buildPoint1(v, prev.amount) + (extra ? `\n${extra}` : '')
      }
      if (k === 'amount') {
        const extra = getUserExtra(prev.notes)
        next.notes = buildPoint1(prev.date, v) + (extra ? `\n${extra}` : '')
      }
      return next
    })
    setFormErr('')
  }

  // ── Notes textarea: protect point 1, allow editing extra lines ──
  const handleNoteChange = (val) => {
    const point1 = buildPoint1(form.date, form.amount)
    if (!val.startsWith('1.')) {
      // Restore point 1 if user deleted it
      setForm(prev => ({ ...prev, notes: point1 }))
      return
    }
    setForm(prev => ({ ...prev, notes: val }))
  }

  const handleDistribute = () => {
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      setFormErr('Please enter a valid amount'); return
    }
    setPaymentData({ ...form, amount: Number(form.amount) })
  }

  const handleBack = () => {
    setPaymentData(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (entries) => {
    setSubmitting(true)
    try {
      const displayMonth = (() => {
        const [y, m] = (paymentData.month).split('-')
        return `${ALL_MONTHS[parseInt(m) - 1]} ${y}`
      })()
      const results = await Promise.all(
        entries.map(async ({ orderId, state, amount, notes, date, month }) => {
          const res = await fetch(`/api/billing/monthly?orderId=${orderId}`)
          const j = await res.json()
          if (!j.success) return null
          const rec = j.data.find(b => b.month === month && (b.state === state || !b.state))
          if (!rec) { console.warn(`No billing record: ${orderId}/${month}/${state}`); return null }
          const newEntry = { date, amount, notes }
          const updated = { ...rec, [amountType]: [...(rec[amountType] || []), newEntry] }
          const putRes = await fetch('/api/billing/monthly', {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ _id: rec._id, ...updated })
          })
          return await putRes.json()
        })
      )
      const succeeded = results.filter(r => r?.success).length
      showToast(`Successfully updated ${succeeded} of ${entries.length} records.`)
      setPaymentData(null)
      const nd = todayISO()
      setForm({ date: nd, month: billingMonthFromDate(nd), amount: '', notes: buildPoint1(nd, '') })
    } catch (e) {
      showToast('Update failed: ' + e.message, 'error')
    } finally { setSubmitting(false) }
  }

  // Billing month display label
  const billingMonthLabel = useMemo(() => {
    const found = months.find(m => m.value === form.month)
    return found ? found.label : ''
  }, [form.month, months])

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-[99999] flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold animate-in slide-in-from-top-2
          ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-4">

        {/* ─── DISTRIBUTION VIEW ─── */}
        {paymentData ? (
          <>
            <div className="flex items-center gap-2">
              <button onClick={handleBack}
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span>Bulk Payment Update</span>
              </button>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <span className="text-sm font-bold text-slate-800">Distribute Payment</span>
            </div>
            <InlineDistributionTable
              billingRows={filteredBillingRows}
              paymentData={paymentData}
              amountType={amountType}
              loading={submitting}
              onBack={handleBack}
              onSubmit={handleSubmit}
            />
          </>
        ) : (
          <>
            {/* ─── Page Title ─── */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Bulk Payment Update</h1>
                <p className="text-sm text-slate-400 mt-0.5">Record and distribute payments across multiple orders</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-500 font-medium">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                {orders.length} orders loaded
              </div>
            </div>

            {/* ─── CARD 1: Payment Setup ─── */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">

              {/* ── Card Header: title left | Billing Month right ── */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
                    <Banknote className="w-3.5 h-3.5 text-violet-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-800">Payment Setup</h2>
                    <p className="text-xs text-slate-400">Configure company, type, and payment details</p>
                  </div>
                </div>

                {/* Billing Month — read-only, auto-set, on the right */}
                <div className="flex items-center gap-2.5">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Billing Month</p>
                    <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg">
                      <CalendarDays className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                      <span className="text-sm font-bold text-indigo-700">{billingMonthLabel}</span>
                      <span className="text-[9px] font-black text-indigo-400 bg-indigo-100 border border-indigo-200 px-1.5 py-0.5 rounded-full uppercase ml-1">Auto</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">

                {/* ── Row 1: Company Group + Payment Type ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                      Company Group
                    </label>
                    {loadingOrders
                      ? <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
                      : <CompanyGroupDropdown
                          groups={groups}
                          selectedGroup={selectedGroup}
                          onSelect={grp => { setSelectedGroup(grp); setFilters({ state: '', entity: '' }); setPaymentData(null) }}
                        />
                    }
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                      Payment Type
                    </label>
                    <div className="flex gap-2">
                      {AMOUNT_TYPES.map(t => (
                        <button key={t.value}
                          onClick={() => { setAmountType(v => v === t.value ? '' : t.value); setPaymentData(null) }}
                          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold border-2 transition-all
                            ${amountType === t.value
                              ? `${t.bg} border-transparent text-white shadow-sm`
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}>
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── Divider ── */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-dashed border-slate-200" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Payment Details</span>
                  </div>
                </div>

                {/* ── Payment Details: 2-column layout ── */}
                {/*   Left col  → Payment Date + Amount + Distribute button  */}
                {/*   Right col → Notes (tall, full height)                   */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

                  {/* ── LEFT COLUMN ── */}
                  <div className="space-y-4 flex justify-between">

                    {/* Payment Date */}
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                        <CalendarDays className="w-3.5 h-3.5 text-violet-500" />Payment Date
                      </label>
                      <input
                        type="date"
                        value={form.date}
                        onChange={e => handleField('date', e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium text-slate-700 bg-white"
                      />
                    </div>

                    {/* Amount */}
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                        <IndianRupee className="w-3.5 h-3.5 text-emerald-500" />Amount (₹)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                        <input
                          type="number"
                          value={form.amount}
                          onChange={e => handleField('amount', e.target.value)}
                          placeholder="0.00"
                          className={`w-full pl-7 pr-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 font-bold text-slate-800
                            ${formErr ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'}`}
                        />
                      </div>
                      {formErr && (
                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />{formErr}
                        </p>
                      )}
                    </div>

                    {/* Distribute Amount Button */}
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <button
                        onClick={handleDistribute}
                        disabled={!canProceed}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all w-full justify-center mt-1
                          ${canProceed
                            ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm hover:shadow'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                      >
                        {canProceed ? <Users className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {!selectedGroup ? 'Select a group first'
                          : !amountType ? 'Choose payment type'
                          : filteredBillingRows.length === 0 ? 'No matching orders'
                          : 'Distribute Amount'}
                        {canProceed && <ChevronRight className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* ── RIGHT COLUMN: Notes ── */}
                  <div className="flex flex-col h-full">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                      <StickyNote className="w-3.5 h-3.5 text-amber-500" />Notes
                    </label>

                    {/* Point 1 — read-only locked display */}
                    <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-t-xl">
                      <Lock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-amber-700 mb-0.5">Auto-filled (locked)</p>
                        <p className="text-xs text-amber-800 font-mono break-all leading-relaxed">
                          {buildPoint1(form.date, form.amount)}
                        </p>
                      </div>
                    </div>

                    {/* Point 2 — free editable textarea */}
                    <textarea
                      value={getUserExtra(form.notes)}
                      onChange={e => {
                        const extra = e.target.value
                        setForm(prev => ({
                          ...prev,
                          notes: buildPoint1(prev.date, prev.amount) + (extra ? `\n${extra}` : '')
                        }))
                      }}
                      rows={5}
                      placeholder="2. Add additional notes here…"
                      className="flex-1 w-full px-3 py-2.5 border border-t-0 border-slate-200 rounded-b-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-700 bg-white resize-none leading-relaxed"
                    />
                    <p className="mt-1.5 text-[10px] text-slate-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-amber-400 flex-shrink-0" />
                      Point 1 is auto-generated from date &amp; amount. Write additional points below.
                    </p>
                  </div>

                </div>
              </div>
            </div>

            {/* ─── CARD 2: Filter Orders ─── */}
            {selectedGroup && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Filter className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-800">Filter Orders</h2>
                      <p className="text-xs text-slate-400">Narrow down which orders to include</p>
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
                    {filteredBillingRows.length} row{filteredBillingRows.length !== 1 ? 's' : ''} · {distinctOrderCount} order{distinctOrderCount !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-3 mb-5">
                    <div className="min-w-[220px] flex-1">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">State</label>
                      <SearchableDropdown
                        options={INDIAN_STATES.map(s => ({ value: s.name, label: s.name }))}
                        value={filters.state}
                        onChange={v => { setFilters(p => ({ ...p, state: v })); setPaymentData(null) }}
                        placeholder="All States" />
                    </div>
                    <div className="min-w-[160px]">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Entity</label>
                      <select value={filters.entity}
                        onChange={e => { setFilters(p => ({ ...p, entity: e.target.value })); setPaymentData(null) }}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-violet-500 font-medium text-slate-700">
                        <option value="">All Entities</option>
                        {ENTITIES.map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                    </div>
                    {(filters.state || filters.entity) && (
                      <div className="flex items-end">
                        <button onClick={() => { setFilters({ state: '', entity: '' }); setPaymentData(null) }}
                          className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 text-rose-600 text-sm rounded-lg border border-rose-200 hover:bg-rose-100 font-semibold">
                          <X className="w-3.5 h-3.5" />Clear filters
                        </button>
                      </div>
                    )}
                  </div>

                  {filteredBillingRows.length > 0 ? (
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            {['Order ID','Company','State','Split %','Entity','Status'].map(h => (
                              <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredBillingRows.slice(0, 10).map(row => (
                            <tr key={row.rowKey} className={`hover:bg-slate-50/60 ${row.isSplit ? 'border-l-[3px] border-l-violet-300' : ''}`}>
                              <td className="px-4 py-2.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-violet-700">{row.order.orderId}</span>
                                  {row.isSplit && <span className="text-[9px] font-black text-violet-500 bg-violet-100 px-1.5 py-0.5 rounded uppercase">split</span>}
                                </div>
                              </td>
                              <td className="px-4 py-2.5 font-medium text-slate-700">{row.order.companyName}</td>
                              <td className="px-4 py-2.5"><span className="inline-flex px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-md">{row.state}</span></td>
                              <td className="px-4 py-2.5"><span className={`inline-flex px-2 py-0.5 text-xs font-bold rounded-md ${row.isSplit?'bg-violet-50 text-violet-600':'bg-slate-100 text-slate-500'}`}>{row.splitPct}%</span></td>
                              <td className="px-4 py-2.5"><span className="inline-flex px-2 py-0.5 bg-slate-100 text-slate-500 text-xs font-bold rounded-md">{row.order.entity||'-'}</span></td>
                              <td className="px-4 py-2.5">
                                <span className={`inline-flex px-2 py-0.5 text-xs font-bold rounded-md ${row.order.status==='PCD'?'bg-emerald-50 text-emerald-700':'bg-rose-50 text-rose-600'}`}>
                                  {row.order.status||'-'}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {filteredBillingRows.length > 10 && (
                            <tr><td colSpan={6} className="px-4 py-2 text-xs text-slate-400 text-center">
                              +{filteredBillingRows.length - 10} more rows
                            </td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-5 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                      <AlertCircle className="w-5 h-5 text-slate-300 flex-shrink-0" />
                      <p className="text-sm text-slate-400">No orders match the current filters.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
