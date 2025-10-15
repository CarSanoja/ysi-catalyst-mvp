import { GlobalShaper, ProcessedDocument } from '../types';

export const mockGlobalShapers: GlobalShaper[] = [
  {
    id: 's1',
    name: 'Amara Chen',
    region: 'Asia Pacific',
    focusArea: 'Capital Access',
    photo: 'https://images.unsplash.com/photo-1758600587728-9bde755354ad?w=400&h=400&fit=crop',
    bio: 'Financial inclusion advocate working to democratize access to startup funding',
  },
  {
    id: 's2',
    name: 'Marcus Johnson',
    region: 'North America',
    focusArea: 'Recognition',
    photo: 'https://images.unsplash.com/photo-1711993429293-5f2abb9fd250?w=400&h=400&fit=crop',
    bio: 'Building credentialing systems for social innovators',
  },
  {
    id: 's3',
    name: 'Sofia Rodriguez',
    region: 'Latin America',
    focusArea: 'Wellbeing',
    photo: 'https://images.unsplash.com/photo-1758874573370-e5496b20794b?w=400&h=400&fit=crop',
    bio: 'Mental health advocate for young entrepreneurs',
  },
  {
    id: 's4',
    name: 'Kwame Osei',
    region: 'Africa',
    focusArea: 'Capital Access',
    photo: 'https://images.unsplash.com/photo-1591605823835-978f3c41940f?w=400&h=400&fit=crop',
    bio: 'Connecting African youth innovators with global funding opportunities',
  },
  {
    id: 's5',
    name: 'Priya Sharma',
    region: 'South Asia',
    focusArea: 'Wellbeing',
    photo: 'https://images.unsplash.com/photo-1758876202676-6dcc77aeaa70?w=400&h=400&fit=crop',
    bio: 'Creating sustainable work practices for social ventures',
  },
  {
    id: 's6',
    name: 'Emma Wilson',
    region: 'Europe',
    focusArea: 'Recognition',
    photo: 'https://images.unsplash.com/photo-1681070909604-f555aa006564?w=400&h=400&fit=crop',
    bio: 'Policy researcher focused on youth innovation frameworks',
  },
  {
    id: 's7',
    name: 'Carlos Santos',
    region: 'Latin America',
    focusArea: 'Capital Access',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    bio: 'Impact investing specialist for emerging markets',
  },
  {
    id: 's8',
    name: 'Yuki Tanaka',
    region: 'Asia Pacific',
    focusArea: 'Recognition',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    bio: 'Building digital platforms for youth social impact verification',
  },
  {
    id: 's9',
    name: 'Leila Hassan',
    region: 'Middle East',
    focusArea: 'Wellbeing',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    bio: 'Community wellbeing coordinator for innovation hubs',
  },
  {
    id: 's10',
    name: 'Oliver Schmidt',
    region: 'Europe',
    focusArea: 'Capital Access',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    bio: 'Designing accessible grant application frameworks',
  },
  {
    id: 's11',
    name: 'Fatima Al-Rashid',
    region: 'Middle East',
    focusArea: 'Recognition',
    photo: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop',
    bio: 'Advocating for regional recognition of social innovation',
  },
  {
    id: 's12',
    name: 'James Omondi',
    region: 'Africa',
    focusArea: 'Wellbeing',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
    bio: 'Peer support network builder for social entrepreneurs',
  },
  {
    id: 's13',
    name: 'Maya Patel',
    region: 'South Asia',
    focusArea: 'Capital Access',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
    bio: 'Microfinance innovator for youth-led ventures',
  },
  {
    id: 's14',
    name: 'Diego Fernandez',
    region: 'Latin America',
    focusArea: 'Recognition',
    photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop',
    bio: 'Creating impact measurement standards for youth initiatives',
  },
  {
    id: 's15',
    name: 'Aisha Mohammed',
    region: 'Africa',
    focusArea: 'Wellbeing',
    photo: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop',
    bio: 'Mental health resource developer for innovators',
  },
  {
    id: 's16',
    name: 'Liam O\'Connor',
    region: 'North America',
    focusArea: 'Capital Access',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    bio: 'Angel investment network coordinator for social ventures',
  },
];

