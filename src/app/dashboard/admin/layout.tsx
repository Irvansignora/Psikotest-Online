import { redirect } from 'next/navigation'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/shared/Sidebar'

const adminNav = [
  { href: '/dashboard/admin', label: 'Dashboard', icon: '📊' },
  { href: '/dashboard/admin/peserta', label: 'Peserta', icon: '👥' },
  { href: '/dashboard/admin/project', label: 'Project', icon: '📁' },
  { href: '/dashboard/admin/bank-soal', label: 'Bank Soal', icon: '📝' },
  { href: '/dashboard/admin/paket-tes', label: 'Paket Tes', icon: '📦' },
  { href: '/dashboard/admin/pengguna', label: 'Manajemen User', icon: '🔑' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profileClient = process.env.SUPABASE_SERVICE_ROLE_KEY ? createAdminClient() : supabase
  const { data: profile } = await profileClient
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role !== 'master_admin') redirect('/unauthorized')

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      <Sidebar
        navItems={adminNav}
        role="master_admin"
        userName={profile?.full_name || ''}
        userEmail={profile?.email || user.email || ''}
      />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
