import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/shared/Sidebar'

const userNav = [
  { href: '/dashboard/user', label: 'Dashboard', icon: '🏠' },
  { href: '/dashboard/user/riwayat', label: 'Riwayat Tes', icon: '📋' },
  { href: '/dashboard/user/profil', label: 'Profil Saya', icon: '👤' },
]

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      <Sidebar navItems={userNav} role="user" userName={profile?.full_name || ''} userEmail={profile?.email || ''} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
