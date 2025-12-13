import React, { useState, useRef } from 'react';
import { Users, UserPlus, Eye, EyeOff, Skull, Crown, RotateCcw, Check, Fingerprint, ChevronRight } from 'lucide-react';

const WORD_PAIRS = [
  ["Soleil", "Étoile"], ["Chat", "Tigre"], ["Pomme", "Poire"], ["Livre", "Magazine"],
  ["Voiture", "Camion"], ["Piano", "Guitare"], ["Plage", "Désert"], ["Hiver", "Automne"],
  ["Café", "Thé"], ["Rivière", "Océan"], ["Montagne", "Colline"], ["Film", "Série"],
  ["Pain", "Baguette"], ["Fromage", "Yaourt"], ["Avion", "Hélicoptère"], ["Bateau", "Navire"],
  ["Forêt", "Jungle"], ["Maison", "Appartement"], ["Chaise", "Tabouret"], ["Table", "Bureau"],
  ["Couteau", "Sabre"], ["Cuillère", "Fourchette"], ["Lune", "Planète"], ["Chien", "Loup"],
  ["Cheval", "Zèbre"], ["Orange", "Citron"], ["Fraise", "Framboise"], ["Robe", "Jupe"],
  ["Chemise", "T-shirt"], ["Pantalon", "Short"], ["École", "Université"], ["Hôpital", "Clinique"],
  ["Police", "Gendarmerie"], ["Feu", "Incendie"], ["Eau", "Glace"], ["Vent", "Tornade"],
  ["Amour", "Amitié"], ["Joie", "Bonheur"], ["Tristesse", "Mélancolie"], ["Peur", "Anxiété"],
  ["Musique", "Chanson"], ["Danse", "Ballet"], ["Peinture", "Dessin"], ["Photo", "Image"],
  ["Vin", "Bière"], ["Jardin", "Parc"], ["Fleur", "Arbre"], ["Téléphone", "Smartphone"],
  ["Ordinateur", "Tablette"], ["Clavier", "Souris"], ["Tête", "Cerveau"], ["Main", "Doigt"]
];

type GameStep = 'LOBBY' | 'REVEAL_LIST' | 'REVEAL_WORD' | 'VOTE' | 'RESULT';

interface Player {
  name: string;
  role: 'Civil' | 'Imposteur';
  word: string;
  hasSeenWord: boolean;
}

