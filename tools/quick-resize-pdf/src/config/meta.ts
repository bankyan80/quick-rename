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
  slug: "quick-resize-pdf",
  name: "Quick Resize PDF",
  short: "Resize PDF",
  title: "Resize PDF",
  tagline: "Sesuaikan ukuran halaman PDF dengan kebutuhan Anda.",
  landing: "Change PDF page dimensions instantly in your browser.",
  accent: "#14b8a6",
  icon: "resize",
  fileExt: "PDF",
  single: true,
  accept: ".pdf,application/pdf",
  maxMb: 200,
  defaultOptions: { preset: "a4", orientation: "portrait" },
  ogDescription: "Sesuaikan ukuran halaman PDF ke A4, A5, Letter, Legal atau ukuran kustom. Tanpa upload.",
};