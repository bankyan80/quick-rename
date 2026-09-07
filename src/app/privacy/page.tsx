import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen overflow-y-auto bg-background text-text-primary">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <Link href="/" className="text-[13px] text-primary hover:underline">
          ← Kembali ke Quick Rename
        </Link>
        <h1 className="mt-4 text-2xl font-semibold">Kebijakan Privasi</h1>
        <p className="mt-1 text-[12px] text-text-muted">
          Terakhir diperbarui: 7 September 2026
        </p>

        <div className="mt-6 space-y-5 text-[14px] leading-relaxed text-text-secondary">
          <section>
            <h2 className="mb-1 text-[15px] font-medium text-text-primary">
              File Anda Tetap di Perangkat Anda
            </h2>
            <p>
              Quick Rename memproses file Anda secara lokal di peramban Anda
              menggunakan API File System Access. Kami tidak mengunggah,
              mengirimkan, atau menyimpan isi file Anda (PDF, gambar,
              dokumen, arsip, atau file lainnya) di server kami.
            </p>
          </section>

          <section>
            <h2 className="mb-1 text-[15px] font-medium text-text-primary">
              Apa yang Kami Simpan
            </h2>
            <p>
              Kami hanya menyimpan data terkait akun yang diperlukan untuk
              menyediakan layanan: informasi profil Google Anda (nama, email,
              avatar), kuota penggunaan Anda, saldo token, pesanan pembayaran,
              dan metadata penggantian nama (ID operasi, waktu, jumlah file).
              Nama file tidak pernah diwajibkan agar layanan kami berfungsi.
            </p>
          </section>

          <section>
            <h2 className="mb-1 text-[15px] font-medium text-text-primary">
              Autentikasi
            </h2>
            <p>
              Masuk dengan Google ditangani oleh OAuth Google. Kami tidak pernah
              menerima atau menyimpan kata sandi Google Anda. Kami hanya
              menerima data profil yang Anda setujui untuk dibagikan.
            </p>
          </section>

          <section>
            <h2 className="mb-1 text-[15px] font-medium text-text-primary">
              Pembayaran
            </h2>
            <p>
              Pesanan pembayaran diproses secara manual oleh administrator.
              Anda dapat mengirimkan referensi atau bukti pembayaran yang
              disimpan secara privat dan hanya terlihat oleh Anda dan admin
              yang berwenang.
            </p>
          </section>

          <section>
            <h2 className="mb-1 text-[15px] font-medium text-text-primary">
              Cookie
            </h2>
            <p>
              Kami menggunakan cookie penting untuk menjaga sesi autentikasi
              Anda dan pelacakan penggunaan anonim. Kami tidak menggunakan
              cookie pelacakan untuk iklan.
            </p>
          </section>

          <section>
            <h2 className="mb-1 text-[15px] font-medium text-text-primary">
              Kontak
            </h2>
            <p>
              Untuk pertanyaan tentang privasi, hubungi administrator
              aplikasi.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}