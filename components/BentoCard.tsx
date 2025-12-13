import React, { useMemo } from 'react';
import { CardData, CardSize, CardType } from '../types';
import { RemoveBgTool } from './tools/RemoveBgTool';
import { ImageCompressorTool } from './tools/ImageCompressorTool';
import { QrCodeTool } from './tools/QrCodeTool';
import { CurrencyConverterTool } from './tools/CurrencyConverterTool';
import { ImageConverterTool } from './tools/ImageConverterTool';
import { SpeedTestTool } from './tools/SpeedTestTool';
import { FontGeneratorTool } from './tools/FontGeneratorTool';
import { MementoMoriTool } from './tools/MementoMoriTool';
import { InvoiceGeneratorTool } from './tools/InvoiceGeneratorTool';
import { CryptoConverterTool } from './tools/CryptoConverterTool';
import { LoanCalculatorTool } from './tools/LoanCalculatorTool';
import { HourlyRateCalculatorTool } from './tools/HourlyRateCalculatorTool';
import { StopwatchTool } from './tools/StopwatchTool';
import { ClickSpeedTestTool } from './tools/ClickSpeedTestTool';
import { IMCCalculatorTool } from './tools/IMCCalculatorTool';
import { TimezoneConverterTool } from './tools/TimezoneConverterTool';
import { BarcodeGeneratorTool } from './tools/BarcodeGeneratorTool';
import { SignatureGeneratorTool } from './tools/SignatureGeneratorTool';
import { SynthesizerTool } from './tools/SynthesizerTool';
import { IpFinderTool } from './tools/IpFinderTool';
import { ElectricityCalculatorTool } from './tools/ElectricityCalculatorTool';
import { PasswordGeneratorTool } from './tools/PasswordGeneratorTool';
import { NotePadTool } from './tools/NotePadTool';
import { WeatherTool } from './tools/WeatherTool';
import { RevisionSheetTool } from './tools/RevisionSheetTool';
import { ExpenseTrackerTool } from './tools/ExpenseTrackerTool';
import { YugiohBinderTool } from './tools/YugiohBinderTool';
import { CalculatorTool } from './tools/CalculatorTool';
import { PdfSignatureTool } from './tools/PdfSignatureTool';
import { WikiAssistantTool } from './tools/WikiAssistantTool';
import { TarotReaderTool } from './tools/TarotReaderTool';
import { ImpostorGameTool } from './tools/ImpostorGameTool';
import { HabitTrackerTool } from './tools/HabitTrackerTool';
import { WatermarkTool } from './tools/WatermarkTool';
import { ImageToPdfTool } from './tools/ImageToPdfTool';

interface BentoCardProps {
  data: CardData;
  index: number;
}

