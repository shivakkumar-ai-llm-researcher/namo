import { create } from 'zustand';
import { Contribution, ContributionFilters } from '../types';

interface ContributionStore {
  contributions: Contribution[];
  totalCount: number;
  filters: ContributionFilters;
  isLoading: boolean;
  error: string | null;
  setContributions: (contributions: Contribution[], totalCount: number) => void;
  addContribution: (contribution: Contribution) => void;
  updateContribution: (contribution: Contribution) => void;
  removeContribution: (id: string) => void;
  setFilters: (filters: ContributionFilters) => void;
  resetFilters: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const defaultFilters: ContributionFilters = {
  page: 1,
  limit: 20,
};

export const useContributionStore = create<ContributionStore>((set) => ({
  contributions: [],
  totalCount: 0,
  filters: defaultFilters,
  isLoading: false,
  error: null,
  setContributions: (contributions, totalCount) => set({ contributions, totalCount }),
  addContribution: (contribution) => set((state) => ({
    contributions: [contribution, ...state.contributions],
    totalCount: state.totalCount + 1,
  })),
  updateContribution: (contribution) => set((state) => ({
    contributions: state.contributions.map(c => c.id === contribution.id ? contribution : c),
  })),
  removeContribution: (id) => set((state) => ({
    contributions: state.contributions.filter(c => c.id !== id),
    totalCount: Math.max(0, state.totalCount - 1),
  })),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  resetFilters: () => set({ filters: defaultFilters }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
