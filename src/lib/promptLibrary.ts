// LocalStorage-backed Prompt Library with simple CRUD and search.
// Stores prompts with description, createdAt, and associated result image data URLs.

export type LibraryImage = {
  id: string; // stable id for image within a prompt
  dataUrl: string; // data URL (base64) for the generated image
  mimeType?: string; // optional, inferred from dataUrl if omitted
};

export type LibraryPrompt = {
  id: string; // uuid-like string
  title: string; // short name for the prompt
  description: string; // full prompt text/description
  createdAt: number; // epoch ms
  images: LibraryImage[]; // generated image results
};

const STORAGE_KEY = "dig:promptLibrary:v1";
const MAX_ITEMS = 200;

function safeParse(json: string | null): LibraryPrompt[] {
  if (!json) return [];
  try {
    const arr = JSON.parse(json);
    if (!Array.isArray(arr)) return [];
    return arr.filter((x) => x && typeof x.id === "string" && typeof x.description === "string");
  } catch {
    return [];
  }
}

export function readLibrary(): LibraryPrompt[] {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(STORAGE_KEY));
}

export function writeLibrary(items: LibraryPrompt[]): void {
  if (typeof window === "undefined") return;
  try {
    const trimmed = items.slice(0, MAX_ITEMS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // ignore quota errors
  }
}

export function addPrompt(item: Omit<LibraryPrompt, "id" | "createdAt"> & Partial<Pick<LibraryPrompt, "createdAt">>): LibraryPrompt {
  const id = cryptoRandomId();
  const createdAt = item.createdAt ?? Date.now();
  const record: LibraryPrompt = {
    id,
    title: (item.title || item.description.slice(0, 40) || "Untitled").trim(),
    description: (item.description || "").trim(),
    createdAt,
    images: Array.isArray(item.images) ? item.images : [],
  };
  const all = readLibrary();
  const next = [record, ...all];
  writeLibrary(next);
  return record;
}

export function updatePrompt(id: string, patch: Partial<Omit<LibraryPrompt, "id" | "createdAt">>): LibraryPrompt | null {
  const all = readLibrary();
  const idx = all.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const current = all[idx];
  const updated: LibraryPrompt = {
    ...current,
    ...patch,
    id: current.id,
    createdAt: current.createdAt,
  };
  const next = [...all];
  next[idx] = updated;
  writeLibrary(next);
  return updated;
}

export function removePrompt(id: string): boolean {
  const all = readLibrary();
  const next = all.filter((p) => p.id !== id);
  writeLibrary(next);
  return next.length !== all.length;
}

export function searchPrompts(query: string): LibraryPrompt[] {
  const q = (query || "").trim().toLowerCase();
  const all = readLibrary();
  if (!q) return all;
  return all.filter((p) =>
    p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
  );
}

export function clearLibrary(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

function cryptoRandomId(): string {
  // Prefer Web Crypto if available
  try {
    const g: any = typeof globalThis !== "undefined" ? globalThis : window;
    if (g.crypto && g.crypto.getRandomValues) {
      const bytes = new Uint8Array(16);
      g.crypto.getRandomValues(bytes);
      return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    }
  } catch {}
  // Fallback
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}



