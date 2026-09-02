import { create } from 'zustand';
import { CommunityFunction, FunctionSummary } from '../types';

interface FunctionStore {
  functions: CommunityFunction[];
  activeFunction: CommunityFunction | null;
  selectedFunction: CommunityFunction | null;
  summaries: Record<string, FunctionSummary>;
  isLoading: boolean;
  error: string | null;
  setFunctions: (functions: CommunityFunction[]) => void;
  addFunction: (fn: CommunityFunction) => void;
  updateFunction: (fn: CommunityFunction) => void;
  removeFunction: (id: string) => void;
  setActiveFunction: (fn: CommunityFunction | null) => void;
  setSelectedFunction: (fn: CommunityFunction | null) => void;
  setSummary: (functionId: string, summary: FunctionSummary) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useFunctionStore = create<FunctionStore>((set) => ({
  functions: [],
  activeFunction: null,
  selectedFunction: null,
  summaries: {},
  isLoading: false,
  error: null,
  setFunctions: (functions) => {
    const active = functions.find(f => f.status === 'active') ?? null;
    set({ functions, activeFunction: active });
  },
  addFunction: (fn) => set((state) => ({ functions: [fn, ...state.functions] })),
  updateFunction: (fn) => set((state) => ({
    functions: state.functions.map(f => f.id === fn.id ? fn : f),
    activeFunction: state.activeFunction?.id === fn.id ? fn : state.activeFunction,
  })),
  removeFunction: (id) => set((state) => ({
    functions: state.functions.filter(f => f.id !== id),
    activeFunction: state.activeFunction?.id === id ? null : state.activeFunction,
  })),
  setActiveFunction: (fn) => set({ activeFunction: fn }),
  setSelectedFunction: (fn) => set({ selectedFunction: fn }),
  setSummary: (functionId, summary) => set((state) => ({
    summaries: { ...state.summaries, [functionId]: summary },
  })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
