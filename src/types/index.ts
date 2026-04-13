// ============================================================
// Module 1: Maturity Assessment
// ============================================================

export interface DimensionAssessment {
  tools: 0 | 1 | 2 | 3;
  data: 0 | 1 | 2 | 3;
  culture: 0 | 1 | 2 | 3;
}

export type DimensionKey =
  | 'socioCultural'
  | 'teachingLearning'
  | 'academicManagement'
  | 'administrativeManagement'
  | 'researchInnovation'
  | 'digitalGovernance'
  | 'institutionalImage'
  | 'universityExtension';

export interface CustomDimension {
  id: string;
  label: string;
  description: string;
  assessment: DimensionAssessment;
}

export interface MaturityAssessment {
  id?: string;
  group_id: string;
  participant_id?: string;
  dimensions: Record<DimensionKey, DimensionAssessment>;
  customDimensions?: CustomDimension[];
  hiddenDimensions?: DimensionKey[];
  created_at?: string;
  updated_at?: string;
}

// ============================================================
// Module 2: Stakeholder Resistance Mapping
// ============================================================

export type StakeholderRole = 'Students' | 'Professors' | 'Administration' | 'Direction';
export type Discipline = 'STEM' | 'Humanities' | 'Social Sciences' | 'Other';
export type ResistanceBehavior = 'supportive' | 'pronounced_refusal' | 'pronounced_opposing' | 'subtle_undermining' | 'subtle_avoiding';
export type AnxietyType = 'learning' | 'sociotechnical' | 'displacement' | 'ethical_engagement';
export type MissingLever = 'relative_advantage' | 'compatibility' | 'low_complexity';
export type PowerLevel = 'high' | 'low';
export type InterestLevel = 'high' | 'low';

export interface Stakeholder {
  id?: string;
  group_id: string;
  name: string;
  role: StakeholderRole;
  discipline?: Discipline;
  power?: PowerLevel;
  interest?: InterestLevel;
  behavior: ResistanceBehavior;
  anxiety: AnxietyType;
  missing_lever: MissingLever;
  notes?: string;
  generated_counter_measure?: string;
  created_at?: string;
}

export interface SelfDebrief {
  id?: string;
  participant_id: string;
  anxiety_experienced: 'learning' | 'sociotechnical' | 'displacement' | 'none';
  surprise: string;
  would_use_again: 'yes' | 'maybe' | 'no';
  created_at?: string;
}

// ============================================================
// Module 3: Solution Cards
// ============================================================

export type SolutionTarget = 'Students' | 'Professors' | 'Administration';
export type DifficultyLevel = 'Low' | 'Medium' | 'High';
export type SolutionStatus = 'Planned' | 'Prototyped' | 'Tested';

export interface SolutionCard {
  id?: string;
  group_id: string;
  name: string;
  target: SolutionTarget;
  difficulty: DifficultyLevel;
  status: SolutionStatus;
  problem_solved?: string;
  vibe_coding_notes?: string;
  platform_used?: string;
  assigned_phase?: 1 | 2 | 3;
  linked_quick_win?: string;
  sort_order: number;
  created_at?: string;
}

// ============================================================
// Module 4: 90-Day Plan
// ============================================================

export type PlanPhase = 1 | 2 | 3;
export type Priority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'Not Started' | 'In Progress' | 'Done';
export type KPIType = 'Leading' | 'Lagging';

export interface PlanTask {
  id?: string;
  group_id: string;
  name: string;
  phase: PlanPhase;
  champion_name?: string;
  champion_target?: SolutionTarget;
  priority: Priority;
  status: TaskStatus;
  source_solution_id?: string;
  sort_order: number;
  created_at?: string;
}

export interface KPI {
  id?: string;
  group_id: string;
  name: string;
  type: KPIType;
  target?: string;
  data_source?: string;
  responsible?: string;
  phase?: PlanPhase;
  created_at?: string;
}

// ============================================================
// AI Advisor
// ============================================================

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AIConversation {
  id?: string;
  group_id: string;
  participant_id?: string;
  module: 'module_1' | 'module_2' | 'module_3' | 'module_4' | 'general';
  messages: AIMessage[];
  created_at?: string;
  updated_at?: string;
}

// ============================================================
// Session & Group
// ============================================================

export interface Session {
  id: string;
  name: string;
  is_active: boolean;
  created_at?: string;
}

export type ConsensusStatus = 'none' | 'draft' | 'validated' | 'reopen_requested' | 'reopened';

export interface GroupMemberStatus {
  id: string;
  name: string;
  has_completed: boolean;
}

export interface GroupAssessmentData {
  members: GroupMemberStatus[];
  groupAverage: Record<DimensionKey, DimensionAssessment> | null;
  consensus: {
    dimensions: Record<DimensionKey, DimensionAssessment>;
    customDimensions: CustomDimension[];
    hiddenDimensions: DimensionKey[];
    updated_at?: string;
  } | null;
  consensusStatus: ConsensusStatus;
  completedCount: number;
  totalCount: number;
  validatedByName?: string | null;
  reopenRequestedByName?: string | null;
}

export interface Group {
  id: string;
  session_id: string;
  name: string;
  institution_name?: string;
  consensus_status?: ConsensusStatus;
  consensus_validated_at?: string;
  m2_consensus_status?: ConsensusStatus;
  m2_consensus_validated_at?: string;
  created_at?: string;
}

export interface GroupStakeholderData {
  members: GroupMemberStatus[];
  individualStakeholders: (Stakeholder & { participant_name: string })[];
  consensusStakeholders: Stakeholder[];
  consensusStatus: ConsensusStatus;
  validatorId: string | null;
  completedCount: number;
  totalCount: number;
}

export interface Participant {
  id: string;
  group_id: string;
  name: string;
  email?: string;
  role?: string;
  auth_user_id?: string;
  created_at?: string;
}

// ============================================================
// AI Usage Survey
// ============================================================

export type AIFrequency = 'never' | 'monthly' | 'weekly' | 'daily' | 'multiple_daily';
export type PaidVsFree = 'free_only' | 'mostly_free' | 'mix' | 'mostly_paid' | 'paid_only';

export interface AISurvey {
  id?: string;
  participant_id: string;
  session_id: string;
  models_count: number;
  models_used: string[];
  task_types: string[];
  frequency: AIFrequency;
  paid_vs_free: PaidVsFree;
  vibe_coding: string | null;
  created_at?: string;
}

// ============================================================
// App State
// ============================================================

export type ModuleId = 'module1' | 'module2' | 'module3' | 'module4';

export interface AppState {
  currentModule: ModuleId;
  group: Group | null;
  participant: Participant | null;
  session: Session | null;
}
