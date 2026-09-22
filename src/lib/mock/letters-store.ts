// ============================================================================
// HR Letters client store. Like Leave Applications, Letters is a self-service
// flow the user actually creates and expects to persist across navigation, so
// it lives in an in-memory store exposed via useSyncExternalStore. It is seeded
// from the static mock so first paint matches; creating / editing / status
// changes / revoke mutate this list for the SPA session only (no backend).
// ============================================================================
import { employees, currentUser } from "./data";
import { issuedLetters } from "./data-letters";
import type { HRLetter, LetterStatus } from "@/lib/letters";

let letters: HRLetter[] = [...issuedLetters];
const listeners = new Set<() => void>();

function notify(): void {
  for (const l of listeners) l();
}

/** Current snapshot — used by `useSyncExternalStore` (server + client). */
export function getLetters(): HRLetter[] {
  return letters;
}

export function subscribeLetters(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function getLetter(id: string): HRLetter | undefined {
  return letters.find((l) => l.id === id);
}

export type NewLetterInput = {
  type: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  subject: string;
  issueDate: string;
  effectiveDate: string;
  body: string;
  fields: Record<string, string>;
  status: LetterStatus;
};

let counter = letters.length + 1;
function nextId(): string {
  const n = String(counter++).padStart(4, "0");
  return `LTR-2026-${n}`;
}

/** Insert a new letter (prepended so it appears first) and notify subscribers. */
export function createLetter(input: NewLetterInput): HRLetter {
  const emp = employees.find((e) => e.id === input.employeeId);
  const letter: HRLetter = {
    id: nextId(),
    type: input.type,
    employeeId: input.employeeId,
    employeeIdCode: emp?.employeeId ?? "—",
    employeeName: input.employeeName || emp?.name || "Employee",
    employeeEmail: input.employeeEmail || emp?.email || "",
    employeeDepartment: emp?.department ?? "—",
    employeeDesignation: emp?.designation ?? "—",
    subject: input.subject,
    issueDate: input.issueDate,
    effectiveDate: input.effectiveDate,
    status: input.status,
    body: input.body,
    fields: input.fields,
    createdBy: currentUser?.name ?? "HR Admin",
    createdAt: new Date().toISOString().slice(0, 10),
  };
  letters = [letter, ...letters];
  notify();
  return letter;
}

/** Patch an existing letter in place (used by Edit) and notify subscribers. */
export function updateLetter(id: string, patch: Partial<Omit<HRLetter, "id">>): void {
  letters = letters.map((l) => (l.id === id ? { ...l, ...patch } : l));
  notify();
}

export function setLetterStatus(id: string, status: LetterStatus): void {
  updateLetter(id, { status });
}

export function deleteLetter(id: string): void {
  letters = letters.filter((l) => l.id !== id);
  notify();
}
