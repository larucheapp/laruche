import React, { useState, useRef } from 'react';
import { QrCode, ArrowRight, Image as ImageIcon, Download, ChevronLeft, RotateCcw, Loader2, Trash2 } from 'lucide-react';

type Step = 'INPUT' | 'LOGO' | 'EXPORT';

export const QrCodeTool: React.FC = () => {
  const [step, setStep] = useState<Step>('INPUT');
  const [text, setText] = useState('');
  const [logo, setLogo] = useState<string | null>(null);
  const [quality, setQuality] = useState(2000); // Default 2000px
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Logic Generation ---

  const generatePreview = async (currentText: string, currentLogo: string | null) => {
    if (!currentText) return;
    try {
      const QRCode = (await import('https://esm.sh/qrcode')).default;
      const size = 500; // Fixed size for preview

      const qrDataUrl = await QRCode.toDataURL(currentText, {
        width: size,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' },
        errorCorrectionLevel: 'H'
      });

      if (currentLogo) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const qrImg = new Image();
        await new Promise((r) => { qrImg.onload = r; qrImg.src = qrDataUrl; });
        ctx.drawImage(qrImg, 0, 0, size, size);

        const logoImg = new Image();
        await new Promise((r, rej) => { logoImg.onload = r; logoImg.onerror = rej; logoImg.src = currentLogo; });

        const logoSize = size * 0.22;
        const logoX = (size - logoSize) / 2;
        const logoY = (size - logoSize) / 2;
        const padding = size * 0.02;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(logoX - padding, logoY - padding, logoSize + (padding * 2), logoSize + (padding * 2));
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);

        setPreviewUrl(canvas.toDataURL('image/png'));
      } else {
        setPreviewUrl(qrDataUrl);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownload = async () => {
    setIsProcessing(true);
    try {
       const QRCode = (await import('https://esm.sh/qrcode')).default;
       
       // Re-generate at high res
       const qrDataUrl = await QRCode.toDataURL(text, {
        width: quality,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' },
        errorCorrectionLevel: 'H'
      });

      let finalUrl = qrDataUrl;

      if (logo) {
         const canvas = document.createElement('canvas');
         canvas.width = quality;
         canvas.height = quality;
         const ctx = canvas.getContext('2d');
         if (ctx) {
            const qrImg = new Image();
            await new Promise((r) => { qrImg.onload = r; qrImg.src = qrDataUrl; });
            ctx.drawImage(qrImg, 0, 0, quality, quality);

            const logoImg = new Image();
            await new Promise((r) => { logoImg.onload = r; logoImg.src = logo; });

            const logoSize = quality * 0.22;
            const logoX = (quality - logoSize) / 2;
            const logoY = (quality - logoSize) / 2;
            const padding = quality * 0.02;

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(logoX - padding, logoY - padding, logoSize + (padding * 2), logoSize + (padding * 2));
            ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
            finalUrl = canvas.toDataURL('image/png');
         }
      }

      const a = document.createElement('a');
      a.href = finalUrl;
      a.download = `qrcode-${quality}px.png`;
      a.click();

    } catch(e) {
        console.error(e);
    } finally {
        setIsProcessing(false);
    }
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setLogo(url);
      generatePreview(text, url);
    }
  };

  const reset = () => {
    setText('');
    setLogo(null);
    setPreviewUrl(null);
    setStep('INPUT');
  };

  // --- Steps Rendering ---

  // STEP 1: INPUT
  if (step === 'INPUT') {
    return (
      <div className="w-full h-full p-3 flex flex-col justify-between">
        <div className="flex items-center gap-2 mb-2 text-blue-400 shrink-0">
            <QrCode size={18} />
            <h2 className="text-xs font-bold uppercase tracking-wider">Générateur QR</h2>
        </div>
        
        <div className="flex-1 flex flex-col justify-center gap-3">
            <div>
                <label className="block text-[10px] font-medium text-zinc-500 mb-1 ml-1">CONTENU</label>
                <input
                    autoFocus
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="https://site.com"
                    className="w-full bg-zinc-900 border border-zinc-700 text-white text-xs rounded-lg px-3 py-2.5 focus:border-blue-500 focus:outline-none transition-colors"
                />
            </div>
        </div>

        <button 
            onClick={() => {
                if(!text) return;
                generatePreview(text, null);
                setStep('LOGO');
            }}
            disabled={!text}
            className="w-full h-9 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0"
        >
            Démarrer <ArrowRight size={14} />
        </button>
      </div>
    );
  }

  // STEP 2: LOGO
  if (step === 'LOGO') {
    return (
      <div className="w-full h-full p-3 flex flex-col">
        {/* Nav */}
        <div className="flex items-center justify-between mb-1 shrink-0">
            <button onClick={() => setStep('INPUT')} className="p-1 hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors"><ChevronLeft size={16}/></button>
            <span className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">Ajouter Logo</span>
            <div className="w-6" /> {/* Spacer */}
        </div>

        {/* Preview Area - Compact */}
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-2">
            <div className="relative w-20 h-20 bg-white rounded p-1.5 shadow-sm shrink-0">
                {previewUrl ? <img src={previewUrl} className="w-full h-full object-contain" /> : <div className="w-full h-full bg-zinc-100 animate-pulse" />}
            </div>
            
            <div className="w-full max-w-[140px]">
                <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleLogoSelect} />
                
                {logo ? (
                    <button 
                        onClick={() => { setLogo(null); generatePreview(text, null); }}
                        className="w-full h-7 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-md text-[10px] font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                        <Trash2 size={10} /> Retirer
                    </button>
                ) : (
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-7 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors border border-zinc-700"
                    >
                        <ImageIcon size={10} /> Importer
                    </button>
                )}
            </div>
        </div>

        {/* Footer */}
        <button 
            onClick={() => setStep('EXPORT')}
            className="w-full mt-2 h-9 bg-white text-black hover:bg-zinc-200 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0"
        >
            Suivant <ArrowRight size={14} />
        </button>
      </div>
    );
  }

  // STEP 3: EXPORT
  if (step === 'EXPORT') {
    return (
      <div className="w-full h-full p-3 flex flex-col">
         {/* Nav */}
         <div className="flex items-center justify-between mb-1 shrink-0">
            <button onClick={() => setStep('LOGO')} className="p-1 hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors"><ChevronLeft size={16}/></button>
            <span className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">Exporter</span>
            <button onClick={reset} className="p-1 hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors"><RotateCcw size={14}/></button>
        </div>

        <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-3">
             {/* Quality Selector */}
             <div className="w-full">
                <label className="block text-center text-[10px] font-medium text-zinc-500 mb-2">QUALITÉ (PX)</label>
                <div className="flex gap-2">
                    {[
                        { l: 'SD', v: 500 },
                        { l: 'HD', v: 2000 },
                        { l: '4K', v: 4000 }
                    ].map((opt) => (
                        <button
                            key={opt.l}
                            onClick={() => setQuality(opt.v)}
                            className={`
                                flex-1 py-2 rounded-lg text-[10px] font-bold border transition-all
                                ${quality === opt.v 
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-900/50' 
                                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'}
                            `}
                        >
                            {opt.l}
                        </button>
                    ))}
                </div>
             </div>
        </div>

        <button 
            onClick={handleDownload}
            disabled={isProcessing}
            className="w-full mt-2 h-9 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20 active:scale-95 shrink-0"
        >
            {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            Télécharger
        </button>
      </div>
    );
  }

  return null;
};