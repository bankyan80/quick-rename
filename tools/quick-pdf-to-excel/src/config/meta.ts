export type Meta = {
  slug: string;
  name: string;
  short: string;
  title: string;
  tagline: string;
  landing: string;
  accent: string;
  icon: string;
  fileExt: string;
  single: boolean;
  accept: string;
  maxMb: number;
  defaultOptions: Record<string, unknown>;
  ogDescription: string;
};

export const meta: Meta = {
  slug: "quick-pdf-to-excel",
  name: "Quick PDF to Excel",
  short: "PDF to Excel",
  title: "PDF to Excel",
  tagline: "Ambil data tabel dari PDF ke file Excel.",
  landing: "Extract tables and data from PDF into an Excel spreadsheet.",
  accent: "#22c55e",
  icon: "excel",
  fileExt: "XLSX",
  single: true,
  accept: ".pdf,application/pdf",
  maxMb: 200,
  defaultOptions: { sheetMode: "one" },
  ogDescription: "Ambil data tabel dari PDF ke file Excel (.xlsx) tanpa mengetik ulang. Hasil terbaik untuk tabel berbasis teks.",
};