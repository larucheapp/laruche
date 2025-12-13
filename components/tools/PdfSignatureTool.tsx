import React, { useState, useRef, useEffect } from 'react';
import { PenLine, Upload, Download, RotateCcw, ChevronRight, ChevronLeft, Loader2, Check, Eraser } from 'lucide-react';

type Step = 'UPLOAD' | 'SIGN' | 'PLACE';

interface PlacedSignature {
  x: number;
  y: number;
  page: number;
}

export const PdfSignatureTool: React.FC = () => {
  const [step, setStep] = useState<Step>('UPLOAD');
  const [file, setFile] = useState<File | null>(null);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  // PDF View State
  const [numPages, setNumPages] = useState(0);
  const [currPage, setCurrPage] = useState(1);
  const [placedSig, setPlacedSig] = useState<PlacedSignature | null>(null);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sigCanvasRef = useRef<HTMLCanvasElement>(null);
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<any>(null); // Reference to loaded PDFJS doc

  // --- Step 1: Upload ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && f.type === 'application/pdf') {
      setFile(f);
      setStep('SIGN');
    } else {
        alert("Veuillez sélectionner un fichier PDF valide.");
    }
  };

  // --- Step 2: Signature Canvas ---
  useEffect(() => {
    if (step === 'SIGN' && sigCanvasRef.current) {
        const timer = setTimeout(() => {
            const canvas = sigCanvasRef.current;
            if (!canvas) return;
            
            const parent = canvas.parentElement;
            if (parent) {
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight;
            }

            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = '#000';
            
            let isDrawing = false;
            
            const getPos = (e: MouseEvent | TouchEvent) => {
                const rect = canvas.getBoundingClientRect();
                const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
                const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
                return { x: clientX - rect.left, y: clientY - rect.top };
            };

            const start = (e: any) => {
                e.preventDefault();
                isDrawing = true;
                const { x, y } = getPos(e);
                ctx.beginPath();
                ctx.moveTo(x, y);
            };
            const move = (e: any) => {
                if (!isDrawing) return;
                e.preventDefault();
                const { x, y } = getPos(e);
                ctx.lineTo(x, y);
                ctx.stroke();
            };
            const end = () => isDrawing = false;

            canvas.addEventListener('mousedown', start);
            canvas.addEventListener('touchstart', start, { passive: false });
            canvas.addEventListener('mousemove', move);
            canvas.addEventListener('touchmove', move, { passive: false });
            window.addEventListener('mouseup', end);
            window.addEventListener('touchend', end);

            return () => {
                canvas.removeEventListener('mousedown', start);
                canvas.removeEventListener('touchstart', start);
                canvas.removeEventListener('mousemove', move);
                canvas.removeEventListener('touchmove', move);
                window.removeEventListener('mouseup', end);
                window.removeEventListener('touchend', end);
            };
        }, 100);
        return () => clearTimeout(timer);
    }
  }, [step]);

  const clearSignature = () => {
      const canvas = sigCanvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = () => {
      if (sigCanvasRef.current) {
          const dataUrl = sigCanvasRef.current.toDataURL('image/png');
          setSignatureData(dataUrl);
          loadPdf(); 
      }
  };

  // --- Step 3: Place & PDF Logic ---
  
  const loadPdf = async () => {
      if (!file) return;
      setIsProcessing(true);
      setLoadingMessage('Chargement du moteur PDF...');
      
      try {
          // Use stable v3.11.174 via esm.sh
          // esm.sh provides proper ESM exports for browser usage
          const pdfjsModule = await import('https://esm.sh/pdfjs-dist@3.11.174');
          const pdfjsLib = pdfjsModule.default || pdfjsModule;
          
          // Worker from cdnjs matching version 3.11.174
          // This is the most robust way to load the worker in browser-only React
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
          
          const arrayBuffer = await file.arrayBuffer();
          setLoadingMessage('Ouverture du document...');

          const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
          
          // Add timeout race to prevent infinite hanging
          const doc = await Promise.race([
              loadingTask.promise,
              new Promise((_, reject) => setTimeout(() => reject(new Error("Le moteur PDF ne répond pas (Timeout)")), 15000))
          ]);
          
          pdfDocRef.current = doc;
          setNumPages(doc.numPages);
          setCurrPage(1);
          setStep('PLACE');
          
          // Wait for DOM to update with PLACE layout before rendering
          setTimeout(() => renderPage(1, doc), 100);

      } catch (e: any) {
          console.error("Erreur PDF:", e);
          alert(`Erreur technique : ${e.message || "Impossible de charger le PDF"}. Réessayez avec un autre fichier.`);
          setStep('UPLOAD'); // Reset to start on error
      } finally {
          setIsProcessing(false);
          setLoadingMessage('');
      }
  };

  // Handle Resize
  useEffect(() => {
      const handleResize = () => {
          if (step === 'PLACE' && pdfDocRef.current) {
              renderPage(currPage);
          }
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
  }, [step, currPage]);

  const renderPage = async (pageNum: number, doc = pdfDocRef.current) => {
      if (!doc || !pdfCanvasRef.current || !pdfContainerRef.current) return;
      
      try {
          const page = await doc.getPage(pageNum);
          
          // Get container dimensions to fit the page
          const containerW = pdfContainerRef.current.clientWidth;
          const containerH = pdfContainerRef.current.clientHeight;
          
          // Calculate scale to fit fully within container (contain)
          const unscaledViewport = page.getViewport({ scale: 1 });
          const scaleW = (containerW - 10) / unscaledViewport.width; // 10px padding safety
          const scaleH = (containerH - 10) / unscaledViewport.height;
          
          const scale = Math.min(scaleW, scaleH);
          
          const viewport = page.getViewport({ scale });
          const canvas = pdfCanvasRef.current;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
              canvas.height = viewport.height;
              canvas.width = viewport.width;
              await page.render({ canvasContext: ctx, viewport }).promise;
          }
      } catch(e) {
          console.error("Erreur rendu page:", e);
      }
  };

  const handlePageChange = (delta: number) => {
      const next = Math.max(1, Math.min(numPages, currPage + delta));
      setCurrPage(next);
      renderPage(next);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
      if (!pdfCanvasRef.current) return;
      const rect = pdfCanvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setPlacedSig({ x, y, page: currPage });
  };

  const handleExport = async () => {
      if (!file || !signatureData || !placedSig) return;
      setIsProcessing(true);
      setLoadingMessage('Création du fichier...');
      
      try {
          const { PDFDocument } = await import('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.esm.js');
          
          const pdfBytes = await file.arrayBuffer();
          const pdfDoc = await PDFDocument.load(pdfBytes);
          const sigImage = await pdfDoc.embedPng(signatureData);
          
          const page = pdfDoc.getPages()[placedSig.page - 1];
          const { width, height } = page.getSize();
          
          const sigW = width * 0.25; // 25% width
          const sigH = (sigImage.height / sigImage.width) * sigW;
          
          page.drawImage(sigImage, {
              x: placedSig.x * width - (sigW / 2),
              y: height - (placedSig.y * height) - (sigH / 2),
              width: sigW,
              height: sigH,
          });

          const modifiedPdfBytes = await pdfDoc.save();
          const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `signe_${file.name}`;
          link.click();
      } catch (e) {
          console.error(e);
          alert("Erreur lors de l'export.");
      } finally {
          setIsProcessing(false);
          setLoadingMessage(''); // Reset loading message to remove overlay
      }
  };

  const reset = () => {
      setStep('UPLOAD');
      setFile(null);
      setSignatureData(null);
      setPlacedSig(null);
      if(fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full h-full flex flex-col p-3 relative overflow-hidden bg-zinc-950/30">
        {/* Header */}
        <div className="flex items-center justify-between mb-2 shrink-0">
            <div className="flex items-center gap-2 text-red-400">
                <PenLine size={18} />
                <h2 className="text-[10px] font-bold uppercase tracking-wider">Signer PDF</h2>
            </div>
            {step !== 'UPLOAD' && (
                <button onClick={reset} className="text-zinc-500 hover:text-white transition-colors" title="Recommencer">
                    <RotateCcw size={14} />
                </button>
            )}
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 flex flex-col relative">
            
            {/* STEP 1: UPLOAD */}
            {step === 'UPLOAD' && (
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex flex-col items-center justify-center gap-3 border border-dashed border-zinc-700 bg-zinc-900/50 rounded-xl cursor-pointer hover:bg-zinc-900 transition-colors group animate-fade-in"
                >
                    <div className="p-3 bg-zinc-800 rounded-full group-hover:bg-zinc-700 text-red-400 transition-colors shadow-lg">
                        <Upload size={24} />
                    </div>
                    <div className="text-center">
                        <span className="text-xs font-bold text-white block">Cliquez pour importer</span>
                        <span className="text-[10px] text-zinc-500">PDF uniquement</span>
                    </div>
                    <input ref={fileInputRef} type="file" accept="application/pdf" hidden onChange={handleFileChange} />
                </div>
            )}

            {/* STEP 2: DRAW SIGNATURE */}
            {step === 'SIGN' && (
                <div className="flex flex-col h-full gap-3 animate-fade-in">
                    <div className="text-[10px] text-zinc-400 text-center uppercase font-bold tracking-wide">
                        Dessinez votre signature
                    </div>
                    
                    <div className="flex-1 bg-white rounded-xl overflow-hidden relative cursor-crosshair shadow-inner border-4 border-zinc-800">
                        <canvas ref={sigCanvasRef} className="w-full h-full touch-none" />
                        <div className="absolute top-2 right-2 pointer-events-none opacity-20">
                            <PenLine size={24} className="text-black" />
                        </div>
                    </div>

                    {isProcessing ? (
                        <div className="h-10 flex items-center justify-center gap-2 text-red-400">
                            <Loader2 size={16} className="animate-spin" />
                            <span className="text-xs font-bold">{loadingMessage}</span>
                        </div>
                    ) : (
                        <div className="flex gap-2 shrink-0 h-10">
                            <button 
                                onClick={clearSignature} 
                                className="px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-bold transition-colors flex items-center gap-2"
                            >
                                <Eraser size={14} /> Effacer
                            </button>
                            <button 
                                onClick={saveSignature} 
                                className="flex-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-red-900/20 active:scale-95 flex items-center justify-center gap-2"
                            >
                                Valider et Placer <ChevronRight size={14} />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* STEP 3: PLACE & EXPORT - NEW LAYOUT */}
            {step === 'PLACE' && (
                <div className="flex flex-col md:flex-row h-full gap-3 animate-fade-in">
                    
                    {/* Controls Sidebar */}
                    <div className="flex flex-col gap-3 justify-center md:w-48 shrink-0 order-2 md:order-1">
                         {/* Pagination */}
                         <div className="flex items-center justify-between bg-zinc-800 rounded-lg p-1 border border-zinc-700">
                                <button onClick={() => handlePageChange(-1)} disabled={currPage <= 1} className="p-2 hover:bg-zinc-700 rounded text-zinc-300 disabled:opacity-30 transition-colors"><ChevronLeft size={16}/></button>
                                <span className="text-xs font-bold text-zinc-200">Page {currPage} / {numPages}</span>
                                <button onClick={() => handlePageChange(1)} disabled={currPage >= numPages} className="p-2 hover:bg-zinc-700 rounded text-zinc-300 disabled:opacity-30 transition-colors"><ChevronRight size={16}/></button>
                         </div>

                         {/* Instruction */}
                         <div className="text-[10px] text-zinc-500 text-center leading-tight bg-zinc-900/50 p-2 rounded border border-zinc-800/50">
                            {placedSig ? "Signature placée ! Vous pouvez la déplacer ou télécharger le document." : "Cliquez sur l'aperçu à droite pour placer votre signature."}
                         </div>

                         {/* Export Button */}
                         <button 
                                onClick={handleExport} 
                                disabled={!placedSig}
                                className="h-10 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:shadow-none text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
                            >
                                {isProcessing ? <Loader2 size={16} className="animate-spin"/> : <Download size={16} />} 
                                {isProcessing ? 'Génération...' : 'Télécharger'}
                         </button>
                    </div>

                    {/* PDF Viewer (Right) */}
                    <div ref={pdfContainerRef} className="flex-1 bg-zinc-900 rounded-xl border border-zinc-800 relative flex items-center justify-center overflow-hidden order-1 md:order-2">
                        {/* Wrapper for canvas to allow marker positioning relative to canvas size */}
                        <div className="relative shadow-2xl">
                             <canvas ref={pdfCanvasRef} onClick={handleCanvasClick} className="block cursor-pointer border border-white/5 bg-white" />
                             
                             {/* Signature Marker */}
                             {placedSig && placedSig.page === currPage && (
                                <div 
                                    className="absolute w-6 h-6 bg-red-500/80 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center shadow-lg transform transition-all duration-200 animate-in zoom-in"
                                    style={{ left: `${placedSig.x * 100}%`, top: `${placedSig.y * 100}%` }}
                                >
                                    <Check size={14} className="text-white" />
                                </div>
                             )}
                        </div>
                        
                        {/* Loading Overlay */}
                        {loadingMessage && (
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                                <div className="bg-zinc-900 px-4 py-2 rounded-full border border-zinc-700 flex items-center gap-2">
                                    <Loader2 size={14} className="animate-spin text-white"/>
                                    <span className="text-xs text-white">{loadingMessage}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};