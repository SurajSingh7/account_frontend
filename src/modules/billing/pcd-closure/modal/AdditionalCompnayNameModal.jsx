"use client";

import React, { useState, useEffect } from 'react';
import { API_BACKEND_URL } from '@/config/getEnvVariables';
import { useRouter } from "next/navigation";
import { X, Save, AlertCircle, CheckCircle, Building, FileText } from 'lucide-react';

const AdditionalCompnayNameModal = ({ isOpen, onClose, order, onSuccess }) => {
    const router = useRouter();
    const [additionalCompanyName, setAdditionalCompanyName] = useState('');
    const [remarks, setRemarks] = useState('');
    const [previousAdditionalCompanyName, setPreviousAdditionalCompanyName] = useState('');
    const [previousRemarks, setPreviousRemarks] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (order) {
            setAdditionalCompanyName(order.additionalCompanyName || '');
            setPreviousAdditionalCompanyName(order.additionalCompanyName || '');
            setRemarks(order.remarks || '');
            setPreviousRemarks(order.remarks || '');
        }
    }, [order]);

    useEffect(() => {
        if (!isOpen) {
            setError('');
            setSuccess(false);
            setLoading(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        setLoading(true);

        try {
            const response = await fetch(
                `${API_BACKEND_URL}/billing/sale/ready-order/additional-company-name/${order._id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        additionalCompanyName: additionalCompanyName.trim(),
                        remarks: remarks.trim() || 'Updated additional company name'
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update additional company name');
            }

            setSuccess(true);

            if (onSuccess) {
                await onSuccess();
            }

            setTimeout(() => {
                onClose();
            }, 1500);

        } catch (err) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
        }
    };

    const hasChanges = () => {
        return additionalCompanyName !== previousAdditionalCompanyName ||
            remarks !== previousRemarks;
    };

    return (
        <>
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn"
                onClick={handleClose}
            >
                <div
                    className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-0 overflow-hidden animate-scaleIn"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="bg-linear-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Building className="w-6 h-6 text-white" />
                            <h3 className="text-xl font-bold text-white">
                                Additional Company/Partner Name
                            </h3>
                        </div>
                        <button
                            onClick={handleClose}
                            className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 cursor-pointer"
                            disabled={loading}
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="p-6">
                        <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 font-medium">Order ID:</span>
                                <span className="font-semibold text-gray-900">{order?.orderId || 'N/A'}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm mt-1">
                                <span className="text-gray-600 font-medium">Company:</span>
                                <span className="font-semibold text-gray-900">{order?.company?.name || 'N/A'}</span>
                            </div>
                        </div>

                        {success && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
                                <CheckCircle className="w-5 h-5 shrink-0" />
                                <span className="font-medium">Updated successfully!</span>
                            </div>
                        )}

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <span className="font-medium">{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Previous Company Name (if exists) */}
                            {previousAdditionalCompanyName && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <label className="text-xs font-semibold text-blue-700 uppercase tracking-wider flex items-center gap-1">
                                        <Building className="w-3.5 h-3.5" />
                                        Previous Company Name
                                    </label>
                                    <p className="text-sm font-medium text-gray-900 mt-1">
                                        {previousAdditionalCompanyName}
                                    </p>
                                    {previousRemarks && (
                                        <p className="text-xs text-gray-600 mt-1 border-t border-blue-100 pt-1">
                                            <span className="font-medium">Previous Remarks:</span> {previousRemarks}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Additional Company Name Input */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Additional Company Name
                                </label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={additionalCompanyName}
                                        onChange={(e) => setAdditionalCompanyName(e.target.value)}
                                        placeholder="Enter additional company name..."
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900"
                                        disabled={loading || success}
                                        autoFocus
                                    />
                                </div>
                                {/* {!additionalCompanyName.trim() && (
                                    <p className="text-xs text-red-500 mt-1">Company name is required</p>
                                )} */}
                            </div>

                            {/* Remarks Input */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Remarks
                                </label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <textarea
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        placeholder="Enter remarks (optional)..."
                                        rows="3"
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 resize-none"
                                        disabled={loading || success}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {remarks.length} characters
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 cursor-pointer"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`px-5 py-2.5 text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg ${(!hasChanges() || loading || success) && 'opacity-50 cursor-not-allowed'
                                        }`}
                                    disabled={!hasChanges() || loading || success}
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Update
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Changes indicator */}
                            {hasChanges() && !loading && !success && (
                                <p className="text-xs text-amber-600 text-center">
                                    You have unsaved changes
                                </p>
                            )}
                        </form>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { 
                        opacity: 0;
                        transform: scale(0.95) translateY(-10px);
                    }
                    to { 
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                .animate-scaleIn {
                    animation: scaleIn 0.25s ease-out;
                }
            `}</style>
        </>
    );
};

export default AdditionalCompnayNameModal;