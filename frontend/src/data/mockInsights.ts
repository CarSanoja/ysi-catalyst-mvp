/**
 * Mock Data for Global Insights Dashboard
 * Realistic problems, proposals, and evidence with sentence-level citations
 */

import { InsightsData, PillarData, InsightItem } from '../types/insights';

// Capital Access Problems
const capitalProblems: InsightItem[] = [
  {
    id: 'prob-cap-001',
    canonical_text: 'Young innovators lack access to seed funding for early-stage ventures',
    type: 'problem',
    pillar: 'capital_access',
    count: 18,
    weighted_count: 24.5,
    last_seen: '2025-01-05',
    aliases_count: 5,
    aliases: [
      'Seed funding is inaccessible for youth entrepreneurs',
      'Early-stage capital unavailable to young founders',
      'Young people cannot secure initial investment',
      'Lack of startup capital for youth innovators',
      'Youth ventures struggle to find seed money'
    ],
    breakdowns: {
      by_region: [
        { region: 'Ethiopia', count: 8 },
        { region: 'Kenya', count: 6 },
        { region: 'Austria', count: 4 }
      ],
      by_year: [
        { year: 2025, count: 7 },
        { year: 2024, count: 9 },
        { year: 2023, count: 2 }
      ],
      by_stakeholder: [
        { name: 'Reach for Change', count: 5 },
        { name: 'Social Impact Award', count: 4 },
        { name: 'IKEA Foundation', count: 3 },
        { name: 'Young Founders', count: 6 }
      ]
    },
    supporting_docs: [
      {
        doc_id: 'doc-2024-12-15-001',
        doc_title: 'Youth Entrepreneurship Roundtable - Addis Ababa',
        uploader: 'Hristina Popova',
        date: '2024-12-15',
        citations: [
          {
            cite_id: 'cite-001',
            quote: 'The biggest barrier we face is that no investor wants to take a risk on someone under 25 without a track record.',
            speaker: 'Young Founder from Ethiopia',
            timestamp: '14:32',
            context: 'Discussion on funding barriers for youth-led startups'
          },
          {
            cite_id: 'cite-002',
            quote: 'Seed funding rounds are designed for experienced entrepreneurs, not for first-time youth innovators.',
            speaker: 'Marija Mazic',
            timestamp: '15:10',
            context: 'Analysis of traditional VC models vs youth needs'
          }
        ]
      },
      {
        doc_id: 'doc-2024-11-22-003',
        doc_title: 'Capital Access Workshop - Nairobi',
        uploader: 'Carlos',
        date: '2024-11-22',
        citations: [
          {
            cite_id: 'cite-003',
            quote: 'We need micro-seed funds specifically for young people aged 18-24.',
            speaker: 'Panel participant',
            timestamp: '10:45',
            context: 'Proposed solutions for youth capital access'
          }
        ]
      }
    ]
  },
  {
    id: 'prob-cap-002',
    canonical_text: 'High collateral requirements exclude youth without family assets',
    type: 'problem',
    pillar: 'capital_access',
    count: 15,
    weighted_count: 19.2,
    last_seen: '2024-12-28',
    aliases_count: 4,
    aliases: [
      "Banks require assets that young people don't have",
      'Collateral-based lending discriminates against youth',
      'Youth cannot provide property guarantees for loans',
      'Asset requirements block young entrepreneurs'
    ],
    breakdowns: {
      by_region: [
        { region: 'Ethiopia', count: 9 },
        { region: 'Kenya', count: 4 },
        { region: 'Rwanda', count: 2 }
      ],
      by_year: [
        { year: 2024, count: 12 },
        { year: 2023, count: 3 }
      ],
      by_stakeholder: [
        { name: 'Banking sector representatives', count: 2 },
        { name: 'Young Founders', count: 8 },
        { name: 'IKEA Foundation', count: 5 }
      ]
    },
    supporting_docs: [
      {
        doc_id: 'doc-2024-10-05-007',
        doc_title: 'Financial Inclusion Summit',
        uploader: 'Priyanka',
        date: '2024-10-05',
        citations: [
          {
            cite_id: 'cite-004',
            quote: 'Traditional banks demand collateral worth 150% of the loan amount, which is impossible for youth.',
            speaker: 'Microfinance expert',
            timestamp: '16:20',
            context: 'Banking system barriers for youth'
          }
        ]
      }
    ]
  },
  {
    id: 'prob-cap-003',
    canonical_text: 'Grant application processes are too complex for first-time applicants',
    type: 'problem',
    pillar: 'capital_access',
    count: 12,
    weighted_count: 15.8,
    last_seen: '2025-01-02',
    aliases_count: 3,
    aliases: [
      'Youth struggle with complicated grant forms',
      'Grant applications require expertise youth lack',
      'First-time applicants overwhelmed by process'
    ],
    breakdowns: {
      by_region: [
        { region: 'Austria', count: 5 },
        { region: 'Ethiopia', count: 4 },
        { region: 'Global', count: 3 }
      ],
      by_year: [
        { year: 2025, count: 4 },
        { year: 2024, count: 8 }
      ],
      by_stakeholder: [
        { name: 'Social Impact Award', count: 6 },
        { name: 'Young Applicants', count: 6 }
      ]
    },
    supporting_docs: [
      {
        doc_id: 'doc-2024-12-10-002',
        doc_title: 'Grant-making Best Practices',
        uploader: 'Hristina Popova',
        date: '2024-12-10',
        citations: [
          {
            cite_id: 'cite-005',
            quote: 'We lose 60% of potential applicants because the forms are too intimidating.',
            speaker: 'Social Impact Award Staff',
            timestamp: '11:15',
            context: 'Discussion on application drop-off rates'
          }
        ]
      }
    ]
  }
];

