import React, { useEffect, useState } from 'react';
import { Coins, ArrowRightLeft, RefreshCw, Loader2 } from 'lucide-react';

const API_URL = 'https://open.er-api.com/v6/latest/USD';

// Map currency code to country code for flags
const currencyToCountryMap: Record<string, string> = {
  USD: 'us', EUR: 'eu', JPY: 'jp', GBP: 'gb', AUD: 'au', CAD: 'ca', CHF: 'ch', CNY: 'cn', SEK: 'se', NZD: 'nz',
  MXN: 'mx', SGD: 'sg', HKD: 'hk', NOK: 'no', KRW: 'kr', TRY: 'tr', RUB: 'ru', INR: 'in', BRL: 'br', ZAR: 'za',
  AED: 'ae', AFN: 'af', ALL: 'al', AMD: 'am', ANG: 'sx', AOA: 'ao', ARS: 'ar', AWG: 'aw', AZN: 'az', BAM: 'ba',
  BBD: 'bb', BDT: 'bd', BGN: 'bg', BHD: 'bh', BIF: 'bi', BMD: 'bm', BND: 'bn', BOB: 'bo', BSD: 'bs', BTN: 'bt',
  BWP: 'bw', BYN: 'by', BZD: 'bz', CDF: 'cd', CLP: 'cl', COP: 'co', CRC: 'cr', CUP: 'cu', CVE: 'cv', CZK: 'cz',
  DJF: 'dj', DKK: 'dk', DOP: 'do', DZD: 'dz', EGP: 'eg', ERN: 'er', ETB: 'et', FJD: 'fj', FKP: 'fk', FOK: 'fo',
  GEL: 'ge', GGP: 'gg', GHS: 'gh', GIP: 'gi', GMD: 'gm', GNF: 'gn', GTQ: 'gt', GYD: 'gy', HNL: 'hn', HTG: 'ht',
  HUF: 'hu', IDR: 'id', ILS: 'il', IMP: 'im', IQD: 'iq', IRR: 'ir', ISK: 'is', JEP: 'je', JMD: 'jm', JOD: 'jo',
  KES: 'ke', KGS: 'kg', KHR: 'kh', KID: 'ki', KMF: 'km', KWD: 'kw', KYD: 'ky', KZT: 'kz', LAK: 'la', LBP: 'lb',
  LKR: 'lk', LRD: 'lr', LSL: 'ls', LYD: 'ly', MAD: 'ma', MDL: 'md', MGA: 'mg', MKD: 'mk', MMK: 'mm', MNT: 'mn',
  MOP: 'mo', MRU: 'mr', MUR: 'mu', MVR: 'mv', MWK: 'mw', MYR: 'my', MZN: 'mz', NAD: 'na', NGN: 'ng', NIO: 'ni',
  NPR: 'np', OMR: 'om', PAB: 'pa', PEN: 'pe', PGK: 'pg', PHP: 'ph', PKR: 'pk', PLN: 'pl', PYG: 'py', QAR: 'qa',
  RON: 'ro', RSD: 'rs', RWF: 'rw', SAR: 'sa', SBD: 'sb', SCR: 'sc', SDG: 'sd', SHP: 'sh', SLE: 'sl', SLL: 'sl',
  SOS: 'so', SRD: 'sr', SSP: 'ss', STN: 'st', SYP: 'sy', SZL: 'sz', THB: 'th', TJS: 'tj', TMT: 'tm', TND: 'tn',
  TOP: 'to', TTD: 'tt', TVD: 'tv', TWD: 'tw', TZS: 'tz', UAH: 'ua', UGX: 'ug', UYU: 'uy', UZS: 'uz', VES: 've',
  VND: 'vn', VUV: 'vu', WST: 'ws', XAF: 'cm', XCD: 'ag', XDR: 'un', XOF: 'sn', XPF: 'pf', YER: 'ye', ZMW: 'zm', ZWL: 'zw',
};

const getFlagUrl = (code: string) => {
  const country = currencyToCountryMap[code] || 'xx';
  return `https://flagcdn.com/w40/${country.toLowerCase()}.png`;
};

export const CurrencyConverterTool: React.FC = () => {
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('EUR');
  const [amount, setAmount] = useState<number>(1);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      if (data.result === 'success') {
        setRates(data.rates);
      } else {
        setError(true);
      }
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  // Calculations
  const rateFrom = rates[from] || 1;
  const rateTo = rates[to] || 1;
  const convertedAmount = ((amount * rateTo) / rateFrom).toFixed(2);
  const singleRate = (rateTo / rateFrom).toFixed(4);

  const currencies = Object.keys(rates).sort();

  if (loading && Object.keys(rates).length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-emerald-500 gap-2">
        <Loader2 className="animate-spin" size={24} />
        <span className="text-xs font-medium">Chargement taux...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-3 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-emerald-400">
          <Coins size={18} />
          <h2 className="text-xs font-bold uppercase tracking-wider">Convertisseur</h2>
        </div>
        <button onClick={fetchRates} className="text-zinc-500 hover:text-white transition-colors" title="Actualiser">
          <RefreshCw size={14} />
        </button>
      </div>

      <div className="flex-1 min-h-0 flex flex-col justify-center gap-2">
        
        {/* FROM ROW */}
        <div className="flex gap-2 items-center bg-zinc-800/50 p-1.5 rounded-lg border border-zinc-700/50">
           <div className="flex-1">
             <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-transparent text-white font-bold text-lg outline-none min-w-0"
             />
           </div>
           <div className="relative w-20 shrink-0">
              <select 
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full appearance-none bg-zinc-900 border border-zinc-700 text-white text-xs font-bold py-1.5 pl-8 pr-2 rounded-md focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
              >
                {currencies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <img 
                src={getFlagUrl(from)} 
                className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-3 object-cover rounded-[2px]" 
                alt="flag"
              />
           </div>
        </div>

        {/* SWAP & RATE */}
        <div className="flex items-center justify-between px-1">
            <span className="text-[10px] text-zinc-500 font-medium">
               1 {from} = {singleRate} {to}
            </span>
            <button 
                onClick={handleSwap}
                className="w-6 h-6 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center transition-colors border border-emerald-500/20"
            >
                <ArrowRightLeft size={12} />
            </button>
        </div>

        {/* TO ROW */}
        <div className="flex gap-2 items-center bg-zinc-800/50 p-1.5 rounded-lg border border-zinc-700/50">
           <div className="flex-1 truncate text-zinc-300 font-bold text-lg">
             {convertedAmount}
           </div>
           <div className="relative w-20 shrink-0">
              <select 
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full appearance-none bg-zinc-900 border border-zinc-700 text-white text-xs font-bold py-1.5 pl-8 pr-2 rounded-md focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
              >
                {currencies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <img 
                src={getFlagUrl(to)} 
                className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-3 object-cover rounded-[2px]" 
                alt="flag"
              />
           </div>
        </div>

      </div>

      {error && (
          <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-red-400">
              Erreur mise à jour taux
          </div>
      )}
    </div>
  );
};