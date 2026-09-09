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
  slug: "quick-pdf-to-jpg",
  name: "Quick PDF to JPG",
  short: "PDF to JPG",
  title: "PDF to JPG",
  tagline: "Ubah halaman PDF menjadi gambar JPG dengan cepat.",
  landing: "Convert PDF pages into JPG images in seconds.",
  accent: "#f97316",
  icon: "image",
  fileExt: "JPG",
  single: true,
  accept: ".pdf,application/pdf",
  maxMb: 200,
  defaultOptions: { quality: 92, scale: 2, selectedPages: "all" as string | number[] },
  ogDescription: "Ubah halaman PDF menjadi gambar JPG berkualitas tinggi langsung di browser Anda. Tanpa upload.",
};