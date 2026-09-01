"use client";
import { useState, useCallback, useRef } from "react";
import { API_BACKEND_URL } from "@/config/getEnvVariables";
import { apiClient } from "@/utils/apiClient";

export function useLocCards(router, limit = 10) {
  const [locCards, setLocCards] = useState([]);
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

  const fetchLocCards = useCallback(
    async ({ page = 1, search = "", status = "pending", orderType = "" }) => {
      const reqId = ++reqIdRef.current;
      try {
        setLoading(true);

        const url = new URL(`${API_BACKEND_URL}/bso/loc/all`);
        url.searchParams.append("page", page);
        url.searchParams.append("limit", limit);
        url.searchParams.append("status", status.trim() || "pending");

        if (search.trim()) url.searchParams.append("search", search.trim());
        if (orderType.trim()) url.searchParams.append("orderType", orderType.trim());

        const res = await apiClient(
          url,
          { method: "GET", credentials: "include" },
          router
        );

        if (!res) {
          setLocCards([]);
          return;
        }
        if (reqId !== reqIdRef.current) return;

        const { data, pagination } = res;

        if (!data) {
          setLocCards([]);
          return;
        }

        setLocCards(data);
        setPagination(pagination);

      } catch (err) {
        console.error("Error fetching LOC cards:", err);
        if (reqId === reqIdRef.current) {
          setLocCards([]);
        }
      } finally {
        if (reqId === reqIdRef.current) setLoading(false);
      }
    },
    [limit, router]
  );

  return { locCards, loading, pagination, fetchLocCards };
}
