# Global Insights Dashboard

## Overview

The Global Insights dashboard provides a comprehensive view of **Problems** and **Proposals** identified across all co-creation sessions, organized by the three strategic pillars of the Youth & Social Innovation Charter.

## Architecture

### Component Hierarchy

```
GlobalInsights (main container)
├── InsightsSidebar (pillar selector)
└── InsightsLeaderboard (x2: problems & proposals)
    ├── InsightCard (individual items)
    └── EvidenceDrawer (supporting documents & citations)
```

### Key Features

1. **Three-Pillar Organization**
   - Capital Access 💰 (Blue #0077B6)
   - Ecosystem Support 🌐 (Purple #C3B1E1)
   - Wellbeing & Recognition 🌱 (Green #A8E6CF)

2. **Dual Leaderboards**
   - Top Problems (sorted by weighted score by default)
   - Top Proposals (sorted by weighted score by default)

3. **Rich Metrics**
   - **Count**: Number of distinct documents mentioning this insight
   - **Weighted Count**: Decay-adjusted score (recent mentions weigh more)
   - **Last Seen**: Most recent mention date
   - **Aliases**: Alternative phrasings of the same insight

4. **Breakdowns**
   - By Region (e.g., Ethiopia, Kenya, Austria)
   - By Year (2023-2025)
   - By Stakeholder (organizations and individuals)

5. **Evidence Trail**
   - Click "View Evidence" to open right-side drawer
   - Shows all supporting documents
   - Displays sentence-level citations with:
     - Exact quote
     - Speaker (if known)
     - Timestamp
     - Context
   - Copy-to-clipboard functionality
   - "Open in source" links

6. **Sorting Options**
   - Weighted Score (default): Recent mentions weigh more
   - Document Count: Total number of mentions
   - Most Recent: Latest mention first

## Data Flow

### Mock Data Structure

Located in `src/data/mockInsights.ts`:

```typescript
{
  pillars: [
    {
      pillar: 'capital_access',
      problems: [...],
      proposals: [...]
    },
    // ... other pillars
  ]
}
```

Each insight item includes:
- `canonical_text`: The main phrasing
- `aliases`: List of alternative phrasings
- `count`: Number of distinct documents
- `weighted_count`: Recency-adjusted score
- `supporting_docs`: Array of documents with citations
- `breakdowns`: Regional, temporal, and stakeholder data

### Types

Located in `src/types/insights.ts`:

- `InsightItem`: Core data structure for problems/proposals
- `DocEvidence`: Document with sentence-level citations
- `Citation`: Individual quote with metadata
- `Pillar`: Union type of the 3 pillars
- `SortOption`: Sorting methods

## Usage

### Accessing the Dashboard

1. Navigate to the **Dashboard** tab (main navigation)
2. Click on the **Global Insights** sub-tab
3. Select a pillar from the left sidebar
4. Browse problems and proposals in the dual leaderboards
5. Click "View Evidence" on any card to see supporting documents

### Navigation Flow

```
App.tsx
  └─ Dashboard Tab
      └─ Sub-tabs: [Shapers Network | Global Insights]
          └─ Global Insights
              ├─ Sidebar: Select pillar
              ├─ Leaderboard: Browse problems/proposals
              └─ Drawer: View evidence (on demand)
```

## Responsive Design

- **Desktop (≥1024px)**: Sidebar + dual-column leaderboards
- **Tablet (768-1023px)**: Sidebar + single-column leaderboards (stacked)
- **Mobile (<768px)**: Full-width, collapsible sidebar

## Future Enhancements (Phase 2+)

- [ ] Sparklines for 30/90-day trends
- [ ] Compare mode (juxtapose problems ↔ proposals)
- [ ] Export to CSV/JSON
- [ ] Pin to watchlist
- [ ] Pending review workflow
- [ ] Create Commitment wizard (seed drafts from evidence)
- [ ] Real-time updates (replace mock data with API)
- [ ] Collaborative features (comments, voting)
- [ ] Time machine view (historical leaderboards)

## Styling

Uses existing YSI color palette:
- Primary: `#0077B6` (blue)
- Secondary: `#C3B1E1` (purple)
- Accent: `#A8E6CF` (green)
- Background gradient: `white → #E8F1F9`

Components leverage:
- shadcn/ui primitives (Card, Badge, Button, Sheet, Tabs)
- Lucide React icons
- Tailwind CSS utilities

## Performance Considerations

- Virtualized lists (for large datasets in Phase 2+)
- Lazy loading of breakdowns
- Debounced search (future feature)
- Pagination in evidence drawer (if >20 docs)

---

**Last Updated**: 2025-10-12
**Status**: Phase 1 MVP - Mock Data Implementation Complete
