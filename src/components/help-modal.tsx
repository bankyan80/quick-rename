"use client";

import { useAppStore } from "@/store/use-store";
import { X, HelpCircle, FolderOpen, Braces, Hash, Zap, CreditCard, Monitor } from "lucide-react";

export default function HelpModal() {
  const setShowHelp = useAppStore((s) => s.setShowHelp);

  const sections = [
    {
      icon: FolderOpen,
      title: "Cara membuka folder",
      body: "Klik 'Buka Folder' dan pilih folder yang berisi file Anda. Peramban akan meminta izin — berikan izin untuk mengubah nama file secara langsung.",
    },
    {
      icon: Monitor,
      title: "Cara memilih file",
      body: "Klik file untuk memilihnya. Gunakan Ctrl+Klik untuk memilih banyak, Shift+Klik untuk rentang, atau Ctrl+A untuk memilih semua.",
    },
    {
      icon: Braces,
      title: "Cara membuat pola",
      body: `Gunakan variabel seperti {name}, {n}, {nn}, {nnn}, {date}, {time}, dan {ext}. Contoh: PPPK_{nnn} menghasilkan PPPK_001, PPPK_002, dan seterusnya.`,
    },
    {
      icon: Hash,
      title: "Cara kerja penomoran",
      body: "Pilih angka awal, kenaikan (langkah), dan pad (lebar). Mulai 10, kenaikan 5, pad 3 → 010, 015, 020, 025.",
    },
    {
      icon: HelpCircle,
      title: "Cara kerja Temukan & Ganti",
      body: "Masukkan teks yang dicari dan pengganti opsional. Aktifkan peka huruf besar/kecil sesuai kebutuhan. Berlaku pada nama file saja dan mempertahankan ekstensi.",
    },
    {
      icon: Zap,
      title: "Cara kerja kuota",
      body: "Pengguna gratis dapat mengubah nama 5 file, pengguna Google mendapat 10 file, dan setiap token menyediakan 100 penggantian nama yang berhasil. Hanya file yang berhasil diubah yang memakai kuota.",
    },
    {
      icon: CreditCard,
      title: "Cara kerja pembayaran",
      body: "Beli token melalui DANA atau QRIS. Buat pesanan, bayar, lalu kirim bukti. Admin memverifikasi di dalam aplikasi, kemudian 100 unit file ditambahkan ke saldo Anda.",
    },
    {
      icon: Monitor,
      title: "Kompatibilitas peramban",
      body: "Membutuhkan Chrome atau Edge di Windows untuk penggantian nama folder langsung (API File System Access). Peramban lain menggunakan mode cadangan dengan unduhan ZIP.",
    },
  ];

  return (
    <div className="modal-overlay" onClick={() => setShowHelp(false)}>
      <div
        className="modal w-full max-w-2xl p-5"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Bantuan"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-semibold flex items-center gap-2">
            <HelpCircle size={16} className="text-primary" />
            Bantuan Quick Rename
          </h2>
          <button
            className="toolbar-button !p-1"
            onClick={() => setShowHelp(false)}
            aria-label="Tutup bantuan"
          >
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[65vh] overflow-y-auto">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.title} className="rounded border border-border bg-card p-3.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon size={14} className="text-primary" />
                  <span className="text-[13px] font-medium">{section.title}</span>
                </div>
                <p className="text-[12px] text-text-secondary leading-relaxed">
                  {section.body}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-4 rounded border border-border bg-card p-3">
          <p className="text-[12px] font-medium mb-1.5">Pintasan keyboard</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[12px] text-text-secondary">
            <span><kbd className="rounded border border-border bg-background px-1.5 py-0.5">Ctrl</kbd> + <kbd className="rounded border border-border bg-background px-1.5 py-0.5">A</kbd> Pilih semua</span>
            <span><kbd className="rounded border border-border bg-background px-1.5 py-0.5">Ctrl</kbd> + <kbd className="rounded border border-border bg-background px-1.5 py-0.5">F</kbd> Cari</span>
            <span><kbd className="rounded border border-border bg-background px-1.5 py-0.5">Ctrl</kbd> + <kbd className="rounded border border-border bg-background px-1.5 py-0.5">Z</kbd> Urungkan</span>
            <span><kbd className="rounded border border-border bg-background px-1.5 py-0.5">Esc</kbd> Tutup / batalkan</span>
            <span><kbd className="rounded border border-border bg-background px-1.5 py-0.5">Enter</kbd> Jalankan penggantian nama</span>
          </div>
        </div>
      </div>
    </div>
  );
}