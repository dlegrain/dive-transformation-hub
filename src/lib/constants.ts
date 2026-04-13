import type { DimensionKey } from '../types';

// ============================================================
// Module 1: Dimension definitions
// ============================================================

export const DIMENSIONS: {
  key: DimensionKey;
  label: string;
  description: string;
}[] = [
  {
    key: 'socioCultural',
    label: 'Socio-cultural',
    description: 'Digital social responsibility, community impact, sustainability',
  },
  {
    key: 'teachingLearning',
    label: 'Teaching & Learning',
    description: 'LMS, digital pedagogy, learning analytics, flexible spaces',
  },
  {
    key: 'academicManagement',
    label: 'Academic Management',
    description: 'Enrollment, student services, curriculum alignment',
  },
  {
    key: 'administrativeManagement',
    label: 'Administrative Management',
    description: 'HR, finance, workflow automation, real-time dashboards',
  },
  {
    key: 'researchInnovation',
    label: 'Research & Innovation',
    description: 'Digital research tools, patents, tech transfer, entrepreneurship',
  },
  {
    key: 'digitalGovernance',
    label: 'Digital Governance',
    description: 'Cybersecurity, data governance, Open Data, digital strategy',
  },
  {
    key: 'institutionalImage',
    label: 'Institutional Image & Marketing',
    description: 'Digital branding, CRM, competitor analysis, recruitment',
  },
  {
    key: 'universityExtension',
    label: 'University Extension',
    description: 'Community engagement, industry partnerships, knowledge transfer',
  },
];

export const SUB_CRITERIA = ['tools', 'data', 'culture'] as const;

export const SUB_CRITERIA_LABELS: Record<(typeof SUB_CRITERIA)[number], string> = {
  tools: 'Tools & Processes',
  data: 'Data',
  culture: 'Culture',
};

export const MATURITY_LEVELS = [
  { value: 0, label: "I don't know", color: '#9ca3af' },
  { value: 1, label: 'Beginner', color: '#ef4444' },
  { value: 2, label: 'In Progress', color: '#f59e0b' },
  { value: 3, label: 'Continuous Improvement', color: '#22c55e' },
] as const;

// ============================================================
// Institutions (fixed list for registration dropdown)
// ============================================================

export const INSTITUTIONS = [
  'National Economics University',
  'Tay Nguyen University',
  'Can Tho University',
  'University of Technology and Education - The University of Danang',
  'University of Economics and Law',
  'Ho Chi Minh City Open University',
  'University of Agriculture and Forestry - Hue University',
  'Nha Trang University',
  'Thai Nguyen University of Education',
  'Industrial University of Vinh',
] as const;

// ============================================================
// Module 2: Resistance taxonomy
// ============================================================

export const RESISTANCE_BEHAVIORS = [
  { value: 'supportive', label: 'Supportive / Champion', description: 'Actively supports AI adoption, willing to lead by example', severity: 'none' },
  { value: 'pronounced_refusal', label: 'Pronounced Refusal', description: 'Open opposition, vocal rejection', severity: 'high' },
  { value: 'pronounced_opposing', label: 'Pronounced Opposing', description: 'Active argumentation, ideological pushback', severity: 'high' },
  { value: 'subtle_undermining', label: 'Subtle Undermining', description: 'Passive sabotage, quiet non-compliance', severity: 'critical' },
  { value: 'subtle_avoiding', label: 'Subtle Avoiding', description: 'Minimization, deflection, "it\'s just a fad"', severity: 'critical' },
] as const;

export const ANXIETY_TYPES = [
  { value: 'learning', label: 'AI Learning Anxiety', description: 'Fear of not mastering the technology', source: 'Cao et al., 2026' },
  { value: 'sociotechnical', label: 'Sociotechnical Blindness', description: 'Fear of being marginalized by the institution', source: 'Cao et al., 2026' },
  { value: 'displacement', label: 'Job Displacement Anxiety', description: 'Fear of losing professional value and identity', source: 'Cao et al., 2026' },
  { value: 'ethical_engagement', label: 'Ethical & Pedagogical Barriers', description: 'Critical engagement with AI risks — this is an ASSET', source: 'Hong et al., 2026' },
] as const;

// Role-specific missing levers
export const MISSING_LEVERS_BY_ROLE = {
  Professors: [
    { value: 'relative_advantage', label: 'Relative Advantage', description: "They don't see how AI improves their specific tasks", source: 'Singh & Strzelecki, 2026' },
    { value: 'compatibility', label: 'Compatibility', description: "AI doesn't fit their existing teaching/research workflow", source: 'Singh & Strzelecki, 2026' },
    { value: 'low_complexity', label: 'Low Complexity', description: 'The tool feels too complicated to learn or use', source: 'Singh & Strzelecki, 2026' },
  ],
  Students: [
    { value: 'facilitating_conditions', label: 'Facilitating Conditions', description: 'No access, no devices, bad WiFi — practical barriers', source: 'Bui et al., 2025' },
    { value: 'social_influence', label: 'Social Influence', description: 'No peers or role models using AI around them', source: 'Bui et al., 2025' },
    { value: 'peer_success', label: 'Peer Success Stories', description: "They haven't seen students like them succeed with AI", source: 'Bui et al., 2025' },
  ],
  Direction: [
    { value: 'governance_gap', label: 'Governance Gap', description: 'No steering committee or digital strategy in place', source: 'Nguyen & Hong, 2025' },
    { value: 'budget_gap', label: 'Budget Gap', description: 'No dedicated budget or resource allocation for AI', source: 'Nguyen & Hong, 2025' },
    { value: 'strategic_vision', label: 'Strategic Vision', description: 'AI not integrated into the institution\'s long-term plan', source: 'Nguyen & Hong, 2025' },
  ],
  Administration: [
    { value: 'workload_overload', label: 'Workload Overload', description: 'Already overwhelmed — no bandwidth to learn new tools', source: 'Deacon et al., 2025' },
    { value: 'process_silos', label: 'Process Silos', description: 'Departments don\'t share data or systems', source: 'Deacon et al., 2025' },
    { value: 'legacy_rules', label: 'Legacy Rules', description: 'Internal policies written for paper, not digital', source: 'Deacon et al., 2025' },
  ],
} as const;