// Capital Access Proposals
const capitalProposals: InsightItem[] = [
  {
    id: 'prop-cap-001',
    canonical_text: 'Create a youth-specific micro-seed fund with no collateral requirements',
    type: 'proposal',
    pillar: 'capital_access',
    count: 14,
    weighted_count: 18.7,
    last_seen: '2025-01-04',
    aliases_count: 3,
    aliases: [
      'Establish collateral-free youth fund',
      'Launch micro-grants for young innovators',
      'Create youth-only seed funding pool'
    ],
    breakdowns: {
      by_region: [
        { region: 'Ethiopia', count: 6 },
        { region: 'Kenya', count: 5 },
        { region: 'Austria', count: 3 }
      ],
      by_year: [
        { year: 2025, count: 5 },
        { year: 2024, count: 9 }
      ],
      by_stakeholder: [
        { name: 'Reach for Change', count: 7 },
        { name: 'IKEA Foundation', count: 4 },
        { name: 'Young Founders', count: 3 }
      ]
    },
    supporting_docs: [
      {
        doc_id: 'doc-2024-12-15-001',
        doc_title: 'Youth Entrepreneurship Roundtable - Addis Ababa',
        uploader: 'Hristina Popova',
        date: '2024-12-15',
        citations: [
          {
            cite_id: 'cite-006',
            quote: 'A €5,000-€10,000 micro-seed fund with simplified criteria could unlock thousands of youth ventures.',
            speaker: 'Reach for Change Representative',
            timestamp: '16:45',
            context: 'Proposed solution for youth capital access'
          }
        ]
      }
    ]
  },
  {
    id: 'prop-cap-002',
    canonical_text: 'Simplify grant applications with video pitches instead of written forms',
    type: 'proposal',
    pillar: 'capital_access',
    count: 9,
    weighted_count: 11.5,
    last_seen: '2024-12-20',
    aliases_count: 2,
    aliases: [
      'Replace written applications with video submissions',
      'Allow youth to pitch via video instead of forms'
    ],
    breakdowns: {
      by_region: [
        { region: 'Austria', count: 4 },
        { region: 'Ethiopia', count: 3 },
        { region: 'Global', count: 2 }
      ],
      by_year: [
        { year: 2024, count: 9 }
      ],
      by_stakeholder: [
        { name: 'Social Impact Award', count: 5 },
        { name: 'Young Applicants', count: 4 }
      ]
    },
    supporting_docs: [
      {
        doc_id: 'doc-2024-12-10-002',
        doc_title: 'Grant-making Best Practices',
        uploader: 'Hristina Popova',
        date: '2024-12-10',
        citations: [
          {
            cite_id: 'cite-007',
            quote: 'Video pitches would lower the barrier and let us see passion, not just writing skills.',
            speaker: 'Social Impact Award Staff',
            timestamp: '12:30',
            context: 'Proposed alternative application format'
          }
        ]
      }
    ]
  }
];

