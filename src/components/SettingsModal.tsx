'use client';
import { useState } from 'react';
import { X, Settings } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function SettingsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { apiKey, setApiKey, concurrentRequests, setConcurrentRequests } = useSettingsStore();

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed top-6 right-6 p-3 rounded-full glass-panel hover:bg-white/10 transition-colors z-50 text-white/70 hover:text-white shadow-lg"
      >
        <Settings className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md rounded-2xl p-6 relative">
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-md text-white/50 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-brand" /> Settings
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Gemini API Key</label>
            <input 
              type="password" 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand/50 transition-colors"
              placeholder="AIzaSy..."
            />
            <p className="text-xs text-white/40 mt-2">Required for AI generation. Stored locally in your browser.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Concurrent Requests</label>
            <input 
              type="range" 
              min="1" 
              max="5" 
              value={concurrentRequests}
              onChange={(e) => setConcurrentRequests(parseInt(e.target.value))}
              className="w-full accent-brand cursor-pointer"
            />
            <div className="flex justify-between text-xs text-white/50 mt-2">
              <span>1 (Safe)</span>
              <span className="font-medium text-white">{concurrentRequests}</span>
              <span>5 (Fast)</span>
            </div>
            <p className="text-xs text-white/40 mt-2">Higher numbers may hit API rate limits depending on your tier.</p>
          </div>
        </div>

        <div className="mt-8">
          <button 
            onClick={() => setIsOpen(false)}
            className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
