import React, { useState, useEffect } from 'react';
import { Bitcoin, ArrowUpDown, RefreshCw, Loader2, ChevronRight, Search, ChevronLeft } from 'lucide-react';

// --- Configuration ---

const CACHE_KEY = 'purplebee_crypto_rates_v2'; // Bump version to force refresh with new coins
const CACHE_DURATION = 10 * 60 * 1000; // 10 Minutes

interface CurrencyInfo {
  name: string;
  symbol?: string; // for crypto
  country?: string; // for fiat flags
  isCrypto: boolean;
}

const FIAT_CURRENCIES: Record<string, CurrencyInfo> = {
  EUR: { name: 'Euro', country: 'eu', isCrypto: false },
  USD: { name: 'Dollar US', country: 'us', isCrypto: false },
  GBP: { name: 'Livre Sterling', country: 'gb', isCrypto: false },
  JPY: { name: 'Yen Japonais', country: 'jp', isCrypto: false },
  CAD: { name: 'Dollar Canadien', country: 'ca', isCrypto: false },
  CHF: { name: 'Franc Suisse', country: 'ch', isCrypto: false },
};

// Expanded Crypto List
const CRYPTOS: Record<string, CurrencyInfo> = {
  bitcoin: { symbol: 'BTC', name: 'Bitcoin', isCrypto: true },
  ethereum: { symbol: 'ETH', name: 'Ethereum', isCrypto: true },
  tether: { symbol: 'USDT', name: 'Tether', isCrypto: true },
  binancecoin: { symbol: 'BNB', name: 'BNB', isCrypto: true },
  solana: { symbol: 'SOL', name: 'Solana', isCrypto: true },
  ripple: { symbol: 'XRP', name: 'XRP', isCrypto: true },
  'usd-coin': { symbol: 'USDC', name: 'USD Coin', isCrypto: true },
  cardano: { symbol: 'ADA', name: 'Cardano', isCrypto: true },
  'avalanche-2': { symbol: 'AVAX', name: 'Avalanche', isCrypto: true },
  dogecoin: { symbol: 'DOGE', name: 'Dogecoin', isCrypto: true },
  polkadot: { symbol: 'DOT', name: 'Polkadot', isCrypto: true },
  'matic-network': { symbol: 'MATIC', name: 'Polygon', isCrypto: true },
  chainlink: { symbol: 'LINK', name: 'Chainlink', isCrypto: true },
  'shiba-inu': { symbol: 'SHIB', name: 'Shiba Inu', isCrypto: true },
  litecoin: { symbol: 'LTC', name: 'Litecoin', isCrypto: true },
  uniswap: { symbol: 'UNI', name: 'Uniswap', isCrypto: true },
  'bitcoin-cash': { symbol: 'BCH', name: 'Bitcoin Cash', isCrypto: true },
  stellar: { symbol: 'XLM', name: 'Stellar', isCrypto: true },
  monero: { symbol: 'XMR', name: 'Monero', isCrypto: true },
  'ethereum-classic': { symbol: 'ETC', name: 'Ethereum Classic', isCrypto: true },
  'near': { symbol: 'NEAR', name: 'NEAR Protocol', isCrypto: true },
  'aptos': { symbol: 'APT', name: 'Aptos', isCrypto: true },
  'vechain': { symbol: 'VET', name: 'VeChain', isCrypto: true },
  'dai': { symbol: 'DAI', name: 'Dai', isCrypto: true },
  'pepe': { symbol: 'PEPE', name: 'Pepe', isCrypto: true },
  'render-token': { symbol: 'RNDR', name: 'Render', isCrypto: true },
  'cosmos': { symbol: 'ATOM', name: 'Cosmos', isCrypto: true },
  'arbitrum': { symbol: 'ARB', name: 'Arbitrum', isCrypto: true },
};

// Combine for selection list
const ALL_CURRENCIES = { ...FIAT_CURRENCIES, ...CRYPTOS };

interface CurrencyState {
  id: string;
  amount: string; 
}

// --- API ---

