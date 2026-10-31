/* All page copy lives here. Sources: Rohit's "Fractional CHRO" deck, his LinkedIn profile,
   HR Katha (25 Nov 2022) and People Matters (21 Nov 2022). See sageverve-rohit-johar-brief.md.
   Nothing here is invented: no client names, no quotes that haven't been approved, no outcome guarantees. */

export const contact = {
  name: 'Rohit Johar',
  phone: '+91 98281 60555',
  phoneHref: 'tel:+919828160555',
  email: 'joharohit@gmail.com',
  mailto: 'mailto:joharohit@gmail.com?subject=Conversation%20with%20Rohit%20%C2%B7%20SageVerve',
  linkedin: 'https://www.linkedin.com/in/rohit-johar/',
  linkedinLabel: 'linkedin.com/in/rohit-johar',
  location: 'Gurugram, India',
};

export const nav = [
  { href: '#rohit', label: 'Rohit' },
  { href: '#approach', label: 'Approach' },
  { href: '#who', label: 'Who it’s for' },
  { href: '#engage', label: 'Engage' },
];

/* The hero's scroll story. Stage 0 is the hero itself; the scene starts fragmented. */
export const heroStages = [
  {
    key: 'fragmented',
    label: 'Fragmented',
    title: 'Every team is busy. Few are pulling the same way.',
    body: 'Talent, operations, leadership and culture each run their own agenda, in their own corner of the organisation.',
  },
  {
    key: 'aligned',
    label: 'Aligned',
    title: 'Structure connects the pieces.',
    body: 'Clear roles, decision rights and shared pathways, so work and people move across the organisation instead of around it.',
  },
  {
    key: 'leadership',
    label: 'Leadership',
    title: 'Leaders set one direction.',
    body: 'A real leadership cadence brings every team to the same table, working on the same few priorities.',
  },
  {
    key: 'performance',
    label: 'Performance',
    title: 'People strategy shows up as enterprise performance.',
    body: 'A connected organisation that scales, retains its best people and executes with discipline.',
  },
];

export const proof = [
  { value: 27, suffix: '+', label: 'Years leading people agendas' },
  { value: 50, suffix: 'K+', label: 'Employees supported at Amazon India & Genpact' },
  { value: 11, suffix: '', label: 'Countries under one HR strategy' },
  { value: 4, suffix: '', label: 'Global acquisitions integrated' },
  { value: 50, prefix: '$', suffix: 'M+', label: 'In transformation programmes led' },
];

export const employers = ['Amazon India', 'Genpact', 'Syneos Health', 'GE Capital', 'Goodricke Group'];

export const painPoints = [
  {
    title: 'More priorities than delivery capacity.',
    body: 'HR priorities outnumber the capacity to deliver them, which breeds initiative fatigue and weak governance.',
    motif: 'overflow',
  },
  {
    title: 'Workforce decisions without consistent discipline.',
    body: 'Critical people decisions get made on inconsistent data, unclear ownership and no real business case.',
    motif: 'scatter',
  },
  {
    title: 'Transformation activity without measurable outcomes.',
    body: 'Programmes move the activity metrics but never shift cost, productivity or talent risk.',
    motif: 'flatline',
  },
] as const;

export const phases = [
  {
    name: 'Diagnose',
    tag: 'See it clearly',
    body: 'Stakeholder interviews, baseline analytics, service pain points and strategic risk mapping.',
    motif: 'scan',
  },
  {
    name: 'Design',
    tag: 'Shape the system',
    body: 'Target operating model, role clarity, governance, process redesign and KPI architecture.',
    motif: 'grid',
  },
  {
    name: 'Mobilize',
    tag: 'Make it move',
    body: 'Transformation office, implementation roadmap, leadership cadence and change deployment.',
    motif: 'flow',
  },
  {
    name: 'Embed',
    tag: 'Make it stick',
    body: 'Capability handover, governance, value tracking and executive review mechanisms.',
    motif: 'rings',
  },
] as const;

export const segments = [
  {
    id: 'founder',
    label: 'Founder-led businesses',
    short: 'Founder-led',
    lede: 'Your first real people strategy, built for the company you are about to become.',
    points: [
      'Founder-to-professional transition',
      'A first people strategy',
      'Role clarity',
      'Hiring blueprint',
      'Culture and operating rhythms',
    ],
    shape: 'hub',
  },
  {
    id: 'scaling',
    label: 'Scaling businesses',
    short: 'Scaling',
    lede: 'Structure that keeps up with growth, and keeps your best people growing with you.',
    points: [
      'Management structure',
      'Performance frameworks',
      'Leadership development',
      'Retention',
      'Organisational capability',
    ],
    shape: 'tree',
  },
  {
    id: 'enterprise',
    label: 'Large enterprises',
    short: 'Enterprise',
    lede: 'Transformation at scale, from someone who has led it at Amazon India and Genpact.',
    points: [
      'Enterprise transformation',
      'Global workforce planning',
      'Talent management',
      'M&A integration',
      'Technology-supported HR mechanisms',
    ],
    shape: 'network',
  },
] as const;

export const moments = [
  {
    title: 'Founder to Professional',
    body: 'Install structure, decision rights and a management cadence as the business matures beyond its founders.',
    tags: ['Structure', 'Decision rights', 'Cadence'],
  },
  {
    title: 'Retention Stress',
    body: 'Find the real attrition drivers, lift manager effectiveness and strengthen the employee value proposition.',
    tags: ['Attrition drivers', 'Managers', 'EVP'],
  },
  {
    title: 'Post-Merger Integration',
    body: 'Align operating model, leadership, culture and people policies after an acquisition.',
    tags: ['Operating model', 'Culture', 'Policies'],
  },
  {
    title: 'People Systems Upgrade',
    body: 'Connect performance, rewards, skills and HR technology to the growth plan.',
    tags: ['Performance', 'Rewards', 'HR tech'],
  },
];

