import { create } from 'zustand';

interface CampaignStore {
  selectedCampaignId: string | null;
  setSelectedCampaignId: (id: string | null) => void;
  resetSelection: () => void;
}

export const useCampaignStore = create<CampaignStore>((set) => ({
  selectedCampaignId: null,
  setSelectedCampaignId: (id) => set({ selectedCampaignId: id }),
  resetSelection: () => set({ selectedCampaignId: null }),
}));