export type RenameMode =
  | "prefix"
  | "suffix"
  | "find-replace"
  | "numbering"
  | "case"
  | "remove"
  | "pattern";

export type CaseType = "uppercase" | "lowercase" | "title" | "sentence";

export type SortMode =
  | "name-asc"
  | "name-desc"
  | "size"
  | "modified"
  | "extension"
  | "selection";

export type ConflictResolution = "cancel" | "skip" | "auto-resolve";

export interface RenameRule {
  mode: RenameMode;
  prefix?: string;
  suffix?: string;
  findText?: string;
  replaceText?: string;
  caseType?: CaseType;
  removeText?: string;
  pattern?: string;
  startNumber?: number;
  increment?: number;
  padding?: number;
  caseSensitive?: boolean;
}

export interface FileEntry {
  id: string;
  name: string;
  extension: string;
  size: number;
  lastModified: Date;
  type: string;
  handle?: FileSystemFileHandle;
  file?: File;
  selected: boolean;
  selectionOrder: number;
}

export interface PreviewEntry {
  original: string;
  newName: string;
  status: "ready" | "conflict" | "invalid" | "duplicate";
  statusMessage?: string;
  file: FileEntry;
}

export interface RenameResult {
  originalName: string;
  newName: string;
  success: boolean;
  error?: string;
}

export interface RenameOperation {
  id: string;
  files: FileEntry[];
  rule: RenameRule;
  results: RenameResult[];
  timestamp: Date;
  successfulCount: number;
  failedCount: number;
  skippedCount: number;
}

export interface QuotaInfo {
  type: "free" | "google" | "token";
  total: number;
  used: number;
  remaining: number;
}
