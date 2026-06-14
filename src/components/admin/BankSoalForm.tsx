'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function BankSoalForm({ bankId }: { bankId?: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ nama: '', deskripsi: '', kategori: '', is_public: false })

  useEffect(() => {
    if (bankId) {
      supabase.from('bank_soal').select('*').eq('id', bankId).single()
        .then(({ data }) => { if (data) setForm(data) })
    }
  }, [bankId])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const target = e.target as HTMLInputElement
    setForm(f => ({ ...f, [target.name]: target.type === 'checkbox' ? target.checked : target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (bankId) {
        const { error } = await supabase.from('bank_soal').update(form).eq('id', bankId)
        if (error) throw error
        toast.success('Bank soal diperbarui')
      } else {
        const { error } = await supabase.from('bank_soal').insert({ ...form, owner_id: user!.id })
        if (error) throw error
        toast.success('Bank soal dibuat')
      }
      router.push('/dashboard/admin/bank-soal')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
      <div className="card">
        <div className="card-body space-y-4">
          <div>
            <label className="form-label">Nama Bank Soal <span className="text-red-500">*</span></label>
            <input name="nama" className="form-input" required value={form.nama} onChange={handleChange} placeholder="cth: Skala Kecemasan Beck" />
          </div>
          <div>
            <label className="form-label">Kategori / Dimensi</label>
            <input name="kategori" className="form-input" value={form.kategori} onChange={handleChange} placeholder="cth: Kepribadian, Kecerdasan, Minat..." />
          </div>
          <div>
            <label className="form-label">Deskripsi</label>
            <textarea name="deskripsi" className="form-input" rows={4} value={form.deskripsi} onChange={handleChange} placeholder="Jelaskan konstruk psikologi yang diukur..." />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${form.is_public ? 'bg-brand-600 border-brand-600' : 'border-neutral-300 bg-white'}`}>
              {form.is_public && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
            </div>
            <input type="checkbox" name="is_public" className="sr-only" checked={form.is_public} onChange={handleChange} />
            <div>
              <p className="text-sm font-medium text-neutral-700">Bank Soal Publik</p>
              <p className="text-xs text-neutral-400">Dapat digunakan oleh klien lain</p>
            </div>
          </label>
        </div>
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="btn-primary btn">
          {loading ? 'Menyimpan...' : bankId ? 'Simpan Perubahan' : 'Buat Bank Soal'}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary btn">Batal</button>
      </div>
    </form>
  )
}
