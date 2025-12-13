import React, { useState, useRef, useEffect } from 'react';
import { ScanBarcode, Download, FileText, Loader2, AlertCircle } from 'lucide-react';

interface FormatOption {
    code: string;
    label: string;
    placeholder: string;
    hint: string;
}

const FORMATS: FormatOption[] = [
    { code: "CODE128", label: "CODE128", placeholder: "Texte ou Chiffres", hint: "ASCII Complet" },
    { code: "EAN13", label: "EAN-13", placeholder: "400638133393", hint: "12 chiffres exacts" },
    { code: "UPC", label: "UPC", placeholder: "03600029145", hint: "11 chiffres exacts" },
    { code: "CODE39", label: "CODE39", placeholder: "HELLO-123", hint: "Majuscules et - . $ / + %" },
    { code: "ITF", label: "ITF-14", placeholder: "123456789012", hint: "Chiffres (longueur paire)" }
];

export const BarcodeGeneratorTool: React.FC = () => {
  const [data, setData] = useState('12345678');
  const [format, setFormat] = useState('CODE128');
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  const svgRef = useRef<SVGSVGElement>(null);

  // Generate for Preview (White on Transparent)
  const generateBarcode = async () => {
      if (!data) return;
      setError(null);
      try {
          // Dynamic import of JsBarcode
          const JsBarcode = (await import('https://esm.sh/jsbarcode@3.11.5')).default;
          
          if (svgRef.current) {
              JsBarcode(svgRef.current, data, {
                  format: format,
                  lineColor: "#ffffff", // White bars for dark mode UI
                  background: "transparent", 
                  width: 2,
                  height: 60,
                  displayValue: true,
                  fontOptions: "bold",
                  fontSize: 14,
                  textColor: "#ffffff",
                  marginTop: 10,
                  marginBottom: 10,
              });
              // Reset error if successful
              setError(null);
          }
      } catch (e: any) {
          console.error("Barcode Error", e);
          let msg = "Données invalides pour ce format.";
          if (format === 'EAN13' && e.message?.includes('checksum')) {
              msg = "Checksum ou longueur invalide.";
          }
          setError(msg);
      }
  };

  // Helper: Generate BLACK on WHITE barcode string for Export
  const generateExportSVG = async (): Promise<string> => {
      const JsBarcode = (await import('https://esm.sh/jsbarcode@3.11.5')).default;
      const tempSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      
      JsBarcode(tempSvg, data, {
          format: format,
          lineColor: "#000000", // Black for export
          background: "#ffffff", // White background for standard compliance
          width: 2,
          height: 60,
          displayValue: true,
          fontOptions: "bold",
          fontSize: 14,
          textColor: "#000000",
          marginTop: 10,
          marginBottom: 10,
      });

      const serializer = new XMLSerializer();
      let svgStr = serializer.serializeToString(tempSvg);
      
      // Fix potential missing namespace for standalone usage
      if (!svgStr.includes('xmlns="http://www.w3.org/2000/svg"')) {
         svgStr = svgStr.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
      }
      return svgStr;
  };

  // Auto-generate preview when inputs change
  useEffect(() => {
      const timer = setTimeout(() => {
          generateBarcode();
      }, 500); // Debounce
      return () => clearTimeout(timer);
  }, [data, format]);

  const currentFormat = FORMATS.find(f => f.code === format) || FORMATS[0];

  const handleDownloadSVG = async () => {
      if (!data || error) return;
      try {
          const svgString = await generateExportSVG();
          const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `barcode-${data}.svg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
      } catch (e) {
          console.error("SVG Export Error", e);
      }
  };

  const handleDownloadPDF = async () => {
    if (!data || error) return;
    setIsGeneratingPdf(true);
    try {
        const { jsPDF } = await import('https://esm.sh/jspdf@2.5.1');
        
        // 1. Get Export SVG (Black/White)
        const svgString = await generateExportSVG();
        
        const svgBlob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
        const url = URL.createObjectURL(svgBlob);
        
        const img = new Image();
        img.onload = () => {
            // Setup High Res Canvas
            const w = img.width || 200;
            const h = img.height || 100;
            const canvas = document.createElement('canvas');
            canvas.width = w * 2; 
            canvas.height = h * 2;
            const ctx = canvas.getContext('2d');
            
            if (ctx) {
                // Ensure white background on canvas (transparent usually becomes black in some PDF viewers)
                ctx.fillStyle = "#FFFFFF";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                ctx.scale(2, 2);
                ctx.drawImage(img, 0, 0);
                
                const imgData = canvas.toDataURL('image/png');
                
                // 2. Generate PDF
                const doc = new jsPDF();
                
                doc.setFontSize(20);
                doc.text("Planche de Codes-Barres", 105, 20, { align: 'center' });
                
                // Simple grid of barcodes
                const bw = 50; // mm
                const bh = 30; // mm
                const gap = 10;
                const cols = 3;
                const rows = 5;
                const startX = (210 - (cols * bw + (cols - 1) * gap)) / 2;
                const startY = 40;

                for(let r=0; r<rows; r++) {
                    for(let c=0; c<cols; c++) {
                        doc.addImage(imgData, 'PNG', startX + c*(bw+gap), startY + r*(bh+gap), bw, bh);
                    }
                }

                doc.save(`barcodes-${data}.pdf`);
            }
            setIsGeneratingPdf(false);
            URL.revokeObjectURL(url);
        };
        
        img.onerror = () => {
            console.error("Image load failed");
            alert("Erreur de rendu.");
            setIsGeneratingPdf(false);
            URL.revokeObjectURL(url);
        };
        
        img.src = url;

    } catch (e) {
        console.error(e);
        alert('Erreur PDF');
        setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-3 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2 text-teal-400 shrink-0">
            <ScanBarcode size={18} />
            <h2 className="text-xs font-bold uppercase tracking-wider">Code-Barres</h2>
        </div>

        <div className="flex-1 flex flex-col gap-3 min-h-0 overflow-y-auto custom-scrollbar pr-1">
            
            {/* Inputs */}
            <div className="flex flex-col gap-2">
                <div>
                     <label className="text-[9px] font-bold text-zinc-500 mb-1 block">CONTENU</label>
                     <input 
                        type="text" 
                        value={data}
                        onChange={(e) => setData(e.target.value)}
                        placeholder={currentFormat.placeholder}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-xs text-white focus:border-teal-500 outline-none transition-colors font-mono"
                     />
                     <span className="text-[9px] text-zinc-600 mt-1 block">{currentFormat.hint}</span>
                </div>

                <div>
                    <label className="text-[9px] font-bold text-zinc-500 mb-1 block">FORMAT</label>
                    <div className="flex flex-wrap gap-1">
                        {FORMATS.map(f => (
                            <button
                                key={f.code}
                                onClick={() => setFormat(f.code)}
                                className={`
                                    px-2 py-1 rounded text-[10px] font-bold border transition-all
                                    ${format === f.code 
                                        ? 'bg-teal-500/20 text-teal-300 border-teal-500/50' 
                                        : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'}
                                `}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Preview Area */}
            <div className="flex-1 min-h-[100px] bg-zinc-800/30 rounded-lg border border-zinc-700/50 flex flex-col items-center justify-center p-2 relative">
                {error ? (
                    <div className="flex flex-col items-center gap-2 text-red-400">
                        <AlertCircle size={20} />
                        <span className="text-xs font-medium text-center">{error}</span>
                    </div>
                ) : (
                    <svg ref={svgRef} className="max-w-full max-h-full"></svg>
                )}
            </div>

        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-2 pt-2 border-t border-white/5 shrink-0">
            <button 
                onClick={handleDownloadSVG}
                disabled={!!error || !data}
                className="flex-1 h-8 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
                <Download size={12} /> SVG
            </button>
            <button 
                onClick={handleDownloadPDF}
                disabled={!!error || !data || isGeneratingPdf}
                className="flex-1 h-8 bg-teal-600 hover:bg-teal-500 text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-teal-900/20"
            >
                {isGeneratingPdf ? <Loader2 size={12} className="animate-spin"/> : <FileText size={12} />}
                Planche PDF
            </button>
        </div>
    </div>
  );
};