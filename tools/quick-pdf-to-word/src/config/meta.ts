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
  slug: "quick-pdf-to-word",
  name: "Quick PDF to Word",
  short: "PDF to Word",
  title: "PDF to Word",
  tagline: "Ubah PDF menjadi dokumen Word yang dapat diedit.",
  landing: "Turn your PDFs into editable Word documents.",
  accent: "#3b82f6",
  icon: "word",
  fileExt: "DOCX",
  single: true,
  accept: ".pdf,application/pdf",
  maxMb: 200,
  defaultOptions: { includePages: true },
  ogDescription: "Ubah PDF menjadi dokumen Word (.docx) yang dapat diedit. Hasil terbaik untuk PDF berbasis teks.",
};