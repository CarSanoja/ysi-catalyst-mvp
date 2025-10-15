/**
 * Stakeholder Directory Types
 * Types for stakeholder records and associated notes
 */

export type StakeholderType =
  | 'funder'
  | 'implementer'
  | 'mentor'
  | 'policymaker'
  | 'researcher'
  | 'community_leader';

export interface StakeholderLink {
  label: string;
  url: string;
}

export interface Stakeholder {
  id: string;
  name: string;
  role: string;                    // Title
  organization: string;
  type: StakeholderType;
  region: string;                  // Country
  email: string;
  phone?: string;
  bio: string;
  tags: string[];
  links: StakeholderLink[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  stakeholder_id: string;
  content: string;                 // Plain text / markdown
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Form data types
export interface StakeholderFormData {
  name: string;
  role: string;
  organization: string;
  type: StakeholderType;
  region: string;
  email: string;
  phone?: string;
  bio: string;
  tags: string[];
  links: StakeholderLink[];
}

export interface NoteFormData {
  content: string;
}

// Filter types
export interface StakeholderFilters {
  search: string;
  type?: StakeholderType;
  region?: string;
}

// Display config for stakeholder types
export interface StakeholderTypeConfig {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}

export const stakeholderTypeConfigs: Record<StakeholderType, StakeholderTypeConfig> = {
  funder: {
    label: 'Funder',
    color: '#0077B6',
    bgColor: '#E8F1F9',
    icon: '💰'
  },
  implementer: {
    label: 'Implementer',
    color: '#A8E6CF',
    bgColor: '#F0FAF5',
    icon: '🎯'
  },
  mentor: {
    label: 'Mentor',
    color: '#FFD93D',
    bgColor: '#FFF9E5',
    icon: '🧑‍🏫'
  },
  policymaker: {
    label: 'Policymaker',
    color: '#C3B1E1',
    bgColor: '#F3EFFA',
    icon: '🏛️'
  },
  researcher: {
    label: 'Researcher',
    color: '#6BCF7F',
    bgColor: '#E8F8EB',
    icon: '🔬'
  },
  community_leader: {
    label: 'Community Leader',
    color: '#FF6B6B',
    bgColor: '#FFE8E8',
    icon: '👥'
  }
};
