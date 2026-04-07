import { useState, useEffect, useCallback } from 'react';
import { API_BACKEND_URL } from '@/config/getEnvVariables';
import { buildListParams } from '../../constants';

const BASE_URL = `${API_BACKEND_URL}/billing/sale/ready-order/all`;

export const useOrders = (filters) => {
  const [orders,     setOrders]     = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs  = buildListParams(filters);
      const res = await fetch(`${BASE_URL}?${qs}`,{credentials:'include'});
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success) {
        setOrders(json.data);
        setPagination(json.pagination);
      } else {
        throw new Error(json.message || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('useOrders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  return { orders, pagination, loading, error, refetch: fetchOrders };
};