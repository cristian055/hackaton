'use client';

import Link from 'next/link';
import { UploadCloud, FileText, ArrowRight } from 'lucide-react';
import { Header } from '@/components/header';
import { useState, useEffect } from 'react';

export default function RoleSelectionPage() {
  const [progress, setProgress] = useState(33);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 0.1));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Header variant="role-selection" />
      <main className="flex-grow flex items-center justify-center p-6 relative overflow-hidden bg-surface-muted">
        <div className="max-w-5xl w-full z-10">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-light text-foreground mb-2">Bienvenido al <span className="font-semibold">Portal Logístico</span></h1>
            <p className="text-lg text-foreground-muted max-w-2xl mx-auto">Acceda a las herramientas de gestión documental y control de flota.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[400px]">
            <Link href="/upload" className="group relative bg-white border border-border rounded-2xl overflow-hidden flex flex-col items-center justify-center p-8 hover:border-primary focus:ring-2 focus:ring-primary outline-none transition-all duration-300">
              <div className="mb-6 w-16 h-16 bg-primary-container rounded-2xl flex items-center justify-center text-primary transition-transform duration-500 group-hover:scale-110">
                <UploadCloud className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-light text-foreground mb-2">Cargar <span className="font-semibold">Documentos</span></h2>
              <p className="text-sm text-foreground-muted text-center max-w-xs">Cargue manifiestos, facturas y documentos de carga para su procesamiento.</p>
              <div className="mt-8 flex items-center gap-2 text-primary font-semibold bg-primary-container px-4 py-2 rounded-full">
                <span>Ir a Carga</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            <Link href="/me" className="group relative bg-white border border-border rounded-2xl overflow-hidden flex flex-col items-center justify-center p-8 hover:border-primary focus:ring-2 focus:ring-primary outline-none transition-all duration-300">
              <div className="mb-6 w-16 h-16 bg-primary-container rounded-2xl flex items-center justify-center text-primary transition-transform duration-500 group-hover:scale-110">
                <FileText className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-light text-foreground mb-2">Mis <span className="font-semibold">Documentos</span></h2>
              <p className="text-sm text-foreground-muted text-center max-w-xs">Consulte, revise y gestione los documentos cargados previamente.</p>
              <div className="mt-8 flex items-center gap-2 text-primary font-semibold bg-primary-container px-4 py-2 rounded-full">
                <span>Ir a mi Panel</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </div>
      </main>

      <footer className="h-1 bg-border w-full relative mt-auto">
        <div
          className="absolute left-0 top-0 h-full bg-primary transition-all duration-1000 ease-linear"
          style={{ width: `${progress}%` }}
        ></div>
      </footer>
    </>
  );
}