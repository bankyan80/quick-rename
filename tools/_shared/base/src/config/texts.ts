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
  heading: "Merge PDF",
  tagline: "Gabungkan beberapa file PDF menjadi satu dokumen.",
  landing: "Combine multiple PDF files into one document in seconds.",
  ctaStart: "Pilih PDF",
  privacyShort: "Proses di perangkat Anda",
  dropTitle: "Tambah PDF",
  dropSub: "Seret PDF ke sini atau pilih dari perangkat Anda",
  pick: "Pilih File PDF",
  addMore: "Tambah PDF",
  primary: "Merge PDF",
  filesTitle: "File PDF",
  optionsTitle: "Pengaturan Hasil",
  previewTitle: "Urutan Final",
  workingTitle: "Menggabungkan PDF...",
  workingTpl: "Memproses halaman {i} dari {n}...",
  workingPrep: "Menyiapkan dokumen...",
  doneTitle: "Penggabungan Selesai",
  doneSub: "Semua halaman telah tergabung menjadi satu PDF.",
  again: "Proses File Lain",
  againShort: "Mulai Ulang",
  downloadAll: "Unduh Semua",
  outputKind: "dokumen PDF",
  zipName: "quick-merge-pdf.zip",
  step1: "Pilih File",
  step2: "Konfigurasi",
  step3: "Pratinjau",
  step4: "Proses",
  step5: "Unduh",
  tutorial: [
    { img: "./tutorial/01-overview.webp", title: "Mulai menggabungkan", body: "Buka Quick Merge PDF. Halaman utama langsung menampilkan area unggah. Tidak perlu akun." },
    { img: "./tutorial/02-upload.webp", title: "Tambahkan PDF", body: "Seret beberapa PDF atau klik \"Pilih File PDF\". Boleh pilih banyak berkas sekaligus." },
    { img: "./tutorial/03-preview.webp", title: "Periksa urutan file", body: "Setiap berkas menampilkan nama, ukuran, dan jumlah halaman. Gunakan pegangan seret untuk mengurutkan." },
    { img: "./tutorial/04-options.webp", title: "Atur nama hasil", body: "Isi nama file hasil. Secara default: merged-document.pdf." },
    { img: "./tutorial/05-processing.webp", title: "Proses penggabungan", body: "Klik \"Merge PDF\". Halaman diproses berurutan dengan indikator kemajuan." },
    { img: "./tutorial/06-download.webp", title: "Unduh hasil", body: "Klik Download pada kartu hasil. File selesai diunduh ke perangkat Anda." },
  ],
};