import React, { useState, useEffect } from 'react';
import { Globe, Search, ChevronLeft, ArrowRight, Clock } from 'lucide-react';

interface TimeZone {
    iana: string;
    city: string;
    country: string;
    code: string;
}

const TIMEZONES: TimeZone[] = [
    { iana: "Europe/Paris", city: "Paris", country: "France", code: "fr" },
    { iana: "Europe/London", city: "Londres", country: "Royaume-Uni", code: "gb" },
    { iana: "America/New_York", city: "New York", country: "USA", code: "us" },
    { iana: "America/Los_Angeles", city: "Los Angeles", country: "USA", code: "us" },
    { iana: "Asia/Tokyo", city: "Tokyo", country: "Japon", code: "jp" },
    { iana: "Asia/Dubai", city: "Dubaï", country: "EAU", code: "ae" },
    { iana: "Asia/Shanghai", city: "Shanghai", country: "Chine", code: "cn" },
    { iana: "Asia/Kolkata", city: "New Delhi", country: "Inde", code: "in" },
    { iana: "Australia/Sydney", city: "Sydney", country: "Australie", code: "au" },
    { iana: "America/Sao_Paulo", city: "São Paulo", country: "Brésil", code: "br" },
    { iana: "America/Toronto", city: "Toronto", country: "Canada", code: "ca" },
    { iana: "Europe/Moscow", city: "Moscou", country: "Russie", code: "ru" },
    { iana: "Europe/Berlin", city: "Berlin", country: "Allemagne", code: "de" },
    { iana: "Europe/Rome", city: "Rome", country: "Italie", code: "it" },
    { iana: "Africa/Cairo", city: "Le Caire", country: "Égypte", code: "eg" },
    { iana: "Africa/Johannesburg", city: "Johannesbourg", country: "Afrique du Sud", code: "za" },
    { iana: "Asia/Seoul", city: "Séoul", country: "Corée du Sud", code: "kr" },
    { iana: "Asia/Bangkok", city: "Bangkok", country: "Thaïlande", code: "th" },
    { iana: "Pacific/Auckland", city: "Auckland", country: "Nouvelle-Zélande", code: "nz" },
    { iana: "Etc/UTC", city: "UTC", country: "Temps Universel", code: "gb" },
].sort((a, b) => a.city.localeCompare(b.city));

