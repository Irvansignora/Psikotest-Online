'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { uploadToCloudinary } from '@/lib/cloudinary'
import toast from 'react-hot-toast'
import type { QuestionType, PilihanJawaban } from '@/types'

interface SoalFormProps {
  bankId: string
  soalId?: string
  nextNomor?: number
}

const TIPE_OPTIONS: { value: QuestionType; label: string; desc: string }[] = [
  { value: 'pilihan_ganda', label: 'Pilihan Ganda', desc: 'A, B, C, D dengan satu jawaban benar' },
  { value: 'benar_salah', label: 'Benar / Salah', desc: 'Dua pilihan: Benar atau Salah' },
  { value: 'skala_likert', label: 'Skala Likert', desc: 'Skala sikap 1-5 atau 1-7' },
  { value: 'isian_singkat', label: 'Isian Singkat', desc: 'Jawaban teks pendek' },
  { value: 'esai', label: 'Esai', desc: 'Jawaban teks panjang' },
]

export default function SoalForm({ bankId, soalId, nextNomor = 1 }: SoalFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [mediaLoading, setMediaLoading] = useState(false)
  const [form, setForm] = useState({
    nomor_urut: nextNomor,
    tipe: 'pilihan_ganda' as QuestionType,
    pertanyaan: '',
    pertanyaan_media_url: '',
    pertanyaan_media_type: '',
    kelompok: '',
    bobot: 1,
    waktu_pengerjaan: '',
    acak_pilihan: false,
    wajib: true,
    keterangan: '',
  })
  const [pilihan, setPilihan] = useState<Omit<PilihanJawaban, 'id' | 'soal_id'>[]>([
    { label: 'A', teks: '', media_url: '', skor: 0, urutan: 0, is_benar: false },
    { label: 'B', teks: '', media_url: '', skor: 0, urutan: 1, is_benar: false },
    { label: 'C', teks: '', media_url: '', skor: 0, urutan: 2, is_benar: false },
    { label: 'D', teks: '', media_url: '', skor: 0, urutan: 3, is_benar: false },
  ])

  useEffect(() => {
    if (soalId) loadSoal()
  }, [soalId])

  useEffect(() => {
    // Auto-generate pilihan berdasarkan tipe
    if (!soalId) {
      if (form.tipe === 'benar_salah') {
        setPilihan([
          { label: 'A', teks: 'Benar', media_url: '', skor: 1, urutan: 0, is_benar: true },
          { label: 'B', teks: 'Salah', media_url: '', skor: 0, urutan: 1, is_benar: false },
        ])
      } else if (form.tipe === 'skala_likert') {
        setPilihan(
          [1, 2, 3, 4, 5].map((n, i) => ({
            label: String(n), teks: `Pilihan ${n}`, media_url: '', skor: n, urutan: i, is_benar: false
          }))
        )
      } else if (form.tipe === 'pilihan_ganda') {
        setPilihan(['A', 'B', 'C', 'D'].map((l, i) => ({
          label: l, teks: '', media_url: '', skor: 0, urutan: i, is_benar: false
        })))
      }
    }
  }, [form.tipe])

  async function loadSoal() {
    const { data } = await supabase.from('soal').select('*, pilihan_jawaban(*)').eq('id', soalId).single()
    if (data) {
      setForm({ ...data, waktu_pengerjaan: data.waktu_pengerjaan?.toString() || '' })
      if (data.pilihan_jawaban?.length) setPilihan(data.pilihan_jawaban.sort((a: any, b: any) => a.urutan - b.urutan))
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const target = e.target as HTMLInputElement
    setForm(f => ({ ...f, [target.name]: target.type === 'checkbox' ? target.checked : target.value }))
  }

  function updatePilihan(idx: number, field: string, value: any) {
    setPilihan(p => p.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  function addPilihan() {
    const labels = 'ABCDEFGHIJ'
    setPilihan(p => [...p, { label: labels[p.length] || String(p.length + 1), teks: '', media_url: '', skor: 0, urutan: p.length, is_benar: false }])
  }

  function removePilihan(idx: number) {
    setPilihan(p => p.filter((_, i) => i !== idx))
  }

  async function handleMediaUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setMediaLoading(true)
    try {
      const { url } = await uploadToCloudinary(file, 'psikotes/soal')
      const mediaType = file.type.startsWith('image') ? 'image' : file.type.startsWith('video') ? 'video' : 'audio'
      setForm(f => ({ ...f, pertanyaan_media_url: url, pertanyaan_media_type: mediaType }))
      toast.success('Media berhasil diupload')
    } catch { toast.error('Upload media gagal') }
    finally { setMediaLoading(false) }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...form,
        bank_soal_id: bankId,
        waktu_pengerjaan: form.waktu_pengerjaan ? parseInt(form.waktu_pengerjaan as string) : null,
        pertanyaan_media_url: form.pertanyaan_media_url || null,
        pertanyaan_media_type: form.pertanyaan_media_type || null,
      }

      let soalFinalId = soalId
      if (soalId) {
        const { error } = await supabase.from('soal').update(payload).eq('id', soalId)
        if (error) throw error
        // Delete and re-insert pilihan
        if (['pilihan_ganda', 'benar_salah', 'skala_likert'].includes(form.tipe)) {
          await supabase.from('pilihan_jawaban').delete().eq('soal_id', soalId)
        }
      } else {
        const { data, error } = await supabase.from('soal').insert(payload).select('id').single()
        if (error) throw error
        soalFinalId = data.id
      }

      // Insert pilihan for relevant types
      if (['pilihan_ganda', 'benar_salah', 'skala_likert'].includes(form.tipe) && soalFinalId) {
        const pilihanPayload = pilihan.map((p, i) => ({ ...p, soal_id: soalFinalId, urutan: i }))
        const { error } = await supabase.from('pilihan_jawaban').insert(pilihanPayload)
        if (error) throw error
      }

      toast.success(soalId ? 'Soal diperbarui' : 'Soal ditambahkan')
      router.push(`/dashboard/admin/bank-soal/${bankId}/soal`)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const hasPilihan = ['pilihan_ganda', 'benar_salah', 'skala_likert'].includes(form.tipe)

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-3xl">
      {/* Meta */}
      <div className="card">
        <div className="card-header"><h2 className="font-semibold text-sm text-neutral-800">Konfigurasi Soal</h2></div>
        <div className="card-body">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="form-label">Nomor Urut</label>
              <input name="nomor_urut" type="number" className="form-input" value={form.nomor_urut} onChange={handleChange} min={1} required />
            </div>
            <div>
              <label className="form-label">Tipe Soal</label>
              <select name="tipe" className="form-input" value={form.tipe} onChange={handleChange}>
                {TIPE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Kelompok / Dimensi</label>
              <input name="kelompok" className="form-input" value={form.kelompok} onChange={handleChange} placeholder="cth: Neuroticism, Agreeableness..." />
            </div>
            <div>
              <label className="form-label">Bobot</label>
              <input name="bobot" type="number" className="form-input" value={form.bobot} onChange={handleChange} min={0} step={0.5} />
            </div>
            <div>
              <label className="form-label">Batas Waktu (detik)</label>
              <input name="waktu_pengerjaan" type="number" className="form-input" value={form.waktu_pengerjaan} onChange={handleChange} placeholder="Kosongkan = ikut paket" min={5} />
            </div>
          </div>
          <div className="flex items-center gap-6">
            {[
              { name: 'wajib', label: 'Wajib dijawab' },
              { name: 'acak_pilihan', label: 'Acak urutan pilihan' },
            ].map(c => (
              <label key={c.name} className="flex items-center gap-2 cursor-pointer">
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${form[c.name as keyof typeof form] ? 'bg-brand-600 border-brand-600' : 'border-neutral-300 bg-white'}`}>
                  {form[c.name as keyof typeof form] && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                </div>
                <input type="checkbox" name={c.name} className="sr-only" checked={form[c.name as keyof typeof form] as boolean} onChange={handleChange} />
                <span className="text-sm text-neutral-700">{c.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Pertanyaan */}
      <div className="card">
        <div className="card-header"><h2 className="font-semibold text-sm text-neutral-800">Pertanyaan / Stimulus</h2></div>
        <div className="card-body space-y-4">
          <div>
            <label className="form-label">Teks Pertanyaan <span className="text-red-500">*</span></label>
            <textarea name="pertanyaan" className="form-input" rows={4} required value={form.pertanyaan} onChange={handleChange} placeholder="Tulis pertanyaan, pernyataan, atau stimulus di sini..." />
          </div>
          <div>
            <label className="form-label">Media (gambar / video / audio)</label>
            <input type="file" accept="image/*,video/*,audio/*" onChange={handleMediaUpload} className="text-xs text-neutral-600" disabled={mediaLoading} />
            {mediaLoading && <p className="text-xs text-neutral-400 mt-1">Mengupload media...</p>}
            {form.pertanyaan_media_url && (
              <div className="mt-2">
                {form.pertanyaan_media_type === 'image' && <img src={form.pertanyaan_media_url} className="max-h-32 rounded border border-neutral-200" alt="media soal" />}
                {form.pertanyaan_media_type === 'video' && <video src={form.pertanyaan_media_url} controls className="max-h-32 rounded" />}
                <button type="button" onClick={() => setForm(f => ({ ...f, pertanyaan_media_url: '', pertanyaan_media_type: '' }))}
                  className="text-xs text-red-500 hover:underline mt-1">Hapus media</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pilihan Jawaban */}
      {hasPilihan && (
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-semibold text-sm text-neutral-800">Pilihan Jawaban</h2>
            {form.tipe === 'pilihan_ganda' && (
              <button type="button" onClick={addPilihan} className="btn-ghost btn btn-sm">+ Tambah Pilihan</button>
            )}
          </div>
          <div className="card-body space-y-3">
            {form.tipe === 'skala_likert' && (
              <p className="text-xs text-neutral-500 bg-neutral-50 rounded p-2">
                💡 Ubah teks label sesuai konteks (misal: "Sangat Tidak Setuju" s/d "Sangat Setuju"). Skor otomatis terisi.
              </p>
            )}
            {pilihan.map((p, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
                <div className="w-7 h-7 bg-white border border-neutral-200 rounded flex items-center justify-center text-xs font-semibold text-neutral-600 shrink-0 mt-0.5">
                  {p.label}
                </div>
                <div className="flex-1 space-y-2">
                  <input type="text" className="form-input text-sm" placeholder={`Teks pilihan ${p.label}`}
                    value={p.teks} onChange={e => updatePilihan(i, 'teks', e.target.value)} />
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-neutral-500">Skor:</label>
                      <input type="number" className="form-input text-xs w-20" step={0.5}
                        value={p.skor} onChange={e => updatePilihan(i, 'skor', parseFloat(e.target.value))} />
                    </div>
                    {form.tipe === 'pilihan_ganda' && (
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <div className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center ${p.is_benar ? 'bg-green-600 border-green-600' : 'border-neutral-300 bg-white'}`}>
                          {p.is_benar && <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <input type="checkbox" className="sr-only" checked={p.is_benar}
                          onChange={e => updatePilihan(i, 'is_benar', e.target.checked)} />
                        <span className="text-xs text-neutral-500">Kunci jawaban</span>
                      </label>
                    )}
                  </div>
                </div>
                {form.tipe === 'pilihan_ganda' && pilihan.length > 2 && (
                  <button type="button" onClick={() => removePilihan(i)} className="text-neutral-300 hover:text-red-500 text-sm mt-0.5">✕</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Keterangan internal */}
      <div className="card">
        <div className="card-body">
          <label className="form-label">Catatan Internal (tidak ditampilkan ke peserta)</label>
          <textarea name="keterangan" className="form-input" rows={2} value={form.keterangan} onChange={handleChange} placeholder="cth: Mengukur aspek neuroticism Big Five..." />
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="btn-primary btn">
          {loading ? 'Menyimpan...' : soalId ? 'Simpan Perubahan' : 'Tambah Soal'}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary btn">Batal</button>
      </div>
    </form>
  )
}
