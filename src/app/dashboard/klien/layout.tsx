import { redirect } from 'next/navigation'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/shared/Sidebar'

const klienNav = [
  { href: '/dashboard/klien', label: 'Dashboard', icon: '📊' },
  { href: '/dashboard/klien/project', label: 'Project Saya', icon: '📁' },
  { href: '/dashboard/klien/peserta', label: 'Data Peserta', icon: '👥' },
]

export default async function KlienLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profileClient = process.env.SUPABASE_SERVICE_ROLE_KEY ? createAdminClient() : supabase
  const { data: profile } = await profileClient.from('profiles').select('*').eq('id', user.id).maybeSingle()
  if (!['master_admin', 'klien'].includes(profile?.role)) redirect('/unauthorized')

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      <Sidebar navItems={klienNav} role="klien" userName={profile?.full_name || ''} userEmail={profile?.email || user.email || ''} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
