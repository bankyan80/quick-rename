export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / Math.pow(1024, i);
  return `${value >= 100 || i === 0 ? Math.round(value) : value.toFixed(1)} ${units[i]}`;
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function extOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "";
}

export function baseName(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(0, i) : name;
}

export function pad(n: number, len = 2): string {
  return String(n).padStart(Math.max(1, len), "0");
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export async function blobToUint8(blob: Blob): Promise<Uint8Array> {
  return new Uint8Array(await blob.arrayBuffer());
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function sanitizeFileBase(name: string): string {
  const cleaned = baseName(name)
    .replace(/[<>:"/\\|?*]/g, "-")
    .replace(/\s+/g, " ")
    .split("")
    .map((ch) => (ch.charCodeAt(0) < 32 ? "-" : ch))
    .join("")
    .trim();
  return cleaned || "document";
}

export function isDemoMode(): boolean {
  return typeof window !== "undefined" && new URLSearchParams(window.location.search).get("demo") === "1";
}

export function demoPhase(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("phase");
}

export function demoFocus(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("focus");
}

/* Image helper: canvas -> blob */
export function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Canvas empty"))),
      type,
      quality,
    );
  });
}

/* Normalize a writer output (Blob | ArrayBuffer | Uint8Array | string) to Blob. */
export async function toBlob(part: Blob | ArrayBuffer | Uint8Array | string, type: string): Promise<Blob> {
  if (part instanceof Blob) return part;
  if (part instanceof Uint8Array) {
    const copy = new Uint8Array(part.byteLength);
    copy.set(part);
    return new Blob([copy.buffer], { type });
  }
  return new Blob([part], { type });
}