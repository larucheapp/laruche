import React, { useState, useRef } from 'react';
import { Sparkles, RotateCcw, Layers, ArrowRight, Eye } from 'lucide-react';

const WIKI_IMG_BASE_URL = 'https://upload.wikimedia.org/wikipedia/commons/';

interface TarotCard {
  name: string;
  img: string;
  upright: string;
  reversed: string;
}

interface DrawnCard extends TarotCard {
  isReversed: boolean;
}

const TAROT_DECK: TarotCard[] = [
  {name:"Le Fou",img:"9/90/RWS_Tarot_00_Fool.jpg",upright:"Nouveaux départs, foi, potentiel, spontanéité.",reversed:"Imprudence, naïveté, chaos, prise de risque inutile."},
  {name:"Le Bateleur",img:"d/de/RWS_Tarot_01_Magician.jpg",upright:"Volonté, manifestation, pouvoir, action.",reversed:"Manipulation, mauvaises intentions, talents inexploités."},
  {name:"La Papesse",img:"8/88/RWS_Tarot_02_High_Priestess.jpg",upright:"Intuition, secrets, sagesse, subconscient.",reversed:"Secrets révélés, confusion, intuition bloquée."},
  {name:"L'Impératrice",img:"d/d2/RWS_Tarot_03_Empress.jpg",upright:"Féminité, abondance, nature, créativité.",reversed:"Dépendance, blocage créatif, surprotection."},
  {name:"L'Empereur",img:"c/c3/RWS_Tarot_04_Emperor.jpg",upright:"Autorité, structure, contrôle, paternité.",reversed:"Domination, rigidité, manque de discipline."},
  {name:"Le Pape",img:"8/8d/RWS_Tarot_05_Hierophant.jpg",upright:"Tradition, institutions, croyances, guidance.",reversed:"Rébellion, non-conformisme, nouvelles approches."},
  {name:"L'Amoureux",img:"d/db/RWS_Tarot_06_Lovers.jpg",upright:"Amour, harmonie, choix, relations.",reversed:"Conflit, mauvais choix, désalignement des valeurs."},
  {name:"Le Chariot",img:"9/9b/RWS_Tarot_07_Chariot.jpg",upright:"Victoire, volonté, maîtrise de soi, action.",reversed:"Manque de direction, agression, perte de contrôle."},
  {name:"La Force",img:"f/f5/RWS_Tarot_08_Strength.jpg",upright:"Force intérieure, courage, compassion, contrôle.",reversed:"Faiblesse, doute, manque de maîtrise de soi."},
  {name:"L'Ermite",img:"4/4d/RWS_Tarot_09_Hermit.jpg",upright:"Introspection, solitude, guidance intérieure.",reversed:"Isolement, solitude, repli sur soi excessif."},
  {name:"La Roue de Fortune",img:"3/3c/RWS_Tarot_10_Wheel_of_Fortune.jpg",upright:"Changement, cycles, destin, tournant.",reversed:"Malchance, résistance au changement, revers."},
  {name:"La Justice",img:"e/e0/RWS_Tarot_11_Justice.jpg",upright:"Justice, vérité, cause et effet, clarté.",reversed:"Injustice, mensonges, conséquences karmiques."},
  {name:"Le Pendu",img:"2/2b/RWS_Tarot_12_Hanged_Man.jpg",upright:"Pause, nouvelles perspectives, sacrifice, lâcher-prise.",reversed:"Stagnation, indécision, sacrifice inutile."},
  {name:"La Mort",img:"d/d7/RWS_Tarot_13_Death.jpg",upright:"Fin, transformation, transition, changement.",reversed:"Résistance au changement, peur de la fin, stagnation."},
  {name:"La Tempérance",img:"f/f8/RWS_Tarot_14_Temperance.jpg",upright:"Équilibre, modération, patience, harmonie.",reversed:"Déséquilibre, excès, impatience, conflit."},
  {name:"Le Diable",img:"5/55/RWS_Tarot_15_Devil.jpg",upright:"Attachement, dépendance, matérialisme, tentation.",reversed:"Libération, détachement, fin des dépendances."},
  {name:"La Maison Dieu",img:"5/53/RWS_Tarot_16_Tower.jpg",upright:"Révélation soudaine, chaos, destruction, éveil.",reversed:"Peur du changement, éviter le désastre, crise retardée."},
  {name:"L'Étoile",img:"d/db/RWS_Tarot_17_Star.jpg",upright:"Espoir, foi, inspiration, guérison.",reversed:"Désespoir, manque de foi, déconnexion."},
  {name:"La Lune",img:"7/7f/RWS_Tarot_18_Moon.jpg",upright:"Illusion, peur, anxiété, intuition.",reversed:"Clarté, fin de la confusion, vérité révélée."},
  {name:"Le Soleil",img:"1/17/RWS_Tarot_19_Sun.jpg",upright:"Joie, succès, clarté, vitalité.",reversed:"Tristesse, pessimisme, manque de succès."},
  {name:"Le Jugement",img:"d/dd/RWS_Tarot_20_Judgement.jpg",upright:"Renaissance, jugement, pardon, bilan.",reversed:"Doute de soi, auto-critique, refus du pardon."},
  {name:"Le Monde",img:"f/ff/RWS_Tarot_21_World.jpg",upright:"Achèvement, intégration, accomplissement, voyage.",reversed:"Manque d'achèvement, stagnation, projet inachevé."},
  {name:"As de Bâton",img:"1/11/Wands01.jpg",upright:"Inspiration, nouvelle opportunité, potentiel.",reversed:"Manque d'inspiration, retard, occasion manquée."},
  {name:"Deux de Bâton",img:"0/0f/Wands02.jpg",upright:"Planification, décision, potentiel futur.",reversed:"Peur de l'inconnu, manque de planification."},
  {name:"Trois de Bâton",img:"f/ff/Wands03.jpg",upright:"Expansion, prévoyance, attente des résultats.",reversed:"Retards, frustration, manque de vision."},
  {name:"Quatre de Bâton",img:"a/a4/Wands04.jpg",upright:"Célébration, harmonie, foyer, communauté.",reversed:"Conflit, instabilité, manque d'harmonie."},
  {name:"Cinq de Bâton",img:"9/9d/Wands05.jpg",upright:"Compétition, conflit, désaccord, défis.",reversed:"Fin du conflit, accord, éviter le conflit."},
  {name:"Six de Bâton",img:"3/3b/Wands06.jpg",upright:"Victoire, reconnaissance publique, succès.",reversed:"Échec, manque de reconnaissance, orgueil."},
  {name:"Sept de Bâton",img:"e/e7/Wands07.jpg",upright:"Défense, persévérance, défi, conviction.",reversed:"Abandon, être submergé,放弃."},
  {name:"Huit de Bâton",img:"6/6b/Wands08.jpg",upright:"Action rapide, mouvement, nouvelles, communication.",reversed:"Retards, frustration, stagnation."},
  {name:"Neuf de Bâton",img:"4/4d/Wands09.jpg",upright:"Résilience, courage, dernière ligne droite.",reversed:"Fatigue, abandon, être sur la défensive."},
  {name:"Dix de Bâton",img:"0/0b/Wands10.jpg",upright:"Fardeau, responsabilité, travail acharné.",reversed:"Lâcher prise, déléguer, fardeau trop lourd."},
  {name:"Valet de Bâton",img:"6/6a/Wands11.jpg",upright:"Enthousiasme, exploration, messages.",reversed:"Indécision, manque de direction, procrastination."},
  {name:"Cavalier de Bâton",img:"1/16/Wands12.jpg",upright:"Énergie, passion, action, impulsion.",reversed:"Impulsivité, précipitation, manque de direction."},
  {name:"Reine de Bâton",img:"0/0d/Wands13.jpg",upright:"Confiance, charisme, indépendance, détermination.",reversed:"Insécurité, jalousie, intimidation."},
  {name:"Roi de Bâton",img:"c/ce/Wands14.jpg",upright:"Leadership, vision, entrepreneuriat, honneur.",reversed:"Impulsivité, autoritarisme, manque de vision."},
  {name:"As de Coupe",img:"3/36/Cups01.jpg",upright:"Amour, nouvelles émotions, compassion, créativité.",reversed:"Émotions bloquées, amour non partagé, tristesse."},
  {name:"Deux de Coupe",img:"f/f8/Cups02.jpg",upright:"Partenariat, amour, connexion, harmonie.",reversed:"Rupture, désaccord, déconnexion."},
  {name:"Trois de Coupe",img:"7/7a/Cups03.jpg",upright:"Célébration, amitié, communauté, joie.",reversed:"Gossip, excès, solitude."},
  {name:"Quatre de Coupe",img:"3/35/Cups04.jpg",upright:"Apathie, contemplation, occasions manquées.",reversed:"Prise de conscience, nouvelles opportunités, fin de l'ennui."},
  {name:"Cinq de Coupe",img:"d/d7/Cups05.jpg",upright:"Perte, regret, deuil, déception.",reversed:"Acceptation, pardon, passer à autre chose."},
  {name:"Six de Coupe",img:"1/17/Cups06.jpg",upright:"Nostalgie, innocence, souvenirs heureux.",reversed:"Être coincé dans le passé, refus de grandir."},
  {name:"Sept de Coupe",img:"a/ae/Cups07.jpg",upright:"Choix, illusions, rêves, imagination.",reversed:"Confusion, mauvais choix, tentation."},
  {name:"Huit de Coupe",img:"6/60/Cups08.jpg",upright:"Abandon, quête de sens, introspection.",reversed:"Peur de l'abandon, stagnation, retour en arrière."},
  {name:"Neuf de Coupe",img:"2/24/Cups09.jpg",upright:"Satisfaction, souhaits exaucés, contentement.",reversed:"Insatisfaction, matérialisme, ne pas obtenir ce que l'on veut."},
  {name:"Dix de Coupe",img:"8/84/Cups10.jpg",upright:"Bonheur familial, harmonie, accomplissement.",reversed:"Conflit familial, foyer brisé, malheur."},
  {name:"Valet de Coupe",img:"a/ad/Cups11.jpg",upright:"Créativité, messages émotionnels, intuition.",reversed:"Immaturité émotionnelle, blocage créatif."},
  {name:"Cavalier de Coupe",img:"f/fa/Cups12.jpg",upright:"Romance, charme, imagination, offre.",reversed:"Illusion, humeur changeante, superficialité."},
  {name:"Reine de Coupe",img:"6/62/Cups13.jpg",upright:"Compassion, intuition, calme, bienveillance.",reversed:"Hypersensibilité, dépendance émotionnelle."},
  {name:"Roi de Coupe",img:"0/04/Cups14.jpg",upright:"Maîtrise émotionnelle, compassion, diplomatie.",reversed:"Manipulation émotionnelle, humeur instable."},
  {name:"As d'Épée",img:"1/1a/Swords01.jpg",upright:"Clarté, vérité, nouvelle idée, percée.",reversed:"Confusion, mensonges, manque de clarté."},
  {name:"Deux d'Épée",img:"9/9e/Swords02.jpg",upright:"Indécision, impasse, choix difficile.",reversed:"Confusion, mauvais choix, vérité révélée."},
  {name:"Trois d'Épée",img:"0/02/Swords03.jpg",upright:"Chagrin, peine de cœur, douleur, séparation.",reversed:"Guérison, pardon, surmonter la douleur."},
  {name:"Quatre d'Épée",img:"b/bf/Swords04.jpg",upright:"Repos, récupération, contemplation, pause.",reversed:"Épuisement, stagnation, besoin de repos."},
  {name:"Cinq d'Épée",img:"2/21/Swords05.jpg",upright:"Conflit, défaite, victoire à la Pyrrhus.",reversed:"Réconciliation, fin du conflit, compromis."},
  {name:"Six d'Épée",img:"2/29/Swords06.jpg",upright:"Transition, passage, déménagement, guérison.",reversed:"Résistance au changement, voyage difficile."},
  {name:"Sept d'Épée",img:"3/34/Swords07.jpg",upright:"Tromperie, stratégie, agir seul, mensonge.",reversed:"Confession, vérité révélée, conscience coupable."},
  {name:"Huit d'Épée",img:"a/a7/Swords08.jpg",upright:"Restriction, limitation, auto-sabotage.",reversed:"Libération, nouvelles perspectives, prise de contrôle."},
  {name:"Neuf d'Épée",img:"2/2f/Swords09.jpg",upright:"Anxiété, peur, cauchemars, désespoir.",reversed:"Libération de la peur, espoir, aide."},
  {name:"Dix d'Épée",img:"d/d4/Swords10.jpg",upright:"Fin douloureuse, trahison, crise, échec.",reversed:"Guérison, nouvelle chance, surmonter le pire."},
  {name:"Valet d'Épée",img:"4/4c/Swords11.jpg",upright:"Curiosité, nouvelles idées, communication.",reversed:"Gossip, manque de tact, impatience."},
  {name:"Cavalier d'Épée",img:"b/b0/Swords12.jpg",upright:"Action rapide, ambition, précipitation.",reversed:"Impulsivité, précipitation, manque de direction."},
  {name:"Reine d'Épée",img:"d/d4/Swords13.jpg",upright:"Indépendance, clarté, intelligence, honnêteté.",reversed:"Froideur, critique, amertume."},
  {name:"Roi d'Épée",img:"3/33/Swords14.jpg",upright:"Autorité, vérité, clarté intellectuelle, justice.",reversed:"Manipulation, autoritarisme, cruauté."},
  {name:"As de Denier",img:"f/fd/Pents01.jpg",upright:"Nouvelle opportunité financière, prospérité.",reversed:"Opportunité manquée, mauvais investissement."},
  {name:"Deux de Denier",img:"9/9f/Pents02.jpg",upright:"Équilibre, gestion, adaptation.",reversed:"Déséquilibre, mauvaise gestion, stress financier."},
  {name:"Trois de Denier",img:"4/42/Pents03.jpg",upright:"Travail d'équipe, collaboration, maîtrise.",reversed:"Manque de travail d'équipe, mauvaise qualité."},
  {name:"Quatre de Denier",img:"3/35/Pents04.jpg",upright:"Stabilité, sécurité, contrôle, possession.",reversed:"Avarice, peur de la perte, matérialisme."},
  {name:"Cinq de Denier",img:"9/96/Pents05.jpg",upright:"Pauvreté, difficultés financières, isolement.",reversed:"Fin des difficultés, aide, espoir retrouvé."},
  {name:"Six de Denier",img:"a/a6/Pents06.jpg",upright:"Générosité, charité, partage, équilibre.",reversed:"Dette, égoïsme, abus de générosité."},
  {name:"Sept de Denier",img:"6/6a/Pents07.jpg",upright:"Patience, investissement à long terme, récolte.",reversed:"Impatience, frustration, mauvais investissement."},
  {name:"Huit de Denier",img:"4/49/Pents08.jpg",upright:"Apprentissage, maîtrise, diligence, compétence.",reversed:"Perfectionnisme, travail répétitif, manque d'ambition."},
  {name:"Neuf de Denier",img:"f/f0/Pents09.jpg",upright:"Abondance, indépendance, luxe, autosuffisance.",reversed:"Dépendance financière, travail acharné sans récompense."},
  {name:"Dix de Denier",img:"4/42/Pents10.jpg",upright:"Héritage, richesse, famille, stabilité.",reversed:"Conflit familial, instabilité financière, perte."},
  {name:"Valet de Denier",img:"e/e3/Pents11.jpg",upright:"Nouvelle opportunité, apprentissage, diligence.",reversed:"Procrastination, occasion manquée, paresse."},
  {name:"Cavalier de Denier",img:"d/d5/Pents12.jpg",upright:"Travail acharné, routine, fiabilité, patience.",reversed:"Stagnation, paresse, manque de fiabilité."},
  {name:"Reine de Denier",img:"8/88/Pents13.jpg",upright:"Praticité, confort, générosité, nature.",reversed:"Matérialisme, insécurité, superficialité."},
  {name:"Roi de Denier",img:"1/1c/Pents14.jpg",upright:"Richesse, succès, sécurité, leadership.",reversed:"Corruption, matérialisme, avidité."}
];

