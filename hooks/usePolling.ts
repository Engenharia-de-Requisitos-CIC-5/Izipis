import { useCallback, useEffect, useRef, useState } from 'react';

type CompareFn<T> = (current: T | null, next: T) => boolean;

interface UsePollingOptions<T> {
  fetcher: () => Promise<T>;
  intervalMs?: number;
  compare?: CompareFn<T>;
  initialData?: T | null;
  initialLoad?: boolean;
}

/**
 * usePolling
 * - Executa um `fetcher` periodicamente em background
 * - Só atualiza o estado quando os dados realmente mudam (usando `compare` ou JSON.stringify)
 * - Fornece `refresh` manual e controla um `isLoading` para o carregamento inicial
 */
export function usePolling<T>({
  fetcher,
  intervalMs,
  compare,
  initialData = null,
  initialLoad = true
}: UsePollingOptions<T>) {
  const [data, setData] = useState<T | null>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(initialLoad);

  const dataRef = useRef<T | null>(initialData);
  const compareRef = useRef<CompareFn<T> | undefined>(compare);
  const mountedRef = useRef(true);

  useEffect(() => {
    compareRef.current = compare;
  }, [compare]);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  const defaultCompare: CompareFn<T> = (current, next) => {
    try {
      return JSON.stringify(current) === JSON.stringify(next);
    } catch {
      return false;
    }
  };

  const refresh = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const next = await fetcher();
      const cmp = compareRef.current || defaultCompare;
      const equal = dataRef.current !== null && cmp(dataRef.current, next);
      if (!equal) {
        dataRef.current = next;
        if (mountedRef.current) setData(next);
      }
      return next;
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      if (!mounted) return;
      await refresh(true);
    };
    if (initialLoad) init();

    let id: ReturnType<typeof setInterval> | undefined;
    if (intervalMs && intervalMs > 0) {
      id = setInterval(() => {
        refresh(false).catch(() => undefined);
      }, intervalMs);
    }

    return () => {
      mounted = false;
      if (id) clearInterval(id);
    };
  }, [intervalMs, initialLoad, refresh]);

  return { data, isLoading, refresh } as const;
}

export default usePolling;
