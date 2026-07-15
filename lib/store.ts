export type Role = 'conductor' | 'personal';

export type LegalizationStatus = 'draft' | 'submitted';

export interface Legalization {
  id: string;
  period: string;
  status: LegalizationStatus;
  expenseIds: string[];
  createdAt: string;
  submittedAt?: string;
}

export const LEGALIZATIONS_KEY = 'logiflow.legalizations.v1';

/**
 * Ciclo de vida de un documento (2 estados):
 * - 'upload':     Archivo recién subido. Aún no fue abierto en /review, no tiene datos extraídos.
 * - 'processing': Documento abierto en /review (en proceso de validación) y/o con datos extraídos confirmados.
 *
 * Transición: 'upload' → 'processing' ocurre al montar /review con un `?doc=` válido.
 * 'processing' es terminal: una vez extraídos los datos, el documento permanece así.
 *
 * Persistencia: localStorage (`logiflow.documents.v1`).
 * Origen de transiciones:
 *   - /upload  → crea con status 'upload'
 *   - /review  → transiciona a 'processing' y guarda `extracted`
 *   - /me      → sólo lee
 */
export type DocumentStatus = 'upload' | 'processing';

export interface ExtractedFields {
  fecha: string;
  nroFactura: string;
  proveedor: string;
  cliente: string;
  cuit: string;
  nit: string;
  direccion: string;
  telefono: string;
  departamento: string;
  municipio: string;
  monto: string;
  kilometraje: string;
  iva19Base: string;
  iva19Valor: string;
  iva5Base: string;
  iva5Valor: string;
  iva0Base: string;
  iva0Valor: string;
  totalFactura: string;
}

export type DuplicateReason = 'same-legalization' | 'history' | 'indeterminate';

export interface DocumentRecord {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  status: DocumentStatus;
  role: Role;
  uploadedAt: string;
  ceco?: string;
  extracted?: ExtractedFields;
  duplicateOf?: string[];
  duplicateReason?: DuplicateReason;
}

export const STORAGE_KEY = 'logiflow.documents.v1';
export const ROLE_KEY = 'logiflow.role.v1';

const isBrowser = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

function safeGet(key: string): string | null {
  if (!isBrowser()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore quota / privacy errors
  }
}

