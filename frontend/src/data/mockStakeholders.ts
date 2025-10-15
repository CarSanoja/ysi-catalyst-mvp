/**
 * Mock Data for Stakeholder Directory
 * Realistic stakeholder records and associated notes
 */

import { Stakeholder, Note } from '../types/stakeholder';

export const mockStakeholders: Stakeholder[] = [
  {
    id: 'stk-001',
    name: 'Hristina Popova',
    role: 'Program Director',
    organization: 'Reach for Change',
    type: 'funder',
    region: 'Global',
    email: 'hristina@reachforchange.org',
    phone: '+46 70 123 4567',
    bio: 'Leading Reach for Change\'s global strategy to support youth-led social innovation. 10+ years experience in impact investing and nonprofit management.',
    tags: ['Youth Innovation', 'Impact Investing', 'Capacity Building'],
    links: [
      { label: 'LinkedIn', url: 'https://linkedin.com/in/hpopova' },
      { label: 'Reach for Change', url: 'https://reachforchange.org' }
    ],
    created_by: 'admin',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-12-20T14:30:00Z'
  },
  {
    id: 'stk-002',
    name: 'Marija Mazic',
    role: 'Senior Program Manager',
    organization: 'Social Impact Award',
    type: 'implementer',
    region: 'Austria',
    email: 'marija@socialimpactaward.net',
    phone: '+43 664 123 4567',
    bio: 'Managing the Social Impact Award program in Central and Eastern Europe. Expert in youth entrepreneurship ecosystems.',
    tags: ['Entrepreneurship', 'Education', 'Central Europe'],
    links: [
      { label: 'LinkedIn', url: 'https://linkedin.com/in/marijam' },
      { label: 'Social Impact Award', url: 'https://socialimpactaward.net' }
    ],
    created_by: 'admin',
    created_at: '2024-01-20T09:00:00Z',
    updated_at: '2025-01-05T16:00:00Z'
  },
  {
    id: 'stk-003',
    name: 'Abebe Tadesse',
    role: 'Founder & CEO',
    organization: 'Ethiopia Innovation Hub',
    type: 'community_leader',
    region: 'Ethiopia',
    email: 'abebe@ethinnohub.org',
    bio: 'Building Ethiopia\'s first innovation hub for young social entrepreneurs. Background in tech and sustainable development.',
    tags: ['Innovation', 'Tech for Good', 'Ethiopia'],
    links: [
      { label: 'Website', url: 'https://ethinnohub.org' }
    ],
    created_by: 'carlos',
    created_at: '2024-02-10T11:00:00Z',
    updated_at: '2024-11-30T10:00:00Z'
  },
  {
    id: 'stk-004',
    name: 'Dr. Amina Hassan',
    role: 'Research Lead',
    organization: 'African Youth Institute',
    type: 'researcher',
    region: 'Kenya',
    email: 'amina.hassan@ayi.org',
    phone: '+254 701 234 567',
    bio: 'PhD in Development Economics. Researching youth employment and social entrepreneurship in East Africa.',
    tags: ['Research', 'Youth Employment', 'East Africa'],
    links: [
      { label: 'LinkedIn', url: 'https://linkedin.com/in/aminahassan' },
      { label: 'Google Scholar', url: 'https://scholar.google.com/aminahassan' }
    ],
    created_by: 'priyanka',
    created_at: '2024-03-05T14:00:00Z',
    updated_at: '2024-12-15T09:30:00Z'
  },
  {
    id: 'stk-005',
    name: 'Johan Andersson',
    role: 'Head of Partnerships',
    organization: 'IKEA Foundation',
    type: 'funder',
    region: 'Global',
    email: 'johan.andersson@ikeafoundation.org',
    phone: '+31 20 123 4567',
    bio: 'Leading strategic partnerships for IKEA Foundation\'s youth and livelihoods portfolio. Focus on scalable solutions.',
    tags: ['Partnerships', 'Livelihoods', 'Scale'],
    links: [
      { label: 'LinkedIn', url: 'https://linkedin.com/in/johanand' },
      { label: 'IKEA Foundation', url: 'https://ikeafoundation.org' }
    ],
    created_by: 'admin',
    created_at: '2024-01-25T08:00:00Z',
    updated_at: '2025-01-08T11:00:00Z'
  },
  {
    id: 'stk-006',
    name: 'Priya Sharma',
    role: 'Youth Advocate',
    organization: 'Global Shapers Community',
    type: 'community_leader',
    region: 'India',
    email: 'priya.sharma@globalshapers.org',
    bio: 'Active Global Shaper advocating for youth mental health and wellbeing. Organizes community workshops and advocacy campaigns.',
    tags: ['Mental Health', 'Advocacy', 'Community Organizing'],
    links: [
      { label: 'LinkedIn', url: 'https://linkedin.com/in/priyasharma' }
    ],
    created_by: 'marija',
    created_at: '2024-04-12T13:00:00Z',
    updated_at: '2024-12-18T15:00:00Z'
  },
  {
    id: 'stk-007',
    name: 'Carlos Mendez',
    role: 'Impact Measurement Specialist',
    organization: 'Ashoka',
    type: 'researcher',
    region: 'Latin America',
    email: 'carlos.mendez@ashoka.org',
    phone: '+52 55 1234 5678',
    bio: 'Developing frameworks to measure social impact of youth-led ventures. Expert in theory of change and MEL systems.',
    tags: ['Impact Measurement', 'MEL', 'Theory of Change'],
    links: [
      { label: 'LinkedIn', url: 'https://linkedin.com/in/carlosmendez' },
      { label: 'Ashoka', url: 'https://ashoka.org' }
    ],
    created_by: 'hristina',
    created_at: '2024-02-28T10:00:00Z',
    updated_at: '2024-11-22T14:00:00Z'
  },
  {
    id: 'stk-008',
    name: 'Hon. Sarah Wanjiru',
    role: 'Member of Parliament',
    organization: 'Kenya National Assembly',
    type: 'policymaker',
    region: 'Kenya',
    email: 'swanjiru@parliament.go.ke',
    bio: 'Championing youth employment legislation. Chair of the Parliamentary Committee on Youth Affairs.',
    tags: ['Policy', 'Youth Employment', 'Legislation'],
    links: [
      { label: 'Parliament Profile', url: 'https://parliament.go.ke/wanjiru' }
    ],
    created_by: 'admin',
    created_at: '2024-03-20T09:00:00Z',
    updated_at: '2024-10-30T16:00:00Z'
  },
  {
    id: 'stk-009',
    name: 'Michael Chen',
    role: 'Mentor & Angel Investor',
    organization: 'Independent',
    type: 'mentor',
    region: 'Singapore',
    email: 'michael.chen@gmail.com',
    phone: '+65 9123 4567',
    bio: 'Serial entrepreneur with 3 successful exits. Mentoring early-stage social ventures in Asia. Angel investor focused on impact.',
    tags: ['Mentorship', 'Angel Investing', 'Entrepreneurship'],
    links: [
      { label: 'LinkedIn', url: 'https://linkedin.com/in/michaelchen' },
      { label: 'Personal Website', url: 'https://michaelchen.com' }
    ],
    created_by: 'carlos',
    created_at: '2024-05-10T12:00:00Z',
    updated_at: '2024-12-05T10:00:00Z'
  },
  {
    id: 'stk-010',
    name: 'Fatima Al-Mansouri',
    role: 'Director of Youth Programs',
    organization: 'UAE Ministry of Youth',
    type: 'policymaker',
    region: 'United Arab Emirates',
    email: 'fatima.almansouri@moy.gov.ae',
    bio: 'Designing national youth development policies. Leading UAE Youth Council initiatives.',
    tags: ['Policy', 'Government', 'Youth Development'],
    links: [
      { label: 'Ministry Website', url: 'https://moy.gov.ae' }
    ],
    created_by: 'admin',
    created_at: '2024-06-01T08:00:00Z',
    updated_at: '2024-12-01T13:00:00Z'
  },
  {
    id: 'stk-011',
    name: 'Lena Müller',
    role: 'Program Officer',
    organization: 'Robert Bosch Stiftung',
    type: 'funder',
    region: 'Germany',
    email: 'lena.mueller@bosch-stiftung.de',
    phone: '+49 711 123 4567',
    bio: 'Managing grants for youth civic engagement programs across Europe. Focus on democracy and participation.',
    tags: ['Grantmaking', 'Civic Engagement', 'Europe'],
    links: [
      { label: 'LinkedIn', url: 'https://linkedin.com/in/lenamueller' },
      { label: 'Bosch Stiftung', url: 'https://bosch-stiftung.de' }
    ],
    created_by: 'marija',
    created_at: '2024-07-15T11:00:00Z',
    updated_at: '2024-12-28T15:00:00Z'
  },
  {
    id: 'stk-012',
    name: 'Dr. James Omondi',
    role: 'Senior Lecturer',
    organization: 'University of Nairobi',
    type: 'researcher',
    region: 'Kenya',
    email: 'j.omondi@uonbi.ac.ke',
    bio: 'Teaching and researching social entrepreneurship. Published 20+ papers on youth innovation ecosystems in Africa.',
    tags: ['Academia', 'Research', 'Social Entrepreneurship'],
    links: [
      { label: 'University Profile', url: 'https://uonbi.ac.ke/omondi' },
      { label: 'ResearchGate', url: 'https://researchgate.net/profile/james-omondi' }
    ],
    created_by: 'priyanka',
    created_at: '2024-08-20T09:00:00Z',
    updated_at: '2024-11-10T14:00:00Z'
  },
  {
    id: 'stk-013',
    name: 'Ana Silva',
    role: 'Co-founder',
    organization: 'Youth Co:Lab',
    type: 'implementer',
    region: 'Brazil',
    email: 'ana.silva@youthcolab.org',
    bio: 'Building Youth Co:Lab Brazil to accelerate social innovation. Expert in design thinking and participatory methods.',
    tags: ['Social Innovation', 'Design Thinking', 'Brazil'],
    links: [
      { label: 'Youth Co:Lab', url: 'https://youthcolab.org' }
    ],
    created_by: 'carlos',
    created_at: '2024-09-05T10:00:00Z',
    updated_at: '2024-12-20T11:00:00Z'
  },
  {
    id: 'stk-014',
    name: 'David Kimani',
    role: 'Executive Director',
    organization: 'Kenya Youth Foundation',
    type: 'community_leader',
    region: 'Kenya',
    email: 'david@kenyayouth.org',
    phone: '+254 720 123 456',
    bio: 'Leading grassroots youth empowerment programs in Nairobi. Focus on skills training and job placement.',
    tags: ['Youth Empowerment', 'Skills Training', 'Kenya'],
    links: [
      { label: 'LinkedIn', url: 'https://linkedin.com/in/davidkimani' },
      { label: 'Foundation Website', url: 'https://kenyayouth.org' }
    ],
    created_by: 'admin',
    created_at: '2024-10-01T08:00:00Z',
    updated_at: '2025-01-03T09:00:00Z'
  },
  {
    id: 'stk-015',
    name: 'Sophie Laurent',
    role: 'Capacity Building Coach',
    organization: 'Yunus Social Business',
    type: 'mentor',
    region: 'France',
    email: 'sophie.laurent@yunussb.com',
    bio: 'Coaching young social entrepreneurs to build sustainable business models. Specializes in financial management and fundraising.',
    tags: ['Coaching', 'Capacity Building', 'Social Business'],
    links: [
      { label: 'LinkedIn', url: 'https://linkedin.com/in/sophielaurent' },
      { label: 'Yunus Social Business', url: 'https://yunussb.com' }
    ],
    created_by: 'hristina',
    created_at: '2024-11-12T13:00:00Z',
    updated_at: '2024-12-30T16:00:00Z'
  }
];

