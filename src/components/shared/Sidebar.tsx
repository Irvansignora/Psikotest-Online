'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

interface SidebarProps {
  navItems: NavItem[]
  role: string
  userName: string
  userEmail: string
}

export function Sidebar({ navItems, role, userName, userEmail }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    toast.success('Berhasil keluar')
    router.push('/login')
    router.refresh()
  }

  const roleLabel = {
    master_admin: 'Master Admin',
    klien: 'Klien',
    user: 'Peserta'
  }[role] || role

  return (
    <aside className="w-56 shrink-0 bg-white border-r border-neutral-200 flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-brand-600 rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-xs">P</span>
          </div>
          <span className="font-semibold text-neutral-800 text-sm">PsikoTest</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'sidebar-item',
              pathname === item.href || pathname.startsWith(item.href + '/') ? 'active' : ''
            )}
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* User info */}
      <div className="px-3 py-3 border-t border-neutral-100">
        <div className="px-3 py-2 rounded-md bg-neutral-50 mb-2">
          <p className="text-xs font-medium text-neutral-800 truncate">{userName}</p>
          <p className="text-xs text-neutral-400 truncate">{userEmail}</p>
          <span className="badge-gray badge mt-1">{roleLabel}</span>
        </div>
        <button onClick={handleLogout} className="sidebar-item w-full text-red-500 hover:bg-red-50 hover:text-red-600">
          <span>🚪</span>
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  )
}
