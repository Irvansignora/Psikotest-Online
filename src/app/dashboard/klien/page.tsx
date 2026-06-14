import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export default async function KlienDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [
    { count: totalProject },
    { count: totalPeserta },
    { count: totalSesi },
    { data: recentProjects }
  ] = await Promise.all([
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('owner_id', user!.id),
    supabase.from('project_peserta').select('*, project:projects!inner(owner_id)', { count: 'exact', head: true })
      .eq('project.owner_id', user!.id),
    supabase.from('sesi_tes').select('*, project:projects!inner(owner_id)', { count: 'exact', head: true })
      .eq('project.owner_id', user!.id).eq('status', 'selesai'),
    supabase.from('projects').select('id, nama, status, created_at').eq('owner_id', user!.id)
      .order('created_at', { ascending: false }).limit(5)
  ])

  const stats = [
    { label: 'Total Project', value: totalProject ?? 0, icon: '📁', color: 'bg-blue-50 text-blue-700' },
    { label: 'Total Peserta', value: totalPeserta ?? 0, icon: '👥', color: 'bg-green-50 text-green-700' },
    { label: 'Tes Selesai', value: totalSesi ?? 0, icon: '✅', color: 'bg-purple-50 text-purple-700' },
  ]

  const statusBadge: Record<string, string> = {
    draft: 'badge-gray', aktif: 'badge-green', selesai: 'badge-blue', arsip: 'badge-yellow'
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-neutral-900">Dashboard Klien</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Ringkasan aktivitas project Anda</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="card p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${s.color}`}>{s.icon}</div>
            <div>
              <p className="text-2xl font-semibold text-neutral-900">{s.value.toLocaleString('id-ID')}</p>
              <p className="text-xs text-neutral-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="font-semibold text-neutral-800 text-sm">Project Terbaru</h2>
          <Link href="/dashboard/klien/project" className="text-xs text-brand-600 hover:underline">Lihat semua →</Link>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr><th>Nama Project</th><th>Status</th><th>Dibuat</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {recentProjects && recentProjects.length > 0 ? recentProjects.map((p: any) => (
                <tr key={p.id}>
                  <td className="font-medium text-neutral-800">{p.nama}</td>
                  <td><span className={statusBadge[p.status] || 'badge-gray'}>{p.status}</span></td>
                  <td className="text-neutral-400 text-xs">{formatDate(p.created_at)}</td>
                  <td>
                    <Link href={`/dashboard/klien/project/${p.id}/peserta`} className="btn-ghost btn btn-sm">
                      Peserta
                    </Link>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="text-center text-neutral-400 py-8">Belum ada project</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
