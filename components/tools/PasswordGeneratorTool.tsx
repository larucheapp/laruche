import React, { useState, useEffect } from 'react';
import { KeyRound, Copy, Check, RefreshCw } from 'lucide-react';

const CHARSETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

export const PasswordGeneratorTool: React.FC = () => {
  const [length, setLength] = useState(16);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true
  });

  const generatePassword = () => {
    let availableChars = '';
    let guaranteedChars = [];
    
    if (options.uppercase) {
        availableChars += CHARSETS.uppercase;
        guaranteedChars.push(CHARSETS.uppercase[Math.floor(Math.random() * CHARSETS.uppercase.length)]);
    }
    if (options.lowercase) {
        availableChars += CHARSETS.lowercase;
        guaranteedChars.push(CHARSETS.lowercase[Math.floor(Math.random() * CHARSETS.lowercase.length)]);
    }
    if (options.numbers) {
        availableChars += CHARSETS.numbers;
        guaranteedChars.push(CHARSETS.numbers[Math.floor(Math.random() * CHARSETS.numbers.length)]);
    }
    if (options.symbols) {
        availableChars += CHARSETS.symbols;
        guaranteedChars.push(CHARSETS.symbols[Math.floor(Math.random() * CHARSETS.symbols.length)]);
    }

    if (availableChars === '') {
        setPassword('');
        return;
    }

    let pwd = [...guaranteedChars];
    const remainingLength = length - pwd.length;

    for (let i = 0; i < remainingLength; i++) {
        const randomIndex = Math.floor(Math.random() * availableChars.length);
        pwd.push(availableChars[randomIndex]);
    }
    
    // Shuffle
    for (let i = pwd.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pwd[i], pwd[j]] = [pwd[j], pwd[i]];
    }

    setPassword(pwd.join('').slice(0, length));
  };

  const handleCopy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleOption = (key: keyof typeof options) => {
    setOptions(prev => {
        const next = { ...prev, [key]: !prev[key] };
        // Prevent all false
        if (!Object.values(next).some(Boolean)) return prev;
        return next;
    });
  };

  useEffect(() => {
    generatePassword();
  }, [length, options]);

  return (
    <div className="w-full h-full flex flex-col p-3 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1 text-violet-400 shrink-0">
           <KeyRound size={18} />
           <h2 className="text-[10px] font-bold uppercase tracking-wider">Générateur MDP</h2>
        </div>

        <div className="flex-1 flex flex-col justify-center gap-3 min-h-0">
            {/* Output Display */}
            <div className="relative group shrink-0">
                <div className="w-full h-10 bg-zinc-800 rounded-lg flex items-center px-3 font-mono text-sm font-bold text-white tracking-wide overflow-hidden whitespace-nowrap border border-zinc-700/50">
                   {password}
                </div>
                <button 
                    onClick={handleCopy}
                    className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center rounded bg-zinc-700 text-zinc-300 hover:bg-violet-600 hover:text-white transition-all shadow-lg opacity-0 group-hover:opacity-100"
                >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
            </div>

            {/* Length Control */}
            <div className="flex flex-col gap-1 shrink-0">
                <div className="flex justify-between items-center text-[9px] font-bold text-zinc-500">
                    <span>TAILLE</span>
                    <span className="text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded">{length}</span>
                </div>
                <input 
                    type="range" min="8" max="64" value={length} 
                    onChange={(e) => setLength(Number(e.target.value))}
                    className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
                />
            </div>

            {/* Options Grid - Optimized to 1 row */}
            <div className="grid grid-cols-4 gap-2 shrink-0">
                <button 
                    onClick={() => toggleOption('uppercase')}
                    className={`h-7 rounded text-[10px] font-bold border transition-all ${options.uppercase ? 'bg-violet-500/20 text-violet-200 border-violet-500/50' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}
                >
                    ABC
                </button>
                <button 
                    onClick={() => toggleOption('lowercase')}
                    className={`h-7 rounded text-[10px] font-bold border transition-all ${options.lowercase ? 'bg-violet-500/20 text-violet-200 border-violet-500/50' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}
                >
                    abc
                </button>
                <button 
                    onClick={() => toggleOption('numbers')}
                    className={`h-7 rounded text-[10px] font-bold border transition-all ${options.numbers ? 'bg-violet-500/20 text-violet-200 border-violet-500/50' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}
                >
                    123
                </button>
                <button 
                    onClick={() => toggleOption('symbols')}
                    className={`h-7 rounded text-[10px] font-bold border transition-all ${options.symbols ? 'bg-violet-500/20 text-violet-200 border-violet-500/50' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}
                >
                    #@$
                </button>
            </div>
        </div>

        {/* Generate Button */}
        <button 
            onClick={generatePassword}
            className="w-full mt-2 h-8 bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-900/20 active:scale-95 shrink-0"
        >
            <RefreshCw size={12} /> GÉNÉRER
        </button>
    </div>
  );
};