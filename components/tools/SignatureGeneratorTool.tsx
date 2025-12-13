import React, { useState } from 'react';
import { PenTool, ChevronRight, ChevronLeft, Check, Copy, Layout, User, Phone, Globe, Mail, Briefcase, Camera } from 'lucide-react';

type Step = 'TEMPLATE' | 'DETAILS' | 'PREVIEW';

export const SignatureGeneratorTool: React.FC = () => {
  const [step, setStep] = useState<Step>('TEMPLATE');
  const [template, setTemplate] = useState('classic');
  const [copied, setCopied] = useState(false);
  
  const [data, setData] = useState({
    name: '',
    title: '',
    company: '',
    phone: '',
    email: '',
    website: '',
    image: '',
  });

  // --- Generation Logic (Ported from original HTML) ---

  const generateClassicSignature = (d: typeof data) => `
    <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; font-family: Arial, sans-serif; font-size: 12px; color: #222222;">
      <tbody>
        <tr>
          ${d.image ? `<td style="padding-right: 12px; vertical-align: top;"><img src="${d.image}" alt="Logo" width="80" style="max-width: 80px; border-radius: 4px; display: block;"></td>` : ''}
          <td style="border-left: 2px solid #7C3AED; padding-left: 12px; vertical-align: top;">
            <p style="margin: 0 0 4px 0;"><strong style="font-size: 14px; color: #141417; font-weight: bold;">${d.name || 'Your Name'}</strong></p>
            ${d.title ? `<p style="margin: 0 0 8px 0; color: #6B7280;">${d.title}</p>` : ''}
            ${d.company ? `<p style="margin: 0 0 2px 0; font-weight: bold; color: #4A5568;">${d.company}</p>` : ''}
            ${d.phone ? `<p style="margin: 0 0 2px 0;"><strong style="color: #7C3AED;">T:</strong> <a href="tel:${d.phone}" style="color: #6B7280; text-decoration: none;">${d.phone}</a></p>` : ''}
            ${d.email ? `<p style="margin: 0 0 2px 0;"><strong style="color: #7C3AED;">E:</strong> <a href="mailto:${d.email}" style="color: #6B7280; text-decoration: none;">${d.email}</a></p>` : ''}
            ${d.website ? `<p style="margin: 0;"><strong style="color: #7C3AED;">W:</strong> <a href="${d.website}" target="_blank" style="color: #6B7280; text-decoration: none;">${d.website}</a></p>` : ''}
          </td>
        </tr>
      </tbody>
    </table>`;
  
  const generateModernSignature = (d: typeof data) => `
    <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; font-family: Arial, sans-serif; font-size: 12px; color: #222222; min-width: 320px;">
      <tbody>
        <tr>
          ${d.image ? `<td style="padding-right: 15px; vertical-align: middle; width: 80px;"><img src="${d.image}" alt="Logo" width="80" height="80" style="width: 80px; height: 80px; border-radius: 50%; display: block;"></td>` : ''}
          <td style="vertical-align: middle;">
            <p style="margin: 0 0 2px 0;"><strong style="font-size: 16px; color: #141417; font-weight: bold;">${d.name || 'Your Name'}</strong></p>
            ${d.title ? `<p style="margin: 0 0 10px 0; color: #7C3AED; font-weight: 500;">${d.title}</p>` : ''}
            <div style="border-top: 1px solid #E9EAF0; padding-top: 8px;">
              ${d.company ? `<p style="margin: 0 0 2px 0; font-weight: bold; color: #4A5568;">${d.company}</p>` : ''}
              ${d.phone ? `<p style="margin: 0 0 2px 0;"><strong style="color: #6B7280;">Tel:</strong> <a href="tel:${d.phone}" style="color: #6B7280; text-decoration: none;">${d.phone}</a></p>` : ''}
              ${d.email ? `<p style="margin: 0 0 2px 0;"><strong style="color: #6B7280;">Mail:</strong> <a href="mailto:${d.email}" style="color: #6B7280; text-decoration: none;">${d.email}</a></p>` : ''}
              ${d.website ? `<p style="margin: 0;"><strong style="color: #6B7280;">Web:</strong> <a href="${d.website}" target="_blank" style="color: #6B7280; text-decoration: none;">${d.website}</a></p>` : ''}
            </div>
          </td>
        </tr>
      </tbody>
    </table>`;

  const generateMinimalistSignature = (d: typeof data) => `
    <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; font-family: Arial, sans-serif; font-size: 12px; color: #222222;">
      <tbody>
          <tr><td style="padding-bottom: 5px;"><strong style="font-size: 14px; color: #141417; font-weight: bold;">${d.name || 'Your Name'}</strong></td></tr>
          ${d.title ? `<tr><td style="padding-bottom: 10px; color: #6B7280;">${d.title}</td></tr>` : ''}
          <tr><td style="border-top: 1px solid #E9EAF0; padding-top: 10px;">
              ${d.company ? `<p style="margin: 0 0 4px 0; font-weight: bold; color: #4A5568;">${d.company}</p>` : ''}
              <p style="margin: 0;">
                ${d.phone ? `<a href="tel:${d.phone}" style="color: #6B7280; text-decoration: none;">${d.phone}</a>` : ''}
                ${d.phone && d.email ? `<span style="color: #E0E0E0;">&nbsp;&nbsp;|&nbsp;&nbsp;</span>` : ''}
                ${d.email ? `<a href="mailto:${d.email}" style="color: #6B7280; text-decoration: none;">${d.email}</a>` : ''}
              </p>
              ${d.website ? `<p style="margin: 4px 0 0 0;"><a href="${d.website}" target="_blank" style="color: #7C3AED; text-decoration: none; font-weight: bold;">${d.website.replace(/^(https?:\/\/)?(www\.)?/, '')}</a></p>` : ''}
          </td></tr>
          ${d.image ? `<tr><td style="padding-top: 12px;"><img src="${d.image}" alt="Logo" width="100" style="max-width: 100px; display: block;"></td></tr>` : ''}
      </tbody>
    </table>`;

  const getSignatureHTML = () => {
    switch(template) {
        case 'modern': return generateModernSignature(data);
        case 'minimalist': return generateMinimalistSignature(data);
        default: return generateClassicSignature(data);
    }
  };

  const handleCopy = async () => {
    try {
        const html = getSignatureHTML();
        const blob = new Blob([html], { type: 'text/html' });
        const item = new ClipboardItem({ 'text/html': blob });
        await navigator.clipboard.write([item]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    } catch (e) {
        console.error("Copy failed", e);
        // Fallback for some browsers or insecure context if needed, but ClipboardItem requires secure context.
    }
  };

  const updateField = (field: keyof typeof data, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="w-full h-full flex flex-col p-3 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3 text-fuchsia-400 shrink-0">
            <PenTool size={18} />
            <div className="flex flex-col leading-none">
                <h2 className="text-xs font-bold uppercase tracking-wider">Signature Email</h2>
                <span className="text-[9px] text-zinc-500 font-medium">Assistant</span>
            </div>
            
            {/* Steps Indicator */}
            <div className="ml-auto flex gap-1">
                {['TEMPLATE', 'DETAILS', 'PREVIEW'].map((s, i) => (
                    <div key={s} className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        (step === s) ? 'bg-fuchsia-500' : 
                        (i < ['TEMPLATE', 'DETAILS', 'PREVIEW'].indexOf(step)) ? 'bg-fuchsia-500/30' : 'bg-zinc-800'
                    }`} />
                ))}
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar flex flex-col">
            
            {/* STEP 1: TEMPLATE */}
            {step === 'TEMPLATE' && (
                <div className="flex flex-col gap-2 animate-fade-in">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Choisir Style</span>
                    
                    {[
                        { id: 'classic', label: 'Classique', desc: 'Professionnel & Sobre' },
                        { id: 'modern', label: 'Moderne', desc: 'Audacieux avec Avatar' },
                        { id: 'minimalist', label: 'Minimaliste', desc: 'Simple & Élégant' },
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTemplate(t.id)}
                            className={`
                                flex items-center justify-between p-3 rounded-xl border text-left transition-all
                                ${template === t.id 
                                    ? 'bg-fuchsia-500/10 border-fuchsia-500/50' 
                                    : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700'}
                            `}
                        >
                            <div>
                                <div className={`text-sm font-bold ${template === t.id ? 'text-fuchsia-400' : 'text-zinc-200'}`}>{t.label}</div>
                                <div className="text-[10px] text-zinc-500">{t.desc}</div>
                            </div>
                            {template === t.id && <Check size={16} className="text-fuchsia-500" />}
                        </button>
                    ))}
                </div>
            )}

            {/* STEP 2: DETAILS */}
            {step === 'DETAILS' && (
                <div className="flex flex-col gap-3 animate-fade-in pb-1">
                    <div className="space-y-2">
                        <label className="text-[10px] text-zinc-500 font-bold uppercase flex items-center gap-1"><User size={10}/> Personnel</label>
                        <input className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-xs text-white focus:border-fuchsia-500 outline-none" placeholder="Nom Complet" value={data.name} onChange={e => updateField('name', e.target.value)} />
                        <input className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-xs text-white focus:border-fuchsia-500 outline-none" placeholder="Poste" value={data.title} onChange={e => updateField('title', e.target.value)} />
                        <input className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-xs text-white focus:border-fuchsia-500 outline-none" placeholder="Entreprise" value={data.company} onChange={e => updateField('company', e.target.value)} />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] text-zinc-500 font-bold uppercase flex items-center gap-1"><Layout size={10}/> Contact</label>
                        <div className="flex items-center bg-zinc-900 border border-zinc-700 rounded focus-within:border-fuchsia-500">
                             <div className="pl-2 text-zinc-500"><Mail size={12}/></div>
                             <input className="w-full bg-transparent p-2 text-xs text-white outline-none" placeholder="Email" value={data.email} onChange={e => updateField('email', e.target.value)} />
                        </div>
                        <div className="flex items-center bg-zinc-900 border border-zinc-700 rounded focus-within:border-fuchsia-500">
                             <div className="pl-2 text-zinc-500"><Phone size={12}/></div>
                             <input className="w-full bg-transparent p-2 text-xs text-white outline-none" placeholder="Téléphone" value={data.phone} onChange={e => updateField('phone', e.target.value)} />
                        </div>
                        <div className="flex items-center bg-zinc-900 border border-zinc-700 rounded focus-within:border-fuchsia-500">
                             <div className="pl-2 text-zinc-500"><Globe size={12}/></div>
                             <input className="w-full bg-transparent p-2 text-xs text-white outline-none" placeholder="Site Web URL" value={data.website} onChange={e => updateField('website', e.target.value)} />
                        </div>
                    </div>

                    <div className="space-y-2">
                         <label className="text-[10px] text-zinc-500 font-bold uppercase flex items-center gap-1"><Camera size={10}/> Avatar / Logo</label>
                         <input className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-xs text-white focus:border-fuchsia-500 outline-none" placeholder="https://example.com/logo.png" value={data.image} onChange={e => updateField('image', e.target.value)} />
                         <p className="text-[8px] text-zinc-600 italic">Doit être une URL publique directe.</p>
                    </div>
                </div>
            )}

            {/* STEP 3: PREVIEW */}
            {step === 'PREVIEW' && (
                <div className="flex-1 flex flex-col gap-2 animate-fade-in h-full min-h-0">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase">Aperçu en direct</span>
                    
                    <div className="flex-1 bg-white rounded-lg p-4 overflow-auto shadow-inner min-h-[150px] flex items-center justify-center">
                        <div dangerouslySetInnerHTML={{ __html: getSignatureHTML() }} />
                    </div>

                    <button 
                        onClick={handleCopy}
                        className="w-full h-9 bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-fuchsia-900/20 active:scale-95 shrink-0"
                    >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? 'Copié !' : 'Copier Signature'}
                    </button>
                    <p className="text-[9px] text-zinc-500 text-center">Collez directement dans les paramètres Gmail/Outlook.</p>
                </div>
            )}

        </div>

        {/* Navigation Footer */}
        <div className="flex justify-between mt-3 pt-3 border-t border-white/5 shrink-0">
             {step !== 'TEMPLATE' ? (
                 <button onClick={() => {
                     if(step === 'PREVIEW') setStep('DETAILS');
                     if(step === 'DETAILS') setStep('TEMPLATE');
                 }} className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold flex items-center gap-1 transition-colors">
                    <ChevronLeft size={14} /> Retour
                 </button>
             ) : <div/>}

             {step !== 'PREVIEW' && (
                 <button onClick={() => {
                     if(step === 'TEMPLATE') setStep('DETAILS');
                     if(step === 'DETAILS') setStep('PREVIEW');
                 }} className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-black text-xs font-bold flex items-center gap-1 transition-colors">
                    Suivant <ChevronRight size={14} />
                 </button>
             )}
        </div>
    </div>
  );
};