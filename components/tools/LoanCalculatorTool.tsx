import React, { useState, useEffect } from 'react';
import { Calculator, PieChart, Download, Loader2, DollarSign, Percent, Calendar } from 'lucide-react';

export const LoanCalculatorTool: React.FC = () => {
  const [amount, setAmount] = useState(150000);
  const [rate, setRate] = useState(1.75);
  const [term, setTerm] = useState(20);
  const [isGenerating, setIsGenerating] = useState(false);

  const [results, setResults] = useState({
    monthly: 0,
    totalInterest: 0,
    totalCost: 0
  });

  const calculate = () => {
    const P = amount;
    const annualRate = rate;
    const i = annualRate / 100 / 12; // Monthly rate
    const n = term * 12; // Months

    if (P <= 0 || annualRate <= 0 || n <= 0) {
        setResults({ monthly: 0, totalInterest: 0, totalCost: 0 });
        return;
    }

    const M = P * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
    
    if (isFinite(M)) {
        const totalCost = M * n;
        const totalInterest = totalCost - P;
        setResults({
            monthly: M,
            totalInterest,
            totalCost
        });
    } else {
        setResults({ monthly: 0, totalInterest: 0, totalCost: 0 });
    }
  };

  useEffect(() => {
    calculate();
  }, [amount, rate, term]);

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
        const { jsPDF } = await import('https://esm.sh/jspdf@2.5.1');
        const doc = new jsPDF();
        
        const violetColor = '#7C3AED';
        const greenColor = '#10B981';
        const textColor = '#141417';

        // Header
        doc.setFillColor(violetColor);
        doc.rect(0, 0, 210, 25, 'F');
        doc.setFontSize(18);
        doc.setTextColor('#FFFFFF');
        doc.text("Simulation de Prêt", 105, 16, { align: 'center' });

        let y = 50;
        doc.setFontSize(12);
        doc.setTextColor(textColor);
        doc.text("Mensualité estimée", 105, y, { align: 'center' });
        y += 10;
        doc.setFontSize(24);
        doc.setTextColor(violetColor);
        doc.setFont('helvetica', 'bold');
        doc.text(`${results.monthly.toLocaleString('fr-FR', {style:'currency', currency:'EUR'})}`, 105, y, { align: 'center' });
        
        y += 20;
        doc.setFontSize(12);
        doc.setTextColor(textColor);
        doc.setFont('helvetica', 'normal');
        doc.text(`Montant: ${amount.toLocaleString('fr-FR')} €`, 20, y);
        doc.text(`Taux: ${rate} %`, 20, y + 8);
        doc.text(`Durée: ${term} ans`, 20, y + 16);

        y += 30;
        doc.setFont('helvetica', 'bold');
        doc.text("Coût Total", 20, y);
        doc.setLineWidth(0.5);
        doc.line(20, y + 2, 80, y + 2);
        y += 10;
        doc.setFont('helvetica', 'normal');
        doc.text(`Intérêts: ${results.totalInterest.toLocaleString('fr-FR', {style:'currency', currency:'EUR'})}`, 20, y);
        doc.text(`Total remboursé: ${results.totalCost.toLocaleString('fr-FR', {style:'currency', currency:'EUR'})}`, 20, y + 8);

        doc.save('simulation-emprunt.pdf');
    } catch (e) {
        console.error(e);
        alert('Erreur PDF');
    } finally {
        setIsGenerating(false);
    }
  };

  // Pie chart calculation
  const total = amount + results.totalInterest;
  const interestPercent = total > 0 ? (results.totalInterest / total) * 100 : 0;
  const pieGradient = `conic-gradient(#7c3aed 0% ${100 - interestPercent}%, #10b981 ${100 - interestPercent}% 100%)`;

  return (
    <div className="w-full h-full flex flex-col p-3 relative overflow-hidden">
       <div className="flex items-center gap-2 mb-3 text-violet-400 shrink-0">
          <Calculator size={18} />
          <h2 className="text-xs font-bold uppercase tracking-wider">Calcul Prêt</h2>
       </div>

       <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-0">
            {/* INPUTS */}
            <div className="flex flex-col gap-4 mb-4">
                {/* Amount */}
                <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500">
                        <span className="flex items-center gap-1"><DollarSign size={10}/> MONTANT</span>
                        <span className="text-white bg-zinc-800 px-1.5 py-0.5 rounded">{amount.toLocaleString()} €</span>
                    </div>
                    <input 
                        type="range" min="1000" max="500000" step="1000" 
                        value={amount} onChange={(e) => setAmount(Number(e.target.value))}
                        className="w-full accent-violet-500 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                    />
                </div>

                {/* Rate */}
                <div className="space-y-1">
                     <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500">
                        <span className="flex items-center gap-1"><Percent size={10}/> TAUX</span>
                        <span className="text-white bg-zinc-800 px-1.5 py-0.5 rounded">{rate} %</span>
                    </div>
                    <input 
                        type="range" min="0.1" max="10" step="0.01" 
                        value={rate} onChange={(e) => setRate(Number(e.target.value))}
                        className="w-full accent-violet-500 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                    />
                </div>

                {/* Term */}
                <div className="space-y-1">
                     <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500">
                        <span className="flex items-center gap-1"><Calendar size={10}/> DURÉE</span>
                        <span className="text-white bg-zinc-800 px-1.5 py-0.5 rounded">{term} Ans</span>
                    </div>
                    <input 
                        type="range" min="1" max="30" step="1" 
                        value={term} onChange={(e) => setTerm(Number(e.target.value))}
                        className="w-full accent-violet-500 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
            </div>

            {/* RESULTS */}
            <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-lg p-3 flex items-center justify-between">
                <div className="flex flex-col">
                     <span className="text-[9px] font-bold text-zinc-500 uppercase mb-1">Mensualité</span>
                     <span className="text-2xl font-bold text-white">{results.monthly.toLocaleString(undefined, {maximumFractionDigits: 0})}€</span>
                     <span className="text-[9px] text-zinc-600">Coût Total: {results.totalCost.toLocaleString(undefined, {maximumFractionDigits: 0})}€</span>
                </div>
                
                {/* Pie Chart Visual */}
                <div className="w-12 h-12 rounded-full relative shrink-0" style={{ background: pieGradient }}>
                    <div className="absolute inset-1.5 bg-zinc-900 rounded-full flex items-center justify-center">
                        <PieChart size={14} className="text-zinc-500"/>
                    </div>
                </div>
            </div>
            
            <div className="flex justify-between text-[8px] text-zinc-500 mt-1 px-1">
                 <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-violet-500"/> Capital</div>
                 <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"/> Intérêts</div>
            </div>
       </div>

       <button 
         onClick={generatePDF}
         disabled={isGenerating}
         className="w-full mt-3 h-9 bg-white text-black hover:bg-zinc-200 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0"
       >
         {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
         Exporter Rapport
       </button>
    </div>
  );
};