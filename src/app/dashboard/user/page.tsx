import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export default async function UserDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: peserta } = await supabase
    .from('project_peserta')
    .select('*, project:projects(id, nama, kode_project, status, tanggal_mulai, tanggal_selesai, pesan_selamat_datang, paket_tes:paket_tes(id, nama)), sesi:sesi_tes(id, status, skor_total, selesai_at)')
    .eq('user_id', user!.id)
    .order('terdaftar_at', { ascending: false })

  const statusColor: Record<string, string> = {
    aktif: 'badge-green', draft: 'badge-gray', selesai: 'badge-blue', arsip: 'badge-yellow'
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-neutral-900">Tes yang Ditugaskan</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Daftar tes psikologi yang dapat Anda kerjakan</p>
      </div>

      {peserta && peserta.length > 0 ? (
        <div className="grid gap-4">
          {peserta.map((p: any) => {
            const project = p.project
            const sesi = p.sesi?.[0]
            const sudahSelesai = sesi?.status === 'selesai'
            const sedangBerjalan = sesi?.status === 'berjalan'
            const bisaKerjakan = project?.status === 'aktif' && !sudahSelesai

            return (
              <div key={p.id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-neutral-800">{project?.nama}</h3>
                      <span className={statusColor[project?.status] || 'badge-gray'}>
                        {project?.status}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mb-2">
                      Paket: {project?.paket_tes?.nama || '—'}
                    </p>
                    {project?.tanggal_mulai && (
                      <p className="text-xs text-neutral-400">
                        {formatDate(project.tanggal_mulai)}
                        {project.tanggal_selesai && ` — ${formatDate(project.tanggal_selesai)}`}
                      </p>
                    )}
                    {sudahSelesai && sesi?.skor_total != null && project?.paket_tes?.tampilkan_skor && (
                      <p className="text-sm font-semibold text-brand-700 mt-2">
                        Skor: {sesi.skor_total.toFixed(1)}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0">
                    {sudahSelesai ? (
                      <span className="badge-green px-3 py-1.5">✓ Selesai</span>
                    ) : bisaKerjakan ? (
                      <Link href={`/tes/mulai/${project?.id}`} className="btn-primary btn btn-sm">
                        {sedangBerjalan ? 'Lanjutkan Tes' : 'Mulai Tes'}
                      </Link>
                    ) : (
                      <span className="badge-gray px-3 py-1.5">
                        {project?.status === 'draft' ? 'Belum dibuka' : 'Ditutup'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <p className="text-3xl mb-3">📋</p>
          <p className="text-neutral-500 text-sm">Belum ada tes yang ditugaskan</p>
          <p className="text-neutral-400 text-xs mt-1">Hubungi penyelenggara untuk mendapatkan akses ke tes</p>
        </div>
      )}
    </div>
  )
}
