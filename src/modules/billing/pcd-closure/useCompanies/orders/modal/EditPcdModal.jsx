"use client";
import React, { useState, useEffect } from "react";
import { X, CheckCircle2, Percent } from "lucide-react";
import toast from "react-hot-toast";
import { API_BACKEND_URL } from "@/config/getEnvVariables";
import { useRouter } from "next/navigation";

const EditPcdModal = ({ isOpen, onClose, order,onSuccess }) => {
  const billingItems = order?.billingItems || [];
  const hasTwoItems  = billingItems.length === 2;
  const router = useRouter();
 
  console.log("ghjk",order);

  // ── Split state — index 0 and index 1 ─────────────────────────────────────
  const [split0, setSplit0] = useState("");
  const [split1, setSplit1] = useState("");
  const [loading, setLoading] = useState(false);

  // Seed from existing order data when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setSplit0(String(billingItems[0]?.splitPercent ?? 50));
    setSplit1(String(billingItems[1]?.splitPercent ?? 50));
  }, [isOpen]);

  if (!isOpen) return null;

  // ── If only 1 billing item — nothing to edit ──────────────────────────────
  if (!hasTwoItems) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">Edit Order</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
          </div>
          <p className="text-sm text-gray-500 text-center py-6">Single billing item — split edit not applicable.</p>
        </div>
      </div>
    );
  }

  // ── Auto-balance: change index 0 → auto set index 1 ──────────────────────
  const handleSplit0Change = (val) => {
    const n = Math.min(100, Math.max(0, Number(val) || 0));
    setSplit0(String(n));
    setSplit1(String(100 - n));
  };

  const handleSplit1Change = (val) => {
    const n = Math.min(100, Math.max(0, Number(val) || 0));
    setSplit1(String(n));
    setSplit0(String(100 - n));
  };

  const total    = (Number(split0) || 0) + (Number(split1) || 0);
  const isValid  = total === 100;
  const canSave  = isValid && !loading;

  // ── API call ───────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!canSave) return;

    const payload = {
      splitPercentages: [
        { index: 0, percentage: Number(split0) },
        { index: 1, percentage: Number(split1) },
      ],
    };

    setLoading(true);
    try {
      const res = await fetch(
        `${API_BACKEND_URL}/billing/sale/ready-order/modify/${order._id}`,
        {
          method:      "PUT",
          headers:     { "Content-Type": "application/json" },
          credentials: "include",           // sends cookies/session
          body:        JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Error ${res.status}`);
      }

      toast.success("Split updated successfully!");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to update split");
    } finally {
      setLoading(false);
    }
  };

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Edit Split %</h2>
            <p className="text-xs text-gray-400 mt-0.5">#{order.orderId}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">

          {/* Item 0 */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {billingItems[0]?.label || 'Item 1'}
                </p>
                <p className="text-xs text-gray-400">{billingItems[0]?.circuitId}</p>
              </div>
              <span className="text-xs text-gray-400 bg-white border border-gray-200 px-2 py-1 rounded-lg">
                {billingItems[0]?.state}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <input
                type="number"
                min="0"
                max="100"
                value={split0}
                onChange={e => handleSplit0Change(e.target.value)}
                className="w-24 text-right px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <Percent className="w-4 h-4 text-gray-400" />
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${split0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Item 1 */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {billingItems[1]?.label || 'Item 2'}
                </p>
                <p className="text-xs text-gray-400">{billingItems[1]?.circuitId}</p>
              </div>
              <span className="text-xs text-gray-400 bg-white border border-gray-200 px-2 py-1 rounded-lg">
                {billingItems[1]?.state}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <input
                type="number"
                min="0"
                max="100"
                value={split1}
                onChange={e => handleSplit1Change(e.target.value)}
                className="w-24 text-right px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <Percent className="w-4 h-4 text-gray-400" />
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${split1}%` }}
                />
              </div>
            </div>
          </div>

          {/* Total indicator */}
          <div className={`flex items-center justify-between px-4 py-2.5 rounded-lg border text-sm font-semibold ${
            isValid
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-600'
          }`}>
            <span>Total</span>
            <span className="flex items-center gap-1">
              {total}%
              {isValid && <CheckCircle2 className="w-4 h-4" />}
              {!isValid && <span className="text-xs">(must be 100%)</span>}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className={`px-5 py-2 text-sm font-semibold rounded-lg transition-colors ${
              canSave
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPcdModal;