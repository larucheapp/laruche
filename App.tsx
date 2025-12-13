import React, { useState, useMemo } from 'react';
import { INITIAL_CARDS } from './constants';
import { BentoGrid } from './components/BentoGrid';
import { CardType } from './types';
import { Briefcase, Building2, LayoutGrid } from 'lucide-react';

const HexagonBackground = () => {
  const svgPattern = `<svg id="pattern-hex" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="hexagons" patternUnits="userSpaceOnUse" width="70" height="121.24" patternTransform="scale(1.2) rotate(0)"><svg width="70" height="121.24" y="0"><path d="M35 0L70 20.21v40.42L35 80.84 0 60.63V20.21z" stroke="rgba(109, 40, 217, 0.07)" fill="none" stroke-width="1.5"></path></svg></pattern></defs><rect width="100%" height="100%" fill="url(#hexagons)"></rect></svg>`;
  const dataUrl = `url("data:image/svg+xml,${encodeURIComponent(svgPattern)}")`;

  return (
      <div
          className="absolute inset-0 z-0 opacity-50"
          style={{ backgroundImage: dataUrl }}
      ></div>
  );
};

// Define tool subsets
const FREELANCE_TOOLS = [
  CardType.REMOVE_BG,
  CardType.IMAGE_COMPRESSOR,
  CardType.QR_GENERATOR,
  CardType.INVOICE_GENERATOR,
  CardType.HOURLY_RATE_CALCULATOR,
  CardType.SIGNATURE_GENERATOR,
  CardType.PASSWORD_GENERATOR,
  CardType.REVISION_SHEET,
  CardType.CALCULATOR,
  CardType.PDF_SIGNATURE
];

const ENTERPRISE_TOOLS = [
  CardType.CALCULATOR,
  CardType.INVOICE_GENERATOR,
  CardType.CURRENCY_CONVERTER,
  CardType.LOAN_CALCULATOR,
  CardType.EXPENSE_TRACKER,
  CardType.PDF_SIGNATURE,
  CardType.WIKI_ASSISTANT,
  CardType.WATERMARK
];

const App: React.FC = () => {
  const [filterMode, setFilterMode] = useState<'ALL' | 'FREELANCE' | 'ENTERPRISE'>('ALL');

  // Filter logic
  const filteredCards = useMemo(() => {
    if (filterMode === 'ALL') return INITIAL_CARDS;
    
    const targetTypes = filterMode === 'FREELANCE' ? FREELANCE_TOOLS : ENTERPRISE_TOOLS;
    return INITIAL_CARDS.filter(card => targetTypes.includes(card.type));
  }, [filterMode]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 relative selection:bg-violet-200 selection:text-violet-900">
      
      {/* Dynamic Grid Background (Updated to Light Hexagon Theme) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-200/40 via-transparent to-transparent"></div>
          <HexagonBackground />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#09090b]/70 backdrop-blur-xl supports-[backdrop-filter]:bg-[#09090b]/30">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/bee.png" alt="Logo" className="w-8 h-8 object-contain" />
            <span className="font-bold text-lg tracking-wider text-white">La Ruche</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 pt-32 pb-32">
        
        {/* Hero Title Section */}
        <div className="text-center mb-16 px-4 relative">
            {/* Decorative Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] bg-violet-400/20 blur-[100px] rounded-full pointer-events-none -z-10" />

            {/* Title with Gradient */}
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-8 relative inline-block">
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-violet-600 via-indigo-600 to-zinc-800 drop-shadow-sm pb-4 block">
                La Ruche
              </span>
              {/* Little accent star/shape */}
              <svg className="absolute -top-6 -right-8 w-12 h-12 text-yellow-400 animate-pulse-slow hidden md:block" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
              </svg>
            </h1>
            
            {/* Subtitle Badge */}
            <div className="flex flex-col items-center gap-8">
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/80 border border-zinc-200/50 shadow-xl shadow-violet-900/5 backdrop-blur-md transition-transform hover:scale-105 duration-300 ring-1 ring-violet-100">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-600"></span>
                    </span>
                    <p className="text-sm md:text-base text-zinc-600 font-bold tracking-wide uppercase">
                      outils gratuit et sans limite
                    </p>
                </div>

                {/* Filter Buttons */}
                <div className="flex flex-wrap justify-center gap-3 animate-fade-in" style={{ animationDelay: '100ms' }}>
                    <button 
                        onClick={() => setFilterMode('ALL')}
                        className={`
                            px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all duration-300 border
                            ${filterMode === 'ALL' 
                                ? 'bg-zinc-900 border-zinc-900 text-white shadow-lg scale-105' 
                                : 'bg-white/50 border-zinc-200/60 text-zinc-500 hover:bg-white hover:text-zinc-800 hover:border-zinc-300'}
                        `}
                    >
                        <LayoutGrid size={16} />
                        Tous les outils
                    </button>
                    
                    <button 
                        onClick={() => setFilterMode('FREELANCE')}
                        className={`
                            px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all duration-300 border
                            ${filterMode === 'FREELANCE' 
                                ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-500/25 scale-105' 
                                : 'bg-white/50 border-zinc-200/60 text-zinc-500 hover:bg-white hover:text-violet-600 hover:border-violet-200'}
                        `}
                    >
                        <Briefcase size={16} />
                        Freelance
                    </button>

                    <button 
                        onClick={() => setFilterMode('ENTERPRISE')}
                        className={`
                            px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all duration-300 border
                            ${filterMode === 'ENTERPRISE' 
                                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/25 scale-105' 
                                : 'bg-white/50 border-zinc-200/60 text-zinc-500 hover:bg-white hover:text-indigo-600 hover:border-indigo-200'}
                        `}
                    >
                        <Building2 size={16} />
                        Entreprise
                    </button>
                </div>
            </div>
        </div>

        {/* The Bento Grid */}
        <BentoGrid cards={filteredCards} />

        {/* Footer */}
        <footer className="text-center text-zinc-500 text-sm pb-8 mt-16 border-t border-zinc-200/50 pt-8 max-w-[1600px] mx-auto px-6">
            
            {/* Tools Links */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mb-6 font-medium">
                <a href="tools/studioexpresse.html" className="hover:text-violet-600 transition-colors">Studio Express</a>
                <a href="tools/contrat.html" className="hover:text-violet-600 transition-colors">Contrat</a>
                <a href="tools/cv.html" className="hover:text-violet-600 transition-colors">CV</a>
                <a href="tools/planning.html" className="hover:text-violet-600 transition-colors">Planning</a>
                <a href="tools/mindmap.html" className="hover:text-violet-600 transition-colors">MindMap</a>
                <a href="tools/jeux.html" className="hover:text-violet-600 transition-colors">Jeux</a>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-8 text-xs opacity-80">
                <a href="propos.html" className="hover:text-zinc-800 transition-colors">À propos</a>
                <a href="confidentialite.html" className="hover:text-zinc-800 transition-colors">Confidentialité</a>
                <a href="charte.html" className="hover:text-zinc-800 transition-colors">Charte</a>
                <a href="github.html" className="hover:text-zinc-800 transition-colors">GitHub</a>
                <a href="mentionslegale.html" className="hover:text-zinc-800 transition-colors">Mentions Légales</a>
            </div>

          <p className="opacity-60 text-xs">© {new Date().getFullYear()} PurpleBee Systems. Tous droits réservés.</p>
        </footer>
      </main>
    </div>
  );
};

export default App;