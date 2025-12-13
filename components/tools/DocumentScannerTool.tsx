import React, { useState, useRef, useEffect } from 'react';
import { Scan, Camera, X, Download, RotateCcw, FileText, Check, Loader2 } from 'lucide-react';

export const DocumentScannerTool: React.FC = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Stop camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 } 
        }, 
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error(err);
      setError("Accès caméra refusé.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const processAndCrop = () => {
    if (!videoRef.current || !containerRef.current) return;
    
    setIsProcessing(true);
    const video = videoRef.current;
    
    // Create a temp canvas to draw the full video frame
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
    const ctx = tempCanvas.getContext('2d');
    
    if (!ctx) return;
    
    // Draw full frame
    ctx.drawImage(video, 0, 0);
    
    // Calculate crop coordinates based on the UI Guide (The yellow border box)
    // The video is "object-cover", so we need to calculate the visible ratio
    const videoRatio = video.videoWidth / video.videoHeight;
    const containerRatio = containerRef.current.clientWidth / containerRef.current.clientHeight;
    
    let renderWidth, renderHeight, offsetX, offsetY;

    // Calculate how the video is rendered in the container (CSS object-fit: cover logic)
    if (containerRatio > videoRatio) {
        renderWidth = containerRef.current.clientWidth;
        renderHeight = renderWidth / videoRatio;
        offsetX = 0;
        offsetY = (containerRef.current.clientHeight - renderHeight) / 2;
    } else {
        renderHeight = containerRef.current.clientHeight;
        renderWidth = renderHeight * videoRatio;
        offsetX = (containerRef.current.clientWidth - renderWidth) / 2;
        offsetY = 0;
    }

    // Guide dimensions (relative to container) -> assumed centered 80% width A4 ratio
    // Matches the CSS styling of the guide box below
    const guideW_px = Math.min(containerRef.current.clientWidth * 0.8, 600);
    const guideH_px = guideW_px * 1.414; // A4 Ratio
    
    // Center of container
    const cX = containerRef.current.clientWidth / 2;
    const cY = containerRef.current.clientHeight / 2;
    
    const guideLeft = cX - guideW_px / 2;
    const guideTop = cY - guideH_px / 2;

    // Map UI coordinates back to Video Source coordinates
    const scale = video.videoWidth / renderWidth;
    
    const sourceX = (guideLeft - offsetX) * scale;
    const sourceY = (guideTop - offsetY) * scale;
    const sourceW = guideW_px * scale;
    const sourceH = guideH_px * scale;

    // Final Canvas (Cropped)
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = sourceW;
    finalCanvas.height = sourceH;
    const fCtx = finalCanvas.getContext('2d');
    
    if (!fCtx) return;

    // Draw the cropped area
    fCtx.drawImage(
        tempCanvas, 
        sourceX, sourceY, sourceW, sourceH, // Source
        0, 0, finalCanvas.width, finalCanvas.height // Dest
    );

    // Apply "Scanner Filter" (High Contrast B&W)
    const imgData = fCtx.getImageData(0, 0, finalCanvas.width, finalCanvas.height);
    const data = imgData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Grayscale conversion
        const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        
        // Thresholding (make darks black, lights white)
        // Dynamic thresholding usually better, but simple hard threshold works for "Scan" look
        const val = gray > 110 ? 255 : 0;
        
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
    }
    fCtx.putImageData(imgData, 0, 0);

    setCapturedImage(finalCanvas.toDataURL('image/jpeg', 0.9));
    stopCamera();
    setIsProcessing(false);
  };

  const handleDownloadPDF = async () => {
    if (!capturedImage) return;
    setIsProcessing(true);
    try {
        const { jsPDF } = await import('https://esm.sh/jspdf@2.5.1');
        const doc = new jsPDF();
        
        const imgProps = doc.getImageProperties(capturedImage);
        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = doc.internal.pageSize.getHeight();
        
        doc.addImage(capturedImage, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        doc.save(`scan-${Date.now()}.pdf`);
    } catch (e) {
        console.error(e);
        alert("Erreur PDF");
    } finally {
        setIsProcessing(false);
    }
  };

  const reset = () => {
    setCapturedImage(null);
    startCamera();
  };

  return (
    <div className="w-full h-full flex flex-col p-3 relative overflow-hidden bg-zinc-950/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <div className="flex items-center gap-2 text-slate-400">
          <Scan size={18} />
          <h2 className="text-xs font-bold uppercase tracking-wider">Scanner Doc (PDF)</h2>
        </div>
        {capturedImage && (
            <button onClick={reset} className="text-zinc-500 hover:text-white transition-colors">
                <X size={16} />
            </button>
        )}
      </div>

      <div ref={containerRef} className="flex-1 min-h-0 relative bg-black rounded-lg overflow-hidden border border-zinc-800 flex flex-col items-center justify-center group">
        
        {/* State: ERROR */}
        {error && (
            <div className="text-red-400 text-xs text-center px-4 z-20">
                <p className="font-bold mb-2">Erreur Caméra</p>
                <button onClick={startCamera} className="bg-red-500/20 px-3 py-1 rounded hover:bg-red-500/30 transition-colors">Réessayer</button>
            </div>
        )}

        {/* State: START */}
        {!stream && !capturedImage && !error && (
            <div className="flex flex-col items-center gap-3 z-20">
                <div onClick={startCamera} className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center cursor-pointer hover:bg-zinc-700 hover:scale-105 transition-all">
                    <Camera size={28} className="text-slate-400 group-hover:text-white" />
                </div>
                <span className="text-[10px] text-zinc-500 font-bold uppercase">Activer Caméra</span>
            </div>
        )}

        {/* State: STREAMING */}
        {stream && !capturedImage && (
            <>
                <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="absolute inset-0 w-full h-full object-cover"
                />
                
                {/* Guide Overlay (The "Leaf" Cutter) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div 
                        className="border-2 border-slate-400/80 rounded-sm shadow-[0_0_0_1000px_rgba(0,0,0,0.7)] relative"
                        style={{ 
                            width: 'min(80%, 600px)', 
                            aspectRatio: '1/1.414' // A4
                        }}
                    >
                        <div className="absolute top-2 left-0 right-0 text-center">
                            <span className="bg-black/50 text-white text-[9px] px-2 py-1 rounded font-bold uppercase tracking-wider">
                                Alignez le document ici
                            </span>
                        </div>
                        {/* Corner markers */}
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-white -mt-0.5 -ml-0.5"></div>
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-white -mt-0.5 -mr-0.5"></div>
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-white -mb-0.5 -ml-0.5"></div>
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-white -mb-0.5 -mr-0.5"></div>
                    </div>
                </div>

                {/* Capture Button */}
                <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20">
                    <button 
                        onClick={processAndCrop}
                        disabled={isProcessing}
                        className="w-16 h-16 rounded-full border-[5px] border-white/20 flex items-center justify-center bg-white hover:bg-slate-200 transition-all active:scale-95 shadow-lg"
                    >
                        {isProcessing ? <Loader2 size={24} className="animate-spin text-black"/> : <div className="w-12 h-12 rounded-full border-2 border-black/10"></div>}
                    </button>
                </div>
            </>
        )}

        {/* State: PREVIEW (Captured & Cropped) */}
        {capturedImage && (
            <div className="relative w-full h-full flex flex-col">
                <img 
                    src={capturedImage} 
                    className="w-full h-full object-contain p-4 bg-zinc-900"
                />
                <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/60 px-3 py-1 rounded-full border border-white/10">
                    <span className="text-[10px] text-white flex items-center gap-1.5 font-bold">
                        <Check size={12} className="text-emerald-400"/> Scan réussi
                    </span>
                </div>
            </div>
        )}
      </div>

      {/* Footer Actions */}
      {capturedImage && (
          <div className="mt-2 flex gap-2 shrink-0">
              <button 
                onClick={reset}
                className="flex-1 h-9 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold rounded-lg flex items-center justify-center gap-2 transition-all"
              >
                  <RotateCcw size={14} /> Refaire
              </button>
              <button 
                onClick={handleDownloadPDF}
                disabled={isProcessing}
                className="flex-1 h-9 bg-slate-100 hover:bg-white text-black text-[10px] font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
              >
                  {isProcessing ? <Loader2 size={14} className="animate-spin"/> : <Download size={14} />} 
                  Télécharger PDF
              </button>
          </div>
      )}
    </div>
  );
};