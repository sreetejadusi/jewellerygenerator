import { create } from 'zustand';

export interface Prompt {
  id: string;
  name: string;
  prompt: string;
}

export interface UploadedImage {
  id: string;
  file: File;
  previewUrl: string;
  base64: string;
}

export interface GenerationResult {
  id: string;
  originalImageId: string;
  promptId: string;
  promptName: string;
  imageUrl: string;
  title: string;
  description: string;
}

interface AppState {
  images: UploadedImage[];
  prompts: Prompt[];
  selectedPromptIds: string[];
  results: GenerationResult[];
  isGenerating: boolean;
  progress: {
    total: number;
    completed: number;
    currentAction: string;
  };
  
  setImages: (images: UploadedImage[]) => void;
  addImage: (image: UploadedImage) => void;
  removeImage: (id: string) => void;
  
  setPrompts: (prompts: Prompt[]) => void;
  addPrompt: (prompt: Prompt) => void;
  updatePrompt: (id: string, prompt: Partial<Prompt>) => void;
  deletePrompt: (id: string) => void;
  
  togglePromptSelection: (id: string) => void;
  
  addResult: (result: GenerationResult) => void;
  removeResult: (id: string) => void;
  updateResult: (id: string, result: Partial<GenerationResult>) => void;
  
  setIsGenerating: (isGenerating: boolean) => void;
  setProgress: (progress: AppState['progress']) => void;
}

export const useAppStore = create<AppState>((set) => ({
  images: [],
  prompts: [],
  selectedPromptIds: [],
  results: [],
  isGenerating: false,
  progress: { total: 0, completed: 0, currentAction: '' },
  
  setImages: (images) => set({ images }),
  addImage: (image) => set((state) => ({ images: [...state.images, image] })),
  removeImage: (id) => set((state) => ({ 
    images: state.images.filter(i => i.id !== id),
    // Also cleanup Object URLs to prevent memory leaks
  })),
  
  setPrompts: (prompts) => set({ prompts }),
  addPrompt: (prompt) => set((state) => ({ prompts: [...state.prompts, prompt] })),
  updatePrompt: (id, prompt) => set((state) => ({
    prompts: state.prompts.map(p => p.id === id ? { ...p, ...prompt } : p)
  })),
  deletePrompt: (id) => set((state) => ({ 
    prompts: state.prompts.filter(p => p.id !== id),
    selectedPromptIds: state.selectedPromptIds.filter(pid => pid !== id)
  })),
  
  togglePromptSelection: (id) => set((state) => ({
    selectedPromptIds: state.selectedPromptIds.includes(id)
      ? state.selectedPromptIds.filter(pid => pid !== id)
      : [...state.selectedPromptIds, id]
  })),
  
  addResult: (result) => set((state) => ({ results: [result, ...state.results] })),
  removeResult: (id) => set((state) => ({ results: state.results.filter(r => r.id !== id) })),
  updateResult: (id, result) => set((state) => ({
    results: state.results.map(r => r.id === id ? { ...r, ...result } : r)
  })),
  
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setProgress: (progress) => set({ progress }),
}));
