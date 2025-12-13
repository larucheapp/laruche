import React, { useState, useRef } from 'react';
import { Stamp, Upload, Download, X, Loader2 } from 'lucide-react';

export const WatermarkTool: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setOriginalImage(url);
      setProcessedImage(null);
      // Auto process
      setTimeout(() => processImage(url), 100);
    }
  };

  const processImage = (imgUrl: string) => {
    setIsProcessing(true);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imgUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;

      // Draw original
      ctx.drawImage(img, 0, 0);

      // Watermark Config
      const text = "La Ruche";
      const fontSize = Math.max(20, img.width * 0.05); // Responsive font size
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillStyle = "rgba(255, 255, 255, 0.25)"; // White transparent
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      // Rotation & Grid
      ctx.save();
      ctx.rotate(-30 * Math.PI / 180);
      
      const gapX = fontSize * 6;
      const gapY = fontSize * 4;
      
      // Calculate bounds for rotated grid to cover everything
      const diagonal = Math.sqrt(canvas.width**2 + canvas.height**2);
      
      for (let y = -diagonal; y < diagonal; y += gapY) {
        for (let x = -diagonal; x < diagonal; x += gapX) {
           ctx.fillText(text, x, y);
        }
      }
      
      ctx.restore();

      setProcessedImage(canvas.toDataURL('image/png'));
      setIsProcessing(false);
    };
  };

  const handleDownload = () => {
    if (!processedImage) return;
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = 'laruche-filigrane.png';
    link.click();
  };

  const reset = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    if(fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full h-full flex flex-col p-3 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-2 text-cyan-400">
          <Stamp size={18} />
          <h2 className="text-xs font-bold uppercase tracking-wider">Filigrane</h2>
        </div>
        {originalImage && (
          <button onClick={reset} className="text-zinc-500 hover:text-white transition-colors">
            <X size={14} />
          </button>
        )}
      </div>

      <div className="flex-1 min-h-0 relative flex flex-col">
        {!originalImage ? (
           <div 
             onClick={() => fileInputRef.current?.click()}
             className="flex-1 border border-dashed border-zinc-700 bg-zinc-900/50 rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-zinc-900 transition-colors group"
           >
              <div className="p-3 bg-zinc-800 rounded-full group-hover:bg-zinc-700 transition-colors">
                 <Upload size={20} className="text-cyan-400"/>
              </div>
              <span className="text-[10px] text-zinc-500 font-bold uppercase">Choisir une image</span>
              <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleUpload} />
           </div>
        ) : (
           <div className="flex-1 relative rounded-lg overflow-hidden border border-zinc-700 bg-zinc-950 flex items-center justify-center">
              {isProcessing ? (
                 <div className="flex flex-col items-center gap-2 text-cyan-400">
                    <Loader2 size={24} className="animate-spin" />
                    <span className="text-xs font-bold">Application...</span>
                 </div>
              ) : (
                 <img src={processedImage || originalImage} className="max-w-full max-h-full object-contain" />
              )}
           </div>
        )}
      </div>

      {processedImage && (
        <button 
          onClick={handleDownload}
          className="w-full mt-3 h-9 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-900/20 active:scale-95 shrink-0"
        >
          <Download size={14} /> Télécharger
        </button>
      )}
    </div>
  );
};