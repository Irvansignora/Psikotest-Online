'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { generateKode } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { PaketTes } from '@/types'

interface ProjectFormProps {
  projectId?: string
}

export default function ProjectForm({ projectId }: ProjectFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [paketList, setPaketList] = useState<PaketTes[]>([])
  const [form, setForm] = useState({
    nama: '',
    deskripsi: '',
    kode_project: generateKode('PRJ'),
    paket_tes_id: '',
    status: 'draft',
    tanggal_mulai: '',
    tanggal_selesai: '',
    proctoring_kamera: true,
    proctoring_fullscreen: true,
    proctoring_anti_tab: true,
    proctoring_rekam_foto: false,
    proctoring_interval_foto: 30,
    max_peserta: '',
    allow_registrasi_mandiri: false,
    pesan_selamat_datang: '',
    pesan_selesai: '',
  })

  useEffect(() => {
    supabase.from('paket_tes').select('id, nama').then(({ data }) => setPaketList(data || []))
    if (projectId) loadProject()
  }, [projectId])

  async function loadProject() {
    const { data } = await supabase.from('projects').select('*').eq('id', projectId).single()
    if (data) setForm({ ...data, max_peserta: data.max_peserta?.toString() || '' })
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const target = e.target as HTMLInputElement
    const value = target.type === 'checkbox' ? target.checked : target.value
    setForm(f => ({ ...f, [target.name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const payload = {
        ...form,
        max_peserta: form.max_peserta ? parseInt(form.max_peserta) : null,
        tanggal_mulai: form.tanggal_mulai || null,
        tanggal_selesai: form.tanggal_selesai || null,
        paket_tes_id: form.paket_tes_id || null,
        owner_id: user!.id,
      }

      if (projectId) {
        const { error } = await supabase.from('projects').update(payload).eq('id', projectId)
        if (error) throw error
        toast.success('Project berhasil diperbarui')
      } else {
        const { error } = await supabase.from('projects').insert(payload)
        if (error) throw error
        toast.success('Project berhasil dibuat')
      }
      router.push('/dashboard/admin/project')
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {/* Basic Info */}
      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold text-neutral-800 text-sm">Informasi Dasar</h2>
        </div>
        <div className="card-body space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="form-label">Nama Project <span className="text-red-500">*</span></label>
              <input name="nama" className="form-input" required value={form.nama} onChange={handleChange} placeholder="Nama project tes" />
            </div>
            <div>
              <label className="form-label">Kode Project</label>
              <input name="kode_project" className="form-input font-mono" value={form.kode_project} onChange={handleChange} placeholder="PRJ-XXXXXX" />
              <p className="form-hint">Kode unik untuk identifikasi project</p>
            </div>
            <div>
              <label className="form-label">Status</label>
              <select name="status" className="form-input" value={form.status} onChange={handleChange}>
                <option value="draft">Draft</option>
                <option value="aktif">Aktif</option>
                <option value="selesai">Selesai</option>
                <option value="arsip">Arsip</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="form-label">Deskripsi</label>
              <textarea name="deskripsi" className="form-input" rows={3} value={form.deskripsi} onChange={handleChange} placeholder="Deskripsi project tes..." />
            </div>
            <div>
              <label className="form-label">Paket Tes</label>
              <select name="paket_tes_id" className="form-input" value={form.paket_tes_id} onChange={handleChange}>
                <option value="">— Pilih Paket Tes —</option>
                {paketList.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Maks. Peserta</label>
              <input name="max_peserta" type="number" className="form-input" value={form.max_peserta} onChange={handleChange} placeholder="Kosongkan = tidak terbatas" min={1} />
            </div>
            <div>
              <label className="form-label">Tanggal Mulai</label>
              <input name="tanggal_mulai" type="datetime-local" className="form-input" value={form.tanggal_mulai} onChange={handleChange} />
            </div>
            <div>
              <label className="form-label">Tanggal Selesai</label>
              <input name="tanggal_selesai" type="datetime-local" className="form-input" value={form.tanggal_selesai} onChange={handleChange} />
            </div>
          </div>
        </div>
      </div>

      {/* Proctoring */}
      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold text-neutral-800 text-sm">Pengaturan Proctoring</h2>
          <p className="text-xs text-neutral-500 mt-0.5">Konfigurasi pengawasan selama peserta mengerjakan tes</p>
        </div>
        <div className="card-body space-y-4">
          {[
            { name: 'proctoring_kamera', label: 'Aktifkan Kamera Depan', desc: 'Kamera peserta wajib aktif selama tes berlangsung' },
            { name: 'proctoring_fullscreen', label: 'Mode Fullscreen Wajib', desc: 'Layar akan otomatis masuk fullscreen dan tidak bisa diminimize' },
            { name: 'proctoring_anti_tab', label: 'Blokir Ganti Tab', desc: 'Peserta tidak dapat berpindah tab atau window' },
            { name: 'proctoring_rekam_foto', label: 'Rekam Foto Berkala', desc: 'Ambil foto via kamera depan secara berkala' },
            { name: 'allow_registrasi_mandiri', label: 'Izinkan Registrasi Mandiri', desc: 'Peserta bisa mendaftar sendiri ke project ini' },
          ].map(item => (
            <label key={item.name} className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  name={item.name}
                  checked={form[item.name as keyof typeof form] as boolean}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${form[item.name as keyof typeof form] ? 'bg-brand-600 border-brand-600' : 'border-neutral-300 bg-white'}`}>
                  {form[item.name as keyof typeof form] && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-700">{item.label}</p>
                <p className="text-xs text-neutral-400">{item.desc}</p>
              </div>
            </label>
          ))}

          {form.proctoring_rekam_foto && (
            <div>
              <label className="form-label">Interval Rekam Foto (detik)</label>
              <input name="proctoring_interval_foto" type="number" className="form-input" value={form.proctoring_interval_foto} onChange={handleChange} min={10} max={300} />
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold text-neutral-800 text-sm">Pesan ke Peserta</h2>
        </div>
        <div className="card-body space-y-4">
          <div>
            <label className="form-label">Pesan Selamat Datang</label>
            <textarea name="pesan_selamat_datang" className="form-input" rows={3} value={form.pesan_selamat_datang} onChange={handleChange} placeholder="Ditampilkan sebelum peserta memulai tes..." />
          </div>
          <div>
            <label className="form-label">Pesan Selesai</label>
            <textarea name="pesan_selesai" className="form-input" rows={3} value={form.pesan_selesai} onChange={handleChange} placeholder="Ditampilkan setelah peserta menyelesaikan tes..." />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading} className="btn-primary btn">
          {loading ? 'Menyimpan...' : projectId ? 'Simpan Perubahan' : 'Buat Project'}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary btn">
          Batal
        </button>
      </div>
    </form>
  )
}