export const TimezoneConverterTool: React.FC = () => {
    // Current live time
    const [baseDate, setBaseDate] = useState(new Date());
    
    // Config
    const [leftTz, setLeftTz] = useState("Europe/Paris");
    const [rightTz, setRightTz] = useState("America/New_York");
    
    // UI
    const [selectingSide, setSelectingSide] = useState<'left' | 'right' | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Inputs (local strings to prevent jitter)
    const [leftInputDate, setLeftInputDate] = useState('');
    const [leftInputTime, setLeftInputTime] = useState('');
    const [rightInputDate, setRightInputDate] = useState('');
    const [rightInputTime, setRightInputTime] = useState('');

    // Timer to update seconds
    useEffect(() => {
        const timer = setInterval(() => {
            setBaseDate(prev => new Date(prev.getTime() + 1000));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Sync inputs with baseDate when baseDate updates (e.g. seconds tick)
    useEffect(() => {
       syncInputs(baseDate);
    }, [baseDate, leftTz, rightTz]);

    const syncInputs = (date: Date) => {
        const fmt = (tz: string) => {
            // Using en-CA for ISO format YYYY-MM-DD in local time
            try {
                const parts = new Intl.DateTimeFormat('en-CA', { 
                    timeZone: tz, 
                    year: 'numeric', month: '2-digit', day: '2-digit', 
                    hour: '2-digit', minute: '2-digit', hour12: false 
                }).formatToParts(date);
                
                const find = (type: string) => parts.find(p => p.type === type)?.value || '';
                return {
                    d: `${find('year')}-${find('month')}-${find('day')}`,
                    t: `${find('hour')}:${find('minute')}`
                };
            } catch (e) { return { d: '', t: '' }; }
        };

        const l = fmt(leftTz);
        const r = fmt(rightTz);
        
        setLeftInputDate(l.d);
        setLeftInputTime(l.t);
        setRightInputDate(r.d);
        setRightInputTime(r.t);
    };

    const handleInputChange = (side: 'left' | 'right', type: 'date' | 'time', value: string) => {
        const targetTz = side === 'left' ? leftTz : rightTz;
        let dStr = side === 'left' ? leftInputDate : rightInputDate;
        let tStr = side === 'left' ? leftInputTime : rightInputTime;

        if (type === 'date') dStr = value;
        if (type === 'time') tStr = value;

        if (!dStr || !tStr) return;

        try {
            const temp = new Date(`${dStr}T${tStr}:00`);
            const getOffset = (d: Date, tz: string) => {
                const iso = d.toLocaleString('en-US', { timeZone: tz, hour12: false });
                const lie = new Date(iso);
                return (lie.getTime() - d.getTime());
            };
            
            // Approximate reverse offset calculation
            const offset = getOffset(temp, targetTz);
            const utcTime = new Date(temp.getTime() - offset);
            
            setBaseDate(utcTime);
        } catch(e) {}
    };

    const formatDisplay = (tz: string) => {
        try {
            const d = new Intl.DateTimeFormat('fr-FR', {
                timeZone: tz,
                hour: '2-digit', minute: '2-digit', second: '2-digit',
                hour12: false
            }).format(baseDate);
            
            const sub = new Intl.DateTimeFormat('fr-FR', {
                timeZone: tz,
                weekday: 'short', day: 'numeric', month: 'short',
                timeZoneName: 'shortOffset'
            }).format(baseDate);
            
            return { main: d, sub };
        } catch { return { main: '--:--', sub: '' }; }
    };

    const getDiff = () => {
        const now = new Date();
        const getOff = (tz: string) => {
             const s = new Date(now.toLocaleString('en-US', { timeZone: tz }));
             return s.getTime();
        };
        const diffMs = getOff(rightTz) - getOff(leftTz);
        const diffHrs = diffMs / (1000 * 60 * 60);
        
        if (Math.abs(diffHrs) < 0.01) return "Même Heure";
        const sign = diffHrs > 0 ? "+" : "";
        return `${sign}${Math.round(diffHrs * 10) / 10}h`;
    };

    const leftInfo = TIMEZONES.find(t => t.iana === leftTz) || TIMEZONES[0];
    const rightInfo = TIMEZONES.find(t => t.iana === rightTz) || TIMEZONES[0];
    const diff = getDiff();

    // -- SELECTION VIEW --
    if (selectingSide) {
        const filtered = TIMEZONES.filter(t => 
            t.city.toLowerCase().includes(searchQuery.toLowerCase()) || 
            t.country.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return (
            <div className="w-full h-full flex flex-col p-3 bg-zinc-950 animate-fade-in relative z-20">
                <div className="flex items-center gap-2 mb-3">
                    <button onClick={() => setSelectingSide(null)} className="p-1 hover:bg-zinc-800 rounded-full text-zinc-400">
                        <ChevronLeft size={18} />
                    </button>
                    <div className="relative flex-1">
                        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input 
                            autoFocus
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Chercher ville..."
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 pl-8 pr-3 text-xs text-white focus:border-violet-500 outline-none"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar -mr-2 pr-2 flex flex-col gap-1">
                    {filtered.map(t => (
                        <button key={t.iana} 
                            onClick={() => {
                                if (selectingSide === 'left') setLeftTz(t.iana);
                                else setRightTz(t.iana);
                                setSelectingSide(null);
                                setSearchQuery('');
                            }}
                            className="flex items-center gap-3 p-2 hover:bg-zinc-900 rounded-lg transition-colors text-left group"
                        >
                             <img src={`https://flagcdn.com/w40/${t.code}.png`} className="w-6 h-4 object-cover rounded-[2px]" alt={t.code} />
                             <div>
                                <div className="text-sm font-bold text-zinc-200 group-hover:text-white">{t.city}</div>
                                <div className="text-[10px] text-zinc-500">{t.country}</div>
                             </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col p-3 relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2 text-violet-400 shrink-0">
                <Globe size={16} />
                <h2 className="text-[10px] font-bold uppercase tracking-wider">Fuseaux Horaires</h2>
            </div>

            <div className="flex-1 min-h-0 flex gap-2">
                {/* Left Panel */}
                <div className="flex-1 flex flex-col gap-2 bg-zinc-800/20 rounded-lg p-2 border border-zinc-700/30">
                    <button onClick={() => setSelectingSide('left')} className="flex items-center gap-2 hover:bg-zinc-800 p-1.5 rounded transition-colors w-full group">
                        <img src={`https://flagcdn.com/w40/${leftInfo.code}.png`} className="w-5 h-3.5 object-cover rounded-[2px] opacity-80 group-hover:opacity-100 transition-opacity" alt={leftInfo.code} />
                        <div className="text-left leading-none min-w-0 flex-1">
                            <div className="text-xs font-bold text-white truncate">{leftInfo.city}</div>
                            <div className="text-[9px] text-zinc-500 truncate">{leftInfo.country}</div>
                        </div>
                    </button>
                    
                    <div className="mt-auto mb-auto text-center">
                        <div className="text-2xl font-bold text-white tracking-tight">{formatDisplay(leftTz).main}</div>
                        <div className="text-[9px] text-zinc-500">{formatDisplay(leftTz).sub}</div>
                    </div>

                    <div className="flex gap-1">
                         <input type="date" value={leftInputDate} onChange={e => handleInputChange('left', 'date', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded p-1 text-[9px] text-zinc-300 focus:border-violet-500 outline-none" />
                         <input type="time" value={leftInputTime} onChange={e => handleInputChange('left', 'time', e.target.value)} className="w-12 bg-zinc-900 border border-zinc-700 rounded p-1 text-[9px] text-zinc-300 focus:border-violet-500 outline-none" />
                    </div>
                </div>

                {/* Middle Indicator */}
                <div className="flex flex-col items-center justify-center gap-1 text-zinc-500">
                    <ArrowRight size={14} />
                    <span className="text-[9px] font-bold bg-zinc-800 px-1 py-0.5 rounded text-violet-400">{diff}</span>
                </div>

                {/* Right Panel */}
                <div className="flex-1 flex flex-col gap-2 bg-zinc-800/20 rounded-lg p-2 border border-zinc-700/30">
                    <button onClick={() => setSelectingSide('right')} className="flex items-center gap-2 hover:bg-zinc-800 p-1.5 rounded transition-colors w-full group">
                        <img src={`https://flagcdn.com/w40/${rightInfo.code}.png`} className="w-5 h-3.5 object-cover rounded-[2px] opacity-80 group-hover:opacity-100 transition-opacity" alt={rightInfo.code} />
                        <div className="text-left leading-none min-w-0 flex-1">
                            <div className="text-xs font-bold text-white truncate">{rightInfo.city}</div>
                            <div className="text-[9px] text-zinc-500 truncate">{rightInfo.country}</div>
                        </div>
                    </button>
                    
                    <div className="mt-auto mb-auto text-center">
                        <div className="text-2xl font-bold text-white tracking-tight">{formatDisplay(rightTz).main}</div>
                        <div className="text-[9px] text-zinc-500">{formatDisplay(rightTz).sub}</div>
                    </div>

                    <div className="flex gap-1">
                         <input type="date" value={rightInputDate} onChange={e => handleInputChange('right', 'date', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded p-1 text-[9px] text-zinc-300 focus:border-violet-500 outline-none" />
                         <input type="time" value={rightInputTime} onChange={e => handleInputChange('right', 'time', e.target.value)} className="w-12 bg-zinc-900 border border-zinc-700 rounded p-1 text-[9px] text-zinc-300 focus:border-violet-500 outline-none" />
                    </div>
                </div>
            </div>
        </div>
    );
};