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
  heading: "PDF to Word",
  tagline: "Ubah PDF menjadi dokumen Word yang dapat diedit.",
  landing: "Turn your PDFs into editable Word documents.",
  ctaStart: "Pilih PDF",
  privacyShort: "Proses di perangkat Anda",
  dropTitle: "Drag & Drop PDF here",
  dropSub: "Atau pilih file PDF dari perangkat Anda",
  pick: "Pilih File PDF",
  addMore: "Ganti PDF",
  primary: "Convert to Word",
  filesTitle: "File PDF",
  optionsTitle: "Opsi Dokumen",
  previewTitle: "Pratinjau Teks",
  workingTitle: "Mengonversi ke Word...",
  workingTpl: "Membaca halaman {i} dari {n}...",
  workingPrep: "Menyiapkan dokumen...",
  doneTitle: "Konversi Selesai",
  doneSub: "Dokumen Word siap diunduh.",
  again: "Proses File Lain",
  againShort: "Convert Again",
  downloadAll: "Unduh Semua",
  outputKind: "Dokumen Word",
  zipName: "quick-pdf-to-word.zip",
  step1: "Pilih File",
  step2: "Konfigurasi",
  step3: "Pratinjau",
  step4: "Proses",
  step5: "Unduh",
  tutorial: [
    { img: "./tutorial/01-overview.webp", title: "Ubah PDF jadi Word", body: "Buka Quick PDF to Word dan pilih dokumen PDF Anda." },
    { img: "./tutorial/02-upload.webp", title: "Unggah PDF", body: "Seret PDF ke area unggah atau klik \"Pilih File PDF\"." },
    { img: "./tutorial/03-preview.webp", title: "Pratinjau teks", body: "Lihat pratinjau teks yang berhasil diekstrak dari setiap halaman." },
    { img: "./tutorial/04-options.webp", title: "Opsi dokumen", body: "Pilih apakah penanda halaman disertakan dalam dokumen hasil." },
    { img: "./tutorial/05-processing.webp", title: "Proses konversi", body: "Klik \"Convert to Word\" dan tunggu proses selesai." },
    { img: "./tutorial/06-download.webp", title: "Download Word", body: "Klik Download untuk menyimpan file .docx yang dapat diedit." },
  ],
};