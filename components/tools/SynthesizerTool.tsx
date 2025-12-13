import React, { useState, useEffect, useRef } from 'react';
import { Music, Volume2 } from 'lucide-react';

const PRESETS: Record<string, any> = {
  'sine': { oscillators: [{ type: 'sine', detune: 0, gain: 1 }], envelope: { attack: 0.02, decay: 0.1, sustain: 0.8, release: 0.2 } },
  'square': { oscillators: [{ type: 'square', detune: 0, gain: 0.5 }], envelope: { attack: 0.02, decay: 0.1, sustain: 0.8, release: 0.2 } },
  'sawtooth': { oscillators: [{ type: 'sawtooth', detune: 0, gain: 0.5 }], envelope: { attack: 0.02, decay: 0.1, sustain: 0.8, release: 0.2 } },
  'cosmic': { oscillators: [{ type: 'sawtooth', detune: 0, gain: 0.4 }, { type: 'sine', detune: 7, gain: 0.3 }], envelope: { attack: 0.5, decay: 1, sustain: 0.6, release: 1.5 } }
};

const NOTES = [
  { note: 'C4', freq: 261.63 },
  { note: 'D4', freq: 293.66 },
  { note: 'E4', freq: 329.63 },
  { note: 'F4', freq: 349.23 },
  { note: 'G4', freq: 392.00 },
  { note: 'A4', freq: 440.00 },
  { note: 'B4', freq: 493.88 },
  { note: 'C5', freq: 523.25 },
];

export const SynthesizerTool: React.FC = () => {
  const [volume, setVolume] = useState(0.5);
  const [preset, setPreset] = useState('sine');
  const [activeNotes, setActiveNotes] = useState<string[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const initAudio = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioContextRef.current?.state === 'suspended') {
            audioContextRef.current.resume();
        }
    };
    // Initialize on first interaction
    const handleInteraction = () => {
        initAudio();
        window.removeEventListener('click', handleInteraction);
        window.removeEventListener('keydown', handleInteraction);
        window.removeEventListener('touchstart', handleInteraction);
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);

    return () => {
       window.removeEventListener('click', handleInteraction);
       window.removeEventListener('keydown', handleInteraction);
       window.removeEventListener('touchstart', handleInteraction);
       audioContextRef.current?.close();
    };
  }, []);

  const playNote = (freq: number) => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    
    if (ctx.state === 'suspended') ctx.resume();

    const config = PRESETS[preset];
    const now = ctx.currentTime;
    
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(volume, now + (config.envelope?.attack || 0.01));
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + (config.envelope?.release || 0.5) + 0.5);
    masterGain.connect(ctx.destination);

    config.oscillators.forEach((oscConf: any) => {
        const osc = ctx.createOscillator();
        osc.type = oscConf.type;
        osc.frequency.setValueAtTime(freq, now);
        osc.detune.setValueAtTime(oscConf.detune || 0, now);
        
        const oscGain = ctx.createGain();
        oscGain.gain.value = oscConf.gain || 1;
        
        osc.connect(oscGain);
        oscGain.connect(masterGain);
        
        osc.start(now);
        osc.stop(now + 2); 
    });
  };

  const triggerNote = (n: typeof NOTES[0]) => {
     setActiveNotes(prev => [...prev, n.note]);
     playNote(n.freq);
     setTimeout(() => setActiveNotes(prev => prev.filter(x => x !== n.note)), 200);
  };

  return (
    <div className="w-full h-full flex flex-col p-3 relative overflow-hidden bg-zinc-950/30">
        <div className="flex items-center justify-between mb-3 shrink-0">
             <div className="flex items-center gap-2 text-rose-400">
                <Music size={18} />
                <h2 className="text-xs font-bold uppercase tracking-wider">Mini Synthé</h2>
             </div>
             <div className="flex items-center gap-2 bg-zinc-900/50 rounded-full px-2 py-1 border border-zinc-800">
                <Volume2 size={12} className="text-zinc-500"/>
                <input 
                   type="range" min="0" max="1" step="0.01" 
                   value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))}
                   className="w-12 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
             </div>
        </div>

        <div className="flex-1 flex flex-col gap-3 min-h-0">
             {/* Presets */}
             <div className="grid grid-cols-4 gap-1.5 shrink-0">
                 {Object.keys(PRESETS).map(p => (
                     <button
                        key={p}
                        onClick={() => setPreset(p)}
                        className={`
                            py-1.5 rounded text-[9px] font-bold uppercase border transition-all truncate
                            ${preset === p 
                                ? 'bg-rose-500/20 border-rose-500 text-rose-200' 
                                : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:text-zinc-300'}
                        `}
                     >
                        {p}
                     </button>
                 ))}
             </div>

             {/* Keyboard Container */}
             <div className="flex-1 flex gap-1 relative min-h-0 bg-zinc-900/20 p-1 rounded-lg border border-white/5">
                 {NOTES.map((n) => (
                     <button
                        key={n.note}
                        onMouseDown={() => triggerNote(n)}
                        onTouchStart={(e) => { e.preventDefault(); triggerNote(n); }}
                        className={`
                            flex-1 h-full rounded-b-md border-b-4 transition-all relative flex flex-col justify-end pb-2 items-center
                            active:scale-[0.98] origin-top
                            ${activeNotes.includes(n.note) 
                                ? 'bg-rose-500 border-rose-700 h-[98%] shadow-inner' 
                                : 'bg-white border-zinc-300 hover:bg-zinc-100 shadow-md'}
                        `}
                     >
                        <span className={`text-[10px] font-bold ${activeNotes.includes(n.note) ? 'text-white' : 'text-zinc-800/50'}`}>
                            {n.note.replace(/\d/, '')}
                        </span>
                     </button>
                 ))}
             </div>
        </div>
    </div>
  );
};