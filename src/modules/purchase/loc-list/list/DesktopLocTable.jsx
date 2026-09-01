"use client";
import { Building, CheckCircle2, AlertCircle, X } from "lucide-react";
import { useState } from "react";
import { formatDateTime } from "@/common/dateFormat";
import OrderTypeBadge from "@/common/badges/OrderTypeBadge";

export default function DesktopLocTable({ data, pagination, onViewHistory }) {

    const getStatusClasses = (status) => {
        const normalizedStatus = status?.toUpperCase();

        switch (normalizedStatus) {
            case "COMPLETED":
            case "EXECUTED":
                return "bg-green-500";

            case "PENDING":
                return "bg-yellow-400 text-white";

            default:
                return "bg-gray-400";
        }
    };

    const getStatusIcon = (status) => {
        const normalizedStatus = status?.toUpperCase();

        switch (normalizedStatus) {
            case "COMPLETED":
            case "EXECUTED":
                return <CheckCircle2 className="h-3 w-3" />;

            case "PENDING":
                return <AlertCircle className="h-3 w-3" />;

            default:
                return <AlertCircle className="h-3 w-3" />;
        }
    };

    if (!data || data.length === 0) {
        return (
            <div className="overflow-x-auto rounded-lg shadow-lg bg-white">
                <table className="min-w-full">
                    <thead className="bg-linear-to-r from-orange-100 to-orange-50">
                        <tr>
                            <th className="py-3 px-4 border-b border-orange-200 text-left font-semibold text-orange-800">S.No.</th>
                            <th className="py-3 px-4 border-b border-orange-200 text-left font-semibold text-orange-800">Order ID</th>
                            <th className="py-3 px-4 border-b border-orange-200 text-left font-semibold text-orange-800">Company Name</th>
                            <th className="py-3 px-4 border-b border-orange-200 text-left font-semibold text-orange-800">Order Type</th>
                            <th className="py-3 px-4 border-b border-orange-200 text-left font-semibold text-orange-800">Product</th>
                            <th className="py-3 px-4 border-b border-orange-200 text-left font-semibold text-orange-800">PCD Date</th>
                            <th className="py-3 px-4 border-b border-orange-200 text-left font-semibold text-orange-800">LOC Status</th>
                            <th className="py-3 px-4 border-b border-orange-200 text-left font-semibold text-orange-800">LOC Date</th>
                            <th className="py-3 px-4 border-b border-orange-200 text-left font-semibold text-orange-800">Execution status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan={11} className="py-12 text-center">
                                <div className="flex flex-col items-center justify-center text-gray-500">
                                    <Building className="h-12 w-12 mb-4 text-gray-300" />
                                    <p className="text-lg font-semibold text-gray-600">CURRENTLY NO DATA AVAILABLE</p>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }

    return (
        <>
            <div className="overflow-x-auto rounded-lg shadow-lg bg-white">
                <table className="min-w-full">
                    <thead className="bg-linear-to-r from-orange-100 to-orange-50">
                        <tr>
                            <th className="py-3 px-4 border-b border-orange-200 text-left font-semibold text-orange-800">S.No.</th>
                            <th className="py-3 px-4 border-b border-orange-200 text-left font-semibold text-orange-800">Order ID</th>
                            <th className="py-3 px-4 border-b border-orange-200 text-left font-semibold text-orange-800">LSI/Circuit Id</th>
                            <th className="py-3 px-4 border-b border-orange-200 text-left font-semibold text-orange-800">Company Name</th>
                            <th className="py-3 px-4 border-b border-orange-200 text-left font-semibold text-orange-800">Order Type</th>
                            <th className="py-3 px-4 border-b border-orange-200 text-left font-semibold text-orange-800">Product</th>
                            <th className="py-3 px-4 border-b border-orange-200 text-left font-semibold text-orange-800">PCD Effective Date</th>
                            <th className="py-3 px-4 border-b border-orange-200 text-left font-semibold text-orange-800">LOC Status</th>
                            <th className="py-3 px-4 border-b border-orange-200 text-left font-semibold text-orange-800">LOC Date</th>
                            <th className="py-3 px-4 border-b border-orange-200 text-left font-semibold text-orange-800">Execution status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((order, i) => {
                            const idx = (pagination.page - 1) * pagination.limit + i + 1;
                            const companyName = order?.purchaseOrder?.company || "N/A";
                            const productCode = order?.purchaseProduct?.code || order?.purchaseProduct?.name || "N/A";
                            const productCapacity = order?.purchaseOrder?.capacity;
                            const productLabel = productCapacity != null ? `${productCode}/${productCapacity}` : productCode;
                            const locStatus = order?.status?.toUpperCase() || "";
                            const isPending = locStatus === "PENDING";
                            const mailSent = !!order?.isMailSent;

                            return (
                                <tr
                                    key={order?._id || order?.dsr?.orderId || i}
                                    className="hover:bg-orange-50 transition-colors"
                                >
                                    <td className="py-3 px-4 border-b border-orange-100 text-gray-600">{idx}</td>
                                    <td className="py-3 px-4 border-b border-orange-100 font-medium">
                                        {order?.dsr?.orderId || "N/A"}
                                    </td>
                                    <td className="py-3 px-4 border-b border-orange-100 font-medium">
                                        {order?.lsiNumber || "N/A"}
                                    </td>
                                    <td className="py-3 px-4 border-b border-orange-100 text-gray-700">
                                        {companyName.length > 30 ? (
                                            <ToggleText
                                                shortText={companyName.slice(0, 30)}
                                                fullText={companyName}
                                            />
                                        ) : (
                                            companyName
                                        )}
                                    </td>
                                    <td className="py-3 px-4 border-b border-orange-100 text-gray-600">
                                        <OrderTypeBadge type={order?.orderType || "NEW-ORDER"} initiationType={order?.orderInitiationType || "FRESH"} />
                                    </td>
                                    <td className="py-3 px-4 border-b border-orange-100 text-gray-700">
                                        {productLabel}
                                    </td>
                                    <td className="py-3 px-4 border-b border-orange-100 text-gray-700">
                                        {formatDateTime(order?.pcdDate) || "N/A"}
                                    </td>

                                    <td className="py-3 px-4 border-b border-orange-100">
                                        <span
                                            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full text-white ${getStatusClasses(locStatus)}`}
                                        >
                                            {getStatusIcon(locStatus)}
                                            <span>{order?.status || "N/A"}</span>
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 border-b border-orange-100">
                                        {order?.locEvent ? (
                                            <span className="text-gray-700">
                                                {formatDateTime(order.locEvent.locDate)}
                                            </span>
                                        ) : (
                                            <span className="inline-flex animate-pulse items-center gap-1 rounded-full border border-orange-300 bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                                                <AlertCircle className="h-3 w-3" />
                                                Not Entered
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 border-b border-orange-100">
                                        <span
                                            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusClasses(
                                                order?.locEvent?.executionStatus ?? "PENDING"
                                            )}`}
                                        >
                                            {getStatusIcon(order?.locEvent?.executionStatus ?? "PENDING")}
                                            <span>{order?.locEvent?.executionStatus ?? "PENDING"}</span>
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </>
    );
}

function ToggleText({ shortText, fullText }) {
    const [showPopup, setShowPopup] = useState(false);

    return (
        <div className="relative">
            <div className="flex items-center gap-1">
                <span>{shortText}</span>
                <button
                    onClick={() => setShowPopup(true)}
                    className="text-blue-600 text-xs underline hover:text-blue-800"
                >
                    ...more
                </button>
            </div>

            {showPopup && (
                <>
                    <div
                        className="fixed inset-0 backdrop-blur-sm bg-black/50 z-40"
                        onClick={() => setShowPopup(false)}
                    />

                    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 p-4 max-w-md w-full mx-4">
                        <div className="flex -m-2 justify-end items-start ">
                            <button
                                onClick={() => setShowPopup(false)}
                                className="text-red-500 font-extrabold bg-gray-300 rounded-full hover:text-red-600 transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="text-gray-700 leading-relaxed">{fullText}</div>
                    </div>
                </>
            )}
        </div>
    );
}