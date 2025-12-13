import React, { useState } from 'react';
import { Activity, Check, Calendar, RotateCcw, Download, Loader2, Target, Trophy } from 'lucide-react';

const DURATIONS = [
  { days: 21, label: 'Initiation' },
  { days: 30, label: 'Classique' },
  { days: 66, label: 'Ancrage' },
  { days: 90, label: 'Lifestyle' },
  { days: 100, label: 'Monk Mode' },
];

export const HabitTrackerTool: React.FC = () => {
  const [view, setView] = useState<'CONFIG' | 'TRACKER'>('CONFIG');
  const [config, setConfig] = useState({
    name: '',
    motivation: '',
    duration: 30
  });
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);

  // --- Handlers ---

  const toggleDay = (day: number) => {
    const newSet = new Set(completedDays);
    if (newSet.has(day)) {
      newSet.delete(day);
    } else {
      newSet.add(day);
    }
    setCompletedDays(newSet);
  };

  const startTracker = () => {
    if (!config.name) setConfig(prev => ({ ...prev, name: 'Nouvelle Habitude' }));
    setView('TRACKER');
  };

  const reset = () => {
    setView('CONFIG');
    setCompletedDays(new Set());
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
        const { jsPDF } = await import('https://esm.sh/jspdf@2.5.1');
        const doc = new jsPDF();
        
        const violetColor = '#7C3AED';
        const bgLight = '#F3F4F6';
        const pageW = doc.internal.pageSize.getWidth();
        const margin = 20;

        // Header
        doc.setFillColor(violetColor);
        doc.rect(0, 0, pageW, 40, 'F');
        
        doc.setFontSize(22);
        doc.setTextColor('#FFFFFF');
        doc.setFont('helvetica', 'bold');
        doc.text(config.name || "Habitude", pageW / 2, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'italic');
        doc.text(config.motivation || "Pas d'excuses.", pageW / 2, 30, { align: 'center' });

        // Stats
        const count = completedDays.size;
        const progress = Math.round((count / config.duration) * 100);
        
        let y = 60;
        
        // Progress Bar in PDF
        doc.setDrawColor('#E5E7EB');
        doc.setFillColor('#FFFFFF');
        doc.roundedRect(margin, y, pageW - (margin * 2), 10, 3, 3, 'FD');
        doc.setFillColor(violetColor);
        if (progress > 0) {
            doc.roundedRect(margin, y, (pageW - (margin * 2)) * (progress / 100), 10, 3, 3, 'F');
        }
        
        y += 20;
        doc.setTextColor('#374151');
        doc.setFont('helvetica', 'bold');
        doc.text(`Progression: ${progress}% (${count}/${config.duration} jours)`, margin, y);
        doc.setFont('helvetica', 'normal');
        doc.text(`Début: ${new Date().toLocaleDateString()}`, pageW - margin, y, { align: 'right' });

        // Grid
        y += 15;
        const boxSize = 12;
        const gap = 4;
        const cols = 10;
        
        doc.setDrawColor(violetColor);
        doc.setLineWidth(0.5);

        for (let i = 1; i <= config.duration; i++) {
            const row = Math.floor((i - 1) / cols);
            const col = (i - 1) % cols;
            const x = margin + col * (boxSize + gap);
            const drawY = y + row * (boxSize + gap);

            // Check page break
            if (drawY > 270) {
                doc.addPage();
                y = 20;
            }

            if (completedDays.has(i)) {
                doc.setFillColor(violetColor);
                doc.rect(x, drawY, boxSize, boxSize, 'F');
                doc.setTextColor('#FFFFFF');
                doc.setFontSize(8);
                doc.text(i.toString(), x + boxSize/2, drawY + boxSize/2 + 1, { align: 'center', baseline: 'middle' });
            } else {
                doc.rect(x, drawY, boxSize, boxSize, 'S');
                doc.setTextColor(violetColor);
                doc.setFontSize(8);
                doc.text(i.toString(), x + boxSize/2, drawY + boxSize/2 + 1, { align: 'center', baseline: 'middle' });
            }
        }

        doc.save(`tracker-${config.name.replace(/\s+/g, '_')}.pdf`);

    } catch (e) {
        console.error(e);
        alert('Erreur PDF');
    } finally {
        setIsGenerating(false);
    }
  };

  // --- Renders ---

  const progressPercent = Math.round((completedDays.size / config.duration) * 100);

  if (view === 'CONFIG') {
    return (
      <div className="w-full h-full flex flex-col p-3 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-3 text-violet-400 shrink-0">
            <Activity size={18} />
            <h2 className="text-xs font-bold uppercase tracking-wider">Suivi Habitudes</h2>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3 min-h-0">
            <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-500 uppercase">Objectif</label>
                <input 
                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-xs text-white focus:border-violet-500 outline-none" 
                    placeholder="Ex: Méditation, Sport..." 
                    value={config.name} 
                    onChange={e => setConfig({...config, name: e.target.value})} 
                />
            </div>

            <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-500 uppercase">Motivation (Pourquoi ?)</label>
                <input 
                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-xs text-white focus:border-violet-500 outline-none" 
                    placeholder="Pour ma santé..." 
                    value={config.motivation} 
                    onChange={e => setConfig({...config, motivation: e.target.value})} 
                />
            </div>

            <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-500 uppercase">Durée du défi</label>
                <div className="grid grid-cols-3 gap-2">
                    {DURATIONS.map(d => (
                        <button
                            key={d.days}
                            onClick={() => setConfig({...config, duration: d.days})}
                            className={`
                                flex flex-col items-center justify-center p-2 rounded-lg border transition-all
                                ${config.duration === d.days 
                                    ? 'bg-violet-600/20 border-violet-500 text-violet-200' 
                                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'}
                            `}
                        >
                            <span className="text-sm font-bold">{d.days}j</span>
                            <span className="text-[8px] opacity-70">{d.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>

        <button 
            onClick={startTracker}
            className="w-full mt-3 h-9 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-900/20 active:scale-95 shrink-0"
        >
            <Target size={14} /> Lancer le Tracker
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-3 relative overflow-hidden bg-zinc-950/30">
        {/* Header */}
        <div className="flex items-center justify-between mb-2 shrink-0">
            <div className="flex flex-col leading-none">
                <h2 className="text-xs font-bold text-white truncate max-w-[120px]">{config.name}</h2>
                <span className="text-[9px] text-zinc-500 truncate max-w-[120px]">{config.motivation}</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="text-right">
                    <div className="text-xs font-bold text-violet-400">{completedDays.size}/{config.duration}</div>
                    <div className="text-[8px] text-zinc-600 uppercase font-bold">Jours</div>
                </div>
                <button onClick={reset} className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded transition-colors"><RotateCcw size={14}/></button>
            </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden mb-3 shrink-0">
            <div className="h-full bg-violet-500 transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }} />
        </div>

        {/* Grid Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 pr-1">
            <div className="grid grid-cols-6 gap-1.5 pb-2">
                {Array.from({ length: config.duration }, (_, i) => i + 1).map(day => (
                    <button
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`
                            aspect-square rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-200
                            ${completedDays.has(day) 
                                ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/40 scale-100' 
                                : 'bg-zinc-800/50 text-zinc-600 hover:bg-zinc-700 hover:text-zinc-300 scale-90 hover:scale-100'}
                        `}
                    >
                        {day}
                    </button>
                ))}
            </div>
        </div>

        {/* Footer */}
        <div className="mt-2 pt-2 border-t border-white/5 shrink-0">
            <button 
                onClick={generatePDF}
                disabled={isGenerating}
                className="w-full h-8 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95"
            >
                {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                Exporter PDF
            </button>
        </div>
    </div>
  );
};