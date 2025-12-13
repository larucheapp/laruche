import React, { useState, useRef } from 'react';
import { Upload, X, Download, FileType, Loader2, ArrowRight } from 'lucide-react';

interface FormatOption {
  name: string;
  mime: string;
  ext?: string;
}

const FORMATS: FormatOption[] = [
  { name: 'PNG', mime: 'image/png', ext: 'png' },
  { name: 'JPG', mime: 'image/jpeg', ext: 'jpg' },
  { name: 'WEBP', mime: 'image/webp', ext: 'webp' },
  { name: 'GIF', mime: 'image/gif', ext: 'gif' },
  { name: 'ICO', mime: 'image/x-icon', ext: 'ico' },
  { name: 'BMP', mime: 'image/bmp', ext: 'bmp' },
];

export const ImageConverterTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [targetFormat, setTargetFormat] = useState<FormatOption | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          setFile(f);
          setImageElement(img);
          setTargetFormat(null);
        };
        img.src = ev.target?.result as string;
      };
      reader.readAsDataURL(f);
    }
  };

  const createIcoBlob = async (img: HTMLImageElement): Promise<Blob> => {
    const size = 32;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if(!ctx) throw new Error('No context');
    
    ctx.drawImage(img, 0, 0, size, size);

    const pngBlob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
    if(!pngBlob) throw new Error('PNG conversion failed');
    
    const pngBuffer = await pngBlob.arrayBuffer();

    const header = new Uint8Array([0, 0, 1, 0, 1, 0]);
    const dir = new DataView(new ArrayBuffer(16));
    dir.setUint8(0, size);      // Width
    dir.setUint8(1, size);      // Height
    dir.setUint8(2, 0);         // Color Palette
    dir.setUint16(4, 1, true);  // Color Planes
    dir.setUint16(6, 32, true); // Bits per Pixel
    dir.setUint32(8, pngBlob.size, true); // Size of Data
    dir.setUint32(12, 22, true);          // Offset to Data
    
    const icoBuffer = new Uint8Array(22 + pngBuffer.byteLength);
    icoBuffer.set(header, 0);
    icoBuffer.set(new Uint8Array(dir.buffer), 6);
    icoBuffer.set(new Uint8Array(pngBuffer), 22);

    return new Blob([icoBuffer], { type: 'image/x-icon' });
  };

  const handleConvert = async () => {
    if (!file || !imageElement || !targetFormat) return;
    setIsProcessing(true);

    try {
      let blob: Blob | null = null;
      let fileName = file.name.substring(0, file.name.lastIndexOf('.'));
      const ext = targetFormat.ext || targetFormat.name.toLowerCase();

      if (targetFormat.mime === 'image/svg+xml') {
        const dataURL = imageElement.src;
        const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${imageElement.naturalWidth}" height="${imageElement.naturalHeight}"><image href="${dataURL}" width="100%" height="100%" /></svg>`;
        blob = new Blob([svgContent], { type: 'image/svg+xml' });
      } else if (targetFormat.mime === 'image/x-icon') {
        blob = await createIcoBlob(imageElement);
      } else {
        const canvas = document.createElement('canvas');
        canvas.width = imageElement.naturalWidth;
        canvas.height = imageElement.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
           if (targetFormat.mime === 'image/jpeg' || targetFormat.mime === 'image/bmp') {
                ctx.fillStyle = '#fff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            ctx.drawImage(imageElement, 0, 0);
            blob = await new Promise(resolve => canvas.toBlob(resolve, targetFormat.mime, 0.95));
        }
      }

      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
      }

    } catch (e) {
      console.error(e);
      alert('Échec de la conversion');
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setImageElement(null);
    setTargetFormat(null);
    if(fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full h-full flex flex-col p-3 relative">
       {/* Header */}
       <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-orange-400">
          <FileType size={18} />
          <h2 className="text-xs font-bold uppercase tracking-wider">Convertisseur</h2>
        </div>
        {(file) && (
          <button onClick={reset} className="text-zinc-500 hover:text-white transition-colors">
            <X size={16} />
          </button>
        )}
      </div>

      <div className="flex-1 min-h-0 flex flex-col items-center justify-center">
        {!file ? (
            <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-full rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 flex flex-col items-center justify-center gap-3 cursor-pointer group hover:border-orange-500/50 hover:bg-zinc-900/80 transition-all"
            >
                <div className="p-3 rounded-full bg-zinc-800 group-hover:bg-zinc-700 transition-colors">
                    <Upload size={20} className="text-zinc-400 group-hover:text-orange-400" />
                </div>
                <span className="text-xs font-medium text-zinc-500 group-hover:text-zinc-300">Choisir Image</span>
                <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
            </div>
        ) : (
            <div className="w-full flex flex-col gap-3">
                {/* File Info */}
                <div className="flex items-center gap-3 bg-zinc-800/50 p-2 rounded-lg border border-zinc-700/50">
                    <div className="w-10 h-10 bg-black/40 rounded flex items-center justify-center shrink-0">
                       {imageElement && <img src={imageElement.src} className="w-full h-full object-contain" />}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-white truncate">{file.name}</p>
                        <p className="text-[10px] text-zinc-500">{(file.size/1024).toFixed(1)} KB</p>
                    </div>
                </div>

                {/* Format Selection Grid */}
                <div>
                    <label className="text-[10px] font-bold text-zinc-500 mb-2 block uppercase tracking-wider text-center">Convertir en</label>
                    <div className="grid grid-cols-3 gap-1.5">
                        {FORMATS.map(fmt => (
                            <button
                                key={fmt.name}
                                onClick={() => setTargetFormat(fmt)}
                                className={`
                                    py-1.5 text-[10px] font-bold rounded border transition-all
                                    ${targetFormat?.name === fmt.name 
                                        ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-900/30' 
                                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:border-zinc-700'}
                                `}
                            >
                                {fmt.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={handleConvert}
                    disabled={!targetFormat || isProcessing}
                    className="w-full h-9 mt-1 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-900/20 active:scale-95"
                >
                    {isProcessing ? (
                        <>
                            <Loader2 size={14} className="animate-spin" />
                            Conversion...
                        </>
                    ) : (
                        <>
                            <Download size={14} />
                            Télécharger {targetFormat ? targetFormat.name : ''}
                        </>
                    )}
                </button>
            </div>
        )}
      </div>
    </div>
  );
};