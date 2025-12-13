import React, { useState, useRef } from 'react';
import { Upload, X, Download, Wand2, Loader2, Image as ImageIcon } from 'lucide-react';

export const RemoveBgTool: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [resultSrc, setResultSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageSrc(url);
      setResultSrc(null);
      setError(null);
    }
  };

  const handleProcess = async () => {
    if (!imageSrc) return;
    setIsProcessing(true);
    setError(null);

    try {
      const { removeBackground } = await import('https://cdn.jsdelivr.net/npm/@imgly/background-removal@1/+esm');
      const blob = await fetch(imageSrc).then(r => r.blob());
      const outBlob = await removeBackground(blob);
      const url = URL.createObjectURL(outBlob);
      setResultSrc(url);
    } catch (err: any) {
      console.error(err);
      setError("Erreur de traitement.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (resultSrc) {
      const a = document.createElement('a');
      a.href = resultSrc;
      a.download = 'purplebee-detourage.png';
      a.click();
    }
  };

  const reset = () => {
    setImageSrc(null);
    setResultSrc(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full h-full flex flex-col p-4 relative">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-purple-400">
          <Wand2 size={16} />
          <span className="text-xs font-bold tracking-wider uppercase">Détourage</span>
        </div>
        {(imageSrc) && (
          <button onClick={reset} className="text-zinc-500 hover:text-white transition-colors">
            <X size={16} />
          </button>
        )}
      </div>

      <div className="flex-1 relative rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 overflow-hidden flex flex-col items-center justify-center group transition-colors hover:border-zinc-500">
        
        {!imageSrc && (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center gap-3 text-zinc-500 hover:text-purple-400 transition-colors"
          >
            <div className="p-3 rounded-full bg-zinc-800 group-hover:bg-zinc-700 transition-colors">
              <Upload size={20} />
            </div>
            <span className="text-xs font-medium">Déposer ou Cliquer</span>
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange}
            />
          </div>
        )}

        {imageSrc && (
          <div className="relative w-full h-full p-2">
            <img 
              src={resultSrc || imageSrc} 
              alt="Aperçu" 
              className="w-full h-full object-contain"
            />
            
            <div className="absolute inset-2 -z-10 opacity-20" 
              style={{ 
                backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', 
                backgroundSize: '8px 8px' 
              }} 
            />
          </div>
        )}

        {isProcessing && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2 z-20">
            <Loader2 className="animate-spin text-purple-500" size={24} />
            <span className="text-xs text-zinc-400">Traitement IA...</span>
          </div>
        )}
        
         {error && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center gap-2 z-20 text-red-400">
            <span className="text-xs">{error}</span>
            <button onClick={() => setError(null)} className="text-xs underline">Réessayer</button>
          </div>
        )}
      </div>

      {imageSrc && !isProcessing && (
        <div className="mt-3 flex gap-2">
          {!resultSrc ? (
            <button 
              onClick={handleProcess}
              className="flex-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Wand2 size={14} /> Détourer
            </button>
          ) : (
            <button 
              onClick={handleDownload}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Download size={14} /> Télécharger PNG
            </button>
          )}
        </div>
      )}
    </div>
  );
};