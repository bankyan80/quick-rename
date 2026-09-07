import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen overflow-y-auto bg-background text-text-primary">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <Link href="/" className="text-[13px] text-primary hover:underline">
          ← Kembali ke Quick Rename
        </Link>
        <h1 className="mt-4 text-2xl font-semibold">Ketentuan Layanan</h1>
        <p className="mt-1 text-[12px] text-text-muted">
          Terakhir diperbarui: 7 September 2026
        </p>

        <div className="mt-6 space-y-5 text-[14px] leading-relaxed text-text-secondary">
          <section>
            <h2 className="mb-1 text-[15px] font-medium text-text-primary">
              1. Penerimaan Ketentuan
            </h2>
            <p>
              Dengan menggunakan Quick Rename, Anda menyetujui ketentuan ini.
              Jika Anda tidak setuju, mohon tidak menggunakan layanan ini.
            </p>
          </section>

          <section>
            <h2 className="mb-1 text-[15px] font-medium text-text-primary">
              2. Layanan
            </h2>
            <p>
              Quick Rename adalah utilitas penggantian nama file massal yang
              berjalan di peramban Anda. File Anda diproses secara lokal di
              perangkat Anda. Kami tidak bertanggung jawab atas hasil operasi
              penggantian nama yang Anda lakukan; mohon periksa pratinjau
              dengan saksama sebelum menerapkan perubahan.
            </p>
          </section>

          <section>
            <h2 className="mb-1 text-[15px] font-medium text-text-primary">
              3. Kuota dan Token
            </h2>
            <p>
              Pengguna gratis menerima kuota terbatas. Pengguna yang
              terautentikasi dengan Google menerima kuota dasar. Kapasitas
              tambahan tersedia melalui token berbayar. Hanya file yang
              berhasil diubah namanya yang memakai kuota. Kuota ditentukan
              oleh server kami, bukan oleh peramban Anda.
            </p>
          </section>

          <section>
            <h2 className="mb-1 text-[15px] font-medium text-text-primary">
              4. Pembelian
            </h2>
            <p>
              Token dibeli melalui DANA atau QRIS dan ditambahkan ke saldo
              Anda setelah verifikasi manual oleh administrator. Semua
              penjualan token bersifat final. Token tidak memiliki masa
              berlaku.
            </p>
          </section>

          <section>
            <h2 className="mb-1 text-[15px] font-medium text-text-primary">
              5. Penggunaan yang Diizinkan
            </h2>
            <p>
              Anda setuju untuk tidak berupaya memanipulasi kuota, saldo
              token, status pembayaran, atau akses administratif melalui
              cara sisi-klien, atau menyalahgunakan layanan dengan cara lain.
            </p>
          </section>

          <section>
            <h2 className="mb-1 text-[15px] font-medium text-text-primary">
              6. Batasan Tanggung Jawab
            </h2>
            <p>
              Quick Rename disediakan &quot;sebagaimana adanya&quot; tanpa
              jaminan apa pun. Sejauh diizinkan oleh hukum, kami tidak
              bertanggung jawab atas kehilangan data, kerusakan file, atau
              kerusakan tidak langsung. Selalu cadangkan file penting Anda.
            </p>
          </section>

          <section>
            <h2 className="mb-1 text-[15px] font-medium text-text-primary">
              7. Perubahan
            </h2>
            <p>
              Kami dapat memperbarui ketentuan ini dari waktu ke waktu.
              Penggunaan layanan yang berkelanjutan dianggap sebagai
              penerimaan terhadap ketentuan yang diperbarui.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}