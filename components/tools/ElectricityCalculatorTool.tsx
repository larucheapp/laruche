import React, { useState } from 'react';
import { Zap } from 'lucide-react';

export const ElectricityCalculatorTool: React.FC = () => {
  const [price, setPrice] = useState<number>(0.2516);
  const [watts, setWatts] = useState<string>('');
  const [hours, setHours] = useState<string>('');

  const calculateCosts = () => {
    const w = parseFloat(watts);
    const h = parseFloat(hours);
    const p = price;

    if (isNaN(w) || isNaN(h) || w < 0 || h < 0) {
      return { daily: 0, monthly: 0, yearly: 0 };
    }

    // Daily consumption in kWh = (Watts / 1000) * Hours
    const dailyKwh = (w / 1000) * h;
    const dailyCost = dailyKwh * p;
    
    return {
      daily: dailyCost,
      monthly: dailyCost * 30.44, // Average days in month
      yearly: dailyCost * 365.25 // Average days in year
    };
  };

  const { daily, monthly, yearly } = calculateCosts();

  const fmt = (val: number) => val.toLocaleString('fr-FR', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });

  return (
    <div className="w-full h-full flex flex-col p-3 relative overflow-hidden">
       {/* Header */}
       <div className="flex justify-between items-center mb-2 shrink-0">
          <div className="flex items-center gap-2 text-amber-400">
             <Zap size={18} />
             <h2 className="text-[10px] font-bold uppercase tracking-wider">Coût Élec</h2>
          </div>
          {/* Price Input Compact */}
          <div className="flex items-center gap-1 bg-zinc-800 rounded px-2 py-1 border border-zinc-700/50 focus-within:border-amber-500/50 transition-colors">
             <span className="text-[9px] text-zinc-500 font-medium">€/kWh</span>
             <input
               type="number"
               className="w-12 bg-transparent text-right text-[10px] font-bold text-white outline-none appearance-none m-0"
               value={price}
               onChange={(e) => setPrice(parseFloat(e.target.value))}
               step="0.0001"
             />
          </div>
       </div>

       {/* Main Inputs Grid */}
       <div className="flex gap-2 mb-2 shrink-0">
          <div className="flex-1 bg-zinc-800/40 rounded-lg p-2 border border-zinc-700/50 focus-within:bg-zinc-800/60 focus-within:border-amber-500/30 transition-all">
             <label className="text-[8px] font-bold text-zinc-500 block mb-0.5 uppercase tracking-wide">PUISSANCE (W)</label>
             <input 
                type="number"
                value={watts}
                onChange={(e) => setWatts(e.target.value)}
                className="w-full bg-transparent text-xl font-bold text-white outline-none placeholder:text-zinc-700" 
                placeholder="100" 
             />
          </div>
          <div className="flex-1 bg-zinc-800/40 rounded-lg p-2 border border-zinc-700/50 focus-within:bg-zinc-800/60 focus-within:border-amber-500/30 transition-all">
             <label className="text-[8px] font-bold text-zinc-500 block mb-0.5 uppercase tracking-wide">H/JOUR</label>
             <input 
                type="number"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full bg-transparent text-xl font-bold text-white outline-none placeholder:text-zinc-700" 
                placeholder="24" 
                max="24"
             />
          </div>
       </div>

       {/* Results Area */}
       <div className="flex-1 min-h-0 bg-zinc-900/50 rounded-xl border border-zinc-800/80 p-3 flex flex-col justify-center gap-2">
           {/* Daily (Main Result) */}
           <div className="flex justify-between items-end border-b border-zinc-800 pb-2 mb-1">
               <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Coût Jour</span>
               <span className="text-2xl font-bold text-white tracking-tight">{fmt(daily)} €</span>
           </div>
           
           {/* Secondary Results */}
           <div className="flex justify-between items-end">
               <div className="flex flex-col">
                   <span className="text-[9px] text-zinc-600 font-bold uppercase">Mois</span>
                   <span className="text-sm font-bold text-zinc-300">{fmt(monthly)} €</span>
               </div>
               <div className="flex flex-col items-end">
                   <span className="text-[9px] text-zinc-600 font-bold uppercase">Année</span>
                   <span className="text-sm font-bold text-amber-400">{fmt(yearly)} €</span>
               </div>
           </div>
       </div>
    </div>
  );
};