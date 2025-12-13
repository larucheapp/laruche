import React, { useState, useEffect, useRef } from 'react';
import { MousePointerClick, RotateCcw, Timer, Zap } from 'lucide-react';

const TEST_DURATION = 10.00;

export const ClickSpeedTestTool: React.FC = () => {
  const [gameState, setGameState] = useState<'READY' | 'RUNNING' | 'FINISHED'>('READY');
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION);
  const [clickCount, setClickCount] = useState(0);
  const [cps, setCps] = useState(0);
  const [clickEffect, setClickEffect] = useState(false);

  const timerRef = useRef<number | null>(null);
  const clickCountRef = useRef(0); // Référence pour suivre les clics en temps réel sans problème de closure

  const getRank = (cps: number) => {
    if (cps < 4) return { title: "Tortue Tranquille", color: "text-zinc-400" };
    if (cps < 6) return { title: "Paresseux Vif", color: "text-emerald-400" };
    if (cps < 8) return { title: "Guépard Agile", color: "text-amber-400" };
    if (cps < 10) return { title: "Faucon Pèlerin", color: "text-orange-400" };
    return { title: "Vitesse Lumière !", color: "text-rose-400" };
  };

  const endGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState('FINISHED');
    // On utilise clickCountRef.current pour avoir la vraie valeur à la fin du timer
    setCps(Number((clickCountRef.current / TEST_DURATION).toFixed(2)));
    setTimeLeft(0);
  };

  const startGame = () => {
    setGameState('RUNNING');
    setClickCount(1);
    clickCountRef.current = 1; // Initialise la ref
    setTimeLeft(TEST_DURATION);
    
    const startTime = Date.now();
    
    timerRef.current = window.setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const remaining = Math.max(0, TEST_DURATION - elapsed);
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        endGame();
      }
    }, 10);
  };

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (gameState === 'FINISHED') return;

    if (gameState === 'READY') {
      startGame();
    } else if (gameState === 'RUNNING') {
      setClickCount(prev => prev + 1);
      clickCountRef.current += 1; // Incrémente la ref en parallèle pour le timer
      
      // Visual feedback
      setClickEffect(true);
      setTimeout(() => setClickEffect(false), 50);
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState('READY');
    setClickCount(0);
    clickCountRef.current = 0;
    setTimeLeft(TEST_DURATION);
    setCps(0);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const rank = getRank(cps);

  return (
    <div className="w-full h-full flex flex-col p-3 relative overflow-hidden select-none">
       {/* Header */}
       <div className="flex items-center justify-between mb-2 shrink-0 h-6">
          <div className="flex items-center gap-2 text-rose-400">
             <MousePointerClick size={16} />
             <h2 className="text-[10px] font-bold uppercase tracking-wider">Test CPS (10s)</h2>
          </div>
          {gameState !== 'READY' && (
             <button onClick={handleReset} className="text-zinc-500 hover:text-white transition-colors">
                 <RotateCcw size={14} />
             </button>
          )}
       </div>

       {/* Main Area */}
       <div className="flex-1 min-h-0 flex flex-col relative">
          
          {/* Active Click Area */}
          {gameState !== 'FINISHED' && (
              <div 
                onMouseDown={handleClick}
                className={`
                    w-full h-full rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-2
                    ${gameState === 'RUNNING' 
                        ? 'bg-rose-500/10 border-rose-500/50 hover:bg-rose-500/20 active:scale-[0.98]' 
                        : 'bg-zinc-800/30 border-zinc-700 hover:bg-zinc-800/50 hover:border-zinc-500'}
                    ${clickEffect ? 'scale-[0.98] border-rose-400 bg-rose-500/30' : ''}
                `}
              >
                 {gameState === 'READY' ? (
                     <>
                        <div className="p-3 rounded-full bg-zinc-800 text-rose-400 animate-bounce">
                             <MousePointerClick size={24} />
                        </div>
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Cliquer pour Lancer</span>
                     </>
                 ) : (
                     <>
                        <span className="text-6xl font-black text-rose-500 tabular-nums leading-none tracking-tighter">
                            {clickCount}
                        </span>
                        <span className="text-[10px] font-bold text-rose-400/70 uppercase">Clics</span>
                     </>
                 )}
              </div>
          )}

          {/* Results Screen */}
          {gameState === 'FINISHED' && (
              <div className="w-full h-full flex flex-col items-center justify-center animate-fade-in bg-zinc-800/20 rounded-xl border border-white/5 p-4">
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Votre Vitesse</div>
                  <div className="text-5xl font-black text-white mb-1 tabular-nums tracking-tighter">{cps}</div>
                  <div className="text-[10px] font-bold text-zinc-600 uppercase mb-4">Clics / Sec</div>
                  
                  <div className={`text-sm font-bold ${rank.color} mb-6 text-center`}>
                      {rank.title}
                  </div>

                  <button 
                    onClick={handleReset}
                    className="w-full h-9 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-rose-900/20 active:scale-95"
                  >
                      Réessayer
                  </button>
              </div>
          )}

          {/* Floating Stats Bar (Only visible when running or ready) */}
          {gameState !== 'FINISHED' && (
             <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between bg-black/60 backdrop-blur-md rounded-lg p-2 border border-white/5 pointer-events-none">
                 <div className="flex items-center gap-1.5">
                     <Timer size={12} className="text-zinc-500"/>
                     <span className="text-xs font-mono font-bold text-white tabular-nums w-10">
                        {timeLeft.toFixed(2)}s
                     </span>
                 </div>
                 {gameState === 'RUNNING' && (
                     <div className="flex items-center gap-1.5">
                         <Zap size={12} className="text-rose-500"/>
                         <span className="text-xs font-mono font-bold text-white tabular-nums">
                             {(clickCount / (TEST_DURATION - timeLeft || 0.01)).toFixed(1)} CPS
                         </span>
                     </div>
                 )}
             </div>
          )}

       </div>
    </div>
  );
};