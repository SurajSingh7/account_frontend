
'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_BACKEND_URL } from '@/config/getEnvVariables';


const GenerateBillModal = () => {

  const router = useRouter();
  const searchParams = useSearchParams();

  const billingReadId = searchParams.get('pcdId');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [response, setResponse] = useState(null);

  const handleGenerateBill = async () => {

    if (!billingReadId) {
      setError('Billing Read ID not found');
      return;
    }

    setLoading(true);
    setError('');
    setResponse(null);

    try {

      const res = await fetch(
        `${API_BACKEND_URL}/billing/sale/monthly/generate`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            billingReadId,
          }),
        }
      );

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to generate bill');
      }

      setResponse(json);

    } catch (err) {
      console.error('Generate Bill Error:', err);
      setError(err.message || 'Something went wrong');

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">

          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Generate Monthly Bill
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Generate billing record for selected PCD entry.
            </p>
          </div>

          <button
            onClick={() => router.back()}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Close
          </button>

        </div>

        {/* Content */}
        <div className="space-y-5 p-6">

          {/* Billing ID */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Billing Read ID
            </p>

            <p className="mt-2 break-all font-mono text-sm text-gray-900">
              {billingReadId || 'N/A'}
            </p>

          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {/* Response */}
          {response && (
            <div className="rounded-2xl border border-green-200 bg-green-50 overflow-hidden">

              <div className="border-b border-green-200 px-5 py-3">
                <h3 className="text-lg font-semibold text-green-800">
                  Bill Generated Successfully
                </h3>
              </div>

              <div className="p-5">

                <pre className="max-h-[400px] overflow-auto rounded-xl bg-black p-4 text-sm text-green-400">
                  {JSON.stringify(response, null, 2)}
                </pre>

              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">

          <button
            onClick={() => router.back()}
            className="rounded-xl border border-gray-300 px-5 py-2.5 font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={handleGenerateBill}
            disabled={loading}
            className="rounded-xl bg-black px-5 py-2.5 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Generating...' : 'Generate Bill'}
          </button>

        </div>

      </div>

    </div>
  );
};

export default GenerateBillModal;

