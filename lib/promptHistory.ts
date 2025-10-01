// Simple localStorage-backed prompt history with de-duplication and size cap.
// This is client-side only. Guard all access with typeof window checks.

const STORAGE_KEY = "dig:promptHistory:v1";
const MAX_ITEMS = 20;

export function readPromptHistory(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr.filter((x) => typeof x === "string") as string[]) : [];
  } catch {
    return [];
  }
}

export function writePromptHistory(items: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
  } catch {
    // Ignore quota errors
  }
}

export function addPromptToHistory(prompt: string): string[] {
  const p = (prompt || "").trim();
  if (!p) return readPromptHistory();

  const current = readPromptHistory();
  // De-dupe: remove existing occurrences
  const filtered = current.filter((x) => x.trim() !== p);
  const next = [p, ...filtered].slice(0, MAX_ITEMS);
  writePromptHistory(next);
  return next;
}

export function clearPromptHistory(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
