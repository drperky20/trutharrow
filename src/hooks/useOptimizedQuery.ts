import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface QueryOptions<T> {
  queryKey: string;
  queryFn: () => Promise<T>;
  staleTime?: number;
  onError?: (error: Error) => void;
}

const cache = new Map<string, { data: any; timestamp: number }>();

export function useOptimizedQuery<T>({ queryKey, queryFn, staleTime = 30000, onError }: QueryOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController>();

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  const fetchData = async () => {
    // Check cache first
    const cached = cache.get(queryKey);
    if (cached && Date.now() - cached.timestamp < staleTime) {
      setData(cached.data);
      setLoading(false);
      return;
    }

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);
      const result = await queryFn();
      
      if (mountedRef.current) {
        setData(result);
        cache.set(queryKey, { data: result, timestamp: Date.now() });
      }
    } catch (err) {
      if (mountedRef.current && err instanceof Error && err.name !== 'AbortError') {
        setError(err);
        onError?.(err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [queryKey]);

  return { data, loading, error, refetch: fetchData };
}
