'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ApiResult } from '@/types';

type UseApiOptions = {
  immediate?: boolean;
};

export function useApi<T>(url: string | null, options: UseApiOptions = { immediate: true }) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(url && options.immediate !== false));

  const execute = useCallback(async (overrideUrl?: string) => {
    const target = overrideUrl ?? url;
    if (!target) return null;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(target, { credentials: 'include' });
      const json = (await res.json()) as ApiResult<T> & { message?: string };

      if (!res.ok || !json.success) {
        const message =
          (!json.success && (json.message || json.error)) || `Request failed (${res.status})`;
        setError(message);
        setData(null);
        return null;
      }

      setData(json.data);
      return json.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network error';
      setError(message);
      setData(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (url && options.immediate !== false) {
      void execute();
    }
  }, [url, options.immediate, execute]);

  return { data, error, loading, refetch: execute, setData };
}

export async function apiFetch<T>(
  url: string,
  init?: RequestInit
): Promise<{ data: T | null; error: string | null; status: number }> {
  try {
    const res = await fetch(url, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
      ...init,
    });
    const json = (await res.json()) as ApiResult<T> & { message?: string };

    if (!res.ok || !json.success) {
      return {
        data: null,
        error: (!json.success && (json.message || json.error)) || `Request failed (${res.status})`,
        status: res.status,
      };
    }

    return { data: json.data, error: null, status: res.status };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Network error',
      status: 0,
    };
  }
}
