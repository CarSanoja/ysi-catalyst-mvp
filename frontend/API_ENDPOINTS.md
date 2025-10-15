# YSI Platform API Endpoints Documentation

**Base URL:** `http://localhost:3001/api` (configurable via `REACT_APP_API_URL`)
**Timeout:** 30 seconds
**Content-Type:** `application/json`

## Endpoints Overview

### Global Shapers API

| Endpoint Name | Method | Path | Request Data | Response Data | Status |
|--------------|--------|------|--------------|---------------|--------|
| Get All Shapers | GET | `/shapers` | None | `{ success: boolean, data: Shaper[] }` | Not Integrated |
| Get Shaper by ID | GET | `/shapers/:id` | Path param: `id` (string) | `{ success: boolean, data: Shaper }` | Not Integrated |
| Create Shaper | POST | `/shapers` | `{ name: string, region: string, focusArea: string, photo?: string, bio: string }` | `{ success: boolean, data: Shaper }` | Not Integrated |
| Update Shaper | PUT | `/shapers/:id` | Path param: `id` (string)<br>Body: `Partial<Shaper>` | `{ success: boolean, data: Shaper }` | Not Integrated |
| Delete Shaper | DELETE | `/shapers/:id` | Path param: `id` (string) | `{ success: boolean }` | Not Integrated |
| Get Shapers by Region | GET | `/shapers/region/:region` | Path param: `region` (string) | `{ success: boolean, data: Shaper[] }` | Not Integrated |
| Get Shapers by Focus Area | GET | `/shapers/focus/:focusArea` | Path param: `focusArea` (string) | `{ success: boolean, data: Shaper[] }` | Not Integrated |

---

### Documents API

| Endpoint Name | Method | Path | Request Data | Response Data | Status |
|--------------|--------|------|--------------|---------------|--------|
| Get All Documents | GET | `/documents` | Query params (optional):<br>- `sentiment` (string)<br>- `dateFrom` (string)<br>- `dateTo` (string)<br>- `uploader` (string) | `{ success: boolean, data: Document[] }` | Not Integrated |
| Get Document by ID | GET | `/documents/:id` | Path param: `id` (string) | `{ success: boolean, data: Document }` | Not Integrated |
| Create Document | POST | `/documents` | `{ title: string, date: string, uploader: string, mainTheme: string, sentiment: string, insights: object, relatedShapers: string[] }` | `{ success: boolean, data: Document }` | Not Integrated |
| Update Document | PUT | `/documents/:id` | Path param: `id` (string)<br>Body: `Partial<Document>` | `{ success: boolean, data: Document }` | Not Integrated |
| Delete Document | DELETE | `/documents/:id` | Path param: `id` (string) | `{ success: boolean }` | Not Integrated |
| Search Documents | GET | `/documents/search` | Query param: `q` (string) | `{ success: boolean, data: Document[] }` | Not Integrated |

---

### Notes/Capture API

| Endpoint Name | Method | Path | Request Data | Response Data | Status |
|--------------|--------|------|--------------|---------------|--------|
| Process Notes | POST | `/notes/process` | `{ text: string, context?: string }` | `{ success: boolean, data: ProcessedInsights }` | Not Integrated |
| Save Raw Notes | POST | `/notes/save` | `{ title: string, text: string, date: string, author: string }` | `{ success: boolean, data: Note }` | Not Integrated |
| Get All Notes | GET | `/notes` | None | `{ success: boolean, data: Note[] }` | Not Integrated |
| Get Note by ID | GET | `/notes/:id` | Path param: `id` (string) | `{ success: boolean, data: Note }` | Not Integrated |

---

### Insights API

| Endpoint Name | Method | Path | Request Data | Response Data | Status |
|--------------|--------|------|--------------|---------------|--------|
| Get All Insights | GET | `/insights` | Query params (optional):<br>- `pillar` (string)<br>- `dateFrom` (string)<br>- `dateTo` (string) | `{ success: boolean, data: Insight[] }` | Not Integrated |
| Get Insight by ID | GET | `/insights/:id` | Path param: `id` (string) | `{ success: boolean, data: Insight }` | Not Integrated |
| Generate Insights | POST | `/insights/generate` | `{ documentIds: string[] }` | `{ success: boolean, data: Insight }` | Not Integrated |
| Update Insight | PUT | `/insights/:id` | Path param: `id` (string)<br>Body: `Partial<Insight>` | `{ success: boolean, data: Insight }` | Not Integrated |
| Delete Insight | DELETE | `/insights/:id` | Path param: `id` (string) | `{ success: boolean }` | Not Integrated |

