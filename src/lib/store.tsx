import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type {
  DimensionKey,
  DimensionAssessment,
  Stakeholder,
  SolutionCard,
  PlanTask,
  KPI,
  AIMessage,
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
  stakeholders: Stakeholder[];
  solutions: SolutionCard[];
  tasks: PlanTask[];
  kpis: KPI[];
  aiMessages: Record<string, AIMessage[]>;
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
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>(saved.stakeholders || []);
  const [solutions, setSolutions] = useState<SolutionCard[]>(saved.solutions || []);
  const [tasks, setTasks] = useState<PlanTask[]>(saved.tasks || []);
  const [kpis, setKpis] = useState<KPI[]>(saved.kpis || []);
  const [aiMessages, setAiMessages] = useState<Record<string, AIMessage[]>>(saved.aiMessages || {});

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
    setStakeholders([]);
    setSolutions([]);
    setTasks([]);
    setKpis([]);
    setAiMessages({});
  };

  // Persist to localStorage on every state change
  const persist = useCallback(() => {
    saveToStorage({ institutionName, assessorName, dimensions, stakeholders, solutions, tasks, kpis, aiMessages });
  }, [institutionName, assessorName, dimensions, stakeholders, solutions, tasks, kpis, aiMessages]);

  useEffect(() => {
    persist();
  }, [persist]);

  return (
    <StoreContext.Provider
      value={{
        institutionName, setInstitutionName,
        assessorName, setAssessorName,
        dimensions, setDimension,
        stakeholders, setStakeholders,
        solutions, setSolutions,
        tasks, setTasks,
        kpis, setKpis,
        aiMessages, addAIMessage,
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
