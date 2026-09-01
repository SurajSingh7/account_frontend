"use client";
import { useState, useCallback, useRef } from "react";
import { API_BACKEND_URL } from "@/config/getEnvVariables";
import { apiClient } from "@/utils/apiClient";

export function useLocHistory(router, limit = 100) {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit,
    total: 0,
    totalPages: 1,
    currentPageTotal: 0,
    hasPrev: false,
    hasNext: false,
  });

  const reqIdRef = useRef(0);

  const fetchLocHistory = useCallback(
    async (id, { page = 1 } = {}) => {
      if (!id) return;
      const reqId = ++reqIdRef.current;
      try {
        setLoading(true);

        const url = new URL(`${API_BACKEND_URL}/bso/loc/history/${id}`);
        url.searchParams.append("page", page);
        url.searchParams.append("limit", limit);

        const res = await apiClient(
          url,
          { method: "GET", credentials: "include" },
          router
        );

        if (!res) {
          setHistoryList([]);
          return;
        }
        if (reqId !== reqIdRef.current) return;

        const { data, pagination } = res;

        if (!data) {
          setHistoryList([]);
          return;
        }

        setHistoryList(data);
        setPagination(pagination);

      } catch (err) {
        console.error("Error fetching LOC history:", err);
        if (reqId === reqIdRef.current) {
          setHistoryList([]);
        }
      } finally {
        if (reqId === reqIdRef.current) setLoading(false);
      }
    },
    [limit, router]
  );

  return { historyList, loading, pagination, fetchLocHistory };
}
