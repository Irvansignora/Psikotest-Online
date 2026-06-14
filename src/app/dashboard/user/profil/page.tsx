'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function ProfilPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ full_name: '', phone: '', organization: '' })
  const [email, setEmail] = useState('')
  const [pwForm, setPwForm] = useState({ current: '', baru: '', konfirmasi: '' })
  const [pwLoading, setPwLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setEmail(user.email || '')
      supabase.from('profiles').select('full_name, phone, organization').eq('id', user.id).single()
        .then(({ data }) => { if (data) setForm(data) })
    })
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('profiles').update(form).eq('id', user!.id)
      if (error) throw error
      toast.success('Profil berhasil diperbarui')
    } catch (err: any) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  async function handleGantiPassword(e: React.FormEvent) {
    e.preventDefault()
    if (pwForm.baru !== pwForm.konfirmasi) { toast.error('Password baru tidak cocok'); return }
    if (pwForm.baru.length < 6) { toast.error('Password minimal 6 karakter'); return }
    setPwLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: pwForm.baru })
      if (error) throw error
      toast.success('Password berhasil diubah')
      setPwForm({ current: '', baru: '', konfirmasi: '' })
    } catch (err: any) { toast.error(err.message) }
    finally { setPwLoading(false) }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-neutral-900">Profil Saya</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Kelola informasi akun Anda</p>
      </div>

      <div className="card">
        <div className="card-header"><h2 className="font-semibold text-sm text-neutral-800">Informasi Pribadi</h2></div>
        <form onSubmit={handleSave} className="card-body space-y-4">
          <div>
            <label className="form-label">Email</label>
            <input className="form-input" value={email} disabled />
            <p className="form-hint">Email tidak dapat diubah</p>
          </div>
          <div>
            <label className="form-label">Nama Lengkap</label>
            <input className="form-input" required value={form.full_name}
              onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">No. HP</label>
              <input className="form-input" value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="08xx..." />
            </div>
            <div>
              <label className="form-label">Organisasi / Instansi</label>
              <input className="form-input" value={form.organization}
                onChange={e => setForm(f => ({ ...f, organization: e.target.value }))} />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary btn">
            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </form>
      </div>

      <div className="card">
        <div className="card-header"><h2 className="font-semibold text-sm text-neutral-800">Ganti Password</h2></div>
        <form onSubmit={handleGantiPassword} className="card-body space-y-4">
          <div>
            <label className="form-label">Password Baru</label>
            <input type="password" className="form-input" value={pwForm.baru} minLength={6}
              onChange={e => setPwForm(f => ({ ...f, baru: e.target.value }))} placeholder="Minimal 6 karakter" />
          </div>
          <div>
            <label className="form-label">Konfirmasi Password Baru</label>
            <input type="password" className="form-input" value={pwForm.konfirmasi}
              onChange={e => setPwForm(f => ({ ...f, konfirmasi: e.target.value }))} placeholder="Ulangi password baru" />
          </div>
          <button type="submit" disabled={pwLoading} className="btn-secondary btn">
            {pwLoading ? 'Mengubah...' : 'Ubah Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
