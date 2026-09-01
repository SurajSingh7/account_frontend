"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { History, Building } from "lucide-react";

import { useLocHistory } from "./hooks/useLocHistory";
import Pagination from '@/shared/ui/pagination/Pagination';
import NoDataFound from "../modal/NoDataFound";
import { formatDateTime } from "@/common/dateFormat";
;

export default function LocHistoryView({ record, onBack }) {
    const router = useRouter();
    const [page, setPage] = useState(1);

    const recordId = record?._id;
    const { historyList, loading, pagination, fetchLocHistory } = useLocHistory(router, 100);

    useEffect(() => {
        fetchLocHistory(recordId, { page });
    }, [recordId, page]);

    return (
        <div className="w-full min-h-screen bg-linear-to-b from-orange-50 to-white">
            <div className="relative">
                {/* HEADER */}
                <div
                    className="fixed left-0 right-0 z-40 bg-white border-b border-orange-200 shadow-md px-4 py-4"
                    style={{ top: "56px" }}
                >
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <h1 className="text-xl md:text-xl font-bold text-orange-800 flex items-center gap-2 whitespace-nowrap">
                            <History className="h-5 w-5" /> LOC History
                            {record?.dsr?.orderId && (
                                <span className="text-sm font-medium text-gray-500 ml-2">
                                    ({record.dsr.orderId} — {record?.company?.customerCompanyName || "N/A"})
                                </span>
                            )}
                        </h1>

                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-orange-50 hover:border-orange-400 hover:text-orange-600 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                        >
                            ← Back
                        </button>
                    </div>
                </div>

                {/* Spacer */}
                <div className="h-24" />

                {/* CONTENT */}
                <div className="px-4">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="mt-4 text-orange-800 font-medium">Loading LOC history...</p>
                            </div>
                        </div>
                    ) : historyList.length === 0 ? (
                        <NoDataFound
                            title="No History Found"
                            message="There is no LOC history available for this record yet."
                        />
                    ) : (
                        <>
                            <div className="overflow-x-auto rounded-lg shadow-lg bg-white">
                                <table className="min-w-full">
                                    <thead className="bg-linear-to-r from-orange-100 to-orange-50">
                                        <tr>
                                            <th className="py-3 px-4 border-b border-orange-200 text-left font-semibold text-orange-800">S.No.</th>
                                            <th className="py-3 px-4 border-b border-orange-200 text-left font-semibold text-orange-800">LOC Date</th>
                                            <th className="py-3 px-4 border-b border-orange-200 text-left font-semibold text-orange-800">Status</th>
                                            <th className="py-3 px-4 border-b border-orange-200 text-left font-semibold text-orange-800">Remarks</th>
                                            <th className="py-3 px-4 border-b border-orange-200 text-left font-semibold text-orange-800">Updated By</th>
                                            <th className="py-3 px-4 border-b border-orange-200 text-left font-semibold text-orange-800">Updated At</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {historyList.map((entry, i) => {
                                            const idx = (pagination.page - 1) * pagination.limit + i + 1;
                                            return (
                                                <tr key={entry?._id || i} className="hover:bg-orange-50 transition-colors">
                                                    <td className="py-3 px-4 border-b border-orange-100 text-gray-600">{idx}</td>
                                                    <td className="py-3 px-4 border-b border-orange-100 font-medium text-gray-700">
                                                        {formatDateTime(entry?.locDate) || "N/A"}
                                                    </td>
                                                    <td className="py-3 px-4 border-b border-orange-100 text-gray-700">
                                                        {entry?.status || "N/A"}
                                                    </td>
                                                    <td className="py-3 px-4 border-b border-orange-100 text-gray-700">
                                                        {entry?.remarks || entry?.action || "-"}
                                                    </td>
                                                    <td className="py-3 px-4 border-b border-orange-100 text-gray-700">
                                                        {entry?.updatedBy?.name || entry?.createdBy?.name || "N/A"}
                                                    </td>
                                                    <td className="py-3 px-4 border-b border-orange-100 text-gray-700">
                                                        {formatDateTime(entry?.updatedAt || entry?.createdAt)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <Pagination
                                currentPage={pagination.page}
                                totalItems={pagination.total}
                                itemsPerPage={pagination.limit}
                                onPageChange={(newPage) => setPage(newPage)}
                                className="mt-6 justify-center"
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
