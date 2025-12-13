import React, { useState, useRef } from 'react';
import { FileText, ChevronRight, ChevronLeft, Check, Plus, Trash2, Download, Upload, Image as ImageIcon } from 'lucide-react';

interface LineItem {
  id: number;
  desc: string;
  qty: number;
  price: number;
}

export const InvoiceGeneratorTool: React.FC = () => {
  const [step, setStep] = useState(1);
  const [logo, setLogo] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Form State
  const [freelancer, setFreelancer] = useState({ name: '', address: '', siret: '', noVat: true });
  const [client, setClient] = useState({ name: '', address: '' });
  const [invoice, setInvoice] = useState({ 
    number: '', 
    date: new Date().toISOString().split('T')[0], 
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] 
  });
  const [items, setItems] = useState<LineItem[]>([{ id: 1, desc: '', qty: 1, price: 0 }]);
  const [payment, setPayment] = useState({ iban: '', notes: '' });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Handlers ---

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setLogo(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addItem = () => {
    setItems([...items, { id: Date.now(), desc: '', qty: 1, price: 0 }]);
  };

  const removeItem = (id: number) => {
    setItems(items.filter(i => i.id !== id));
  };

  const updateItem = (id: number, field: keyof LineItem, value: any) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const calculateTotal = () => {
    return items.reduce((acc, item) => acc + (item.qty * item.price), 0);
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
        const { jsPDF } = await import('https://esm.sh/jspdf@2.5.1');
        const autoTable = (await import('https://esm.sh/jspdf-autotable@3.5.23')).default;
        
        const doc = new jsPDF();
        const pageW = doc.internal.pageSize.getWidth();
        const pageH = doc.internal.pageSize.getHeight();
        const margin = 15;
        let cursorY = 20;

        // --- Header ---
        if (logo) {
            const imgProps = doc.getImageProperties(logo);
            const ratio = imgProps.height / imgProps.width;
            doc.addImage(logo, 'PNG', pageW - margin - 25, cursorY, 25, 25 * ratio);
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(freelancer.name || 'Your Name', margin, cursorY + 5);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const addressLines = doc.splitTextToSize(freelancer.address || '', 80);
        cursorY += 10;
        doc.text(addressLines, margin, cursorY);
        cursorY += (addressLines.length * 4) + 2;
        doc.text(`SIRET: ${freelancer.siret || 'N/A'}`, margin, cursorY);

        // --- Client & Invoice Info ---
        cursorY = Math.max(cursorY + 20, 60);
        
        // Client (Left)
        doc.setFont('helvetica', 'bold');
        doc.text('Facturé à:', margin, cursorY);
        doc.setFont('helvetica', 'normal');
        doc.text(client.name || 'Client Name', margin, cursorY + 5);
        const clientAddrLines = doc.splitTextToSize(client.address || '', 80);
        doc.text(clientAddrLines, margin, cursorY + 10);

        // Invoice Data (Right)
        const infoX = pageW / 2 + 20;
        doc.setFont('helvetica', 'bold');
        doc.text(`FACTURE N°: ${invoice.number}`, infoX, cursorY);
        doc.setFont('helvetica', 'normal');
        doc.text(`Date: ${new Date(invoice.date).toLocaleDateString()}`, infoX, cursorY + 5);
        doc.text(`Échéance: ${new Date(invoice.dueDate).toLocaleDateString()}`, infoX, cursorY + 10);

        // --- Table ---
        cursorY += 25;
        const tableBody = items.map(item => [
            item.desc,
            item.qty.toString(),
            `${item.price.toFixed(2)} €`,
            `${(item.qty * item.price).toFixed(2)} €`
        ]);

        autoTable(doc, {
            startY: cursorY,
            head: [['Description', 'Qté', 'Prix Unitaire', 'Total']],
            body: tableBody,
            theme: 'grid',
            headStyles: { fillColor: [56, 189, 248] }, // Sky blue-ish
            styles: { fontSize: 9 },
        });

        // --- Totals ---
        // @ts-ignore
        let finalY = doc.lastAutoTable.finalY + 10;
        const total = calculateTotal().toFixed(2);

        doc.setFont('helvetica', 'bold');
        doc.text('Total:', pageW - margin - 40, finalY);
        doc.text(`${total} €`, pageW - margin, finalY, { align: 'right' });

        if (freelancer.noVat) {
            finalY += 6;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.text("TVA non applicable - art. 293 B du CGI", pageW - margin, finalY, { align: 'right' });
        }

        // --- Footer (Payment & Notes) ---
        const footerY = pageH - 40;
        doc.setLineWidth(0.1);
        doc.line(margin, footerY, pageW - margin, footerY);
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Paiement:', margin, footerY + 8);
        doc.setFont('helvetica', 'normal');
        doc.text(payment.iban || 'IBAN non fourni', margin, footerY + 14);

        if (payment.notes) {
             const notesLines = doc.splitTextToSize(payment.notes, pageW - margin * 2);
             doc.text(notesLines, margin, footerY + 22);
        }

        doc.save(`facture-${invoice.number || 'brouillon'}.pdf`);

    } catch (e) {
        console.error(e);
        alert('Erreur PDF');
    } finally {
        setIsGenerating(false);
    }
  };

  // --- Step Rendering Helpers ---
  
  const NavButtons = () => (
    <div className="flex justify-between mt-auto pt-4 border-t border-white/5 shrink-0">
        {step > 1 ? (
             <button onClick={() => setStep(step - 1)} className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold flex items-center gap-1 transition-colors">
                <ChevronLeft size={14} /> Retour
             </button>
        ) : <div/>}
        
        {step < 5 ? (
            <button onClick={() => setStep(step + 1)} className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1 transition-colors shadow-lg shadow-sky-900/20">
                Suivant <ChevronRight size={14} />
            </button>
        ) : (
            <button onClick={generatePDF} disabled={isGenerating} className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 transition-colors shadow-lg shadow-emerald-900/20">
                {isGenerating ? '...' : <><Download size={14} /> Exporter PDF</>}
            </button>
        )}
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col p-3 relative overflow-hidden">
       {/* Header */}
       <div className="flex items-center gap-2 mb-3 text-sky-400 shrink-0">
            <FileText size={18} />
            <div className="flex flex-col leading-none">
                <h2 className="text-xs font-bold uppercase tracking-wider">Facture Express</h2>
                <span className="text-[9px] text-zinc-500 font-medium">Étape {step} sur 5</span>
            </div>
            {/* Progress Dots */}
            <div className="ml-auto flex gap-1">
                {[1,2,3,4,5].map(s => (
                    <div key={s} className={`w-1.5 h-1.5 rounded-full transition-colors ${s === step ? 'bg-sky-500' : s < step ? 'bg-sky-500/30' : 'bg-zinc-800'}`} />
                ))}
            </div>
       </div>

       {/* Steps */}
       <div className="flex-1 overflow-y-auto pr-1 min-h-0 custom-scrollbar flex flex-col">
          
          {/* STEP 1: FREELANCER INFO */}
          {step === 1 && (
              <div className="flex flex-col gap-3 animate-fade-in">
                  <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center shrink-0 border border-zinc-700 overflow-hidden cursor-pointer hover:border-sky-500 transition-colors" onClick={() => fileInputRef.current?.click()}>
                          {logo ? <img src={logo} className="w-full h-full object-contain" /> : <ImageIcon size={20} className="text-zinc-600" />}
                      </div>
                      <div className="flex-1">
                          <label className="text-[10px] text-zinc-500 font-bold block mb-1">VOTRE LOGO</label>
                          <input type="file" ref={fileInputRef} accept="image/*" hidden onChange={handleLogoUpload} />
                          <button onClick={() => fileInputRef.current?.click()} className="text-[10px] bg-zinc-800 px-2 py-1 rounded text-zinc-300 hover:text-white flex items-center gap-1 transition-colors">
                              <Upload size={10} /> Ajouter
                          </button>
                      </div>
                  </div>
                  <div className="space-y-2">
                      <input className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-xs text-white focus:border-sky-500 outline-none" placeholder="Votre Nom / Société" value={freelancer.name} onChange={e => setFreelancer({...freelancer, name: e.target.value})} />
                      <textarea className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-xs text-white focus:border-sky-500 outline-none resize-none" rows={2} placeholder="Adresse" value={freelancer.address} onChange={e => setFreelancer({...freelancer, address: e.target.value})} />
                      <input className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-xs text-white focus:border-sky-500 outline-none" placeholder="SIRET" value={freelancer.siret} onChange={e => setFreelancer({...freelancer, siret: e.target.value})} />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer bg-zinc-800/30 p-2 rounded border border-zinc-700/50">
                      <input type="checkbox" checked={freelancer.noVat} onChange={e => setFreelancer({...freelancer, noVat: e.target.checked})} className="accent-sky-500 w-3.5 h-3.5" />
                      <span className="text-[10px] text-zinc-400">Exonération TVA (Art. 293B)</span>
                  </label>
              </div>
          )}

          {/* STEP 2: CLIENT INFO */}
          {step === 2 && (
              <div className="flex flex-col gap-3 animate-fade-in">
                  <div className="space-y-3">
                      <div>
                        <label className="text-[10px] text-zinc-500 font-bold block mb-1">NOM CLIENT</label>
                        <input className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-xs text-white focus:border-sky-500 outline-none" placeholder="Société Cliente" value={client.name} onChange={e => setClient({...client, name: e.target.value})} />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-500 font-bold block mb-1">ADRESSE CLIENT</label>
                        <textarea className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-xs text-white focus:border-sky-500 outline-none resize-none" rows={3} placeholder="Adresse complète" value={client.address} onChange={e => setClient({...client, address: e.target.value})} />
                      </div>
                  </div>
              </div>
          )}

          {/* STEP 3: INVOICE DETAILS */}
          {step === 3 && (
              <div className="flex flex-col gap-3 animate-fade-in">
                   <div>
                        <label className="text-[10px] text-zinc-500 font-bold block mb-1">NUMÉRO FACTURE</label>
                        <input className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-xs text-white focus:border-sky-500 outline-none" placeholder="FAC-2023-001" value={invoice.number} onChange={e => setInvoice({...invoice, number: e.target.value})} />
                   </div>
                   <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-[10px] text-zinc-500 font-bold block mb-1">DATE</label>
                            <input type="date" className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-xs text-white focus:border-sky-500 outline-none" value={invoice.date} onChange={e => setInvoice({...invoice, date: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-[10px] text-zinc-500 font-bold block mb-1">ÉCHÉANCE</label>
                            <input type="date" className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-xs text-white focus:border-sky-500 outline-none" value={invoice.dueDate} onChange={e => setInvoice({...invoice, dueDate: e.target.value})} />
                        </div>
                   </div>
              </div>
          )}

          {/* STEP 4: LINE ITEMS */}
          {step === 4 && (
              <div className="flex flex-col gap-2 animate-fade-in h-full">
                  <div className="flex-1 overflow-y-auto min-h-[100px] flex flex-col gap-2">
                    {items.map((item, idx) => (
                        <div key={item.id} className="bg-zinc-900/50 p-2 rounded border border-zinc-800 flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] text-zinc-500 font-mono">#{idx+1}</span>
                                <input className="flex-1 bg-transparent border-b border-zinc-700 text-xs text-white focus:border-sky-500 outline-none pb-0.5" placeholder="Description" value={item.desc} onChange={e => updateItem(item.id, 'desc', e.target.value)} />
                                <button onClick={() => removeItem(item.id)} className="text-zinc-600 hover:text-red-400 transition-colors"><Trash2 size={12}/></button>
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1 flex flex-col">
                                    <label className="text-[8px] text-zinc-600">QTÉ</label>
                                    <input type="number" className="bg-zinc-800 rounded p-1 text-xs text-white text-center outline-none" value={item.qty} onChange={e => updateItem(item.id, 'qty', parseInt(e.target.value) || 0)} />
                                </div>
                                <div className="flex-1 flex flex-col">
                                    <label className="text-[8px] text-zinc-600">PRIX</label>
                                    <input type="number" className="bg-zinc-800 rounded p-1 text-xs text-white text-center outline-none" value={item.price} onChange={e => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)} />
                                </div>
                                <div className="flex-1 flex flex-col items-end justify-end pb-1">
                                    <span className="text-xs font-bold text-sky-400">{(item.qty * item.price).toFixed(2)}€</span>
                                </div>
                            </div>
                        </div>
                    ))}
                  </div>
                  
                  <button onClick={addItem} className="w-full py-1.5 border border-dashed border-zinc-700 rounded text-[10px] text-zinc-400 hover:text-white hover:border-zinc-500 transition-all flex items-center justify-center gap-1">
                      <Plus size={12} /> Ajouter Ligne
                  </button>

                  <div className="flex justify-between items-center bg-zinc-800 p-2 rounded">
                      <span className="text-xs font-bold text-zinc-400">Total</span>
                      <span className="text-sm font-bold text-white">{calculateTotal().toFixed(2)} €</span>
                  </div>
              </div>
          )}

          {/* STEP 5: PAYMENT & NOTES */}
          {step === 5 && (
              <div className="flex flex-col gap-3 animate-fade-in">
                  <div>
                    <label className="text-[10px] text-zinc-500 font-bold block mb-1">IBAN</label>
                    <input className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-xs text-white focus:border-sky-500 outline-none font-mono" placeholder="FR76 ...." value={payment.iban} onChange={e => setPayment({...payment, iban: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 font-bold block mb-1">NOTES</label>
                    <textarea className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-xs text-white focus:border-sky-500 outline-none resize-none" rows={3} placeholder="Merci de votre confiance..." value={payment.notes} onChange={e => setPayment({...payment, notes: e.target.value})} />
                  </div>
              </div>
          )}
       </div>

       <NavButtons />
    </div>
  );
};