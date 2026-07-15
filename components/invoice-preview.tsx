import type { ExtractedFields } from '@/lib/store';

interface InvoicePreviewProps {
  fields: ExtractedFields;
  fileName?: string;
}

export function InvoicePreview({ fields, fileName }: InvoicePreviewProps) {
  const nroFactura = fields.nroFactura || '0001-00002834';
  const monto = fields.monto || '559.625,00';
  return (
    <div className="flex-1 flex items-center justify-center p-8 overflow-auto bg-surface-muted">
      <div className="bg-white shadow-[0_8px_24px_rgba(48,48,48,0.14)] w-full max-w-2xl aspect-[1/1.41] p-8 flex flex-col gap-6 border border-border text-[#191c1e]">
        <div className="flex justify-between items-start border-b border-border pb-4">
          <div className="space-y-2">
            <div className="h-8 w-32 bg-neutral rounded"></div>
            <div className="h-4 w-48 bg-surface-muted rounded"></div>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg">FACTURA</p>
            <p className="text-foreground-muted">N° {nroFactura}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="h-3 w-full bg-surface-muted rounded"></div>
            <div className="h-3 w-3/4 bg-surface-muted rounded"></div>
            <div className="h-3 w-5/6 bg-surface-muted rounded"></div>
          </div>
          <div className="space-y-4">
            <div className="h-3 w-full bg-surface-muted rounded"></div>
            <div className="h-3 w-3/4 bg-surface-muted rounded"></div>
            <div className="h-3 w-5/6 bg-surface-muted rounded"></div>
          </div>
        </div>
        <div className="flex-1 border-y border-border py-4 mt-8">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-2">DESCRIPCIÓN</th>
                <th className="pb-2 text-right">CANT.</th>
                <th className="pb-2 text-right">SUBTOTAL</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-surface-muted">
                <td className="py-2">Servicio Flete Larga Distancia</td>
                <td className="py-2 text-right">1</td>
                <td className="py-2 text-right">$450.000,00</td>
              </tr>
              <tr className="border-b border-surface-muted">
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
            <div className="flex justify-between border-t border-border pt-2"><span className="font-bold">TOTAL:</span><span className="font-bold font-mono text-[13px]">${monto}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
