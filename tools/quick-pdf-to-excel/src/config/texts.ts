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
  heading: "PDF to Excel",
  tagline: "Ambil data tabel dari PDF ke file Excel.",
  landing: "Extract tables and data from PDF into an Excel spreadsheet.",
  ctaStart: "Pilih PDF",
  privacyShort: "Proses di perangkat Anda",
  dropTitle: "Drag & Drop PDF here",
  dropSub: "Atau pilih file PDF dari perangkat Anda",
  pick: "Pilih File PDF",
  addMore: "Ganti PDF",
  primary: "Convert to Excel",
  filesTitle: "File PDF",
  optionsTitle: "Opsi Tabel",
  previewTitle: "Pratinjau Tabel",
  workingTitle: "Mengonversi ke Excel...",
  workingTpl: "Memproses halaman {i} dari {n}...",
  workingPrep: "Menyiapkan spreadsheet...",
  doneTitle: "Konversi Selesai",
  doneSub: "File Excel siap diunduh.",
  again: "Proses File Lain",
  againShort: "Convert Again",
  downloadAll: "Unduh Semua",
  outputKind: "File Excel",
  zipName: "quick-pdf-to-excel.zip",
  step1: "Pilih File",
  step2: "Konfigurasi",
  step3: "Pratinjau",
  step4: "Proses",
  step5: "Unduh",
  tutorial: [
    { img: "./tutorial/01-overview.webp", title: "Ambil data dari PDF", body: "Buka Quick PDF to Excel untuk mengekstrak tabel ke Excel." },
    { img: "./tutorial/02-upload.webp", title: "Unggah PDF", body: "Seret PDF berisi tabel, atau klik \"Pilih File PDF\"." },
    { img: "./tutorial/03-preview.webp", title: "Lihat pratinjau tabel", body: "Tabel terdeteksi ditampilkan sebagai pratinjau sebelum konversi." },
    { img: "./tutorial/04-options.webp", title: "Atur per halaman", body: "Ekspor semua data ke satu lembar, atau satu lembar per halaman." },
    { img: "./tutorial/05-processing.webp", title: "Proses konversi", body: "Klik \"Convert to Excel\" dan tunggu proses ekstraksi selesai." },
    { img: "./tutorial/06-download.webp", title: "Download Excel", body: "Klik Download untuk menyimpan file .xlsx." },
  ],
};