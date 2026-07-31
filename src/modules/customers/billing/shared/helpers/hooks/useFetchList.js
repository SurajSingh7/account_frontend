// shared/helpers/hooks/useFetchList.js

import { useState, useEffect, useCallback } from 'react';
import { API_BACKEND_URL } from '@/config/getEnvVariables';
import { buildListParams } from '../../buildListParams';

export const useFetchList = ({ endpoint, filters }) => {

  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const qs = buildListParams(filters);

      const res = await fetch(
        `${API_BACKEND_URL}${endpoint}?${qs}`,
        { credentials: 'include' }
      );


      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const json = await res.json();

      if (json.success) {
        setData(json.data || []);
        setPagination(json.pagination || null);
      } else if (json.message === 'No data found') {
        setData([]);
        setPagination(null);
      } else {
        throw new Error(json.message || 'Failed to fetch data');
      }

    } catch (err) {
      console.error('useFetchList:', err);
      setError(err.message);

    } finally {
      setLoading(false);
    }

  }, [endpoint, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    pagination,
    loading,
    error,
    refetch: fetchData,
  };
};