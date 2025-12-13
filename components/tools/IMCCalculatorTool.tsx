import React, { useState, useEffect } from 'react';
import { Scale, RotateCcw, Activity } from 'lucide-react';

export const IMCCalculatorTool: React.FC = () => {
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  
  // Metric
  const [heightCm, setHeightCm] = useState<string>('');
  const [weightKg, setWeightKg] = useState<string>('');
  
  // Imperial
  const [heightFt, setHeightFt] = useState<string>('');
  const [heightIn, setHeightIn] = useState<string>('');
  const [weightLbs, setWeightLbs] = useState<string>('');

  const [imc, setImc] = useState<number | null>(null);

  const calculate = () => {
    let h = 0; // meters
    let w = 0; // kg

    if (unit === 'metric') {
        h = parseFloat(heightCm) / 100;
        w = parseFloat(weightKg);
    } else {
        const ft = parseFloat(heightFt) || 0;
        const inc = parseFloat(heightIn) || 0;
        const lbs = parseFloat(weightLbs) || 0;
        
        if (ft === 0 && inc === 0) return setImc(null);
        
        h = ((ft * 12) + inc) * 0.0254;
        w = lbs * 0.453592;
    }

    if (h > 0 && w > 0) {
        const val = w / (h * h);
        setImc(val);
    } else {
        setImc(null);
    }
  };

  useEffect(() => {
    calculate();
  }, [heightCm, weightKg, heightFt, heightIn, weightLbs, unit]);

  // Gauge logic
  // Min IMC 15, Max 40. 
  // Angle -90 to 90.
  const getGaugeRotation = () => {
      if (!imc) return -90;
      const clamped = Math.min(Math.max(imc, 15), 40);
      const pct = (clamped - 15) / (40 - 15);
      return (pct * 180) - 90;
  };

  const getResultInfo = () => {
      if (!imc) return { label: '--', color: 'text-zinc-500' };
      if (imc < 18.5) return { label: 'Maigreur', color: 'text-blue-400' };
      if (imc < 25) return { label: 'Normal', color: 'text-emerald-400' };
      if (imc < 30) return { label: 'Surpoids', color: 'text-orange-400' };
      return { label: 'Obésité', color: 'text-red-400' };
  };

  const info = getResultInfo();

  return (
    <div className="w-full h-full flex flex-col p-3 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-violet-400">
                <Scale size={16} />
                <h2 className="text-[10px] font-bold uppercase tracking-wider">Calcul IMC</h2>
            </div>
            {/* Unit Toggle */}
            <div className="flex bg-zinc-800 rounded-lg p-0.5">
                <button 
                    onClick={() => setUnit('metric')}
                    className={`px-2 py-0.5 text-[8px] font-bold rounded-md transition-all ${unit === 'metric' ? 'bg-violet-600 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    CM/KG
                </button>
                <button 
                    onClick={() => setUnit('imperial')}
                    className={`px-2 py-0.5 text-[8px] font-bold rounded-md transition-all ${unit === 'imperial' ? 'bg-violet-600 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    FT/LBS
                </button>
            </div>
        </div>
        
        <div className="flex-1 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
            {/* Inputs */}
            <div className="grid grid-cols-2 gap-2">
                {unit === 'metric' ? (
                    <>
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-zinc-500">TAILLE (CM)</label>
                            <input 
                                type="number" 
                                value={heightCm} onChange={e => setHeightCm(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-xs text-white focus:border-violet-500 outline-none"
                                placeholder="175"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-zinc-500">POIDS (KG)</label>
                            <input 
                                type="number" 
                                value={weightKg} onChange={e => setWeightKg(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-xs text-white focus:border-violet-500 outline-none"
                                placeholder="70"
                            />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="space-y-1">
                             <label className="text-[9px] font-bold text-zinc-500">TAILLE</label>
                             <div className="flex gap-1">
                                <input 
                                    type="number" 
                                    value={heightFt} onChange={e => setHeightFt(e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-xs text-white focus:border-violet-500 outline-none"
                                    placeholder="Ft"
                                />
                                <input 
                                    type="number" 
                                    value={heightIn} onChange={e => setHeightIn(e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-xs text-white focus:border-violet-500 outline-none"
                                    placeholder="In"
                                />
                             </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-zinc-500">POIDS (LBS)</label>
                            <input 
                                type="number" 
                                value={weightLbs} onChange={e => setWeightLbs(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-xs text-white focus:border-violet-500 outline-none"
                                placeholder="150"
                            />
                        </div>
                    </>
                )}
            </div>

            {/* Gauge Area */}
            <div className="flex-1 min-h-[120px] bg-zinc-800/30 rounded-lg border border-zinc-700/50 relative flex flex-col items-center justify-end pb-2">
                <div className="w-48 h-28 relative overflow-visible">
                     <svg viewBox="0 0 100 55" className="w-full h-full overflow-visible">
                        {/* Background Track */}
                        <path d="M 5 50 A 45 45 0 0 1 95 50" fill="none" stroke="#27272a" strokeWidth="8" strokeLinecap="round" />
                        
                        {/* Color Segments */}
                        {/* Blue (Underweight < 18.5) -> 15 to 18.5 */}
                        <path d="M 5 50 A 45 45 0 0 1 29.8 11.5" fill="none" stroke="#60a5fa" strokeWidth="8" strokeLinecap="round" opacity="0.8" />
                        {/* Green (Normal 18.5 - 25) */}
                        <path d="M 29.8 11.5 A 45 45 0 0 1 61.3 7.8" fill="none" stroke="#34d399" strokeWidth="8" opacity="0.8"/>
                        {/* Orange (Overweight 25 - 30) */}
                        <path d="M 61.3 7.8 A 45 45 0 0 1 85.1 20.6" fill="none" stroke="#fb923c" strokeWidth="8" opacity="0.8"/>
                        {/* Red (Obese > 30) */}
                        <path d="M 85.1 20.6 A 45 45 0 0 1 95 50" fill="none" stroke="#f87171" strokeWidth="8" strokeLinecap="round" opacity="0.8"/>

                        {/* Needle */}
                        <g style={{ transform: `rotate(${getGaugeRotation()}deg)`, transformOrigin: '50px 50px', transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                             <line x1="50" y1="50" x2="50" y2="10" stroke="white" strokeWidth="2" strokeLinecap="round" />
                             <circle cx="50" cy="50" r="3" fill="white" />
                        </g>
                        
                        {/* Labels */}
                         <text x="5" y="62" fontSize="6" fill="#71717a" textAnchor="middle">15</text>
                         <text x="95" y="62" fontSize="6" fill="#71717a" textAnchor="middle">40+</text>
                     </svg>
                     
                     {/* Value Display Overlay */}
                     <div className="absolute bottom-0 left-0 right-0 text-center transform translate-y-6">
                         <div className="text-3xl font-black text-white leading-none">{imc ? imc.toFixed(1) : '--.-'}</div>
                         <div className={`text-[10px] font-bold uppercase ${info.color}`}>{info.label}</div>
                     </div>
                </div>
            </div>
            
            <div className="mt-4 text-[9px] text-zinc-500 text-center px-4">
               Plage santé : 18.5 - 24.9
            </div>
        </div>
    </div>
  );
};