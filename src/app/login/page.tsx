'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      await supabase.auth.getSession()

      const fallbackRole = data.user.user_metadata?.role || 'user'
      let redirectTo =
        fallbackRole === 'master_admin'
          ? '/dashboard/admin'
          : fallbackRole === 'klien'
            ? '/dashboard/klien'
            : '/dashboard/user'

      try {
        const response = await fetch('/api/auth/redirect', { cache: 'no-store' })
        if (response.ok) {
          const data = await response.json()
          redirectTo = data.redirectTo || redirectTo
        }
      } catch {}

      router.refresh()
      router.replace(redirectTo)
    } catch (err: any) {
      toast.error(err.message || 'Login gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="card-header text-center">
        <h1 className="font-semibold text-neutral-900">Masuk ke Akun</h1>
        <p className="text-xs text-neutral-500 mt-1">Gunakan email dan password yang terdaftar</p>
      </div>
      <div className="card-body">
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="nama@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary btn w-full">
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
        <p className="text-center text-xs text-neutral-500 mt-4">
          Belum punya akun?{' '}
          <Link href="/register" className="text-brand-600 hover:underline font-medium">
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  )
}