/* Career highlights. Years only where the source is solid (LinkedIn / press); otherwise left out. */
export const career = [
  {
    org: 'Syneos Health',
    years: '',
    role: 'Head of HR, APAC & Strategic Growth Hubs',
    detail: 'People strategy for growth and capability build-out across the region.',
    scale: '',
  },
  {
    org: 'Amazon India',
    years: 'From 2022',
    role: 'Director HR & Head of PXT',
    detail: 'Supported approximately 30,000 employees across seven verticals, leading engagement and experience transformation.',
    scale: '~30,000 employees',
  },
  {
    org: 'Genpact',
    years: '2012 – 2022',
    role: 'VP HR, Banking & Financial Services',
    detail:
      'HR strategy for 20,000 employees across 11 countries. Earlier: AVP, GE Capital & HR Site Leader, and VP, Digital Transformation & M&A.',
    scale: '20,000 employees · 11 countries',
  },
  {
    org: 'Transformation & M&A',
    years: '',
    role: 'Programme & integration leadership',
    detail: 'Led $50M+ transformation programmes and the functional integration of four global acquisitions across Israel, the US, the UK and Australia.',
    scale: '4 acquisitions · $50M+',
  },
  {
    org: 'Goodricke Group',
    years: 'From 1999',
    role: 'Manager HR → Head of HR',
    detail: 'Built talent and performance management across retail, plantation and corporate units in Kolkata.',
    scale: '',
  },
];

export const expertise = [
  'Organisation Design',
  'Leadership & Succession',
  'HR Transformation',
  'Culture & Change',
  'M&A Integration',
  'Workforce Planning',
];

/* Business value. Only research we can attribute is shown as a statistic; the deck's own
   ranges are labelled indicative. `lines` say which P&L lines a lever moves (illustrative). */
export const levers = [
  {
    id: 'org',
    name: 'Organisation design',
    body: 'Cleaner structures remove duplicated roles and slow decision paths, so cost and speed improve together.',
    lines: { revenue: 0, cost: -1, productivity: 1, risk: 0 },
    stat: { value: '15–25%', label: 'less role duplication from well-designed structures', source: 'Indicative range, SageVerve value framework', indicative: true },
  },
  {
    id: 'leaders',
    name: 'Leadership capability',
    body: 'Managers set the conditions people work in. Stronger leadership benches lift engagement and reduce talent risk.',
    lines: { revenue: 0, cost: 0, productivity: 1, risk: -1 },
    stat: { value: '70%', label: 'of the variance in team engagement is accounted for by the manager', source: 'Gallup, State of the American Manager', indicative: false },
  },
  {
    id: 'retention',
    name: 'Retention',
    body: 'Every regretted exit carries hiring, onboarding and lost-productivity costs that rarely appear as one line item.',
    lines: { revenue: 0, cost: -1, productivity: 0, risk: -1 },
    stat: { value: '0.5–2×', label: 'annual salary: the cost of replacing an individual employee', source: 'Gallup', indicative: false },
  },
  {
    id: 'productivity',
    name: 'Workforce productivity',
    body: 'Right roles, right capacity, right cadence: more output from the organisation you already have.',
    lines: { revenue: 1, cost: 0, productivity: 1, risk: 0 },
    stat: null,
  },
  {
    id: 'transformation',
    name: 'Transformation execution',
    body: 'Programmes that track business outcomes, not activity, actually shift cost and growth.',
    lines: { revenue: 1, cost: -1, productivity: 0, risk: 0 },
    stat: null,
  },
  {
    id: 'digital',
    name: 'HR digitisation',
    body: 'Technology-supported HR mechanisms take administrative effort out and put better data into decisions.',
    lines: { revenue: 0, cost: -1, productivity: 1, risk: 0 },
    stat: null,
  },
] as const;

export const plLines = [
  { key: 'revenue', label: 'Revenue growth' },
  { key: 'cost', label: 'Operating cost' },
  { key: 'productivity', label: 'Productivity' },
  { key: 'risk', label: 'Talent risk' },
] as const;

export const engagements = [
  {
    name: '30-60-90 Day Diagnostic',
    featured: true,
    solves: 'You know something in the organisation isn’t working, but not exactly what, where or why.',
    includes: ['Leadership interviews', 'Organisation scan', 'Priority roadmap tied to business outcomes'],
  },
  {
    name: 'Fractional CHRO Retainer',
    solves: 'You need senior people leadership now, without a premature full-time CHRO hire.',
    includes: ['CHRO partnering', 'Monthly operating reviews', 'Project sprints'],
  },
  {
    name: 'Interim CHRO',
    solves: 'A CHRO transition that can’t be allowed to stall governance, momentum or talent decisions.',
    includes: ['Transition coverage', 'Continuity of governance', 'Structured handover'],
  },
  {
    name: 'Board & CEO Advisory',
    solves: 'High-stakes people decisions that deserve an experienced, independent sounding board.',
    includes: ['Organisation design', 'Succession', 'M&A and culture'],
  },
];

/* Approved LinkedIn recommendation quotes go here: { quote, name, role, relation }.
   Leave empty until Rohit has written permission from each person. Nothing is shown for an empty list. */
export const testimonials: { quote: string; name: string; role: string; relation: string }[] = [];

export const press = {
  quote: 'A detail-oriented leader with excellent critical-thinking skills.',
  source: 'HR Katha',
  date: 'November 2022',
};

export const linkedinRecommendations = 35;

export const tickerLines = [
  'People first. Performance always.',
  'Structure creates momentum.',
  'Better decisions. Stronger organisations.',
  'Not another HR initiative.',
];
