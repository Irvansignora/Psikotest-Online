import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'

export default async function AdminDashboard() {
  const supabase = createClient()

  const [
    { count: totalUsers },
    { count: totalProjects },
    { count: totalSesi },
    { data: recentProjects }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'user'),
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('sesi_tes').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('id, nama, status, created_at, kode_project').order('created_at', { ascending: false }).limit(5)
  ])

  const stats = [
    { label: 'Total Peserta', value: totalUsers ?? 0, icon: '👥', color: 'bg-blue-50 text-blue-700' },
    { label: 'Total Project', value: totalProjects ?? 0, icon: '📁', color: 'bg-green-50 text-green-700' },
    { label: 'Total Sesi Tes', value: totalSesi ?? 0, icon: '✅', color: 'bg-purple-50 text-purple-700' },
  ]

  const statusLabel: Record<string, string> = {
    draft: 'Draft', aktif: 'Aktif', selesai: 'Selesai', arsip: 'Arsip'
  }
  const statusBadge: Record<string, string> = {
    draft: 'badge-gray', aktif: 'badge-green', selesai: 'badge-blue', arsip: 'badge-yellow'
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-neutral-900">Dashboard Admin</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Ringkasan aktivitas platform</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="card p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${s.color}`}>
              {s.icon}
            </div>
            <div>
              <p className="text-2xl font-semibold text-neutral-900">{s.value.toLocaleString('id-ID')}</p>
              <p className="text-xs text-neutral-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Projects */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="font-semibold text-neutral-800 text-sm">Project Terbaru</h2>
          <a href="/dashboard/admin/project" className="text-xs text-brand-600 hover:underline">Lihat semua →</a>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Nama Project</th>
                <th>Kode</th>
                <th>Status</th>
                <th>Dibuat</th>
              </tr>
            </thead>
            <tbody>
              {recentProjects && recentProjects.length > 0 ? recentProjects.map(p => (
                <tr key={p.id}>
                  <td className="font-medium text-neutral-800">{p.nama}</td>
                  <td>
                    <span className="font-mono text-xs bg-neutral-100 px-2 py-0.5 rounded">
                      {p.kode_project || '-'}
                    </span>
                  </td>
                  <td>
                    <span className={statusBadge[p.status as string] || 'badge-gray'}>
                      {statusLabel[p.status as string] || p.status}
                    </span>
                  </td>
                  <td className="text-neutral-500 text-xs">{formatDate(p.created_at)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="text-center text-neutral-400 py-8">
                    Belum ada project
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
