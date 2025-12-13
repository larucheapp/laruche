import React, { useState, useEffect, useRef } from 'react';
import { Book, Search, Plus, Trash2, Download, ChevronLeft, ChevronRight, Loader2, Info, User, Check, AlertTriangle } from 'lucide-react';

interface YgoCard {
  id: number;
  name: string;
  type: string;
  desc: string;
  card_images: { image_url: string; image_url_small: string }[];
  card_prices: { cardmarket_price: string; tcgplayer_price: string }[];
  card_sets?: { set_code: string; set_rarity: string }[];
}

type Step = 'SEARCH' | 'BINDER' | 'EXPORT';

const API_URL = 'https://db.ygoprodeck.com/api/v7/cardinfo.php';

export const YugiohBinderTool: React.FC = () => {
  const [step, setStep] = useState<Step>('SEARCH');
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<YgoCard[]>([]);
  const [binder, setBinder] = useState<YgoCard[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  
  // Insurance Form
  const [ownerInfo, setOwnerInfo] = useState({ firstName: '', lastName: '', address: '' });
  const [showInsuranceForm, setShowInsuranceForm] = useState(false);

  const CARDS_PER_PAGE = 6; // 3x2 grid

  // --- Handlers ---

  const handleSearch = async () => {
    if (query.length < 3) return;
    setIsSearching(true);
    try {
      const res = await fetch(`${API_URL}?fname=${encodeURIComponent(query)}&language=fr`);
      const data = await res.json();
      setSearchResults(data.data?.slice(0, 20) || []);
    } catch (e) {
      console.error(e);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const addToBinder = (card: YgoCard) => {
    // Limit duplicates to 3
    const count = binder.filter(c => c.id === card.id).length;
    if (count < 3) {
      setBinder(prev => [...prev, card]);
    }
  };

  const removeFromBinder = (cardId: number) => {
    const idx = binder.findIndex(c => c.id === cardId);
    if (idx > -1) {
      const newBinder = [...binder];
      newBinder.splice(idx, 1);
      setBinder(newBinder);
    }
  };

  const calculateTotal = () => {
    return binder.reduce((acc, card) => acc + (parseFloat(card.card_prices?.[0]?.cardmarket_price || '0')), 0);
  };

  const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        // Use a proxy to avoid CORS issues in canvas/PDF
        img.src = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    });
  };

  const generateVisualPDF = async () => {
    if (binder.length === 0) return;
    setIsGenerating(true);
    try {
        const { jsPDF } = await import('https://esm.sh/jspdf@2.5.1');
        const doc = new jsPDF();
        const pageW = doc.internal.pageSize.getWidth();
        
        // 3x3 grid on PDF
        const cardsPerPagePdf = 9;
        const totalPdfPages = Math.ceil(binder.length / cardsPerPagePdf);
        const cardW = 60; 
        const cardH = 87.5; 
        const startX = 15; 
        const startY = 35; 
        const gap = 5;

        for (let i = 0; i < totalPdfPages; i++) {
            if (i > 0) doc.addPage();
            
            // Header
            doc.setFillColor(250, 204, 21); // Yellow-ish
            doc.rect(0, 0, pageW, 20, 'F');
            doc.setFontSize(16);
            doc.setTextColor(0);
            doc.text(`Mon Classeur Yu-Gi-Oh! - Page ${i + 1}`, pageW / 2, 13, { align: 'center' });

            const pageCards = binder.slice(i * cardsPerPagePdf, (i + 1) * cardsPerPagePdf);
            
            // Load images in parallel
            const loadedImages = await Promise.all(
                pageCards.map(c => loadImage(c.card_images[0].image_url).catch(() => null))
            );

            loadedImages.forEach((img, j) => {
                if (img) {
                    const row = Math.floor(j / 3);
                    const col = j % 3;
                    const x = startX + col * (cardW + gap);
                    const y = startY + row * (cardH + gap);
                    doc.addImage(img, 'JPEG', x, y, cardW, cardH);
                }
            });
        }

        doc.save('binder-visual.pdf');
    } catch (e) {
        console.error(e);
        alert("Erreur génération PDF");
    } finally {
        setIsGenerating(false);
    }
  };

  const generateInsurancePDF = async () => {
    if (binder.length === 0) return;
    setIsGenerating(true);
    try {
        const { jsPDF } = await import('https://esm.sh/jspdf@2.5.1');
        const autoTable = (await import('https://esm.sh/jspdf-autotable@3.5.23')).default;
        const doc = new jsPDF();
        
        const totalEUR = calculateTotal();
        const USD_TO_JPY = 155; // Approx

        // Header
        doc.setFontSize(18);
        doc.text("Certificat d'Assurance Collection", 105, 20, { align: 'center' });
        
        doc.setFontSize(10);
        doc.text(`Propriétaire: ${ownerInfo.firstName} ${ownerInfo.lastName}`, 14, 35);
        doc.text(`Adresse: ${ownerInfo.address}`, 14, 40);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 45);

        const tableData = binder.map(card => {
            const price = parseFloat(card.card_prices[0]?.cardmarket_price || '0');
            return [
                card.name,
                card.card_sets?.[0]?.set_code || 'N/A',
                card.card_sets?.[0]?.set_rarity || 'N/A',
                `${price.toFixed(2)} €`
            ];
        });

        autoTable(doc, {
            startY: 55,
            head: [['Carte', 'Code', 'Rareté', 'Valeur (Est.)']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [234, 179, 8] }, // Yellow-500
            foot: [['', '', 'TOTAL', `${totalEUR.toFixed(2)} €`]]
        });

        doc.save('binder-insurance.pdf');
        setShowInsuranceForm(false);
    } catch (e) {
        console.error(e);
        alert("Erreur PDF Assurance");
    } finally {
        setIsGenerating(false);
    }
  };

  // --- Render Steps ---

  const StepIndicator = () => (
      <div className="flex gap-1">
          <div className={`w-1.5 h-1.5 rounded-full ${step === 'SEARCH' ? 'bg-yellow-500' : 'bg-zinc-700'}`} />
          <div className={`w-1.5 h-1.5 rounded-full ${step === 'BINDER' ? 'bg-yellow-500' : 'bg-zinc-700'}`} />
          <div className={`w-1.5 h-1.5 rounded-full ${step === 'EXPORT' ? 'bg-yellow-500' : 'bg-zinc-700'}`} />
      </div>
  );

  return (
    <div className="w-full h-full flex flex-col p-3 relative overflow-hidden bg-zinc-950/50">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-3 shrink-0">
            <div className="flex items-center gap-2 text-yellow-500">
                <Book size={18} />
                <h2 className="text-xs font-bold uppercase tracking-wider">YGO Binder</h2>
            </div>
            <StepIndicator />
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0 flex flex-col relative">
            
            {/* STEP 1: SEARCH */}
            {step === 'SEARCH' && (
                <div className="flex flex-col h-full gap-2 animate-fade-in">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <input 
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Dark Magician..."
                                className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 pl-7 text-[10px] text-white focus:border-yellow-500 outline-none"
                            />
                            <Search size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-500"/>
                        </div>
                        <button onClick={handleSearch} disabled={isSearching} className="bg-zinc-800 hover:bg-zinc-700 text-white rounded p-1.5 transition-colors">
                            {isSearching ? <Loader2 size={12} className="animate-spin"/> : <Search size={12}/>}
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 bg-zinc-900/30 rounded border border-zinc-800/50">
                        {searchResults.length === 0 && !isSearching ? (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-600 gap-1">
                                <Search size={20} className="opacity-20"/>
                                <span className="text-[9px]">Recherchez une carte</span>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1 p-1">
                                {searchResults.map(card => {
                                    const count = binder.filter(c => c.id === card.id).length;
                                    return (
                                        <div key={card.id} className="flex items-center gap-2 bg-zinc-800/50 p-1.5 rounded border border-zinc-700/50 hover:bg-zinc-800 transition-colors group">
                                            <img src={card.card_images[0].image_url_small} className="w-6 h-8 object-cover rounded-[1px]" loading="lazy" />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[9px] font-bold text-zinc-200 truncate">{card.name}</div>
                                                <div className="text-[8px] text-yellow-500 font-mono">{parseFloat(card.card_prices[0]?.cardmarket_price || '0').toFixed(2)}€</div>
                                            </div>
                                            <button 
                                                onClick={() => addToBinder(card)}
                                                disabled={count >= 3}
                                                className={`w-5 h-5 flex items-center justify-center rounded ${count >= 3 ? 'bg-zinc-700 text-zinc-500' : 'bg-yellow-600 hover:bg-yellow-500 text-white'}`}
                                            >
                                                {count >= 3 ? <Check size={10}/> : <Plus size={10}/>}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* STEP 2: BINDER GRID */}
            {step === 'BINDER' && (
                <div className="flex flex-col h-full gap-2 animate-fade-in">
                    <div className="flex justify-between items-end px-1 border-b border-zinc-800 pb-1">
                        <span className="text-[9px] text-zinc-500 font-bold uppercase">{binder.length} Cartes</span>
                        <span className="text-xs font-bold text-yellow-400">{calculateTotal().toFixed(2)} €</span>
                    </div>

                    <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-2 min-h-0">
                        {Array.from({ length: CARDS_PER_PAGE }).map((_, i) => {
                            const idx = currentPage * CARDS_PER_PAGE + i;
                            const card = binder[idx];
                            return (
                                <div key={i} className="relative bg-zinc-800/30 rounded border border-zinc-800 border-dashed flex items-center justify-center overflow-hidden group">
                                    {card ? (
                                        <>
                                            <img src={card.card_images[0].image_url_small} className="h-full object-contain" />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button onClick={() => removeFromBinder(card.id)} className="p-1.5 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500 hover:text-white transition-colors">
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                            <div className="absolute bottom-0 right-0 bg-black/80 px-1 rounded-tl text-[8px] font-mono text-yellow-400">
                                                {parseFloat(card.card_prices[0]?.cardmarket_price).toFixed(2)}€
                                            </div>
                                        </>
                                    ) : (
                                        <span className="text-zinc-700 opacity-20 text-[8px] font-bold">VIDE</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex justify-center gap-2 items-center shrink-0">
                        <button 
                            disabled={currentPage === 0}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="p-1 rounded bg-zinc-800 text-zinc-400 disabled:opacity-30 hover:text-white"
                        >
                            <ChevronLeft size={12} />
                        </button>
                        <span className="text-[9px] text-zinc-500 font-mono">Page {currentPage + 1}</span>
                        <button 
                            disabled={(currentPage + 1) * CARDS_PER_PAGE >= binder.length}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="p-1 rounded bg-zinc-800 text-zinc-400 disabled:opacity-30 hover:text-white"
                        >
                            <ChevronRight size={12} />
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 3: EXPORT */}
            {step === 'EXPORT' && (
                <div className="flex flex-col h-full gap-2 animate-fade-in justify-center">
                    {!showInsuranceForm ? (
                        <div className="flex flex-col gap-2">
                            <button 
                                onClick={generateVisualPDF}
                                disabled={isGenerating || binder.length === 0}
                                className="h-10 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 group"
                            >
                                {isGenerating ? <Loader2 size={14} className="animate-spin"/> : <Book size={14} className="group-hover:text-yellow-400"/>}
                                <span className="text-[10px] font-bold">PDF Visuel</span>
                            </button>
                            
                            <button 
                                onClick={() => setShowInsuranceForm(true)}
                                disabled={isGenerating || binder.length === 0}
                                className="h-10 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-yellow-900/20"
                            >
                                <Check size={14} />
                                <span className="text-[10px] font-bold">Certificat Assurance</span>
                            </button>

                            {binder.length === 0 && (
                                <div className="text-center text-[9px] text-red-400 mt-2 flex items-center justify-center gap-1">
                                    <AlertTriangle size={10} /> Classeur vide
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2 bg-zinc-900/50 p-2 rounded border border-zinc-800">
                            <div className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Infos Propriétaire</div>
                            <input className="bg-zinc-900 border border-zinc-700 rounded p-1.5 text-[10px] text-white outline-none focus:border-yellow-500" placeholder="Prénom" value={ownerInfo.firstName} onChange={e => setOwnerInfo({...ownerInfo, firstName: e.target.value})} />
                            <input className="bg-zinc-900 border border-zinc-700 rounded p-1.5 text-[10px] text-white outline-none focus:border-yellow-500" placeholder="Nom" value={ownerInfo.lastName} onChange={e => setOwnerInfo({...ownerInfo, lastName: e.target.value})} />
                            <input className="bg-zinc-900 border border-zinc-700 rounded p-1.5 text-[10px] text-white outline-none focus:border-yellow-500" placeholder="Ville / Adresse" value={ownerInfo.address} onChange={e => setOwnerInfo({...ownerInfo, address: e.target.value})} />
                            
                            <div className="flex gap-2 mt-1">
                                <button onClick={() => setShowInsuranceForm(false)} className="flex-1 py-1.5 bg-zinc-800 text-zinc-400 rounded text-[10px] hover:text-white">Annuler</button>
                                <button onClick={generateInsurancePDF} className="flex-1 py-1.5 bg-yellow-600 text-white rounded text-[10px] hover:bg-yellow-500 font-bold">Générer</button>
                            </div>
                        </div>
                    )}
                </div>
            )}

        </div>

        {/* Footer Navigation */}
        <div className="flex justify-between mt-2 pt-2 border-t border-white/5 shrink-0">
            {step === 'SEARCH' ? <div/> : (
                <button onClick={() => setStep(prev => prev === 'EXPORT' ? 'BINDER' : 'SEARCH')} className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-white px-2 py-1 bg-zinc-800 rounded">
                    <ChevronLeft size={10} /> Retour
                </button>
            )}
            
            {step === 'EXPORT' ? <div/> : (
                <button onClick={() => setStep(prev => prev === 'SEARCH' ? 'BINDER' : 'EXPORT')} className="flex items-center gap-1 text-[10px] text-black bg-white hover:bg-zinc-200 px-2 py-1 rounded font-bold ml-auto">
                    Suivant <ChevronRight size={10} />
                </button>
            )}
        </div>
    </div>
  );
};