'use client';

import { Header } from '@/components/header';
import { UploadCloud, FileText, ShieldCheck, XCircle, ArrowRight, X, Camera } from 'lucide-react';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { addDocument, getRole } from '@/lib/store';

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [ceco, setCeco] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

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
    if (!file) return;
    setIsProcessing(true);
    setTimeout(() => {
      const role = getRole();
      const trimmedCeco = ceco.trim();
      const record = addDocument({
        fileName: file.name,
        fileType: file.type || 'application/octet-stream',
        fileSize: file.size,
        role,
        status: 'upload',
        ...(trimmedCeco ? { ceco: trimmedCeco } : {}),
      });
      router.push(`/review?doc=${encodeURIComponent(record.id)}`);
    }, 1500);
  };

  return (
    <>
      <Header variant="upload" />
      <main className="flex-grow pt-8 pb-32 px-6 flex flex-col items-center justify-center bg-surface-muted">
        <div className="w-full max-w-4xl space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold text-primary">Carga de gastos</h1>
            <p className="text-base text-foreground-muted">Realizar la carga individual de facturas para iniciar el proceso de legalización</p>
          </div>

          <div className={`h-[480px] border rounded-2xl bg-white flex flex-col items-center justify-center transition-all duration-300 relative group cursor-pointer overflow-hidden border-border hover:border-primary ${
            isDragging ? '!border-primary !bg-primary-container' : (file ? '!border-primary' : '')
          }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !file && fileInputRef.current?.click()}
          >
            <div
              className="absolute top-0 left-0 right-0 z-20 px-6 pt-5 pb-3 flex items-center gap-3 bg-white/80 backdrop-blur-sm border-b border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <label
                htmlFor="logiflow-upload-ceco"
                className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest whitespace-nowrap"
              >
                Centro de costo (CECO)
              </label>
              <input
                id="logiflow-upload-ceco"
                className="flex-1 bg-white border border-border rounded-md px-3 py-2 font-mono text-sm text-foreground focus:ring-2 focus:ring-help focus:border-help transition-all outline-none tracking-wider"
                spellCheck="false"
                type="text"
                value={ceco}
                onChange={(e) => setCeco(e.target.value)}
              />
            </div>
            {!file ? (
              <div className="flex flex-col items-center text-center px-6 z-10" onClick={(e) => e.stopPropagation()}>
                <div className="w-16 h-16 bg-primary-container rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 text-primary">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-light text-foreground mb-1">Arrastre y <span className="font-semibold">Suelte</span></h3>
                <p className="text-sm text-foreground-muted max-w-md mt-2">
                  Seleccione archivos de su ordenador o arrástrelos directamente a esta zona para comenzar el procesamiento industrial.
                </p>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full bg-primary text-primary-foreground text-[12px] font-bold uppercase tracking-widest hover:opacity-90 transition-colors"
                  >
                    <UploadCloud className="w-4 h-4" />
                    Seleccionar archivo
                  </button>
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full bg-white border border-primary text-primary text-[12px] font-bold uppercase tracking-widest hover:bg-primary-container transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    Tomar foto
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-md px-6 z-10" onClick={(e) => e.stopPropagation()}>
                <div className="bg-surface-muted border border-outline rounded-md p-3 flex items-center gap-4">
                  <FileText className="w-6 h-6 text-primary" />
                  <span className="font-mono text-sm flex-grow truncate text-foreground">{file.name}</span>
                  <button
                    onClick={() => setFile(null)}
                    className="text-error hover:bg-primary-container p-1 rounded transition-colors"
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
            <input
              type="file"
              className="hidden"
              ref={cameraInputRef}
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
            />
          </div>
        </div>
      </main>

      <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-4xl bg-white border border-border h-20 flex items-center justify-center px-6 z-50 rounded-full shadow-[0_8px_24px_rgba(48,48,48,0.14)]">
        <div className="w-full flex items-center justify-end">
          <div className="flex gap-4 w-full md:w-auto">
            <button className="flex-1 md:flex-none h-12 px-8 text-[12px] font-semibold bg-white border border-border text-foreground hover:bg-surface-muted transition-colors rounded-full flex items-center justify-center gap-2">
              <XCircle className="w-4 h-4" />
              CANCELAR
            </button>
            <button
              disabled={!file || isProcessing}
              onClick={handleContinue}
              className="flex-1 md:flex-none h-12 px-8 text-[12px] font-bold bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all rounded-full flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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