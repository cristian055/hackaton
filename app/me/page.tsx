'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  FileText,
  FileImage,
  FileSpreadsheet,
  File as FileIcon,
  ChevronDown,
  ChevronRight,
  Trash2,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Header } from '@/components/header';
import {
  deleteDocument,
  getRole,
  listDocuments,
  subscribe,
  type DocumentRecord,
  type DocumentStatus,
  type Role,
} from '@/lib/store';

const STATUS_LABEL: Record<DocumentStatus, string> = {
  upload: 'Subido',
  processing: 'Procesado',
};

const STATUS_CLASSES: Record<DocumentStatus, string> = {
  upload: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  processing: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
};

function iconForType(type: string) {
  if (type.startsWith('image/')) return FileImage;
  if (type.includes('spreadsheet') || type.includes('excel') || type === 'text/csv') return FileSpreadsheet;
  if (type.includes('pdf') || type.includes('text')) return FileText;
  return FileIcon;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfWeek(d: Date): Date {
  const day = d.getDay();
  const diff = (day + 6) % 7;
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - diff);
  return start;
}

type Group = 'Hoy' | 'Esta semana' | 'Anterior';

function groupOf(uploadedAt: string): Group {
  const d = new Date(uploadedAt);
  const now = new Date();
  if (isSameDay(d, now)) return 'Hoy';
  const weekStart = startOfWeek(now);
  if (d.getTime() >= weekStart.getTime()) return 'Esta semana';
  return 'Anterior';
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

function roleLabel(role: Role): string {
  return role === 'conductor' ? 'Conductor' : 'Personal';
}

function MePageInner() {
  const searchParams = useSearchParams();
  const highlightId = searchParams?.get('highlight') ?? null;

  const [docs, setDocs] = useState<DocumentRecord[]>(() => listDocuments());
  const [role, setRoleState] = useState<Role>(() => getRole());
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const highlightRef = useRef<HTMLLIElement | null>(null);

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      setDocs(listDocuments());
      setRoleState(getRole());
    });
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!highlightId) return;
    const t = setTimeout(() => {
      highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 80);
    return () => clearTimeout(t);
  }, [highlightId, docs]);

  const stats = useMemo(() => {
    const total = docs.length;
    let processing = 0;
    for (const d of docs) {
      if (d.status === 'processing') processing += 1;
    }
    return { total, processing };
  }, [docs]);

  const grouped = useMemo(() => {
    const out: Record<Group, DocumentRecord[]> = { Hoy: [], 'Esta semana': [], Anterior: [] };
    for (const d of docs) {
      out[groupOf(d.uploadedAt)].push(d);
    }
    return out;
  }, [docs]);

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDelete = (doc: DocumentRecord) => {
    if (doc.status === 'processing') {
      const ok = typeof window !== 'undefined'
        ? window.confirm(`¿Eliminar el documento procesado "${doc.fileName}"? Esta acción no se puede deshacer.`)
        : true;
      if (!ok) return;
    } else {
      const ok = typeof window !== 'undefined'
        ? window.confirm(`¿Eliminar "${doc.fileName}"?`)
        : true;
      if (!ok) return;
    }
    deleteDocument(doc.id);
  };

  const groupOrder: Group[] = ['Hoy', 'Esta semana', 'Anterior'];

  return (
    <>
      <Header variant="me" />
      <main className="flex-grow bg-background px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#141417] p-6 sm:p-10">
            <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-600/15 blur-[120px] pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-indigo-500/10 blur-[120px] pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 font-semibold text-xl">
                  JP
                </div>
                <div>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Perfil</span>
                  <h1 className="text-2xl sm:text-3xl font-light text-white mt-1">
                    Juan <span className="font-semibold">Pérez</span>
                  </h1>
                  <p className="text-xs text-on-surface-variant mt-1 uppercase tracking-widest">
                    ID 12.345.678 · {roleLabel(role)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white transition-colors text-[12px] font-semibold uppercase tracking-widest"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver
                </Link>
                <Link
                  href="/upload"
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white transition-colors text-[12px] font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                >
                  <UploadCloud className="w-4 h-4" />
                  Subir documento
                </Link>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard
              icon={<FileText className="w-5 h-5 text-indigo-400" />}
              label="Total"
              value={stats.total}
              accent="indigo"
            />
            <StatCard
              icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              label="Procesados"
              value={stats.processing}
              accent="emerald"
            />
          </section>

          <section className="space-y-8">
            {docs.length === 0 ? (
              <div className="rounded-[32px] border border-white/10 bg-[#141417] p-10 text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-light text-white">
                  Aún no tenés <span className="font-semibold">documentos</span>
                </h2>
                <p className="text-sm text-on-surface-variant max-w-md mx-auto">
                  Subí tu primera factura o remito para empezar a gestionarlos desde acá.
                </p>
                <Link
                  href="/upload"
                  className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-[12px] font-bold uppercase tracking-widest"
                >
                  <UploadCloud className="w-4 h-4" />
                  Subir mi primer documento
                </Link>
              </div>
            ) : (
              groupOrder.map((group) => {
                const list = grouped[group];
                if (list.length === 0) return null;
                return (
                  <div key={group} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <h2 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                        {group}
                      </h2>
                      <div className="h-px flex-1 bg-white/10" />
                      <span className="text-[10px] font-semibold text-on-surface-variant">
                        {list.length}
                      </span>
                    </div>
                    <ul className="space-y-3">
                      {list.map((doc) => {
                        const Icon = iconForType(doc.fileType);
                        const isExpanded = !!expanded[doc.id];
                        const isHighlighted = highlightId === doc.id;
                        const showRef = isHighlighted ? highlightRef : null;
                        return (
                          <li
                            key={doc.id}
                            ref={showRef}
                            className={`rounded-2xl border bg-[#141417] transition-all ${
                              isHighlighted
                                ? 'border-indigo-500/60 ring-2 ring-indigo-500/40 shadow-[0_0_30px_rgba(99,102,241,0.25)]'
                                : 'border-white/10 hover:border-white/20'
                            }`}
                          >
                            <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                              <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 flex-shrink-0">
                                <Icon className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-mono text-sm text-white truncate">{doc.fileName}</p>
                                <p className="text-[11px] text-on-surface-variant mt-1">
                                  {formatDate(doc.uploadedAt)} · {formatTime(doc.uploadedAt)}
                                </p>
                              </div>
                              <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                                <span
                                  className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${STATUS_CLASSES[doc.status]}`}
                                >
                                  {STATUS_LABEL[doc.status]}
                                </span>
                                <Link
                                  href={`/review?doc=${encodeURIComponent(doc.id)}`}
                                  className="h-9 px-4 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 text-[11px] font-semibold uppercase tracking-widest flex items-center gap-1"
                                >
                                  Revisar
                                </Link>
                                <button
                                  onClick={() => toggleExpanded(doc.id)}
                                  aria-label={isExpanded ? 'Ocultar detalle' : 'Ver detalle'}
                                  className="h-9 w-9 rounded-full bg-white/5 border border-white/10 text-on-surface-variant hover:bg-white/10 hover:text-white flex items-center justify-center"
                                >
                                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                </button>
                                <button
                                  onClick={() => handleDelete(doc)}
                                  aria-label="Eliminar documento"
                                  className="h-9 w-9 rounded-full bg-error/10 border border-error/30 text-error hover:bg-error/20 flex items-center justify-center"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            {isExpanded && (
                              <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-white/5">
                                <Preview doc={doc} />
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })
            )}
          </section>
        </div>
      </main>
    </>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent: 'indigo' | 'emerald' | 'amber';
}) {
  const accentRing: Record<typeof accent, string> = {
    indigo: 'from-indigo-500/20',
    emerald: 'from-emerald-500/20',
    amber: 'from-amber-500/20',
  };
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#141417] p-5">
      <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${accentRing[accent]} to-transparent blur-2xl pointer-events-none`} />
      <div className="relative z-10 flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{label}</p>
          <p className="text-2xl font-semibold text-white mt-1">{value}</p>
        </div>
      </div>
    </div>
  );
}

function Preview({ doc }: { doc: DocumentRecord }) {
  if (!doc.extracted) {
    return (
      <div className="pt-4 flex items-start gap-3 text-xs text-on-surface-variant">
        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p>Este documento aún no tiene datos extraídos. Abrilo en revisión para procesarlo.</p>
      </div>
    );
  }
  const e = doc.extracted;
  return (
    <dl className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
      <PreviewRow label="Fecha de Emisión" value={e.fecha} />
      <PreviewRow label="N° Factura" value={e.nroFactura} mono />
      <PreviewRow label="Proveedor" value={e.proveedor} />
      <PreviewRow label="CUIT" value={e.cuit} mono />
      <PreviewRow label="NIT" value={e.nit} mono />
      <PreviewRow label="Dirección" value={e.direccion} />
      <PreviewRow label="Teléfono" value={e.telefono} mono />
      <PreviewRow label="Departamento" value={e.departamento} />
      <PreviewRow label="Municipio" value={e.municipio} />
      <PreviewRow label="Monto Total" value={e.monto} mono />
      <PreviewRow label="Kilometraje" value={e.kilometraje} mono />
      <PreviewRow label="IVA 19% Base" value={e.iva19Base} mono />
      <PreviewRow label="IVA 19% Valor" value={e.iva19Valor} mono />
      <PreviewRow label="IVA 5% Base" value={e.iva5Base} mono />
      <PreviewRow label="IVA 5% Valor" value={e.iva5Valor} mono />
      <PreviewRow label="IVA 0% Base" value={e.iva0Base} mono />
      <PreviewRow label="IVA 0% Valor" value={e.iva0Valor} mono />
      <PreviewRow label="Total Factura" value={e.totalFactura} mono />
      {doc.ceco ? <PreviewRow label="CECO" value={doc.ceco} mono /> : null}
    </dl>
  );
}

function PreviewRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col">
      <dt className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{label}</dt>
      <dd className={`mt-1 text-white ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  );
}

export default function MePage() {
  return (
    <Suspense fallback={<MeFallback />}>
      <MePageInner />
    </Suspense>
  );
}

function MeFallback() {
  return (
    <>
      <Header variant="me" />
      <main className="flex-grow bg-background px-6 py-12">
        <div className="max-w-5xl mx-auto text-center text-on-surface-variant text-sm">
          Cargando perfil…
        </div>
      </main>
    </>
  );
}