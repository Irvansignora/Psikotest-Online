'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function BuatUserModal() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'user', organization: '', phone: '' })
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Pengguna berhasil dibuat')
      setOpen(false)
      setForm({ full_name: '', email: '', password: '', role: 'user', organization: '', phone: '' })
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!open) return (
    <button onClick={() => setOpen(true)} className="btn-primary btn">+ Buat Pengguna</button>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl border border-neutral-200 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-neutral-100">
          <h2 className="font-semibold text-neutral-900 text-sm">Buat Pengguna Baru</h2>
          <button onClick={() => setOpen(false)} className="text-neutral-400 hover:text-neutral-600">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="form-label">Nama Lengkap</label>
              <input className="form-input" required value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="form-label">Password Awal</label>
              <input type="password" className="form-input" required minLength={6} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Role</label>
              <select className="form-input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="user">Peserta</option>
                <option value="klien">Klien</option>
                <option value="master_admin">Master Admin</option>
              </select>
            </div>
            <div>
              <label className="form-label">No. HP</label>
              <input className="form-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="08xx..." />
            </div>
            <div className="col-span-2">
              <label className="form-label">Organisasi / Instansi</label>
              <input className="form-input" value={form.organization} onChange={e => setForm(f => ({ ...f, organization: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary btn flex-1">
              {loading ? 'Membuat...' : 'Buat Pengguna'}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="btn-secondary btn">Batal</button>
          </div>
        </form>
      </div>
    </div>
  )
}
