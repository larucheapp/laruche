import React, { useState, useRef } from 'react';
import { FileText, Upload, X, Download, Loader2, Image as ImageIcon } from 'lucide-react';

export const ImageToPdfTool: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(url);
    }
  };

  const generatePDF = async () => {
    if (!image) return;
    setIsGenerating(true);
    try {
        const { jsPDF } = await import('https://esm.sh/jspdf@2.5.1');
        // A4 size by default
        const doc = new jsPDF();
        
        const imgProps = doc.getImageProperties(image);
        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = doc.internal.pageSize.getHeight();
        
        // Logic to fit image within the page while maintaining aspect ratio
        const imgRatio = imgProps.width / imgProps.height;
        const pageRatio = pdfWidth / pdfHeight;
        
        let finalWidth, finalHeight;
        
        if (imgRatio > pageRatio) {
            // Image is wider relative to page -> constrain by width
            finalWidth = pdfWidth;
            finalHeight = finalWidth / imgRatio;
        } else {
            // Image is taller relative to page -> constrain by height
            finalHeight = pdfHeight;
            finalWidth = finalHeight * imgRatio;
        }
        
        // Center the image
        const x = (pdfWidth - finalWidth) / 2;
        const y = (pdfHeight - finalHeight) / 2;

        doc.addImage(image, 'JPEG', x, y, finalWidth, finalHeight);
        doc.save(`converted-${Date.now()}.pdf`);
    } catch (e) {
        console.error(e);
        alert("Impossible de générer le PDF.");
    } finally {
        setIsGenerating(false);
    }
  };

  const reset = () => {
    setImage(null);
    if(fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full h-full flex flex-col p-3 relative overflow-hidden bg-zinc-950/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <div className="flex items-center gap-2 text-rose-400">
          <FileText size={18} />
          <h2 className="text-xs font-bold uppercase tracking-wider">Image vers PDF</h2>
        </div>
        {image && (
            <button onClick={reset} className="text-zinc-500 hover:text-white transition-colors">
                <X size={16} />
            </button>
        )}
      </div>

      <div className="flex-1 min-h-0 relative flex flex-col">
        {!image ? (
           <div 
             onClick={() => fileInputRef.current?.click()}
             className="flex-1 border border-dashed border-zinc-700 bg-zinc-900/50 rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-zinc-900 hover:border-rose-500/50 transition-all group"
           >
              <div className="p-3 bg-zinc-800 rounded-full group-hover:bg-zinc-700 transition-colors text-rose-400">
                 <Upload size={24} />
              </div>
              <span className="text-[10px] text-zinc-500 font-bold uppercase group-hover:text-zinc-300">Choisir une image</span>
              <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleUpload} />
           </div>
        ) : (
           <div className="flex-1 relative rounded-lg overflow-hidden border border-zinc-700 bg-zinc-950 flex items-center justify-center p-4">
              <img src={image} className="max-w-full max-h-full object-contain shadow-2xl" style={{ boxShadow: '0 0 20px rgba(0,0,0,0.5)' }} />
           </div>
        )}
      </div>

      {image && (
        <button 
          onClick={generatePDF}
          disabled={isGenerating}
          className="w-full mt-3 h-9 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-900/20 active:scale-95 shrink-0"
        >
          {isGenerating ? <Loader2 size={14} className="animate-spin"/> : <Download size={14} />}
          Télécharger PDF
        </button>
      )}
    </div>
  );
};