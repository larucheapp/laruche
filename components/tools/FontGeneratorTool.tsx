import React, { useState } from 'react';
import { Type, ArrowRight, Copy, Check, RotateCcw, ChevronLeft } from 'lucide-react';

const CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const STYLES = [
  {
    name: "Serif Bold",
    map: "𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗"
  },
  {
    name: "Sans Bold",
    map: "𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵"
  },
  {
    name: "Italic",
    map: "𝑎𝑏𝑐𝑑𝑒𝑓𝑔ℎ𝑖𝑗𝑘𝑙𝑚𝑛𝑜𝑝𝑞𝑟𝑠𝑡𝑢𝑣𝑤𝑥𝑦𝑧𝐴𝐵𝐶𝐷𝐸𝐹𝐺𝐻𝐼𝐽𝐾𝐿𝑀𝑁𝑂𝑃𝑄𝑅𝑆𝑇𝑈𝑉𝑊𝑋𝑌𝑍0123456789"
  },
  {
    name: "Script",
    map: "𝒶𝒷𝒸𝒹ℯ𝒻ℊ𝒽𝒾𝒿𝓀𝓁𝓂𝓃ℴ𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏𝒜ℬ𝒞𝒟ℰℱ𝒢ℋℐ𝒥𝒦ℒℳ𝒩𝒪𝒫𝒬ℛ𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵0123456789"
  },
  {
    name: "Script Bold",
    map: "𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩0123456789"
  },
  {
    name: "Monospace",
    map: "𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿"
  },
  {
    name: "Double",
    map: "𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡"
  },
  {
    name: "Bubbles",
    map: "🅐🅑🅒🅓🅔🅕🅖🅗🅘🅙🅚🅛🅜🅝🅞🅟🅠🅡🅢🅣🅤🅥🅦🅧🅨🅩🅐🅑🅒🅓🅔🅕🅖🅗🅘🅙🅚🅛🅜🅝🅞🅟🅠🅡🅢🅣🅤🅥🅦🅧🅨🅩⓿➊➋➌➍➎➏➐➑➒"
  },
  {
    name: "Squares",
    map: "🅰🅱🅲🅳🅴🅵🅶🅷🅸🉹🅺🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉🅰🅱🅲🅳🅴🅵🅶🅷🅸🉹🅺🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉0123456789"
  },
  {
    name: "Gothic",
    map: "𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ0123456789"
  },
  {
    name: "Small Caps",
    map: "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ0123456789"
  }
];

// Helper to handle surrogate pairs in map strings
const splitString = (str: string) => [...str];

export const FontGeneratorTool: React.FC = () => {
  const [step, setStep] = useState<'INPUT' | 'RESULTS'>('INPUT');
  const [text, setText] = useState('La Ruche');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const stylesReady = React.useMemo(() => STYLES.map(s => ({
    name: s.name,
    mapArray: splitString(s.map)
  })), []);

  const transformText = (input: string, mapArray: string[]) => {
    let converted = "";
    for (let char of input) {
      const index = CHARS.indexOf(char);
      if (index !== -1 && mapArray[index]) {
        converted += mapArray[index];
      } else {
        converted += char;
      }
    }
    return converted;
  };

  const handleCopy = (content: string, idx: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  // STEP 1: INPUT
  if (step === 'INPUT') {
    return (
      <div className="w-full h-full p-3 flex flex-col justify-between">
        <div className="flex items-center gap-2 mb-2 text-indigo-400 shrink-0">
          <Type size={18} />
          <h2 className="text-xs font-bold uppercase tracking-wider">Générateur Police</h2>
        </div>

        <div className="flex-1 flex flex-col justify-center gap-3">
          <div>
            <label className="block text-[10px] font-medium text-zinc-500 mb-1 ml-1">VOTRE TEXTE</label>
            <textarea
              autoFocus
              rows={2}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Écrivez quelque chose..."
              className="w-full bg-zinc-900 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2.5 focus:border-indigo-500 focus:outline-none transition-colors resize-none"
            />
          </div>
        </div>

        <button 
          onClick={() => {
            if (!text.trim()) setText('La Ruche');
            setStep('RESULTS');
          }}
          className="w-full h-9 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0 shadow-lg shadow-indigo-900/20"
        >
          Générer <ArrowRight size={14} />
        </button>
      </div>
    );
  }

  // STEP 2: RESULTS
  return (
    <div className="w-full h-full p-3 flex flex-col relative">
      {/* Nav */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <button onClick={() => setStep('INPUT')} className="p-1 hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors">
          <ChevronLeft size={16}/>
        </button>
        <span className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">Choisir un Style</span>
        <button onClick={() => setStep('INPUT')} className="p-1 hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors">
          <RotateCcw size={14}/>
        </button>
      </div>

      {/* Results List - Scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1 custom-scrollbar -mr-1">
        <div className="flex flex-col gap-2 pb-1">
          {stylesReady.map((style, idx) => {
            const result = transformText(text, style.mapArray);
            return (
              <button
                key={style.name}
                onClick={() => handleCopy(result, idx)}
                className="group relative flex flex-col items-start gap-1 p-2 rounded-lg bg-zinc-800/40 border border-zinc-700/50 hover:bg-zinc-800 hover:border-indigo-500/50 transition-all text-left w-full"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase">{style.name}</span>
                  {copiedIndex === idx ? (
                    <span className="text-emerald-400"><Check size={12} /></span>
                  ) : (
                    <span className="text-zinc-600 group-hover:text-indigo-400 transition-colors"><Copy size={10} /></span>
                  )}
                </div>
                <span className="text-sm text-white font-medium break-all leading-tight pr-4">
                  {result}
                </span>
              </button>
            );
          })}
          
          {/* Upside Down Special Case */}
          <button
              onClick={() => {
                const map = { input: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", output: "ɐqɔpǝɟƃɥıɾʞlɯuodbɹsʇnʌʍxʎz∀𐐒ƆᗡƎℲ⅁HIſ⋊˥WNOԀÒᴚS⊥∩ΛMX⅄Z0ƖᄅƐㄣϛ9ㄥ86" };
                const outputArr = splitString(map.output);
                let res = "";
                for (let i = text.length - 1; i >= 0; i--) {
                   const idx = map.input.indexOf(text[i]);
                   res += idx !== -1 ? outputArr[idx] : text[i];
                }
                handleCopy(res, 99);
              }}
              className="group relative flex flex-col items-start gap-1 p-2 rounded-lg bg-zinc-800/40 border border-zinc-700/50 hover:bg-zinc-800 hover:border-indigo-500/50 transition-all text-left w-full"
          >
              <div className="flex items-center justify-between w-full">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase">Upside Down</span>
                  {copiedIndex === 99 ? <span className="text-emerald-400"><Check size={12} /></span> : <span className="text-zinc-600 group-hover:text-indigo-400"><Copy size={10} /></span>}
              </div>
               {/* Just a preview of upside down logic since we can't easily inline it for render here without duping logic */}
               <span className="text-sm text-white font-medium break-all leading-tight pr-4">
                 (Renversé)
               </span>
          </button>
        </div>
      </div>
      
      {/* Copied Toast */}
      {copiedIndex !== null && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/80 backdrop-blur-md text-white text-[10px] font-bold rounded-full border border-white/10 shadow-xl animate-fade-in pointer-events-none">
          Copié dans le presse-papier !
        </div>
      )}
    </div>
  );
};