// Ecosystem Support Problems
const ecosystemProblems: InsightItem[] = [
  {
    id: 'prob-eco-001',
    canonical_text: 'Youth innovators lack mentorship from experienced social entrepreneurs',
    type: 'problem',
    pillar: 'ecosystem_support',
    count: 20,
    weighted_count: 26.3,
    last_seen: '2025-01-08',
    aliases_count: 6,
    aliases: [
      'No mentorship available for young social innovators',
      'Youth struggle without experienced guidance',
      'Lack of senior mentors for youth ventures',
      'Young entrepreneurs isolated without advisors',
      'Mentorship gap for youth-led initiatives',
      'Senior entrepreneurs not connected to youth'
    ],
    breakdowns: {
      by_region: [
        { region: 'Ethiopia', count: 10 },
        { region: 'Kenya', count: 6 },
        { region: 'Rwanda', count: 4 }
      ],
      by_year: [
        { year: 2025, count: 8 },
        { year: 2024, count: 11 },
        { year: 2023, count: 1 }
      ],
      by_stakeholder: [
        { name: 'Young Founders', count: 12 },
        { name: 'Reach for Change', count: 5 },
        { name: 'Impact Hub Network', count: 3 }
      ]
    },
    supporting_docs: [
      {
        doc_id: 'doc-2025-01-03-009',
        doc_title: 'Ecosystem Needs Assessment',
        uploader: 'Marija Mazic',
        date: '2025-01-03',
        citations: [
          {
            cite_id: 'cite-008',
            quote: '87% of youth founders said they lack access to experienced mentors who understand social impact.',
            speaker: 'Survey respondent',
            timestamp: '09:15',
            context: 'Research findings on mentorship gap'
          },
          {
            cite_id: 'cite-009',
            quote: 'Mentorship is the #1 need expressed by young social entrepreneurs across all regions.',
            speaker: 'Marija Mazic',
            timestamp: '09:45',
            context: 'Summary of ecosystem gaps'
          }
        ]
      }
    ]
  },
  {
    id: 'prob-eco-002',
    canonical_text: 'Limited networking opportunities connect youth to funders and partners',
    type: 'problem',
    pillar: 'ecosystem_support',
    count: 16,
    weighted_count: 21.1,
    last_seen: '2024-12-30',
    aliases_count: 4,
    aliases: [
      'Youth isolated from funder networks',
      'No events connecting youth to investors',
      'Limited access to partnership opportunities',
      'Youth excluded from professional networks'
    ],
    breakdowns: {
      by_region: [
        { region: 'Ethiopia', count: 7 },
        { region: 'Austria', count: 5 },
        { region: 'Kenya', count: 4 }
      ],
      by_year: [
        { year: 2024, count: 14 },
        { year: 2023, count: 2 }
      ],
      by_stakeholder: [
        { name: 'Young Founders', count: 9 },
        { name: 'Ashoka', count: 4 },
        { name: 'IKEA Foundation', count: 3 }
      ]
    },
    supporting_docs: [
      {
        doc_id: 'doc-2024-11-18-005',
        doc_title: 'Networking Event - Vienna',
        uploader: 'Carlos',
        date: '2024-11-18',
        citations: [
          {
            cite_id: 'cite-010',
            quote: "Most youth innovators never meet potential funders because they don't have access to the right events.",
            speaker: 'Event Organizer',
            timestamp: '14:00',
            context: 'Barriers to networking for youth'
          }
        ]
      }
    ]
  },
  {
    id: 'prob-eco-003',
    canonical_text: 'Legal and administrative support too expensive for youth ventures',
    type: 'problem',
    pillar: 'ecosystem_support',
    count: 11,
    weighted_count: 14.2,
    last_seen: '2024-12-12',
    aliases_count: 3,
    aliases: [
      'Youth cannot afford legal services',
      'Administrative costs prohibitive for young ventures',
      'No pro-bono legal support for youth innovators'
    ],
    breakdowns: {
      by_region: [
        { region: 'Austria', count: 6 },
        { region: 'Ethiopia', count: 3 },
        { region: 'Global', count: 2 }
      ],
      by_year: [
        { year: 2024, count: 11 }
      ],
      by_stakeholder: [
        { name: 'Social Impact Award', count: 5 },
        { name: 'Young Founders', count: 6 }
      ]
    },
    supporting_docs: [
      {
        doc_id: 'doc-2024-09-20-011',
        doc_title: 'Legal Challenges for Youth Ventures',
        uploader: 'Priyanka',
        date: '2024-09-20',
        citations: [
          {
            cite_id: 'cite-011',
            quote: 'Legal incorporation fees alone can cost €2,000-€5,000, which is impossible for bootstrapped youth.',
            speaker: 'Legal Expert',
            timestamp: '11:30',
            context: 'Cost barriers for youth venture registration'
          }
        ]
      }
    ]
  }
];

