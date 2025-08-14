import React, { createContext, useCallback, useContext, useState } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const fetchItems = useCallback(async (abortSignal, params = {}) => {
    try {
      setLoading(true);
      const isVirtualization = !params.limit && !params.page;
      setError(null);
      
      // Build query string from params
      const queryParams = new URLSearchParams();
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.q) queryParams.append('q', params.q);
      if (params.page) queryParams.append('page', params.page);
      
      const queryString = queryParams.toString();
      const url = `http://localhost:3001/api/items${queryString ? `?${queryString}` : ''}`;
      
      const res = await fetch(url, {
        signal: abortSignal
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      // Only update state if the component is still mounted
      if (!abortSignal.aborted) {
        setItems(data.items || []);
        if (!isVirtualization) {
          setPagination(data.pagination || null);
        } else {
          setPagination(null);
        }
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching items:', error);
        setError(error.message);
      }
    } finally {
      if (!abortSignal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  return (
    <DataContext.Provider value={{ 
      items, 
      fetchItems, 
      loading, 
      error,
      pagination
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);