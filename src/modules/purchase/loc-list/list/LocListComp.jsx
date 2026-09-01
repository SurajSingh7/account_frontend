"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ClipboardCheck, Search } from "lucide-react";

import { useLocCards } from "./hooks/useLocCards";
import { useDebounce } from "./hooks/useDebounce";

import DesktopLocTable from "./DesktopLocTable";
import Pagination from '@/shared/ui/pagination/Pagination';
import NoDataFound from "./modal/NoDataFound";
import LocHistoryView from "./history/LocHistoryView";

export default function LocListComp() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ✅ URL is the single source of truth
  const pageFromUrl = Number(searchParams.get("page")) || 1;
  const searchFromUrl = searchParams.get("search") || "";
  const statusFromUrl = searchParams.get("status") || "pending";
  const orderFromUrl = searchParams.get("orderType") || "";

  // ✅ local UI state initialized from URL
  const [searchTerm, setSearchTerm] = useState(searchFromUrl);
  const [statusFilter, setStatusFilter] = useState(statusFromUrl);
  const [orderFilter, setOrderFilter] = useState(orderFromUrl);

  // ✅ inline history view state (no route change — preserves list state underneath)
  const [historyRecord, setHistoryRecord] = useState(null);

  const debouncedSearch = useDebounce(searchTerm, 500);

  // fetch data hook
  const { locCards, loading, pagination, fetchLocCards } = useLocCards(router, 10);

  // ✅ ONE useEffect — fetch whenever URL params change
  useEffect(() => {
    fetchLocCards({
      page: pageFromUrl,
      search: searchFromUrl,
      status: statusFromUrl,
      orderType: orderFromUrl,
    });
  }, [pageFromUrl, searchFromUrl, statusFromUrl, orderFromUrl]);

  // ✅ debounced search → update URL (resets page to 1)
  useEffect(() => {
    if (debouncedSearch === searchFromUrl) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("search", debouncedSearch);
    params.set("page", "1");
    router.replace(`?${params.toString()}`);
  }, [debouncedSearch]);

  // ✅ status filter → update URL (resets page to 1)
  const handleStatusChange = (value) => {
    setStatusFilter(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set("status", value);
    params.set("page", "1");
    router.replace(`?${params.toString()}`);
  };

  // ✅ order type filter → update URL (resets page to 1)
  const handleOrderTypeChange = (value) => {
    setOrderFilter(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set("orderType", value);
    params.set("page", "1");
    router.replace(`?${params.toString()}`);
  };

  const statusFilterOptions = [
    { value: "pending", label: "Pending" },
    { value: "completed", label: "Completed" },
  ];

  const orderFilterOptions = [
    { value: "", label: "Order Type" },
    { value: "NEW-ORDER", label: "New Order" },
    { value: "UPGRADE", label: "Upgrade" },
    { value: "DOWNGRADE", label: "Downgrade" },
  ];

  // ✅ History is an inline full-page view — list state (URL + local) stays untouched underneath
  if (historyRecord) {
    return (
      <LocHistoryView
        record={historyRecord}
        onBack={() => setHistoryRecord(null)}
      />
    );
  }

  return (
    <div className="w-full min-h-screen bg-linear-to-b from-orange-50 to-white">
      <div className="relative">

        {/* HEADER */}
        <div
          className="fixed left-0 right-0 z-40 bg-white border-b border-orange-200 shadow-md px-4 py-4"
          style={{ top: "56px" }}
        >
          {/* Title */}
          <h1 className="text-xl md:text-xl font-bold text-orange-800 flex items-center gap-2 whitespace-nowrap">
            <ClipboardCheck className="h-5 w-5" /> LOC List Details
          </h1>

          {/* Search + Filters */}
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex items-center max-w-md bg-white rounded-lg shadow px-3 py-2 border border-orange-200 flex-1">
              <Search className="h-5 w-5 text-orange-500 mr-2" />
              <input
                type="text"
                placeholder="Search by company name, DSR order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 outline-none bg-transparent text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-3 py-2 bg-white border border-orange-200 rounded-lg shadow text-gray-700 outline-none focus:border-orange-500"
            >
              {statusFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Order Type Filter */}
            <select
              value={orderFilter}
              onChange={(e) => handleOrderTypeChange(e.target.value)}
              className="px-3 py-2 bg-white border border-orange-200 rounded-lg shadow text-gray-700 outline-none focus:border-orange-500"
            >
              {orderFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Spacer */}
        <div className="h-36" />

        {/* CONTENT */}
        <div className="px-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-orange-800 font-medium">Loading LOC data...</p>
              </div>
            </div>
          ) : locCards.length === 0 ? (
            <NoDataFound
              title="No LOC Records Found"
              message="Try adjusting your search or status filter."
            />
          ) : (
            <>
              <DesktopLocTable
                data={locCards}
                pagination={pagination}
                onViewHistory={(record) => setHistoryRecord(record)}
              />

              {/* ✅ PAGINATION — only updates URL, useEffect handles fetch */}
              {locCards.length > 0 && (
                <Pagination
                  currentPage={pagination.page}
                  totalItems={pagination.total}
                  itemsPerPage={pagination.limit}
                  onPageChange={(newPage) => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set("page", newPage);
                    router.push(`?${params.toString()}`);
                  }}
                  className="mt-6 justify-center"
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
