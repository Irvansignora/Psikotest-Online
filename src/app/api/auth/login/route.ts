import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'

function dashboardPath(role?: string) {
  if (role === 'master_admin') return '/dashboard/admin'
  if (role === 'klien') return '/dashboard/klien'
  return '/dashboard/user'
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 })
    }

    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      return NextResponse.json({ error: error.message || 'Login gagal' }, { status: 401 })
    }

    let role = data.user?.user_metadata?.role || 'user'

    if (data.user && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const adminClient = createAdminClient()
      const { data: profile } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle()

      role = profile?.role || role
    }

    return NextResponse.json({
      role,
      redirectTo: dashboardPath(role),
      userId: data.user?.id,
      email: data.user?.email,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Login gagal' }, { status: 500 })
  }
}