// Flat list of all levers (for display/lookup)
export const MISSING_LEVERS = [
  ...MISSING_LEVERS_BY_ROLE.Professors,
  ...MISSING_LEVERS_BY_ROLE.Students,
  ...MISSING_LEVERS_BY_ROLE.Direction,
  ...MISSING_LEVERS_BY_ROLE.Administration,
] as const;

export const STAKEHOLDER_ROLES = ['Students', 'Professors', 'Administration', 'Direction'] as const;
export const DISCIPLINES = ['STEM', 'Humanities', 'Social Sciences', 'Other'] as const;

export const POWER_LEVELS = [
  { value: 'high', label: 'High Power', description: 'Can make or block decisions (rector, dean, ministry)' },
  { value: 'low', label: 'Low Power', description: 'Limited formal authority (junior faculty, students, staff)' },
] as const;

export const INTEREST_LEVELS = [
  { value: 'high', label: 'High Interest', description: 'Directly affected by or invested in the change' },
  { value: 'low', label: 'Low Interest', description: 'Indifferent or unaware of the initiative' },
] as const;

// ============================================================
// Module 3: Solution templates
// ============================================================

export const SOLUTION_TEMPLATES = [
  { name: 'Welcome Guide Chatbot', target: 'Students', difficulty: 'Low', problemSolved: 'Answer new students\' questions about campus, rules, and procedures — just upload the student handbook as context' },
  { name: 'Study Buddy', target: 'Students', difficulty: 'Low', problemSolved: 'Help students revise a course by generating questions from the syllabus and providing explanations' },
  { name: 'Syllabus Generator', target: 'Professors', difficulty: 'Low', problemSolved: 'Generate a structured syllabus (objectives, weekly plan, assessments) from a course description' },
  { name: 'Rubric Builder', target: 'Professors', difficulty: 'Low', problemSolved: 'Generate detailed grading rubrics with criteria and levels from an assignment description' },
  { name: 'Email Drafter', target: 'Administration', difficulty: 'Low', problemSolved: 'Draft official communications (announcements, invitations, notices) from bullet points' },
  { name: 'Policy Q&A Bot', target: 'Administration', difficulty: 'Low', problemSolved: 'Answer staff and student questions about internal regulations — just upload the policy document as context' },
] as const;

// ============================================================
// Module 4: Phase definitions
// ============================================================

export const PLAN_PHASES = [
  {
    phase: 1,
    label: 'ACTIVATION',
    period: 'Days 1-30',
    objective: 'Infrastructure, leadership, unfreezing habits',
    color: '#3b82f6',
    questions: [
      'Who needs to authorize this initiative?',
      'What infrastructure is already in place?',
      'What quick wins can demonstrate value in week 1?',
    ],
  },
  {
    phase: 2,
    label: 'IMPLEMENTATION',
    period: 'Days 31-60',
    objective: 'Pedagogy, tool deployment, training',
    color: '#f59e0b',
    questions: [
      'Which training programs need to be created?',
      'Who delivers the training?',
      'How do you measure early adoption?',
    ],
  },
  {
    phase: 3,
    label: 'INSTITUTIONALIZATION',
    period: 'Days 61-90',
    objective: 'Quality assurance, KPIs, cultural integration',
    color: '#22c55e',
    questions: [
      'What KPIs demonstrate success?',
      'How does this become policy, not just a project?',
      'What governance structure sustains this beyond 90 days?',
    ],
  },
] as const;

// ============================================================
// References
// ============================================================

export const REFERENCES = [
  'Bravo-Jaico, J. et al. (2025). Model for assessing the maturity level of digital transformation in higher education institutions. Frontiers in Education.',
  'Bui, H. Q. et al. (2025). AI adoption: a new perspective from accounting students in Vietnam. Journal of Asian Business and Economic Studies.',
  'Cao, K. et al. (2026). AI anxiety and adoption intention in higher education based on an extended TAM-UTAUT. Scientific Reports.',
  'Deacon, B. et al. (2025). Resisting digital change at the university. European Journal of Higher Education.',
  'Hong, T. T. M. et al. (2026). Discovering acceptance and intention to use AI for learning among pre-service teachers in Vietnam. Discover Education.',
  'Nguyen, H. L., & Hong, Y. (2025). National policy analysis of digital transformation in Vietnamese higher education. Policy Futures in Education.',
  'Nguyen, N. D., & Uong, L. N. T. (2026). Digital transformation in non-public universities: evidence from Hanoi. Cogent Social Sciences.',
  'Singh, H., & Strzelecki, A. (2026). Adoption of generative AI by academics. Springer.',
  'Verano-Tacoronte, D. et al. (2025). Are university teachers ready for generative artificial intelligence? Unpacking faculty anxiety in the ChatGPT era. Education and Information Technologies.',
];
