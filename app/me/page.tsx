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
  Wallet,
  CheckCircle,
} from 'lucide-react';
import { Header } from '@/components/header';
import { InvoicePreview } from '@/components/invoice-preview';
import {
  deleteDocument,
  getActiveLegalization,
  getLegalizationTotal,
  getRole,
  listDocuments,
  listLegalizations,
  parseAmount,
  submitLegalization,
  subscribe,
  type DocumentRecord,
  type DocumentStatus,
  type Legalization,
  type LegalizationStatus,
  type Role,
} from '@/lib/store';

const STATUS_LABEL: Record<DocumentStatus, string> = {
  upload: 'Subido',
  processing: 'Procesado',
};

const STATUS_CLASSES: Record<DocumentStatus, string> = {
  upload: 'bg-alert text-on-alert border-alert',
  processing: 'bg-help text-on-help border-help',
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

function formatCurrencyARS(n: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2,
  }).format(n);
}

function MePageInner() {
  const searchParams = useSearchParams();
  const highlightId = searchParams?.get('highlight') ?? null;

  const [docs, setDocs] = useState<DocumentRecord[]>(() => listDocuments());
  const [role, setRoleState] = useState<Role>(() => getRole());
  const [active, setActive] = useState<Legalization | undefined>(() => getActiveLegalization());
  const [submitted, setSubmitted] = useState<Legalization[]>(() =>
    listLegalizations().filter((l) => l.status === 'submitted'),
  );
  const [showSubmittedToast, setShowSubmittedToast] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const highlightRef = useRef<HTMLLIElement | null>(null);

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      setDocs(listDocuments());
      setRoleState(getRole());
      setActive(getActiveLegalization());
      setSubmitted(listLegalizations().filter((l) => l.status === 'submitted'));
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
    let gastos = 0;
    for (const d of docs) {
      if (d.status === 'processing') {
        processing += 1;
        gastos += parseAmount(d.extracted?.totalFactura);
      }
    }
    return { total, processing, gastos };
  }, [docs]);

  const draft = useMemo<Legalization | undefined>(() => {
    // `active` is referenced here so this memo recomputes whenever subscribe
    // refreshes it (e.g., after submit or orphan migration).
    void active;
    return listLegalizations().find((l) => l.status === 'draft');
  }, [active]);

  const visibleDocs = useMemo(() => {
    if (!draft) return [];
    const inActive = new Set(draft.expenseIds);
    const all = listLegalizations();
    const allExpenseIds = new Set<string>();
    for (const l of all) {
      for (const id of l.expenseIds) allExpenseIds.add(id);
    }
    const orphans = docs.filter((d) => !allExpenseIds.has(d.id));
    const inAct = docs.filter((d) => inActive.has(d.id));
    return [...orphans, ...inAct];
  }, [docs, draft]);

  const grouped = useMemo(() => {
    const out: Record<Group, DocumentRecord[]> = { Hoy: [], 'Esta semana': [], Anterior: [] };
    for (const d of visibleDocs) {
      out[groupOf(d.uploadedAt)].push(d);
    }
    return out;
  }, [visibleDocs]);

  const totalInLegalization = draft?.expenseIds.length ?? 0;
  const confirmedCount = useMemo(() => {
    if (!draft) return 0;
    const inActive = new Set(draft.expenseIds);
    return docs.filter((d) => inActive.has(d.id) && d.status === 'processing').length;
  }, [docs, draft]);

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

  const handleSubmitLegalization = () => {
    if (!draft) return;
    const updated = submitLegalization(draft.id);
    if (updated && updated.status === 'submitted') {
      setShowSubmittedToast(true);
      setTimeout(() => setShowSubmittedToast(false), 3000);
    }
  };

  const groupOrder: Group[] = ['Hoy', 'Esta semana', 'Anterior'];

  return (
    <>
      <Header variant="me" />
      <main className="flex-grow bg-surface-muted px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          <section className="relative overflow-hidden rounded-2xl border border-border bg-white p-6 sm:p-10">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary-container border border-border flex items-center justify-center text-primary font-semibold text-xl">
                  JP
                </div>
                <div>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Perfil</span>
                  <h1 className="text-2xl sm:text-3xl font-light text-foreground mt-1">
                    Juan <span className="font-semibold">Pérez</span>
                  </h1>
                  <p className="text-xs text-foreground-muted mt-1 uppercase tracking-widest">
                    ID 12.345.678 · {roleLabel(role)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-white border border-border text-foreground hover:bg-surface-muted transition-colors text-[12px] font-semibold uppercase tracking-widest"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver
                </Link>
                <Link
                  href="/upload"
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-colors text-[12px] font-bold uppercase tracking-widest"
                >
                  <UploadCloud className="w-4 h-4" />
                  Cargar gastos
                </Link>
              </div>
            </div>
          </section>

          {draft ? (
            <ActiveLegalizationCard
              draft={draft}
              confirmedCount={confirmedCount}
              totalInLegalization={totalInLegalization}
              onSubmit={handleSubmitLegalization}
            />
          ) : (
            <EmptyLegalizationCard />
          )}

          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              icon={<FileText className="w-5 h-5 text-primary" />}
              label="Total"
              value={stats.total}
              accent="primary"
            />
            <StatCard
              icon={<CheckCircle2 className="w-5 h-5 text-help" />}
              label="Procesados"
              value={stats.processing}
              accent="help"
            />
            <StatCard
              icon={<Wallet className="w-5 h-5 text-primary" />}
              label="Total de la legalización"
              value={formatCurrencyARS(stats.gastos)}
              accent="primary"
            />
          </section>

          {submitted.length > 0 ? <SubmittedLegalizationsList items={submitted} /> : null}

          <section
            className="space-y-8"
            style={{ '--me-actions-col': '18rem' } as React.CSSProperties}
          >
            {visibleDocs.length === 0 ? (
              <div className="rounded-2xl border border-border bg-white p-10 text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-primary-container border border-border flex items-center justify-center text-primary">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-light text-foreground">
                  Aún no tenés <span className="font-semibold">documentos</span>
                </h2>
                <p className="text-sm text-foreground-muted max-w-md mx-auto">
                  Subí tu primera factura o remito para empezar a gestionarlos desde acá.
                </p>
                <Link
                  href="/upload"
                  className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-primary text-primary-foreground hover:opacity-90 text-[12px] font-bold uppercase tracking-widest"
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
                      <h2 className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest">
                        {group}
                      </h2>
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-[10px] font-semibold text-foreground-muted">
                        {list.length}
                      </span>
                    </div>

                    <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_var(--me-actions-col)] gap-4 px-5 pb-2 text-[10px] font-bold text-foreground-muted uppercase tracking-widest">
                      <span>Documento</span>
                      <span>Fecha de subida</span>
                      <span>NIT</span>
                      <span>Valor</span>
                      <span aria-hidden="true"></span>
                    </div>

                    <ul className="space-y-3">
                      {list.map((doc) => {
                        const Icon = iconForType(doc.fileType);
                        const isExpanded = !!expanded[doc.id];
                        const isHighlighted = highlightId === doc.id;
                        const showRef = isHighlighted ? highlightRef : null;
                        const nit = doc.extracted?.nit ?? '—';
                        const valor = doc.extracted?.totalFactura ?? '—';
                        return (
                          <li
                            key={doc.id}
                            ref={showRef}
                            className={`rounded-2xl border bg-white transition-all ${
                              isHighlighted
                                ? 'border-primary ring-2 ring-primary/40 shadow-[0_0_30px_rgba(219,0,97,0.18)]'
                                : 'border-border hover:border-primary/60'
                            }`}
                          >
                            <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr_var(--me-actions-col)] gap-x-4 gap-y-3 sm:items-center">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-11 h-11 rounded-xl bg-primary-container border border-border flex items-center justify-center text-primary flex-shrink-0">
                                  <Icon className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-mono text-sm text-foreground truncate">{doc.fileName}</p>
                                  <p className="text-[11px] text-foreground-muted mt-1 sm:hidden">
                                    {formatDate(doc.uploadedAt)} · {formatTime(doc.uploadedAt)}
                                  </p>
                                </div>
                              </div>

                              <div className="hidden sm:block text-[11px] text-foreground-muted">
                                <p>{formatDate(doc.uploadedAt)}</p>
                                <p className="text-foreground-muted/70 mt-0.5">{formatTime(doc.uploadedAt)}</p>
                              </div>

                              <div className="text-xs">
                                <span className="sm:hidden text-[10px] font-bold uppercase tracking-widest text-foreground-muted mr-2">NIT</span>
                                <span className="font-mono text-foreground">{nit}</span>
                                {doc.ceco ? (
                                  <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-foreground-muted sm:ml-2">
                                    <span className="sm:hidden">CECO</span>
                                    <span className={`font-mono normal-case tracking-normal text-foreground ${doc.ceco ? '' : 'text-foreground-muted'}`}>{doc.ceco}</span>
                                  </span>
                                ) : null}
                              </div>

                              <div className="text-xs">
                                <span className="sm:hidden text-[10px] font-bold uppercase tracking-widest text-foreground-muted mr-2">Valor</span>
                                <span className="font-mono text-foreground">{valor}</span>
                              </div>

                              <div className="flex items-center gap-2 sm:justify-end flex-wrap sm:flex-nowrap">
                                <span
                                  className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${STATUS_CLASSES[doc.status]}`}
                                >
                                  {STATUS_LABEL[doc.status]}
                                </span>
                                <Link
                                  href={`/review?doc=${encodeURIComponent(doc.id)}`}
                                  className="h-9 px-4 rounded-full bg-white border border-border text-foreground hover:bg-surface-muted text-[11px] font-semibold uppercase tracking-widest flex items-center gap-1"
                                >
                                  Revisar
                                </Link>
                                <button
                                  onClick={() => toggleExpanded(doc.id)}
                                  aria-label={isExpanded ? 'Ocultar detalle' : 'Ver detalle'}
                                  className="h-9 w-9 rounded-full bg-white border border-border text-foreground-muted hover:bg-surface-muted hover:text-foreground flex items-center justify-center"
                                >
                                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                </button>
                                <button
                                  onClick={() => handleDelete(doc)}
                                  aria-label="Eliminar documento"
                                  className="h-9 w-9 rounded-full bg-primary-container border border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground flex items-center justify-center"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            {isExpanded && (
                              <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-border">
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

      <div
        className={`fixed left-1/2 -translate-x-1/2 bg-help text-primary-foreground px-8 py-4 rounded-full shadow-[0_8px_24px_rgba(48,48,48,0.14)] flex items-center gap-4 transition-all duration-500 pointer-events-none z-[100]
          ${showSubmittedToast ? 'opacity-100 bottom-8' : 'opacity-0 bottom-5'}
        `}
      >
        <CheckCircle className="w-6 h-6 text-primary-foreground" />
        <span className="text-sm">Legalización enviada a aprobación</span>
      </div>
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
  value: number | string;
  accent: 'primary' | 'help';
}) {
  const accentRing: Record<typeof accent, string> = {
    primary: 'from-primary/15',
    help: 'from-help/15',
  };
  const isAmount = typeof value === 'string';
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-white p-5">
      <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${accentRing[accent]} to-transparent blur-2xl pointer-events-none`} />
      <div className="relative z-10 flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-primary-container border border-border flex items-center justify-center">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest">{label}</p>
          <p className={`mt-1 font-semibold text-foreground ${isAmount ? 'text-xl truncate' : 'text-2xl'}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}

function Preview({ doc }: { doc: DocumentRecord }) {
  if (!doc.extracted) {
    return (
      <div className="pt-4 flex items-start gap-3 text-xs text-foreground-muted">
        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p>Este documento aún no tiene datos extraídos. Abrilo en revisión para procesarlo.</p>
      </div>
    );
  }
  const e = doc.extracted;
  return (
    <div className="pt-4 space-y-4">
      <InvoicePreview fields={e} fileName={doc.fileName} />
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
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
    </div>
  );
}

function PreviewRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col">
      <dt className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest">{label}</dt>
      <dd className={`mt-1 text-foreground ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  );
}

function ActiveLegalizationCard({
  draft,
  confirmedCount,
  totalInLegalization,
  onSubmit,
}: {
  draft: Legalization;
  confirmedCount: number;
  totalInLegalization: number;
  onSubmit: () => void;
}) {
  const total = getLegalizationTotal(draft.id);
  const canSubmit = confirmedCount > 0;
  const caption = `${confirmedCount} gasto${confirmedCount === 1 ? '' : 's'} confirmado${confirmedCount === 1 ? '' : 's'} de ${totalInLegalization} en la legalización`;
  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-white p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Legalización activa</span>
          <h2 className="text-2xl sm:text-3xl font-light text-foreground mt-1">
            <span className="font-semibold">{draft.period}</span>
          </h2>
        </div>
        <LegalizationStatusChip status={draft.status} />
      </div>
      <div className="mt-6 sm:mt-8">
        <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest">Total consolidado</p>
        <p className="text-3xl sm:text-4xl font-light text-foreground mt-2">
          {formatCurrencyARS(total)}
        </p>
        <p className="text-sm text-foreground-muted mt-2">{caption}</p>
      </div>
      <button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit}
        className={`mt-6 w-full h-12 rounded-full bg-primary text-primary-foreground text-[12px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-opacity ${canSubmit ? 'hover:opacity-90' : 'opacity-30 cursor-not-allowed'}`}
      >
        Enviar a aprobación
      </button>
    </section>
  );
}

function LegalizationStatusChip({ status }: { status: LegalizationStatus }) {
  if (status === 'draft') {
    return (
      <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border bg-alert text-on-alert border-alert">
        Borrador
      </span>
    );
  }
  return (
    <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border bg-help text-on-help border-help">
      En aprobación
    </span>
  );
}

function EmptyLegalizationCard() {
  return (
    <section className="rounded-2xl border border-border bg-white p-10 text-center space-y-4">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-primary-container border border-border flex items-center justify-center text-primary">
        <UploadCloud className="w-7 h-7" />
      </div>
      <h2 className="text-xl font-light text-foreground">
        Aún no tenés una <span className="font-semibold">legalización activa</span>
      </h2>
      <p className="text-sm text-foreground-muted max-w-md mx-auto">
        Subí tu primera factura para iniciar una nueva legalización
      </p>
      <Link
        href="/upload"
        className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-primary text-primary-foreground hover:opacity-90 text-[12px] font-bold uppercase tracking-widest"
      >
        <UploadCloud className="w-4 h-4" />
        Subir mi primer documento
      </Link>
    </section>
  );
}

function SubmittedLegalizationsList({ items }: { items: Legalization[] }) {
  const sorted = useMemo(
    () =>
      items.slice().sort((a, b) => {
        const ta = a.submittedAt ? new Date(a.submittedAt).getTime() : new Date(a.createdAt).getTime();
        const tb = b.submittedAt ? new Date(b.submittedAt).getTime() : new Date(b.createdAt).getTime();
        return tb - ta;
      }),
    [items],
  );
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3">
        <h2 className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest">Legalizaciones enviadas</h2>
        <div className="h-px flex-1 bg-border" />
        <span className="text-[10px] font-semibold text-foreground-muted">{sorted.length}</span>
      </div>
      <ul className="space-y-3">
        {sorted.map((l) => {
          const total = getLegalizationTotal(l.id);
          const submittedAt = l.submittedAt ?? l.createdAt;
          return (
            <li
              key={l.id}
              className="rounded-2xl border border-border bg-white p-4 sm:p-5 flex items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{l.period}</p>
                <p className="text-[11px] text-foreground-muted mt-1">
                  {formatDate(submittedAt)} · {formatTime(submittedAt)}
                </p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border bg-help text-on-help border-help flex-shrink-0">
                En aprobación
              </span>
              <span className="text-sm font-mono text-foreground flex-shrink-0">
                {formatCurrencyARS(total)}
              </span>
              <ChevronRight className="w-4 h-4 text-foreground-muted flex-shrink-0" aria-hidden="true" />
            </li>
          );
        })}
      </ul>
    </section>
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
      <main className="flex-grow bg-surface-muted px-6 py-12">
        <div className="max-w-5xl mx-auto text-center text-foreground-muted text-sm">
          Cargando perfil…
        </div>
      </main>
    </>
  );
}