const fetchRates = async () => {
  const cryptoIds = Object.keys(CRYPTOS).join(',');
  const fiatIds = Object.keys(FIAT_CURRENCIES).map(c => c.toLowerCase()).join(',');
  
  const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cryptoIds}&vs_currencies=${fiatIds}`);
  if (!response.ok) throw new Error('Network error');
  return response.json();
};

// --- Sub-Components (Defined OUTSIDE to fix focus bug) ---

const CurrencyRow = ({ 
  side, 
  state,
  onSelect,
  onChange
}: { 
  side: 'top' | 'bottom', 
  state: CurrencyState,
  onSelect: (side: 'top' | 'bottom') => void,
  onChange: (val: string, side: 'top' | 'bottom') => void
}) => {
    const info = ALL_CURRENCIES[state.id] || { name: 'Unknown', symbol: '?', isCrypto: true };
    const isFiat = !!FIAT_CURRENCIES[state.id];

    return (
      <div className="flex flex-col gap-1">
           <div className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-700/50 rounded-xl p-3 focus-within:border-amber-500/50 transition-colors">
               {/* Selector Button */}
               <button 
                  onClick={() => onSelect(side)}
                  className="flex items-center gap-2 pr-3 border-r border-white/10 hover:bg-white/5 rounded p-1 -ml-1 transition-colors min-w-[100px]"
               >
                  {isFiat ? (
                       <img src={`https://flagcdn.com/w40/${info.country}.png`} className="w-5 h-3.5 object-cover rounded-[2px]" alt={state.id} />
                  ) : (
                       <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center text-[10px] font-bold">
                           {info.symbol?.[0]}
                       </div>
                  )}
                  <div className="flex flex-col items-start leading-none">
                       <span className="text-sm font-bold text-white">{isFiat ? state.id : info.symbol}</span>
                  </div>
                  <ChevronRight size={14} className="text-zinc-500 ml-auto" />
               </button>

               {/* Input */}
               <input 
                  type="number"
                  value={state.amount}
                  onChange={(e) => onChange(e.target.value, side)}
                  placeholder="0.00"
                  className="w-full bg-transparent text-right text-xl font-bold text-white outline-none placeholder:text-zinc-700 min-w-0"
               />
           </div>
      </div>
    );
};