// Ecosystem Support Proposals
const ecosystemProposals: InsightItem[] = [
  {
    id: 'prop-eco-001',
    canonical_text: 'Establish a global youth-mentor matching platform',
    type: 'proposal',
    pillar: 'ecosystem_support',
    count: 13,
    weighted_count: 17.4,
    last_seen: '2025-01-06',
    aliases_count: 3,
    aliases: [
      'Create mentor-matching system for youth',
      'Launch digital platform connecting youth with mentors',
      'Build global mentorship network'
    ],
    breakdowns: {
      by_region: [
        { region: 'Global', count: 8 },
        { region: 'Ethiopia', count: 3 },
        { region: 'Austria', count: 2 }
      ],
      by_year: [
        { year: 2025, count: 5 },
        { year: 2024, count: 8 }
      ],
      by_stakeholder: [
        { name: 'Reach for Change', count: 6 },
        { name: 'Ashoka', count: 4 },
        { name: 'Young Founders', count: 3 }
      ]
    },
    supporting_docs: [
      {
        doc_id: 'doc-2025-01-03-009',
        doc_title: 'Ecosystem Needs Assessment',
        uploader: 'Marija Mazic',
        date: '2025-01-03',
        citations: [
          {
            cite_id: 'cite-012',
            quote: 'A digital platform could match youth with mentors based on sector, geography, and language.',
            speaker: 'Marija Mazic',
            timestamp: '10:30',
            context: 'Proposed solution for mentorship gap'
          }
        ]
      }
    ]
  },
  {
    id: 'prop-eco-002',
    canonical_text: 'Offer pro-bono legal clinics specifically for youth social ventures',
    type: 'proposal',
    pillar: 'ecosystem_support',
    count: 8,
    weighted_count: 10.1,
    last_seen: '2024-12-05',
    aliases_count: 2,
    aliases: [
      'Provide free legal services for young entrepreneurs',
      'Create youth-focused legal support program'
    ],
    breakdowns: {
      by_region: [
        { region: 'Austria', count: 4 },
        { region: 'Ethiopia', count: 2 },
        { region: 'Kenya', count: 2 }
      ],
      by_year: [
        { year: 2024, count: 8 }
      ],
      by_stakeholder: [
        { name: 'Social Impact Award', count: 4 },
        { name: 'Law Firms', count: 2 },
        { name: 'Young Founders', count: 2 }
      ]
    },
    supporting_docs: [
      {
        doc_id: 'doc-2024-09-20-011',
        doc_title: 'Legal Challenges for Youth Ventures',
        uploader: 'Priyanka',
        date: '2024-09-20',
        citations: [
          {
            cite_id: 'cite-013',
            quote: 'Pro-bono legal clinics could reduce incorporation costs by 90% and empower youth to formalize.',
            speaker: 'Legal Expert',
            timestamp: '12:15',
            context: 'Proposed pro-bono legal support model'
          }
        ]
      }
    ]
  }
];

