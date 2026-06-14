import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">P</span>
            </div>
            <span className="font-semibold text-neutral-900 text-sm">PsikoTest Online</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-ghost btn text-sm">Masuk</Link>
            <Link href="/register" className="btn-primary btn text-sm">Daftar</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="max-w-5xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-xs font-medium px-3 py-1.5 rounded-full border border-brand-100 mb-8">
            <span className="w-1.5 h-1.5 bg-brand-500 rounded-full"></span>
            Platform Psikotes Profesional · Pro Bono
          </div>

          <h1 className="text-4xl md:text-5xl font-semibold text-neutral-900 tracking-tight mb-5 leading-tight">
            Tes Psikologi Online<br />
            <span className="text-brand-600">Terstruktur & Terukur</span>
          </h1>

          <p className="text-neutral-500 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Platform manajemen psikotes lengkap dengan proctoring real-time,
            konstruksi soal fleksibel, dan pelaporan hasil yang komprehensif.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="btn-primary btn btn-lg">
              Mulai Sekarang — Gratis
            </Link>
            <Link href="/login" className="btn-secondary btn btn-lg">
              Sudah Punya Akun
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-6 pb-20">
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: '🧩',
                title: 'Konstruksi Soal Lengkap',
                desc: 'Buat soal pilihan ganda, Likert, benar/salah, esai. Import via CSV/Excel atau manual.'
              },
              {
                icon: '🔍',
                title: 'Proctoring Real-Time',
                desc: 'Anti tab switching, fullscreen wajib, kamera aktif, deteksi blur & minimize.'
              },
              {
                icon: '📊',
                title: 'Laporan & Export',
                desc: 'Export data peserta, hasil tes, dan analisis per dimensi dalam format Excel.'
              },
              {
                icon: '📦',
                title: 'Manajemen Paket Tes',
                desc: 'Buat paket dari beberapa bank soal, atur urutan, durasi, dan acak soal.'
              },
              {
                icon: '🏗️',
                title: 'Multi-Project',
                desc: 'Kelola banyak project sekaligus dengan pengaturan proctoring berbeda tiap project.'
              },
              {
                icon: '📱',
                title: 'Responsif',
                desc: 'Dapat diakses dari HP, tablet, maupun laptop tanpa instalasi apapun.'
              }
            ].map((f) => (
              <div key={f.title} className="card p-5">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-neutral-800 text-sm mb-2">{f.title}</h3>
                <p className="text-neutral-500 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-200 bg-white py-6">
        <div className="max-w-5xl mx-auto px-6 text-center text-xs text-neutral-400">
          PsikoTest Online · Pro Bono · Dibuat dengan ❤️ untuk komunitas psikologi Indonesia
        </div>
      </footer>
    </div>
  )
}
