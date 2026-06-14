import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import BuatUserModal from '@/components/admin/BuatUserModal'

export default async function PenggunaPage() {
  const supabase = createClient()
  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  const roleLabel: Record<string, string> = { master_admin: 'Master Admin', klien: 'Klien', user: 'Peserta' }
  const roleBadge: Record<string, string> = { master_admin: 'badge-red', klien: 'badge-blue', user: 'badge-gray' }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Manajemen Pengguna</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{users?.length ?? 0} pengguna terdaftar</p>
        </div>
        <BuatUserModal />
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Nama</th><th>Email</th><th>Role</th><th>Organisasi</th><th>Status</th><th>Terdaftar</th>
              </tr>
            </thead>
            <tbody>
              {users?.map(u => (
                <tr key={u.id}>
                  <td className="font-medium text-neutral-800">{u.full_name}</td>
                  <td className="text-neutral-500 text-xs">{u.email}</td>
                  <td><span className={roleBadge[u.role] || 'badge-gray'}>{roleLabel[u.role] || u.role}</span></td>
                  <td className="text-neutral-500 text-xs">{u.organization || '—'}</td>
                  <td>
                    {u.is_active
                      ? <span className="badge-green">Aktif</span>
                      : <span className="badge-red">Nonaktif</span>}
                  </td>
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
