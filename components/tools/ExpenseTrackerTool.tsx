import React, { useState, useRef } from 'react';
import { Receipt, ChevronLeft, ChevronRight, Download, Plus, Trash2, Upload, Image as ImageIcon, Loader2, DollarSign, Calendar, Check } from 'lucide-react';

interface Expense {
  id: string;
  desc: string;
  category: string;
  amount: number;
  vat: number;
  date: string;
  receipt?: string;
}

interface UserInfo {
  name: string;
  company: string;
  period: string;
  logo: string | null;
}

const CATEGORIES = ['Repas', 'Transport', 'Hébergement', 'Fournitures', 'Autre'];

export const ExpenseTrackerTool: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAddingMode, setIsAddingMode] = useState(false);
  
  // Data
  const [info, setInfo] = useState<UserInfo>({ name: '', company: '', period: '', logo: null });
  const [expenses, setExpenses] = useState<Expense[]>([]);
  
  // New Expense Form State - Using strings for inputs to handle "controlled" state better
  const [descInput, setDescInput] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [vatInput, setVatInput] = useState('');
  const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]);
  const [categoryInput, setCategoryInput] = useState('Repas');
  const [receiptInput, setReceiptInput] = useState<string | undefined>(undefined);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const receiptInputRef = useRef<HTMLInputElement>(null);

  // --- Helpers ---
  const formatCurrency = (val: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
  
  const totalHT = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalVAT = expenses.reduce((sum, e) => sum + e.vat, 0);
  const totalTTC = totalHT + totalVAT;

  // --- Handlers ---
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => setInfo(prev => ({ ...prev, logo: ev.target?.result as string }));
          reader.readAsDataURL(file);
      }
  };

  const resetForm = () => {
      setDescInput('');
      setAmountInput('');
      setVatInput('');
      setDateInput(new Date().toISOString().split('T')[0]);
      setCategoryInput('Repas');
      setReceiptInput(undefined);
  };

  const handleAddExpense = () => {
      // Parse numbers
      const amountVal = parseFloat(amountInput);
      const vatVal = parseFloat(vatInput);

      // Validation
      if (!descInput.trim() || isNaN(amountVal) || amountVal <= 0) return;
      
      setExpenses(prev => [...prev, {
          id: crypto.randomUUID(),
          desc: descInput,
          category: categoryInput,
          amount: amountVal,
          vat: isNaN(vatVal) ? 0 : vatVal,
          date: dateInput,
          receipt: receiptInput
      }]);
      
      resetForm();
      setIsAddingMode(false);
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => setReceiptInput(ev.target?.result as string);
          reader.readAsDataURL(file);
      }
  };

  const generatePDF = async () => {
      setIsGenerating(true);
      try {
          const { jsPDF } = await import('https://esm.sh/jspdf@2.5.1');
          const autoTable = (await import('https://esm.sh/jspdf-autotable@3.5.23')).default;
          
          const doc = new jsPDF();
          const pageW = doc.internal.pageSize.getWidth();
          const pageH = doc.internal.pageSize.getHeight();
          
          // Helper for specific PDF formatting (1.394,00 €)
          const fmtPdf = (num: number) => {
             return num.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " €";
          };

          // Header
          if (info.logo) {
              const imgProps = doc.getImageProperties(info.logo);
              const ratio = imgProps.height / imgProps.width;
              doc.addImage(info.logo, 'JPEG', 15, 10, 30, 30 * ratio);
          }
          
          doc.setFontSize(22);
          doc.setFont('helvetica', 'bold');
          doc.text('NOTE DE FRAIS', pageW - 15, 20, { align: 'right' });
          
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.text(info.company || 'Société', pageW - 15, 30, { align: 'right' });
          doc.text(info.period || '', pageW - 15, 35, { align: 'right' });

          doc.text(`Nom: ${info.name}`, 15, 45);
          
          // Table
          const tableBody = expenses.map(e => [
              new Date(e.date).toLocaleDateString('fr-FR'),
              e.category,
              e.desc,
              fmtPdf(e.amount),
              fmtPdf(e.vat),
              fmtPdf(e.amount + e.vat)
          ]);

          autoTable(doc, {
              startY: 55,
              head: [['Date', 'Catégorie', 'Description', 'HT', 'TVA', 'TTC']],
              body: tableBody,
              theme: 'striped',
              headStyles: { fillColor: [124, 58, 237] },
              styles: { fontSize: 8 },
              columnStyles: { 3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'right' } }
          });

          // Totals
          // @ts-ignore
          let finalY = doc.lastAutoTable.finalY + 10;
          
          // Check if we need a new page for the total
          if (finalY > pageH - 20) {
              doc.addPage();
              finalY = 20;
          }

          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(`Total à rembourser: ${fmtPdf(totalTTC)}`, pageW - 15, finalY, { align: 'right' });
          
          // Receipts
          const withReceipts = expenses.filter(e => e.receipt);
          if (withReceipts.length > 0) {
              doc.addPage();
              doc.setFontSize(16);
              doc.text("Justificatifs", 15, 20);
              let rY = 30;
              
              withReceipts.forEach((e) => {
                  if (rY > 250) { doc.addPage(); rY = 20; }
                  doc.setFontSize(10);
                  doc.text(`Ref: ${e.desc} (${fmtPdf(e.amount + e.vat)})`, 15, rY);
                  if (e.receipt) {
                      try {
                        const imgProps = doc.getImageProperties(e.receipt);
                        // Scale to max height 60
                        const h = 60;
                        const w = (imgProps.width * h) / imgProps.height;
                        doc.addImage(e.receipt, 'JPEG', 15, rY + 5, w, h);
                        rY += 75;
                      } catch (err) {
                          doc.text("[Image Error]", 15, rY + 10);
                          rY += 20;
                      }
                  }
              });
          }

          doc.save(`ndf-${info.name.replace(/\s/g,'_')}.pdf`);

      } catch (e) {
          console.error(e);
          alert("Erreur PDF");
      } finally {
          setIsGenerating(false);
      }
  };

  // --- Step Rendering ---

  // STEP 1: IDENTITY
  if (step === 1) {
      return (
        <div className="w-full h-full flex flex-col p-2 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2 shrink-0 text-violet-400">
                <div className="flex items-center gap-1.5">
                    <Receipt size={14} />
                    <h2 className="text-[10px] font-bold uppercase tracking-wider">Note de Frais</h2>
                </div>
                <div className="flex gap-1">
                    <div className="w-1 h-1 rounded-full bg-violet-500"/>
                    <div className="w-1 h-1 rounded-full bg-zinc-800"/>
                    <div className="w-1 h-1 rounded-full bg-zinc-800"/>
                </div>
            </div>
            
            <div className="flex-1 flex flex-col gap-2 min-h-0 animate-fade-in">
                {/* Logo + Name in one compact row */}
                <div className="flex gap-2">
                    <div onClick={() => fileInputRef.current?.click()} className="w-9 h-[30px] bg-zinc-800 rounded flex items-center justify-center shrink-0 border border-zinc-700 cursor-pointer hover:border-violet-500 overflow-hidden transition-colors" title="Ajouter Logo">
                        {info.logo ? <img src={info.logo} className="w-full h-full object-contain" /> : <ImageIcon size={14} className="text-zinc-600" />}
                    </div>
                    <div className="flex-1">
                        <input type="file" ref={fileInputRef} accept="image/*" hidden onChange={handleLogoUpload} />
                        <input className="w-full h-[30px] bg-zinc-900 border border-zinc-700 rounded px-2 text-[10px] text-white focus:border-violet-500 outline-none placeholder:text-zinc-600" placeholder="Votre Nom" value={info.name} onChange={e => setInfo({...info, name: e.target.value})} />
                    </div>
                </div>
                
                {/* Other Inputs Compact */}
                <input className="w-full h-[26px] bg-zinc-900 border border-zinc-700 rounded px-2 text-[10px] text-white focus:border-violet-500 outline-none placeholder:text-zinc-600" placeholder="Entreprise" value={info.company} onChange={e => setInfo({...info, company: e.target.value})} />
                <input className="w-full h-[26px] bg-zinc-900 border border-zinc-700 rounded px-2 text-[10px] text-white focus:border-violet-500 outline-none placeholder:text-zinc-600" placeholder="Période (ex: Oct 2023)" value={info.period} onChange={e => setInfo({...info, period: e.target.value})} />
            </div>

            <div className="mt-auto pt-2 flex justify-end shrink-0">
                <button onClick={() => setStep(2)} className="h-7 px-3 bg-white text-black hover:bg-zinc-200 text-[10px] font-bold rounded flex items-center gap-1 transition-colors">
                    Suivant <ChevronRight size={12} />
                </button>
            </div>
        </div>
      );
  }

  // STEP 2: EXPENSES LIST / ADD
  if (step === 2) {
      if (isAddingMode) {
          return (
            <div className="w-full h-full flex flex-col p-2 relative overflow-hidden bg-zinc-950">
                <div className="flex items-center justify-between mb-2 shrink-0">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Nouvelle Dépense</span>
                    <button onClick={() => setIsAddingMode(false)} className="text-zinc-400 hover:text-white"><ChevronLeft size={14}/></button>
                </div>
                
                <div className="flex-1 flex flex-col gap-2 min-h-0 overflow-y-auto custom-scrollbar pr-1">
                    <input 
                        className="w-full h-[28px] bg-zinc-900 border border-zinc-800 rounded px-2 text-[10px] text-white focus:border-violet-500 outline-none" 
                        placeholder="Description" 
                        value={descInput} 
                        onChange={e => setDescInput(e.target.value)} 
                    />
                    
                    <div className="grid grid-cols-2 gap-2">
                        <div className="relative">
                            <DollarSign size={10} className="absolute left-2 top-[9px] text-zinc-500"/>
                            <input 
                                type="number" 
                                className="w-full h-[28px] bg-zinc-900 border border-zinc-800 rounded px-2 pl-5 text-[10px] text-white focus:border-violet-500 outline-none" 
                                placeholder="HT" 
                                value={amountInput} 
                                onChange={e => setAmountInput(e.target.value)} 
                            />
                        </div>
                        <div className="relative">
                            <span className="absolute left-2 top-[9px] text-[8px] text-zinc-500 font-bold">TVA</span>
                            <input 
                                type="number" 
                                className="w-full h-[28px] bg-zinc-900 border border-zinc-800 rounded px-2 pl-7 text-[10px] text-white focus:border-violet-500 outline-none" 
                                placeholder="0" 
                                value={vatInput} 
                                onChange={e => setVatInput(e.target.value)} 
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <Calendar size={10} className="absolute left-2 top-[9px] text-zinc-500"/>
                        <input 
                            type="date" 
                            className="w-full h-[28px] bg-zinc-900 border border-zinc-800 rounded px-2 pl-6 text-[10px] text-zinc-300 focus:border-violet-500 outline-none" 
                            value={dateInput} 
                            onChange={e => setDateInput(e.target.value)} 
                        />
                    </div>

                    <div className="flex overflow-x-auto gap-1 pb-1 custom-scrollbar">
                        {CATEGORIES.map(cat => (
                            <button key={cat} onClick={() => setCategoryInput(cat)} className={`px-2 py-1 rounded text-[9px] border whitespace-nowrap ${categoryInput === cat ? 'bg-violet-500/20 border-violet-500 text-violet-200' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}>
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div onClick={() => receiptInputRef.current?.click()} className="h-[28px] border border-dashed border-zinc-700 rounded flex items-center justify-center gap-2 cursor-pointer hover:bg-zinc-900 transition-colors shrink-0">
                        {receiptInput ? <span className="text-[9px] text-emerald-400 flex items-center gap-1"><Check size={10}/> Reçu OK</span> : <span className="text-[9px] text-zinc-500 flex items-center gap-1"><Upload size={10}/> Reçu</span>}
                        <input type="file" ref={receiptInputRef} accept="image/*" hidden onChange={handleReceiptUpload} />
                    </div>
                </div>

                <button onClick={handleAddExpense} className="mt-2 w-full h-7 bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-bold rounded flex items-center justify-center gap-1 shrink-0">
                    <Plus size={12} /> Ajouter
                </button>
            </div>
          );
      }

      return (
        <div className="w-full h-full flex flex-col p-2 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2 shrink-0">
                <div className="flex flex-col leading-none">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase">Total TTC</span>
                    <span className="text-lg font-bold text-white">{formatCurrency(totalTTC)}</span>
                </div>
                <button onClick={() => setIsAddingMode(true)} className="w-7 h-7 bg-violet-600 hover:bg-violet-500 text-white rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95">
                    <Plus size={14} />
                </button>
            </div>

            <div className="flex-1 bg-zinc-900/50 rounded border border-zinc-800 overflow-y-auto custom-scrollbar p-1 min-h-0">
                {expenses.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-600">
                        <Receipt size={20} className="opacity-20 mb-1" />
                        <span className="text-[9px]">Vide</span>
                    </div>
                ) : (
                    <div className="flex flex-col gap-1">
                        {expenses.map((e, i) => (
                            <div key={e.id} className="flex items-center justify-between bg-zinc-900 p-1.5 rounded border border-zinc-800/50">
                                <div className="flex flex-col min-w-0 pr-2">
                                    <span className="text-[10px] font-bold text-zinc-200 truncate">{e.desc}</span>
                                    <span className="text-[8px] text-zinc-500">{new Date(e.date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-[10px] font-bold text-violet-400">{formatCurrency(e.amount + e.vat)}</span>
                                    <button onClick={() => setExpenses(prev => prev.filter(x => x.id !== e.id))} className="text-zinc-600 hover:text-red-400"><Trash2 size={10}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-2 flex justify-between shrink-0">
                <button onClick={() => setStep(1)} className="h-7 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold rounded flex items-center gap-1 transition-colors">
                    <ChevronLeft size={12} />
                </button>
                <button onClick={() => setStep(3)} className="h-7 px-3 bg-white text-black hover:bg-zinc-200 text-[10px] font-bold rounded flex items-center gap-1 transition-colors" disabled={expenses.length === 0}>
                    Fin <ChevronRight size={12} />
                </button>
            </div>
        </div>
      );
  }

  // STEP 3: SUMMARY / EXPORT
  return (
    <div className="w-full h-full flex flex-col p-2 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-2 text-emerald-400 shrink-0">
            <Check size={14} />
            <h2 className="text-[10px] font-bold uppercase tracking-wider">Résumé</h2>
        </div>

        <div className="flex-1 flex flex-col justify-center gap-2 animate-fade-in min-h-0">
            <div className="bg-zinc-800/50 p-3 rounded border border-zinc-700 flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-[10px]">
                    <span className="text-zinc-400">Total HT</span>
                    <span className="text-zinc-200 font-mono">{formatCurrency(totalHT)}</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                    <span className="text-zinc-400">Total TVA</span>
                    <span className="text-zinc-200 font-mono">{formatCurrency(totalVAT)}</span>
                </div>
                <div className="h-px bg-zinc-700 my-0.5" />
                <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white">À Payer</span>
                    <span className="text-sm font-bold text-violet-400 font-mono">{formatCurrency(totalTTC)}</span>
                </div>
            </div>
            
            <div className="text-center">
                <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">{expenses.length} Dépenses</span>
            </div>
        </div>

        <div className="mt-auto pt-2 flex gap-2 shrink-0">
            <button onClick={() => setStep(2)} className="h-8 px-3 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold flex items-center gap-1 transition-colors">
                <ChevronLeft size={12} />
            </button>
            <button onClick={generatePDF} disabled={isGenerating} className="flex-1 h-8 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-900/20">
                {isGenerating ? <Loader2 size={12} className="animate-spin"/> : <Download size={12}/>}
                PDF
            </button>
        </div>
    </div>
  );
};