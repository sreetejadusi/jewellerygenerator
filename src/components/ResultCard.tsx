'use client';
import { Copy, Download, Trash2, RefreshCw } from 'lucide-react';
import { GenerationResult, useAppStore } from '@/store/useAppStore';

export default function ResultCard({ result }: { result: GenerationResult }) {
  const { removeResult } = useAppStore();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleDownload = () => {
    if (result.imageUrl && result.imageUrl.startsWith('data:image')) {
      const a = document.createElement('a');
      a.href = result.imageUrl;
      a.download = `${result.promptName.replace(/\s+/g, '_')}_${result.id}.jpg`;
      a.click();
    }
  };

  return (
    <div className="glass-panel rounded-xl overflow-hidden flex flex-col hover:border-white/20 transition-colors">
      <div className="relative aspect-square bg-black/40">
        {result.imageUrl ? (
          <img src={result.imageUrl} alt={result.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 text-brand animate-spin" />
            <span className="text-xs text-brand font-medium">Generating image...</span>
          </div>
        )}
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs text-white/80 border border-white/10">
          {result.promptName}
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-1 gap-2">
        <h3 className="font-semibold text-white leading-tight line-clamp-2">
          {result.title || <span className="text-white/40 italic">Generating title...</span>}
        </h3>
        <p className="text-sm text-white/60 line-clamp-3 flex-1">
          {result.description || <span className="text-white/40 italic">Generating description...</span>}
        </p>
        
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
          <div className="flex gap-1">
            <button onClick={() => handleCopy(result.title)} className="p-1.5 hover:bg-white/10 rounded-md text-white/60 hover:text-white transition-colors" title="Copy Title">
              <span className="text-xs font-medium mr-1">T</span><Copy className="w-3.5 h-3.5 inline" />
            </button>
            <button onClick={() => handleCopy(result.description)} className="p-1.5 hover:bg-white/10 rounded-md text-white/60 hover:text-white transition-colors" title="Copy Description">
              <span className="text-xs font-medium mr-1">D</span><Copy className="w-3.5 h-3.5 inline" />
            </button>
          </div>
          <div className="flex gap-1">
            <button onClick={handleDownload} disabled={!result.imageUrl} className="p-1.5 hover:bg-white/10 rounded-md text-white/60 hover:text-white disabled:opacity-30 transition-colors" title="Download Image">
              <Download className="w-4 h-4" />
            </button>
            <button onClick={() => removeResult(result.id)} className="p-1.5 hover:bg-red-500/20 rounded-md text-white/60 hover:text-red-400 transition-colors" title="Delete">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
