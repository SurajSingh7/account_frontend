'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  CalendarClock,
  Clock3,
  FileClock,
  History,
  Loader2,
  UserRound,
  X,
} from 'lucide-react';
import { API_BACKEND_URL } from '@/config/getEnvVariables';
import { API_ENDPOINTS } from '@/constants/api';
import Pagination from '@/shared/ui/pagination/Pagination';

const formatLabel = (value) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatDate = (value, includeTime = false) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(date);
};

const formatValue = (field, value) => {
  if (value == null || value === '') return 'Not set';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';

  if (typeof value === 'object') {
    if ('start' in value || 'end' in value) {
      return [value.start, value.end].filter(Boolean).map((date) => formatDate(date)).join(' – ') || 'Not set';
    }
    return Object.entries(value)
      .map(([key, item]) => `${formatLabel(key)}: ${formatValue(key, item)}`)
      .join(' · ');
  }

  if (typeof value === 'number' && /amount|cgst|sgst|igst/i.test(field)) {
    return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  if (typeof value === 'string' && /date|At$/i.test(field)) return formatDate(value, /At$/i.test(field));
  return String(value);
};

const Actor = ({ actor, compact = false }) => (
  <div className="flex min-w-0 items-center gap-2.5">
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
      <UserRound className="h-4 w-4" />
    </span>
    <div className="min-w-0">
      <p className="truncate text-sm font-semibold text-slate-800">{actor?.name || 'Unknown user'}</p>
      {!compact && actor?.email && <p className="truncate text-xs text-slate-500">{actor.email}</p>}
    </div>
  </div>
);

const DataSnapshot = ({ data }) => {
  const entries = Object.entries(data || {});
  if (!entries.length) {
    return <p className="text-xs italic text-slate-400">No transaction details available.</p>;
  }

  return (
    <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {entries.map(([field, value]) => (
        <div key={field} className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/80 px-3.5 py-3">
          <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{formatLabel(field)}</dt>
          <dd className="mt-1 break-words text-sm font-medium text-slate-700">{formatValue(field, value)}</dd>
        </div>
      ))}
    </dl>
  );
};

const ChangeEntry = ({ entry, index }) => {
  const previousData = entry.previousData;
  const currentData = entry.currentData;
  const changedFields = entry.changedFields || [];
  const isCreated = entry.changeType === 'CREATED';

  return (
    <article className="relative rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xs font-bold text-indigo-600">
            {index}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide ${
                isCreated
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-amber-50 text-amber-700'
              }`}>
                {formatLabel(entry.changeType || 'UPDATED')}
              </span>
              {changedFields.length > 0 && (
                <span className="text-xs text-slate-500">
                  {changedFields.length} field{changedFields.length === 1 ? '' : 's'} changed
                </span>
              )}
            </div>
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
              <Clock3 className="h-3.5 w-3.5" />
              {formatDate(entry.createdAt, true)}
            </p>
          </div>
        </div>
        <div className="min-w-[180px] sm:max-w-[240px]">
          <Actor actor={entry.changedBy} compact />
        </div>
      </div>

      <div className="space-y-4 px-5 py-5">
        {entry.changeReason && (
          <div className="rounded-xl bg-indigo-50/70 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Reason</p>
            <p className="mt-1 text-sm text-indigo-900">{entry.changeReason}</p>
          </div>
        )}

        {!isCreated && changedFields.length > 0 ? (
          <div className="space-y-3">
            {changedFields.map((field) => (
              <div key={field} className="grid gap-2 md:grid-cols-[minmax(100px,0.35fr)_1fr_auto_1fr] md:items-center">
                <p className="text-xs font-bold text-slate-600">{formatLabel(field)}</p>
                <div className="min-w-0 rounded-xl border border-rose-100 bg-rose-50/60 px-3.5 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Before</p>
                  <p className="mt-1 break-words text-sm text-rose-800">{formatValue(field, previousData?.[field])}</p>
                </div>
                <ArrowRight className="hidden h-4 w-4 text-slate-300 md:block" />
                <div className="min-w-0 rounded-xl border border-emerald-100 bg-emerald-50/60 px-3.5 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">After</p>
                  <p className="mt-1 break-words text-sm font-medium text-emerald-800">{formatValue(field, currentData?.[field])}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {isCreated ? 'Transaction created with' : 'Transaction details'}
            </p>
            <DataSnapshot data={currentData || previousData} />
          </div>
        )}
      </div>
    </article>
  );
};

const SingleTransactionHistoryModal = ({ transaction, onClose }) => {
  const [mounted, setMounted] = useState(false);
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => setMounted(true), []);

  const fetchHistory = useCallback(async (signal) => {
    if (!transaction?._id) {
      setError('This transaction does not have an ID, so its history cannot be loaded.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const url = new URL(
        `${API_BACKEND_URL}${API_ENDPOINTS.customers.billing.ledger.singleTransactionHistory}${encodeURIComponent(transaction._id)}/history/`
      );
      url.searchParams.set('page', String(page));
      url.searchParams.set('limit', String(limit));

      const response = await fetch(url, { credentials: 'include', signal });
      const json = await response.json();
      if (!response.ok || json?.success === false) {
        throw new Error(json?.message || `Failed to load transaction history (${response.status})`);
      }

      const result = json?.data;
      setEntries(Array.isArray(result?.data) ? result.data : []);
      setSummary(result?.summary ?? null);
      setPagination(result?.pagination ?? { page, limit, total: result?.data?.length ?? 0 });
    } catch (fetchError) {
      if (fetchError.name !== 'AbortError') {
        setError(fetchError.message || 'Failed to load transaction history.');
      }
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, [transaction?._id, page, limit]);

  useEffect(() => {
    const controller = new AbortController();
    fetchHistory(controller.signal);
    return () => controller.abort();
  }, [fetchHistory]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!mounted) return null;

  const transactionType = transaction?.type ?? transaction?.transactionType ?? 'Transaction';
  const transactionId = transaction?._id;
  const orderId = transaction?.orderId ?? transaction?.order?.orderId;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="transaction-history-title"
        className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-white/70 bg-slate-50 shadow-2xl"
      >
        <header className="relative shrink-0 overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-800 px-5 py-5 text-white sm:px-8 sm:py-6">
          <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full bg-indigo-400/15 blur-3xl" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 shadow-inner">
                <History className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 id="transaction-history-title" className="text-lg font-bold sm:text-xl">Transaction history</h2>
                  <span className="rounded-full border border-indigo-300/25 bg-indigo-300/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-100">
                    {formatLabel(transactionType)}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-indigo-100/80">
                  {orderId && <span>Order {orderId}</span>}
                  {/* <span className="truncate font-mono text-indigo-100/65">ID: {transactionId}</span> */}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close transaction history"
              className="shrink-0 rounded-xl p-2 text-indigo-100 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="grid shrink-0 grid-cols-1 divide-y divide-slate-200 border-b border-slate-200 bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="flex items-center gap-3 px-5 py-3.5 sm:px-7">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Activity className="h-4 w-4" /></span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Recorded changes</p>
              <p className="mt-0.5 text-lg font-bold text-slate-800">{summary?.totalChanges ?? pagination.total ?? '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-5 py-3.5 sm:px-7">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><UserRound className="h-4 w-4" /></span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Created by</p>
              <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">{summary?.createdBy?.name || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-5 py-3.5 sm:px-7">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><CalendarClock className="h-4 w-4" /></span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Last updated</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-800">{formatDate(summary?.lastModifiedAt, true)}</p>
            </div>
          </div>
        </div>

        <main className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-8 sm:py-6">
          {summary?.lastModifiedBy && (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Most recent activity by</p>
                <Actor actor={summary.lastModifiedBy} />
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500">
                <FileClock className="h-3.5 w-3.5" />
                {summary?.lastModifiedAt ? formatDate(summary.lastModifiedAt, true) : 'Activity time unavailable'}
              </span>
            </div>
          )}

          {loading && (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
              <p className="text-sm font-medium text-slate-500">Loading transaction history…</p>
            </div>
          )}

          {!loading && error && (
            <div className="mx-auto flex max-w-xl items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-5">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
              <div>
                <p className="font-semibold text-rose-800">Couldn’t load transaction history</p>
                <p className="mt-1 text-sm text-rose-700">{error}</p>
                <button
                  type="button"
                  onClick={() => fetchHistory(new AbortController().signal)}
                  className="mt-3 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-rose-700"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {!loading && !error && entries.length === 0 && (
            <div className="flex min-h-64 flex-col items-center justify-center text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-slate-300 shadow-sm ring-1 ring-slate-200">
                <History className="h-8 w-8" />
              </span>
              <p className="mt-4 font-semibold text-slate-700">No history available</p>
              <p className="mt-1 text-sm text-slate-500">Changes to this transaction will appear here.</p>
            </div>
          )}

          {!loading && !error && entries.length > 0 && (
            <div className="space-y-4">
              {entries.map((entry, index) => (
                <ChangeEntry
                  key={entry._id || `${entry.changeType}-${entry.createdAt}-${index}`}
                  entry={entry}
                  index={(page - 1) * limit + index + 1}
                />
              ))}
            </div>
          )}
        </main>

        <footer className="shrink-0 border-t border-slate-200 bg-white px-4 py-4 sm:px-8">
          <div className="flex flex-col-reverse items-center gap-4 sm:flex-row">
            <div className="min-w-0 flex-1">
              {!loading && !error && (pagination.total ?? 0) > 0 && (
                <Pagination
                  currentPage={page}
                  totalItems={pagination.total}
                  itemsPerPage={limit}
                  onPageChange={setPage}
                  onItemsPerPageChange={(newLimit) => {
                    setLimit(newLimit);
                    setPage(1);
                  }}
                  className="flex-wrap gap-3"
                />
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 sm:w-auto"
            >
              Close
            </button>
          </div>
        </footer>
      </section>
    </div>,
    document.body
  );
};

export default SingleTransactionHistoryModal;
