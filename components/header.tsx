import Link from 'next/link';
import Image from 'next/image';
import { Bell, HelpCircle, Edit, ArrowLeft } from 'lucide-react';

interface HeaderProps {
  variant?: 'role-selection' | 'upload' | 'review' | 'me';
}

export function Header({ variant = 'role-selection' }: HeaderProps) {
  return (
    <header className="bg-transparent border-b border-white/10 flex justify-between items-center w-full px-6 h-16 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <Link href="/" className="font-bold text-xl text-white flex items-center">
          LogiFlow Docs
        </Link>

        {variant === 'me' && (
          <Link
            href="/"
            className="hidden md:inline-flex items-center gap-2 text-on-surface-variant hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-[12px] font-semibold uppercase tracking-widest">Volver</span>
          </Link>
        )}

        {variant === 'role-selection' && (
          <>
            <div className="hidden md:flex h-8 w-px bg-outline-variant mx-2"></div>
            <div className="hidden md:flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">Empleado</span>
                <span className="text-sm font-semibold text-on-surface">Juan Pérez</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">Cédula</span>
                <span className="text-sm font-semibold text-on-surface">12.345.678</span>
              </div>
            </div>
          </>
        )}

        {variant === 'upload' && (
          <div className="hidden md:flex items-center h-8 px-4 bg-white/5 border border-white/10 rounded-full ml-6">
            <Edit className="w-4 h-4 text-outline mr-2" />
            <span className="text-[12px] font-semibold text-on-surface-variant mr-1">CECO:</span>
            <input
              id="logiflow-upload-ceco"
              className="bg-transparent border-none focus:ring-0 font-mono text-sm text-primary p-0 w-32 outline-none"
              spellCheck="false"
              type="text"
              defaultValue="7040-LOG-OPS"
            />
          </div>
        )}
        
        {variant === 'review' && (
           <>
            <div className="hidden md:flex h-8 w-px bg-outline-variant mx-2"></div>
            <div className="hidden md:flex flex-col">
              <span className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">OPERADOR</span>
              <span className="text-sm font-bold">Juan Pérez <span className="font-normal opacity-70">(ID: 12.345.678)</span></span>
            </div>
           </>
        )}
      </div>

      <div className="flex items-center gap-6">
        {variant === 'role-selection' && (
          <div className="relative flex flex-col hidden md:flex">
            <label className="text-[10px] font-semibold text-on-surface-variant absolute -top-2 left-2 px-1 bg-[#09090B]" htmlFor="ceco-input">CECO</label>
            <input 
              className="bg-transparent border border-white/10 bg-white/5 rounded-full px-4 py-1 font-mono text-sm text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all w-32 outline-none" 
              id="ceco-input" 
              type="text" 
              defaultValue="700-OP-24"
            />
          </div>
        )}

        {variant === 'upload' && (
          <div className="flex flex-col items-end mr-4 hidden md:flex">
            <span className="text-[12px] font-bold text-on-surface">Juan Pérez</span>
            <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">ID: 12.345.678</span>
          </div>
        )}

        {variant === 'me' && (
          <div className="flex flex-col items-end mr-4 hidden md:flex">
            <span className="text-[12px] font-bold text-on-surface">Juan Pérez</span>
            <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">ID: 12.345.678</span>
          </div>
        )}

        {variant === 'review' && (
          <div className="flex flex-col items-end hidden md:flex">
            <label className="text-[12px] font-semibold text-on-surface-variant" htmlFor="ceco-edit">CECO</label>
            <div className="flex items-center gap-1">
              <input 
                className="bg-transparent border-none p-0 text-sm font-bold text-primary text-right focus:ring-0 focus:border-b focus:border-primary w-24 outline-none" 
                id="ceco-edit" 
                type="text" 
                defaultValue="AR-992-LOG"
              />
              <Edit className="w-3 h-3 opacity-40" />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant relative">
            <Bell className="w-5 h-5" />
            {variant === 'review' && <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>}
          </button>
          <button className="p-2 rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant">
            <HelpCircle className="w-5 h-5" />
          </button>
          <Link href="/me" className="w-9 h-9 rounded-full border border-outline-variant overflow-hidden ml-2 bg-primary-container flex items-center justify-center">
             <Image
               src="https://picsum.photos/seed/user/100/100"
               alt="User profile"
               width={36}
               height={36}
               className="w-full h-full object-cover"
               referrerPolicy="no-referrer"
             />
          </Link>
        </div>
      </div>
    </header>
  );
}
