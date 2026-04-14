import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type {
  DimensionKey,
  DimensionAssessment,
  CustomDimension,
  Stakeholder,
  SolutionCard,
  PlanTask,
  KPI,
  AIMessage,
  ConsensusStatus,
  PainPoint,
} from '../types';
import {
  sampleDimensions,
  sampleStakeholders,
  sampleSolutions,
  sampleTasks,
  sampleKpis,
} from './sample-data';

// ============================================================
// App-wide data store (shared across modules + AI Advisor)
// Persisted to localStorage automatically
// ============================================================

const STORAGE_KEY = 'dive-hub-data';

const defaultDimensions: Record<DimensionKey, DimensionAssessment> = {
  socioCultural: { tools: 1, data: 1, culture: 1 },
  teachingLearning: { tools: 1, data: 1, culture: 1 },
  academicManagement: { tools: 1, data: 1, culture: 1 },
  administrativeManagement: { tools: 1, data: 1, culture: 1 },
  researchInnovation: { tools: 1, data: 1, culture: 1 },
  digitalGovernance: { tools: 1, data: 1, culture: 1 },
  institutionalImage: { tools: 1, data: 1, culture: 1 },
  universityExtension: { tools: 1, data: 1, culture: 1 },
};

interface PersistedState {
  institutionName: string;
  assessorName: string;
  dimensions: Record<DimensionKey, DimensionAssessment>;
  customDimensions: CustomDimension[];
  hiddenDimensions: DimensionKey[];
  stakeholders: Stakeholder[];
  solutions: SolutionCard[];
  tasks: PlanTask[];
  kpis: KPI[];
  aiMessages: Record<string, AIMessage[]>;
  // M1 Consensus
  consensusDimensions: Record<DimensionKey, DimensionAssessment> | null;
  consensusCustomDimensions: CustomDimension[];
  consensusHiddenDimensions: DimensionKey[];
  consensusStatus: ConsensusStatus;
  // M2 Consensus
  consensusStakeholders: Stakeholder[] | null;
  m2ConsensusStatus: ConsensusStatus;
  // M2 Pain Points
  painPoints: PainPoint[];
}

function loadFromStorage(): Partial<PersistedState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveToStorage(state: PersistedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* quota exceeded — silent fail */ }
}

interface AppStore {
  // Module 1
  institutionName: string;
  setInstitutionName: (v: string) => void;
  assessorName: string;
  setAssessorName: (v: string) => void;
  dimensions: Record<DimensionKey, DimensionAssessment>;
  setDimension: (key: DimensionKey, sub: 'tools' | 'data' | 'culture', value: 0 | 1 | 2 | 3) => void;
  customDimensions: CustomDimension[];
  setCustomDimensions: React.Dispatch<React.SetStateAction<CustomDimension[]>>;
  hiddenDimensions: DimensionKey[];
  setHiddenDimensions: React.Dispatch<React.SetStateAction<DimensionKey[]>>;

  // Module 2
  stakeholders: Stakeholder[];
  setStakeholders: React.Dispatch<React.SetStateAction<Stakeholder[]>>;

  // Module 3
  solutions: SolutionCard[];
  setSolutions: React.Dispatch<React.SetStateAction<SolutionCard[]>>;

  // Module 4
  tasks: PlanTask[];
  setTasks: React.Dispatch<React.SetStateAction<PlanTask[]>>;
  kpis: KPI[];
  setKpis: React.Dispatch<React.SetStateAction<KPI[]>>;

  // AI Advisor
  aiMessages: Record<string, AIMessage[]>; // keyed by module
  addAIMessage: (module: string, message: AIMessage) => void;

  // M1 Consensus
  consensusDimensions: Record<DimensionKey, DimensionAssessment> | null;
  setConsensusDimensions: (dims: Record<DimensionKey, DimensionAssessment> | null) => void;
  consensusCustomDimensions: CustomDimension[];
  setConsensusCustomDimensions: React.Dispatch<React.SetStateAction<CustomDimension[]>>;
  consensusHiddenDimensions: DimensionKey[];
  setConsensusHiddenDimensions: React.Dispatch<React.SetStateAction<DimensionKey[]>>;
  consensusStatus: ConsensusStatus;
  setConsensusStatus: (status: ConsensusStatus) => void;

  // M2 Consensus
  consensusStakeholders: Stakeholder[] | null;
  setConsensusStakeholders: (s: Stakeholder[] | null) => void;
  m2ConsensusStatus: ConsensusStatus;
  setM2ConsensusStatus: (status: ConsensusStatus) => void;
  // M2 Pain Points
  painPoints: PainPoint[];
  setPainPoints: (pp: PainPoint[]) => void;

  // Computed: returns consensus data when validated, otherwise individual
  effectiveDimensions: Record<DimensionKey, DimensionAssessment>;
  effectiveCustomDimensions: CustomDimension[];
  effectiveHiddenDimensions: DimensionKey[];
  effectiveStakeholders: Stakeholder[];

  // Admin
  fillSampleData: () => void;
  resetAll: () => void;
}

