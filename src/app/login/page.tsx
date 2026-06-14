'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [loginInfo, setLoginInfo] = useState('')
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setLoginInfo('Memverifikasi akun...')
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        cache: 'no-store',
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Login gagal')

      const roleLabel =
        result.role === 'master_admin'
          ? 'Admin'
          : result.role === 'klien'
            ? 'Klien'
            : 'User'

      setLoginInfo(`Login berhasil sebagai ${roleLabel}. Mengarahkan ke ${result.redirectTo}...`)
      toast.success(`Masuk sebagai ${roleLabel}`)

      router.refresh()
      router.replace(result.redirectTo)
    } catch (err: any) {
      setLoginInfo(err.message || 'Login gagal')
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
          {loginInfo && (
            <p className="text-xs text-neutral-500 text-center">{loginInfo}</p>
          )}
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
