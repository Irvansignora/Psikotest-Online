'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import type { BankSoal, PaketTesSoal } from '@/types'

export default function PaketTesForm({ paketId }: { paketId?: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [allBanks, setAllBanks] = useState<Pick<BankSoal, 'id' | 'nama' | 'kategori'>[]>([])
  const [selectedBanks, setSelectedBanks] = useState<{ bank_soal_id: string; urutan: number; jumlah_soal: string; waktu_per_bagian: string }[]>([])
  const [form, setForm] = useState({
    nama: '', deskripsi: '', instruksi: '', durasi_total: '', acak_soal: false, tampilkan_skor: false
  })

  useEffect(() => {
    supabase.from('bank_soal').select('id, nama, kategori').then(({ data }) => setAllBanks(data || []))
    if (paketId) loadPaket()
  }, [paketId])

  async function loadPaket() {
    const { data } = await supabase.from('paket_tes').select('*, paket_tes_soal(*)').eq('id', paketId).single()
    if (data) {
      setForm({ ...data, durasi_total: data.durasi_total?.toString() || '' })
      setSelectedBanks((data.paket_tes_soal || []).map((pts: PaketTesSoal) => ({
        bank_soal_id: pts.bank_soal_id,
        urutan: pts.urutan,
        jumlah_soal: pts.jumlah_soal?.toString() || '',
        waktu_per_bagian: pts.waktu_per_bagian?.toString() || '',
      })).sort((a: any, b: any) => a.urutan - b.urutan))
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const target = e.target as HTMLInputElement
    setForm(f => ({ ...f, [target.name]: target.type === 'checkbox' ? target.checked : target.value }))
  }

  function addBank(bankId: string) {
    if (selectedBanks.find(b => b.bank_soal_id === bankId)) return
    setSelectedBanks(b => [...b, { bank_soal_id: bankId, urutan: b.length, jumlah_soal: '', waktu_per_bagian: '' }])
  }

  function removeBank(idx: number) {
    setSelectedBanks(b => b.filter((_, i) => i !== idx).map((item, i) => ({ ...item, urutan: i })))
  }

  function updateBank(idx: number, field: string, value: string) {
    setSelectedBanks(b => b.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  function moveBank(idx: number, dir: 'up' | 'down') {
    const newBanks = [...selectedBanks]
    const target = dir === 'up' ? idx - 1 : idx + 1
    if (target < 0 || target >= newBanks.length) return;
    [newBanks[idx], newBanks[target]] = [newBanks[target], newBanks[idx]]
    setSelectedBanks(newBanks.map((b, i) => ({ ...b, urutan: i })))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const payload = { ...form, durasi_total: form.durasi_total ? parseInt(form.durasi_total) : null, owner_id: user!.id }

      let finalId = paketId
      if (paketId) {
        const { error } = await supabase.from('paket_tes').update(payload).eq('id', paketId)
        if (error) throw error
        await supabase.from('paket_tes_soal').delete().eq('paket_tes_id', paketId)
      } else {
        const { data, error } = await supabase.from('paket_tes').insert(payload).select('id').single()
        if (error) throw error
        finalId = data.id
      }

      if (selectedBanks.length > 0 && finalId) {
        const ptsPayload = selectedBanks.map((b, i) => ({
          paket_tes_id: finalId,
          bank_soal_id: b.bank_soal_id,
          urutan: i,
          jumlah_soal: b.jumlah_soal ? parseInt(b.jumlah_soal) : null,
          waktu_per_bagian: b.waktu_per_bagian ? parseInt(b.waktu_per_bagian) : null,
        }))
        const { error } = await supabase.from('paket_tes_soal').insert(ptsPayload)
        if (error) throw error
      }

      toast.success(paketId ? 'Paket tes diperbarui' : 'Paket tes dibuat')
      router.push('/dashboard/admin/paket-tes')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-3xl">
      <div className="card">
        <div className="card-header"><h2 className="font-semibold text-sm text-neutral-800">Informasi Paket</h2></div>
        <div className="card-body space-y-4">
          <div>
            <label className="form-label">Nama Paket Tes <span className="text-red-500">*</span></label>
            <input name="nama" className="form-input" required value={form.nama} onChange={handleChange} placeholder="cth: Tes Psikologi Rekrutmen 2024" />
          </div>
          <div>
            <label className="form-label">Deskripsi</label>
            <textarea name="deskripsi" className="form-input" rows={2} value={form.deskripsi} onChange={handleChange} />
          </div>
          <div>
            <label className="form-label">Instruksi Umum (ditampilkan ke peserta)</label>
            <textarea name="instruksi" className="form-input" rows={4} value={form.instruksi} onChange={handleChange} placeholder="Tuliskan petunjuk pengerjaan tes..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Total Durasi (menit)</label>
              <input name="durasi_total" type="number" className="form-input" value={form.durasi_total} onChange={handleChange} placeholder="Kosongkan = jumlah dari soal" min={1} />
            </div>
          </div>
          <div className="flex items-center gap-6">
            {[
              { name: 'acak_soal', label: 'Acak urutan soal' },
              { name: 'tampilkan_skor', label: 'Tampilkan skor ke peserta setelah selesai' },
            ].map(c => (
              <label key={c.name} className="flex items-center gap-2 cursor-pointer">
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${form[c.name as keyof typeof form] ? 'bg-brand-600 border-brand-600' : 'border-neutral-300 bg-white'}`}>
                  {form[c.name as keyof typeof form] && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                </div>
                <input type="checkbox" name={c.name} className="sr-only" checked={form[c.name as keyof typeof form] as boolean} onChange={handleChange} />
                <span className="text-sm text-neutral-700">{c.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Bank Soal Picker */}
      <div className="card">
        <div className="card-header"><h2 className="font-semibold text-sm text-neutral-800">Susunan Bank Soal</h2></div>
        <div className="card-body space-y-4">
          <div>
            <label className="form-label">Tambah Bank Soal</label>
            <select className="form-input" onChange={e => { if (e.target.value) addBank(e.target.value); e.target.value = '' }}>
              <option value="">— Pilih Bank Soal untuk ditambahkan —</option>
              {allBanks.filter(b => !selectedBanks.find(s => s.bank_soal_id === b.id)).map(b => (
                <option key={b.id} value={b.id}>{b.nama} {b.kategori ? `(${b.kategori})` : ''}</option>
              ))}
            </select>
          </div>

          {selectedBanks.length === 0 ? (
            <p className="text-xs text-neutral-400 text-center py-4">Belum ada bank soal dipilih</p>
          ) : (
            <div className="space-y-3">
              {selectedBanks.map((sb, i) => {
                const bank = allBanks.find(b => b.id === sb.bank_soal_id)
                return (
                  <div key={sb.bank_soal_id} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                    <div className="flex flex-col gap-1">
                      <button type="button" onClick={() => moveBank(i, 'up')} disabled={i === 0} className="text-neutral-300 hover:text-neutral-600 disabled:opacity-30 text-xs leading-none">▲</button>
                      <button type="button" onClick={() => moveBank(i, 'down')} disabled={i === selectedBanks.length - 1} className="text-neutral-300 hover:text-neutral-600 disabled:opacity-30 text-xs leading-none">▼</button>
                    </div>
                    <div className="w-6 h-6 bg-white border border-neutral-200 rounded flex items-center justify-center text-xs font-mono text-neutral-500 shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-800 truncate">{bank?.nama}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div>
                        <input type="number" placeholder="Jml soal (kosong=semua)" className="form-input text-xs w-36"
                          value={sb.jumlah_soal} onChange={e => updateBank(i, 'jumlah_soal', e.target.value)} min={1} />
                      </div>
                      <div>
                        <input type="number" placeholder="Waktu (detik)" className="form-input text-xs w-28"
                          value={sb.waktu_per_bagian} onChange={e => updateBank(i, 'waktu_per_bagian', e.target.value)} min={1} />
                      </div>
                      <button type="button" onClick={() => removeBank(i)} className="text-neutral-300 hover:text-red-500">✕</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="btn-primary btn">
          {loading ? 'Menyimpan...' : paketId ? 'Simpan Perubahan' : 'Buat Paket Tes'}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary btn">Batal</button>
      </div>
    </form>
  )
}
