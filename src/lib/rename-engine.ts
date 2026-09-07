import {
  RenameRule,
  CaseType,
  FileEntry,
  PreviewEntry,
  SortMode,
} from "@/types";

const WINDOWS_INVALID_CHARS = /[<>:"/\\|?*]/;
const WINDOWS_RESERVED_NAMES = [
  "CON",
  "PRN",
  "AUX",
  "NUL",
  "COM1",
  "COM2",
  "COM3",
  "COM4",
  "COM5",
  "COM6",
  "COM7",
  "COM8",
  "COM9",
  "LPT1",
  "LPT2",
  "LPT3",
  "LPT4",
  "LPT5",
  "LPT6",
  "LPT7",
  "LPT8",
  "LPT9",
];

export function formatNumber(
  num: number,
  padding: number
): string {
  return String(num).padStart(padding, "0");
}

export function applyPrefix(name: string, extension: string, prefix: string): string {
  return prefix + name;
}

export function applySuffix(name: string, extension: string, suffix: string): string {
  return name + suffix;
}

export function findAndReplace(
  name: string,
  findText: string,
  replaceText: string,
  caseSensitive: boolean = true
): string {
  if (!findText) return name;
  if (caseSensitive) {
    return name.split(findText).join(replaceText);
  }
  const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
  return name.replace(regex, replaceText);
}

export function applyCase(name: string, caseType: CaseType): string {
  switch (caseType) {
    case "uppercase":
      return name.toUpperCase();
    case "lowercase":
      return name.toLowerCase();
    case "title":
      return name.replace(/\w\S*/g, (txt) =>
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      );
    case "sentence":
      return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    default:
      return name;
  }
}

export function removeText(name: string, text: string): string {
  if (!text) return name;
  return name.split(text).join("");
}

export function applyPattern(
  pattern: string,
  originalName: string,
  extension: string,
  index: number,
  startNumber: number,
  increment: number,
  padding: number
): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  const num = startNumber + index * increment;

  const extValue = extension.startsWith(".") ? extension.slice(1) : extension;

  return pattern
    .replace(/\{name\}/g, originalName)
    .replace(/\{nnn\}/g, formatNumber(num, 3))
    .replace(/\{nn\}/g, formatNumber(num, 2))
    .replace(/\{n\}/g, formatNumber(num, Math.max(padding, 1)))
    .replace(/\{date\}/g, `${year}-${month}-${day}`)
    .replace(/\{time\}/g, `${hours}-${minutes}-${seconds}`)
    .replace(/\{ext\}/g, extValue);
}

export function generateNewName(
  file: FileEntry,
  rule: RenameRule,
  index: number
): string {
  const { extension } = file;
  const nameWithoutExt = file.name;
  const { mode } = rule;

  let newName: string;

  switch (mode) {
    case "prefix":
      newName = applyPrefix(nameWithoutExt, extension, rule.prefix || "");
      break;

    case "suffix":
      newName = applySuffix(nameWithoutExt, extension, rule.suffix || "");
      break;

    case "find-replace":
      newName = findAndReplace(
        nameWithoutExt,
        rule.findText || "",
        rule.replaceText || "",
        rule.caseSensitive
      );
      break;

    case "numbering":
      const padding = rule.padding || 3;
      const start = rule.startNumber || 1;
      const inc = rule.increment || 1;
      newName = formatNumber(start + index * inc, padding);
      break;

    case "case":
      newName = applyCase(nameWithoutExt, rule.caseType || "uppercase");
      break;

    case "remove":
      newName = removeText(nameWithoutExt, rule.removeText || "");
      break;

    case "pattern":
      newName = applyPattern(
        rule.pattern || "{name}",
        nameWithoutExt,
        extension,
        index,
        rule.startNumber || 1,
        rule.increment || 1,
        rule.padding || 3
      );
      break;

    default:
      newName = nameWithoutExt;
  }

  return newName;
}

