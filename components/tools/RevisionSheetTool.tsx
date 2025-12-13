import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, Download, Plus, Trash2, Palette, Type as TypeIcon, Loader2, FileText, Check } from 'lucide-react';

interface Section {
  id: string; // Changed to string for better uniqueness
  title: string;
  content: string;
}

interface SheetData {
  title: string;
  subject: string;
  theme: 'violet' | 'ocean' | 'forest' | 'graphite' | 'sunrise';
  font: 'inter' | 'lora';
  sections: Section[];
}

const THEMES = {
  violet: { bg: '#7C3AED', text: '#FFFFFF', name: 'Violet' },
  ocean: { bg: '#0ea5e9', text: '#FFFFFF', name: 'Océan' },
  forest: { bg: '#16a34a', text: '#FFFFFF', name: 'Forêt' },
  graphite: { bg: '#475569', text: '#FFFFFF', name: 'Graphite' },
  sunrise: { bg: '#f97316', text: '#FFFFFF', name: 'Sunrise' },
};

export const RevisionSheetTool: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [data, setData] = useState<SheetData>({
    title: '',
    subject: '',
    theme: 'violet',
    font: 'inter',
    sections: [{ id: crypto.randomUUID(), title: '', content: '' }]
  });

  const sectionsEndRef = useRef<HTMLDivElement>(null);

  // --- Handlers ---

  const updateSection = (id: string, field: keyof Section, value: string) => {
    setData(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === id ? { ...s, [field]: value } : s)
    }));
  };

  const addSection = () => {
    setData(prev => ({
      ...prev,
      sections: [...prev.sections, { id: crypto.randomUUID(), title: '', content: '' }]
    }));
    // Optional: Scroll to bottom after render
    setTimeout(() => {
        sectionsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const removeSection = (id: string) => {
    if (data.sections.length <= 1) return;
    setData(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== id)
    }));
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
        const { jsPDF } = await import('https://esm.sh/jspdf@2.5.1');
        const pdf = new jsPDF({ unit: 'pt', format: 'a4' });

        const pageW = pdf.internal.pageSize.getWidth();
        const pageH = pdf.internal.pageSize.getHeight();
        const margin = 50;
        const contentW = pageW - margin * 2;
        
        const themeColor = THEMES[data.theme].bg;
        const fontName = data.font === 'lora' ? 'Times' : 'Helvetica';

        let y = margin;

        const checkPageBreak = (h: number) => {
            if (y + h > pageH - margin) {
                pdf.addPage();
                y = margin;
            }
        };

        // Header
        pdf.setFont(fontName, 'bold');
        pdf.setFontSize(24);
        pdf.setTextColor(themeColor);
        const titleLines = pdf.splitTextToSize(data.title || 'Sans Titre', contentW);
        pdf.text(titleLines, margin, y);
        y += (titleLines.length * 24) + 10;

        pdf.setFont(fontName, 'normal');
        pdf.setFontSize(14);
        pdf.setTextColor('#6B7280');
        pdf.text(data.subject || 'Matière', margin, y);
        y += 20;

        // Divider
        pdf.setDrawColor(themeColor);
        pdf.setLineWidth(2);
        pdf.line(margin, y, pageW - margin, y);
        y += 30;

        // Sections
        data.sections.forEach(section => {
            const secTitle = section.title || 'Section';
            const secContent = section.content || '';

            // Title
            pdf.setFont(fontName, 'bold');
            pdf.setFontSize(14);
            pdf.setTextColor(themeColor);
            const secTitleLines = pdf.splitTextToSize(secTitle, contentW);
            
            checkPageBreak(secTitleLines.length * 16 + 20);
            pdf.text(secTitleLines, margin, y);
            y += secTitleLines.length * 16 + 5;

            // Content
            if (secContent) {
                pdf.setFont(fontName, 'normal');
                pdf.setFontSize(11);
                pdf.setTextColor('#1f2937');
                const contentLines = pdf.splitTextToSize(secContent, contentW);
                
                checkPageBreak(contentLines.length * 14 + 20);
                pdf.text(contentLines, margin, y);
                y += contentLines.length * 14;
            }
            
            y += 25; // Space between sections
        });

        pdf.save(`fiche-${data.title.replace(/\s+/g, '_') || 'revision'}.pdf`);

    } catch (e) {
        console.error(e);
        alert("Erreur PDF");
    } finally {
        setIsGenerating(false);
    }
  };

  // --- Render Steps ---

  const StepIndicator = () => (
      <div className="flex gap-1 ml-auto">
          {[1,2,3].map(s => (
              <div key={s} className={`w-1.5 h-1.5 rounded-full transition-colors ${s === step ? 'bg-indigo-500' : s < step ? 'bg-indigo-500/30' : 'bg-zinc-800'}`} />
          ))}
      </div>
  );

  return (
    <div className="w-full h-full flex flex-col p-3 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3 text-indigo-400 shrink-0">
            <BookOpen size={18} />
            <div className="flex flex-col leading-none">
                <h2 className="text-xs font-bold uppercase tracking-wider">Fiches Révision</h2>
                <span className="text-[9px] text-zinc-500 font-medium">Créateur PDF</span>
            </div>
            <StepIndicator />
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar flex flex-col">
            
            {/* STEP 1: SETUP */}
            {step === 1 && (
                <div className="flex flex-col gap-3 animate-fade-in">
                    <div className="space-y-2">
                        <label className="text-[9px] text-zinc-500 font-bold uppercase block">Infos</label>
                        <input className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-xs text-white focus:border-indigo-500 outline-none" placeholder="Titre de la fiche" value={data.title} onChange={e => setData({...data, title: e.target.value})} />
                        <input className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-xs text-white focus:border-indigo-500 outline-none" placeholder="Matière" value={data.subject} onChange={e => setData({...data, subject: e.target.value})} />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] text-zinc-500 font-bold uppercase flex items-center gap-1"><Palette size={10}/> Thème</label>
                        <div className="flex gap-2">
                            {(Object.keys(THEMES) as Array<keyof typeof THEMES>).map(key => (
                                <button
                                    key={key}
                                    onClick={() => setData({...data, theme: key})}
                                    className={`w-6 h-6 rounded-full border-2 transition-all ${data.theme === key ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                    style={{ backgroundColor: THEMES[key].bg }}
                                    title={THEMES[key].name}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] text-zinc-500 font-bold uppercase flex items-center gap-1"><TypeIcon size={10}/> Police</label>
                        <div className="flex gap-2">
                            <button onClick={() => setData({...data, font: 'inter'})} className={`flex-1 py-1.5 text-[10px] rounded border ${data.font === 'inter' ? 'bg-zinc-800 border-indigo-500 text-white' : 'border-zinc-800 text-zinc-500 hover:bg-zinc-800'}`}>Moderne</button>
                            <button onClick={() => setData({...data, font: 'lora'})} className={`flex-1 py-1.5 text-[10px] rounded border font-serif ${data.font === 'lora' ? 'bg-zinc-800 border-indigo-500 text-white' : 'border-zinc-800 text-zinc-500 hover:bg-zinc-800'}`}>Classique</button>
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 2: CONTENT */}
            {step === 2 && (
                <div className="flex flex-col gap-3 animate-fade-in pb-2">
                    <div className="flex-1 flex flex-col gap-3">
                        {data.sections.map((section, idx) => (
                            <div key={section.id} className="bg-zinc-900/50 p-2 rounded border border-zinc-800 flex flex-col gap-2 group">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] text-zinc-600 font-mono w-4">{idx+1}</span>
                                    <input 
                                        className="flex-1 bg-transparent border-b border-zinc-800 text-xs text-indigo-300 focus:border-indigo-500 outline-none pb-0.5 placeholder:text-zinc-600 font-bold" 
                                        placeholder="Titre de section" 
                                        value={section.title} 
                                        onChange={e => updateSection(section.id, 'title', e.target.value)} 
                                    />
                                    {data.sections.length > 1 && (
                                        <button onClick={() => removeSection(section.id)} className="text-zinc-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={12}/></button>
                                    )}
                                </div>
                                <textarea 
                                    className="w-full bg-zinc-800/50 rounded p-2 text-[10px] text-zinc-300 focus:bg-zinc-800 outline-none resize-none h-16 leading-relaxed" 
                                    placeholder="Contenu..." 
                                    value={section.content} 
                                    onChange={e => updateSection(section.id, 'content', e.target.value)} 
                                />
                            </div>
                        ))}
                        <div ref={sectionsEndRef} />
                    </div>
                    <button onClick={addSection} className="w-full py-2 border border-dashed border-zinc-700 rounded text-[10px] text-zinc-400 hover:text-white hover:border-zinc-500 transition-all flex items-center justify-center gap-1 shrink-0 mt-2">
                        <Plus size={12} /> Ajouter une section
                    </button>
                </div>
            )}

            {/* STEP 3: PREVIEW */}
            {step === 3 && (
                <div className="flex flex-col gap-3 animate-fade-in h-full">
                    <div className="flex-1 bg-white rounded-lg p-4 overflow-y-auto min-h-[100px] shadow-inner text-black relative">
                        {/* Mini PDF visual representation */}
                        <div className="border-b-2 pb-2 mb-3" style={{ borderColor: THEMES[data.theme].bg }}>
                            <h1 className="text-xl font-bold" style={{ color: THEMES[data.theme].bg, fontFamily: data.font === 'lora' ? 'serif' : 'sans-serif' }}>{data.title || 'Titre'}</h1>
                            <h2 className="text-sm text-gray-500">{data.subject || 'Matière'}</h2>
                        </div>
                        <div className="flex flex-col gap-3">
                            {data.sections.map(s => (
                                <div key={s.id}>
                                    <h3 className="text-sm font-bold mb-1" style={{ color: THEMES[data.theme].bg }}>{s.title || 'Section'}</h3>
                                    <p className="text-[10px] text-gray-700 whitespace-pre-wrap leading-relaxed">{s.content || '...'}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button 
                        onClick={generatePDF}
                        disabled={isGenerating}
                        className="w-full h-9 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-900/20 active:scale-95 shrink-0"
                    >
                        {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                        Télécharger PDF
                    </button>
                </div>
            )}
        </div>

        {/* Navigation Footer */}
        <div className="flex justify-between mt-3 pt-3 border-t border-white/5 shrink-0">
             {step > 1 ? (
                 <button onClick={() => setStep(prev => prev - 1 as any)} className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold flex items-center gap-1 transition-colors">
                    <ChevronLeft size={14} /> Retour
                 </button>
             ) : <div/>}

             {step < 3 && (
                 <button onClick={() => setStep(prev => prev + 1 as any)} className="px-3 py-1.5 rounded-lg bg-white text-black hover:bg-zinc-200 text-xs font-bold flex items-center gap-1 transition-colors">
                    Suivant <ChevronRight size={14} />
                 </button>
             )}
        </div>
    </div>
  );
};