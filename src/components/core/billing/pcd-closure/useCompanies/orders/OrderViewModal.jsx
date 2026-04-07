import React from 'react';
import { X } from 'lucide-react';
import { formatDateDisplay, formatINR } from '../../buildListParams/utils';

// ─── Small helpers ────────────────────────────────────────────────────────────
const Section = ({ title, children, className = '' }) => (
  <div className={`border border-gray-200 rounded-lg bg-gray-50 p-5 ${className}`}>
    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 pb-2 border-b border-gray-200">{title}</h4>
    <div className="space-y-3">{children}</div>
  </div>
);

const Detail = ({ label, value }) => (
  <div>
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
    <p className="text-sm font-semibold text-gray-900">{value ?? '–'}</p>
  </div>
);

const AddressBlock = ({ label, address }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4">
    <p className="text-xs font-semibold text-blue-600 uppercase mb-1">{label}</p>
    <p className="text-sm text-gray-700 leading-relaxed">{address?.address || '–'}</p>
    {address?.state && (
      <p className="text-xs text-gray-500 mt-1">
        {address.state} {address.stateCode ? `(Code: ${address.stateCode})` : ''}
      </p>
    )}
  </div>
);

// ─── OrderViewModal ───────────────────────────────────────────────────────────
const OrderViewModal = ({ order, onClose }) => {
  if (!order) return null;
  const summary      = order.summary || {};
  const billingItems = order.billingItems || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto m-4 border border-gray-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
            <p className="text-sm text-gray-500 mt-0.5">#{order.orderId}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Basic */}
          <Section title="Basic Info">
            <Detail label="Order ID"     value={order.orderId} />
            <Detail label="Company"      value={order.company?.name} />
            <Detail label="PAN Number"   value={order.company?.panNumber} />
            <Detail label="Entity"       value={`${order.entity?.name} (${order.entity?.alias})`} />
            <Detail label="BSO"          value={order.bso?.name} />
            <Detail label="Order Type"   value={order.orderType} />
            <Detail label="Status"       value={order.isActive ? 'Active (PCD)' : 'Inactive'} />
            <Detail label="PCD Date"     value={formatDateDisplay(order.pcdDate)} />
          </Section>

          {/* Technical */}
          <Section title="Technical">
            <Detail label="Product"        value={`${order.product?.name} (${order.product?.code})`} />
            <Detail label="Capacity (Mbps)" value={order.capacity} />
            <Detail label="Capacity (Kbps)" value={(order.capacityKbps || order.capacity * 1024)?.toLocaleString()} />
            <Detail label="Offered Rate"    value={order.offeredPrice?.rate ? formatINR(order.offeredPrice.rate) + '/Mbps' : '–'} />
          </Section>

          {/* Installation addresses */}
          <Section title="Installation Addresses" className="md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(order.installationAddress || []).map(addr => (
                <AddressBlock key={addr._id || addr.label} label={addr.label} address={addr} />
              ))}
            </div>
          </Section>

          {/* GST Summary */}
          <Section title="GST Summary" className="md:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Detail label="Total Basic"      value={formatINR(summary.totalBasic)} />
              <Detail label="Total CGST"       value={summary.totalCgst > 0 ? formatINR(summary.totalCgst) : '–'} />
              <Detail label="Total SGST"       value={summary.totalSgst > 0 ? formatINR(summary.totalSgst) : '–'} />
              <Detail label="Total IGST"       value={summary.totalIgst > 0 ? formatINR(summary.totalIgst) : '–'} />
              <Detail label="Grand Total"      value={formatINR(summary.totalGrand)} />
            </div>
          </Section>

          {/* Billing Items */}
          <Section title="Billing Items" className="md:col-span-2">
            <div className="space-y-3">
              {billingItems.map((item, i) => (
                <div key={item._id || i} className="bg-white border border-gray-200 rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Detail label="Circuit ID"     value={item.circuitId} />
                  <Detail label="Label"          value={item.label} />
                  <Detail label="State"          value={`${item.state} (${item.stateCode})`} />
                  <Detail label="Split %"        value={`${item.splitPercent}%`} />
                  <Detail label="Basic Total"    value={formatINR(item.basicTotal)} />
                  <Detail label="CGST"           value={item.cgst > 0 ? formatINR(item.cgst) : '–'} />
                  <Detail label="SGST"           value={item.sgst > 0 ? formatINR(item.sgst) : '–'} />
                  <Detail label="IGST"           value={item.igst > 0 ? formatINR(item.igst) : '–'} />
                  <Detail label="Grand Total"    value={formatINR(item.grandTotal)} />
                  <Detail label="ARC"            value={formatINR(item.arc)} />
                  <div className="md:col-span-2">
                    <Detail label="Billing Address" value={item.billingAddress} />
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
};

export default OrderViewModal;