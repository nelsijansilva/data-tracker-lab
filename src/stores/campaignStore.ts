import { create } from 'zustand';

interface CampaignStore {
  selectedCampaignId: string | null;
  setSelectedCampaignId: (id: string | null) => void;
}

export const useCampaignStore = create<CampaignStore>((set) => ({
  selectedCampaignId: null,
  setSelectedCampaignId: (id) => set({ selectedCampaignId: id }),
}));