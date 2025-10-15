export interface Stakeholder {
  id: string;
  name: string;
  organization: string;
  type: 'innovator' | 'funder' | 'partner' | 'mentor' | 'policymaker';
  location: {
    lat: number;
    lng: number;
    country: string;
    city: string;
  };
  pillars: Array<'capital' | 'recognition' | 'wellbeing'>;
  relationships: string[]; // IDs of connected stakeholders
  engagementScore: number;
}

export interface GlobalShaper {
  id: string;
  name: string;
  region: string;
  focusArea: 'Capital Access' | 'Recognition' | 'Wellbeing';
  photo: string;
  bio: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  participants: string[]; // Stakeholder IDs
  themes: string[];
  pillars: Array<'capital' | 'recognition' | 'wellbeing'>;
  notes: string;
  keyTakeaways: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface Insight {
  id: string;
  title: string;
  summary: string;
  mainIdeas: string[];
  challenges: string[];
  opportunities: string[];
  recommendations: string[];
  sources: string[]; // Meeting IDs
  date: string;
  pillars: Array<'capital' | 'recognition' | 'wellbeing'>;
}

export interface TopicActivity {
  pillar: 'capital' | 'recognition' | 'wellbeing';
  topic: string;
  frequency: number;
  lastDiscussed: string;
}

export interface SentimentData {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
  overall: number;
}

export interface YSIPillarAnalysis {
  problems: string[];
  proposals: string[];
}

// Network Analysis Types
export interface NetworkStakeholder {
  name: string;
  type: 'funder' | 'mentor' | 'implementer' | 'beneficiary' | 'policymaker' | 'organization' | 'researcher' | 'community_leader';
  location?: string;
  context: string;
  mentioned_frequency: number;
}

export interface NetworkRelationship {
  from_stakeholder: string;
  to_stakeholder: string;
  type: 'collaboration' | 'funding' | 'mentorship' | 'policy' | 'conflict' | 'partnership' | 'advisory' | 'support';
  strength: 'weak' | 'moderate' | 'strong';
  description: string;
  evidence: string;
}

export interface TopicNetwork {
  topic: string;
  connected_stakeholders: string[];
  pillar_alignment: 'access_to_capital' | 'ecosystem_support' | 'mental_health' | 'recognition' | 'general';
  centrality: 'high' | 'medium' | 'low';
}

export interface GeographicCluster {
  region: string;
  stakeholders: string[];
  topics: string[];
}

export interface NetworkAnalysis {
  stakeholders: NetworkStakeholder[];
  relationships: NetworkRelationship[];
  topic_networks: TopicNetwork[];
  geographic_clusters: GeographicCluster[];
  network_density: 'sparse' | 'moderate' | 'dense';
  primary_connectors: string[];
}

export interface ExtractedInsight {
  id: string;
  mainTheme: string;
  subthemes: string[];
  keyActors: string[];
  generalPerception: 'positive' | 'neutral' | 'negative';
  proposedActions: string[];
  challenges: string[];
  opportunities: string[];
  rawText: string;
  extractedAt: string;
  // Enhanced YSI pillar analysis
  pillarAnalysis?: {
    access_to_capital?: YSIPillarAnalysis;
    ecosystem_support?: YSIPillarAnalysis;
    mental_health?: YSIPillarAnalysis;
    recognition?: YSIPillarAnalysis;
  };
  // Network analysis from specialized agent
  networkAnalysis?: NetworkAnalysis;
  // Raw backend data fields for compatibility
  ysiPillarAnalysis?: any;
  structuredInsights?: any;
}

export interface ProcessedDocument {
  id: string;
  title: string;
  date: string;
  uploader: string;
  mainTheme: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  insights: ExtractedInsight;
  relatedShapers: string[];
  documentType?: 'session' | 'text_processing_job';
  meetingDate?: string;
  attendingShapers?: string[];
  googleDocsLink?: string;
}

// Document Editing Types
export interface DocumentEdit {
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
}

export interface ChangeLogEntry {
  id: number;
  document_type: string;
  document_id: number;
  field_name: string;
  old_value?: string;
  new_value?: string;
  change_type: string;
  changed_by: string;
  change_reason?: string;
  created_at: string;
}

export interface EditableFieldProps {
  label: string;
  value: string;
  onSave: (newValue: string) => Promise<void>;
  multiline?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export interface EditableListProps {
  label: string;
  items: string[];
  onSave: (newItems: string[]) => Promise<void>;
  placeholder?: string;
  disabled?: boolean;
  maxItems?: number;
}

export interface ChangeHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentType: 'session' | 'text_processing_job';
  documentTitle: string;
}