export const CryptoConverterTool: React.FC = () => {
  const [rates, setRates] = useState<Record<string, Record<string, number>>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number>(0);

  const [top, setTop] = useState<CurrencyState>({ id: 'EUR', amount: '1000' });
  const [bottom, setBottom] = useState<CurrencyState>({ id: 'bitcoin', amount: '0' });
  
  // UI State
  const [selectingSide, setSelectingSide] = useState<'top' | 'bottom' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // --- Logic ---

  useEffect(() => {
    // Try load from cache first
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
        try {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_DURATION) {
                setRates(data);
                setLastUpdated(timestamp);
                setIsLoading(false);
                return; // Skip fetch if cache is valid
            }
        } catch (e) {
            console.error("Cache parse error", e);
        }
    }

    loadRates();
    
    // Auto refresh every 10 mins
    const interval = setInterval(loadRates, CACHE_DURATION);
    return () => clearInterval(interval);
  }, []);

  // Recalculate when rates load (initial calculation)
  useEffect(() => {
      if (!isLoading && !error && Object.keys(rates).length > 0 && bottom.amount === '0') {
        convert(top.amount, 'top', top.id, bottom.id);
      }
  }, [rates, isLoading]);

  const loadRates = async () => {
    try {
      setIsLoading(true);
      setError(false);
      const data = await fetchRates();
      
      setRates(data);
      setLastUpdated(Date.now());
      
      // Save to cache
      localStorage.setItem(CACHE_KEY, JSON.stringify({
          data,
          timestamp: Date.now()
      }));
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getRate = (fromId: string, toId: string): number => {
    // CoinGecko structure: rates[crypto_id][fiat_id]
    const fromIsCrypto = !!CRYPTOS[fromId];
    const toIsCrypto = !!CRYPTOS[toId];

    if (fromIsCrypto && !toIsCrypto) {
        return rates[fromId]?.[toId.toLowerCase()] || 0;
    }
    if (!fromIsCrypto && toIsCrypto) {
        const r = rates[toId]?.[fromId.toLowerCase()];
        return r ? 1 / r : 0;
    }
    
    // Cross rates (Crypto -> Crypto) via USD fallback if possible, or 0 if not supported by simple view
    if (fromIsCrypto && toIsCrypto) {
         const fromUsd = rates[fromId]?.['usd'];
         const toUsd = rates[toId]?.['usd'];
         if (fromUsd && toUsd) return fromUsd / toUsd;
    }
    
    return 0; 
  };

  const formatNumber = (num: number, isCrypto: boolean) => {
      if (num === 0) return '';
      if (isCrypto) {
          // Max 8 decimals, remove trailing zeros
          return parseFloat(num.toFixed(8)).toString();
      }
      // Max 2 decimals for fiat
      return parseFloat(num.toFixed(2)).toString();
  };

  const convert = (value: string, source: 'top' | 'bottom', topId: string, bottomId: string) => {
    const valNum = parseFloat(value);
    if (isNaN(valNum)) {
        if (source === 'top') setBottom(prev => ({ ...prev, amount: '' }));
        else setTop(prev => ({ ...prev, amount: '' }));
        return;
    }

    const rate = getRate(topId, bottomId);
    
    if (rate === 0) {
        return;
    }

    if (source === 'top') {
        const result = valNum * rate;
        const isBotCrypto = !!CRYPTOS[bottomId];
        setBottom(prev => ({ ...prev, amount: formatNumber(result, isBotCrypto) }));
    } else {
        // Bottom changed, calculate Top (Value / Rate)
        const result = valNum / rate;
        const isTopCrypto = !!CRYPTOS[topId];
        setTop(prev => ({ ...prev, amount: formatNumber(result, isTopCrypto) }));
    }
  };

  const handleInputChange = (val: string, side: 'top' | 'bottom') => {
      if (side === 'top') {
          setTop(prev => ({ ...prev, amount: val }));
          convert(val, 'top', top.id, bottom.id);
      } else {
          setBottom(prev => ({ ...prev, amount: val }));
          convert(val, 'bottom', top.id, bottom.id);
      }
  };

  const handleSelection = (id: string) => {
      if (selectingSide === 'top') {
          setTop(prev => ({ ...prev, id }));
          convert(top.amount, 'top', id, bottom.id);
      } else {
          setBottom(prev => ({ ...prev, id }));
          convert(top.amount, 'top', top.id, id);
      }
      setSelectingSide(null);
      setSearchQuery('');
  };

  const handleSwap = () => {
      setTop(bottom);
      setBottom(top);
  };

  // --- Main Render ---

  // 1. Selection Overlay View
  if (selectingSide) {
      const filtered = Object.entries(ALL_CURRENCIES).filter(([key, info]) => 
          info.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          key.toLowerCase().includes(searchQuery.toLowerCase()) ||
          info.symbol?.toLowerCase().includes(searchQuery.toLowerCase())
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
                        placeholder="Rechercher devise..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 pl-8 pr-3 text-xs text-white focus:border-amber-500 outline-none"
                      />
                  </div>
              </div>
              
              <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar -mr-2 pr-2">
                  <div className="flex flex-col gap-1">
                      {filtered.map(([key, info]) => (
                          <button
                            key={key}
                            onClick={() => handleSelection(key)}
                            className="flex items-center gap-3 p-2 hover:bg-zinc-900 rounded-lg transition-colors text-left group"
                          >
                                {FIAT_CURRENCIES[key] ? (
                                    <img src={`https://flagcdn.com/w40/${info.country}.png`} className="w-6 h-4 object-cover rounded-[2px]" alt={key} />
                                ) : (
                                    <div className="w-6 h-6 rounded-full bg-zinc-800 text-amber-500 flex items-center justify-center text-[10px] font-bold group-hover:bg-amber-500 group-hover:text-black transition-colors">
                                        {info.symbol?.[0]}
                                    </div>
                                )}
                                <div>
                                    <div className="text-sm font-bold text-zinc-200 group-hover:text-white">{info.name}</div>
                                    <div className="text-[10px] text-zinc-500 font-mono">{FIAT_CURRENCIES[key] ? key : info.symbol}</div>
                                </div>
                          </button>
                      ))}
                      {filtered.length === 0 && (
                          <div className="text-center py-4 text-zinc-500 text-xs">Aucun résultat</div>
                      )}
                  </div>
              </div>
          </div>
      );
  }

  // 2. Main Converter View
  return (
    <div className="w-full h-full flex flex-col p-3 relative">
       {/* Header */}
       <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-2 text-amber-400">
          <Bitcoin size={18} />
          <h2 className="text-xs font-bold uppercase tracking-wider">Calculatrice Crypto</h2>
        </div>
        <button 
            onClick={loadRates} 
            disabled={isLoading}
            className={`text-zinc-500 hover:text-white transition-colors ${isLoading ? 'animate-spin' : ''}`}
            title="Actualiser Taux"
        >
          {isLoading ? <Loader2 size={14} /> : <RefreshCw size={14} />}
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-1 min-h-0 relative">
          <CurrencyRow 
            side="top" 
            state={top} 
            onSelect={setSelectingSide}
            onChange={handleInputChange}
          />
          
          <div className="relative h-4 flex items-center justify-center my-1 z-10">
             <button 
                onClick={handleSwap}
                className="w-8 h-8 rounded-full bg-zinc-800 border-4 border-black hover:border-black hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-all active:scale-90"
             >
                 <ArrowUpDown size={14} />
             </button>
          </div>

          <CurrencyRow 
            side="bottom" 
            state={bottom} 
            onSelect={setSelectingSide}
            onChange={handleInputChange}
          />
      </div>

      <div className="mt-3 text-center flex flex-col gap-1">
          {error ? (
              <span className="text-[10px] text-red-400">Échec mise à jour. Données en cache utilisées.</span>
          ) : (
              <div className="flex items-center justify-center gap-2">
                  <span className="text-[9px] text-zinc-600 font-medium">
                      1 {ALL_CURRENCIES[top.id]?.symbol || top.id} ≈ {formatNumber(getRate(top.id, bottom.id), !!CRYPTOS[bottom.id])} {ALL_CURRENCIES[bottom.id]?.symbol || bottom.id}
                  </span>
                  {isLoading && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"/>}
              </div>
          )}
          {lastUpdated > 0 && (
             <span className="text-[8px] text-zinc-700">
                MAJ: {new Date(lastUpdated).toLocaleTimeString()} (10m auto)
             </span>
          )}
      </div>
    </div>
  );
};