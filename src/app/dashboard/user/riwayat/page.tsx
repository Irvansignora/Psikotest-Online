import { createClient } from '@/lib/supabase/server'
import { formatDateTime, formatDuration } from '@/lib/utils'
import Link from 'next/link'

export default async function RiwayatPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: sesiList } = await supabase
    .from('sesi_tes')
    .select('*, project:projects(nama, kode_project), paket_tes:paket_tes(nama, tampilkan_skor)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const statusBadge: Record<string, string> = {
    belum_mulai: 'badge-gray', berjalan: 'badge-yellow',
    selesai: 'badge-green', dibatalkan: 'badge-red'
  }
  const statusLabel: Record<string, string> = {
    belum_mulai: 'Belum Mulai', berjalan: 'Sedang Berjalan',
    selesai: 'Selesai', dibatalkan: 'Dibatalkan'
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-neutral-900">Riwayat Tes</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Semua tes yang pernah Anda kerjakan</p>
      </div>

      {sesiList && sesiList.length > 0 ? (
        <div className="card">
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Paket Tes</th>
                  <th>Status</th>
                  <th>Mulai</th>
                  <th>Durasi</th>
                  <th>Skor</th>
                </tr>
              </thead>
              <tbody>
                {sesiList.map((s: any) => (
                  <tr key={s.id}>
                    <td>
                      <p className="font-medium text-neutral-800 text-sm">{s.project?.nama}</p>
                      {s.project?.kode_project && (
                        <p className="font-mono text-xs text-neutral-400">{s.project.kode_project}</p>
                      )}
                    </td>
                    <td className="text-neutral-500 text-xs">{s.paket_tes?.nama || '—'}</td>
                    <td>
                      <span className={statusBadge[s.status] || 'badge-gray'}>
                        {statusLabel[s.status] || s.status}
                      </span>
                    </td>
                    <td className="text-neutral-500 text-xs">
                      {s.mulai_at ? formatDateTime(s.mulai_at) : '—'}
                    </td>
                    <td className="text-neutral-500 text-xs">
                      {s.durasi_aktual ? formatDuration(s.durasi_aktual) : '—'}
                    </td>
                    <td className="font-mono text-sm font-semibold text-neutral-800">
                      {s.paket_tes?.tampilkan_skor && s.skor_total != null
                        ? s.skor_total.toFixed(1)
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card p-12 text-center">
          <p className="text-3xl mb-3">📋</p>
          <p className="text-neutral-500 text-sm">Belum ada riwayat tes</p>
          <Link href="/dashboard/user" className="btn-primary btn btn-sm mt-4 inline-flex">
            Lihat Tes Tersedia
          </Link>
        </div>
      )}
    </div>
  )
}
