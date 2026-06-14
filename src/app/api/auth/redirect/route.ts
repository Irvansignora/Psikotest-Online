import { NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'

function dashboardPath(role?: string) {
  if (role === 'master_admin') return '/dashboard/admin'
  if (role === 'klien') return '/dashboard/klien'
  return '/dashboard/user'
}

export async function GET() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let role = user.user_metadata?.role || 'user'

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const adminClient = createAdminClient()
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    role = profile?.role || role
  }

  return NextResponse.json({ redirectTo: dashboardPath(role) })
}
