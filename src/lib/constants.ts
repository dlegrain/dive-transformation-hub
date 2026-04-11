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

export const MISSING_LEVERS = [
  { value: 'relative_advantage', label: 'Relative Advantage', description: 'They don\'t see how AI improves their work', source: 'Singh & Strzelecki, 2026' },
  { value: 'compatibility', label: 'Compatibility', description: 'AI doesn\'t fit their existing workflow', source: 'Singh & Strzelecki, 2026' },
  { value: 'low_complexity', label: 'Low Complexity', description: 'The tool feels too complicated to learn', source: 'Singh & Strzelecki, 2026' },
] as const;

export const STAKEHOLDER_ROLES = ['Students', 'Professors', 'Administration', 'Direction'] as const;
export const DISCIPLINES = ['STEM', 'Humanities', 'Social Sciences', 'Other'] as const;

// ============================================================
// Module 3: Solution templates
// ============================================================

export const SOLUTION_TEMPLATES = [
  { name: 'FAQ Chatbot', target: 'Students', difficulty: 'Low', problemSolved: 'AI-powered Q&A for common student inquiries' },
  { name: 'Quiz Generator', target: 'Professors', difficulty: 'Low', problemSolved: 'Auto-generate quizzes from lecture content' },
  { name: 'Writing Feedback Tool', target: 'Students', difficulty: 'Medium', problemSolved: 'AI writing assistant with plagiarism awareness' },
  { name: 'Research Paper Summarizer', target: 'Professors', difficulty: 'Medium', problemSolved: 'Summarize and analyze research papers' },
  { name: 'Enrollment Predictor', target: 'Administration', difficulty: 'High', problemSolved: 'Predict enrollment trends from historical data' },
  { name: 'Curriculum Recommender', target: 'Professors', difficulty: 'High', problemSolved: 'AI-driven curriculum gap analysis' },
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
];
