import { createContext, useContext, useState, type ReactNode } from 'react';
import type {
  DimensionKey,
  DimensionAssessment,
  Stakeholder,
  SolutionCard,
  PlanTask,
  KPI,
  AIMessage,
} from '../types';

// ============================================================
// App-wide data store (shared across modules + AI Advisor)
// ============================================================

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

interface AppStore {
  // Module 1
  institutionName: string;
  setInstitutionName: (v: string) => void;
  assessorName: string;
  setAssessorName: (v: string) => void;
  dimensions: Record<DimensionKey, DimensionAssessment>;
  setDimension: (key: DimensionKey, sub: 'tools' | 'data' | 'culture', value: 1 | 2 | 3) => void;

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
}

const StoreContext = createContext<AppStore | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [institutionName, setInstitutionName] = useState('');
  const [assessorName, setAssessorName] = useState('');
  const [dimensions, setDimensions] = useState(defaultDimensions);
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [solutions, setSolutions] = useState<SolutionCard[]>([]);
  const [tasks, setTasks] = useState<PlanTask[]>([]);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [aiMessages, setAiMessages] = useState<Record<string, AIMessage[]>>({});

  const setDimension = (key: DimensionKey, sub: 'tools' | 'data' | 'culture', value: 1 | 2 | 3) => {
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
