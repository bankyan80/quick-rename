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
  slug: "quick-merge-pdf",
  name: "Quick Merge PDF",
  short: "Merge PDF",
  title: "Merge PDF",
  tagline: "Gabungkan beberapa file PDF menjadi satu dokumen.",
  landing: "Combine multiple PDF files into one document in seconds.",
  accent: "#6366f1",
  icon: "merge",
  fileExt: "PDF",
  single: false,
  accept: ".pdf,application/pdf",
  maxMb: 200,
  defaultOptions: { filename: "merged-document" },
  ogDescription: "Gabungkan beberapa file PDF menjadi satu dokumen langsung di browser Anda. Tanpa upload, tanpa antrean.",
};