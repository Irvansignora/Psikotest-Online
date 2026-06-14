import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function PaketTesPage() {
  const supabase = createClient()
  const { data: pakets } = await supabase
    .from('paket_tes')
    .select('*, owner:profiles(full_name), paket_tes_soal(id, bank_soal:bank_soal(nama))')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Paket Tes</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Kumpulan bank soal yang disusun menjadi satu paket tes</p>
        </div>
        <Link href="/dashboard/admin/paket-tes/baru" className="btn-primary btn">+ Buat Paket Tes</Link>
      </div>

      <div className="grid gap-4">
        {pakets && pakets.length > 0 ? pakets.map((p: any) => (
          <div key={p.id} className="card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-neutral-800 mb-1">{p.nama}</h3>
                {p.deskripsi && <p className="text-xs text-neutral-500 mb-2 line-clamp-1">{p.deskripsi}</p>}
                <div className="flex items-center gap-3 flex-wrap">
                  {p.paket_tes_soal?.map((pts: any) => (
                    <span key={pts.id} className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
                      📝 {pts.bank_soal?.nama}
                    </span>
                  ))}
                  {p.durasi_total && <span className="text-xs text-neutral-400">⏱ {p.durasi_total} menit</span>}
                  {p.acak_soal && <span className="text-xs text-neutral-400">🔀 Soal diacak</span>}
                </div>
              </div>
              <Link href={`/dashboard/admin/paket-tes/${p.id}`} className="btn-ghost btn btn-sm shrink-0">
                Edit
              </Link>
            </div>
          </div>
        )) : (
          <div className="card p-12 text-center">
            <p className="text-neutral-400 text-sm mb-3">Belum ada paket tes</p>
            <Link href="/dashboard/admin/paket-tes/baru" className="btn-primary btn btn-sm">Buat Paket Tes Pertama</Link>
          </div>
        )}
      </div>
    </div>
  )
}
