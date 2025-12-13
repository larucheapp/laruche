import { CardData, CardSize, CardType } from './types';
import { Layers, Minimize2, QrCode, Coins, FileType, Gauge, Type, Skull, FileText, Bitcoin, Calculator, Timer, Watch, MousePointerClick, Scale, Globe, ScanBarcode, PenTool, Music, Network, Zap, KeyRound, StickyNote, CloudSun, BookOpen, Receipt, Book, PenLine, Library, Sparkles, Fingerprint, Activity, Stamp } from 'lucide-react';

// Initial set of cards
export const INITIAL_CARDS: CardData[] = [
  // Card 1: Background Remover
  {
    id: 'tool-remove-bg',
    size: CardSize.LARGE, 
    type: CardType.REMOVE_BG,
    title: 'Détourage Photo',
    icon: Layers,
    accentColor: '#7c3aed'
  },
  // Card 2: Image Compressor
  {
    id: 'tool-compressor',
    size: CardSize.LARGE, 
    type: CardType.IMAGE_COMPRESSOR,
    title: 'Compression Image',
    icon: Minimize2,
    accentColor: '#ec4899'
  },
  // Card 3: QR Generator
  {
    id: 'tool-qr',
    size: CardSize.LARGE, 
    type: CardType.QR_GENERATOR,
    title: 'Générateur QR',
    icon: QrCode,
    accentColor: '#3b82f6'
  },
  // Card 4: Currency Converter
  {
    id: 'tool-currency',
    size: CardSize.LARGE, 
    type: CardType.CURRENCY_CONVERTER,
    title: 'Convertisseur Devises',
    icon: Coins,
    accentColor: '#10b981' // Emerald accent
  },
  // Card 5: Image Converter
  {
    id: 'tool-img-convert',
    size: CardSize.LARGE,
    type: CardType.IMAGE_CONVERTER,
    title: 'Convertisseur Image',
    icon: FileType,
    accentColor: '#f97316' // Orange accent
  },
  // Card 6: Speed Test
  {
    id: 'tool-speed-test',
    size: CardSize.LARGE,
    type: CardType.SPEED_TEST,
    title: 'Test Vitesse',
    icon: Gauge,
    accentColor: '#8b5cf6' // Violet accent
  },
  // Card 7: Font Generator
  {
    id: 'tool-font-gen',
    size: CardSize.LARGE,
    type: CardType.FONT_GENERATOR,
    title: 'Générateur de Police',
    icon: Type,
    accentColor: '#6d28d9' // Deep Purple
  },
  // Card 8: Memento Mori
  {
    id: 'tool-memento',
    size: CardSize.LARGE,
    type: CardType.MEMENTO_MORI,
    title: 'Memento Mori',
    icon: Skull,
    accentColor: '#ffffff' // White/Monochrome accent
  },
  // Card 9: Invoice Generator
  {
    id: 'tool-invoice',
    size: CardSize.LARGE,
    type: CardType.INVOICE_GENERATOR,
    title: 'Facture Express',
    icon: FileText,
    accentColor: '#38bdf8' // Sky Blue
  },
  // Card 10: Crypto Converter
  {
    id: 'tool-crypto',
    size: CardSize.LARGE,
    type: CardType.CRYPTO_CONVERTER,
    title: 'Calculatrice Crypto',
    icon: Bitcoin,
    accentColor: '#f59e0b' // Amber/Gold
  },
  // Card 11: Loan Calculator
  {
    id: 'tool-loan',
    size: CardSize.LARGE,
    type: CardType.LOAN_CALCULATOR,
    title: 'Calcul Prêt Immo',
    icon: Calculator,
    accentColor: '#8b5cf6' // Violet
  },
  // Card 12: Hourly Rate Calculator
  {
    id: 'tool-hourly-rate',
    size: CardSize.LARGE,
    type: CardType.HOURLY_RATE_CALCULATOR,
    title: 'Taux Horaire',
    icon: Timer,
    accentColor: '#7c3aed' // Violet
  },
  // Card 13: Stopwatch
  {
    id: 'tool-stopwatch',
    size: CardSize.LARGE,
    type: CardType.STOPWATCH,
    title: 'Chronomètre',
    icon: Watch,
    accentColor: '#10b981' // Green
  },
  // Card 14: Click Speed Test
  {
    id: 'tool-click-test',
    size: CardSize.LARGE,
    type: CardType.CLICK_SPEED_TEST,
    title: 'Test CPS',
    icon: MousePointerClick,
    accentColor: '#f43f5e' // Rose
  },
  // Card 15: License Image
  {
    id: 'img-license',
    size: CardSize.LARGE, 
    type: CardType.IMAGE,
    title: 'Licences & Droits',
    imageUrl: '/imagelicence.png',
    description: "Politique d'usage",
    accentColor: '#ffffff'
  },
  // Card 16: IMC Calculator
  {
    id: 'tool-imc',
    size: CardSize.LARGE,
    type: CardType.IMC_CALCULATOR,
    title: 'Calcul IMC',
    icon: Scale,
    accentColor: '#8b5cf6' // Violet
  },
  // Card 17: Timezone Converter
  {
    id: 'tool-timezone',
    size: CardSize.LARGE,
    type: CardType.TIMEZONE_CONVERTER,
    title: 'Fuseaux Horaires',
    icon: Globe,
    accentColor: '#7c3aed' // Violet
  },
  // Card 18: Barcode Generator
  {
    id: 'tool-barcode',
    size: CardSize.LARGE,
    type: CardType.BARCODE_GENERATOR,
    title: 'Code-Barres',
    icon: ScanBarcode,
    accentColor: '#14b8a6' // Teal
  },
  // Card 19: Signature Generator
  {
    id: 'tool-signature',
    size: CardSize.LARGE,
    type: CardType.SIGNATURE_GENERATOR,
    title: 'Signature Email',
    icon: PenTool,
    accentColor: '#d946ef' // Fuchsia
  },
  // Card 20: Synthesizer
  {
    id: 'tool-synth',
    size: CardSize.LARGE,
    type: CardType.SYNTHESIZER,
    title: 'Mini Synthé',
    icon: Music,
    accentColor: '#f43f5e' // Rose/Red
  },
  // Card 21: IP Finder
  {
    id: 'tool-ip-finder',
    size: CardSize.LARGE,
    type: CardType.IP_FINDER,
    title: 'Mon Adresse IP',
    icon: Network,
    accentColor: '#0ea5e9' // Sky
  },
  // Card 22: Electricity Calculator
  {
    id: 'tool-elec-calc',
    size: CardSize.LARGE,
    type: CardType.ELECTRICITY_CALCULATOR,
    title: 'Coût Électricité',
    icon: Zap,
    accentColor: '#f59e0b' // Amber
  },
  // Card 23: Password Generator
  {
    id: 'tool-password-gen',
    size: CardSize.LARGE,
    type: CardType.PASSWORD_GENERATOR,
    title: 'Générateur MDP',
    icon: KeyRound,
    accentColor: '#7c3aed' // Violet
  },
  // Card 24: Notepad
  {
    id: 'tool-notepad',
    size: CardSize.LARGE,
    type: CardType.NOTE_PAD,
    title: 'Bloc-Notes',
    icon: StickyNote,
    accentColor: '#fbbf24' // Amber
  },
  // Card 25: WhatsApp Community
  {
    id: 'link-whatsapp',
    size: CardSize.LARGE, 
    type: CardType.IMAGE,
    title: 'Rejoindre Communauté',
    imageUrl: '/whatspapp.png',
    description: 'Groupe Officiel',
    url: 'https://chat.whatsapp.com/J68eGPz5ywqEHi2BXBumMI?mode=hqrt2',
    accentColor: '#25D366'
  },
  // Card 26: Weather Tool
  {
    id: 'tool-weather',
    size: CardSize.LARGE,
    type: CardType.WEATHER,
    title: 'Météo Express',
    icon: CloudSun,
    accentColor: '#38bdf8' // Sky Blue
  },
  // Card 27: Revision Sheet
  {
    id: 'tool-revision',
    size: CardSize.LARGE,
    type: CardType.REVISION_SHEET,
    title: 'Fiche Révision',
    icon: BookOpen,
    accentColor: '#4f46e5' // Indigo
  },
  // Card 28: Expense Tracker
  {
    id: 'tool-expenses',
    size: CardSize.LARGE,
    type: CardType.EXPENSE_TRACKER,
    title: 'Note de Frais',
    icon: Receipt,
    accentColor: '#7c3aed' // Violet
  },
  // Card 29: Yu-Gi-Oh Binder
  {
    id: 'tool-yugioh',
    size: CardSize.LARGE,
    type: CardType.YUGIOH_BINDER,
    title: 'Classeur Yu-Gi-Oh!',
    icon: Book,
    accentColor: '#facc15' // Yellow/Gold
  },
  // Card 30: Calculator
  {
    id: 'tool-calculator',
    size: CardSize.LARGE,
    type: CardType.CALCULATOR,
    title: 'Calculatrice',
    icon: Calculator,
    accentColor: '#10b981' // Emerald
  },
  // Card 31: PDF Signature
  {
    id: 'tool-pdf-sign',
    size: CardSize.LARGE,
    type: CardType.PDF_SIGNATURE,
    title: 'Signer PDF',
    icon: PenLine,
    accentColor: '#ef4444' // Red
  },
  // Card 32: Wiki Assistant (Apis)
  {
    id: 'tool-wiki-assistant',
    size: CardSize.LARGE, // Big enough for chat
    type: CardType.WIKI_ASSISTANT,
    title: 'Assistant Wiki',
    icon: Library,
    accentColor: '#7c3aed' // Violet
  },
  // Card 33: Donation
  {
    id: 'link-donation',
    size: CardSize.LARGE,
    type: CardType.IMAGE,
    title: 'Faire un Don',
    description: 'Soutenir le projet',
    imageUrl: '/don.png',
    url: 'https://revolut.me/oscarn60z',
    accentColor: '#F05098' // Revolut-like Pink
  },
  // Card 34: Tarot Reader
  {
    id: 'tool-tarot',
    size: CardSize.LARGE,
    type: CardType.TAROT_READER,
    title: 'Tireur de Tarot',
    icon: Sparkles,
    accentColor: '#7c3aed' // Violet/Mystic
  },
  // Card 35: Impostor Game
  {
    id: 'tool-impostor',
    size: CardSize.LARGE,
    type: CardType.IMPOSTOR_GAME,
    title: 'Jeu de l\'Imposteur',
    icon: Fingerprint,
    accentColor: '#7c3aed' // Violet
  },
  // Card 36: Habit Tracker
  {
    id: 'tool-habit',
    size: CardSize.LARGE,
    type: CardType.HABIT_TRACKER,
    title: 'Suivi Habitudes',
    icon: Activity,
    accentColor: '#7c3aed' // Violet
  },
  // Card 37: Watermark Tool
  {
    id: 'tool-watermark',
    size: CardSize.LARGE,
    type: CardType.WATERMARK,
    title: 'Filigrane Photo',
    icon: Stamp,
    accentColor: '#22d3ee' // Cyan
  },
  // Card 38: Image To PDF Tool (Replaces Scanner)
  {
    id: 'tool-img-pdf',
    size: CardSize.LARGE,
    type: CardType.IMAGE_TO_PDF,
    title: 'Image vers PDF',
    icon: FileText,
    accentColor: '#f43f5e' // Rose
  }
];

export const generateMoreCards = (count: number, startIndex: number): CardData[] => {
    // No more infinite empty cards, functionality removed as requested
    return [];
};