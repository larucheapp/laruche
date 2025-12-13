import React, { useState, useRef } from 'react';
import { Upload, X, Download, Minimize2, Loader2 } from 'lucide-react';

export const ImageCompressorTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  
  const [reductionLevel, setReductionLevel] = useState<number>(0.8);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number, decimals = 1) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreviewUrl(URL.createObjectURL(f));
      setCompressedBlob(null);
    }
  };

  const compressImage = async () => {
    if (!file) return;
    setIsCompressing(true);

    try {
      let imageBitmap: ImageBitmap | HTMLImageElement;
      if (typeof createImageBitmap === 'function') {
        imageBitmap = await createImageBitmap(file);
      } else {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.src = url;
        await img.decode();
        imageBitmap = img;
      }

      const targetWidth = Math.round(imageBitmap.width * reductionLevel);
      const targetHeight = Math.round(imageBitmap.height * reductionLevel);

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(imageBitmap, 0, 0, targetWidth, targetHeight);
      }

      const result = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));

      if (result) setCompressedBlob(result);

    } catch (err) {
      console.error(err);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDownload = () => {
    if (!compressedBlob || !file) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(compressedBlob);
    a.download = file.name.replace(/\.[^/.]+$/, "") + "-compressed.png";
    a.click();
  };

  const reset = () => {
    setFile(null);
    setPreviewUrl(null);
    setCompressedBlob(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const levels = [
    { label: '-20%', value: 0.8 },
    { label: '-50%', value: 0.5 },
    { label: '-80%', value: 0.2 },
  ];

  return (
    <div className="w-full h-full flex flex-col p-4 relative">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-pink-400">
          <Minimize2 size={16} />
          <span className="text-xs font-bold tracking-wider uppercase">Compresseur</span>
        </div>
        {(file) && (
          <button onClick={reset} className="text-zinc-500 hover:text-white transition-colors">
            <X size={16} />
          </button>
        )}
      </div>

      <div className="flex-1 relative rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 overflow-hidden flex flex-col items-center justify-center group transition-colors hover:border-zinc-500">
        
        {!file && (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center gap-3 text-zinc-500 hover:text-pink-400 transition-colors"
          >
            <div className="p-3 rounded-full bg-zinc-800 group-hover:bg-zinc-700 transition-colors">
              <Upload size={20} />
            </div>
            <span className="text-xs font-medium">Déposer Image</span>
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange}
            />
          </div>
        )}

        {previewUrl && (
          <div className="relative w-full h-full p-2 flex flex-col items-center">
             <img 
              src={previewUrl} 
              alt="Preview" 
              className="flex-1 object-contain max-h-[100px] rounded-md shadow-lg bg-black/50"
            />
            {compressedBlob && (
               <div className="mt-2 text-[10px] text-zinc-400 flex items-center gap-2 bg-zinc-800/80 px-2 py-1 rounded-full border border-zinc-700">
                  <span className="line-through opacity-50">{formatBytes(file?.size || 0)}</span>
                  <span className="text-white font-bold">{formatBytes(compressedBlob.size)}</span>
                  <span className="text-emerald-400">(-{Math.round((1 - compressedBlob.size / (file?.size || 1)) * 100)}%)</span>
               </div>
            )}
          </div>
        )}

        {isCompressing && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2 z-20">
            <Loader2 className="animate-spin text-pink-500" size={24} />
            <span className="text-xs text-zinc-400">Compression...</span>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      {file && !isCompressing && (
        <div className="mt-3 flex flex-col gap-2">
           {!compressedBlob && (
             <div className="flex gap-2">
               {levels.map((lvl) => (
                 <button
                    key={lvl.label}
                    onClick={() => setReductionLevel(lvl.value)}
                    className={`
                      flex-1 py-1.5 text-[10px] font-bold rounded-md border transition-all
                      ${reductionLevel === lvl.value 
                        ? 'bg-pink-500/20 border-pink-500 text-pink-200' 
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'}
                    `}
                 >
                   {lvl.label}
                 </button>
               ))}
             </div>
           )}

          {!compressedBlob ? (
            <button 
              onClick={compressImage}
              className="w-full bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-pink-900/20"
            >
              <Minimize2 size={14} /> Compresser PNG
            </button>
          ) : (
            <button 
              onClick={handleDownload}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
            >
              <Download size={14} /> Télécharger PNG
            </button>
          )}
        </div>
      )}
    </div>
  );
};