import Link from 'next/link';
import Image from 'next/image';
import { Bell, HelpCircle, ArrowLeft } from 'lucide-react';

interface HeaderProps {
  variant?: 'role-selection' | 'upload' | 'review' | 'me';
}

export function Header({ variant = 'role-selection' }: HeaderProps) {
  return (
    <header className="bg-white border-b border-border flex justify-between items-center w-full px-6 h-16 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center">
          <Image
            src="/comfama-logo.svg"
            alt="Comfama"
            width={143}
            height={24}
            priority
          />
        </Link>

        {variant === 'me' && (
          <Link
            href="/"
            className="hidden md:inline-flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-[12px] font-semibold uppercase tracking-widest">Volver</span>
          </Link>
        )}

        {variant === 'role-selection' && (
          <>
            <div className="hidden md:flex h-8 w-px bg-outline mx-2"></div>
            <div className="hidden md:flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[12px] font-semibold text-foreground-muted uppercase tracking-wider">Empleado</span>
                <span className="text-sm font-semibold text-foreground">Juan Pérez</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-semibold text-foreground-muted uppercase tracking-wider">Cédula</span>
                <span className="text-sm font-semibold text-foreground">12.345.678</span>
              </div>
            </div>
          </>
        )}

        {variant === 'review' && (
           <>
            <div className="hidden md:flex h-8 w-px bg-outline mx-2"></div>
            <div className="hidden md:flex flex-col">
              <span className="text-[12px] font-semibold text-foreground-muted uppercase tracking-wider">OPERADOR</span>
              <span className="text-sm font-bold text-foreground">Juan Pérez <span className="font-normal opacity-70">(ID: 12.345.678)</span></span>
            </div>
           </>
        )}
      </div>

      <div className="flex items-center gap-6">
        {variant === 'role-selection' && (
          <div className="relative flex flex-col hidden md:flex">
            <label className="text-[10px] font-semibold text-foreground-muted absolute -top-2 left-2 px-1 bg-white" htmlFor="ceco-input">CECO</label>
            <input
              className="bg-surface-muted border border-border rounded-full px-4 py-1 font-mono text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all w-32 outline-none tracking-wider"
              id="ceco-input"
              type="text"
              defaultValue="700-OP-24"
            />
          </div>
        )}

        {variant === 'upload' && (
          <div className="flex flex-col items-end mr-4 hidden md:flex">
            <span className="text-[12px] font-bold text-foreground">Juan Pérez</span>
            <span className="text-[10px] font-semibold text-foreground-muted uppercase tracking-wider">ID: 12.345.678</span>
          </div>
        )}

        {variant === 'me' && (
          <div className="flex flex-col items-end mr-4 hidden md:flex">
            <span className="text-[12px] font-bold text-foreground">Juan Pérez</span>
            <span className="text-[10px] font-semibold text-foreground-muted uppercase tracking-wider">ID: 12.345.678</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-surface-muted transition-colors text-foreground-muted relative">
            <Bell className="w-5 h-5" />
            {variant === 'review' && <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>}
          </button>
          <button className="p-2 rounded-full hover:bg-surface-muted transition-colors text-foreground-muted">
            <HelpCircle className="w-5 h-5" />
          </button>
          <Link href="/me" className="w-9 h-9 rounded-full border border-outline overflow-hidden ml-2 bg-surface-muted flex items-center justify-center">
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