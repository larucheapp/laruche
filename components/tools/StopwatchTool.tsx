import React, { useState, useEffect, useRef } from 'react';
import { Watch, Play, Pause, RotateCcw, Flag, Download, Loader2 } from 'lucide-react';

interface Lap {
  lapTime: number;
  totalTime: number;
}

export const StopwatchTool: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0); // Elapsed Time in ms
  const [laps, setLaps] = useState<Lap[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const accumulatedTimeRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);

    return {
      min: minutes.toString().padStart(2, '0'),
      sec: seconds.toString().padStart(2, '0'),
      ms: centiseconds.toString().padStart(2, '0')
    };
  };

  const update = () => {
    const now = Date.now();
    const elapsed = now - startTimeRef.current;
    setTime(accumulatedTimeRef.current + elapsed);
    animationFrameRef.current = requestAnimationFrame(update);
  };

  const handleStartStop = () => {
    if (isRunning) {
      // STOP
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      accumulatedTimeRef.current += Date.now() - startTimeRef.current;
      setIsRunning(false);
    } else {
      // START
      startTimeRef.current = Date.now();
      update();
      setIsRunning(true);
    }
  };

  const handleLap = () => {
    if (!isRunning && time === 0) return; // Cannot lap if reset

    const previousTotal = laps.length > 0 ? laps[laps.length - 1].totalTime : 0;
    const currentTotal = time;
    const currentLapTime = currentTotal - previousTotal;

    setLaps(prev => [...prev, { lapTime: currentLapTime, totalTime: currentTotal }]);
  };

  const handleReset = () => {
    if (isRunning) {
        // If running, behavior acts as Lap, but usually Reset is separate.
        // Let's stop first to be safe or use specific logic.
        // Common behavior: Left button is Lap when running, Reset when stopped.
        handleLap();
    } else {
        // RESET
        setTime(0);
        setLaps([]);
        accumulatedTimeRef.current = 0;
    }
  };

  const generatePDF = async () => {
    if (laps.length === 0 && time === 0) return;
    setIsGenerating(true);

    try {
        const { jsPDF } = await import('https://esm.sh/jspdf@2.5.1');
        const autoTable = (await import('https://esm.sh/jspdf-autotable@3.5.23')).default;
        
        const doc = new jsPDF();
        const pageW = doc.internal.pageSize.getWidth();
        const pageH = doc.internal.pageSize.getHeight();

        // Background Gradient simulation
        const startColor = [44, 26, 77]; // Dark Violet
        const endColor = [20, 20, 23];   // Near Black
        // Optimized gradient (strips of 2px to save rendering time)
        for (let i = 0; i < pageH; i += 2) {
            const r = startColor[0] + (i / pageH) * (endColor[0] - startColor[0]);
            const g = startColor[1] + (i / pageH) * (endColor[1] - startColor[1]);
            const b = startColor[2] + (i / pageH) * (endColor[2] - startColor[2]);
            doc.setFillColor(r, g, b);
            doc.rect(0, i, pageW, 2, 'F');
        }

        // Header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(24);
        doc.setTextColor('#FFFFFF');
        doc.text("RÉSULTATS CHRONO", pageW / 2, 22, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor('#A8A29E');
        doc.text(new Date().toLocaleString(), pageW / 2, 30, { align: 'center' });

        // Stats Logic
        const totalSessionTime = laps.length > 0 ? laps[laps.length - 1].totalTime : time;
        // If no laps but time exists, consider it one lap
        const effectiveLaps = laps.length > 0 ? laps : [{ lapTime: time, totalTime: time }];
        
        const fastestLap = effectiveLaps.reduce((min, lap) => lap.lapTime < min ? lap.lapTime : min, Infinity);
        const slowestLap = effectiveLaps.reduce((max, lap) => lap.lapTime > max ? lap.lapTime : max, -Infinity);

        const fmt = (ms: number) => {
            const t = formatTime(ms);
            return `${t.min}:${t.sec}.${t.ms}`;
        };

        // Dashboard
        const stats = [
            { label: 'Temps Total', value: fmt(totalSessionTime), color: '#FFFFFF' },
            { label: 'Tours', value: effectiveLaps.length, color: '#FFFFFF' },
            { label: 'Meilleur', value: fmt(fastestLap), color: '#4ADE80' },
            { label: 'Pire', value: fmt(slowestLap), color: '#F87171' },
        ];

        const statBoxWidth = (pageW - 30) / 4;
        stats.forEach((stat, i) => {
            const x = 15 + (i * statBoxWidth);
            doc.setFontSize(9);
            doc.setTextColor('#A8A29E');
            doc.text(stat.label, x, 45);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.setTextColor(stat.color);
            doc.text(String(stat.value), x, 53);
        });

        // Table
        const tableData = effectiveLaps.map((lap, index) => [
            index + 1,
            fmt(lap.lapTime),
            fmt(lap.totalTime)
        ]);

        autoTable(doc, {
            startY: 65,
            head: [['Tour', 'Temps Tour', 'Temps Total']],
            body: tableData,
            theme: 'striped',
            headStyles: {
                fillColor: [16, 185, 129], // Emerald
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            styles: {
                fillColor: false,
                textColor: [240, 240, 240],
                font: 'courier',
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [255, 255, 255, 0.05]
            },
        });

        doc.save(`chrono-${Date.now()}.pdf`);

    } catch (e) {
        console.error(e);
        alert("Erreur PDF");
    } finally {
        setIsGenerating(false);
    }
  };

  const { min, sec, ms } = formatTime(time);

  return (
    <div className="w-full h-full flex flex-col p-3 relative overflow-hidden">
       {/* Header */}
       <div className="flex items-center gap-2 mb-2 text-emerald-400 shrink-0">
          <Watch size={18} />
          <h2 className="text-xs font-bold uppercase tracking-wider">Chronomètre</h2>
       </div>

       {/* Time Display */}
       <div className="flex-1 flex flex-col items-center justify-center min-h-0">
          <div className="font-mono text-5xl font-medium tracking-tighter text-white tabular-nums flex items-baseline leading-none mb-4">
              <span>{min}:{sec}</span>
              <span className="text-2xl text-emerald-500/80 ml-1">.{ms}</span>
          </div>

          {/* Controls */}
          <div className="flex gap-4 w-full px-4 mb-2">
               {/* Left Button: Lap (Running) / Reset (Stopped) */}
               <button
                  onClick={isRunning ? handleLap : handleReset}
                  className={`
                    flex-1 h-10 rounded-full flex items-center justify-center gap-1 font-bold text-xs transition-all
                    ${isRunning 
                        ? 'bg-zinc-800 text-white hover:bg-zinc-700' 
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'}
                  `}
               >
                  {isRunning ? <><Flag size={14}/> Tour</> : <><RotateCcw size={14}/> Reset</>}
               </button>

               {/* Right Button: Start / Stop */}
               <button
                  onClick={handleStartStop}
                  className={`
                    flex-1 h-10 rounded-full flex items-center justify-center gap-1 font-bold text-xs transition-all shadow-lg
                    ${isRunning 
                        ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30' 
                        : 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-emerald-900/40'}
                  `}
               >
                  {isRunning ? <><Pause size={14} fill="currentColor" /> Stop</> : <><Play size={14} fill="currentColor" /> Start</>}
               </button>
          </div>
          
          {/* Laps List */}
          <div className="w-full flex-1 overflow-y-auto min-h-0 pr-1 custom-scrollbar border-t border-white/5 pt-2">
             <div className="flex flex-col gap-1">
                 {/* Current running lap logic visualization could go here, but simple list is cleaner */}
                 {[...laps].reverse().map((lap, idx) => {
                     const realIdx = laps.length - idx;
                     const t = formatTime(lap.lapTime);
                     
                     // Simple highlighting
                     let colorClass = "text-zinc-400";
                     if (laps.length > 2) {
                         const times = laps.map(l => l.lapTime);
                         const min = Math.min(...times);
                         const max = Math.max(...times);
                         if (lap.lapTime === min) colorClass = "text-emerald-400";
                         if (lap.lapTime === max) colorClass = "text-red-400";
                     }

                     return (
                         <div key={realIdx} className="flex justify-between items-center text-xs px-2 py-1.5 hover:bg-zinc-800/50 rounded">
                             <span className="text-zinc-600 font-mono w-8">#{realIdx.toString().padStart(2, '0')}</span>
                             <span className={`font-mono font-medium ${colorClass}`}>{t.min}:{t.sec}.{t.ms}</span>
                             <span className="font-mono text-zinc-500">{formatTime(lap.totalTime).min}:{formatTime(lap.totalTime).sec}</span>
                         </div>
                     );
                 })}
             </div>
          </div>
       </div>

       {/* Footer Action */}
       <div className="mt-2 pt-2 border-t border-white/5 shrink-0">
         <button 
            onClick={generatePDF}
            disabled={isGenerating || (time === 0 && laps.length === 0)}
            className="w-full h-8 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-300 text-[10px] font-bold rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
            Exporter Résultats
          </button>
       </div>
    </div>
  );
};