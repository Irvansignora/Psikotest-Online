import { createClient } from '@/lib/supabase/server'
import { formatDateTime } from '@/lib/utils'
import Link from 'next/link'

export default async function ProctoringMonitorPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const [{ data: project }, { data: sesiAktif }] = await Promise.all([
    supabase.from('projects').select('id, nama').eq('id', params.id).single(),
    supabase.from('sesi_tes')
      .select('*, user:profiles(full_name, email), proctoring_logs(tipe, created_at, foto_url)')
      .eq('project_id', params.id)
      .in('status', ['berjalan', 'selesai'])
      .order('mulai_at', { ascending: false })
  ])

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/dashboard/admin/project" className="text-xs text-neutral-500 hover:text-neutral-700">← Project</Link>
          <h1 className="text-xl font-semibold text-neutral-900 mt-1">Monitor Proctoring: {project?.nama}</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            {sesiAktif?.filter(s => s.status === 'berjalan').length ?? 0} peserta sedang aktif
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {sesiAktif && sesiAktif.length > 0 ? sesiAktif.map((sesi: any) => {
          const violations = sesi.proctoring_logs?.filter((l: any) => l.tipe !== 'foto') || []
          const fotos = sesi.proctoring_logs?.filter((l: any) => l.tipe === 'foto') || []

          return (
            <div key={sesi.id} className="card p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-neutral-800">{sesi.user?.full_name}</p>
                    <span className={sesi.status === 'berjalan' ? 'badge-green' : 'badge-gray'}>
                      {sesi.status === 'berjalan' ? '🟢 Aktif' : 'Selesai'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400">{sesi.user?.email}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Mulai: {sesi.mulai_at ? formatDateTime(sesi.mulai_at) : '—'}
                    {sesi.selesai_at && ` · Selesai: ${formatDateTime(sesi.selesai_at)}`}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  {violations.length > 0 && (
                    <span className="badge-red">⚠ {violations.length} pelanggaran</span>
                  )}
                  {sesi.skor_total != null && (
                    <p className="text-lg font-bold text-neutral-800 mt-1">{sesi.skor_total.toFixed(1)}</p>
                  )}
                </div>
              </div>

              {/* Violations */}
              {violations.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-neutral-600 mb-1.5">Log Pelanggaran:</p>
                  <div className="flex flex-wrap gap-2">
                    {violations.slice(0, 8).map((v: any, i: number) => (
                      <span key={i} className="text-xs bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded">
                        {v.tipe.replace(/_/g, ' ')} · {new Date(v.created_at).toLocaleTimeString('id-ID')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Proctoring photos */}
              {fotos.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-neutral-600 mb-1.5">Foto Proctoring ({fotos.length}):</p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {fotos.slice(-6).map((f: any, i: number) => (
                      <div key={i} className="shrink-0">
                        <img src={f.foto_url} className="w-20 h-14 object-cover rounded border border-neutral-200" alt="proctoring" />
                        <p className="text-xs text-neutral-400 text-center mt-0.5">
                          {new Date(f.created_at).toLocaleTimeString('id-ID')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        }) : (
          <div className="card p-12 text-center">
            <p className="text-neutral-400 text-sm">Belum ada sesi aktif untuk project ini</p>
          </div>
        )}
      </div>
    </div>
  )
}
