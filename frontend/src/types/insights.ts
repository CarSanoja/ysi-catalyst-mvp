/**
 * Global Insights Types
 * Types for Problems/Proposals leaderboard system
 */

export type Pillar = 'capital_access' | 'ecosystem_support' | 'wellbeing_recognition';

export type InsightType = 'problem' | 'proposal';

export interface RegionBreakdown {
  region: string;
  count: number;
}

export interface YearBreakdown {
  year: number;
  count: number;
}

export interface StakeholderBreakdown {
  name: string;
  count: number;
}

export interface Breakdowns {
  by_region: RegionBreakdown[];
  by_year: YearBreakdown[];
  by_stakeholder: StakeholderBreakdown[];
}

export interface Citation {
  cite_id: string;
  quote: string;
  speaker?: string;
  timestamp?: string;
  context: string;
}

export interface DocEvidence {
  doc_id: string;
  doc_title: string;
  uploader: string;
  date: string;
  citations: Citation[];
}

export interface InsightItem {
  id: string;
  canonical_text: string;
  type: InsightType;
  pillar: Pillar;
  count: number;              // Distinct documents mentioning this
  weighted_count: number;     // Decay-adjusted score (recent mentions weigh more)
  last_seen: string;         // ISO date string
  aliases_count: number;      // Number of variations found
  aliases: string[];          // List of alternative phrasings
  supporting_docs: DocEvidence[];
  breakdowns: Breakdowns;
}

export interface PillarData {
  pillar: Pillar;
  problems: InsightItem[];
  proposals: InsightItem[];
}

export interface InsightsData {
  pillars: PillarData[];
}

// Helper type for sorting
export type SortOption = 'weighted_count' | 'count' | 'last_seen';

// Pillar display config
export interface PillarConfig {
  id: Pillar;
  name: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
}
