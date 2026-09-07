interface FileSystemHandlePermissionDescriptor {
  mode?: "read" | "readwrite";
}

interface FileSystemHandle {
  readonly kind: "file" | "directory";
  readonly name: string;
  readonly mode?: "read" | "readwrite";
  queryPermission?(
    descriptor?: FileSystemHandlePermissionDescriptor
  ): Promise<PermissionState>;
  requestPermission?(
    descriptor?: FileSystemHandlePermissionDescriptor
  ): Promise<PermissionState>;
}

interface FileSystemFileHandle extends FileSystemHandle {
  readonly kind: "file";
  getFile(): Promise<File>;
  createWritable(options?: {
    keepExistingData?: boolean;
  }): Promise<FileSystemWritableFileStream>;
  move(newName: string): Promise<void>;
  move(
    newParent: FileSystemDirectoryHandle,
    newName?: string
  ): Promise<void>;
}

interface FileSystemWritableFileStream extends WritableStream {
  write(data: File | BufferSource | Blob | string): Promise<void>;
  write(data: { type: "write"; data: BufferSource | Blob | string; position?: number }): Promise<void>;
  seek(position: number): Promise<void>;
  truncate(size: number): Promise<void>;
}

interface FileSystemDirectoryHandle extends FileSystemHandle {
  readonly kind: "directory";
  getDirectoryHandle(
    name: string,
    options?: { create?: boolean }
  ): Promise<FileSystemDirectoryHandle>;
  getFileHandle(
    name: string,
    options?: { create?: boolean }
  ): Promise<FileSystemFileHandle>;
  removeEntry(name: string, options?: { recursive?: boolean }): Promise<void>;
  resolve(possibleDescendant: FileSystemHandle): Promise<string[] | null>;
  entries(): AsyncIterableIterator<[string, FileSystemHandle]>;
  values(): AsyncIterableIterator<FileSystemHandle>;
  keys(): AsyncIterableIterator<string>;
}

interface Window {
  showDirectoryPicker(options?: {
    id?: string;
    mode?: "read" | "readwrite";
    startIn?: string;
  }): Promise<FileSystemDirectoryHandle>;
  showOpenFilePicker(options?: {
    multiple?: boolean;
    types?: Array<{
      description?: string;
      accept?: Record<string, string[]>;
    }>;
    excludeAcceptAllOption?: boolean;
  }): Promise<FileSystemFileHandle[]>;
  showSaveFilePicker(options?: {
    suggestedName?: string;
    types?: Array<{
      description?: string;
      accept?: Record<string, string[]>;
    }>;
  }): Promise<FileSystemFileHandle>;
}