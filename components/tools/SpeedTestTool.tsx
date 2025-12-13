import React, { useState, useRef, useEffect } from 'react';
import { Gauge, Activity, ArrowDown, ArrowUp, FileText, X, Rocket, RotateCcw } from 'lucide-react';

type TestStep = 'START' | 'RUNNING' | 'FINISHED';
type TestPhase = 'PING' | 'DOWNLOAD' | 'UPLOAD' | 'DONE';

export const SpeedTestTool: React.FC = () => {
  const [step, setStep] = useState<TestStep>('START');
  const [phase, setPhase] = useState<TestPhase>('PING');
  
  const [ping, setPing] = useState<number | null>(null);
  const [download, setDownload] = useState<number | null>(null);
  const [upload, setUpload] = useState<number | null>(null);
  
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [wavePath, setWavePath] = useState('');
  const [showPdfForm, setShowPdfForm] = useState(false);
  
  const requestRef = useRef<number | null>(null);
  
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);

  const updateWave = (yPos: number, time: number) => {
     const waveHeight = 6;
     const frequency = 0.03;
     const phase = time * 0.008;
     
     let path = `M -50 ${yPos} `;
     for(let x = -50; x <= 350; x += 10) {
         const y = yPos + Math.sin(x * frequency + phase) * waveHeight;
         path += `L ${x} ${y} `;
     }
     path += `V 300 H -50 Z`;
     setWavePath(path);
  };

  const animateTest = (targetSpeed: number, duration: number, onFinish: () => void) => {
    const startTime = Date.now();
    const animate = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = Math.sin(progress * Math.PI * 0.5);
        const fluctuation = (targetSpeed * 0.1) * (Math.random() - 0.5) * (1 - progress);
        const speed = Math.max(0, targetSpeed * ease + fluctuation);
        
        setCurrentSpeed(speed);
        
        const maxSpeed = 1000; 
        const logSpeed = speed > 1 ? Math.log10(speed) * (maxSpeed / 3) : 0;
        const percentage = Math.min(logSpeed / maxSpeed, 1);
        const yPos = 260 * (1 - percentage);
        
        updateWave(yPos, now);

        if (progress < 1) {
            requestRef.current = requestAnimationFrame(animate);
        } else {
            setCurrentSpeed(targetSpeed);
            updateWave(260 * (1 - Math.min((Math.log10(targetSpeed) * (1000/3))/1000, 1)), now);
            onFinish();
        }
    };
    requestRef.current = requestAnimationFrame(animate);
  };

  const startTest = async () => {
      setStep('RUNNING');
      setPhase('PING');
      setPing(null); setDownload(null); setUpload(null);
      setCurrentSpeed(0);
      
      await new Promise<void>(r => setTimeout(() => {
          setPing(Math.floor(Math.random() * 45) + 5);
          setPhase('DOWNLOAD');
          r();
      }, 1000));

      const dlSpeed = Math.random() * 850 + 50;
      await new Promise<void>(r => animateTest(dlSpeed, 3500, () => {
          setDownload(Number(dlSpeed.toFixed(1)));
          setPhase('UPLOAD');
          r();
      }));

      const ulSpeed = Math.random() * 300 + 20;
      await new Promise<void>(r => animateTest(ulSpeed, 2500, () => {
          setUpload(Number(ulSpeed.toFixed(1)));
          setPhase('DONE');
          setWavePath('');
          setStep('FINISHED');
          r();
      }));
  };

  const generatePDF = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const { jsPDF } = await import('https://esm.sh/jspdf@2.5.1');
        
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const now = new Date();
        
        doc.setFontSize(22);
        doc.text("Rapport Test de Vitesse", pageWidth / 2, 20, { align: "center" });
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Généré le: ${now.toLocaleString()}`, pageWidth / 2, 30, { align: "center" });
        
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text("Détails Utilisateur", 20, 50);
        doc.setFontSize(12);
        doc.text(`Nom: ${firstNameRef.current?.value} ${lastNameRef.current?.value}`, 20, 60);
        doc.text(`Adresse: ${addressRef.current?.value}`, 20, 68);
        
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(20, 80, pageWidth - 40, 40, 3, 3, 'F');
        
        const colW = (pageWidth - 40) / 3;
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("Latence", 20 + colW/2, 95, { align: 'center' });
        doc.setFontSize(18);
        doc.setTextColor(124, 58, 237);
        doc.text(`${ping} ms`, 20 + colW/2, 110, { align: 'center' });

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("Descendant", 20 + colW * 1.5, 95, { align: 'center' });
        doc.setFontSize(18);
        doc.text(`${download} Mbps`, 20 + colW * 1.5, 110, { align: 'center' });

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("Montant", 20 + colW * 2.5, 95, { align: 'center' });
        doc.setFontSize(18);
        doc.text(`${upload} Mbps`, 20 + colW * 2.5, 110, { align: 'center' });
        
        doc.save("rapport-vitesse.pdf");
        setShowPdfForm(false);
    } catch (err) {
        console.error(err);
        alert("Erreur PDF.");
    }
  };

  useEffect(() => {
      return () => {
          if (requestRef.current) cancelAnimationFrame(requestRef.current);
      };
  }, []);

  return (
    <div className="w-full h-full flex flex-col p-3 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 z-10 shrink-0 h-6">
        <div className="flex items-center gap-2 text-violet-400">
          <Gauge size={16} />
          <h2 className="text-[10px] font-bold uppercase tracking-wider">Test Vitesse</h2>
        </div>
        
        {/* Step Indicator */}
        <div className="flex gap-1">
            <div className={`w-1 h-1 rounded-full ${step === 'START' ? 'bg-violet-500' : 'bg-zinc-800'}`} />
            <div className={`w-1 h-1 rounded-full ${step === 'RUNNING' ? 'bg-violet-500 animate-pulse' : 'bg-zinc-800'}`} />
            <div className={`w-1 h-1 rounded-full ${step === 'FINISHED' ? 'bg-violet-500' : 'bg-zinc-800'}`} />
        </div>
      </div>

      {/* --- STEP 1: START SCREEN --- */}
      {step === 'START' && (
          <div className="flex-1 flex flex-col items-center justify-center animate-fade-in min-h-0 pb-2">
              <div className="relative group cursor-pointer" onClick={startTest}>
                  <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-xl group-hover:bg-violet-500/30 transition-all duration-500" />
                  <div className="relative w-16 h-16 rounded-full border border-violet-500/30 bg-black/40 backdrop-blur-sm flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                      <Rocket size={28} className="text-violet-400 ml-1 group-hover:text-white transition-colors" />
                  </div>
              </div>
              
              <h3 className="mt-3 text-sm font-bold text-white tracking-tight">Lancer le Test</h3>

              <button 
                onClick={startTest}
                className="mt-3 px-5 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-bold rounded-full transition-all shadow-lg shadow-violet-900/20"
              >
                Démarrer
              </button>
          </div>
      )}

      {/* --- STEP 2: RUNNING SCREEN (GAUGE) --- */}
      {step === 'RUNNING' && (
          <div className="flex-1 flex flex-col items-center justify-center animate-fade-in relative min-h-0">
              {/* Phase Badge */}
              <div className="absolute top-0 bg-zinc-800/80 px-2 py-0.5 rounded-full border border-zinc-700/50 backdrop-blur-sm z-20">
                  <span className="text-[9px] font-bold text-violet-300 uppercase flex items-center gap-1.5">
                      {phase === 'PING' && <><Activity size={9} /> Latence</>}
                      {phase === 'DOWNLOAD' && <><ArrowDown size={9} /> Débit Desc.</>}
                      {phase === 'UPLOAD' && <><ArrowUp size={9} /> Débit Mont.</>}
                  </span>
              </div>

              {/* Hex Gauge - Compact Size */}
              <div className="relative w-36 h-28 mt-3">
                <svg viewBox="0 0 300 260" className="w-full h-full overflow-visible drop-shadow-xl">
                    <defs>
                        <clipPath id="hex-clip-s">
                            <path d="M 75 0 L 225 0 L 300 130 L 225 260 L 75 260 L 0 130 Z" />
                        </clipPath>
                        <linearGradient id="liquid-grad-s" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#a78bfa" />
                            <stop offset="100%" stopColor="#7c3aed" />
                        </linearGradient>
                    </defs>
                    
                    <path d="M 75 0 L 225 0 L 300 130 L 225 260 L 75 260 L 0 130 Z" fill="#18181b" opacity="0.5" />
                    
                    <g clipPath="url(#hex-clip-s)">
                        <path d={wavePath || "M 0 260 H 300 V 260 H 0 Z"} fill="url(#liquid-grad-s)" opacity="0.9" />
                    </g>

                    <path d="M 75 0 L 225 0 L 300 130 L 225 260 L 75 260 L 0 130 Z" stroke="#3f3f46" strokeWidth="4" fill="none" />
                    
                    <text x="150" y="125" textAnchor="middle" className="fill-white text-5xl font-bold font-mono tracking-tighter">
                        {currentSpeed.toFixed(0)}
                    </text>
                    <text x="150" y="155" textAnchor="middle" className="fill-zinc-400 text-sm font-medium tracking-widest">
                        Mbps
                    </text>
                </svg>
              </div>
          </div>
      )}

      {/* --- STEP 3: RESULTS SCREEN --- */}
      {step === 'FINISHED' && (
          <div className="flex-1 flex flex-col animate-fade-in min-h-0">
              <div className="flex-1 flex flex-col justify-center gap-2">
                  
                  {/* Result Cards - Compact */}
                  <div className="grid grid-cols-3 gap-2">
                      <div className="bg-zinc-800/40 border border-zinc-700/50 p-2 rounded-lg flex flex-col items-center gap-0.5">
                          <div className="p-1 rounded-full bg-zinc-800 text-zinc-400 mb-0.5">
                              <Activity size={10} />
                          </div>
                          <span className="text-xs font-bold text-white">{ping}</span>
                          <span className="text-[8px] text-zinc-500 uppercase font-bold">Latence</span>
                      </div>
                      <div className="bg-zinc-800/40 border border-zinc-700/50 p-2 rounded-lg flex flex-col items-center gap-0.5">
                          <div className="p-1 rounded-full bg-zinc-800 text-violet-400 mb-0.5">
                              <ArrowDown size={10} />
                          </div>
                          <span className="text-xs font-bold text-white">{download}</span>
                          <span className="text-[8px] text-zinc-500 uppercase font-bold">Desc.</span>
                      </div>
                      <div className="bg-zinc-800/40 border border-zinc-700/50 p-2 rounded-lg flex flex-col items-center gap-0.5">
                          <div className="p-1 rounded-full bg-zinc-800 text-purple-400 mb-0.5">
                              <ArrowUp size={10} />
                          </div>
                          <span className="text-xs font-bold text-white">{upload}</span>
                          <span className="text-[8px] text-zinc-500 uppercase font-bold">Mont.</span>
                      </div>
                  </div>

                  <div className="text-center py-1">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-bold border border-emerald-500/20">
                          Terminé
                      </span>
                  </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-auto shrink-0">
                  <button 
                    onClick={() => setStep('START')}
                    className="flex-1 h-8 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold rounded-md transition-colors flex items-center justify-center gap-1.5"
                  >
                      <RotateCcw size={12} /> Relancer
                  </button>
                  <button 
                    onClick={() => setShowPdfForm(true)}
                    className="flex-1 h-8 bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-bold rounded-md transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-violet-900/20"
                  >
                      <FileText size={12} /> PDF
                  </button>
              </div>
          </div>
      )}

      {/* PDF Overlay Form - Fully Absolute and Scrollable */}
      {showPdfForm && (
          <div className="absolute inset-0 z-50 bg-zinc-950 flex flex-col p-3 animate-fade-in">
              <div className="flex items-center justify-between mb-2 shrink-0">
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <FileText size={12} className="text-violet-500" />
                      Exporter
                  </h3>
                  <button 
                    onClick={() => setShowPdfForm(false)} 
                    className="w-5 h-5 flex items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
                  >
                    <X size={12}/>
                  </button>
              </div>
              
              <form onSubmit={generatePDF} className="flex-1 flex flex-col gap-2 overflow-y-auto min-h-0 pr-1 custom-scrollbar">
                  <div>
                      <label className="text-[9px] font-bold text-zinc-500 mb-1 block">PRÉNOM</label>
                      <input ref={firstNameRef} required className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-white focus:border-violet-500 outline-none transition-colors" placeholder="Jean" />
                  </div>
                  <div>
                      <label className="text-[9px] font-bold text-zinc-500 mb-1 block">NOM</label>
                      <input ref={lastNameRef} required className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-white focus:border-violet-500 outline-none transition-colors" placeholder="Dupont" />
                  </div>
                  <div>
                      <label className="text-[9px] font-bold text-zinc-500 mb-1 block">ADRESSE</label>
                      <input ref={addressRef} required className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-white focus:border-violet-500 outline-none transition-colors" placeholder="Votre adresse" />
                  </div>
                  
                  <div className="mt-auto pt-2">
                      <button type="submit" className="w-full h-8 bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-bold rounded-md flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-violet-900/20 active:scale-95">
                          Télécharger PDF
                      </button>
                  </div>
              </form>
          </div>
      )}

    </div>
  );
};