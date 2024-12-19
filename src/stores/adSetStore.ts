import { create } from 'zustand';

interface AdSetStore {
  selectedAdSetId: string | null;
  setSelectedAdSetId: (id: string | null) => void;
}

export const useAdSetStore = create<AdSetStore>((set) => ({
  selectedAdSetId: null,
  setSelectedAdSetId: (id) => set({ selectedAdSetId: id }),
}));