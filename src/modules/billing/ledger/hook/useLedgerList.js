'use client';

import { useState, useEffect, useCallback } from 'react';
import { API_BACKEND_URL } from '@/config/getEnvVariables';

export const useLedgerList = ({
  endpoint,
  payload = {},
  initialPage = 1,
  limit = 20,
}) => {
  const [data, setData]             = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [page, setPage]             = useState(initialPage);

  const fetchData = useCallback(async (currentPage = page) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...payload,
          page: currentPage,
          limit,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));

        throw new Error(
          errData?.message || `Request failed with status ${response.status}`
        );
      }

      const result = await response.json();

      setData(result);
      setPagination(result?.pagination ?? null);
    } catch (err) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [endpoint, payload, page, limit]);

  useEffect(() => {
    fetchData(page);
  }, [page, fetchData]);

  return {
    data,
    pagination,
    loading,
    error,
    refetch: () => fetchData(page),
    setPage,
  };
};