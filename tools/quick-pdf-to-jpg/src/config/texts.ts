export type TutorialStep = { img?: string; title: string; body: string };

export type Texts = {
  heading: string;
  tagline: string;
  landing: string;
  ctaStart: string;
  privacyShort: string;
  dropTitle: string;
  dropSub: string;
  pick: string;
  addMore: string;
  primary: string;
  filesTitle: string;
  optionsTitle: string;
  previewTitle: string;
  workingTitle: string;
  workingTpl: string;
  workingPrep: string;
  doneTitle: string;
  doneSub: string;
  again: string;
  againShort: string;
  downloadAll: string;
  outputKind: string;
  zipName: string;
  step1: string;
  step2: string;
  step3: string;
  step4: string;
  step5: string;
  tutorial: TutorialStep[];
};

export const texts: Texts = {
  heading: "PDF to JPG",
  tagline: "Ubah halaman PDF menjadi gambar JPG dengan cepat.",
  landing: "Convert PDF pages into JPG images in seconds.",
  ctaStart: "Pilih PDF",
  privacyShort: "Proses di perangkat Anda",
  dropTitle: "Drag & Drop PDF here",
  dropSub: "Atau pilih file PDF dari perangkat Anda",
  pick: "Pilih File PDF",
  addMore: "Ganti PDF",
  primary: "Convert to JPG",
  filesTitle: "File PDF",
  optionsTitle: "Pengaturan Kualitas",
  previewTitle: "Pratinjau Halaman",
  workingTitle: "Mengonversi ke JPG...",
  workingTpl: "Mengonversi halaman {i} dari {n}...",
  workingPrep: "Menyiapkan konversi...",
  doneTitle: "Konversi Selesai",
  doneSub: "Semua halaman JPG siap diunduh.",
  again: "Proses File Lain",
  againShort: "Convert Again",
  downloadAll: "Unduh Semua",
  outputKind: "gambar JPG",
  zipName: "quick-pdf-to-jpg-hasil.zip",
  step1: "Pilih File",
  step2: "Konfigurasi",
  step3: "Pratinjau",
  step4: "Proses",
  step5: "Unduh",
  tutorial: [
    { img: "./tutorial/01-overview.webp", title: "Selamat datang", body: "Buka Quick PDF to JPG. Pilih PDF untuk mulai mengonversi." },
    { img: "./tutorial/02-upload.webp", title: "Unggah PDF", body: "Klik \"Pilih File PDF\" atau seret PDF ke area unggah." },
    { img: "./tutorial/03-preview.webp", title: "Pratinjau halaman", body: "Pratinjau thumbnail muncul untuk semua halaman PDF." },
    { img: "./tutorial/04-options.webp", title: "Atur kualitas", body: "Atur skala dan kualitas JPEG sesuai kebutuhan Anda." },
    { img: "./tutorial/05-processing.webp", title: "Proses konversi", body: "Klik \"Convert to JPG\" dan lihat kemajuan konversi." },
    { img: "./tutorial/06-download.webp", title: "Unduh hasil", body: "Klik Download atau Unduh Semua (.zip) untuk menyimpan gambar." },
  ],
};