const StoreContext = createContext<AppStore | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const saved = loadFromStorage();

  const [institutionName, setInstitutionName] = useState(saved.institutionName || '');
  const [assessorName, setAssessorName] = useState(saved.assessorName || '');
  const [dimensions, setDimensions] = useState(saved.dimensions || defaultDimensions);
  const [customDimensions, setCustomDimensions] = useState<CustomDimension[]>(saved.customDimensions || []);
  const [hiddenDimensions, setHiddenDimensions] = useState<DimensionKey[]>(saved.hiddenDimensions || []);
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>(saved.stakeholders || []);
  const [solutions, setSolutions] = useState<SolutionCard[]>(saved.solutions || []);
  const [tasks, setTasks] = useState<PlanTask[]>(saved.tasks || []);
  const [kpis, setKpis] = useState<KPI[]>(saved.kpis || []);
  const [aiMessages, setAiMessages] = useState<Record<string, AIMessage[]>>(saved.aiMessages || {});
  const [consensusDimensions, setConsensusDimensions] = useState<Record<DimensionKey, DimensionAssessment> | null>(saved.consensusDimensions || null);
  const [consensusCustomDimensions, setConsensusCustomDimensions] = useState<CustomDimension[]>(saved.consensusCustomDimensions || []);
  const [consensusHiddenDimensions, setConsensusHiddenDimensions] = useState<DimensionKey[]>(saved.consensusHiddenDimensions || []);
  const [consensusStatus, setConsensusStatus] = useState<ConsensusStatus>(saved.consensusStatus || 'none');
  const [consensusStakeholders, setConsensusStakeholders] = useState<Stakeholder[] | null>(saved.consensusStakeholders || null);
  const [m2ConsensusStatus, setM2ConsensusStatus] = useState<ConsensusStatus>(saved.m2ConsensusStatus || 'none');
  const [painPoints, setPainPoints] = useState<PainPoint[]>(saved.painPoints || []);

  // Computed: use consensus when validated, otherwise individual
  const isConsensusActive = consensusStatus === 'validated' && consensusDimensions !== null;
  const effectiveDimensions = isConsensusActive ? consensusDimensions : dimensions;
  const effectiveCustomDimensions = isConsensusActive ? consensusCustomDimensions : customDimensions;
  const effectiveHiddenDimensions = isConsensusActive ? consensusHiddenDimensions : hiddenDimensions;
  // Use consensus stakeholders when available (even in draft), fallback to individual
  const effectiveStakeholders = consensusStakeholders && consensusStakeholders.length > 0 ? consensusStakeholders : stakeholders;

  const setDimension = (key: DimensionKey, sub: 'tools' | 'data' | 'culture', value: 0 | 1 | 2 | 3) => {
    setDimensions((prev) => ({
      ...prev,
      [key]: { ...prev[key], [sub]: value },
    }));
  };

  const addAIMessage = (module: string, message: AIMessage) => {
    setAiMessages((prev) => ({
      ...prev,
      [module]: [...(prev[module] || []), message],
    }));
  };

  const fillSampleData = () => {
    setInstitutionName('Saigon University');
    setAssessorName('Dr. Nguyen Van A');
    setDimensions(sampleDimensions);
    setStakeholders(sampleStakeholders);
    setSolutions(sampleSolutions);
    setTasks(sampleTasks);
    setKpis(sampleKpis);
  };

  const resetAll = () => {
    setInstitutionName('');
    setAssessorName('');
    setDimensions(defaultDimensions);
    setCustomDimensions([]);
    setHiddenDimensions([]);
    setStakeholders([]);
    setSolutions([]);
    setTasks([]);
    setKpis([]);
    setAiMessages({});
    setConsensusDimensions(null);
    setConsensusCustomDimensions([]);
    setConsensusHiddenDimensions([]);
    setConsensusStatus('none');
    setConsensusStakeholders(null);
    setM2ConsensusStatus('none');
    setPainPoints([]);
  };

  // Persist to localStorage on every state change
  const persist = useCallback(() => {
    saveToStorage({ institutionName, assessorName, dimensions, customDimensions, hiddenDimensions, stakeholders, solutions, tasks, kpis, aiMessages, consensusDimensions, consensusCustomDimensions, consensusHiddenDimensions, consensusStatus, consensusStakeholders, m2ConsensusStatus, painPoints });
  }, [institutionName, assessorName, dimensions, customDimensions, hiddenDimensions, stakeholders, solutions, tasks, kpis, aiMessages, consensusDimensions, consensusCustomDimensions, consensusHiddenDimensions, consensusStatus, consensusStakeholders, m2ConsensusStatus, painPoints]);

  useEffect(() => {
    persist();
  }, [persist]);

  return (
    <StoreContext.Provider
      value={{
        institutionName, setInstitutionName,
        assessorName, setAssessorName,
        dimensions, setDimension,
        customDimensions, setCustomDimensions,
        hiddenDimensions, setHiddenDimensions,
        stakeholders, setStakeholders,
        solutions, setSolutions,
        tasks, setTasks,
        kpis, setKpis,
        aiMessages, addAIMessage,
        consensusDimensions, setConsensusDimensions,
        consensusCustomDimensions, setConsensusCustomDimensions,
        consensusHiddenDimensions, setConsensusHiddenDimensions,
        consensusStatus, setConsensusStatus,
        consensusStakeholders, setConsensusStakeholders,
        m2ConsensusStatus, setM2ConsensusStatus,
        painPoints, setPainPoints,
        effectiveDimensions, effectiveCustomDimensions, effectiveHiddenDimensions,
        effectiveStakeholders,
        fillSampleData, resetAll,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