function safeRemove(key: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

function readAll(): DocumentRecord[] {
  const raw = safeGet(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as DocumentRecord[];
  } catch {
    return [];
  }
}

function writeAll(records: DocumentRecord[]): void {
  safeSet(STORAGE_KEY, JSON.stringify(records));
}

function readAllLegalizations(): Legalization[] {
  const raw = safeGet(LEGALIZATIONS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Legalization[];
  } catch {
    return [];
  }
}

function writeAllLegalizations(list: Legalization[]): void {
  safeSet(LEGALIZATIONS_KEY, JSON.stringify(list));
}

type Listener = () => void;
const listeners = new Set<Listener>();

function notify(): void {
  listeners.forEach((l) => {
    try {
      l();
    } catch {
      // listener error must not break store
    }
  });
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function listDocuments(): DocumentRecord[] {
  return readAll().slice().sort((a, b) => {
    const ta = new Date(a.uploadedAt).getTime();
    const tb = new Date(b.uploadedAt).getTime();
    return tb - ta;
  });
}

export function getDocument(id: string): DocumentRecord | undefined {
  return readAll().find((d) => d.id === id);
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {
      // fall through
    }
  }
  return `doc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export interface AddDocumentInput {
  fileName: string;
  fileType: string;
  fileSize: number;
  role: Role;
  status?: DocumentStatus;
  ceco?: string;
  extracted?: ExtractedFields;
}

export function addDocument(input: AddDocumentInput): DocumentRecord {
  const record: DocumentRecord = {
    id: generateId(),
    fileName: input.fileName,
    fileType: input.fileType,
    fileSize: input.fileSize,
    status: input.status ?? 'upload',
    role: input.role,
    uploadedAt: new Date().toISOString(),
    ceco: input.ceco,
    extracted: input.extracted,
  };
  const all = readAll();
  all.push(record);
  writeAll(all);
  notify();
  return record;
}

export interface UpdateDocumentPatch {
  status?: DocumentStatus;
  ceco?: string;
  extracted?: ExtractedFields;
  duplicateOf?: string[];
  duplicateReason?: DuplicateReason;
}

export function updateDocument(id: string, patch: UpdateDocumentPatch): DocumentRecord | undefined {
  const all = readAll();
  const idx = all.findIndex((d) => d.id === id);
  if (idx === -1) return undefined;
  const current = all[idx];
  const next: DocumentRecord = {
    ...current,
    ...(patch.status !== undefined ? { status: patch.status } : {}),
    ...(patch.ceco !== undefined ? { ceco: patch.ceco } : {}),
    ...(patch.extracted !== undefined ? { extracted: patch.extracted } : {}),
    ...(patch.duplicateOf !== undefined ? { duplicateOf: patch.duplicateOf } : {}),
    ...(patch.duplicateReason !== undefined ? { duplicateReason: patch.duplicateReason } : {}),
  };
  all[idx] = next;
  writeAll(all);
  notify();
  if (patch.extracted !== undefined) {
    recomputeAllDuplicates();
  }
  return next;
}

export function deleteDocument(id: string): void {
  const all = readAll();
  const next = all.filter((d) => d.id !== id);
  writeAll(next);
  notify();
  recomputeAllDuplicates();
}

export function setDocumentCeco(id: string, ceco: string): DocumentRecord | undefined {
  const all = readAll();
  const idx = all.findIndex((d) => d.id === id);
  if (idx === -1) return undefined;
  const current = all[idx];
  const next: DocumentRecord = { ...current, ceco };
  all[idx] = next;
  writeAll(all);
  notify();
  return next;
}

export function getRole(): Role {
  const raw = safeGet(ROLE_KEY);
  if (raw === 'conductor' || raw === 'personal') return raw;
  return 'personal';
}

export function setRole(role: Role): void {
  safeSet(ROLE_KEY, role);
  notify();
}

export function parseAmount(raw: string | undefined): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/[^\d.,-]/g, '').replace(/\./g, '').replace(',', '.');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

const SPANISH_MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export function currentMonthLabel(now: Date = new Date()): string {
  const month = SPANISH_MONTHS[now.getMonth()] ?? '';
  return `${month} ${now.getFullYear()}`;
}

export function listLegalizations(): Legalization[] {
  return readAllLegalizations().slice().sort((a, b) => {
    const ta = new Date(a.createdAt).getTime();
    const tb = new Date(b.createdAt).getTime();
    return tb - ta;
  });
}

export function getLegalization(id: string): Legalization | undefined {
  return readAllLegalizations().find((l) => l.id === id);
}

export function getOrCreateDraftLegalization(): Legalization {
  const all = readAllLegalizations();
  const existingDraft = all.find((l) => l.status === 'draft');
  if (existingDraft) return existingDraft;
  const next: Legalization = {
    id: generateId(),
    period: currentMonthLabel(),
    status: 'draft',
    expenseIds: [],
    createdAt: new Date().toISOString(),
  };
  writeAllLegalizations([...all, next]);
  notify();
  return next;
}

export function getActiveLegalization(): Legalization | undefined {
  const all = readAllLegalizations();
  const draft = all.find((l) => l.status === 'draft');
  if (draft) return draft;
  const submittedSorted = all
    .filter((l) => l.status === 'submitted')
    .sort((a, b) => {
      const ta = a.submittedAt ? new Date(a.submittedAt).getTime() : new Date(a.createdAt).getTime();
      const tb = b.submittedAt ? new Date(b.submittedAt).getTime() : new Date(b.createdAt).getTime();
      return tb - ta;
    });
  if (submittedSorted.length > 0) return submittedSorted[0];
  const docs = readAll();
  if (docs.length > 0) {
    const orphanIds = docs.map((d) => d.id);
    const migrated: Legalization = {
      id: generateId(),
      period: currentMonthLabel(),
      status: 'draft',
      expenseIds: orphanIds,
      createdAt: new Date().toISOString(),
    };
    writeAllLegalizations([...all, migrated]);
    notify();
    return migrated;
  }
  return undefined;
}

export function addExpenseToLegalization(
  legalizationId: string,
  docId: string,
): Legalization | undefined {
  const all = readAllLegalizations();
  const idx = all.findIndex((l) => l.id === legalizationId);
  if (idx === -1) return undefined;
  const current = all[idx];
  if (current.status !== 'draft') return current;
  if (current.expenseIds.includes(docId)) return current;
  const next: Legalization = {
    ...current,
    expenseIds: [...current.expenseIds, docId],
  };
  all[idx] = next;
  writeAllLegalizations(all);
  notify();
  recomputeDuplicatesForLegalization(legalizationId);
  return next;
}

export function submitLegalization(id: string): Legalization | undefined {
  const all = readAllLegalizations();
  const idx = all.findIndex((l) => l.id === id);
  if (idx === -1) return undefined;
  const current = all[idx];
  if (current.status === 'submitted') return current;
  if (current.expenseIds.length === 0) return undefined;
  const blocking = getBlockingDuplicates(id);
  if (blocking.length > 0) return undefined;
  const next: Legalization = {
    ...current,
    status: 'submitted',
    submittedAt: new Date().toISOString(),
  };
  all[idx] = next;
  writeAllLegalizations(all);
  notify();
  return next;
}

export function getLegalizationTotal(id: string): number {
  const leg = getLegalization(id);
  if (!leg) return 0;
  let total = 0;
  for (const docId of leg.expenseIds) {
    const doc = getDocument(docId);
    if (doc) {
      total += parseAmount(doc.extracted?.totalFactura);
    }
  }
  return total;
}

function normalizeKey(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Returns the dedupe key for a doc, or null when one of the key fields is
 * missing or only whitespace. Empty fields are treated as "indeterminate"
 * (advisory, never blocks) — see HU-0007.
 */
export function duplicateKey(doc: DocumentRecord): string | null {
  const nro = doc.extracted?.nroFactura;
  const nit = doc.extracted?.nit;
  if (!nro || !nit) return null;
  const trimmedNro = nro.trim();
  const trimmedNit = nit.trim();
  if (!trimmedNro || !trimmedNit) return null;
  return `${normalizeKey(trimmedNro)}|${normalizeKey(trimmedNit)}`;
}

function bucketDocsByKey(docs: DocumentRecord[]): Map<string, string[]> {
  const buckets = new Map<string, string[]>();
  for (const doc of docs) {
    const key = duplicateKey(doc);
    if (!key) continue;
    const arr = buckets.get(key);
    if (arr) arr.push(doc.id);
    else buckets.set(key, [doc.id]);
  }
  return buckets;
}

function pairwiseDuplicates(buckets: Map<string, string[]>): Map<string, string[]> {
  const out = new Map<string, string[]>();
  for (const ids of buckets.values()) {
    if (ids.length < 2) continue;
    for (const id of ids) {
      const others = ids.filter((x) => x !== id);
      out.set(id, others);
    }
  }
  return out;
}

/**
 * Walks the docs of `legalizationId` and returns a map of docId -> duplicateOf
 * ids for any two docs whose normalized (nroFactura, nit) match. Docs whose
 * key is null are skipped (advisory, see `findDuplicatesAgainstHistory`).
 */
export function findDuplicatesWithinLegalization(legalizationId: string): Map<string, string[]> {
  const leg = getLegalization(legalizationId);
  if (!leg) return new Map();
  const docs: DocumentRecord[] = [];
  for (const id of leg.expenseIds) {
    const doc = getDocument(id);
    if (doc) docs.push(doc);
  }
  return pairwiseDuplicates(bucketDocsByKey(docs));
}

/**
 * Compares each doc in `legalizationId` against every submitted legalization's
 * expenseIds. Returns a map of docId -> ids of history docs that share the
 * same normalized key.
 */
export function findDuplicatesAgainstHistory(legalizationId: string): Map<string, string[]> {
  const target = getLegalization(legalizationId);
  if (!target) return new Map();
  const targetDocs: DocumentRecord[] = [];
  for (const id of target.expenseIds) {
    const doc = getDocument(id);
    if (doc) targetDocs.push(doc);
  }
  if (targetDocs.length === 0) return new Map();
  const allSubmitted = listLegalizations().filter((l) => l.status === 'submitted');
  const historyIds = new Set<string>();
  for (const l of allSubmitted) {
    for (const id of l.expenseIds) historyIds.add(id);
  }
  const historyDocs: DocumentRecord[] = [];
  for (const id of historyIds) {
    const doc = getDocument(id);
    if (doc) historyDocs.push(doc);
  }
  const historyBuckets = bucketDocsByKey(historyDocs);
  const out = new Map<string, string[]>();
  for (const doc of targetDocs) {
    const key = duplicateKey(doc);
    if (!key) continue;
    const match = historyBuckets.get(key);
    if (!match || match.length === 0) continue;
    const others = match.filter((id) => id !== doc.id);
    if (others.length > 0) out.set(doc.id, others);
  }
  return out;
}

/**
 * Convenience: union of within-legalization and history duplicates, used by
 * submit-time guard. Returns ids of docs that block sending the legalization.
 */
export function getBlockingDuplicates(legalizationId: string): string[] {
  const within = findDuplicatesWithinLegalization(legalizationId);
  const history = findDuplicatesAgainstHistory(legalizationId);
  const out = new Set<string>();
  for (const id of within.keys()) out.add(id);
  for (const id of history.keys()) out.add(id);
  return Array.from(out);
}

function sameStringSet(a: string[] | undefined, b: string[] | undefined): boolean {
  const aa = a ?? [];
  const bb = b ?? [];
  if (aa.length !== bb.length) return false;
  const sa = aa.slice().sort();
  const sb = bb.slice().sort();
  for (let i = 0; i < sa.length; i++) {
    if (sa[i] !== sb[i]) return false;
  }
  return true;
}

/**
 * Recomputes duplicateOf + duplicateReason for every doc in the given
 * legalization and writes them to storage. Idempotent. 'same-legalization'
 * wins over 'history' when both apply. Docs without a key are marked
 * 'indeterminate' (advisory, never blocks).
 */
export function recomputeDuplicatesForLegalization(legalizationId: string): void {
  const leg = getLegalization(legalizationId);
  if (!leg) return;
  const within = findDuplicatesWithinLegalization(legalizationId);
  const history = findDuplicatesAgainstHistory(legalizationId);
  const all = readAll();
  let changed = false;
  for (const id of leg.expenseIds) {
    const idx = all.findIndex((d) => d.id === id);
    if (idx === -1) continue;
    const doc = all[idx];
    const w = within.get(id) ?? [];
    const h = history.get(id) ?? [];
    let duplicateOf: string[] = [];
    let reason: DuplicateReason | undefined;
    if (w.length > 0) {
      duplicateOf = Array.from(new Set([...w, ...h]));
      reason = 'same-legalization';
    } else if (h.length > 0) {
      duplicateOf = h;
      reason = 'history';
    } else {
      const key = duplicateKey(doc);
      if (!key) {
        reason = 'indeterminate';
      }
    }
    const wantOf = duplicateOf.length > 0 ? duplicateOf : undefined;
    const wantReason = duplicateOf.length > 0 ? reason : reason;
    if (
      !sameStringSet(doc.duplicateOf, wantOf) ||
      (doc.duplicateReason ?? undefined) !== wantReason
    ) {
      all[idx] = {
        ...doc,
        duplicateOf: wantOf,
        duplicateReason: wantReason,
      };
      changed = true;
    }
  }
  if (changed) {
    writeAll(all);
    notify();
  }
}

/**
 * Idempotently recomputes duplicates for every legalization in storage.
 * Cheap; safe to call after any mutation that may change the duplicate
 * landscape (e.g. `deleteDocument`).
 */
export function recomputeAllDuplicates(): void {
  for (const l of listLegalizations()) {
    recomputeDuplicatesForLegalization(l.id);
  }
}

/**
 * Finds any legalization (draft or submitted) that references `docId` in its
 * `expenseIds`. Used by the UI to render the source of a history duplicate.
 */
export function findLegalizationContainingDoc(docId: string): Legalization | undefined {
  return listLegalizations().find((l) => l.expenseIds.includes(docId));
}

export { subscribe };