export const ImpostorGameTool: React.FC = () => {
  const [step, setStep] = useState<GameStep>('LOBBY');
  const [players, setPlayers] = useState<Player[]>([]);
  const [inputName, setInputName] = useState('');
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState<number | null>(null);
  const [revealVisible, setRevealVisible] = useState(false);
  const [winner, setWinner] = useState<'Civil' | 'Imposteur' | null>(null);
  const [eliminatedPlayer, setEliminatedPlayer] = useState<Player | null>(null);

  // --- Logic ---

  const addPlayer = () => {
    if (inputName.trim() && !players.some(p => p.name === inputName.trim())) {
      setPlayers([...players, { name: inputName.trim(), role: 'Civil', word: '', hasSeenWord: false }]);
      setInputName('');
    }
  };

  const removePlayer = (name: string) => {
    setPlayers(players.filter(p => p.name !== name));
  };

  const startGame = () => {
    if (players.length < 3) return;

    // 1. Pick words
    const pair = WORD_PAIRS[Math.floor(Math.random() * WORD_PAIRS.length)];
    const wordCivil = pair[0];
    const wordImpostor = pair[1];

    // 2. Assign roles
    const shuffled = [...players].sort(() => 0.5 - Math.random());
    const impostorIdx = Math.floor(Math.random() * shuffled.length);

    const readyPlayers = shuffled.map((p, i) => ({
      ...p,
      role: (i === impostorIdx ? 'Imposteur' : 'Civil') as 'Civil' | 'Imposteur',
      word: i === impostorIdx ? wordImpostor : wordCivil,
      hasSeenWord: false
    }));

    setPlayers(readyPlayers);
    setStep('REVEAL_LIST');
  };

  const openReveal = (idx: number) => {
    setCurrentPlayerIdx(idx);
    setRevealVisible(false);
    setStep('REVEAL_WORD');
  };

  const markSeenAndClose = () => {
    if (currentPlayerIdx === null) return;
    const newPlayers = [...players];
    newPlayers[currentPlayerIdx].hasSeenWord = true;
    setPlayers(newPlayers);
    setStep('REVEAL_LIST');
    setCurrentPlayerIdx(null);
  };

  const handleVote = (player: Player) => {
    setEliminatedPlayer(player);
    if (player.role === 'Imposteur') {
      setWinner('Civil');
    } else {
      // If a civil is eliminated, Impostor wins (simplified rule for speed)
      setWinner('Imposteur');
    }
    setStep('RESULT');
  };

  const resetGame = () => {
    setPlayers(players.map(p => ({ ...p, role: 'Civil', word: '', hasSeenWord: false })));
    setStep('LOBBY');
    setWinner(null);
    setEliminatedPlayer(null);
  };

  // --- Render Steps ---

  // 1. LOBBY
  if (step === 'LOBBY') {
    return (
      <div className="w-full h-full flex flex-col p-3 relative overflow-hidden bg-zinc-950/30">
        <div className="flex items-center gap-2 mb-2 text-violet-400 shrink-0">
          <Fingerprint size={18} />
          <h2 className="text-xs font-bold uppercase tracking-wider">Jeu de l'Imposteur</h2>
        </div>

        <div className="flex gap-2 mb-2 shrink-0">
          <input 
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
            placeholder="Nom du joueur..."
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-xs text-white focus:border-violet-500 outline-none"
          />
          <button onClick={addPlayer} disabled={!inputName.trim()} className="bg-zinc-800 hover:bg-zinc-700 text-white rounded px-2 disabled:opacity-50">
            <UserPlus size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar pr-1 bg-zinc-900/30 rounded border border-zinc-800/50 mb-2">
          {players.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-600 gap-1">
              <Users size={20} className="opacity-20"/>
              <span className="text-[9px]">Ajoutez 3+ joueurs</span>
            </div>
          ) : (
            <div className="flex flex-col gap-1 p-1">
              {players.map((p, i) => (
                <div key={i} className="flex justify-between items-center bg-zinc-800/50 px-2 py-1.5 rounded text-xs text-zinc-200">
                  <span>{p.name}</span>
                  <button onClick={() => removePlayer(p.name)} className="text-zinc-500 hover:text-red-400"><Skull size={12}/></button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button 
          onClick={startGame} 
          disabled={players.length < 3}
          className="w-full h-8 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[10px] font-bold rounded flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0"
        >
          Lancer la partie ({players.length})
        </button>
      </div>
    );
  }

  // 2. REVEAL LIST (Select player to see word)
  if (step === 'REVEAL_LIST') {
    const allSeen = players.every(p => p.hasSeenWord);
    
    return (
      <div className="w-full h-full flex flex-col p-3 relative overflow-hidden bg-zinc-950/30">
        <div className="flex items-center justify-between mb-3 shrink-0 text-violet-400">
          <div className="flex items-center gap-2">
             <Eye size={18} />
             <h2 className="text-xs font-bold uppercase tracking-wider">Distribution</h2>
          </div>
          <button onClick={resetGame} className="text-zinc-600 hover:text-white"><RotateCcw size={14}/></button>
        </div>

        <div className="text-[10px] text-zinc-500 text-center mb-2">
          Passez l'appareil à chaque joueur.
        </div>

        <div className="flex-1 grid grid-cols-2 gap-2 overflow-y-auto custom-scrollbar min-h-0 content-start">
          {players.map((p, i) => (
            <button 
              key={i} 
              onClick={() => !p.hasSeenWord && openReveal(i)}
              disabled={p.hasSeenWord}
              className={`
                p-2 rounded border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 min-h-[60px]
                ${p.hasSeenWord 
                  ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed' 
                  : 'bg-violet-500/10 border-violet-500/50 text-violet-200 hover:bg-violet-500/20 animate-pulse-slow'}
              `}
            >
              {p.hasSeenWord ? <Check size={16}/> : <Fingerprint size={16}/>}
              {p.name}
            </button>
          ))}
        </div>

        {allSeen && (
          <button 
            onClick={() => setStep('VOTE')}
            className="w-full mt-2 h-9 bg-white text-black hover:bg-zinc-200 text-xs font-bold rounded flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0"
          >
            Passer au Vote <ChevronRight size={14} />
          </button>
        )}
      </div>
    );
  }

  // 3. REVEAL WORD (Private View)
  if (step === 'REVEAL_WORD' && currentPlayerIdx !== null) {
    const player = players[currentPlayerIdx];
    return (
      <div className="w-full h-full flex flex-col p-4 relative overflow-hidden bg-black items-center justify-center text-center">
        <div className="mb-4">
          <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-2 text-violet-400">
            <Fingerprint size={24} />
          </div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">{player.name}</h3>
          <p className="text-[10px] text-zinc-500">Mémorisez votre mot secret</p>
        </div>

        <div 
          onClick={() => setRevealVisible(!revealVisible)}
          className="w-full max-w-[200px] bg-zinc-900 border border-zinc-800 rounded-xl p-4 cursor-pointer hover:bg-zinc-800 transition-colors select-none"
        >
          {revealVisible ? (
            <div className="flex flex-col items-center gap-1 animate-in zoom-in duration-200">
              <span className="text-xl font-black text-white">{player.word}</span>
              <span className="text-[9px] uppercase font-bold text-violet-500">{player.role === 'Imposteur' ? '(Imposteur)' : '(Civil)'}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-zinc-500 py-2">
              <EyeOff size={24} />
              <span className="text-[10px] font-bold uppercase">Cliquer pour voir</span>
            </div>
          )}
        </div>

        <button 
          onClick={markSeenAndClose}
          disabled={!revealVisible} // Must see at least once
          className="mt-6 px-6 py-2 bg-white text-black hover:bg-zinc-200 disabled:opacity-50 text-xs font-bold rounded-full transition-all active:scale-95"
        >
          C'est bon, j'ai vu
        </button>
      </div>
    );
  }

  // 4. VOTE
  if (step === 'VOTE') {
    return (
      <div className="w-full h-full flex flex-col p-3 relative overflow-hidden bg-zinc-950/30">
        <div className="flex items-center justify-center mb-3 shrink-0 text-red-400 gap-2">
          <Skull size={18} />
          <h2 className="text-xs font-bold uppercase tracking-wider">Qui est l'Imposteur ?</h2>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-2 overflow-y-auto custom-scrollbar min-h-0 content-start">
          {players.map((p, i) => (
            <button 
              key={i} 
              onClick={() => handleVote(p)}
              className="bg-zinc-800/50 hover:bg-red-500/20 hover:border-red-500/50 border border-zinc-700/50 rounded p-2 text-xs font-medium text-zinc-200 transition-all active:scale-95"
            >
              {p.name}
            </button>
          ))}
        </div>
        
        <div className="mt-2 text-[9px] text-zinc-500 text-center">
          Votez à l'unanimité pour éliminer un joueur.
        </div>
      </div>
    );
  }

  // 5. RESULT
  if (step === 'RESULT' && winner && eliminatedPlayer) {
    const isCivilWin = winner === 'Civil';
    
    return (
      <div className={`w-full h-full flex flex-col p-4 relative overflow-hidden items-center justify-center text-center ${isCivilWin ? 'bg-emerald-950/30' : 'bg-red-950/30'}`}>
        <div className={`p-4 rounded-full mb-3 ${isCivilWin ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
          {isCivilWin ? <Crown size={32} /> : <Skull size={32} />}
        </div>

        <h2 className={`text-xl font-black uppercase tracking-tight mb-1 ${isCivilWin ? 'text-emerald-400' : 'text-red-400'}`}>
          {isCivilWin ? 'Victoire Civils' : 'Victoire Imposteur'}
        </h2>
        
        <div className="text-xs text-zinc-300 mb-4 bg-black/40 px-3 py-2 rounded-lg border border-white/5">
          <span className="block mb-1">
            <strong className="text-white">{eliminatedPlayer.name}</strong> était {eliminatedPlayer.role === 'Imposteur' ? "l'imposteur" : "un civil"}.
          </span>
          <div className="w-full h-px bg-white/10 my-1.5" />
          <div className="flex justify-between gap-4 text-[10px]">
             <span className="text-zinc-400">Mot Civil: <span className="text-white font-bold">{players.find(p=>p.role==='Civil')?.word}</span></span>
             <span className="text-zinc-400">Mot Imposteur: <span className="text-white font-bold">{players.find(p=>p.role==='Imposteur')?.word}</span></span>
          </div>
        </div>

        <button 
          onClick={startGame}
          className="w-full h-9 bg-white text-black hover:bg-zinc-200 text-xs font-bold rounded flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg"
        >
          Rejouer
        </button>
        <button 
          onClick={resetGame}
          className="mt-2 text-[10px] text-zinc-500 hover:text-white underline decoration-zinc-700 underline-offset-2"
        >
          Changer les joueurs
        </button>
      </div>
    );
  }

  return null;
};