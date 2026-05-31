// src/hooks/useFetch.ts
import { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';

export function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Używamy naszej instancji – adres podstawowy i token doklejają się same!
        const response = await apiClient.get(url);
        
        // W Axiosie dane z serwera zawsze znajdują się w polu .data
        // Ty z backendu zwracasz obiekt { success: true, data: [...] }
        if (response.data.success) {
          setData(response.data.data);
        }
      } catch (err: any) {
        // Axios gromadzi błędy z backendu w err.response?.data
        const errorMessage = err.response?.data?.message || 'Wystąpił błąd podczas pobierania danych.';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, isLoading, error };
}