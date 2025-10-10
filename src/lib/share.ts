// Sharing utilities: copy image to clipboard, infer extension from data URL, timestamp helper.

/**
 * Convert a data URL to a Blob.
 * Supports typical image mime types (png, jpeg, webp, gif).
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const match = /^data:([\w/+.-]+);base64,(.*)$/i.exec(dataUrl);
  if (!match) {
    throw new Error("Invalid data URL");
  }
  const mime = match[1] || "application/octet-stream";
  const base64 = match[2];
  const binary = typeof atob === "function" ? atob(base64) : Buffer.from(base64, "base64").toString("binary");
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

/**
 * Infer a file extension from a data URL's mime type.
 * Defaults to "png" if unknown.
 */
export function inferExtFromDataUrl(dataUrl: string): "png" | "jpg" | "jpeg" | "webp" | "gif" {
  const m = /^data:([\w/+.-]+);base64,/i.exec(dataUrl);
  const mime = (m?.[1] || "").toLowerCase();
  if (mime.includes("png")) return "png";
  if (mime.includes("jpeg")) return "jpeg";
  if (mime.includes("jpg")) return "jpg";
  if (mime.includes("webp")) return "webp";
  if (mime.includes("gif")) return "gif";
  return "png";
}

/**
 * Copy an image (data URL) to the clipboard.
 * Requires secure context (HTTPS or localhost) and browser support for ClipboardItem.
 * Throws on unsupported environments so callers can show a user-friendly toast.
 */
export async function copyDataUrlToClipboard(dataUrl: string): Promise<void> {
  if (typeof window === "undefined") throw new Error("Clipboard not available (SSR)");
  if (!("ClipboardItem" in window)) throw new Error("Clipboard image not supported in this browser");
  if (!window.isSecureContext) throw new Error("Clipboard requires a secure context (HTTPS/localhost)");

  const blob = dataUrlToBlob(dataUrl);
  const ClipboardItemCtor: any = (window as any).ClipboardItem;
  if (!ClipboardItemCtor) throw new Error("Clipboard image not supported in this browser");
  const item = new ClipboardItemCtor({ [blob.type]: blob });
  await navigator.clipboard.write([item]);
}

/**
 * Timestamp for filenames: yyyyMMdd-HHmmss (local time).
 */
export function nowTs(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  return `${yyyy}${MM}${dd}-${hh}${mm}${ss}`;
}
