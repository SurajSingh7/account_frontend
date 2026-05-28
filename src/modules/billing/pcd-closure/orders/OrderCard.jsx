import React, { useState } from 'react';
import { Edit, Eye } from 'lucide-react';
import { formatDateDisplay, truncateWithMore } from '../../shared/buildListParams/utils';
import { useRouter } from 'next/navigation';
import EditPcdModal from '../modal/EditPcdModal';
import { usePermissions } from '@/context/PermissionContext';

// ─── Badge ────────────────────────────────────────────────────────────────────
const Badge = ({ children, color }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-800 border border-blue-200',
    green: 'bg-green-100 text-green-800 border border-green-200',
    red: 'bg-red-100 text-red-800 border border-red-200',
    purple: 'bg-purple-100 text-purple-800 border border-purple-200',
    gray: 'bg-gray-100 text-gray-800 border border-gray-200',
    orange: 'bg-orange-200 text-gray-800 border border-gray-200',
    teal: 'bg-teal-100 text-teal-800 border border-teal-200',
  };
  return (
    <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${colors[color] || colors.gray}`}>
      {children}
    </span>
  );
};

// ─── OrderCard ────────────────────────────────────────────────────────────────
const OrderCard = ({ order, onRefetch }) => {

    const { userData } = usePermissions();
    const isAdmin = userData?.role === 'Admin';

  const router = useRouter();
  const [showEndPopup, setShowEndPopup] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false); // ← ADD THIS

  // ── Safely resolve fields from the NEW data shape ──────────────────────────
  const billingItems = order.billingItems || [];
  const installAddr = order.installationAddress || [];

  const endAAddr = installAddr.find(a => a.label === 'END-A');
  const endBAddr = installAddr.find(a => a.label === 'END-B');
  const endAText = endAAddr
    ? `${endAAddr.address}, ${endAAddr.city}, ${endAAddr.state} - ${endAAddr.pinCode}`
    : '-';
  const endBText = endBAddr
    ? `${endBAddr.address}, ${endBAddr.city}, ${endBAddr.state} - ${endBAddr.pinCode}`
    : '-';

  const capacityMbps = Number(order.capacity) || 0;
  const capacityKbps = Number(order.capacityKbps) || capacityMbps * 1024;
  const baseRate = Number(order.offeredPrice?.rate) || 0;

  const companyLabel = order.company?.name || '';
  const entityLabel = order.entity?.alias || order.entity?.name || '';
  const productLabel = order.product?.code || order.product?.name || '';
  const bsoLabel = order.bso?.name || '';
  const orderTypeLabel = order.orderType || '';
  const isActive = order.isActive !== undefined ? order.isActive : false;
  const pcdDate = order.pcdDate;
  const operationalDate = order.operationalDate;
  const terminateDate = order.terminateDate;

  // ── Detect GST type per billing item ──────────────────────────────────────
  const circuits = order.summary?.circuits || [];
  const getIsSelf = (item, index) => {
    if (item.cgst > 0 || item.sgst > 0) return true;
    if (item.igst > 0) return false;

    const taxType = circuits[index]?.taxType || '';
    if (taxType === 'CGST' || taxType === 'SGST') return true;
    if (taxType === 'IGST') return false;

    return false;
  };

  const isSelf0 = billingItems[0] ? getIsSelf(billingItems[0], 0) : false;
  const isSelf1 = billingItems[1] ? getIsSelf(billingItems[1], 1) : false;
  const hasMultiple = billingItems.length > 1;
  const mixedGSTTypes = hasMultiple && isSelf0 !== isSelf1;

  // ── Table headers ──────────────────────────────────────────────────────────
  const buildHeaders = () => {
    const item0 = billingItems[0] || {};
    const cgstRate = item0.cgst ? 9 : 9;
    const sgstRate = item0.sgst ? 9 : 9;
    const igstRate = 18;

    return (
      <tr>
        {['Order ID', 'LSI ID', 'Cap (Mb)', 'Cap (Kb)', 'Billing Address', 'State', 'Product', 'Rate', 'Total Basic'].map(h => (
          <th key={h} className="px-4 py-4 font-semibold text-gray-700 whitespace-nowrap">{h}</th>
        ))}
        {mixedGSTTypes ? (
          <>
            <th className="px-4 py-4 font-semibold text-gray-700 whitespace-nowrap">CGST {cgstRate}%</th>
            <th className="px-4 py-4 font-semibold text-gray-700 whitespace-nowrap">SGST {sgstRate}%</th>
            <th className="px-4 py-4 font-semibold text-gray-700 whitespace-nowrap">CGST+SGST Amt</th>
            <th className="px-4 py-4 font-semibold text-gray-700 whitespace-nowrap">IGST {igstRate}%</th>
          </>
        ) : isSelf0 ? (
          <>
            <th className="px-4 py-4 font-semibold text-gray-700 whitespace-nowrap">CGST {cgstRate}%</th>
            <th className="px-4 py-4 font-semibold text-gray-700 whitespace-nowrap">SGST {sgstRate}%</th>
            <th className="px-4 py-4 font-semibold text-gray-700 whitespace-nowrap">CGST+SGST Amt</th>
          </>
        ) : (
          <th className="px-4 py-4 font-semibold text-gray-700 whitespace-nowrap">IGST {igstRate}%</th>
        )}
        <th className="px-4 py-4 font-semibold text-gray-700 whitespace-nowrap">Grand Total</th>
        <th className="px-4 py-4 font-semibold text-gray-700 whitespace-nowrap">ARC Total</th>
        <th className="px-4 py-4 font-semibold text-gray-700 whitespace-nowrap">Split</th>
      </tr>
    );
  };

  // ── Render a single billing row ────────────────────────────────────────────
  const renderBillingRow = (item, isSelf, showAllCols) => {
 
    if (!item) return null;

    const cgstAmt = Number(item.cgst) || 0;
    const sgstAmt = Number(item.sgst) || 0;
    const igstAmt = Number(item.igst) || 0;
    const cgstSgstAmt = cgstAmt + sgstAmt;

    return (
      <tr key={item._id} className="border-t border-gray-200 text-base hover:bg-gray-50 transition-colors">
        <td className="py-4 px-4 font-semibold text-gray-900">{order.orderId}</td>
        <td className="py-4 px-4 font-semibold text-gray-600">{item.circuitId || '–'}</td>
        <td className="py-4 px-4 font-semibold text-gray-700">{capacityMbps} Mbps</td>
        <td className="py-4 px-4 font-semibold text-gray-600">{capacityKbps.toLocaleString()}</td>
        <td className="py-4 px-4 font-semibold text-gray-600">
          <span className="block max-w-[180px]">
            {truncateWithMore(item.billingAddress, 20, "...more", setShowEndPopup)}
          </span>
        </td>
        <td className="py-4 px-4 font-semibold text-gray-900">{item.state || '–'}</td>
        <td className="py-4 px-4 font-semibold text-gray-900">{<Badge color="purple">{productLabel}</Badge> || '-'}</td>
        <td className="py-4 px-4 font-bold text-blue-700">₹{Number(item.splitPrice || 0).toFixed(2)}</td>
        <td className="py-4 px-4 font-bold text-blue-600">₹{Number(item.basicTotal || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>

        {showAllCols ? (
          <>
            <td className="py-4 px-4 font-semibold text-green-700">{isSelf ? `₹${cgstAmt.toFixed(0)}` : '–'}</td>
            <td className="py-4 px-4 font-semibold text-green-700">{isSelf ? `₹${sgstAmt.toFixed(0)}` : '–'}</td>
            <td className="py-4 px-4 font-semibold text-purple-700">{isSelf ? `₹${cgstSgstAmt.toFixed(0)}` : '–'}</td>
            <td className="py-4 px-4 font-semibold text-green-700">{!isSelf ? `₹${igstAmt.toFixed(0)}` : '–'}</td>
          </>
        ) : isSelf ? (
          <>
            <td className="py-4 px-4 font-semibold text-green-700">₹{cgstAmt.toFixed(0)}</td>
            <td className="py-4 px-4 font-semibold text-green-700">₹{sgstAmt.toFixed(0)}</td>
            <td className="py-4 px-4 font-semibold text-purple-700">₹{cgstSgstAmt.toFixed(0)}</td>
          </>
        ) : (
          <td className="py-4 px-4 font-semibold text-green-700">₹{igstAmt.toFixed(0)}</td>
        )}

        <td className="py-4 px-4 font-bold text-green-700">
          ₹{Number(item.grandTotal || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
        </td>
        <td className="py-4 px-4 font-bold text-purple-700">
          ₹{Number(item.arc || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
        </td>
        <td className="py-4 px-4 text-center">
          <span className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-gray-100 text-gray-700 border border-gray-200">
            {Number(item.splitPercent || 100).toFixed(0)}%
          </span>
        </td>
      </tr>
    );
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 border-l-4 border-l-green-500 hover:shadow-md transition-shadow">

        {/* ── Card Header ── */}
        <div className="bg-gray-50 px-6 py-5 border-b border-gray-200 flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 flex-wrap">
                <span className="text-gray-600 font-semibold text-base">Order Id:</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-900 rounded-lg text-base font-bold border border-purple-200">
                  {order.orderId}
                </span>

                {orderTypeLabel && <Badge color="blue">{orderTypeLabel}</Badge>}
                {entityLabel && <Badge color="orange">{entityLabel}</Badge>}
                <span className="text-gray-400">•</span>
                <span className="text-gray-600 font-semibold text-base">Company:</span>
                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-900 rounded-lg text-base font-semibold border border-blue-200">
                  {truncateWithMore(companyLabel, 50, "...more", setShowEndPopup)}
                </span>
              </h3>

              {/* End A / End B */}
              <p className="text-sm font-semibold text-gray-600 mt-3 flex items-center gap-2 flex-wrap">
                <span className="font-semibold">End A:</span>
                <span className="bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">
                  {truncateWithMore(endAText, 40, "...more", setShowEndPopup)}
                </span>
                <span className="text-gray-400">•</span>
                <span className="font-semibold">End B:</span>
                <span className="bg-green-100 border border-green-200 rounded-full px-2.5 py-1">
                  {truncateWithMore(endBText, 40, "...more", setShowEndPopup)}
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 text-right">
            <div className="flex gap-2 items-center flex-wrap justify-end">
              <span className="text-sm text-green-700 font-semibold bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                PCD Effective: {pcdDate ? formatDateDisplay(pcdDate) : '-'}
              </span>

              <span className="text-sm text-orange-700 font-semibold bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200">
                PCD Closing: {operationalDate ? formatDateDisplay(operationalDate) : '-'}
              </span>
              {terminateDate && (
                <span className="text-sm text-red-600 font-semibold bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
                  Terminate: {formatDateDisplay(terminateDate)}
                </span>
              )}

              {/* View button */}
              <button onClick={() => router.push(`/billing/account/pcd-closure/view?pcdId=${order._id}`)}>
                <Eye className='text-blue-600' />
              </button>


              {isAdmin && (
                <>
                  <button
                    className="p-2 hover:bg-blue-50 rounded-lg"
                    title="Edit"
                    onClick={() => setEditModalOpen(true)}
                  >
                    <Edit className="w-5 h-5 text-red-600" />
                  </button>

                  <button
                    onClick={() =>
                      router.push(`/billing/account/pcd-closure/generate-bill?pcdId=${order._id}`)
                    }
                  >
                    <div className='bg-black text-amber-50 font-bold px-1.5 text-center rounded-full'>
                      G
                    </div>
                  </button>
                </>
              )}



            </div>

            <div className="flex flex-wrap gap-2 justify-end">
              {/* {entityLabel && <Badge color="orange">{entityLabel}</Badge>}
              {orderTypeLabel && <Badge color="blue">{orderTypeLabel}</Badge>} */}
              {/* {productLabel && <Badge color="purple">{productLabel}</Badge>} */}
              {/* {bsoLabel && <Badge color="teal">{bsoLabel}</Badge>} */}
              {/* <Badge color={isActive ? 'green' : 'red'}>{isActive ? 'Active' : 'Inactive'}</Badge> */}
            </div>
          </div>
        </div>

        {/* ── Billing Table ── */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-sm font-semibold text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
              {buildHeaders()}
            </thead>
            <tbody>
              {billingItems.length > 0 ? (
                billingItems.map((item, idx) => {
                  const isSelf = idx === 0 ? isSelf0 : isSelf1;
                  return renderBillingRow(item, isSelf, mixedGSTTypes);
                })
              ) : (
                <tr>
                  <td colSpan={12} className="py-6 text-center text-gray-400 font-semibold">
                    No billing data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Summary Footer ── */}
        {/* {order.summary && (
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex flex-wrap gap-6 justify-end text-sm font-semibold">
            <span className="text-gray-600">
              Total Basic: <span className="text-blue-700">₹{Number(order.summary.totalBasic || 0).toLocaleString('en-IN')}</span>
            </span>
            {order.summary.totalIgst > 0 && (
              <span className="text-gray-600">
                IGST: <span className="text-green-700">₹{Number(order.summary.totalIgst).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </span>
            )}
            {(order.summary.totalCgst > 0 || order.summary.totalSgst > 0) && (
              <span className="text-gray-600">
                CGST+SGST: <span className="text-green-700">₹{(Number(order.summary.totalCgst) + Number(order.summary.totalSgst)).toLocaleString('en-IN')}</span>
              </span>
            )}
            <span className="text-gray-600">
              Grand Total: <span className="text-green-800 font-bold">₹{Number(order.summary.totalGrand || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            </span>
          </div>
        )} */}

      </div>

      {/* ── End Address Popup ── */}
      {showEndPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowEndPopup(null)}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-red-700 font-bold text-xl"
              onClick={() => setShowEndPopup(null)}
            >
              ✕
            </button>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Full Address</h4>
            <div className="max-h-[300px] overflow-y-auto pr-2">
              <p className="text-gray-700 text-sm leading-relaxed break-words">
                {showEndPopup}
              </p>
            </div>
            <div className="mt-6 flex justify-between items-center">
              <button
                onClick={() => { navigator.clipboard.writeText(showEndPopup); }}
                className="text-sm text-blue-600 hover:underline"
              >
                Copy
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                onClick={() => setShowEndPopup(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit PCD Modal ── */}
      <EditPcdModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        order={order}
        onSuccess={onRefetch}
      />
    </>
  );
};

export default OrderCard;