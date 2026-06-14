import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

export default async function AdminPesertaPage() {
  const supabase = createClient()
  const { data: users } = await supabase
    .from('profiles')
    .select('*, sesi_tes(count), project_peserta(count)')
    .eq('role', 'user')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Semua Peserta</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{users?.length ?? 0} peserta terdaftar</p>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>#</th><th>Nama</th><th>Email</th><th>Organisasi</th>
                <th>Project</th><th>Sesi Tes</th><th>Status</th><th>Terdaftar</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((u: any, i: number) => (
                <tr key={u.id}>
                  <td className="text-neutral-400 text-xs">{i + 1}</td>
                  <td className="font-medium text-neutral-800">{u.full_name}</td>
                  <td className="text-neutral-500 text-xs">{u.email}</td>
                  <td className="text-neutral-400 text-xs">{u.organization || '—'}</td>
                  <td className="text-neutral-500 text-xs">{u.project_peserta?.[0]?.count ?? 0}</td>
                  <td className="text-neutral-500 text-xs">{u.sesi_tes?.[0]?.count ?? 0}</td>
                  <td>{u.is_active
                    ? <span className="badge-green">Aktif</span>
                    : <span className="badge-red">Nonaktif</span>
                  }</td>
                  <td className="text-neutral-400 text-xs">{formatDate(u.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
