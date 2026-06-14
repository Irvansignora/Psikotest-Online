import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDateTime } from '@/lib/utils'

export default async function AdminProjectPage() {
  const supabase = createClient()
  const { data: projects } = await supabase
    .from('projects')
    .select('*, paket_tes(nama), owner:profiles(full_name)')
    .order('created_at', { ascending: false })

  const statusBadge: Record<string, string> = {
    draft: 'badge-gray', aktif: 'badge-green', selesai: 'badge-blue', arsip: 'badge-yellow'
  }
  const statusLabel: Record<string, string> = {
    draft: 'Draft', aktif: 'Aktif', selesai: 'Selesai', arsip: 'Arsip'
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Manajemen Project</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{projects?.length ?? 0} project terdaftar</p>
        </div>
        <Link href="/dashboard/admin/project/baru" className="btn-primary btn">
          + Buat Project
        </Link>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Nama Project</th>
                <th>Kode</th>
                <th>Paket Tes</th>
                <th>Status</th>
                <th>Tgl Mulai</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {projects && projects.length > 0 ? projects.map((p: any) => (
                <tr key={p.id}>
                  <td className="font-medium text-neutral-800">{p.nama}</td>
                  <td>
                    <span className="font-mono text-xs bg-neutral-100 px-2 py-0.5 rounded">
                      {p.kode_project || '—'}
                    </span>
                  </td>
                  <td className="text-neutral-500 text-xs">{p.paket_tes?.nama || '—'}</td>
                  <td>
                    <span className={statusBadge[p.status] || 'badge-gray'}>
                      {statusLabel[p.status] || p.status}
                    </span>
                  </td>
                  <td className="text-neutral-500 text-xs">
                    {p.tanggal_mulai ? formatDateTime(p.tanggal_mulai) : '—'}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/admin/project/${p.id}`} className="btn-ghost btn btn-sm">
                        Edit
                      </Link>
                      <Link href={`/dashboard/admin/project/${p.id}/peserta`} className="btn-secondary btn btn-sm">
                        Peserta
                      </Link>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="text-center text-neutral-400 py-10">
                    Belum ada project. <Link href="/dashboard/admin/project/baru" className="text-brand-600 hover:underline">Buat project baru →</Link>
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