// Wellbeing & Recognition Problems
const wellbeingProblems: InsightItem[] = [
  {
    id: 'prob-well-001',
    canonical_text: 'Youth innovators experience burnout due to lack of support systems',
    type: 'problem',
    pillar: 'wellbeing_recognition',
    count: 17,
    weighted_count: 22.8,
    last_seen: '2025-01-07',
    aliases_count: 5,
    aliases: [
      'Young social entrepreneurs face mental health challenges',
      'Burnout is widespread among youth innovators',
      'Youth lack emotional support while building ventures',
      'Mental health crisis in youth innovation sector',
      'Young founders overwhelmed without support'
    ],
    breakdowns: {
      by_region: [
        { region: 'Ethiopia', count: 8 },
        { region: 'Kenya', count: 5 },
        { region: 'Austria', count: 4 }
      ],
      by_year: [
        { year: 2025, count: 6 },
        { year: 2024, count: 10 },
        { year: 2023, count: 1 }
      ],
      by_stakeholder: [
        { name: 'Young Founders', count: 11 },
        { name: 'Mental Health Organizations', count: 4 },
        { name: 'Reach for Change', count: 2 }
      ]
    },
    supporting_docs: [
      {
        doc_id: 'doc-2024-12-18-012',
        doc_title: 'Wellbeing Workshop - Addis Ababa',
        uploader: 'Hristina Popova',
        date: '2024-12-18',
        citations: [
          {
            cite_id: 'cite-014',
            quote: '73% of young social entrepreneurs report experiencing burnout in their first two years.',
            speaker: 'Wellbeing Researcher',
            timestamp: '13:45',
            context: 'Research on youth mental health in entrepreneurship'
          },
          {
            cite_id: 'cite-015',
            quote: 'We work 80-hour weeks with no one to talk to about the emotional toll.',
            speaker: 'Young Founder',
            timestamp: '14:20',
            context: 'Personal testimony on isolation and stress'
          }
        ]
      }
    ]
  },
  {
    id: 'prob-well-002',
    canonical_text: 'Youth contributions to social change are not acknowledged by mainstream media',
    type: 'problem',
    pillar: 'wellbeing_recognition',
    count: 14,
    weighted_count: 18.9,
    last_seen: '2024-12-25',
    aliases_count: 4,
    aliases: [
      'Media ignores youth-led social innovation',
      'Young changemakers invisible in public discourse',
      'Youth achievements not celebrated in press',
      'Lack of visibility for youth innovators'
    ],
    breakdowns: {
      by_region: [
        { region: 'Global', count: 6 },
        { region: 'Ethiopia', count: 4 },
        { region: 'Austria', count: 4 }
      ],
      by_year: [
        { year: 2024, count: 12 },
        { year: 2023, count: 2 }
      ],
      by_stakeholder: [
        { name: 'Young Founders', count: 8 },
        { name: 'Media Organizations', count: 3 },
        { name: 'Ashoka', count: 3 }
      ]
    },
    supporting_docs: [
      {
        doc_id: 'doc-2024-11-10-014',
        doc_title: 'Recognition & Visibility Roundtable',
        uploader: 'Carlos',
        date: '2024-11-10',
        citations: [
          {
            cite_id: 'cite-016',
            quote: 'Youth-led initiatives get less than 5% of media coverage compared to established organizations.',
            speaker: 'Media Analyst',
            timestamp: '15:30',
            context: 'Analysis of media representation of youth innovators'
          }
        ]
      }
    ]
  },
  {
    id: 'prob-well-003',
    canonical_text: 'Peer support networks for youth social entrepreneurs are fragmented',
    type: 'problem',
    pillar: 'wellbeing_recognition',
    count: 10,
    weighted_count: 12.7,
    last_seen: '2024-12-08',
    aliases_count: 3,
    aliases: [
      'Youth innovators lack peer communities',
      'No cohesive network for young social entrepreneurs',
      'Fragmented support among youth founders'
    ],
    breakdowns: {
      by_region: [
        { region: 'Ethiopia', count: 5 },
        { region: 'Kenya', count: 3 },
        { region: 'Austria', count: 2 }
      ],
      by_year: [
        { year: 2024, count: 10 }
      ],
      by_stakeholder: [
        { name: 'Young Founders', count: 7 },
        { name: 'Reach for Change', count: 3 }
      ]
    },
    supporting_docs: [
      {
        doc_id: 'doc-2024-10-15-016',
        doc_title: 'Peer Networks Discussion',
        uploader: 'Priyanka',
        date: '2024-10-15',
        citations: [
          {
            cite_id: 'cite-017',
            quote: 'We need spaces where we can share struggles and successes with others who understand.',
            speaker: 'Young Founder',
            timestamp: '16:00',
            context: 'Need for peer support systems'
          }
        ]
      }
    ]
  }
];

