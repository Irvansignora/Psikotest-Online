'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      toast.error('Password tidak cocok')
      return
    }
    if (form.password.length < 6) {
      toast.error('Password minimal 6 karakter')
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { full_name: form.full_name, role: 'user' }
        }
      })
      if (error) throw error
      toast.success('Pendaftaran berhasil! Silakan masuk.')
      router.push('/login')
    } catch (err: any) {
      toast.error(err.message || 'Pendaftaran gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="card-header text-center">
        <h1 className="font-semibold text-neutral-900">Buat Akun Baru</h1>
        <p className="text-xs text-neutral-500 mt-1">Daftar sebagai peserta tes</p>
      </div>
      <div className="card-body">
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="form-label">Nama Lengkap</label>
            <input name="full_name" type="text" className="form-input" placeholder="Nama lengkap Anda"
              value={form.full_name} onChange={handleChange} required />
          </div>
          <div>
            <label className="form-label">Email</label>
            <input name="email" type="email" className="form-input" placeholder="nama@email.com"
              value={form.email} onChange={handleChange} required />
          </div>
          <div>
            <label className="form-label">Password</label>
            <input name="password" type="password" className="form-input" placeholder="Minimal 6 karakter"
              value={form.password} onChange={handleChange} required />
          </div>
          <div>
            <label className="form-label">Konfirmasi Password</label>
            <input name="confirmPassword" type="password" className="form-input" placeholder="Ulangi password"
              value={form.confirmPassword} onChange={handleChange} required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary btn w-full">
            {loading ? 'Memproses...' : 'Daftar Sekarang'}
          </button>
        </form>
        <p className="text-center text-xs text-neutral-500 mt-4">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-brand-600 hover:underline font-medium">Masuk</Link>
        </p>
      </div>
    </div>
  )
}
