'use client';
import { useEffect, useRef } from 'react';
import { Upload, Trash2, CheckSquare, Square, Download, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface SidebarProps {
  onGenerate: () => void;
}

export default function Sidebar({ onGenerate }: SidebarProps) {
  const { images, addImage, removeImage, prompts, setPrompts, selectedPromptIds, togglePromptSelection, isGenerating, results } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    fetch('/api/prompts')
      .then(res => res.json())
      .then(data => setPrompts(data))
      .catch(console.error);
  }, [setPrompts]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            addImage({
              id: Math.random().toString(36).substring(7),
              file,
              previewUrl: URL.createObjectURL(file),
              base64: event.target.result as string
            });
          }
        };
        reader.readAsDataURL(file);
      });
    }
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownloadZip = async () => {
    if (results.length === 0) return;
    const zip = new JSZip();
    const root = zip.folder("Generated_Products");
    if (!root) return;

    const groupedResults = results.reduce((acc, result) => {
      if (!acc[result.originalImageId]) acc[result.originalImageId] = [];
      acc[result.originalImageId].push(result);
      return acc;
    }, {} as Record<string, typeof results>);

    let imgCounter = 1;
    for (const [imgId, itemResults] of Object.entries(groupedResults)) {
      const productFolder = root.folder(`Product_${imgCounter++}`);
      if (!productFolder) continue;

      for (const res of itemResults) {
        const promptFolder = productFolder.folder(res.promptName.replace(/\s+/g, '_'));
        if (!promptFolder) continue;
        
        promptFolder.file("title.txt", res.title);
        promptFolder.file("description.txt", res.description);
        
        if (res.imageUrl.startsWith('data:image')) {
          const base64Data = res.imageUrl.split(',')[1];
          promptFolder.file("image.jpg", base64Data, {base64: true});
        }
      }
    }

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "Generated_Products.zip");
  };

  return (
    <div className="w-80 h-full border-r border-white/10 bg-black/20 p-6 flex flex-col gap-6 overflow-y-auto shrink-0">
      
      {/* Upload Section */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">1. Upload Photos</h2>
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-white/20 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-brand/50 hover:bg-brand/5 transition-colors"
        >
          <Upload className="text-white/50 mb-2 w-6 h-6" />
          <p className="text-sm text-white/70 text-center">Click or Drag to upload<br/><span className="text-xs">JPG, PNG, WEBP</span></p>
          <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
        </div>

        {images.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {images.map(img => (
              <div key={img.id} className="relative w-16 h-16 rounded-md overflow-hidden group border border-white/10">
                <img src={img.previewUrl} alt="Upload" className="w-full h-full object-cover" />
                <button onClick={() => removeImage(img.id)} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Prompts Section */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">2. Select Presets</h2>
        </div>
        <div className="flex flex-col gap-2">
          {prompts.map(prompt => {
            const isSelected = selectedPromptIds.includes(prompt.id);
            return (
              <div key={prompt.id} className="glass-panel rounded-lg p-3 flex items-start gap-3 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => togglePromptSelection(prompt.id)}>
                <div className="mt-0.5 text-brand shrink-0">
                  {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5 opacity-50" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white/90 leading-tight">{prompt.name}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-auto pt-4 border-t border-white/10 flex flex-col gap-3">
        <button 
          onClick={onGenerate}
          disabled={isGenerating || images.length === 0 || selectedPromptIds.length === 0}
          className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-brand to-yellow-600 text-black font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(212,175,55,0.3)]"
        >
          <Sparkles className="w-5 h-5" />
          {isGenerating ? 'Generating...' : 'Generate Magic'}
        </button>

        {results.length > 0 && (
          <button 
            onClick={handleDownloadZip}
            className="w-full py-3 px-4 rounded-lg glass-panel text-white font-medium flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
          >
            <Download className="w-5 h-5" />
            Download ZIP
          </button>
        )}
      </div>
    </div>
  );
}
