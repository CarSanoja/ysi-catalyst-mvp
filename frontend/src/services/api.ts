/**
 * YSI Platform API Service
 *
 * Este servicio maneja todas las llamadas al backend.
 * Detecta automáticamente el entorno y configura la URL correcta.
 */

import { getEnvironmentConfig, getBestApiUrl, logEnvironmentInfo } from '../utils/environment';

// Initialize environment detection
const environmentConfig = getEnvironmentConfig();

// Log environment info in development
if (environmentConfig.name === 'development') {
  logEnvironmentInfo();
}

// Configuración del API con detección automática de entorno
const API_CONFIG = {
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

// Get base URL dynamically using the same logic as authentication
async function getBaseUrl(): Promise<string> {
  // Use the same intelligent API URL detection as the login system
  return await getBestApiUrl();
}

// Tipos de respuesta del API
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Helper para manejar errores
class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Helper para hacer requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  try {
    const baseUrl = await getBaseUrl();
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...API_CONFIG.HEADERS,
        ...options.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new ApiError(
        response.status,
        `API Error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw new Error(`Network error: ${error.message}`);
    }
    
    throw new Error('Unknown error occurred');
  }
}

// ==========================================
// GLOBAL SHAPERS ENDPOINTS
// ==========================================

export const shapersApi = {
  /**
   * GET /shapers - Obtener todos los Global Shapers
   */
  getAll: async () => {
    return apiRequest<ApiResponse<any[]>>('/shapers/', {
      method: 'GET',
    });
  },

  /**
   * GET /shapers/:id - Obtener un Global Shaper por ID
   */
  getById: async (id: string) => {
    return apiRequest<ApiResponse<any>>(`/shapers/${id}`, {
      method: 'GET',
    });
  },

  /**
   * POST /shapers - Crear un nuevo Global Shaper
   */
  create: async (shaperData: {
    name: string;
    region: string;
    focus_area: string;
    photo?: string;
    bio: string;
  }) => {
    return apiRequest<ApiResponse<any>>('/shapers/', {
      method: 'POST',
      body: JSON.stringify(shaperData),
    });
  },

  /**
   * PUT /shapers/:id - Actualizar un Global Shaper
   */
  update: async (id: string, shaperData: Partial<any>) => {
    return apiRequest<ApiResponse<any>>(`/shapers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(shaperData),
    });
  },

  /**
   * DELETE /shapers/:id - Eliminar un Global Shaper
   */
  delete: async (id: string) => {
    return apiRequest<ApiResponse<any>>(`/shapers/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * GET /shapers/region/:region - Filtrar por región
   */
  getByRegion: async (region: string) => {
    return apiRequest<ApiResponse<any[]>>(`/shapers/region/${region}`, {
      method: 'GET',
    });
  },

  /**
   * GET /shapers/focus/:focusArea - Filtrar por área de enfoque
   */
  getByFocusArea: async (focusArea: string) => {
    return apiRequest<ApiResponse<any[]>>(`/shapers/focus/${focusArea}`, {
      method: 'GET',
    });
  },
};

// ==========================================
// DOCUMENTS ENDPOINTS
// ==========================================

export const documentsApi = {
  /**
   * GET /documents - Obtener todos los documentos procesados
   */
  getAll: async (filters?: {
    sentiment?: string;
    dateFrom?: string;
    dateTo?: string;
    uploader?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
    }
    
    const endpoint = `/documents/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiRequest<ApiResponse<any[]>>(endpoint, {
      method: 'GET',
    });
  },

  /**
   * GET /documents/:id - Obtener un documento por ID
   */
  getById: async (id: string) => {
    return apiRequest<ApiResponse<any>>(`/documents/${id}`, {
      method: 'GET',
    });
  },

  /**
   * POST /documents - Crear/guardar un documento procesado
   */
  create: async (documentData: {
    title: string;
    date: string;
    uploader: string;
    main_theme: string;
    sentiment: string;
    insights: any;
    related_shapers: string[];
  }) => {
    return apiRequest<ApiResponse<any>>('/documents/', {
      method: 'POST',
      body: JSON.stringify(documentData),
    });
  },

  /**
   * PUT /documents/:id - Actualizar un documento
   */
  update: async (id: string, documentData: Partial<any>) => {
    return apiRequest<ApiResponse<any>>(`/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(documentData),
    });
  },

  /**
   * DELETE /documents/:id - Eliminar un documento
   */
  delete: async (id: string) => {
    return apiRequest<ApiResponse<any>>(`/documents/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * GET /documents/search - Buscar documentos
   */
  search: async (query: string) => {
    return apiRequest<ApiResponse<any[]>>(`/documents/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
    });
  },

  /**
   * GET /notes/jobs/documents - Obtener jobs completados como documentos (unified endpoint)
   */
  getAllFromJobs: async (filters?: {
    sentiment?: string;
    dateFrom?: string;
    dateTo?: string;
    uploader?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
    }

    const endpoint = `/notes/jobs/documents${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiRequest<ApiResponse<any[]>>(endpoint, {
      method: 'GET',
    });
  },
};

// ==========================================
// NOTES/CAPTURE ENDPOINTS
// ==========================================

export const notesApi = {
  /**
   * POST /notes/process - Crear job de procesamiento de texto
   */
  processNotes: async (notesData: {
    text: string;
    context?: string;
  }) => {
    return apiRequest<ApiResponse<any>>('/notes/process/', {
      method: 'POST',
      body: JSON.stringify(notesData),
    });
  },

  /**
   * POST /notes/save - Guardar notas sin procesar
   */
  saveRawNotes: async (notesData: {
    title: string;
    text: string;
    date: string;
    author: string;
  }) => {
    return apiRequest<ApiResponse<any>>('/notes/save/', {
      method: 'POST',
      body: JSON.stringify(notesData),
    });
  },

  /**
   * GET /notes - Obtener todas las notas guardadas
   */
  getAll: async () => {
    return apiRequest<ApiResponse<any[]>>('/notes/', {
      method: 'GET',
    });
  },

  /**
   * GET /notes/:id - Obtener nota por ID
   */
  getById: async (id: string) => {
    return apiRequest<ApiResponse<any>>(`/notes/${id}`, {
      method: 'GET',
    });
  },

  /**
   * GET /notes/jobs - Obtener lista de jobs de procesamiento
   */
  getProcessingJobs: async (params?: {
    skip?: number;
    limit?: number;
    status?: 'received' | 'processing' | 'cancelled' | 'error' | 'completed';
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }

    const endpoint = `/notes/jobs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiRequest<ApiResponse<any>>(endpoint, {
      method: 'GET',
    });
  },

  /**
   * GET /notes/jobs/:id - Obtener job específico por ID
   */
  getProcessingJob: async (jobId: string) => {
    return apiRequest<ApiResponse<any>>(`/notes/jobs/${jobId}`, {
      method: 'GET',
    });
  },

  /**
   * PUT /notes/jobs/:id/cancel - Cancelar job de procesamiento
   */
  cancelProcessingJob: async (jobId: string) => {
    return apiRequest<ApiResponse<any>>(`/notes/jobs/${jobId}/cancel`, {
      method: 'PUT',
    });
  },

  /**
   * PUT /notes/jobs/documents/:jobId - Actualizar insights de un documento procesado
   */
  updateProcessingJobDocument: async (jobId: string, updates: {
    insights?: {
      title?: string;
      mainTheme?: string;
      keyActors?: string[];
      proposedActions?: string[];
      challenges?: string[];
      opportunities?: string[];
    };
    meetingDate?: string;
    attendingShapers?: string[];
    googleDocsLink?: string;
    changed_by?: string;
    change_reason?: string;
  }) => {
    return apiRequest<ApiResponse<any>>(`/notes/jobs/documents/${jobId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  /**
   * GET /notes/jobs/documents/:jobId/changes - Obtener historial de cambios
   */
  getJobChangeHistory: async (jobId: string) => {
    return apiRequest<ApiResponse<any[]>>(`/notes/jobs/documents/${jobId}/changes`, {
      method: 'GET',
    });
  },

  /**
   * PUT /notes/:noteId - Actualizar nota/sesión
   */
  updateSession: async (noteId: string, updates: {
    insights?: {
      title?: string;
      mainTheme?: string;
      keyActors?: string[];
      proposedActions?: string[];
      challenges?: string[];
      opportunities?: string[];
    };
    changed_by?: string;
    change_reason?: string;
  }) => {
    return apiRequest<ApiResponse<any>>(`/notes/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  /**
   * GET /notes/:noteId/changes - Obtener historial de cambios de sesión
   */
  getSessionChangeHistory: async (noteId: string) => {
    return apiRequest<ApiResponse<any[]>>(`/notes/${noteId}/changes`, {
      method: 'GET',
    });
  },
};

// ==========================================
// INSIGHTS ENDPOINTS
// ==========================================

export const insightsApi = {
  /**
   * GET /insights - Obtener todos los insights
   */
  getAll: async (filters?: {
    pillar?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
    }
    
    const endpoint = `/insights${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiRequest<ApiResponse<any[]>>(endpoint, {
      method: 'GET',
    });
  },

  /**
   * GET /insights/:id - Obtener insight por ID
   */
  getById: async (id: string) => {
    return apiRequest<ApiResponse<any>>(`/insights/${id}`, {
      method: 'GET',
    });
  },

  /**
   * POST /insights/generate - Generar insights desde documentos
   */
  generate: async (documentIds: string[]) => {
    return apiRequest<ApiResponse<any>>('/insights/generate', {
      method: 'POST',
      body: JSON.stringify({ documentIds }),
    });
  },

  /**
   * PUT /insights/:id - Actualizar insight
   */
  update: async (id: string, insightData: Partial<any>) => {
    return apiRequest<ApiResponse<any>>(`/insights/${id}`, {
      method: 'PUT',
      body: JSON.stringify(insightData),
    });
  },

  /**
   * DELETE /insights/:id - Eliminar insight
   */
  delete: async (id: string) => {
    return apiRequest<ApiResponse<any>>(`/insights/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==========================================
// ANALYTICS ENDPOINTS
// ==========================================

export const analyticsApi = {
  /**
   * GET /analytics/sentiment - Obtener datos de sentimiento
   */
  getSentiment: async (params?: {
    dateFrom?: string;
    dateTo?: string;
    granularity?: 'day' | 'week' | 'month';
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
    }
    
    const endpoint = `/analytics/sentiment${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiRequest<ApiResponse<any[]>>(endpoint, {
      method: 'GET',
    });
  },

  /**
   * GET /analytics/topics - Obtener datos de tópicos
   */
  getTopics: async (params?: {
    pillar?: string;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });
    }
    
    const endpoint = `/analytics/topics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiRequest<ApiResponse<any[]>>(endpoint, {
      method: 'GET',
    });
  },

  /**
   * GET /analytics/network - Obtener datos de red de stakeholders
   */
  getNetwork: async () => {
    return apiRequest<ApiResponse<any>>('/analytics/network', {
      method: 'GET',
    });
  },

  /**
   * GET /analytics/overview - Obtener resumen general
   */
  getOverview: async () => {
    return apiRequest<ApiResponse<any>>('/analytics/overview', {
      method: 'GET',
    });
  },

  /**
   * GET /analytics/engagement - Métricas de engagement
   */
  getEngagement: async (params?: {
    shaperIds?: string[];
    dateFrom?: string;
    dateTo?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.shaperIds) {
        params.shaperIds.forEach(id => queryParams.append('shaperId', id));
      }
      if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
      if (params.dateTo) queryParams.append('dateTo', params.dateTo);
    }
    
    const endpoint = `/analytics/engagement${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiRequest<ApiResponse<any>>(endpoint, {
      method: 'GET',
    });
  },
};

// ==========================================
// UPLOAD ENDPOINTS
// ==========================================

export const uploadApi = {
  /**
   * POST /upload/document - Subir documento (PDF, DOCX, etc.)
   */
  uploadDocument: async (file: File, metadata?: {
    title?: string;
    description?: string;
    uploader?: string;
  }) => {
    const formData = new FormData();
    formData.append('file', file);
    
    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });
    }

    return apiRequest<ApiResponse<any>>('/upload/document', {
      method: 'POST',
      headers: {
        // No incluir Content-Type, el browser lo setea automáticamente con boundary
      },
      body: formData as any,
    });
  },

  /**
   * POST /upload/photo - Subir foto de perfil
   */
  uploadPhoto: async (file: File, shaperId?: string) => {
    const formData = new FormData();
    formData.append('photo', file);
    if (shaperId) formData.append('shaperId', shaperId);

    return apiRequest<ApiResponse<{ url: string }>>('/upload/photo', {
      method: 'POST',
      headers: {},
      body: formData as any,
    });
  },
};

// ==========================================
// STAKEHOLDERS ENDPOINTS
// ==========================================

export const stakeholdersApi = {
  /**
   * GET /stakeholders - Obtener todos los stakeholders con filtros opcionales
   */
  getAll: async (filters?: {
    skip?: number;
    limit?: number;
    type?: string;
    region?: string;
    search?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }

    const endpoint = `/stakeholders/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiRequest<ApiResponse<any[]>>(endpoint, {
      method: 'GET',
    });
  },

  /**
   * GET /stakeholders/:id - Obtener stakeholder por ID con notas
   */
  getById: async (id: string) => {
    return apiRequest<ApiResponse<any>>(`/stakeholders/${id}`, {
      method: 'GET',
    });
  },

  /**
   * POST /stakeholders - Crear nuevo stakeholder
   */
  create: async (stakeholderData: {
    name: string;
    role: string;
    organization: string;
    type: string;
    region: string;
    email: string;
    phone?: string;
    bio: string;
    tags: string[];
    links: Array<{ label: string; url: string }>;
    created_by: string;
  }) => {
    return apiRequest<ApiResponse<any>>('/stakeholders/', {
      method: 'POST',
      body: JSON.stringify(stakeholderData),
    });
  },

  /**
   * PUT /stakeholders/:id - Actualizar stakeholder
   */
  update: async (id: string, stakeholderData: Partial<{
    name: string;
    role: string;
    organization: string;
    type: string;
    region: string;
    email: string;
    phone?: string;
    bio: string;
    tags: string[];
    links: Array<{ label: string; url: string }>;
  }>) => {
    return apiRequest<ApiResponse<any>>(`/stakeholders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(stakeholderData),
    });
  },

  /**
   * DELETE /stakeholders/:id - Eliminar stakeholder
   */
  delete: async (id: string) => {
    return apiRequest<ApiResponse<any>>(`/stakeholders/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * GET /stakeholders/:id/relationships - Obtener relaciones del stakeholder
   */
  getRelationships: async (id: string) => {
    return apiRequest<ApiResponse<any>>(`/stakeholders/${id}/relationships`, {
      method: 'GET',
    });
  },

  // STAKEHOLDER NOTES OPERATIONS

  /**
   * GET /stakeholders/:id/notes - Obtener notas de un stakeholder
   */
  getNotes: async (stakeholderId: string, params?: {
    skip?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }

    const endpoint = `/stakeholders/${stakeholderId}/notes${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiRequest<ApiResponse<any[]>>(endpoint, {
      method: 'GET',
    });
  },

  /**
   * POST /stakeholders/:id/notes - Crear nueva nota para stakeholder
   */
  createNote: async (stakeholderId: string, noteData: {
    content: string;
    created_by: string;
  }) => {
    return apiRequest<ApiResponse<any>>(`/stakeholders/${stakeholderId}/notes`, {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  },

  /**
   * PUT /stakeholders/:stakeholderId/notes/:noteId - Actualizar nota
   */
  updateNote: async (stakeholderId: string, noteId: string, noteData: {
    content?: string;
  }) => {
    return apiRequest<ApiResponse<any>>(`/stakeholders/${stakeholderId}/notes/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify(noteData),
    });
  },

  /**
   * DELETE /stakeholders/:stakeholderId/notes/:noteId - Eliminar nota
   */
  deleteNote: async (stakeholderId: string, noteId: string) => {
    return apiRequest<ApiResponse<any>>(`/stakeholders/${stakeholderId}/notes/${noteId}`, {
      method: 'DELETE',
    });
  },
};

// ==========================================
// GLOBAL INSIGHTS ENDPOINTS
// ==========================================

export const globalInsightsApi = {
  /**
   * GET /global-insights/by-pillar - Obtener insights agrupados por pilar (para Global Insights UI)
   */
  getByPillar: async (limitPerType: number = 10) => {
    return apiRequest<ApiResponse<any>>(`/global-insights/by-pillar?limit_per_type=${limitPerType}`, {
      method: 'GET',
    });
  },

  /**
   * GET /global-insights - Obtener todos los global insights con filtros
   */
  getAll: async (params?: {
    skip?: number;
    limit?: number;
    pillar?: string;
    type?: 'problem' | 'proposal';
    sort_by?: 'weighted_count' | 'count' | 'last_seen';
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }

    const endpoint = `/global-insights/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiRequest<ApiResponse<any>>(endpoint, {
      method: 'GET',
    });
  },

  /**
   * GET /global-insights/:id - Obtener insight específico
   */
  getById: async (id: string) => {
    return apiRequest<ApiResponse<any>>(`/global-insights/${id}`, {
      method: 'GET',
    });
  },

  /**
   * GET /global-insights/stats/summary - Obtener estadísticas de insights
   */
  getStats: async () => {
    return apiRequest<ApiResponse<any>>('/global-insights/stats/summary', {
      method: 'GET',
    });
  },

  /**
   * POST /global-insights - Crear nuevo insight manualmente
   */
  create: async (insightData: any) => {
    return apiRequest<ApiResponse<any>>('/global-insights/', {
      method: 'POST',
      body: JSON.stringify(insightData),
    });
  },

  /**
   * PUT /global-insights/:id - Actualizar insight
   */
  update: async (id: string, insightData: any) => {
    return apiRequest<ApiResponse<any>>(`/global-insights/${id}`, {
      method: 'PUT',
      body: JSON.stringify(insightData),
    });
  },

  /**
   * DELETE /global-insights/:id - Eliminar insight
   */
  delete: async (id: string) => {
    return apiRequest<ApiResponse<any>>(`/global-insights/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==========================================
// EXPORT DEFAULT API OBJECT
// ==========================================

export const api = {
  shapers: shapersApi,
  documents: documentsApi,
  notes: notesApi,
  insights: insightsApi,
  analytics: analyticsApi,
  upload: uploadApi,
  stakeholders: stakeholdersApi,
  globalInsights: globalInsightsApi,
};

export default api;
