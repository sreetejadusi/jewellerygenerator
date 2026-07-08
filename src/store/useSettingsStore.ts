import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  apiKey: string;
  concurrentRequests: number;
  setApiKey: (key: string) => void;
  setConcurrentRequests: (reqs: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      apiKey: '',
      concurrentRequests: 3,
      setApiKey: (key) => set({ apiKey: key }),
      setConcurrentRequests: (reqs) => set({ concurrentRequests: reqs }),
    }),
    {
      name: 'product-makeup-settings',
    }
  )
);
