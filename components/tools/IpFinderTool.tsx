import React, { useState } from 'react';
import { Network, Eye, EyeOff, Copy, Check, Loader2, Globe } from 'lucide-react';

export const IpFinderTool: React.FC = () => {
  const [ip, setIp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchIp = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setIp(data.ip);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (ip) {
      navigator.clipboard.writeText(ip);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-4 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 text-sky-400 shrink-0">
        <Network size={18} />
        <h2 className="text-xs font-bold uppercase tracking-wider">Mon Adresse IP</h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative min-h-0">
        {/* Visual Background Elements */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
           <Globe size={140} className="text-sky-500 animate-pulse-slow" />
        </div>

        {/* IP Display Container */}
        <div className="z-10 flex flex-col items-center gap-2 w-full">
            {loading ? (
                <div className="flex flex-col items-center gap-2 text-sky-400">
                    <Loader2 size={32} className="animate-spin" />
                    <span className="text-[10px] uppercase font-bold animate-pulse">Scan réseau...</span>
                </div>
            ) : ip ? (
                <div className="group relative flex items-center justify-center w-full">
                    <div className="text-3xl md:text-4xl font-mono font-bold text-white tracking-wider text-center break-all">
                        {ip}
                    </div>
                    
                    {/* Floating Copy Button */}
                    <button 
                        onClick={handleCopy}
                        className="absolute -right-2 top-1/2 -translate-y-1/2 p-2 bg-zinc-800/80 rounded-full text-zinc-400 hover:text-white hover:bg-sky-500 transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                    >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-1">
                    <div className="text-zinc-600 font-mono text-xl">***.***.***.***</div>
                    {error && <span className="text-red-400 text-[10px] font-bold">Erreur récupération IP</span>}
                </div>
            )}
        </div>
      </div>

      {/* Footer Action */}
      <div className="mt-4 shrink-0">
        {!ip ? (
            <button 
                onClick={fetchIp}
                disabled={loading}
                className="w-full h-10 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-sky-900/20 active:scale-95 group"
            >
                {loading ? <Loader2 size={14} className="animate-spin"/> : <Eye size={14} className="group-hover:scale-110 transition-transform"/>}
                Voir mon IP Public
            </button>
        ) : (
            <div className="flex gap-2">
                <button 
                    onClick={handleCopy}
                    className="flex-1 h-9 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                    {copied ? <Check size={12} className="text-emerald-400"/> : <Copy size={12} />}
                    {copied ? 'Copié' : 'Copier'}
                </button>
                <button 
                    onClick={() => { setIp(null); setError(false); }}
                    className="flex-1 h-9 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                    <EyeOff size={12} /> Masquer
                </button>
            </div>
        )}
      </div>
    </div>
  );
};