'use client'
import React, { useState, useEffect, useCallback } from 'react';
import Pagination from '@/shared/ui/pagination/Pagination';
import { API_BACKEND_URL } from '@/config/getEnvVariables';
import { API_ENDPOINTS } from '@/constants/api';

const STATUS_CONFIG = {
  EXECUTED: { label: 'Executed', className: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20' },
  PENDING:  { label: 'Pending',  className: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20' },
  FAILED:   { label: 'Failed',   className: 'bg-red-50 text-red-700 ring-1 ring-red-600/20' },
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
};

// ── Skipped Rows Modal ────────────────────────────────────────
const SkippedRowsModal = ({ record, onClose }) => {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  if (!record) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-red-50 to-rose-50">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-800">Skipped Rows</h3>
                <p className="text-xs text-gray-500 mt-0.5 max-w-xs truncate">{record.fileName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-white hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Summary pills */}
          <div className="flex gap-3 mt-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-semibold text-gray-600 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
              Total: {record.totalRowsInSheet}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              Processed: {record.processedCount}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-xs font-semibold text-red-700 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
              Skipped: {record.skippedCount}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-auto max-h-[360px]">
          {record.skippedRows?.length > 0 ? (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr className="border-b border-gray-100">
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Row</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Order ID</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">State Code</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {record.skippedRows.map((row, i) => (
                  <tr key={row._id} className={`transition-colors hover:bg-red-50/40 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-50 text-red-600 text-xs font-bold">
                        {row.rowNumber}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-bold text-gray-800">{row.orderId}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-bold">
                        {row.stateCode}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-gray-500 leading-relaxed">{row.reason}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <svg className="w-10 h-10 mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm font-medium">No skipped rows</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Skeleton Row ──────────────────────────────────────────────
const SkeletonRow = () => (
  <tr className="animate-pulse">
    {Array.from({ length: 9 }).map((_, i) => (
      <td key={i} className="px-5 py-4">
        <div className="h-4 bg-gray-100 rounded-full w-full max-w-[120px]" />
      </td>
    ))}
  </tr>
);

// ── Main Component ────────────────────────────────────────────
const HistoryOpeningBalanceBulk = () => {
  const [data,           setData]           = useState([]);
  const [totalItems,     setTotalItems]     = useState(0);
  const [currentPage,    setCurrentPage]    = useState(1);
  const [limit,          setLimit]          = useState(10);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchHistory = useCallback(async (page, pageLimit) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_BACKEND_URL}${API_ENDPOINTS.purchase.ledger.bulk.openingAdjustmentHistory}?page=${page}&limit=${pageLimit}`,
        { credentials: 'include' }
      );
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data || []);
        setTotalItems(json.pagination?.total ?? 0);
      } else {
        throw new Error(json.message || 'Failed to fetch history');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(currentPage, limit);
  }, [currentPage, limit, fetchHistory]);

  const handlePageChange        = (page)     => setCurrentPage(page);
  const handleItemsPerPageChange = (newLimit) => { setLimit(newLimit); setCurrentPage(1); };

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Bulk Upload History</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {totalItems > 0 ? `${totalItems} record${totalItems !== 1 ? 's' : ''} found` : 'Opening balance bulk upload records'}
          </p>
        </div>
        <button
          onClick={() => fetchHistory(currentPage, limit)}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
        >
          <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm font-medium">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-emerald-50 border-b-2 border-gray-100">
                <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">#</th>
                <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">File Name</th>
                <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Uploaded By</th>
                <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">Uploaded At</th>
                <th className="px-5 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">Total Rows</th>
                <th className="px-5 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wide">Processed</th>
                <th className="px-5 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wide">Skipped</th>
                <th className="px-5 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-5 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wide">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: Math.min(limit, 5) }).map((_, i) => <SkeletonRow key={i} />)
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                      <svg className="w-12 h-12 mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-base font-semibold text-gray-500">No upload history found</p>
                      <p className="text-sm mt-1 text-gray-400">Bulk upload records will appear here</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((record, index) => {
                  const statusCfg = STATUS_CONFIG[record.status] || {
                    label: record.status,
                    className: 'bg-gray-100 text-gray-600 ring-1 ring-gray-400/20',
                  };
                  const rowNum = (currentPage - 1) * limit + index + 1;
                  const processedPct = record.totalRowsInSheet > 0
                    ? Math.round((record.processedCount / record.totalRowsInSheet) * 100)
                    : 0;

                  return (
                    <tr key={record._id} className="hover:bg-emerald-50/30 transition-colors">

                      {/* # */}
                      <td className="px-5 py-4">
                        <span className="text-sm font-bold text-gray-400">{rowNum}</span>
                      </td>

                      {/* File Name */}
                      <td className="px-5 py-4 max-w-[220px]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <span className="text-sm font-semibold text-gray-700 truncate" title={record.fileName}>
                            {record.fileName}
                          </span>
                        </div>
                      </td>

                      {/* Uploaded By */}
                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-gray-800">{record.uploadedBy?.name || '—'}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{record.uploadedBy?.email}</p>
                      </td>

                      {/* Uploaded At */}
                      <td className="px-5 py-4 text-sm font-medium text-gray-600 whitespace-nowrap">
                        {formatDate(record.uploadedAt)}
                      </td>

                      {/* Total Rows */}
                      <td className="px-5 py-4 text-center">
                        <span className="text-base font-extrabold text-gray-700">{record.totalRowsInSheet}</span>
                      </td>

                      {/* Processed */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col items-center gap-1.5">
                          <span className="text-base font-extrabold text-emerald-600">{record.processedCount}</span>
                          <div className="w-14 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-emerald-400 transition-all"
                              style={{ width: `${processedPct}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-gray-400">{processedPct}%</span>
                        </div>
                      </td>

                      {/* Skipped */}
                      <td className="px-5 py-4 text-center">
                        <span className={`text-base font-extrabold ${record.skippedCount > 0 ? 'text-rose-500' : 'text-gray-300'}`}>
                          {record.skippedCount}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${statusCfg.className}`}>
                          {statusCfg.label}
                        </span>
                      </td>

                      {/* Details */}
                      <td className="px-5 py-4 text-center">
                        {record.skippedCount > 0 ? (
                          <button
                            onClick={() => setSelectedRecord(record)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100 transition-colors"
                          >
                            View {record.skippedCount}
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        ) : (
                          <span className="text-sm text-gray-300 font-bold">—</span>
                        )}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalItems > 0 && (
          <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50">
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              itemsPerPage={limit}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        )}
      </div>

      {/* Skipped Rows Modal */}
      {selectedRecord && (
        <SkippedRowsModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />
      )}
    </div>
  );
};

export default HistoryOpeningBalanceBulk;