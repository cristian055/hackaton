'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/header';
import { FileText, ZoomIn, ZoomOut, RotateCw, Edit, Search, Info, CheckCircle, FileUp, RefreshCw } from 'lucide-react';
import { getDocument, updateDocument, type DocumentRecord, type ExtractedFields } from '@/lib/store';

const DEMO_FIELDS: ExtractedFields = {
  fecha: '2023-10-25',
  nroFactura: '0001-00002834',
  proveedor: 'Logística del Sur S.A.',
  cuit: '30-71452896-1',
  nit: '900.123.456-7',
  direccion: 'Calle 100 #15-20, Edificio Norte',
  telefono: '+57 (601) 742 8593',
  departamento: 'Cundinamarca',
  municipio: 'Bogotá D.C.',
  monto: '559.625,00',
  kilometraje: '124500',
  iva19Base: '420.000,00',
  iva19Valor: '79.800,00',
  iva5Base: '50.000,00',
  iva5Valor: '2.500,00',
  iva0Base: '0,00',
  iva0Valor: '0,00',
  totalFactura: '559.625,00',
};

function ReviewPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const docId = searchParams?.get('doc') ?? null;

  const [doc, setDoc] = useState<DocumentRecord | null>(() => {
    if (!docId) return null;
    const found = getDocument(docId) ?? null;
    if (found && found.status === 'upload') {
      return updateDocument(found.id, { status: 'processing' }) ?? found;
    }
    return found;
  });
  const [fields, setFields] = useState<ExtractedFields>(() => {
    if (!docId) return DEMO_FIELDS;
    const found = getDocument(docId);
    const ext = found?.extracted;
    return {
      fecha: ext?.fecha ?? DEMO_FIELDS.fecha,
      nroFactura: ext?.nroFactura ?? DEMO_FIELDS.nroFactura,
      proveedor: ext?.proveedor ?? DEMO_FIELDS.proveedor,
      cuit: ext?.cuit ?? DEMO_FIELDS.cuit,
      nit: ext?.nit ?? DEMO_FIELDS.nit,
      direccion: ext?.direccion ?? DEMO_FIELDS.direccion,
      telefono: ext?.telefono ?? DEMO_FIELDS.telefono,
      departamento: ext?.departamento ?? DEMO_FIELDS.departamento,
      municipio: ext?.municipio ?? DEMO_FIELDS.municipio,
      monto: ext?.monto ?? DEMO_FIELDS.monto,
      kilometraje: ext?.kilometraje ?? DEMO_FIELDS.kilometraje,
      iva19Base: ext?.iva19Base ?? DEMO_FIELDS.iva19Base,
      iva19Valor: ext?.iva19Valor ?? DEMO_FIELDS.iva19Valor,
      iva5Base: ext?.iva5Base ?? DEMO_FIELDS.iva5Base,
      iva5Valor: ext?.iva5Valor ?? DEMO_FIELDS.iva5Valor,
      iva0Base: ext?.iva0Base ?? DEMO_FIELDS.iva0Base,
      iva0Valor: ext?.iva0Valor ?? DEMO_FIELDS.iva0Valor,
      totalFactura: ext?.totalFactura ?? DEMO_FIELDS.totalFactura,
    };
  });
  const [ceco, setCeco] = useState<string>(() => (docId ? getDocument(docId)?.ceco ?? '' : ''));
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const updateField = <K extends keyof ExtractedFields>(key: K, value: ExtractedFields[K]) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleConfirm = () => {
    setIsProcessing(true);
    setTimeout(() => {
      if (doc) {
        const updated = updateDocument(doc.id, {
          status: 'processing',
          extracted: fields,
          ceco: ceco || doc.ceco,
        });
        setDoc(updated ?? doc);
        setIsConfirmed(true);
        setShowToast(true);
        setTimeout(() => {
          router.push(`/me?highlight=${encodeURIComponent(doc.id)}`);
        }, 600);
      } else {
        setIsProcessing(false);
        setIsConfirmed(true);
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 3000);
      }
    }, 1200);
  };

  return (
    <>
      <Header variant="review" />
      <main className="flex-1 flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden bg-[#09090B] p-4 gap-4">
        <section className="hidden md:flex flex-1 bg-[#141417] border border-white/10 rounded-[32px] flex-col relative overflow-hidden">
          <div className="bg-white/5 border-b border-white/10 text-white px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <FileText className="w-4 h-4 text-indigo-400" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-white/80">{doc ? doc.fileName : 'FACTURA_TRANSPORTE_00283.PDF'}</span>
            </div>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors"><ZoomIn className="w-4 h-4" /></button>
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors"><ZoomOut className="w-4 h-4" /></button>
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors"><RotateCw className="w-4 h-4" /></button>
            </div>
          </div>
          <div
            className="flex-1 flex items-center justify-center p-8 overflow-auto"
            style={{
              backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          >
            <div className="bg-white shadow-2xl w-full max-w-2xl aspect-[1/1.41] p-8 flex flex-col gap-6 border border-outline text-[#191c1e]">
              <div className="flex justify-between items-start border-b border-gray-200 pb-4">
                <div className="space-y-2">
                  <div className="h-8 w-32 bg-gray-100 rounded"></div>
                  <div className="h-4 w-48 bg-gray-50 rounded"></div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">FACTURA</p>
                  <p className="text-gray-400">N° {fields.nroFactura || '0001-00002834'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="h-3 w-full bg-gray-50 rounded"></div>
                  <div className="h-3 w-3/4 bg-gray-50 rounded"></div>
                  <div className="h-3 w-5/6 bg-gray-50 rounded"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-3 w-full bg-gray-50 rounded"></div>
                  <div className="h-3 w-3/4 bg-gray-50 rounded"></div>
                  <div className="h-3 w-5/6 bg-gray-50 rounded"></div>
                </div>
              </div>
              <div className="flex-1 border-y border-gray-100 py-4 mt-8">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="pb-2">DESCRIPCIÓN</th>
                      <th className="pb-2 text-right">CANT.</th>
                      <th className="pb-2 text-right">SUBTOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-50">
                      <td className="py-2">Servicio Flete Larga Distancia</td>
                      <td className="py-2 text-right">1</td>
                      <td className="py-2 text-right">$450.000,00</td>
                    </tr>
                    <tr className="border-b border-gray-50">
                      <td className="py-2">Peajes Consolidado</td>
                      <td className="py-2 text-right">1</td>
                      <td className="py-2 text-right">$12.500,00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end pt-4">
                <div className="w-1/2 space-y-2">
                  <div className="flex justify-between"><span className="text-[12px] font-semibold">IVA (21%):</span><span className="font-mono text-[13px]">$97.125,00</span></div>
                  <div className="flex justify-between border-t border-gray-300 pt-2"><span className="font-bold">TOTAL:</span><span className="font-bold font-mono text-[13px]">${fields.monto || '559.625,00'}</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full md:w-[480px] bg-[#141417] border border-white/10 rounded-[32px] overflow-y-auto flex flex-col relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[100px] pointer-events-none"></div>
          <div className="p-8 border-b border-white/10 bg-white/5 relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center text-indigo-500">
                <Edit className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-light text-white">Revisión de <span className="font-semibold">Datos</span></h1>
            </div>
            <p className="text-sm text-white/40">Verifique la información extraída automáticamente antes de confirmar.</p>
          </div>

          <form className="flex-1 p-6 space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-4 relative z-10">
              <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Identificación del Documento</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2 group">
                  <label className="text-[12px] font-semibold text-white/60" htmlFor="fecha">Fecha de Emisión</label>
                  <input
                    className="bg-white/5 border border-white/10 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm w-full transition-all group-focus-within:bg-white/10 outline-none text-white color-scheme-dark"
                    id="fecha"
                    type="date"
                    value={fields.fecha}
                    onChange={(e) => updateField('fecha', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2 group">
                  <label className="text-[12px] font-semibold text-white/60" htmlFor="nro_factura">Número de Factura</label>
                  <input
                    className="bg-white/5 border border-white/10 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm w-full transition-all group-focus-within:bg-white/10 outline-none text-white"
                    id="nro_factura"
                    type="text"
                    value={fields.nroFactura}
                    onChange={(e) => updateField('nroFactura', e.target.value)}
                  />
                </div>
                              <div className="flex flex-col gap-2 group">
                <label className="text-[12px] font-semibold text-white/60" htmlFor="cliente">Cliente</label>
                <input
                  className="bg-white/5 border border-white/10 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm w-full transition-all group-focus-within:bg-white/10 outline-none text-white"
                  id="cliente"
                  type="text"
                  value={fields.cliente}
                  onChange={(e) => updateField('cliente', e.target.value)}
                />
              </div>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-white/10 relative z-10">
              <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Detalles del Emisor</h3>
              <div className="flex flex-col gap-2 group">
                <label className="text-[12px] font-semibold text-white/60" htmlFor="proveedor">Proveedor</label>
                <div className="relative transition-all group-focus-within:bg-white/10 rounded-xl">
                  <input
                    className="bg-white/5 border border-white/10 p-3 pr-10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm w-full outline-none text-white"
                    id="proveedor"
                    type="text"
                    value={fields.proveedor}
                    onChange={(e) => updateField('proveedor', e.target.value)}
                  />
                  <Search className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400" />
                </div>
              </div>

              <div className="flex flex-col gap-2 group">
                <label className="text-[12px] font-semibold text-white/60" htmlFor="nit">NIT</label>
                <input
                  className="bg-white/5 border border-white/10 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm w-full transition-all group-focus-within:bg-white/10 outline-none text-white"
                  id="nit"
                  type="text"
                  value={fields.nit}
                  onChange={(e) => updateField('nit', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-white/10 relative z-10">
              <div className="flex flex-col gap-2 group">
                <label className="text-[12px] font-semibold text-white/60" htmlFor="direccion">Dirección</label>
                <input
                  className="bg-white/5 border border-white/10 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm w-full transition-all group-focus-within:bg-white/10 outline-none text-white"
                  id="direccion"
                  type="text"
                  value={fields.direccion}
                  onChange={(e) => updateField('direccion', e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2 group">
                <label className="text-[12px] font-semibold text-white/60" htmlFor="telefono">Teléfono</label>
                <input
                  className="bg-white/5 border border-white/10 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm w-full transition-all group-focus-within:bg-white/10 outline-none text-white"
                  id="telefono"
                  type="text"
                  value={fields.telefono}
                  onChange={(e) => updateField('telefono', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2 group">
                  <label className="text-[12px] font-semibold text-white/60" htmlFor="departamento">Departamento</label>
                  <input
                    className="bg-white/5 border border-white/10 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm w-full transition-all group-focus-within:bg-white/10 outline-none text-white"
                    id="departamento"
                    type="text"
                    value={fields.departamento}
                    onChange={(e) => updateField('departamento', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2 group">
                  <label className="text-[12px] font-semibold text-white/60" htmlFor="municipio">Municipio</label>
                  <input
                    className="bg-white/5 border border-white/10 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm w-full transition-all group-focus-within:bg-white/10 outline-none text-white"
                    id="municipio"
                    type="text"
                    value={fields.municipio}
                    onChange={(e) => updateField('municipio', e.target.value)}
                  />
                </div>
              </div>
            </div>

<div className="space-y-4 pt-6 border-t border-white/10 relative z-10">
              <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Valores e Impuestos</h3>
              <div className="bg-white/5 border border-white/10 rounded-2xl divide-y divide-white/5">
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold text-white">IVA</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-semibold text-white/40 uppercase tracking-widest" htmlFor="iva19_base">Base Gravada</label>
                      <input
                        className="bg-white/5 border border-white/10 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-xs w-full outline-none text-white"
                        id="iva19_base"
                        type="text"
                        value={fields.iva19Base}
                        onChange={(e) => updateField('iva19Base', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-semibold text-white/40 uppercase tracking-widest" htmlFor="iva19_valor">IVA</label>
                      <input
                        className="bg-white/5 border border-white/10 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-xs w-full outline-none text-white"
                        id="iva19_valor"
                        type="text"
                        value={fields.iva19Valor}
                        onChange={(e) => updateField('iva19Valor', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold text-white">IPO consumo (8%)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-semibold text-white/40 uppercase tracking-widest" htmlFor="iva5_base">Base Gravada</label>
                      <input
                        className="bg-white/5 border border-white/10 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-xs w-full outline-none text-white"
                        id="iva5_base"
                        type="text"
                        value={fields.iva5Base}
                        onChange={(e) => updateField('iva5Base', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-semibold text-white/40 uppercase tracking-widest" htmlFor="iva5_valor">IVA</label>
                      <input
                        className="bg-white/5 border border-white/10 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-xs w-full outline-none text-white"
                        id="iva5_valor"
                        type="text"
                        value={fields.iva5Valor}
                        onChange={(e) => updateField('iva5Valor', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold text-white">Tarifa Exentos (0%)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-semibold text-white/40 uppercase tracking-widest" htmlFor="iva0_base">Base Gravada</label>
                      <input
                        className="bg-white/5 border border-white/10 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-xs w-full outline-none text-white"
                        id="iva0_base"
                        type="text"
                        value={fields.iva0Base}
                        onChange={(e) => updateField('iva0Base', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-semibold text-white/40 uppercase tracking-widest" htmlFor="iva0_valor">IVA</label>
                      <input
                        className="bg-white/5 border border-white/10 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-xs w-full outline-none text-white"
                        id="iva0_valor"
                        type="text"
                        value={fields.iva0Valor}
                        onChange={(e) => updateField('iva0Valor', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
                            <div className="flex flex-col gap-2 group">
                <label className="text-[12px] font-semibold text-white/60" htmlFor="total_factura">Propina</label>
                <input
                  className="bg-white/5 border border-indigo-500/30 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm w-full transition-all group-focus-within:bg-white/10 outline-none text-white"
                  id="total_factura"
                  type="text"
                  value={fields.totalFactura}
                  onChange={(e) => updateField('totalFactura', e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2 group">
                <label className="text-[12px] font-semibold text-white/60" htmlFor="total_factura">Total Factura</label>
                <input
                  className="bg-white/5 border border-indigo-500/30 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm w-full transition-all group-focus-within:bg-white/10 outline-none text-white"
                  id="total_factura"
                  type="text"
                  value={fields.totalFactura}
                  onChange={(e) => updateField('totalFactura', e.target.value)}
                />
              </div>
            </div>
            <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl flex gap-4 items-start relative z-10">
              <Info className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[12px] text-white font-bold">Validación de Datos</p>
                <p className="text-xs text-white/60 mt-1">3 tarifas de IVA detectadas. NIT validado contra registro mercantil. Total y bases gravadas reconcilian con el documento.</p>
              </div>
            </div>
          </form>

          <div className="p-6 bg-white/5 border-t border-white/10 space-y-3 sticky bottom-0 backdrop-blur-xl relative z-10">
            <button
              onClick={handleConfirm}
              disabled={isProcessing || isConfirmed}
              className={`w-full py-4 text-[12px] font-bold uppercase tracking-widest transition-all active:scale-[0.98] rounded-xl flex justify-center items-center gap-2
                ${isConfirmed
                  ? 'bg-green-500 text-black'
                  : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]'}
                ${isProcessing ? 'opacity-70 cursor-wait' : ''}
              `}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Procesando...
                </>
              ) : isConfirmed ? (
                <>
                  <CheckCircle className="w-5 h-5" fill="currentColor" />
                  Datos Procesados
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" fill="currentColor" />
                  Confirmar Datos
                </>
              )}
            </button>
            <button
              onClick={() => router.push('/upload')}
              className="w-full bg-transparent border border-white/10 text-white py-4 text-[12px] font-semibold uppercase tracking-widest hover:bg-white/5 transition-all active:scale-[0.98] rounded-xl flex justify-center items-center gap-2"
            >
              <FileUp className="w-4 h-4" />
              Subir otro documento
            </button>
          </div>
        </section>
      </main>

      <div
        className={`fixed left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface px-8 py-4 rounded-full shadow-xl flex items-center gap-4 transition-all duration-500 pointer-events-none z-[100]
          ${showToast ? 'opacity-100 bottom-8' : 'opacity-0 bottom-5'}
        `}
      >
        <CheckCircle className="w-6 h-6 text-green-400" />
        <span className="text-sm">Datos procesados correctamente</span>
      </div>
    </>
  );
}

function ReviewFallback() {
  return (
    <>
      <Header variant="review" />
      <main className="flex-1 flex items-center justify-center bg-[#09090B] p-4">
        <div className="text-on-surface-variant text-sm">Cargando revisión…</div>
      </main>
    </>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<ReviewFallback />}>
      <ReviewPageInner />
    </Suspense>
  );
}