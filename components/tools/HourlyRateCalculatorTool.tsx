import React, { useState } from 'react';
import { Timer, RotateCcw, Download, Loader2, Euro, Clock } from 'lucide-react';

export const HourlyRateCalculatorTool: React.FC = () => {
  const [rate, setRate] = useState<number | ''>('');
  const [hours, setHours] = useState<number | ''>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Calculate Total
  const total = (Number(rate) || 0) * (Number(hours) || 0);

  const formatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  });

  const handleReset = () => {
    setRate('');
    setHours('');
  };

  const generatePDF = async () => {
    if (!rate || !hours) {
        alert("Veuillez entrer un taux et des heures valides.");
        return;
    }
    
    setIsGenerating(true);
    try {
        const { jsPDF } = await import('https://esm.sh/jspdf@2.5.1');
        
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const dateStr = new Date().toLocaleDateString('fr-FR');
        
        // Colors
        const violetColor = '#7C3AED';
        
        // Header
        doc.setFillColor(violetColor);
        doc.rect(0, 0, pageWidth, 25, 'F');
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(255, 255, 255);
        doc.text("Devis Estimatif / Calcul", pageWidth / 2, 17, { align: 'center' });
        
        // Date
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Date : ${dateStr}`, margin, 40);
        
        // Details
        let y = 60;
        doc.setFontSize(12);
        doc.setTextColor(20);
        
        // Rate Row
        doc.text(`Taux horaire :`, margin, y);
        doc.setFont("helvetica", "bold");
        doc.text(`${formatter.format(Number(rate))} / h`, pageWidth - margin, y, { align: "right" });
        doc.setFont("helvetica", "normal");
        
        y += 12;
        // Hours Row
        doc.text(`Temps de travail :`, margin, y);
        doc.setFont("helvetica", "bold");
        doc.text(`${hours} heures`, pageWidth - margin, y, { align: "right" });
        
        // Separator
        y += 15;
        doc.setDrawColor(200);
        doc.line(margin, y, pageWidth - margin, y);
        
        // Total Box
        y += 15;
        doc.setFillColor(245, 243, 255); // Light Violet bg
        doc.roundedRect(margin, y, pageWidth - (margin * 2), 40, 3, 3, "F");
        
        y += 15;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(violetColor);
        doc.text(`Montant Total`, margin + 15, y);
        
        doc.setFontSize(22);
        doc.text(formatter.format(total), pageWidth - margin - 15, y + 2, { align: "right" });
        
        // Footer
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text("Ce document est une estimation générée automatiquement.", pageWidth / 2, pageHeight - 15, { align: "center" });
        
        doc.save(`estimation_${Date.now()}.pdf`);
    } catch (e) {
        console.error(e);
        alert('Erreur lors de la génération du PDF');
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-3 relative overflow-hidden">
       {/* Header */}
       <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-2 text-violet-400">
             <Timer size={18} />
             <h2 className="text-xs font-bold uppercase tracking-wider">Taux Horaire</h2>
          </div>
          {(rate || hours) && (
              <button 
                onClick={handleReset} 
                className="text-zinc-500 hover:text-white transition-colors"
                title="Reset"
              >
                  <RotateCcw size={14} />
              </button>
          )}
       </div>

       <div className="flex-1 overflow-y-auto min-h-0 flex flex-col gap-4">
            
            {/* Inputs Grid */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-500 flex items-center gap-1">
                        <Euro size={10} /> TAUX / HEURE
                    </label>
                    <input 
                        type="number"
                        min="0"
                        step="0.5"
                        placeholder="0"
                        value={rate}
                        onChange={(e) => setRate(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-sm font-bold text-white focus:border-violet-500 outline-none transition-colors"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-500 flex items-center gap-1">
                        <Clock size={10} /> HEURES
                    </label>
                    <input 
                        type="number"
                        min="0"
                        step="0.25"
                        placeholder="0"
                        value={hours}
                        onChange={(e) => setHours(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-sm font-bold text-white focus:border-violet-500 outline-none transition-colors"
                    />
                </div>
            </div>

            {/* Result Display */}
            <div className="flex-1 bg-zinc-800/40 border border-zinc-700/50 rounded-xl flex flex-col items-center justify-center p-4 gap-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total Estimé</span>
                <span className="text-3xl font-bold text-white truncate max-w-full">
                    {formatter.format(total)}
                </span>
            </div>
       </div>

       {/* Actions */}
       <button 
         onClick={generatePDF}
         disabled={isGenerating || (!rate && !hours)}
         className="w-full mt-3 h-9 bg-white text-black hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0"
       >
         {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
         Exporter Devis
       </button>
    </div>
  );
};