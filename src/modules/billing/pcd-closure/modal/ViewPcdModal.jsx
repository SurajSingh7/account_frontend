'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Loader2, AlertCircle, RefreshCw,
  Building2, Cpu, MapPin, ReceiptText, FileSpreadsheet, Tag
} from 'lucide-react';
import { API_BACKEND_URL } from '@/config/getEnvVariables';
import { formatDateDisplay, formatINR } from '../../shared/buildListParams/utils';


// ─── Design Tokens ─────────────────────────────────────────────────────────────
const SECTION_ICON_CLS = 'w-4 h-4 text-blue-500';
const LABEL_CLS        = 'text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5';
const VALUE_CLS        = 'text-sm font-semibold text-gray-800';


// ─── Atoms ─────────────────────────────────────────────────────────────────────
const Detail = ({ label, value }) => (
  <div>
    <p className={LABEL_CLS}>{label}</p>
    <p className={VALUE_CLS}>{value ?? '–'}</p>
  </div>
);

const Badge = ({ active }) => (
  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${
    active
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : 'bg-red-50 text-red-600 border-red-200'
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-red-400'}`} />
    {active ? 'Active' : 'Inactive'}
  </span>
);

const SectionCard = ({ icon, title, children, colSpan = '' }) => (
  <div className={`bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden ${colSpan}`}>
    <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
      {icon}
      <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider">{title}</h4>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const AddressChip = ({ label, address }) => (
  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1.5">{label}</p>
    <p className="text-sm text-gray-700 leading-relaxed">{address?.address || '–'}</p>
    {address?.state && (
      <p className="text-xs text-gray-400 mt-1.5">
        {address.state}
        {address.stateCode && (
          <span className="ml-1.5 bg-gray-200 text-gray-600 text-[10px] font-semibold px-1.5 py-0.5 rounded">
            {address.stateCode}
          </span>
        )}
      </p>
    )}
  </div>
);

const GstCell = ({ label, value }) => (
  <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg border border-gray-100 px-4 py-3 text-center">
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-sm font-bold text-gray-800">{value}</p>
  </div>
);


// ─── Billing Item Row ──────────────────────────────────────────────────────────
const BillingItemCard = ({ item, index }) => (
  <div className="border border-gray-200 rounded-xl overflow-hidden">
    {/* Item Header */}
    <div className="flex items-center justify-between bg-gray-50 border-b border-gray-100 px-5 py-3">
      <div className="flex items-center gap-2.5">
        <span className="w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
          {index + 1}
        </span>
        <span className="text-sm font-bold text-gray-700">{item.circuitId || `Item #${index + 1}`}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full uppercase">
          {item.label || '–'}
        </span>
        <span className="text-[10px] font-bold bg-violet-50 text-violet-600 border border-violet-100 px-2 py-0.5 rounded-full">
          {item.splitPercent}% Split
        </span>
        <span className="text-[10px] font-semibold bg-gray-100 text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full">
          {item.state} {item.stateCode && `· ${item.stateCode}`}
        </span>
      </div>
    </div>

    {/* Financials Grid */}
    <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 border-b border-gray-100">
      {[
        { label: 'Basic Total',  value: formatINR(item.basicTotal) },
        { label: 'CGST',         value: item.cgst > 0 ? formatINR(item.cgst)  : '–' },
        { label: 'SGST',         value: item.sgst > 0 ? formatINR(item.sgst)  : '–' },
        { label: 'IGST',         value: item.igst > 0 ? formatINR(item.igst)  : '–' },
        { label: 'Grand Total',  value: formatINR(item.grandTotal) },
      ].map(({ label, value }) => (
        <div key={label} className={label === 'Grand Total' ? 'col-span-1' : ''}>
          <p className={LABEL_CLS}>{label}</p>
          <p className={`text-sm font-bold ${label === 'Grand Total' ? 'text-emerald-700' : 'text-gray-800'}`}>
            {value}
          </p>
        </div>
      ))}
    </div>

    {/* ARC + Billing Address */}
    <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <p className={LABEL_CLS}>ARC</p>
        <p className="text-sm font-bold text-gray-800">{formatINR(item.arc)}</p>
      </div>
      <div className="md:col-span-2">
        <p className={LABEL_CLS}>Billing Address</p>
        <p className="text-sm text-gray-700 leading-relaxed">{item.billingAddress || '–'}</p>
      </div>
    </div>

    {/* Split edited footer */}
    {item.isSplitEdited && (
      <div className="px-5 py-2.5 bg-amber-50 border-t border-amber-100">
        <p className="text-xs text-amber-700">
          Split edited by{' '}
          <span className="font-semibold">{item.splitEditedBy?.name}</span>
          {' '}on {formatDateDisplay(item.splitEditedAt)}
        </p>
      </div>
    )}
  </div>
);


// ─── Main Component ────────────────────────────────────────────────────────────
const ViewPcdModal = () => {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const pcdId        = searchParams.get('pcdId');

  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const fetchOrder = async () => {
    if (!pcdId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BACKEND_URL}/billing/sale/ready-order/${pcdId}`, {
        credentials: 'include',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Error ${res.status}`);
      }
      const json = await res.json();
      setOrder(json.data);
    } catch (err) {
      setError(err.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrder(); }, [pcdId]);

  // ── States ───────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-9 h-9 text-blue-500 animate-spin" />
        <p className="text-sm font-semibold text-gray-400">Loading order details…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-10 flex flex-col items-center gap-4 text-center max-w-sm w-full">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
          <AlertCircle className="w-7 h-7 text-red-400" />
        </div>
        <div>
          <p className="text-base font-bold text-gray-800 mb-1">Failed to Load</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
        <button
          onClick={fetchOrder}
          className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    </div>
  );

  if (!order) return null;

  const summary      = order.summary      || {};
  const billingItems = order.billingItems  || [];

  return (
    <div className="min-h-screen bg-[#f5f6fa]">

      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">Order Details</h1>
              <p className="text-xs text-gray-400 font-medium">#{order.orderId}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-xs text-gray-400 font-medium">
              PCD: <span className="text-gray-600 font-semibold">{formatDateDisplay(order.pcdDate)}</span>
            </span>
            <Badge active={order.isActive} />
          </div>
        </div>
      </div>

      {/* ── Page Body ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-4">

        {/* Row 1 — Basic Info + Technical */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <SectionCard icon={<Building2 className={SECTION_ICON_CLS} />} title="Basic Info">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <Detail label="Order ID"    value={order.orderId} />
              <Detail label="Order Type"  value={order.orderType} />
              <Detail label="Company"     value={order.company?.name} />
              <Detail label="PAN Number"  value={order.company?.panNumber} />
              <Detail label="Entity"      value={`${order.entity?.name} (${order.entity?.alias})`} />
              <Detail label="BSO"         value={order.bso?.name} />
              <Detail label="PCD Date"    value={formatDateDisplay(order.pcdDate)} />
            </div>
          </SectionCard>

          <SectionCard icon={<Cpu className={SECTION_ICON_CLS} />} title="Technical">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <Detail label="Product"         value={`${order.product?.name} (${order.product?.code})`} />
              <Detail label="Offered Rate"    value={order.offeredPrice?.rate ? `${formatINR(order.offeredPrice.rate)}/Mbps` : '–'} />
              <Detail label="Capacity (Mbps)" value={order.capacity} />
              <Detail label="Capacity (Kbps)" value={(order.capacityKbps || order.capacity * 1024)?.toLocaleString()} />
            </div>
          </SectionCard>
        </div>

        {/* Row 2 — Installation Addresses */}
        <SectionCard icon={<MapPin className={SECTION_ICON_CLS} />} title="Installation Addresses">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {(order.installationAddress || []).map(addr => (
              <AddressChip key={addr._id || addr.label} label={addr.label} address={addr} />
            ))}
          </div>
        </SectionCard>

        {/* Row 3 — GST Summary */}
        <SectionCard icon={<ReceiptText className={SECTION_ICON_CLS} />} title="GST Summary">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            <GstCell label="Total Basic" value={formatINR(summary.totalBasic)} />
            <GstCell label="Total CGST"  value={summary.totalCgst > 0 ? formatINR(summary.totalCgst) : '–'} />
            <GstCell label="Total SGST"  value={summary.totalSgst > 0 ? formatINR(summary.totalSgst) : '–'} />
            <GstCell label="Total IGST"  value={summary.totalIgst > 0 ? formatINR(summary.totalIgst) : '–'} />
            <div className="flex flex-col items-center justify-center bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-center">
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Grand Total</p>
              <p className="text-sm font-bold text-emerald-700">{formatINR(summary.totalGrand)}</p>
            </div>
          </div>
        </SectionCard>

        {/* Row 4 — Billing Items */}
        <SectionCard icon={<FileSpreadsheet className={SECTION_ICON_CLS} />} title={`Billing Items (${billingItems.length})`}>
          {billingItems.length === 0 ? (
            <div className="text-center py-10">
              <Tag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400 font-medium">No billing items found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {billingItems.map((item, i) => (
                <BillingItemCard key={item._id || i} item={item} index={i} />
              ))}
            </div>
          )}
        </SectionCard>

      </div>
    </div>
  );
};

export default ViewPcdModal;