export const BentoCard: React.FC<BentoCardProps> = ({ data, index }) => {
  const { size, type, title, description, icon: Icon, accentColor, imageUrl, url } = data;

  // Determine grid span based on size
  const spanClasses = useMemo(() => {
    switch (size) {
      case CardSize.HERO:
        return 'col-span-2 md:col-span-4 lg:col-span-4 row-span-2';
      case CardSize.LARGE:
        return 'col-span-2 md:col-span-2 row-span-2';
      case CardSize.WIDE:
        return 'col-span-2 md:col-span-2 row-span-1';
      case CardSize.TALL:
        return 'col-span-1 row-span-2';
      case CardSize.SMALL:
      default:
        return 'col-span-1 row-span-1';
    }
  }, [size]);

  // Dynamic animation delay for a staggered load effect
  const animationDelay = `${(index % 20) * 30}ms`;

  // Common background class for tools to ensure visibility on light background
  const cardBgClass = "bg-zinc-950/90 border border-zinc-800/50 backdrop-blur-md shadow-xl";

  // --- RENDERERS ---

  // Specific Renderer for Image Cards (With optional Link support)
  if (type === CardType.IMAGE && imageUrl) {
    const Container = url ? 'a' : 'div';
    const linkProps = url ? { href: url, target: "_blank", rel: "noopener noreferrer" } : {};

    return (
      <Container 
        {...linkProps}
        className={`
          relative group overflow-hidden rounded-2xl
          bg-zinc-950 border border-zinc-800/50
          flex flex-col
          ${spanClasses}
          animate-fade-in
          ${url ? 'cursor-pointer' : ''}
        `}
        style={{ animationDelay }}
      >
        {/* Image with zoom effect */}
        <div className="absolute inset-0 overflow-hidden">
            <img 
              src={imageUrl} 
              alt={title || "Card Image"} 
              className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105 opacity-80 group-hover:opacity-100"
              onError={(e) => {
                // Fallback if image not found yet
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.classList.add('bg-zinc-900');
              }}
            />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-90 transition-opacity duration-300" />
        
        {/* Content Content (Text) */}
        <div className="absolute bottom-0 left-0 right-0 p-5 z-20 flex flex-col justify-end h-full">
            {title && (
              <h3 className="text-xl font-bold text-white tracking-tight transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-sm text-zinc-400 mt-1 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 delay-75">
                {description}
              </p>
            )}
        </div>
      </Container>
    );
  }

  // Render Remove Background Tool
  if (type === CardType.REMOVE_BG) {
    return (
      <div 
        className={`
          relative group overflow-hidden rounded-2xl
          ${cardBgClass}
          transition-all duration-300
          hover:border-purple-500/30
          flex flex-col
          ${spanClasses}
          animate-fade-in
        `}
        style={{ animationDelay }}
      >
        <RemoveBgTool />
      </div>
    );
  }

  // Render Image Compressor Tool
  if (type === CardType.IMAGE_COMPRESSOR) {
    return (
      <div 
        className={`
          relative group overflow-hidden rounded-2xl
          ${cardBgClass}
          transition-all duration-300
          hover:border-pink-500/30
          flex flex-col
          ${spanClasses}
          animate-fade-in
        `}
        style={{ animationDelay }}
      >
        <ImageCompressorTool />
      </div>
    );
  }

  // Render QR Code Generator Tool
  if (type === CardType.QR_GENERATOR) {
    return (
      <div 
        className={`
          relative group overflow-hidden rounded-2xl
          ${cardBgClass}
          transition-all duration-300
          hover:border-blue-500/30
          flex flex-col
          ${spanClasses}
          animate-fade-in
        `}
        style={{ animationDelay }}
      >
        <QrCodeTool />
      </div>
    );
  }

  // Render Currency Converter Tool
  if (type === CardType.CURRENCY_CONVERTER) {
    return (
      <div 
        className={`
          relative group overflow-hidden rounded-2xl
          ${cardBgClass}
          transition-all duration-300
          hover:border-emerald-500/30
          flex flex-col
          ${spanClasses}
          animate-fade-in
        `}
        style={{ animationDelay }}
      >
        <CurrencyConverterTool />
      </div>
    );
  }

  // Render Image Converter Tool
  if (type === CardType.IMAGE_CONVERTER) {
    return (
      <div 
        className={`
          relative group overflow-hidden rounded-2xl
          ${cardBgClass}
          transition-all duration-300
          hover:border-orange-500/30
          flex flex-col
          ${spanClasses}
          animate-fade-in
        `}
        style={{ animationDelay }}
      >
        <ImageConverterTool />
      </div>
    );
  }

  // Render Speed Test Tool
  if (type === CardType.SPEED_TEST) {
    return (
      <div 
        className={`
          relative group overflow-hidden rounded-2xl
          ${cardBgClass}
          transition-all duration-300
          hover:border-violet-500/30
          flex flex-col
          ${spanClasses}
          animate-fade-in
        `}
        style={{ animationDelay }}
      >
        <SpeedTestTool />
      </div>
    );
  }

  // Render Font Generator Tool
  if (type === CardType.FONT_GENERATOR) {
    return (
      <div 
        className={`
          relative group overflow-hidden rounded-2xl
          ${cardBgClass}
          transition-all duration-300
          hover:border-indigo-500/30
          flex flex-col
          ${spanClasses}
          animate-fade-in
        `}
        style={{ animationDelay }}
      >
        <FontGeneratorTool />
      </div>
    );
  }

  // Render Memento Mori Tool
  if (type === CardType.MEMENTO_MORI) {
    return (
      <div 
        className={`
          relative group overflow-hidden rounded-2xl
          ${cardBgClass}
          transition-all duration-300
          hover:border-white/30
          flex flex-col
          ${spanClasses}
          animate-fade-in
        `}
        style={{ animationDelay }}
      >
        <MementoMoriTool />
      </div>
    );
  }

  // Render Invoice Generator Tool
  if (type === CardType.INVOICE_GENERATOR) {
    return (
      <div 
        className={`
          relative group overflow-hidden rounded-2xl
          ${cardBgClass}
          transition-all duration-300
          hover:border-sky-500/30
          flex flex-col
          ${spanClasses}
          animate-fade-in
        `}
        style={{ animationDelay }}
      >
        <InvoiceGeneratorTool />
      </div>
    );
  }

  // Render Crypto Converter Tool
  if (type === CardType.CRYPTO_CONVERTER) {
    return (
      <div 
        className={`
          relative group overflow-hidden rounded-2xl
          ${cardBgClass}
          transition-all duration-300
          hover:border-amber-500/30
          flex flex-col
          ${spanClasses}
          animate-fade-in
        `}
        style={{ animationDelay }}
      >
        <CryptoConverterTool />
      </div>
    );
  }

  // Render Loan Calculator Tool
  if (type === CardType.LOAN_CALCULATOR) {
    return (
      <div 
        className={`
          relative group overflow-hidden rounded-2xl
          ${cardBgClass}
          transition-all duration-300
          hover:border-violet-500/30
          flex flex-col
          ${spanClasses}
          animate-fade-in
        `}
        style={{ animationDelay }}
      >
        <LoanCalculatorTool />
      </div>
    );
  }

  // Render Hourly Rate Calculator Tool
  if (type === CardType.HOURLY_RATE_CALCULATOR) {
    return (
      <div 
        className={`
          relative group overflow-hidden rounded-2xl
          ${cardBgClass}
          transition-all duration-300
          hover:border-violet-500/30
          flex flex-col
          ${spanClasses}
          animate-fade-in
        `}
        style={{ animationDelay }}
      >
        <HourlyRateCalculatorTool />
      </div>
    );
  }

  // Render Stopwatch Tool
  if (type === CardType.STOPWATCH) {
    return (
      <div 
        className={`
          relative group overflow-hidden rounded-2xl
          ${cardBgClass}
          transition-all duration-300
          hover:border-emerald-500/30
          flex flex-col
          ${spanClasses}
          animate-fade-in
        `}
        style={{ animationDelay }}
      >
        <StopwatchTool />
      </div>
    );
  }

  // Render Click Speed Test Tool
  if (type === CardType.CLICK_SPEED_TEST) {
    return (
      <div 
        className={`
          relative group overflow-hidden rounded-2xl
          ${cardBgClass}
          transition-all duration-300
          hover:border-rose-500/30
          flex flex-col
          ${spanClasses}
          animate-fade-in
        `}
        style={{ animationDelay }}
      >
        <ClickSpeedTestTool />
      </div>
    );
  }

  // Render IMC Calculator Tool
  if (type === CardType.IMC_CALCULATOR) {
    return (
      <div 
        className={`
          relative group overflow-hidden rounded-2xl
          ${cardBgClass}
          transition-all duration-300
          hover:border-violet-500/30
          flex flex-col
          ${spanClasses}
          animate-fade-in
        `}
        style={{ animationDelay }}
      >
        <IMCCalculatorTool />
      </div>
    );
  }

  // Render Timezone Converter Tool
  if (type === CardType.TIMEZONE_CONVERTER) {
    return (
      <div 
        className={`
          relative group overflow-hidden rounded-2xl
          ${cardBgClass}
          transition-all duration-300
          hover:border-blue-500/30
          flex flex-col
          ${spanClasses}
          animate-fade-in
        `}
        style={{ animationDelay }}
      >
        <TimezoneConverterTool />
      </div>
    );
  }

  // Render Barcode Generator Tool
  if (type === CardType.BARCODE_GENERATOR) {
    return (
      <div 
        className={`
          relative group overflow-hidden rounded-2xl
          ${cardBgClass}
          transition-all duration-300
          hover:border-teal-500/30
          flex flex-col
          ${spanClasses}
          animate-fade-in
        `}
        style={{ animationDelay }}
      >
        <BarcodeGeneratorTool />
      </div>
    );
  }

  // Render Signature Generator Tool
  if (type === CardType.SIGNATURE_GENERATOR) {
    return (
      <div 
        className={`
          relative group overflow-hidden rounded-2xl
          ${cardBgClass}
          transition-all duration-300
          hover:border-fuchsia-500/30
          flex flex-col
          ${spanClasses}
          animate-fade-in
        `}
        style={{ animationDelay }}
      >
        <SignatureGeneratorTool />
      </div>
    );
  }

  // Render Synthesizer Tool
  if (type === CardType.SYNTHESIZER) {
    return (
      <div 
        className={`
          relative group overflow-hidden rounded-2xl
          ${cardBgClass}
          transition-all duration-300
          hover:border-rose-500/30
          flex flex-col
          ${spanClasses}
          animate-fade-in
        `}
        style={{ animationDelay }}
      >
        <SynthesizerTool />
      </div>
    );
  }

  // Render IP Finder Tool
  if (type === CardType.IP_FINDER) {
    return (
      <div 
        className={`
          relative group overflow-hidden rounded-2xl
          ${cardBgClass}
          transition-all duration-300
          hover:border-sky-500/30
          flex flex-col
          ${spanClasses}
          animate-fade-in
        `}
        style={{ animationDelay }}
      >
        <IpFinderTool />
      </div>
    );
  }

  // Render Electricity Calculator Tool
  if (type === CardType.ELECTRICITY_CALCULATOR) {
    return (
      <div 
        className={`
          relative group overflow-hidden rounded-2xl
          ${cardBgClass}
          transition-all duration-300
          hover:border-amber-500/30
          flex flex-col
          ${spanClasses}
          animate-fade-in
        `}
        style={{ animationDelay }}
      >
        <ElectricityCalculatorTool />
      </div>
    );
  }

  // Render Password Generator Tool
  if (type === CardType.PASSWORD_GENERATOR) {
    return (
      <div 
        className={`
          relative group overflow-hidden rounded-2xl
          ${cardBgClass}
          transition-all duration-300
          hover:border-violet-500/30
          flex flex-col
          ${spanClasses}
          animate-fade-in
        `}
        style={{ animationDelay }}
      >
        <PasswordGeneratorTool />
      </div>
    );
  }

  // Render NotePad Tool
  if (type === CardType.NOTE_PAD) {
    return (
      <div 
        className={`
          relative group overflow-hidden rounded-2xl
          ${cardBgClass}
          transition-all duration-300
          hover:border-amber-500/30
          flex flex-col
          ${spanClasses}
          animate-fade-in
        `}
        style={{ animationDelay }}
      >
        <NotePadTool />
      </div>
    );
  }

  // Render Weather Tool
  if (type === CardType.WEATHER) {
    return (
      <div 
        className={`
          relative group overflow-hidden rounded-2xl
          ${cardBgClass}
          transition-all duration-300
          hover:border-sky-500/30
          flex flex-col
          ${spanClasses}
          animate-fade-in
        `}
        style={{ animationDelay }}
      >
        <WeatherTool />
      </div>
    );
  }

  // Render Revision Sheet Tool
  if (type === CardType.REVISION_SHEET) {
    return (
      <div 
        className={`
          relative group overflow-hidden rounded-2xl
          ${cardBgClass}
          transition-all duration-300
          hover:border-indigo-500/30
          flex flex-col
          ${spanClasses}
          animate-fade-in
        `}
        style={{ animationDelay }}
      >
        <RevisionSheetTool />
      </div>
    );
  }

  // Render Expense Tracker Tool
  if (type === CardType.EXPENSE_TRACKER) {
    return (
      <div 
        className={`
          relative group overflow-hidden rounded-2xl
          ${cardBgClass}
          transition-all duration-300
          hover:border-violet-500/30
          flex flex-col
          ${spanClasses}
          animate-fade-in
        `}
        style={{ animationDelay }}
      >
        <ExpenseTrackerTool />
      </div>
    );
  }

  // Render Yu-Gi-Oh Binder Tool
  if (type === CardType.YUGIOH_BINDER) {
    return (
      <div 
        className={`
          relative group overflow-hidden rounded-2xl
          ${cardBgClass}
          transition-all duration-300
          hover:border-yellow-500/30
          flex flex-col
          ${spanClasses}
          animate-fade-in
        `}
        style={{ animationDelay }}
      >
        <YugiohBinderTool />
      </div>
    );
  }

  // Render Calculator Tool
  if (type === CardType.CALCULATOR) {
    return (
      <div 
        className={`
          relative group overflow-hidden rounded-2xl
          ${cardBgClass}
          transition-all duration-300
          hover:border-emerald-500/30
          flex flex-col
          ${spanClasses}
          animate-fade-in
        `}
        style={{ animationDelay }}
      >
        <CalculatorTool />
      </div>
    );
  }

  // Render PDF Signature Tool
  if (type === CardType.PDF_SIGNATURE) {
    return (
      <div 
        className={`
          relative group overflow-hidden rounded-2xl
          ${cardBgClass}
          transition-all duration-300
          hover:border-red-500/30
          flex flex-col
          ${spanClasses}
          animate-fade-in
        `}
        style={{ animationDelay }}
      >
        <PdfSignatureTool />
      </div>
    );
  }

  // Render Wiki Assistant Tool
  if (type === CardType.WIKI_ASSISTANT) {
    return (
      <div 
        className={`
          relative group overflow-hidden rounded-2xl
          ${cardBgClass}
          transition-all duration-300
          hover:border-violet-500/30
          flex flex-col
          ${spanClasses}
          animate-fade-in
        `}
        style={{ animationDelay }}
      >
        <WikiAssistantTool />
      </div>
    );
  }

  // Render Tarot Reader Tool
  if (type === CardType.TAROT_READER) {
    return (
      <div 
        className={`
          relative group overflow-hidden rounded-2xl
          ${cardBgClass}
          transition-all duration-300
          hover:border-violet-500/30
          flex flex-col
          ${spanClasses}
          animate-fade-in
        `}
        style={{ animationDelay }}
      >
        <TarotReaderTool />
      </div>
    );
  }

  // Render Impostor Game Tool
  if (type === CardType.IMPOSTOR_GAME) {
    return (
      <div 
        className={`
          relative group overflow-hidden rounded-2xl
          ${cardBgClass}
          transition-all duration-300
          hover:border-violet-500/30
          flex flex-col
          ${spanClasses}
          animate-fade-in
        `}
        style={{ animationDelay }}
      >
        <ImpostorGameTool />
      </div>
    );
  }

  // Render Habit Tracker Tool
  if (type === CardType.HABIT_TRACKER) {
    return (
      <div 
        className={`
          relative group overflow-hidden rounded-2xl
          ${cardBgClass}
          transition-all duration-300
          hover:border-violet-500/30
          flex flex-col
          ${spanClasses}
          animate-fade-in
        `}
        style={{ animationDelay }}
      >
        <HabitTrackerTool />
      </div>
    );
  }

  // Render Watermark Tool
  if (type === CardType.WATERMARK) {
    return (
      <div 
        className={`
          relative group overflow-hidden rounded-2xl
          ${cardBgClass}
          transition-all duration-300
          hover:border-cyan-500/30
          flex flex-col
          ${spanClasses}
          animate-fade-in
        `}
        style={{ animationDelay }}
      >
        <WatermarkTool />
      </div>
    );
  }

  // Render Image To PDF Tool (Replaced Document Scanner)
  if (type === CardType.IMAGE_TO_PDF) {
    return (
      <div 
        className={`
          relative group overflow-hidden rounded-2xl
          ${cardBgClass}
          transition-all duration-300
          hover:border-rose-500/30
          flex flex-col
          ${spanClasses}
          animate-fade-in
        `}
        style={{ animationDelay }}
      >
        <ImageToPdfTool />
      </div>
    );
  }

  return (
    <div 
      className={`
        relative group overflow-hidden rounded-2xl
        ${cardBgClass}
        transition-all duration-300 ease-out
        hover:border-white/20
        flex flex-col
        ${spanClasses}
        animate-fade-in
      `}
      style={{ animationDelay }}
    >
      {/* Subtle Glow Effect on Hover */}
      {accentColor && (
        <div 
          className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-[40px] opacity-0 group-hover:opacity-20 transition-opacity duration-500"
          style={{ backgroundColor: accentColor }}
        />
      )}

      {/* Content Container - Only renders if there is content */}
      {(title || Icon) && (
        <div className="relative z-10 flex flex-col h-full p-4 justify-between">
          <div className="flex justify-between items-start">
             {Icon && <div className="text-zinc-500 group-hover:text-zinc-300 transition-colors"><Icon size={16} /></div>}
          </div>

          <div className="mt-auto">
            {title && (
              <h3 className="text-sm font-semibold text-zinc-300 group-hover:text-white transition-colors truncate">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-xs text-zinc-500 line-clamp-1 hidden group-hover:block transition-all">
                {description}
              </p>
            )}
          </div>
        </div>
      )}
      
      {/* If completely empty, show a very subtle centered indicator on hover */}
      {!title && !Icon && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-10 transition-opacity duration-300">
          <div className="w-1 h-1 rounded-full bg-zinc-700" />
        </div>
      )}
    </div>
  );
};