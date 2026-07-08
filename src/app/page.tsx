'use client';
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import SettingsModal from '@/components/SettingsModal';
import ResultCard from '@/components/ResultCard';
import { useAppStore } from '@/store/useAppStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Sparkles } from 'lucide-react';

export default function Home() {
  const { 
    images, 
    prompts, 
    selectedPromptIds, 
    results, 
    addResult, 
    isGenerating, 
    setIsGenerating,
    progress,
    setProgress,
    updateResult
  } = useAppStore();
  
  const { apiKey, concurrentRequests } = useSettingsStore();

  const handleGenerate = async () => {
    if (!apiKey) {
      alert("Please enter your Gemini API Key in Settings first.");
      return;
    }
    
    setIsGenerating(true);
    const selectedPrompts = prompts.filter(p => selectedPromptIds.includes(p.id));
    const totalTasks = images.length * selectedPrompts.length;
    let completedCount = 0;
    
    setProgress({ total: totalTasks, completed: 0, currentAction: 'Initializing...' });

    const queue: Array<{ imgId: string, imgBase64: string, prompt: typeof prompts[0] }> = [];
    images.forEach(img => {
      selectedPrompts.forEach(p => {
        queue.push({ imgId: img.id, imgBase64: img.base64, prompt: p });
      });
    });

    const processTask = async (task: typeof queue[0]) => {
      const resultId = Math.random().toString(36).substring(7);
      
      addResult({
        id: resultId,
        originalImageId: task.imgId,
        promptId: task.prompt.id,
        promptName: task.prompt.name,
        imageUrl: '',
        title: '',
        description: ''
      });

      try {
        setProgress({ total: totalTasks, completed: completedCount, currentAction: `Generating text for ${task.prompt.name}...` });
        
        const textRes = await fetch('/api/generate/text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: task.imgBase64,
            promptName: task.prompt.name,
            apiKey
          })
        });
        
        if (!textRes.ok) {
          const errData = await textRes.json();
          throw new Error(errData.error || "Text generation failed");
        }
        const textData = await textRes.json();
        
        updateResult(resultId, { title: textData.title, description: textData.description });

        setProgress({ total: totalTasks, completed: completedCount, currentAction: `Generating image for ${task.prompt.name}...` });
        
        const imgRes = await fetch('/api/generate/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: task.imgBase64,
            promptText: task.prompt.prompt,
            apiKey
          })
        });

        if (!imgRes.ok) {
          const errData = await imgRes.json();
          throw new Error(errData.error || "Image generation failed");
        }
        const imgData = await imgRes.json();

        updateResult(resultId, { imageUrl: imgData.imageUrl });

      } catch (err: any) {
        console.error(err);
        updateResult(resultId, { title: "Error", description: err.message });
      }

      completedCount++;
      setProgress({ total: totalTasks, completed: completedCount, currentAction: `Finished ${task.prompt.name}` });
    };

    const executeQueue = async () => {
      const workers = Array(concurrentRequests).fill(Promise.resolve());
      let index = 0;
      
      const next = async (): Promise<void> => {
        if (index >= queue.length) return;
        const task = queue[index++];
        await processTask(task);
        return next();
      };
      
      await Promise.all(workers.map(() => next()));
    };

    await executeQueue();
    setIsGenerating(false);
  };

  return (
    <main className="flex h-screen w-full overflow-hidden">
      <Sidebar onGenerate={handleGenerate} />
      
      <div className="flex-1 h-full relative overflow-y-auto p-8 bg-gradient-to-br from-background to-black">
        <SettingsModal />
        
        <div className="mb-12 text-center max-w-2xl mx-auto pt-8">
          <h1 className="text-4xl font-bold mb-4 tracking-tight">AI Product <span className="text-gradient">Photo Generator</span></h1>
          <p className="text-white/60">Turn ordinary jewelry photos into premium e-commerce assets in seconds.</p>
        </div>

        {isGenerating && (
          <div className="mb-8 glass-panel rounded-xl p-6 text-center animate-pulse">
            <h3 className="text-lg font-semibold text-brand mb-2">Generating Magic...</h3>
            <p className="text-sm text-white/70 mb-4">{progress.currentAction}</p>
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-brand h-full transition-all duration-300"
                style={{ width: `${(progress.completed / progress.total) * 100}%` }}
              />
            </div>
            <p className="text-xs text-white/50 mt-2">{progress.completed} of {progress.total} completed</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-24">
          {results.map(result => (
            <ResultCard key={result.id} result={result} />
          ))}
          
          {results.length === 0 && !isGenerating && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-white/30 border-2 border-dashed border-white/10 rounded-2xl glass-panel">
              <Sparkles className="w-12 h-12 mb-4 text-white/20" />
              <p>Upload photos and select presets to start generating.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
