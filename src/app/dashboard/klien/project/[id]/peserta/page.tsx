import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatDateTime } from '@/lib/utils'
import ExportPesertaButton from '@/components/admin/ExportPesertaButton'
import TambahPesertaModal from '@/components/admin/TambahPesertaModal'

export default async function KlienProjectPesertaPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: project } = await supabase
    .from('projects')
    .select('id, nama, kode_project, status, owner_id')
    .eq('id', params.id)
    .single()

  if (!project || project.owner_id !== user!.id) redirect('/dashboard/klien')

  const { data: peserta } = await supabase
    .from('project_peserta')
    .select('*, user:profiles(id, full_name, email, phone, organization), sesi_tes:sesi_tes(id, status, skor_total, mulai_at, selesai_at, durasi_aktual)')
    .eq('project_id', params.id)
    .order('terdaftar_at', { ascending: false })

  const statusBadge: Record<string, string> = {
    belum_mulai: 'badge-gray', berjalan: 'badge-yellow', selesai: 'badge-green', dibatalkan: 'badge-red'
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/dashboard/klien/project" className="text-xs text-neutral-500 hover:text-neutral-700">← Project</Link>
          <h1 className="text-xl font-semibold text-neutral-900 mt-1">Peserta: {project.nama}</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{peserta?.length ?? 0} peserta terdaftar</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportPesertaButton projectId={params.id} projectNama={project.nama} />
          <TambahPesertaModal projectId={params.id} />
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>#</th><th>Nama</th><th>Email</th><th>Org.</th>
                <th>Status Tes</th><th>Skor</th><th>Durasi</th><th>Selesai</th>
              </tr>
            </thead>
            <tbody>
              {peserta && peserta.length > 0 ? peserta.map((p: any, i: number) => {
                const sesi = p.sesi_tes?.[0]
                const durasi = sesi?.durasi_aktual
                  ? `${Math.floor(sesi.durasi_aktual / 60)}m ${sesi.durasi_aktual % 60}d`
                  : '—'
                return (
                  <tr key={p.id}>
                    <td className="text-neutral-400 text-xs">{i + 1}</td>
                    <td className="font-medium text-neutral-800 text-sm">{p.user?.full_name}</td>
                    <td className="text-neutral-500 text-xs">{p.user?.email}</td>
                    <td className="text-neutral-400 text-xs">{p.user?.organization || '—'}</td>
                    <td>
                      {sesi
                        ? <span className={statusBadge[sesi.status] || 'badge-gray'}>{sesi.status.replace(/_/g, ' ')}</span>
                        : <span className="badge-gray">Belum mulai</span>
                      }
                    </td>
                    <td className="font-mono text-sm">{sesi?.skor_total != null ? sesi.skor_total.toFixed(1) : '—'}</td>
                    <td className="text-neutral-400 text-xs">{durasi}</td>
                    <td className="text-neutral-400 text-xs">{sesi?.selesai_at ? formatDateTime(sesi.selesai_at) : '—'}</td>
                  </tr>
                )
              }) : (
                <tr>
                  <td colSpan={8} className="text-center text-neutral-400 py-10">
                    Belum ada peserta. Tambahkan peserta terlebih dahulu.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