---

### Analytics API

| Endpoint Name | Method | Path | Request Data | Response Data | Status |
|--------------|--------|------|--------------|---------------|--------|
| Get Sentiment Data | GET | `/analytics/sentiment` | Query params (optional):<br>- `dateFrom` (string)<br>- `dateTo` (string)<br>- `granularity` ('day' \| 'week' \| 'month') | `{ success: boolean, data: SentimentData[] }` | Not Integrated |
| Get Topics Data | GET | `/analytics/topics` | Query params (optional):<br>- `pillar` (string)<br>- `limit` (number) | `{ success: boolean, data: TopicData[] }` | Not Integrated |
| Get Network Data | GET | `/analytics/network` | None | `{ success: boolean, data: NetworkData }` | Not Integrated |
| Get Overview | GET | `/analytics/overview` | None | `{ success: boolean, data: OverviewData }` | Not Integrated |
| Get Engagement Metrics | GET | `/analytics/engagement` | Query params (optional):<br>- `shaperId[]` (string array)<br>- `dateFrom` (string)<br>- `dateTo` (string) | `{ success: boolean, data: EngagementData }` | Not Integrated |

---

### Upload API

| Endpoint Name | Method | Path | Request Data | Response Data | Status |
|--------------|--------|------|--------------|---------------|--------|
| Upload Document | POST | `/upload/document` | FormData:<br>- `file` (File)<br>- `title?` (string)<br>- `description?` (string)<br>- `uploader?` (string) | `{ success: boolean, data: UploadedDocument }` | Not Integrated |
| Upload Photo | POST | `/upload/photo` | FormData:<br>- `photo` (File)<br>- `shaperId?` (string) | `{ success: boolean, data: { url: string } }` | Not Integrated |

---

### Stakeholders API (Legacy)

| Endpoint Name | Method | Path | Request Data | Response Data | Status |
|--------------|--------|------|--------------|---------------|--------|
| Get All Stakeholders | GET | `/stakeholders` | None | `{ success: boolean, data: Stakeholder[] }` | Not Integrated |
| Get Stakeholder by ID | GET | `/stakeholders/:id` | Path param: `id` (string) | `{ success: boolean, data: Stakeholder }` | Not Integrated |
| Get Stakeholder Relationships | GET | `/stakeholders/:id/relationships` | Path param: `id` (string) | `{ success: boolean, data: Relationship[] }` | Not Integrated |

---

## Integration Status Summary

| Category | Total Endpoints | Integrated | Not Integrated |
|----------|----------------|------------|----------------|
| Shapers | 7 | 0 | 7 |
| Documents | 6 | 0 | 6 |
| Notes | 4 | 0 | 4 |
| Insights | 5 | 0 | 5 |
| Analytics | 5 | 0 | 5 |
| Upload | 2 | 0 | 2 |
| Stakeholders | 3 | 0 | 3 |
| **TOTAL** | **32** | **0** | **32** |

---

## Available React Hooks

The project includes custom hooks for API integration:

| Hook Name | Purpose | Usage |
|-----------|---------|-------|
| `useApi` | General-purpose API calls with loading/error states | Manual execution with `execute()` |
| `useQuery` | GET requests with auto-fetch and refetch capabilities | Auto-executes on mount, supports polling |
| `useMutation` | POST/PUT/DELETE requests with loading/error states | Manual execution with `mutate()` |

---

## Error Handling

All endpoints return a standardized response format:

```typescript
{
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

The API service includes:
- **Timeout handling** (30 seconds default)
- **Network error detection**
- **HTTP status error handling**
- **Custom ApiError class** for detailed error information

---

## Next Steps for Integration

1. Replace mock data in components with API calls
2. Implement error boundaries for API failures
3. Add loading states to UI components
4. Configure proper BASE_URL for production environment
5. Implement authentication/authorization headers if required
6. Add retry logic for failed requests
7. Implement optimistic updates for mutations
8. Add request/response interceptors for logging

---

**Last Updated:** 2025-10-12
**API Version:** 1.0.0