export function validateFilename(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: "Filename is empty" };
  }

  if (WINDOWS_INVALID_CHARS.test(name)) {
    const match = name.match(WINDOWS_INVALID_CHARS);
    return {
      valid: false,
      error: `Invalid character: ${match ? match[0] : ""}`,
    };
  }

  if (name.length > 255) {
    return { valid: false, error: "Filename too long (max 255 characters)" };
  }

  if (name.endsWith(".") || name.endsWith(" ")) {
    return { valid: false, error: "Filename cannot end with period or space" };
  }

  const nameWithoutExt = name.split(".")[0];
  if (WINDOWS_RESERVED_NAMES.includes(nameWithoutExt.toUpperCase())) {
    return { valid: false, error: `"${nameWithoutExt}" is a reserved Windows name` };
  }

  return { valid: true };
}

export function detectDuplicates(
  entries: PreviewEntry[]
): PreviewEntry[] {
  const nameCount = new Map<string, number>();

  for (const entry of entries) {
    const count = nameCount.get(entry.newName) || 0;
    nameCount.set(entry.newName, count + 1);
  }

  return entries.map((entry) => {
    if (entry.status === "invalid") return entry;

    const count = nameCount.get(entry.newName) || 0;
    if (count > 1) {
      return {
        ...entry,
        status: "duplicate" as const,
        statusMessage: "Duplicate filename detected",
      };
    }

    if (entry.original === entry.newName) {
      return {
        ...entry,
        status: "ready" as const,
        statusMessage: "No change",
      };
    }

    return entry;
  });
}

export function sortFiles(
  files: FileEntry[],
  mode: SortMode
): FileEntry[] {
  const sorted = [...files];

  switch (mode) {
    case "name-asc":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "name-desc":
      sorted.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case "size":
      sorted.sort((a, b) => a.size - b.size);
      break;
    case "modified":
      sorted.sort(
        (a, b) => a.lastModified.getTime() - b.lastModified.getTime()
      );
      break;
    case "extension":
      sorted.sort((a, b) => a.extension.localeCompare(b.extension));
      break;
    case "selection":
      sorted.sort((a, b) => a.selectionOrder - b.selectionOrder);
      break;
  }

  return sorted;
}

export function generatePreview(
  files: FileEntry[],
  rule: RenameRule,
  sortMode: SortMode,
  preserveExtensions = true
): PreviewEntry[] {
  const sortedFiles = sortFiles(files.filter((f) => f.selected), sortMode);

  return sortedFiles.map((file, index) => {
    const engineFile = preserveExtensions
      ? file
      : { ...file, name: file.name + file.extension };
    const generated = generateNewName(engineFile, rule, index);
    const newName =
      !preserveExtensions ||
      (rule.mode === "pattern" && rule.pattern?.includes("{ext}"))
        ? generated
        : generated + file.extension;
    const validation = validateFilename(newName);

    return {
      original: file.name + file.extension,
      newName,
      status: validation.valid ? "ready" : "invalid",
      statusMessage: validation.error,
      file,
    };
  });
}

export function autoResolveConflicts(
  entries: PreviewEntry[]
): PreviewEntry[] {
  const count = new Map<string, number>();
  for (const entry of entries) {
    if (entry.status === "invalid") continue;
    count.set(entry.newName, (count.get(entry.newName) || 0) + 1);
  }

  const used = new Set<string>();
  for (const entry of entries) {
    if (entry.status === "invalid") continue;
    if ((count.get(entry.newName) || 1) === 1) {
      used.add(entry.newName);
    }
  }

  const perTarget = new Map<string, number>();

  return entries.map((entry) => {
    if (entry.status === "invalid") return entry;

    const total = count.get(entry.newName) || 1;

    if (total === 1) {
      if (entry.status === "duplicate") {
        return {
          ...entry,
          status: "ready" as const,
          statusMessage: "Conflict resolved",
        };
      }
      return entry;
    }

    const seen = perTarget.get(entry.newName) || 0;
    perTarget.set(entry.newName, seen + 1);

    if (seen === 0) {
      return {
        ...entry,
        status: "ready" as const,
        statusMessage: "Conflict resolved",
      };
    }

    const base = entry.newName.replace(/\.[^.]+$/, "");
    const ext = entry.file.extension;
    let counter = seen;
    let resolved = `${base} (${counter})${ext}`;
    while (used.has(resolved)) {
      counter++;
      resolved = `${base} (${counter})${ext}`;
    }
    used.add(resolved);

    return {
      ...entry,
      newName: resolved,
      status: "ready" as const,
      statusMessage: "Auto-resolved conflict",
    };
  });
}
