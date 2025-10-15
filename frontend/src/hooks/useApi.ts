import { useState, useEffect, useCallback } from 'react';

/**
 * Hook personalizado para manejar llamadas al API
 * Incluye estados de loading, error y data
 */

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  immediate?: boolean; // Si se debe ejecutar inmediatamente al montar
}

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseApiOptions<T> = {}
) {
  const { onSuccess, onError, immediate = false } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]) => {
      setState({ data: null, loading: true, error: null });

      try {
        const result = await apiFunction(...args);
        setState({ data: result, loading: false, error: null });
        
        if (onSuccess) {
          onSuccess(result);
        }
        
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setState({ data: null, loading: false, error });
        
        if (onError) {
          onError(error);
        }
        
        throw error;
      }
    },
    [apiFunction, onSuccess, onError]
  );

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return {
    ...state,
    execute,
    reset: () => setState({ data: null, loading: false, error: null }),
  };
}

/**
 * Hook para queries (GET requests)
 * Similar a React Query pero más simple
 */
export function useQuery<T>(
  queryKey: string,
  apiFunction: () => Promise<T>,
  options: {
    enabled?: boolean;
    refetchInterval?: number;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  } = {}
) {
  const { enabled = true, refetchInterval, onSuccess, onError } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const [hasFetched, setHasFetched] = useState(false);

  const fetchData = useCallback(async () => {
    if (!enabled || hasFetched) return;

    setState((prev) => ({ ...prev, loading: true }));
    setHasFetched(true);

    try {
      const result = await apiFunction();
      setState({ data: result, loading: false, error: null });

      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setState({ data: null, loading: false, error });

      if (onError) {
        onError(error);
      }
    }
  }, [enabled, hasFetched, apiFunction, onSuccess, onError]);

  useEffect(() => {
    if (enabled && !hasFetched) {
      fetchData();
    }
  }, [enabled, hasFetched, fetchData]);

  const manualRefetch = useCallback(async () => {
    setHasFetched(false);
    setState((prev) => ({ ...prev, loading: true }));

    try {
      const result = await apiFunction();
      setState({ data: result, loading: false, error: null });
      setHasFetched(true);

      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setState({ data: null, loading: false, error });
      setHasFetched(true);

      if (onError) {
        onError(error);
      }
    }
  }, [apiFunction, onSuccess, onError]);

  useEffect(() => {
    if (refetchInterval && enabled) {
      const interval = setInterval(manualRefetch, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [refetchInterval, enabled, manualRefetch]);

  return {
    ...state,
    refetch: manualRefetch,
    isLoading: state.loading,
    isError: !!state.error,
    isSuccess: !state.loading && !state.error && state.data !== null,
  };
}

/**
 * Hook para mutations (POST, PUT, DELETE requests)
 */
export function useMutation<T, P = any>(
  mutationFunction: (params: P) => Promise<T>,
  options: {
    onSuccess?: (data: T, params: P) => void;
    onError?: (error: Error, params: P) => void;
  } = {}
) {
  const { onSuccess, onError } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = useCallback(
    async (params: P) => {
      setState({ data: null, loading: true, error: null });

      try {
        const result = await mutationFunction(params);
        setState({ data: result, loading: false, error: null });
        
        if (onSuccess) {
          onSuccess(result, params);
        }
        
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setState({ data: null, loading: false, error });
        
        if (onError) {
          onError(error, params);
        }
        
        throw error;
      }
    },
    [mutationFunction, onSuccess, onError]
  );

  return {
    ...state,
    mutate,
    isLoading: state.loading,
    isError: !!state.error,
    isSuccess: !state.loading && !state.error && state.data !== null,
    reset: () => setState({ data: null, loading: false, error: null }),
  };
}

// =============================================================================
// HOOKS ESPECÍFICOS PARA YSI API
// =============================================================================

import { api } from '../services/api';

/**
 * Hook para obtener todos los Global Shapers
 */
export function useShapers() {
  return useQuery('shapers', async () => {
    const response = await api.shapers.getAll();
    if (!response.success) {
      throw new Error(response.error || 'Error loading shapers');
    }
    return response.data;
  });
}

/**
 * Hook para obtener documentos con filtros opcionales
 * Ahora usa el endpoint unificado que incluye jobs de procesamiento completados
 */
export function useDocuments(filters?: any) {
  return useQuery(`documents-${JSON.stringify(filters || {})}`, async () => {
    const response = await api.documents.getAllFromJobs(filters);
    if (!response.success) {
      throw new Error(response.error || 'Error loading documents');
    }
    return response.data;
  });
}

/**
 * Hook para obtener overview de analytics
 */
export function useAnalyticsOverview() {
  return useQuery('analytics-overview', async () => {
    const response = await api.analytics.getOverview();
    if (!response.success) {
      throw new Error(response.error || 'Error loading analytics');
    }
    return response.data;
  });
}

/**
 * Hook para obtener notas
 */
export function useNotes() {
  return useQuery('notes', async () => {
    const response = await api.notes.getAll();
    if (!response.success) {
      throw new Error(response.error || 'Error loading notes');
    }
    return response.data;
  });
}

/**
 * Hook para crear documentos
 */
export function useCreateDocument() {
  return useMutation(async (documentData: any) => {
    const response = await api.documents.create(documentData);
    if (!response.success) {
      throw new Error(response.error || 'Error creating document');
    }
    return response.data;
  });
}

/**
 * Hook para procesar notas con IA
 */
export function useProcessNotes() {
  return useMutation(async (notesData: { text: string; context?: string }) => {
    const response = await api.notes.processNotes(notesData);
    if (!response.success) {
      throw new Error(response.error || 'Error processing notes');
    }
    return response.data;
  });
}

/**
 * Hook para guardar notas
 */
export function useSaveNotes() {
  return useMutation(async (notesData: any) => {
    const response = await api.notes.saveRawNotes(notesData);
    if (!response.success) {
      throw new Error(response.error || 'Error saving notes');
    }
    return response.data;
  });
}

/**
 * Hook para obtener jobs de procesamiento de texto
 */
export function useProcessingJobs(params?: {
  skip?: number;
  limit?: number;
  status?: 'received' | 'processing' | 'cancelled' | 'error' | 'completed';
}) {
  return useQuery(`processing-jobs-${JSON.stringify(params || {})}`, async () => {
    const response = await api.notes.getProcessingJobs(params);
    if (!response.success) {
      throw new Error(response.error || 'Error loading processing jobs');
    }
    return response.data;
  });
}

/**
 * Hook para obtener un job específico de procesamiento de texto
 */
export function useProcessingJob(jobId: string) {
  return useQuery(`processing-job-${jobId}`, async () => {
    const response = await api.notes.getProcessingJob(jobId);
    if (!response.success) {
      throw new Error(response.error || 'Error loading processing job');
    }
    return response.data;
  }, {
    enabled: !!jobId
  });
}

/**
 * Hook para cancelar job de procesamiento de texto
 */
export function useCancelProcessingJob() {
  return useMutation(async (jobId: string) => {
    const response = await api.notes.cancelProcessingJob(jobId);
    if (!response.success) {
      throw new Error(response.error || 'Error cancelling processing job');
    }
    return response.data;
  });
}

/**
 * Hook para obtener global insights agrupados por pilar
 */
export function useGlobalInsights(limitPerType: number = 10) {
  return useQuery(`global-insights-${limitPerType}`, async () => {
    const response = await api.globalInsights.getByPillar(limitPerType);
    if (!response.success) {
      throw new Error(response.error || 'Error loading global insights');
    }
    return response.data;
  });
}

/**
 * Hook para obtener estadísticas de global insights
 */
export function useGlobalInsightsStats() {
  return useQuery('global-insights-stats', async () => {
    const response = await api.globalInsights.getStats();
    if (!response.success) {
      throw new Error(response.error || 'Error loading insights statistics');
    }
    return response.data;
  });
}