// Wellbeing & Recognition Proposals
const wellbeingProposals: InsightItem[] = [
  {
    id: 'prop-well-001',
    canonical_text: 'Launch a mental health support program tailored for youth social entrepreneurs',
    type: 'proposal',
    pillar: 'wellbeing_recognition',
    count: 12,
    weighted_count: 16.2,
    last_seen: '2025-01-05',
    aliases_count: 3,
    aliases: [
      'Create mental health services for young innovators',
      'Provide wellbeing support for youth founders',
      'Establish counseling program for youth entrepreneurs'
    ],
    breakdowns: {
      by_region: [
        { region: 'Ethiopia', count: 5 },
        { region: 'Kenya', count: 4 },
        { region: 'Austria', count: 3 }
      ],
      by_year: [
        { year: 2025, count: 4 },
        { year: 2024, count: 8 }
      ],
      by_stakeholder: [
        { name: 'Mental Health Organizations', count: 5 },
        { name: 'Reach for Change', count: 4 },
        { name: 'Young Founders', count: 3 }
      ]
    },
    supporting_docs: [
      {
        doc_id: 'doc-2024-12-18-012',
        doc_title: 'Wellbeing Workshop - Addis Ababa',
        uploader: 'Hristina Popova',
        date: '2024-12-18',
        citations: [
          {
            cite_id: 'cite-018',
            quote: 'Free counseling and peer support groups could reduce burnout by 40%.',
            speaker: 'Wellbeing Researcher',
            timestamp: '15:00',
            context: 'Proposed mental health intervention'
          }
        ]
      }
    ]
  },
  {
    id: 'prop-well-002',
    canonical_text: 'Create an annual awards program celebrating youth-led social innovation',
    type: 'proposal',
    pillar: 'wellbeing_recognition',
    count: 10,
    weighted_count: 13.5,
    last_seen: '2024-12-22',
    aliases_count: 2,
    aliases: [
      'Establish youth innovation awards',
      'Launch recognition program for young changemakers'
    ],
    breakdowns: {
      by_region: [
        { region: 'Global', count: 5 },
        { region: 'Austria', count: 3 },
        { region: 'Ethiopia', count: 2 }
      ],
      by_year: [
        { year: 2024, count: 10 }
      ],
      by_stakeholder: [
        { name: 'Ashoka', count: 4 },
        { name: 'Social Impact Award', count: 3 },
        { name: 'Young Founders', count: 3 }
      ]
    },
    supporting_docs: [
      {
        doc_id: 'doc-2024-11-10-014',
        doc_title: 'Recognition & Visibility Roundtable',
        uploader: 'Carlos',
        date: '2024-11-10',
        citations: [
          {
            cite_id: 'cite-019',
            quote: 'An annual awards ceremony would amplify youth voices and attract media attention.',
            speaker: 'Ashoka Representative',
            timestamp: '16:15',
            context: 'Proposal for recognition program'
          }
        ]
      }
    ]
  },
  {
    id: 'prop-well-003',
    canonical_text: 'Build online peer support communities for youth entrepreneurs by region',
    type: 'proposal',
    pillar: 'wellbeing_recognition',
    count: 8,
    weighted_count: 10.4,
    last_seen: '2024-11-28',
    aliases_count: 2,
    aliases: [
      'Create regional online communities for youth',
      'Establish digital peer networks for young founders'
    ],
    breakdowns: {
      by_region: [
        { region: 'Ethiopia', count: 4 },
        { region: 'Kenya', count: 2 },
        { region: 'Austria', count: 2 }
      ],
      by_year: [
        { year: 2024, count: 8 }
      ],
      by_stakeholder: [
        { name: 'Young Founders', count: 5 },
        { name: 'Reach for Change', count: 3 }
      ]
    },
    supporting_docs: [
      {
        doc_id: 'doc-2024-10-15-016',
        doc_title: 'Peer Networks Discussion',
        uploader: 'Priyanka',
        date: '2024-10-15',
        citations: [
          {
            cite_id: 'cite-020',
            quote: 'WhatsApp or Slack groups organized by region could connect youth facing similar challenges.',
            speaker: 'Young Founder',
            timestamp: '16:45',
            context: 'Proposed peer support infrastructure'
          }
        ]
      }
    ]
  }
];

// Assemble pillar data
const pillarData: PillarData[] = [
  {
    pillar: 'capital_access',
    problems: capitalProblems,
    proposals: capitalProposals
  },
  {
    pillar: 'ecosystem_support',
    problems: ecosystemProblems,
    proposals: ecosystemProposals
  },
  {
    pillar: 'wellbeing_recognition',
    problems: wellbeingProblems,
    proposals: wellbeingProposals
  }
];

export const mockInsightsData: InsightsData = {
  pillars: pillarData
};

// Pillar configuration for UI
export const pillarConfigs = {
  capital_access: {
    id: 'capital_access' as const,
    name: 'Capital Access',
    color: '#0077B6',
    bgColor: '#E8F1F9',
    borderColor: '#0077B6',
    icon: '💰'
  },
  ecosystem_support: {
    id: 'ecosystem_support' as const,
    name: 'Ecosystem Support',
    color: '#C3B1E1',
    bgColor: '#F3EFFA',
    borderColor: '#C3B1E1',
    icon: '🌐'
  },
  wellbeing_recognition: {
    id: 'wellbeing_recognition' as const,
    name: 'Wellbeing & Recognition',
    color: '#A8E6CF',
    bgColor: '#F0FAF5',
    borderColor: '#A8E6CF',
    icon: '🌱'
  }
};
