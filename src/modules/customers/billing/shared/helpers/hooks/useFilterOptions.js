import { useState, useEffect } from 'react';
import { API_BACKEND_URL } from '@/config/getEnvVariables';
import { API_ENDPOINTS } from '@/constants/api';

// ─── States ───────────────────────────────────────────────────────────────────
export const useStates = () => {
  const [states,  setStates]  = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch_ = async () => {
      setLoading(true);
      try {
        const res  = await fetch(`${API_BACKEND_URL}${API_ENDPOINTS.customers.billing.config.indianStates}`);
        const json = await res.json();
        if (json.success) {
          const list = Object.entries(json.data).map(([key, val]) => ({
            key,
            name: val.name,
            code: val.code,
          }));
          setStates(list);
        }
      } catch (err) { console.error('useStates:', err); }
      finally { setLoading(false); }
    };
    fetch_();
  }, []);

  return { states, loading };
};

// ─── Entities (internal companies) ───────────────────────────────────────────
// export const useEntities = () => {
//   const [entities, setEntities] = useState([]);
//   const [loading,  setLoading]  = useState(false);

//   useEffect(() => {
//     const fetch_ = async () => {
//       setLoading(true);
//       try {
//         const res  = await fetch(`${API_BACKEND_URL}/config/parent/internal-company/all`);
//         const json = await res.json();
//         if (json.success) setEntities(json.data);
//       } catch (err) { console.error('useEntities:', err); }
//       finally { setLoading(false); }
//     };
//     fetch_();
//   }, []);

//   return { entities, loading };
// };

// ─── BSOs ─────────────────────────────────────────────────────────────────────
export const useBsos = () => {
  const [bsos,    setBsos]    = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch_ = async () => {
      setLoading(true);
      try {
        const res  = await fetch(`${API_BACKEND_URL}${API_ENDPOINTS.customers.billing.bso.parentAll}`,{credentials:'include'});
        const json = await res.json();
        if (json.success) setBsos(json.data);
      } catch (err) { console.error('useBsos:', err); }
      finally { setLoading(false); }
    };
    fetch_();
  }, []);

  return { bsos, loading };
};

// ─── Companies (searchable) ───────────────────────────────────────────────────
export const useCompanies = (search = '') => {
  const [companies, setCompanies] = useState([]);
  const [loading,   setLoading]   = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetch_ = async () => {
      setLoading(true);
      try {
        const url  = `${API_BACKEND_URL}${API_ENDPOINTS.customers.billing.companyGroup.all}${search ? `?search=${encodeURIComponent(search)}` : ''}`;
        const res  = await fetch(url,{credentials:'include'});
        const json = await res.json();
        if (!cancelled && json.success) setCompanies(json.data);
      } catch (err) { if (!cancelled) console.error('useCompanies:', err); }
      finally { if (!cancelled) setLoading(false); }
    };
    fetch_();
    return () => { cancelled = true; };
  }, [search]);

  return { companies, loading };
};