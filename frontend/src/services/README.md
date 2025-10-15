# YSI Platform - API Service Documentation

## Configuración

### Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
REACT_APP_API_URL=http://localhost:3001/api
```

Para producción:
```env
REACT_APP_API_URL=https://api.ysi-platform.org/api
```

## Estructura del API

El servicio está organizado en módulos:

### 1. Shapers API (`api.shapers`)
Maneja operaciones CRUD de Global Shapers.

**Endpoints disponibles:**
- `getAll()` - GET /shapers
- `getById(id)` - GET /shapers/:id
- `create(data)` - POST /shapers
- `update(id, data)` - PUT /shapers/:id
- `delete(id)` - DELETE /shapers/:id
- `getByRegion(region)` - GET /shapers/region/:region
- `getByFocusArea(focusArea)` - GET /shapers/focus/:focusArea

### 2. Documents API (`api.documents`)
Maneja documentos procesados.

**Endpoints disponibles:**
- `getAll(filters?)` - GET /documents
- `getById(id)` - GET /documents/:id
- `create(data)` - POST /documents
- `update(id, data)` - PUT /documents/:id
- `delete(id)` - DELETE /documents/:id
- `search(query)` - GET /documents/search

### 3. Notes API (`api.notes`)
Procesa y guarda notas de reuniones.

**Endpoints disponibles:**
- `processNotes(data)` - POST /notes/process
- `saveRawNotes(data)` - POST /notes/save
- `getAll()` - GET /notes
- `getById(id)` - GET /notes/:id

### 4. Insights API (`api.insights`)
Maneja insights generados automáticamente.

**Endpoints disponibles:**
- `getAll(filters?)` - GET /insights
- `getById(id)` - GET /insights/:id
- `generate(documentIds)` - POST /insights/generate
- `update(id, data)` - PUT /insights/:id
- `delete(id)` - DELETE /insights/:id

### 5. Analytics API (`api.analytics`)
Proporciona métricas y análisis.

**Endpoints disponibles:**
- `getSentiment(params?)` - GET /analytics/sentiment
- `getTopics(params?)` - GET /analytics/topics
- `getNetwork()` - GET /analytics/network
- `getOverview()` - GET /analytics/overview
- `getEngagement(params?)` - GET /analytics/engagement

### 6. Upload API (`api.upload`)
Maneja subida de archivos.

**Endpoints disponibles:**
- `uploadDocument(file, metadata?)` - POST /upload/document
- `uploadPhoto(file, shaperId?)` - POST /upload/photo

## Uso en Componentes

### Ejemplo 1: Usando el hook `useQuery`

```tsx
import { useQuery } from '../hooks/useApi';
import api from '../services/api';

function ShapersList() {
  const { data, loading, error, refetch } = useQuery(
    'shapers',
    api.shapers.getAll,
    {
      enabled: true,
      onSuccess: (data) => console.log('Shapers loaded:', data),
      onError: (error) => console.error('Error:', error),
    }
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.data?.map(shaper => (
        <div key={shaper.id}>{shaper.name}</div>
      ))}
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

### Ejemplo 2: Usando el hook `useMutation`

```tsx
import { useMutation } from '../hooks/useApi';
import api from '../services/api';
import { toast } from 'sonner@2.0.3';

function CaptureNotesForm() {
  const { mutate, loading } = useMutation(
    api.notes.processNotes,
    {
      onSuccess: (data) => {
        toast.success('Notes processed successfully!');
      },
      onError: (error) => {
        toast.error(`Error: ${error.message}`);
      },
    }
  );

  const handleSubmit = (text: string) => {
    mutate({ text });
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit(e.currentTarget.notes.value);
    }}>
      <textarea name="notes" />
      <button type="submit" disabled={loading}>
        {loading ? 'Processing...' : 'Submit'}
      </button>
    </form>
  );
}
```

### Ejemplo 3: Llamada directa al API

```tsx
import api from '../services/api';

async function loadShapers() {
  try {
    const response = await api.shapers.getAll();
    console.log('Shapers:', response.data);
  } catch (error) {
    console.error('Error loading shapers:', error);
  }
}
```

## Respuestas del API

Todas las respuestas siguen este formato:

```typescript
{
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

## Manejo de Errores

El servicio incluye manejo de errores automático:

- **Timeout**: 30 segundos por request
- **Network errors**: Detectados y reportados
- **HTTP errors**: Status codes != 200-299
- **Abort**: Cancelación automática en timeout

## Backend Esperado

El backend debe implementar los siguientes endpoints:

### Shapers
- `GET /api/shapers` - Lista de shapers
- `GET /api/shapers/:id` - Shaper específico
- `POST /api/shapers` - Crear shaper
- `PUT /api/shapers/:id` - Actualizar shaper
- `DELETE /api/shapers/:id` - Eliminar shaper
- `GET /api/shapers/region/:region` - Filtrar por región
- `GET /api/shapers/focus/:focusArea` - Filtrar por área

### Documents
- `GET /api/documents` - Lista de documentos (con filtros opcionales)
- `GET /api/documents/:id` - Documento específico
- `POST /api/documents` - Crear documento
- `PUT /api/documents/:id` - Actualizar documento
- `DELETE /api/documents/:id` - Eliminar documento
- `GET /api/documents/search?q=query` - Buscar documentos

### Notes
- `POST /api/notes/process` - Procesar notas con IA
- `POST /api/notes/save` - Guardar notas sin procesar
- `GET /api/notes` - Lista de notas
- `GET /api/notes/:id` - Nota específica

### Insights
- `GET /api/insights` - Lista de insights
- `GET /api/insights/:id` - Insight específico
- `POST /api/insights/generate` - Generar insights
- `PUT /api/insights/:id` - Actualizar insight
- `DELETE /api/insights/:id` - Eliminar insight

### Analytics
- `GET /api/analytics/sentiment` - Datos de sentimiento
- `GET /api/analytics/topics` - Datos de tópicos
- `GET /api/analytics/network` - Red de stakeholders
- `GET /api/analytics/overview` - Resumen general
- `GET /api/analytics/engagement` - Métricas de engagement

### Upload
- `POST /api/upload/document` - Subir documento (multipart/form-data)
- `POST /api/upload/photo` - Subir foto (multipart/form-data)

## Próximos Pasos

1. Implementar backend con estos endpoints
2. Configurar autenticación (JWT, OAuth, etc.)
3. Implementar rate limiting
4. Agregar caching
5. Implementar WebSockets para updates en tiempo real
6. Agregar tests unitarios para cada endpoint
