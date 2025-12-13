import { LucideIcon } from 'lucide-react';

export enum CardSize {
  SMALL = 'small',   // 1x1
  WIDE = 'wide',     // 2x1
  TALL = 'tall',     // 1x2
  LARGE = 'large',   // 2x2
  HERO = 'hero',     // Full width (4x2 on desktop)
}

export enum CardType {
  IMAGE = 'image',
  TOOL = 'tool',
  INFO = 'info',
  VIDEO = 'video',
  LINK = 'link',
  SOCIAL = 'social',
  LEGAL = 'legal',
  REMOVE_BG = 'remove_bg',
  IMAGE_COMPRESSOR = 'image_compressor',
  QR_GENERATOR = 'qr_generator',
  CURRENCY_CONVERTER = 'currency_converter',
  IMAGE_CONVERTER = 'image_converter',
  SPEED_TEST = 'speed_test',
  FONT_GENERATOR = 'font_generator',
  MEMENTO_MORI = 'memento_mori',
  INVOICE_GENERATOR = 'invoice_generator',
  CRYPTO_CONVERTER = 'crypto_converter',
  LOAN_CALCULATOR = 'loan_calculator',
  HOURLY_RATE_CALCULATOR = 'hourly_rate_calculator',
  STOPWATCH = 'stopwatch',
  CLICK_SPEED_TEST = 'click_speed_test',
  IMC_CALCULATOR = 'imc_calculator',
  TIMEZONE_CONVERTER = 'timezone_converter',
  BARCODE_GENERATOR = 'barcode_generator',
  SIGNATURE_GENERATOR = 'signature_generator',
  SYNTHESIZER = 'synthesizer',
  IP_FINDER = 'ip_finder',
  ELECTRICITY_CALCULATOR = 'electricity_calculator',
  PASSWORD_GENERATOR = 'password_generator',
  NOTE_PAD = 'note_pad',
  WEATHER = 'weather',
  REVISION_SHEET = 'revision_sheet',
  EXPENSE_TRACKER = 'expense_tracker',
  YUGIOH_BINDER = 'yugioh_binder',
  CALCULATOR = 'calculator',
  PDF_SIGNATURE = 'pdf_signature',
  WIKI_ASSISTANT = 'wiki_assistant',
  TAROT_READER = 'tarot_reader',
  IMPOSTOR_GAME = 'impostor_game',
  HABIT_TRACKER = 'habit_tracker',
  WATERMARK = 'watermark',
  IMAGE_TO_PDF = 'image_to_pdf'
}

export interface CardData {
  id: string;
  size: CardSize;
  type: CardType;
  title?: string;
  description?: string;
  icon?: LucideIcon;
  imageUrl?: string;
  accentColor?: string;
  url?: string;
}