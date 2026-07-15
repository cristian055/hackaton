# HU-0006 — Legalización: carga de soportes, edición y envío a aprobación

> Issue: [`#4`](https://github.com/cristian055/hackaton/issues/4) · PR: [`#10`](https://github.com/cristian055/hackaton/pull/10) · Commits: `c4b0e36`, `623b3c8`
>
> Pantalla base del módulo de legalización. Captura, edición y envío a aprobación. Las validaciones de bloqueo (HU-0007/8/9) y el despacho a Gestor SAP (HU-0011) se aplican por separado.

---

## Historia de usuario (verbatim del issue #4)

**Como** usuario que realiza gastos recurrentes y debe legalizarlos
**Quiero** contar con una pantalla para cargar/adjuntar soportes (facturas, RUT o cuenta de cobro), previsualizarlos, ajustar datos precargados, asociar centro de costo, ver el total y enviar a aprobación
**Para** consolidar mis gastos a legalizar en un solo lugar, tener control de la información y completar el proceso para revisión del Gestor SAP

---

## Escenarios de aceptación

| # | Escenario | Estado | Implementación |
|---|---|---|---|
| 1 | Adjuntar soportes del gasto | ✅ | `app/upload/page.tsx` — dropzone + botón cámara (`capture="environment"`), persiste vía `addDocument`. |
| 2 | Previsualizar soportes cargados | ✅ | `components/invoice-preview.tsx` — facsimile sintético extraído de `/review` y reutilizado en la fila expandida de `app/me/page.tsx`. |
| 3 | Editar información precargada de la factura | ✅ | `app/review/page.tsx` — formulario por campo, `updateField` guarda en estado local, `handleConfirm` persiste vía `updateDocument({ extracted: fields, status: 'processing' })`. |
| 4 | Eliminar soportes cargados | ✅ | `app/me/page.tsx` — botón papelera con `window.confirm` para `processing`, llama `deleteDocument` (que excluye del total al recalcular). |
| 5 | Asignar centro de costo por gasto | ✅ | Input dedicado en `app/upload/page.tsx` (encabezado del dropzone) y en `app/review/page.tsx` (al final del formulario). Estado React (`useState`), persistido por `setDocumentCeco`. Chip visible en cada fila de `app/me/page.tsx`. **Eliminado el hack anterior de `document.getElementById` desde el header.** |
| 6 | Visualizar total consolidado de facturas | ✅ | `ActiveLegalizationCard` en `app/me/page.tsx` muestra el total vía `getLegalizationTotal(draft.id)`, suma `parseAmount(doc.extracted?.totalFactura)` para todos los gastos del borrador. |
| 7 | Enviar la legalización a aprobación | ✅ | Botón primario "Enviar a aprobación" en `ActiveLegalizationCard` → `submitLegalization(id)` → `status='submitted'` + `submittedAt`. Toast de confirmación. La legalización enviada pasa a `SubmittedLegalizationsList`. |

---

## Fuera de alcance (intacto, como pide el issue)

- Reglas de validación de duplicados / límite de consumo / 5 días hábiles → **HU-0007, HU-0008, HU-0009**.
- Flujo de aprobación hacia Gestor SAP → **HU-0011**.
- Pantalla de historial → **HU-0010**.

---

## Modelo de datos

### `Legalization` (nuevo, en `lib/store.ts`)

```ts
type LegalizationStatus = 'draft' | 'submitted';

interface Legalization {
  id: string;
  period: string;              // p. ej. "Julio 2026"
  status: LegalizationStatus;
  expenseIds: string[];        // ids de DocumentRecord
  createdAt: string;           // ISO
  submittedAt?: string;        // ISO, presente solo cuando status='submitted'
}
```

- Persistencia: `localStorage['logiflow.legalizations.v1']`.
- Misma API pub/sub que `DocumentRecord`: `subscribe(fn)` notifica a `/me` cuando se crea, muta o envía una legalización.

### `DocumentRecord` (existente, sin cambios de forma)

- Campo `ceco?: string` se mantiene y se edita vía la nueva `setDocumentCeco(id, ceco)`.

### API nueva del store (`lib/store.ts`)

| Función | Comportamiento |
|---|---|
| `listLegalizations()` | Lista ordenada por `createdAt` descendente. |
| `getLegalization(id)` | Lectura por id. |
| `getOrCreateDraftLegalization()` | Devuelve el borrador actual o crea uno con `period = currentMonthLabel()`. Siempre hay a lo sumo un borrador. |
| `getActiveLegalization()` | Devuelve el borrador; si no hay, el último enviado; si no hay ninguno y existen documentos, migra los huérfanos a un borrador nuevo (una sola vez post-despliegue). |
| `addExpenseToLegalization(legId, docId)` | Idempotente. No hace nada si el doc ya está en `expenseIds`. |
| `submitLegalization(id)` | `status='submitted'` + `submittedAt`. Refusa si `expenseIds` está vacío. No-op si ya estaba enviada. |
| `getLegalizationTotal(id)` | Suma `parseAmount(doc.extracted?.totalFactura)` de cada gasto. |
| `currentMonthLabel()` | Etiqueta en español (`"Julio 2026"`). |

Helpers auxiliares: `parseAmount` se levantó desde `app/me/page.tsx` al store y se reusa (sin cambio de comportamiento).

---

## Comportamiento clave

- **Un borrador activo a la vez.** `getOrCreateDraftLegalization` garantiza el invariante.
- **Auto-attach.** Cada `addDocument` en `/upload` va seguido de `addExpenseToLegalization` para que el gasto quede dentro del borrador sin acción extra del usuario.
- **Migración de huérfanos.** Si al desplegar esta HU ya existían documentos previos (sin legalización asociada), la primera lectura crea un borrador con todos ellos, notifica a `/me` y la UI los absorbe sin perder datos. Una sola vez.
- **Elegibilidad de envío.** El botón "Enviar a aprobación" se deshabilita mientras no haya al menos un gasto con `status === 'processing'`. La defensa en el store (`submitLegalization` devuelve `undefined` si `expenseIds` vacío) cubre los intentos manuales.
- **Idempotencia.** `addExpenseToLegalization` y `submitLegalization` son no-op en su segundo llamado con los mismos argumentos.

---

## Verificación

- `npm run lint` — **PASS**
- `npm run build` — **PASS**

Bug pre-existente corregido en el camino: `cliente` se usaba en `app/review/page.tsx` pero no estaba declarado en `ExtractedFields` (rompía `tsc`). Se agregó al tipo y se pobló en `DEMO_FIELDS`.

---

## Archivos tocados

| Archivo | Cambio |
|---|---|
| `lib/store.ts` | Nuevos tipos `Legalization`, `LegalizationStatus`; nueva API de legalizaciones; `setDocumentCeco`; `cliente` en `ExtractedFields`; `parseAmount` y `currentMonthLabel` exportados. |
| `components/header.tsx` | Eliminados inputs CECO de las variantes `upload` y `review`. |
| `components/invoice-preview.tsx` | **Nuevo.** Facsimile de factura reusable, acepta `ExtractedFields` y `fileName?`. |
| `app/upload/page.tsx` | Input CECO propio en la cabecera del dropzone; auto-attach al borrador activo. |
| `app/review/page.tsx` | Reemplaza facsimile inline por `<InvoicePreview />`; input CECO propio; persiste CECO vía `setDocumentCeco`; cliente poblado. |
| `app/me/page.tsx` | `<ActiveLegalizationCard>` con total y CTA; `<SubmittedLegalizationsList>`; `<EmptyLegalizationCard>`; chip CECO por fila; toast de envío. |

---

## Próximos pasos (referencia)

- **HU-0007** — Validación de duplicados: comparar `(proveedor, nroFactura, monto)` antes de aceptar un nuevo gasto.
- **HU-0008** — Límite de consumo: comparar `totalFactura` contra techo del centro de costo y escalar a líder.
- **HU-0009** — 5 días hábiles: comparar `uploadedAt` contra `fecha` del gasto.
- **HU-0011** — Orquestación SAP: al transicionar a `submitted`, encolar el caso en el conector SAP.
- **HU-0010** — Pantalla de historial: probablemente reutilice `SubmittedLegalizationsList` con filtros y drill-down por gasto.