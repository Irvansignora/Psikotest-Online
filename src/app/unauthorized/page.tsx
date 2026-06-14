import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-xl font-semibold text-neutral-900 mb-2">Akses Ditolak</h1>
        <p className="text-sm text-neutral-500 mb-6">
          Anda tidak memiliki izin untuk mengakses halaman ini.
        </p>
        <Link href="/" className="btn-primary btn">Kembali ke Beranda</Link>
      </div>
    </div>
  )
}
