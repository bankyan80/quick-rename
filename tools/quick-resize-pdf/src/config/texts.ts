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
  heading: "Resize PDF",
  tagline: "Sesuaikan ukuran halaman PDF dengan kebutuhan Anda.",
  landing: "Change PDF page dimensions instantly in your browser.",
  ctaStart: "Pilih PDF",
  privacyShort: "Proses di perangkat Anda",
  dropTitle: "Drag & Drop PDF here",
  dropSub: "Atau pilih file PDF dari perangkat Anda",
  pick: "Pilih File PDF",
  addMore: "Ganti PDF",
  primary: "Resize PDF",
  filesTitle: "File PDF",
  optionsTitle: "Ukuran Halaman",
  previewTitle: "Pratinjau",
  workingTitle: "Mengubah ukuran halaman...",
  workingTpl: "Memproses halaman {i} dari {n}...",
  workingPrep: "Menyiapkan konversi ukuran...",
  doneTitle: "Resize Selesai",
  doneSub: "File PDF dengan ukuran baru siap diunduh.",
  again: "Proses File Lain",
  againShort: "Convert Again",
  downloadAll: "Unduh Semua",
  outputKind: "PDF",
  zipName: "quick-resize-pdf.zip",
  step1: "Pilih File",
  step2: "Konfigurasi",
  step3: "Pratinjau",
  step4: "Proses",
  step5: "Unduh",
  tutorial: [
    { img: "./tutorial/01-overview.webp", title: "Mulai mengubah ukuran", body: "Buka Quick Resize PDF untuk mengubah ukuran halaman dokumen." },
    { img: "./tutorial/02-upload.webp", title: "Unggah PDF", body: "Seret PDF atau klik \"Pilih File PDF\" untuk memuat dokumen." },
    { img: "./tutorial/03-preview.webp", title: "Lihat ukuran saat ini", body: "Pratinjau menampilkan ukuran halaman asli dokumen Anda." },
    { img: "./tutorial/04-options.webp", title: "Pilih ukuran", body: "Pilih preset A4, A5, Letter, Legal atau masukkan ukuran kustom." },
    { img: "./tutorial/05-processing.webp", title: "Proses resize", body: "Klik \"Resize PDF\" dan tunggu proses konversi selesai." },
    { img: "./tutorial/06-download.webp", title: "Unduh hasil", body: "Klik Download untuk menyimpan PDF dengan ukuran baru." },
  ],
};