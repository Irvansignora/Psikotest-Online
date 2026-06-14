import { createClient } from '@/lib/supabase/server'
import { formatDateTime } from '@/lib/utils'

export default async function KlienPesertaPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: peserta } = await supabase
    .from('project_peserta')
    .select('*, project:projects!inner(id, nama, owner_id), user:profiles(full_name, email, organization), sesi_tes:sesi_tes(status, skor_total, selesai_at)')
    .eq('project.owner_id', user!.id)
    .order('terdaftar_at', { ascending: false })

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-neutral-900">Semua Peserta</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          {peserta?.length ?? 0} peserta dari semua project Anda
        </p>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>#</th><th>Nama</th><th>Email</th>
                <th>Project</th><th>Status Tes</th><th>Skor</th><th>Selesai</th>
              </tr>
            </thead>
            <tbody>
              {peserta && peserta.length > 0 ? peserta.map((p: any, i: number) => {
                const sesi = p.sesi_tes?.[0]
                const statusBadge: Record<string, string> = {
                  belum_mulai: 'badge-gray', berjalan: 'badge-yellow',
                  selesai: 'badge-green', dibatalkan: 'badge-red'
                }
                return (
                  <tr key={p.id}>
                    <td className="text-neutral-400 text-xs">{i + 1}</td>
                    <td className="font-medium text-neutral-800 text-sm">{p.user?.full_name}</td>
                    <td className="text-neutral-500 text-xs">{p.user?.email}</td>
                    <td className="text-neutral-500 text-xs">{p.project?.nama}</td>
                    <td>
                      {sesi
                        ? <span className={statusBadge[sesi.status] || 'badge-gray'}>{sesi.status.replace(/_/g, ' ')}</span>
                        : <span className="badge-gray">Belum mulai</span>}
                    </td>
                    <td className="font-mono text-sm">{sesi?.skor_total != null ? sesi.skor_total.toFixed(1) : '—'}</td>
                    <td className="text-neutral-400 text-xs">{sesi?.selesai_at ? formatDateTime(sesi.selesai_at) : '—'}</td>
                  </tr>
                )
              }) : (
                <tr><td colSpan={7} className="text-center text-neutral-400 py-10">Belum ada peserta</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
