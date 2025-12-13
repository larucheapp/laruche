import React, { useState } from 'react';
import { Skull, ArrowRight, Download, ChevronLeft, Calendar, Hourglass, Percent, RotateCcw } from 'lucide-react';

type Step = 'INPUT' | 'PREVIEW';

export const MementoMoriTool: React.FC = () => {
  const [step, setStep] = useState<Step>('INPUT');
  const [birthDate, setBirthDate] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Stats
  const [stats, setStats] = useState({
    weeksLived: 0,
    weeksLeft: 0,
    percentageLived: 0
  });

  const calculateStats = (dateStr: string) => {
    const dob = new Date(dateStr);
    const today = new Date();
    
    // Validate
    if (isNaN(dob.getTime()) || dob > today) return false;

    const weeksLived = Math.floor((today.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 7));
    const totalWeeksInLife = 5200; // 100 years
    const weeksLeft = Math.max(0, totalWeeksInLife - weeksLived);
    const percentageLived = (weeksLived / totalWeeksInLife) * 100;

    setStats({
      weeksLived,
      weeksLeft,
      percentageLived
    });
    return true;
  };

  const handleCalculate = () => {
    if (calculateStats(birthDate)) {
      setStep('PREVIEW');
    }
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
        const { jsPDF } = await import('https://esm.sh/jspdf@2.5.1');
        const doc = new jsPDF({ orientation: 'landscape' });
        
        const dob = new Date(birthDate);
        const violetColor = '#7C3AED';
        const textColorPrimary = '#141417';
        const textColorSecondary = '#6B7280';
        const borderColor = '#E9EAF0';
        const pageW = doc.internal.pageSize.getWidth();
        const pageH = doc.internal.pageSize.getHeight();
        
        const { weeksLived, weeksLeft, percentageLived } = stats;

        // --- PAGE 1 ---
        const headerTextY = 20;
        const textX = 15;

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(violetColor);
        doc.setFontSize(20);
        doc.text('Memento Mori', textX, headerTextY, { baseline: 'middle'});
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(textColorSecondary);
        doc.text('Calendrier de vie - Semaine par Semaine', textX, headerTextY + 7, { baseline: 'middle'});

        // Stats Dashboard
        const dashboardY = 35;
        const dashboardH = 25;
        doc.setFillColor('#F7F8FA');
        doc.setDrawColor(borderColor);
        doc.roundedRect(15, dashboardY, pageW - 30, dashboardH, 3, 3, 'FD');

        const cardWidth = (pageW - 40) / 3;
        const textY = dashboardY + 10;
        const valueY = dashboardY + 19;
        
        doc.setFontSize(8);
        doc.setTextColor(textColorSecondary);
        doc.text('SEMAINES VÉCUES', 15 + cardWidth/2, textY, { align: 'center' });
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(textColorPrimary);
        doc.text(weeksLived.toString(), 15 + cardWidth/2, valueY, { align: 'center' });
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(textColorSecondary);
        doc.text('SEMAINES RESTANTES (est.)', 15 + cardWidth * 1.5, textY, { align: 'center' });
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(textColorPrimary);
        doc.text(weeksLeft.toString(), 15 + cardWidth * 1.5, valueY, { align: 'center' });
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(textColorSecondary);
        doc.text('% ÉCOULÉ', 15 + cardWidth * 2.5, textY, { align: 'center' });
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(textColorPrimary);
        doc.text(`${percentageLived.toFixed(2)}%`, 15 + cardWidth * 2.5, valueY, { align: 'center' });

        // Progress bar
        const progressY = dashboardY + dashboardH + 4;
        const progressW = pageW - 30;
        doc.setDrawColor(borderColor);
        doc.rect(15, progressY, progressW, 3, 'S');
        doc.setFillColor(violetColor);
        doc.rect(15, progressY, progressW * (percentageLived/100), 3, 'F');

        // --- Life Calendar Grid ---
        const boxSize = 1.8;
        const gap = 0.4;
        const cols = 52;
        const gridWidth = cols * (boxSize + gap);
        
        const drawGrid = (startWeek: number, endWeek: number, startX: number, startY: number) => {
            for (let i = startWeek; i <= endWeek; i++) {
                const relativeWeekTotal = i - startWeek;
                const row = Math.floor(relativeWeekTotal / cols);
                const col = relativeWeekTotal % cols;
                const x = startX + col * (boxSize + gap);
                const y = startY + row * (boxSize + gap);
                
                doc.setLineWidth(0.1);
                if (i <= weeksLived) {
                    doc.setFillColor(violetColor);
                    doc.rect(x, y, boxSize, boxSize, 'F');
                } else {
                    doc.setDrawColor(violetColor);
                    doc.rect(x, y, boxSize, boxSize, 'S');
                }
            }
        };
        
        const drawYearMarkers = (startYear: number, endYear: number, startX: number, startY: number) => {
            doc.setFontSize(6);
            doc.setTextColor(textColorSecondary);
            for (let year = startYear; year <= endYear; year++) {
                if (year === 1 || year % 5 === 0) {
                        const y = startY + (year - startYear) * (boxSize + gap) + (boxSize / 2);
                        doc.text(`Y${year}`, startX - 3, y, { align: 'right', baseline: 'middle'});
                }
            }
        };
        
        const grid1StartY = progressY + 12;
        const grid1StartX = (pageW - gridWidth) / 2;
        drawGrid(1, 2600, grid1StartX, grid1StartY);
        drawYearMarkers(1, 50, grid1StartX, grid1StartY);

        doc.addPage();
        const grid2StartY = 20;
        const grid2StartX = (pageW - gridWidth) / 2;
        drawGrid(2601, 5200, grid2StartX, grid2StartY);
        drawYearMarkers(51, 100, grid2StartX, grid2StartY);
        
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor('#B0B0B0');
        doc.text('Each box represents one week of your life. Make them count.', pageW / 2, pageH - 12, { align: 'center' });

        const dateString = dob.toISOString().split('T')[0];
        doc.save(`memento-mori-${dateString}.pdf`);

    } catch (e) {
        console.error(e);
        alert('Erreur PDF');
    } finally {
        setIsGenerating(false);
    }
  };

  // STEP 1: INPUT
  if (step === 'INPUT') {
    return (
      <div className="w-full h-full p-3 flex flex-col justify-between">
         <div className="flex items-center gap-2 mb-2 text-zinc-400 shrink-0">
          <Skull size={18} />
          <h2 className="text-xs font-bold uppercase tracking-wider">Memento Mori</h2>
        </div>

        <div className="flex-1 flex flex-col justify-center gap-3">
          <div>
            <label className="block text-[10px] font-medium text-zinc-500 mb-1 ml-1">DATE DE NAISSANCE</label>
            <input 
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2.5 focus:border-white focus:outline-none transition-colors"
            />
          </div>
        </div>

        <button 
          onClick={handleCalculate}
          disabled={!birthDate}
          className="w-full h-9 bg-white text-black hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0"
        >
          Visualiser <ArrowRight size={14} />
        </button>
      </div>
    );
  }

  // STEP 2: PREVIEW / STATS
  return (
    <div className="w-full h-full p-3 flex flex-col">
       {/* Nav */}
       <div className="flex items-center justify-between mb-2 shrink-0">
        <button onClick={() => setStep('INPUT')} className="p-1 hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors">
          <ChevronLeft size={16}/>
        </button>
        <span className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">Vos Statistiques de Vie</span>
        <button onClick={() => setStep('INPUT')} className="p-1 hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors">
          <RotateCcw size={14}/>
        </button>
      </div>

      <div className="flex-1 min-h-0 flex flex-col gap-2">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 h-full">
            <div className="bg-zinc-800/50 rounded-lg p-2 flex flex-col items-center justify-center border border-zinc-700/30">
                <Calendar size={14} className="text-emerald-400 mb-1" />
                <span className="text-lg font-bold text-white leading-none">{stats.weeksLived}</span>
                <span className="text-[8px] text-zinc-500 uppercase font-medium">Semaines Vécues</span>
            </div>
             <div className="bg-zinc-800/50 rounded-lg p-2 flex flex-col items-center justify-center border border-zinc-700/30">
                <Hourglass size={14} className="text-orange-400 mb-1" />
                <span className="text-lg font-bold text-white leading-none">{stats.weeksLeft}</span>
                <span className="text-[8px] text-zinc-500 uppercase font-medium">Semaines Restantes</span>
            </div>
            <div className="col-span-2 bg-zinc-800/50 rounded-lg p-2 flex flex-col items-center justify-center border border-zinc-700/30 relative overflow-hidden">
                 {/* Progress BG */}
                 <div className="absolute left-0 top-0 bottom-0 bg-white/5" style={{ width: `${stats.percentageLived}%` }} />
                 
                 <div className="relative z-10 flex flex-col items-center">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <Percent size={12} className="text-violet-400" />
                        <span className="text-xl font-bold text-white leading-none">{stats.percentageLived.toFixed(1)}%</span>
                    </div>
                    <span className="text-[8px] text-zinc-500 uppercase font-medium">Vie Écoulée</span>
                 </div>
            </div>
        </div>
      </div>

      <button 
        onClick={generatePDF}
        disabled={isGenerating}
        className="w-full mt-2 h-9 bg-white text-black hover:bg-zinc-200 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0"
      >
        <Download size={14} /> {isGenerating ? '...' : 'Télécharger PDF'}
      </button>
    </div>
  );
};