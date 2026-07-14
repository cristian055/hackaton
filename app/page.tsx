'use client';

import Link from 'next/link';
import { Truck, ShieldAlert, ArrowRight } from 'lucide-react';
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
      <main className="flex-grow flex items-center justify-center p-6 relative overflow-hidden bg-background">
        <div className="max-w-5xl w-full z-10">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-light text-white mb-2">Bienvenido al <span className="font-semibold">Portal Logístico</span></h1>
            <p className="text-lg text-white/40 max-w-2xl mx-auto">Seleccione su perfil de acceso para comenzar con la gestión de documentos y control de flota.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[400px]">
            <Link href="/upload" className="group relative bg-[#141417] border border-white/10 rounded-[32px] overflow-hidden flex flex-col items-center justify-center p-8 hover:border-primary focus:ring-2 focus:ring-primary outline-none transition-all duration-300">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[100px] pointer-events-none"></div>
              <div className="mb-6 w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-indigo-500 transition-transform duration-500 group-hover:scale-110">
                <Truck className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-light text-white mb-2">Ingresar como <span className="font-semibold">Conductor</span></h2>
              <p className="text-sm text-white/60 text-center max-w-xs">Gestione sus rutas, manifiestos de carga y estados de entrega en tiempo real.</p>
              <div className="mt-8 flex items-center gap-2 text-indigo-400 font-semibold bg-white/5 px-4 py-2 rounded-full">
                <span>Acceder al Panel de Flota</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            <Link href="/upload" className="group relative bg-[#141417] border border-white/10 rounded-[32px] overflow-hidden flex flex-col items-center justify-center p-8 hover:border-primary focus:ring-2 focus:ring-primary outline-none transition-all duration-300">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[100px] pointer-events-none"></div>
              <div className="mb-6 w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-indigo-500 transition-transform duration-500 group-hover:scale-110">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-light text-white mb-2">Ingresar como <span className="font-semibold">Personal</span></h2>
              <p className="text-sm text-white/60 text-center max-w-xs">Supervisión de operaciones, control administrativo y gestión documental centralizada.</p>
              <div className="mt-8 flex items-center gap-2 text-indigo-400 font-semibold bg-white/5 px-4 py-2 rounded-full">
                <span>Acceder al Panel Admin</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </div>
      </main>

      <footer className="h-1 bg-surface-container-highest w-full relative mt-auto">
        <div 
          className="absolute left-0 top-0 h-full bg-primary transition-all duration-1000 ease-linear" 
          style={{ width: `${progress}%` }}
        ></div>
      </footer>
    </>
  );
}
