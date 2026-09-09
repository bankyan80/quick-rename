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
  slug: "quick-pdf-to-powerpoint",
  name: "Quick PDF to PowerPoint",
  short: "PDF to PowerPoint",
  title: "PDF to PowerPoint",
  tagline: "Ubah PDF menjadi presentasi PowerPoint.",
  landing: "Turn PDF pages into a PowerPoint presentation.",
  accent: "#f43f5e",
  icon: "ppt",
  fileExt: "PPTX",
  single: true,
  accept: ".pdf,application/pdf",
  maxMb: 200,
  defaultOptions: { mode: "image" },
  ogDescription: "Ubah halaman PDF menjadi presentasi PowerPoint (.pptx) dengan satu halaman per slide.",
};