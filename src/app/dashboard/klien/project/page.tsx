import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export default async function KlienProjectPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: projects } = await supabase
    .from('projects')
    .select('*, paket_tes:paket_tes(nama), project_peserta(count), sesi_tes(count)')
    .eq('owner_id', user!.id)
    .order('created_at', { ascending: false })

  const statusBadge: Record<string, string> = {
    draft: 'badge-gray', aktif: 'badge-green', selesai: 'badge-blue', arsip: 'badge-yellow'
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-neutral-900">Project Saya</h1>
        <p className="text-sm text-neutral-500 mt-0.5">{projects?.length ?? 0} project</p>
      </div>

      <div className="grid gap-4">
        {projects && projects.length > 0 ? projects.map((p: any) => (
          <div key={p.id} className="card p-5 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-neutral-800">{p.nama}</h3>
                <span className={statusBadge[p.status] || 'badge-gray'}>{p.status}</span>
              </div>
              <p className="text-xs text-neutral-500">
                {p.paket_tes?.nama || 'Belum ada paket tes'} ·{' '}
                {p.project_peserta?.[0]?.count ?? 0} peserta ·{' '}
                {p.sesi_tes?.[0]?.count ?? 0} sesi ·{' '}
                {formatDate(p.created_at)}
              </p>
            </div>
            <Link href={`/dashboard/klien/project/${p.id}/peserta`} className="btn-primary btn btn-sm shrink-0">
              Kelola Peserta
            </Link>
          </div>
        )) : (
          <div className="card p-12 text-center">
            <p className="text-neutral-400 text-sm">Belum ada project yang ditugaskan ke Anda</p>
            <p className="text-xs text-neutral-300 mt-1">Hubungi Master Admin untuk mendapatkan akses project</p>
          </div>
        )}
      </div>
    </div>
  )
}