export const mockProcessedDocuments: ProcessedDocument[] = [
  {
    id: 'd1',
    title: 'Capital Access Workshop - Asia Pacific Region',
    date: '2025-10-05',
    uploader: 'Amara Chen',
    mainTheme: 'Funding Barriers',
    sentiment: 'positive',
    relatedShapers: ['s1', 's5', 's8'],
    insights: {
      id: 'i1',
      mainTheme: 'Breaking Down Capital Access Barriers',
      subthemes: ['Grant simplification', 'Mentorship networks', 'Regional coordination'],
      keyActors: ['Amara Chen', 'Priya Sharma', 'Yuki Tanaka'],
      generalPerception: 'positive',
      proposedActions: [
        'Develop simplified grant application template',
        'Launch pilot mentorship matching program',
        'Create regional funding database',
      ],
      challenges: [
        'Language barriers in applications',
        'Limited mentorship availability',
        'Fragmented funding landscape',
      ],
      opportunities: [
        'Regional collaboration potential',
        'Digital platform development',
        'Cross-cultural learning exchanges',
      ],
      rawText: `Capital Access Workshop - Asia Pacific Region
October 5, 2025

ATTENDEES:
- Amara Chen (Financial Inclusion Advocate, Singapore)
- Priya Sharma (Sustainable Work Practices, India)
- Yuki Tanaka (Digital Platforms, Japan)
- 15 other regional stakeholders

DISCUSSION SUMMARY:

The workshop focused on identifying and addressing critical barriers preventing youth-led social ventures from accessing capital in the Asia-Pacific region. Key points raised:

1. GRANT APPLICATION COMPLEXITY
Participants unanimously agreed that current grant applications are overly complex, requiring extensive documentation that many young innovators struggle to provide. Language barriers compound this issue, particularly for non-English speaking applicants.

2. MENTORSHIP GAPS
While capital is essential, the lack of experienced mentors to guide youth through funding processes emerged as a significant challenge. Many promising projects fail not due to lack of merit, but due to poor application presentation.

3. REGIONAL COORDINATION
The funding landscape remains highly fragmented across countries, with limited coordination between regional funding bodies. This results in duplicated efforts and missed opportunities for collaboration.

PROPOSED SOLUTIONS:

The group developed several actionable proposals:
- Design a simplified, multilingual grant template that can be adapted across the region
- Launch a pilot mentorship matching program connecting experienced grant writers with youth innovators
- Create a centralized regional funding database to improve visibility of opportunities

POSITIVE OUTLOOK:

Despite challenges, participants expressed optimism about regional collaboration potential and the opportunity to develop digital platforms that could streamline the entire funding process. Cross-cultural learning exchanges were identified as a unique strength of the Asia-Pacific region.

Next steps include forming working groups for each proposed action, with implementation targets for Q1 2026.`,
      extractedAt: '2025-10-05T14:30:00Z',
    },
  },
  {
    id: 'd2',
    title: 'Recognition Framework Roundtable',
    date: '2025-10-08',
    uploader: 'Emma Wilson',
    mainTheme: 'Credentialing Systems',
    sentiment: 'neutral',
    relatedShapers: ['s2', 's6', 's11'],
    insights: {
      id: 'i2',
      mainTheme: 'Standardizing Youth Innovation Recognition',
      subthemes: ['Digital credentials', 'International standards', 'Institutional partnerships'],
      keyActors: ['Marcus Johnson', 'Emma Wilson', 'Fatima Al-Rashid'],
      generalPerception: 'neutral',
      proposedActions: [
        'Design certification framework prototype',
        'Engage educational institutions',
        'Pilot digital badge system',
      ],
      challenges: [
        'Lack of global standards',
        'Verification complexity',
        'Equity concerns in certification',
      ],
      opportunities: [
        'Blockchain for credentialing',
        'University partnerships',
        'Multi-tiered recognition system',
      ],
      rawText: `Recognition Framework Roundtable
October 8, 2025

PARTICIPANTS:
- Marcus Johnson (Credentialing Systems, USA)
- Emma Wilson (Policy Research, UK)
- Fatima Al-Rashid (Regional Recognition Advocate, UAE)
- Representatives from 8 educational institutions
- 12 innovation hub leaders

BACKGROUND:

This roundtable convened to address the critical gap in formal recognition systems for youth social innovators. Currently, traditional credentials fail to capture the unique skills and impact created by young changemakers working outside conventional frameworks.

KEY DISCUSSION POINTS:

1. LACK OF GLOBAL STANDARDS
The absence of internationally recognized standards for social innovation credentials creates barriers for youth seeking to leverage their experience across borders or in traditional educational/employment settings.

2. VERIFICATION CHALLENGES
Participants debated the complexity of verifying social impact claims. Unlike academic achievements, social innovation outcomes are often qualitative and context-dependent, making standardized verification difficult.

3. EQUITY AND ACCESS
Critical concerns were raised about ensuring that any recognition system remains accessible to innovators from all backgrounds, avoiding the creation of new barriers that favor those with existing privileges or networks.

PROPOSED FRAMEWORK ELEMENTS:

The group outlined a multi-tiered approach:

1. DIGITAL CERTIFICATION PROTOTYPE
Development of a flexible certification framework that can adapt to different types of social innovation while maintaining core standards for verification and quality.

2. INSTITUTIONAL PARTNERSHIPS
Engaging universities and employers to recognize and value social innovation credentials alongside traditional qualifications.

3. BLOCKCHAIN-ENABLED BADGES
Pilot program for tamper-proof digital badges that can be independently verified, with progressive levels of recognition based on impact scale and sustainability.

OPPORTUNITIES IDENTIFIED:

- Blockchain technology offers promising solutions for decentralized, verifiable credentialing
- Growing university interest in recognizing non-traditional learning pathways
- Potential for a multi-tiered system that accommodates various levels of achievement

CONCERNS AND NEXT STEPS:

While the group showed cautious optimism, concerns remain about standardization vs. flexibility, and ensuring equitable access. A working committee will develop a detailed framework proposal by December 2025, with pilot testing planned for early 2026.`,
      extractedAt: '2025-10-08T16:45:00Z',
    },
  },
  {
    id: 'd3',
    title: 'Wellbeing & Sustainability Workshop',
    date: '2025-10-10',
    uploader: 'Sofia Rodriguez',
    mainTheme: 'Mental Health Support',
    sentiment: 'positive',
    relatedShapers: ['s3', 's9', 's12', 's15'],
    insights: {
      id: 'i3',
      mainTheme: 'Preventing Burnout in Social Innovation',
      subthemes: ['Peer support', 'Mental health resources', 'Work-life balance'],
      keyActors: ['Sofia Rodriguez', 'Leila Hassan', 'James Omondi', 'Aisha Mohammed'],
      generalPerception: 'positive',
      proposedActions: [
        'Establish regional peer support communities',
        'Create wellbeing toolkit',
        'Integrate wellbeing into accelerator programs',
      ],
      challenges: [
        'Mental health stigma',
        'Resource constraints',
        'Geographic isolation',
      ],
      opportunities: [
        'Global peer network',
        'Partnership with mental health orgs',
        'Digital support platforms',
      ],
      rawText: `Wellbeing & Sustainability Workshop
October 10, 2025

FACILITATORS & PARTICIPANTS:
- Sofia Rodriguez (Mental Health Advocate, Colombia)
- Leila Hassan (Community Wellbeing, Jordan)
- James Omondi (Peer Support Network, Kenya)
- Aisha Mohammed (Mental Health Resources, Nigeria)
- 25 social entrepreneurs and hub coordinators from 4 continents

WORKSHOP OBJECTIVE:

Address the alarming burnout rates among young social entrepreneurs and develop sustainable wellbeing frameworks for the innovation ecosystem.

CRITICAL FINDINGS:

1. BURNOUT EPIDEMIC
Recent surveys reveal that 73% of young social entrepreneurs report experiencing burnout within their first 2 years of operation. The pressure to create impact while managing limited resources takes a severe toll on mental health.

2. STIGMA BARRIERS
Mental health stigma remains a significant obstacle, particularly in cultures where discussing psychological wellbeing is taboo. Many entrepreneurs suffer in silence, fearing that acknowledging struggles will undermine their credibility or funding prospects.

3. RESOURCE SCARCITY
While awareness of mental health importance is growing, dedicated resources for social entrepreneurs remain scarce. Most accelerators and support programs focus exclusively on business development, neglecting the human dimension.

4. ISOLATION CHALLENGES
Geographic isolation compounds mental health challenges, with rural and remote innovators lacking access to both professional support and peer communities who understand their unique pressures.

PROPOSED INTERVENTIONS:

The workshop generated several concrete action items:

1. REGIONAL PEER SUPPORT COMMUNITIES
Establish continent-based peer support networks where entrepreneurs can share experiences and strategies in confidential, non-judgmental settings. These would operate both online and through quarterly regional gatherings.

2. WELLBEING TOOLKIT DEVELOPMENT
Create a comprehensive toolkit addressing:
- Stress management techniques adapted for resource-constrained environments
- Boundary-setting strategies for mission-driven work
- Early warning signs of burnout
- Accessible mental health resources by region

3. ACCELERATOR PROGRAM INTEGRATION
Work with existing accelerator programs to integrate wellbeing modules as core components, not optional add-ons. This includes mandatory rest periods, mental health check-ins, and burnout prevention training.

PARTNERSHIP OPPORTUNITIES:

Participants identified strong potential for partnerships with:
- Global mental health organizations seeking to expand youth entrepreneurship support
- Digital health platforms that could provide affordable teletherapy options
- Research institutions interested in studying social entrepreneur wellbeing

MOMENTUM AND COMMITMENT:

The energy in the room was notably positive, with participants expressing relief at finally addressing these "unspoken" challenges. There was unanimous commitment to making wellbeing a central pillar of social innovation support, not an afterthought.

The group established a working committee to develop detailed implementation plans for each intervention, with a goal of launching pilot programs by Q2 2026. Monthly virtual check-ins will ensure accountability and momentum.

CONCLUSION:

As Sofia Rodriguez noted in closing: "We cannot change the world if we're too burned out to show up. Wellbeing isn't a luxury—it's the foundation of sustainable impact."`,
      extractedAt: '2025-10-10T11:20:00Z',
    },
  },
];
