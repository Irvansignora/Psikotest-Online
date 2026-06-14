'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import Papa from 'papaparse'

export default function TambahPesertaModal({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'email' | 'csv'>('email')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function handleTambahSatu() {
    if (!email.trim()) return
    setLoading(true)
    try {
      // Find user by email
      const { data: user, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.trim().toLowerCase())
        .single()

      if (error || !user) throw new Error('User dengan email tersebut tidak ditemukan')

      const { error: insertErr } = await supabase.from('project_peserta').insert({
        project_id: projectId,
        user_id: user.id,
      })
      if (insertErr) throw new Error('Peserta sudah terdaftar atau terjadi kesalahan')

      toast.success('Peserta berhasil ditambahkan')
      setEmail('')
      setOpen(false)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleImportCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const emails: string[] = results.data.map((row: any) =>
          (row.email || row.Email || '').trim().toLowerCase()
        ).filter(Boolean)

        if (emails.length === 0) {
          toast.error('Tidak ada email valid dalam file')
          setLoading(false)
          return
        }

        let sukses = 0, gagal = 0
        for (const em of emails) {
          const { data: user } = await supabase.from('profiles').select('id').eq('email', em).single()
          if (!user) { gagal++; continue }
          const { error } = await supabase.from('project_peserta').insert({ project_id: projectId, user_id: user.id })
          if (error) gagal++; else sukses++
        }

        toast.success(`${sukses} peserta ditambahkan, ${gagal} gagal`)
        setOpen(false)
        router.refresh()
        setLoading(false)
      },
      error: () => {
        toast.error('Gagal membaca file CSV')
        setLoading(false)
      }
    })
  }

  if (!open) return (
    <button onClick={() => setOpen(true)} className="btn-primary btn">
      + Tambah Peserta
    </button>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl border border-neutral-200 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-neutral-100">
          <h2 className="font-semibold text-neutral-900 text-sm">Tambah Peserta</h2>
          <button onClick={() => setOpen(false)} className="text-neutral-400 hover:text-neutral-600 text-lg leading-none">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-100">
          {['email', 'csv'].map(t => (
            <button key={t} onClick={() => setTab(t as any)}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors ${tab === t ? 'border-b-2 border-brand-600 text-brand-700' : 'text-neutral-500 hover:text-neutral-700'}`}>
              {t === 'email' ? 'Tambah per Email' : 'Import CSV'}
            </button>
          ))}
        </div>

        <div className="p-5">
          {tab === 'email' ? (
            <div className="space-y-3">
              <div>
                <label className="form-label">Email Peserta</label>
                <input type="email" className="form-input" placeholder="peserta@email.com"
                  value={email} onChange={e => setEmail(e.target.value)} />
                <p className="form-hint">Peserta harus sudah terdaftar di sistem</p>
              </div>
              <button onClick={handleTambahSatu} disabled={loading || !email} className="btn-primary btn w-full">
                {loading ? 'Menambahkan...' : 'Tambahkan'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="form-label">Upload File CSV/Excel</label>
                <div className="border-2 border-dashed border-neutral-200 rounded-lg p-6 text-center">
                  <p className="text-xs text-neutral-500 mb-3">File harus memiliki kolom <code className="bg-neutral-100 px-1 rounded">email</code></p>
                  <input type="file" accept=".csv,.xlsx,.xls" onChange={handleImportCSV}
                    className="text-xs text-neutral-600" disabled={loading} />
                </div>
                <p className="form-hint">Format: kolom pertama berisi email peserta</p>
              </div>
              {loading && <p className="text-xs text-neutral-500 text-center">Memproses...</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
