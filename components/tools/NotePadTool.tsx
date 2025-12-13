import React, { useState, useEffect } from 'react';
import { StickyNote, Download, Copy, Check, Trash2 } from 'lucide-react';

export const NotePadTool: React.FC = () => {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('purplebee_notes');
    if (saved) setText(saved);
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('purplebee_notes', text);
  }, [text]);

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([text], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "notes.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    if(confirm('Effacer toutes les notes ?')) {
        setText('');
    }
  }

  return (
    <div className="w-full h-full flex flex-col p-3 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 shrink-0">
         <div className="flex items-center gap-2 text-amber-400">
            <StickyNote size={18} />
            <h2 className="text-[10px] font-bold uppercase tracking-wider">Bloc-Notes</h2>
         </div>
         <div className="flex gap-1">
             <button onClick={handleCopy} className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors" title="Copier">
                {copied ? <Check size={14} className="text-emerald-400"/> : <Copy size={14}/>}
             </button>
             <button onClick={handleClear} className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded transition-colors" title="Effacer">
                <Trash2 size={14}/>
             </button>
         </div>
      </div>

      <textarea
        className="flex-1 w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3 text-xs text-zinc-200 placeholder:text-zinc-600 resize-none focus:outline-none focus:border-amber-500/50 transition-colors custom-scrollbar leading-relaxed"
        placeholder="Écrivez vos notes ici..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
      />

      <button
        onClick={handleDownload}
        disabled={!text}
        className="w-full mt-2 h-8 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-black text-[10px] font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-900/20 active:scale-95 shrink-0"
      >
        <Download size={12} /> Sauvegarder .txt
      </button>
    </div>
  );
};