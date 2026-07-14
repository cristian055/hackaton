export type Role = 'conductor' | 'personal';

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
  };
  all[idx] = next;
  writeAll(all);
  notify();
  return next;
}

export function deleteDocument(id: string): void {
  const all = readAll();
  const next = all.filter((d) => d.id !== id);
  writeAll(next);
  notify();
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

export { subscribe };