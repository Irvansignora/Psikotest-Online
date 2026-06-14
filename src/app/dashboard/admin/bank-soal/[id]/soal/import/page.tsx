'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Papa from 'papaparse'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function ImportSoalPage({ params }: { params: { id: string } }) {
  const [preview, setPreview] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => setPreview(results.data.slice(0, 5)),
      error: () => toast.error('Gagal membaca file')
    })
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)

    // Get current max nomor
    const { count } = await supabase.from('soal').select('*', { count: 'exact', head: true }).eq('bank_soal_id', params.id)
    let nomor = (count || 0) + 1

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        let sukses = 0, gagal = 0
        for (const row of results.data as any[]) {
          try {
            const { data: soalData, error } = await supabase.from('soal').insert({
              bank_soal_id: params.id,
              nomor_urut: nomor++,
              tipe: row.tipe || 'pilihan_ganda',
              pertanyaan: row.pertanyaan || row.soal,
              kelompok: row.kelompok || row.dimensi || null,
              bobot: parseFloat(row.bobot) || 1,
              waktu_pengerjaan: row.waktu ? parseInt(row.waktu) : null,
              wajib: row.wajib !== 'tidak',
              acak_pilihan: row.acak === 'ya',
            }).select('id').single()

            if (error || !soalData) { gagal++; continue }

            // Insert pilihan if PG
            if (['pilihan_ganda', 'benar_salah', 'skala_likert'].includes(row.tipe || 'pilihan_ganda')) {
              const pilihanKeys = ['a', 'b', 'c', 'd', 'e'].filter(k => row[`pilihan_${k}`] || row[k])
              if (pilihanKeys.length > 0) {
                const pilihanPayload = pilihanKeys.map((k, i) => ({
                  soal_id: soalData.id,
                  label: k.toUpperCase(),
                  teks: row[`pilihan_${k}`] || row[k] || '',
                  skor: parseFloat(row[`skor_${k}`] || '0'),
                  urutan: i,
                  is_benar: (row.kunci || '').toLowerCase() === k,
                }))
                await supabase.from('pilihan_jawaban').insert(pilihanPayload)
              }
            }
            sukses++
          } catch { gagal++ }
        }
        toast.success(`${sukses} soal berhasil diimport, ${gagal} gagal`)
        router.push(`/dashboard/admin/bank-soal/${params.id}/soal`)
        setLoading(false)
      }
    })
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href={`/dashboard/admin/bank-soal/${params.id}/soal`} className="text-xs text-neutral-500 hover:text-neutral-700">← Kembali ke Daftar Soal</Link>
        <h1 className="text-xl font-semibold text-neutral-900 mt-2">Import Soal via CSV</h1>
      </div>

      <div className="grid gap-5">
        {/* Format guide */}
        <div className="card">
          <div className="card-header"><h2 className="font-semibold text-sm text-neutral-800">Format CSV yang Didukung</h2></div>
          <div className="card-body">
            <p className="text-xs text-neutral-600 mb-3">File CSV harus memiliki header berikut (kolom dengan * wajib ada):</p>
            <div className="overflow-x-auto">
              <table className="table text-xs">
                <thead>
                  <tr>
                    <th>Kolom</th><th>Wajib</th><th>Keterangan</th><th>Contoh</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['pertanyaan', '✓', 'Teks pertanyaan/stimulus', 'Saya merasa cemas ketika...'],
                    ['tipe', '', 'Tipe soal', 'pilihan_ganda / benar_salah / skala_likert / isian_singkat / esai'],
                    ['kelompok', '', 'Dimensi/aspek', 'Neuroticism'],
                    ['bobot', '', 'Bobot skor', '1'],
                    ['waktu', '', 'Batas waktu (detik)', '60'],
                    ['pilihan_a', '', 'Teks pilihan A', 'Sangat Setuju'],
                    ['pilihan_b', '', 'Teks pilihan B', 'Setuju'],
                    ['pilihan_c', '', 'Teks pilihan C', 'Tidak Setuju'],
                    ['pilihan_d', '', 'Teks pilihan D', 'Sangat Tidak Setuju'],
                    ['skor_a', '', 'Skor pilihan A', '4'],
                    ['skor_b', '', 'Skor pilihan B', '3'],
                    ['kunci', '', 'Kunci jawaban (PG)', 'a'],
                    ['wajib', '', 'Wajib dijawab?', 'ya / tidak'],
                    ['acak', '', 'Acak pilihan?', 'ya / tidak'],
                  ].map(([col, req, desc, ex]) => (
                    <tr key={col as string}>
                      <td><code className="bg-neutral-100 px-1 rounded font-mono">{col}</code></td>
                      <td className="text-center">{req}</td>
                      <td className="text-neutral-500">{desc}</td>
                      <td className="text-neutral-400 italic">{ex}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Upload */}
        <div className="card">
          <div className="card-header"><h2 className="font-semibold text-sm text-neutral-800">Upload File</h2></div>
          <div className="card-body space-y-4">
            <div>
              <label className="form-label">Preview (opsional)</label>
              <input type="file" accept=".csv" onChange={handleFile} className="text-xs text-neutral-600" />
              {preview.length > 0 && (
                <div className="mt-3 overflow-x-auto border border-neutral-200 rounded">
                  <table className="table text-xs">
                    <thead>
                      <tr>{Object.keys(preview[0]).map(k => <th key={k}>{k}</th>)}</tr>
                    </thead>
                    <tbody>
                      {preview.map((row, i) => (
                        <tr key={i}>{Object.values(row).map((v: any, j) => <td key={j}>{v}</td>)}</tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div>
              <label className="form-label">Import Data</label>
              <input type="file" accept=".csv" onChange={handleImport} disabled={loading} className="text-xs text-neutral-600" />
              {loading && <p className="text-xs text-neutral-500 mt-1 animate-pulse">Mengimport soal, harap tunggu...</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