export const mockNotes: Note[] = [
  // Notes for Hristina Popova
  {
    id: 'note-001',
    stakeholder_id: 'stk-001',
    content: 'Met with Hristina to discuss potential partnership for youth innovation fund. She mentioned RfC could provide €50k seed funding for pilot.',
    created_by: 'carlos',
    created_at: '2024-12-15T14:30:00Z',
    updated_at: '2024-12-15T14:30:00Z'
  },
  {
    id: 'note-002',
    stakeholder_id: 'stk-001',
    content: 'Follow-up call scheduled for January 10. Need to prepare proposal deck with 3 pilot countries.',
    created_by: 'carlos',
    created_at: '2024-12-20T10:00:00Z',
    updated_at: '2024-12-20T10:00:00Z'
  },
  {
    id: 'note-003',
    stakeholder_id: 'stk-001',
    content: '**Update:** Hristina confirmed participation in Global Shapers convening in Vienna (March 2025). Great opportunity to present our work.',
    created_by: 'marija',
    created_at: '2025-01-08T09:15:00Z',
    updated_at: '2025-01-08T09:15:00Z'
  },
  // Notes for Marija Mazic
  {
    id: 'note-004',
    stakeholder_id: 'stk-002',
    content: 'Marija shared insights on Austria youth entrepreneurship landscape. Social Impact Award has 200+ alumni network we could tap into.',
    created_by: 'hristina',
    created_at: '2024-11-22T16:00:00Z',
    updated_at: '2024-11-22T16:00:00Z'
  },
  {
    id: 'note-005',
    stakeholder_id: 'stk-002',
    content: 'Discussed charter co-creation process. Marija suggested hosting workshop in Vienna targeting CEE shapers.',
    created_by: 'carlos',
    created_at: '2024-12-05T11:30:00Z',
    updated_at: '2024-12-05T11:30:00Z'
  },
  // Notes for Abebe Tadesse
  {
    id: 'note-006',
    stakeholder_id: 'stk-003',
    content: 'Abebe offered Ethiopia Innovation Hub as venue for Addis Ababa convening. Can host up to 50 participants.',
    created_by: 'priyanka',
    created_at: '2024-11-18T13:00:00Z',
    updated_at: '2024-11-18T13:00:00Z'
  },
  {
    id: 'note-007',
    stakeholder_id: 'stk-003',
    content: '**Action item:** Connect Abebe with local shapers for logistics planning.',
    created_by: 'priyanka',
    created_at: '2024-11-20T09:00:00Z',
    updated_at: '2024-11-20T09:00:00Z'
  },
  {
    id: 'note-008',
    stakeholder_id: 'stk-003',
    content: 'Venue confirmed for Feb 15-17. Abebe team will handle catering and AV setup.',
    created_by: 'carlos',
    created_at: '2024-11-30T10:00:00Z',
    updated_at: '2024-11-30T10:00:00Z'
  },
  // Notes for Dr. Amina Hassan
  {
    id: 'note-009',
    stakeholder_id: 'stk-004',
    content: 'Dr. Hassan shared preliminary research findings on youth capital access barriers in Kenya. Would be great input for policy pillar.',
    created_by: 'carlos',
    created_at: '2024-12-10T14:00:00Z',
    updated_at: '2024-12-10T14:00:00Z'
  },
  {
    id: 'note-010',
    stakeholder_id: 'stk-004',
    content: 'Invited Amina to present findings at our January convening. She accepted!',
    created_by: 'hristina',
    created_at: '2024-12-15T09:30:00Z',
    updated_at: '2024-12-15T09:30:00Z'
  },
  // Notes for Johan Andersson
  {
    id: 'note-011',
    stakeholder_id: 'stk-005',
    content: 'Johan expressed IKEA Foundation interest in supporting charter implementation phase. Potential €200k grant.',
    created_by: 'hristina',
    created_at: '2025-01-05T11:00:00Z',
    updated_at: '2025-01-05T11:00:00Z'
  },
  {
    id: 'note-012',
    stakeholder_id: 'stk-005',
    content: 'Need to submit concept note by Feb 1. Johan will intro us to IKEA grant committee.',
    created_by: 'hristina',
    created_at: '2025-01-08T11:00:00Z',
    updated_at: '2025-01-08T11:00:00Z'
  },
  // Notes for Priya Sharma
  {
    id: 'note-013',
    stakeholder_id: 'stk-006',
    content: 'Priya volunteered to lead wellbeing & mental health pillar working group. Amazing energy!',
    created_by: 'marija',
    created_at: '2024-12-01T15:00:00Z',
    updated_at: '2024-12-01T15:00:00Z'
  },
  {
    id: 'note-014',
    stakeholder_id: 'stk-006',
    content: 'Priya organized mental health workshop for Global Shapers Mumbai Hub - 80 attendees, very positive feedback.',
    created_by: 'marija',
    created_at: '2024-12-18T15:00:00Z',
    updated_at: '2024-12-18T15:00:00Z'
  },
  // Notes for Carlos Mendez
  {
    id: 'note-015',
    stakeholder_id: 'stk-007',
    content: 'Carlos M. offered to help design MEL framework for charter implementation. He has templates we can adapt.',
    created_by: 'carlos',
    created_at: '2024-11-20T10:00:00Z',
    updated_at: '2024-11-20T10:00:00Z'
  },
  {
    id: 'note-016',
    stakeholder_id: 'stk-007',
    content: 'Received MEL framework draft from Carlos. Need to review and provide feedback by Dec 1.',
    created_by: 'hristina',
    created_at: '2024-11-22T14:00:00Z',
    updated_at: '2024-11-22T14:00:00Z'
  },
  // Notes for Hon. Sarah Wanjiru
  {
    id: 'note-017',
    stakeholder_id: 'stk-008',
    content: 'Hon. Wanjiru invited us to present charter findings to Parliamentary Committee in March.',
    created_by: 'priyanka',
    created_at: '2024-10-25T16:00:00Z',
    updated_at: '2024-10-25T16:00:00Z'
  },
  {
    id: 'note-018',
    stakeholder_id: 'stk-008',
    content: 'Parliament presentation confirmed for March 12. Need to prepare 15min deck + Q&A.',
    created_by: 'priyanka',
    created_at: '2024-10-30T16:00:00Z',
    updated_at: '2024-10-30T16:00:00Z'
  },
  // Notes for Michael Chen
  {
    id: 'note-019',
    stakeholder_id: 'stk-009',
    content: 'Michael mentored 3 young founders from our network. They said his feedback on business models was invaluable.',
    created_by: 'carlos',
    created_at: '2024-11-30T10:00:00Z',
    updated_at: '2024-11-30T10:00:00Z'
  },
  {
    id: 'note-020',
    stakeholder_id: 'stk-009',
    content: 'Michael willing to do monthly office hours for our entrepreneur cohort. Great resource!',
    created_by: 'carlos',
    created_at: '2024-12-05T10:00:00Z',
    updated_at: '2024-12-05T10:00:00Z'
  },
  // Notes for Fatima Al-Mansouri
  {
    id: 'note-021',
    stakeholder_id: 'stk-010',
    content: 'Fatima shared UAE national youth strategy document. Some alignment with charter pillars.',
    created_by: 'marija',
    created_at: '2024-11-28T13:00:00Z',
    updated_at: '2024-11-28T13:00:00Z'
  },
  {
    id: 'note-022',
    stakeholder_id: 'stk-010',
    content: 'UAE Ministry interested in co-hosting regional convening in Dubai. Budget available!',
    created_by: 'hristina',
    created_at: '2024-12-01T13:00:00Z',
    updated_at: '2024-12-01T13:00:00Z'
  },
  // Notes for Lena Müller
  {
    id: 'note-023',
    stakeholder_id: 'stk-011',
    content: 'Lena mentioned Bosch Stiftung has open call for youth civic engagement projects (deadline Jan 31).',
    created_by: 'marija',
    created_at: '2024-12-20T15:00:00Z',
    updated_at: '2024-12-20T15:00:00Z'
  },
  {
    id: 'note-024',
    stakeholder_id: 'stk-011',
    content: 'Call with Lena scheduled for Jan 15 to discuss application strategy.',
    created_by: 'marija',
    created_at: '2024-12-28T15:00:00Z',
    updated_at: '2024-12-28T15:00:00Z'
  },
  // Notes for Dr. James Omondi
  {
    id: 'note-025',
    stakeholder_id: 'stk-012',
    content: 'Dr. Omondi offered to have his graduate students help with charter data analysis. Free research support!',
    created_by: 'priyanka',
    created_at: '2024-11-05T14:00:00Z',
    updated_at: '2024-11-05T14:00:00Z'
  },
  {
    id: 'note-026',
    stakeholder_id: 'stk-012',
    content: '3 masters students assigned to analyze session transcripts. Results expected by Jan 20.',
    created_by: 'priyanka',
    created_at: '2024-11-10T14:00:00Z',
    updated_at: '2024-11-10T14:00:00Z'
  },
  // Notes for Ana Silva
  {
    id: 'note-027',
    stakeholder_id: 'stk-013',
    content: 'Ana shared Youth Co:Lab design thinking toolkit. We should adapt for our workshops.',
    created_by: 'carlos',
    created_at: '2024-12-18T11:00:00Z',
    updated_at: '2024-12-18T11:00:00Z'
  },
  {
    id: 'note-028',
    stakeholder_id: 'stk-013',
    content: 'Exploring partnership with Youth Co:Lab Brazil for Latin America charter roll-out.',
    created_by: 'carlos',
    created_at: '2024-12-20T11:00:00Z',
    updated_at: '2024-12-20T11:00:00Z'
  },
  // Notes for David Kimani
  {
    id: 'note-029',
    stakeholder_id: 'stk-014',
    content: 'David connected us with 15 youth leaders from Nairobi slums. Rich perspectives on capital access barriers.',
    created_by: 'priyanka',
    created_at: '2025-01-02T09:00:00Z',
    updated_at: '2025-01-02T09:00:00Z'
  },
  {
    id: 'note-030',
    stakeholder_id: 'stk-014',
    content: 'Follow-up community dialogue planned for Feb 5 at Kenya Youth Foundation office.',
    created_by: 'priyanka',
    created_at: '2025-01-03T09:00:00Z',
    updated_at: '2025-01-03T09:00:00Z'
  },
  // Notes for Sophie Laurent
  {
    id: 'note-031',
    stakeholder_id: 'stk-015',
    content: 'Sophie delivered capacity building workshop for 12 young entrepreneurs. Topics: financial modeling, pitch deck, fundraising strategy.',
    created_by: 'hristina',
    created_at: '2024-12-28T16:00:00Z',
    updated_at: '2024-12-28T16:00:00Z'
  },
  {
    id: 'note-032',
    stakeholder_id: 'stk-015',
    content: 'Participants rated Sophie workshop 4.8/5. Requesting more sessions on investor relations.',
    created_by: 'hristina',
    created_at: '2024-12-30T16:00:00Z',
    updated_at: '2024-12-30T16:00:00Z'
  }
];

// Helper function to get notes for a specific stakeholder
export function getNotesByStakeholderId(stakeholderId: string): Note[] {
  return mockNotes
    .filter(note => note.stakeholder_id === stakeholderId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

// Helper function to get unique regions
export function getUniqueRegions(): string[] {
  const regions = mockStakeholders.map(s => s.region);
  return Array.from(new Set(regions)).sort();
}
