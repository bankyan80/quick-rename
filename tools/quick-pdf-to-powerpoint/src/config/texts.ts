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
  heading: "PDF to PowerPoint",
  tagline: "Ubah PDF menjadi presentasi PowerPoint.",
  landing: "Turn PDF pages into a PowerPoint presentation.",
  ctaStart: "Pilih PDF",
  privacyShort: "Proses di perangkat Anda",
  dropTitle: "Drag & Drop PDF here",
  dropSub: "Atau pilih file PDF dari perangkat Anda",
  pick: "Pilih File PDF",
  addMore: "Ganti PDF",
  primary: "Convert to PowerPoint",
  filesTitle: "File PDF",
  optionsTitle: "Mode Slide",
  previewTitle: "Pratinjau Slide",
  workingTitle: "Mengonversi ke PowerPoint...",
  workingTpl: "Membuat slide {i} dari {n}...",
  workingPrep: "Menyiapkan presentasi...",
  doneTitle: "Konversi Selesai",
  doneSub: "Presentasi PowerPoint siap diunduh.",
  again: "Proses File Lain",
  againShort: "Convert Again",
  downloadAll: "Unduh Semua",
  outputKind: "Presentasi PowerPoint",
  zipName: "quick-pdf-to-powerpoint.zip",
  step1: "Pilih File",
  step2: "Konfigurasi",
  step3: "Pratinjau",
  step4: "Proses",
  step5: "Unduh",
  tutorial: [
    { img: "./tutorial/01-overview.webp", title: "PDF jadi Presentasi", body: "Buka Quick PDF to PowerPoint untuk mengubah halaman PDF menjadi slide." },
    { img: "./tutorial/02-upload.webp", title: "Unggah PDF", body: "Seret PDF ke area unggah atau klik \"Pilih File PDF\"." },
    { img: "./tutorial/03-preview.webp", title: "Pratinjau slide", body: "Lihat pratinjau halaman yang akan menjadi slide presentasi." },
    { img: "./tutorial/04-options.webp", title: "Mode slide", body: "Satu halaman PDF = satu slide, dengan tampilan aslinya dipertahankan." },
    { img: "./tutorial/05-processing.webp", title: "Proses konversi", body: "Klik \"Convert to PowerPoint\" dan tunggu slide dihasilkan." },
    { img: "./tutorial/06-download.webp", title: "Download PowerPoint", body: "Klik Download untuk menyimpan file .pptx." },
  ],
};