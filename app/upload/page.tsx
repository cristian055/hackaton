'use client';

import { Header } from '@/components/header';
import { UploadCloud, FileText, Image as ImageIcon, Info, ShieldCheck, XCircle, ArrowRight, X } from 'lucide-react';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleContinue = () => {
    setIsProcessing(true);
    setTimeout(() => {
      router.push('/review');
    }, 1500);
  };

  return (
    <>
      <Header variant="upload" />
      <main className="flex-grow pt-8 pb-32 px-6 flex flex-col items-center justify-center bg-background">
        <div className="w-full max-w-4xl space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold text-primary">Extracción de Documentos</h1>
            <p className="text-base text-secondary">Suba los documentos para la extracción de datos</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div 
              className={`md:col-span-3 h-96 border rounded-[32px] bg-[#141417] flex flex-col items-center justify-center transition-all duration-300 relative group cursor-pointer overflow-hidden ${
                isDragging ? 'border-indigo-500 bg-white/5' : (file ? 'border-indigo-500' : 'border-white/10 hover:border-indigo-400')
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !file && fileInputRef.current?.click()}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[100px] pointer-events-none"></div>
              
              {!file ? (
                <>
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 text-indigo-500">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-light text-white mb-1">Arrastre y <span className="font-semibold">Suelte</span></h3>
                  <p className="text-sm text-white/40 text-center px-8 max-w-md mt-2">
                    Seleccione archivos de su ordenador o arrástrelos directamente a esta zona para comenzar el procesamiento industrial.
                  </p>
                </>
              ) : (
                <div className="w-full max-w-md px-6 z-10" onClick={(e) => e.stopPropagation()}>
                  <div className="bg-surface-container-low border border-outline-variant rounded p-2 flex items-center gap-4">
                    <FileText className="w-6 h-6 text-primary" />
                    <span className="font-mono text-sm flex-grow truncate text-on-surface">{file.name}</span>
                    <button 
                      onClick={() => setFile(null)}
                      className="text-error hover:bg-error-container p-1 rounded transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                accept=".pdf,.jpg,.png" 
                onChange={handleFileChange} 
              />
            </div>

            <div className="md:col-span-1 flex flex-col gap-4">
              <div className="p-6 bg-[#141417] border border-white/10 rounded-[32px] flex-1">
                <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Formatos Soportados</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-indigo-400" />
                    </div>
                    <span className="font-mono text-sm text-white">PDF (Standard)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center">
                      <ImageIcon className="w-5 h-5 text-white/60" />
                    </div>
                    <span className="font-mono text-sm text-white">JPG / PNG</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-indigo-600 text-white rounded-[32px]">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-5 h-5 text-primary" />
                  <h4 className="text-[12px] font-semibold uppercase">Instrucciones</h4>
                </div>
                <ul className="text-[12px] leading-tight space-y-1 opacity-80">
                  <li>• Asegúrese de que el texto sea legible.</li>
                  <li>• Evite sombras o reflejos en fotos.</li>
                  <li>• Tamaño máximo por archivo: 25MB.</li>
                </ul>
              </div>

              <div className="h-32 rounded-[32px] overflow-hidden relative border border-white/10">
                <div 
                  className="absolute inset-0 bg-cover bg-center" 
                  style={{ backgroundImage: 'url("https://picsum.photos/seed/industrial/400/200")' }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-2 left-2">
                  <span className="text-[10px] text-white font-semibold uppercase tracking-widest opacity-80">Industrial AI Engine</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-4xl bg-[#141417]/80 backdrop-blur-xl border border-white/10 h-20 flex items-center justify-center px-6 z-50 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div className="w-full flex items-center justify-between">
          <div className="hidden md:flex items-center gap-2 text-white/60">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <span className="text-[12px] font-semibold uppercase tracking-widest">Cifrado de extremo a extremo</span>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <button className="flex-1 md:flex-none h-12 px-8 text-[12px] font-semibold bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors rounded-full flex items-center justify-center gap-2">
              <XCircle className="w-4 h-4" />
              CANCELAR
            </button>
            <button 
              disabled={!file || isProcessing}
              onClick={handleContinue}
              className="flex-1 md:flex-none h-12 px-8 text-[12px] font-bold bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all rounded-full flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </>
              ) : (
                <>
                  Continuar
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </footer>
    </>
  );
}
