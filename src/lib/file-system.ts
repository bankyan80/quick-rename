import { FileEntry } from "@/types";
import { nanoid } from "nanoid";

export function isFileSystemAccessSupported(): boolean {
  return typeof window !== "undefined" && "showDirectoryPicker" in window;
}

export function isFileSystemAccessWritable(
  handle: FileSystemDirectoryHandle
): boolean {
  return handle.mode === "readwrite";
}

export async function openDirectory(): Promise<{
  handle: FileSystemDirectoryHandle;
  files: FileEntry[];
} | null> {
  try {
    const handle = await window.showDirectoryPicker({
      mode: "readwrite",
    });

    const files = await readDirectory(handle);
    return { handle, files };
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      return null;
    }
    throw error;
  }
}

export async function readDirectory(
  dirHandle: FileSystemDirectoryHandle
): Promise<FileEntry[]> {
  const files: FileEntry[] = [];

  for await (const [name, handle] of dirHandle.entries()) {
    if (handle.kind === "file") {
      const fileHandle = handle as FileSystemFileHandle;
      const file = await fileHandle.getFile();
      const ext = getExtension(name);
      const nameWithoutExt = ext ? name.slice(0, -(ext.length + 1)) : name;

      files.push({
        id: nanoid(),
        name: nameWithoutExt,
        extension: ext ? `.${ext}` : "",
        size: file.size,
        lastModified: new Date(file.lastModified),
        type: file.type || getMimeType(ext),
        handle: fileHandle,
        selected: false,
        selectionOrder: 0,
      });
    }
  }

  return files;
}

export async function renameFile(
  dirHandle: FileSystemDirectoryHandle,
  oldName: string,
  newName: string
): Promise<boolean> {
  try {
    const oldExt = getExtension(oldName);
    const newExt = getExtension(newName);

    const oldFileHandle = await dirHandle.getFileHandle(oldName);

    if (oldExt !== newExt) {
      const existing = await dirHandle
        .getFileHandle(newName)
        .then(() => true)
        .catch(() => false);
      if (existing) {
        return false;
      }
      const oldFile = await oldFileHandle.getFile();
      const newFileHandle = await dirHandle.getFileHandle(newName, {
        create: true,
      });
      const writable = await newFileHandle.createWritable();
      await writable.write(oldFile);
      await writable.close();
      await dirHandle.removeEntry(oldName);
    } else {
      await oldFileHandle.move(newName);
    }

    return true;
  } catch (error) {
    console.error(`Failed to rename ${oldName} to ${newName}:`, error);
    return false;
  }
}

export async function downloadRenamedZip(
  entries: Array<{ file: FileEntry; newName: string }>
): Promise<number> {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  let added = 0;

  for (const { file, newName } of entries) {
    const blob = file.file
      ? file.file
      : file.handle
      ? await file.handle.getFile()
      : null;

    if (blob) {
      zip.file(newName, blob);
      added++;
    }
  }

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `renamed-files-${new Date().toISOString().slice(0, 10)}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);

  return added;
}

export function handleDragDrop(
  event: React.DragEvent
): Promise<FileEntry[] | null> {
  return new Promise((resolve) => {
    const items = event.dataTransfer.items;
    const files: FileEntry[] = [];

    const promises: Promise<void>[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.kind === "file") {
        const entry = item.webkitGetAsEntry?.();
        if (entry) {
          promises.push(
            processEntry(entry, files)
          );
        }
      }
    }

    Promise.all(promises).then(() => resolve(files.length > 0 ? files : null));
  });
}

async function processEntry(
  entry: FileSystemEntry,
  files: FileEntry[]
): Promise<void> {
  if (entry.isFile) {
    const fileEntry = entry as FileSystemFileEntry;
    const file = await new Promise<File>((resolve) =>
      fileEntry.file(resolve)
    );

    const ext = getExtension(file.name);
    const nameWithoutExt = ext ? file.name.slice(0, -(ext.length + 1)) : file.name;

    files.push({
      id: nanoid(),
      name: nameWithoutExt,
      extension: ext ? `.${ext}` : "",
      size: file.size,
      lastModified: new Date(file.lastModified),
      type: file.type || getMimeType(ext),
      file,
      selected: false,
      selectionOrder: 0,
    });
  } else if (entry.isDirectory) {
    const dirEntry = entry as FileSystemDirectoryEntry;
    const dirReader = dirEntry.createReader();
    const entries = await new Promise<FileSystemEntry[]>((resolve) =>
      dirReader.readEntries(resolve)
    );

    for (const childEntry of entries) {
      await processEntry(childEntry, files);
    }
  }
}

export function createFilesFromInput(
  fileList: FileList
): FileEntry[] {
  const files: FileEntry[] = [];

  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    const ext = getExtension(file.name);
    const nameWithoutExt = ext ? file.name.slice(0, -(ext.length + 1)) : file.name;

    files.push({
      id: nanoid(),
      name: nameWithoutExt,
      extension: ext ? `.${ext}` : "",
      size: file.size,
      lastModified: new Date(file.lastModified),
      type: file.type || getMimeType(ext),
      file,
      selected: false,
      selectionOrder: 0,
    });
  }

  return files;
}

function getExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1) return "";
  return filename.slice(lastDot + 1);
}

function getMimeType(extension: string): string {
  const mimeTypes: Record<string, string> = {
    pdf: "application/pdf",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    svg: "image/svg+xml",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    zip: "application/zip",
    rar: "application/x-rar-compressed",
    txt: "text/plain",
    html: "text/html",
    css: "text/css",
    js: "application/javascript",
    json: "application/json",
    mp3: "audio/mpeg",
    mp4: "video/mp4",
    avi: "video/x-msvideo",
    mov: "video/quicktime",
    wmv: "video/x-ms-wmv",
  };

  return mimeTypes[extension.toLowerCase()] || "application/octet-stream";
}

export function getFileCategory(extension: string): string {
  const ext = extension.toLowerCase().replace(".", "");

  const categories: Record<string, string[]> = {
    document: ["pdf", "doc", "docx", "txt", "rtf", "odt"],
    image: ["jpg", "jpeg", "png", "gif", "svg", "bmp", "webp", "ico"],
    spreadsheet: ["xls", "xlsx", "csv", "ods"],
    presentation: ["ppt", "pptx", "odp"],
    archive: ["zip", "rar", "7z", "tar", "gz"],
    video: ["mp4", "avi", "mov", "wmv", "mkv", "flv", "webm"],
    audio: ["mp3", "wav", "ogg", "flac", "aac"],
    code: ["js", "ts", "py", "java", "cpp", "h", "css", "html", "json"],
  };

  for (const [category, extensions] of Object.entries(categories)) {
    if (extensions.includes(ext)) return category;
  }

  return "other";
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

const RELATIVE_DATE: Record<
  string,
  { today: string; yesterday: string; daysAgo: (count: number) => string }
> = {
  id: {
    today: "Hari ini",
    yesterday: "Kemarin",
    daysAgo: (count) => `${count} hari lalu`,
  },
  en: {
    today: "Today",
    yesterday: "Yesterday",
    daysAgo: (count) => `${count} days ago`,
  },
};

export function formatDate(date: Date, locale: string = "id"): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  const rel = RELATIVE_DATE[locale] ?? RELATIVE_DATE.id;

  if (days === 0) return rel.today;
  if (days === 1) return rel.yesterday;
  if (days < 7) return rel.daysAgo(days);

  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
