"use client";

import { API_BACKEND_URL } from '@/config/getEnvVariables';
import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

const COLUMNS = [
    { key: 'orderId', label: 'Order ID' },
    { key: 'stateCode', label: 'State Code' },
    { key: 'openingAdjustmentAmount', label: 'Adjustment Amount (₹)' },
    { key: 'notes', label: 'Notes' },
];

const OpeningBalanceBulkExcel = () => {
    const [rows, setRows] = useState([]);
    const [fileName, setFileName] = useState('');
    const [loading, setLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const fileInputRef = useRef(null);

    const parseExcel = (file) => {
        if (!file) return;
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
        ];
        if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
            toast.error('Please upload a valid Excel file (.xlsx or .xls)');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const workbook = XLSX.read(e.target.result, { type: 'binary' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const data = XLSX.utils
                    .sheet_to_json(sheet, { defval: '' })
                    .filter(
                        (row) =>
                            String(row.orderId || '').trim() ||
                            String(row.openingAdjustmentAmount || '').trim() ||
                            String(row.notes || '').trim()
                    );
                if (!data.length) {
                    toast.error('Excel file is empty or has no valid data');
                    return;
                }
                setRows(data);
                setFileName(file.name);
                toast.success(`${data.length} rows loaded successfully`);
            } catch {
                toast.error('Failed to parse Excel file');
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleFileChange = (e) => parseExcel(e.target.files[0]);

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        parseExcel(e.dataTransfer.files[0]);
    };

    const handleClearRow = (idx) => {
        setRows((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleClearAll = () => {
        setRows([]);
        setFileName('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const totalAmount = rows.reduce((sum, r) => {
        const val = parseFloat(r.openingAdjustmentAmount || 0);
        return sum + (isNaN(val) ? 0 : val);
    }, 0);

    const handleSubmit = async () => {
        if (!rows.length) {
            toast.error('No data to submit. Please upload an Excel file first.');
            return;
        }
        setLoading(true);
        try {
            // Re-create the file from parsed data to submit as form-data
            const ws = XLSX.utils.json_to_sheet(rows);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
            const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([excelBuffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });

            const formData = new FormData();
            formData.append('file', blob, fileName || 'opening-adjustment.xlsx');

            const response = await fetch(
                `${API_BACKEND_URL}/billing/sale/ledger/bulk/opening-adjustment`,
                {
                    method: 'POST',
                    body: formData,
                    credentials: 'include',
                }
            );

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err?.message || `Server error: ${response.status}`);
            }

            toast.success('Opening adjustments submitted successfully!');
            handleClearAll();
        } catch (err) {
            toast.error(err.message || 'Submission failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen  p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            Opening Adjustment — Bulk Upload
                        </h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Upload an Excel file to preview and submit opening adjustments in bulk.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowDownloadModal(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition-all"
                        >
                            Download Template
                        </button>

                        {rows.length > 0 && (
                            <button
                                onClick={handleClearAll}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-all"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                                Clear All
                            </button>
                        )}
                    </div>
                </div>

                {/* Upload Zone */}
                {!rows.length && (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        className={`relative flex flex-col items-center justify-center gap-4 p-12 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200
              ${isDragging
                                ? 'border-indigo-500 bg-indigo-50 scale-[1.01]'
                                : 'border-gray-300 bg-white hover:border-indigo-400 hover:bg-indigo-50/40'
                            }`}
                    >
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors
              ${isDragging ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                            <svg className={`w-8 h-8 transition-colors ${isDragging ? 'text-indigo-600' : 'text-gray-400'}`}
                                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                        </div>
                        <div className="text-center">
                            <p className="text-base font-semibold text-gray-700">
                                {isDragging ? 'Drop your file here' : 'Drag & drop your Excel file'}
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                                or <span className="text-indigo-600 font-medium">click to browse</span> — .xlsx, .xls supported
                            </p>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>
                )}

                {/* File Info + Stats Bar */}
                {rows.length > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-800">{fileName}</p>
                                <p className="text-xs text-gray-400">{rows.length} rows ready to submit</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <p className="text-xs text-gray-400 uppercase tracking-wider">Total Rows</p>
                                <p className="text-lg font-bold text-gray-800">{rows.length}</p>
                            </div>
                            <div className="w-px h-8 bg-gray-200" />
                            <div className="text-center">
                                <p className="text-xs text-gray-400 uppercase tracking-wider">Total Amount</p>
                                <p className="text-lg font-bold text-indigo-600">
                                    ₹{totalAmount.toLocaleString('en-IN')}
                                </p>
                            </div>
                            <div className="w-px h-8 bg-gray-200" />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Re-upload
                            </button>
                            <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileChange} />
                        </div>
                    </div>
                )}

                {/* Submit Footer */}
                {rows.length > 0 && (
                    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-sm text-gray-500">
                            <span className="font-semibold text-gray-700">{rows.length} records</span> will be submitted to the server.
                        </p>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white
                bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800
                disabled:opacity-60 disabled:cursor-not-allowed
                shadow-[0_1px_2px_rgba(99,102,241,0.3),0_4px_12px_rgba(99,102,241,0.25)]
                hover:shadow-[0_2px_4px_rgba(99,102,241,0.4),0_8px_20px_rgba(99,102,241,0.3)]
                transition-all duration-200"
                        >
                            {loading ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Submitting…
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                    </svg>
                                    Submit {rows.length} Records
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Data Table */}
                {rows.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-10">#</th>
                                        {COLUMNS.map((col) => (
                                            <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                {col.label}
                                            </th>
                                        ))}
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {rows.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50/60 transition-colors group">
                                            <td className="px-4 py-3 text-gray-400 font-mono text-xs">{idx + 1}</td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono font-semibold text-xs">
                                                    {row.orderId || '—'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-medium text-xs">
                                                    {row.stateCode || '—'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-gray-800">
                                                {row.openingAdjustmentAmount
                                                    ? `₹${Number(row.openingAdjustmentAmount).toLocaleString('en-IN')}`
                                                    : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 max-w-xs truncate">
                                                {row.notes || <span className="text-gray-300 italic text-xs">No notes</span>}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => handleClearRow(idx)}
                                                    className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center mx-auto text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                                    title="Remove row"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                {/* Footer total row */}
                                <tfoot>
                                    <tr className="bg-gray-50 border-t-2 border-gray-200">
                                        <td colSpan={3} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                                            Total
                                        </td>
                                        <td className="px-4 py-3 font-bold text-indigo-600">
                                            ₹{totalAmount.toLocaleString('en-IN')}
                                        </td>
                                        <td colSpan={2} />
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                )}

            </div>

            {showDownloadModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                📥
                            </div>

                            <div>
                                <h2 className="text-lg font-bold text-gray-900">
                                    Download Template
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Are you sure you want to download the template?
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setShowDownloadModal(false)}
                                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={() => {
                                    setShowDownloadModal(false);

                                    const link = document.createElement('a');
                                    link.href =
                                        '/templates/opening-adjustment-template.xlsx';
                                    link.download =
                                        'opening-adjustment-template.xlsx';
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                }}
                                className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                            >
                                Yes, Download
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OpeningBalanceBulkExcel;