export const TarotReaderTool: React.FC = () => {
  const [step, setStep] = useState<'INPUT' | 'RESULT'>('INPUT');
  const [drawType, setDrawType] = useState<1 | 3>(3);
  const [results, setResults] = useState<DrawnCard[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleDraw = () => {
    setIsAnimating(true);
    
    // Simulate shuffle delay
    setTimeout(() => {
        const shuffled = [...TAROT_DECK].sort(() => 0.5 - Math.random());
        const selection = shuffled.slice(0, drawType);
        const drawn = selection.map(card => ({
            ...card,
            isReversed: Math.random() < 0.3
        }));
        
        setResults(drawn);
        setStep('RESULT');
        setIsAnimating(false);
    }, 1500);
  };

  const handleReset = () => {
      setStep('INPUT');
      setResults([]);
  };

  const getLabel = (index: number, count: number) => {
      if (count === 1) return "Conseil du Jour";
      const labels = ["Passé", "Présent", "Futur"];
      return labels[index] || `Carte ${index + 1}`;
  };

  return (
    <div className="w-full h-full flex flex-col p-3 relative overflow-hidden bg-zinc-950/30">
        {/* Header */}
        <div className="flex items-center justify-between mb-2 shrink-0">
            <div className="flex items-center gap-2 text-violet-400">
                <Sparkles size={18} />
                <h2 className="text-[10px] font-bold uppercase tracking-wider">Lecteur Tarot</h2>
            </div>
            {step === 'RESULT' && (
                <button onClick={handleReset} className="text-zinc-500 hover:text-white transition-colors" title="Nouveau tirage">
                    <RotateCcw size={14} />
                </button>
            )}
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 relative flex flex-col">
            
            {/* STEP 1: INPUT */}
            {step === 'INPUT' && (
                <div className={`flex flex-col items-center justify-center h-full gap-4 transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="flex gap-2 w-full max-w-[200px]">
                        <button 
                            onClick={() => setDrawType(1)}
                            className={`flex-1 py-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${drawType === 1 ? 'bg-violet-500/20 border-violet-500 text-violet-200' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                        >
                            <Layers size={20} />
                            <span className="text-[10px] font-bold">1 Carte</span>
                        </button>
                        <button 
                            onClick={() => setDrawType(3)}
                            className={`flex-1 py-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${drawType === 3 ? 'bg-violet-500/20 border-violet-500 text-violet-200' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                        >
                            <div className="flex gap-0.5"><Layers size={16}/><Layers size={16}/><Layers size={16}/></div>
                            <span className="text-[10px] font-bold">3 Cartes</span>
                        </button>
                    </div>

                    <button 
                        onClick={handleDraw}
                        className="w-full max-w-[200px] h-10 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-900/20 active:scale-95"
                    >
                        <Eye size={16} /> Révéler
                    </button>
                </div>
            )}

            {/* LOADING STATE */}
            {isAnimating && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 animate-fade-in">
                    <div className="relative">
                        <div className="w-12 h-16 bg-zinc-800 rounded border border-zinc-700 animate-bounce" style={{ animationDuration: '0.8s' }} />
                        <div className="absolute inset-0 bg-violet-500/20 blur-xl animate-pulse" />
                    </div>
                    <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest animate-pulse">Mélange...</span>
                </div>
            )}

            {/* STEP 2: RESULTS */}
            {step === 'RESULT' && (
                <div className="flex flex-col h-full gap-3 animate-fade-in overflow-y-auto custom-scrollbar pr-1">
                    {/* Cards Display */}
                    <div className="flex gap-2 overflow-x-auto pb-2 shrink-0 justify-center">
                        {results.map((card, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-2 animate-in slide-in-from-bottom-4 fade-in duration-500" style={{ animationDelay: `${idx * 150}ms` }}>
                                <div className="text-[9px] font-bold text-zinc-500 uppercase">{getLabel(idx, results.length)}</div>
                                <div className={`relative w-24 aspect-[2/3.5] rounded-lg overflow-hidden border border-zinc-700/50 shadow-lg group bg-black`}>
                                    <img 
                                        src={`${WIKI_IMG_BASE_URL}${card.img}`} 
                                        alt={card.name}
                                        className={`w-full h-full object-cover transition-transform duration-700 ${card.isReversed ? 'rotate-180' : ''}`}
                                    />
                                    {/* Name Overlay */}
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-2 pt-6">
                                        <div className="text-[10px] font-bold text-white text-center leading-tight">
                                            {card.name}
                                        </div>
                                        {card.isReversed && <div className="text-[8px] text-red-400 text-center font-bold uppercase mt-0.5">Inversée</div>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Interpretations */}
                    <div className="flex flex-col gap-2 pb-2">
                        {results.map((card, idx) => (
                            <div key={idx} className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800 animate-in slide-in-from-bottom-2 fade-in duration-500" style={{ animationDelay: `${(idx * 150) + 300}ms` }}>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-4 h-4 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-[9px] font-bold border border-violet-500/30">{idx + 1}</span>
                                    <h3 className="text-xs font-bold text-zinc-200">
                                        {card.name} <span className="text-zinc-500 font-normal">{card.isReversed ? '(Inv.)' : ''}</span>
                                    </h3>
                                </div>
                                <p className="text-[10px] text-zinc-400 leading-relaxed pl-6">
                                    {card.isReversed ? card.reversed : card.upright}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};