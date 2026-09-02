import { create } from 'zustand';
import { Member } from '../types';

interface MemberStore {
  members: Member[];
  totalCount: number;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  setMembers: (members: Member[], totalCount: number) => void;
  addMember: (member: Member) => void;
  updateMember: (member: Member) => void;
  removeMember: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useMemberStore = create<MemberStore>((set) => ({
  members: [],
  totalCount: 0,
  searchQuery: '',
  isLoading: false,
  error: null,
  setMembers: (members, totalCount) => set({ members, totalCount }),
  addMember: (member) => set((state) => ({
    members: [member, ...state.members],
    totalCount: state.totalCount + 1,
  })),
  updateMember: (member) => set((state) => ({
    members: state.members.map(m => m.id === member.id ? member : m),
  })),
  removeMember: (id) => set((state) => ({
    members: state.members.filter(m => m.id !== id),
    totalCount: Math.max(0, state.totalCount - 1),
  })),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
