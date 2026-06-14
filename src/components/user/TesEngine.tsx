'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Webcam from 'react-webcam'
import toast from 'react-hot-toast'
import type { Jawaban } from '@/types'

interface TesEngineProps {
  sesi: any
  soalList: any[]
  jawabanExisting: Jawaban[]
  project: any
  paket: any
}

export default function TesEngine({ sesi, soalList, jawabanExisting, project, paket }: TesEngineProps) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [jawaban, setJawaban] = useState<Record<string, { pilihan_id?: string; teks?: string }>>(() => {
    const map: Record<string, any> = {}
    jawabanExisting.forEach(j => {
      map[j.soal_id] = { pilihan_id: j.pilihan_id, teks: j.teks_jawaban }
    })
    return map
  })
  const [selesai, setSelesai] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [violations, setViolations] = useState(0)
  const webcamRef = useRef<any>(null)
  const timerRef = useRef<ReturnType<typeof setInterval>>()
  const fotoTimerRef = useRef<ReturnType<typeof setInterval>>()
  const startTimeRef = useRef<number>(Date.now())
  const supabase = createClient()
  const router = useRouter()

  const prokKamera = project?.proctoring_kamera
  const prokAntiTab = project?.proctoring_anti_tab
  const prokFullscreen = project?.proctoring_fullscreen
  const prokRekamFoto = project?.proctoring_rekam_foto
  const prokInterval = project?.proctoring_interval_foto || 30

  const soal = soalList[currentIdx]
  const totalSoal = soalList.length

  // ── Timer setup ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!paket?.durasi_total && !soal?.waktu_pengerjaan) return
    const durasiSoal = soal?.waktu_pengerjaan
    const durasiPaket = paket?.durasi_total ? paket.durasi_total * 60 : null

    if (durasiSoal) {
      setTimeLeft(durasiSoal)
    } else if (durasiPaket) {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
      setTimeLeft(Math.max(0, durasiPaket - elapsed))
    }
  }, [currentIdx])

  useEffect(() => {
    if (timeLeft === null) return
    if (timeLeft <= 0) {
      if (soal?.waktu_pengerjaan) {
        // Auto move to next
        if (currentIdx < totalSoal - 1) setCurrentIdx(i => i + 1)
        else handleSelesai()
      } else {
        handleSelesai()
      }
      return
    }
    timerRef.current = setInterval(() => setTimeLeft(t => (t ?? 0) - 1), 1000)
    return () => clearInterval(timerRef.current)
  }, [timeLeft, currentIdx])

  // ── Fullscreen enforcement ────────────────────────────────────────────────
  useEffect(() => {
    if (!prokFullscreen) return
    const handleFSChange = () => {
      if (!document.fullscreenElement) {
        logViolation('exit_fullscreen', 'Keluar dari fullscreen')
        document.documentElement.requestFullscreen?.().catch(() => {})
      }
    }
    document.addEventListener('fullscreenchange', handleFSChange)
    return () => document.removeEventListener('fullscreenchange', handleFSChange)
  }, [])

  // ── Anti-tab / visibility ─────────────────────────────────────────────────
  useEffect(() => {
    if (!prokAntiTab) return
    const handleVisibility = () => {
      if (document.hidden) logViolation('ganti_tab', 'Berpindah tab')
    }
    const handleBlur = () => logViolation('blur', 'Window kehilangan fokus')
    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('blur', handleBlur)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])

  // ── Periodic photo capture ────────────────────────────────────────────────
  useEffect(() => {
    if (!prokRekamFoto || !prokKamera) return
    fotoTimerRef.current = setInterval(() => captureAndUploadFoto(), prokInterval * 1000)
    return () => clearInterval(fotoTimerRef.current)
  }, [prokRekamFoto, prokKamera, prokInterval])

  // Cleanup fullscreen on unmount
  useEffect(() => {
    return () => {
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {})
    }
  }, [])

  async function logViolation(tipe: string, keterangan: string) {
    setViolations(v => v + 1)
    await supabase.from('proctoring_logs').insert({
      sesi_tes_id: sesi.id, tipe, keterangan
    })
  }

  async function captureAndUploadFoto() {
    if (!webcamRef.current) return
    const imageSrc = webcamRef.current.getScreenshot()
    if (!imageSrc) return
    try {
      // Upload to Cloudinary
      const res = await fetch('/api/upload-proctoring-foto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData: imageSrc, sesiId: sesi.id })
      })
      const { url } = await res.json()
      if (url) {
        await supabase.from('proctoring_logs').insert({
          sesi_tes_id: sesi.id, tipe: 'foto', foto_url: url
        })
      }
    } catch {}
  }

  async function saveJawaban(soalId: string, pilihanId?: string, teks?: string) {
    const waktuJawab = Math.floor((Date.now() - startTimeRef.current) / 1000)
    const existing = jawabanExisting.find(j => j.soal_id === soalId)

    if (existing) {
      await supabase.from('jawaban').update({ pilihan_id: pilihanId || null, teks_jawaban: teks || null, waktu_jawab: waktuJawab })
        .eq('id', existing.id)
    } else {
      await supabase.from('jawaban').upsert({
        sesi_tes_id: sesi.id, soal_id: soalId,
        pilihan_id: pilihanId || null, teks_jawaban: teks || null, waktu_jawab: waktuJawab
      }, { onConflict: 'sesi_tes_id,soal_id' })
    }
  }

  function handlePilih(soalId: string, pilihanId: string) {
    setJawaban(j => ({ ...j, [soalId]: { pilihan_id: pilihanId } }))
    saveJawaban(soalId, pilihanId)
  }

  function handleTeks(soalId: string, teks: string) {
    setJawaban(j => ({ ...j, [soalId]: { teks } }))
  }

  function handleTeksSave(soalId: string, teks: string) {
    saveJawaban(soalId, undefined, teks)
  }

  async function handleSelesai() {
    if (submitting) return
    const belumDijawab = soalList.filter(s => s.wajib && !jawaban[s.id]).length
    if (belumDijawab > 0 && !confirm(`Masih ada ${belumDijawab} soal wajib yang belum dijawab. Tetap selesaikan?`)) return

    setSubmitting(true)
    try {
      // Calculate score
      let skorTotal = 0
      for (const s of soalList) {
        const ans = jawaban[s.id]
        if (ans?.pilihan_id && s.pilihan_jawaban) {
          const pilihan = s.pilihan_jawaban.find((p: any) => p.id === ans.pilihan_id)
          if (pilihan) {
            const skor = pilihan.skor * (s.bobot || 1)
            skorTotal += skor
            await supabase.from('jawaban').update({ skor_perolehan: skor })
              .eq('sesi_tes_id', sesi.id).eq('soal_id', s.id)
          }
        }
      }

      const durasi = Math.floor((Date.now() - startTimeRef.current) / 1000)
      await supabase.from('sesi_tes').update({
        status: 'selesai',
        selesai_at: new Date().toISOString(),
        durasi_aktual: durasi,
        skor_total: skorTotal,
      }).eq('id', sesi.id)

      if (document.fullscreenElement) await document.exitFullscreen?.()
      setSelesai(true)
    } catch (err: any) {
      toast.error('Gagal menyimpan: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const progress = ((currentIdx + 1) / totalSoal) * 100
  const answered = soalList.filter(s => jawaban[s.id]).length

  // ── SELESAI SCREEN ────────────────────────────────────────────────────────
  if (selesai) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <div className="card-body py-10 space-y-4">
            <div className="text-5xl">✅</div>
            <h2 className="text-xl font-semibold text-neutral-900">Tes Selesai!</h2>
            <p className="text-sm text-neutral-500">
              {project?.pesan_selesai || 'Terima kasih telah menyelesaikan tes. Hasil akan diproses oleh penyelenggara.'}
            </p>
            <button onClick={() => router.push('/dashboard/user')} className="btn-primary btn w-full mt-4">
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!soal) return null

  // ── MAIN TEST UI ──────────────────────────────────────────────────────────
  return (
    <div className="test-fullscreen flex flex-col bg-neutral-50">
      {/* Top bar */}
      <div className="bg-white border-b border-neutral-200 px-4 py-2.5 flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xs font-medium text-neutral-500 shrink-0">
            {currentIdx + 1} / {totalSoal}
          </span>
          <div className="flex-1 bg-neutral-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-brand-500 h-full rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs text-neutral-400 shrink-0">{answered} dijawab</span>
        </div>

        {timeLeft !== null && (
          <div className={`text-sm font-mono font-semibold px-3 py-1 rounded-md ${timeLeft < 60 ? 'bg-red-50 text-red-600' : 'bg-neutral-100 text-neutral-700'}`}>
            ⏱ {formatTime(timeLeft)}
          </div>
        )}

        {prokKamera && (
          <div className="w-14 h-10 rounded-md overflow-hidden border border-neutral-200 bg-neutral-100 shrink-0">
            <Webcam
              ref={webcamRef}
              audio={false}
              width={56}
              height={40}
              videoConstraints={{ facingMode: 'user', width: 56, height: 40 }}
              className="w-full h-full object-cover"
              screenshotFormat="image/jpeg"
              screenshotQuality={0.5}
            />
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* Bank label */}
          {soal.bank_nama && (
            <p className="text-xs text-neutral-400 font-medium uppercase tracking-wide mb-3">{soal.bank_nama}</p>
          )}

          {/* Question */}
          <div className="mb-6">
            <div className="flex items-start gap-3">
              <span className="w-7 h-7 bg-brand-600 text-white rounded-md flex items-center justify-center text-xs font-bold shrink-0">
                {soal.nomor_urut}
              </span>
              <div className="flex-1">
                <p className="text-neutral-800 text-base leading-relaxed whitespace-pre-line">{soal.pertanyaan}</p>
                {soal.pertanyaan_media_url && (
                  <div className="mt-3">
                    {soal.pertanyaan_media_type === 'image' && (
                      <img src={soal.pertanyaan_media_url} className="max-h-64 rounded-lg border border-neutral-200" alt="media soal" />
                    )}
                    {soal.pertanyaan_media_type === 'video' && (
                      <video src={soal.pertanyaan_media_url} controls className="max-w-full rounded-lg" />
                    )}
                    {soal.pertanyaan_media_type === 'audio' && (
                      <audio src={soal.pertanyaan_media_url} controls className="w-full" />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Answers */}
          <div className="space-y-2">
            {(soal.tipe === 'pilihan_ganda' || soal.tipe === 'benar_salah' || soal.tipe === 'skala_likert') &&
              soal.pilihan_jawaban?.slice().sort((a: any, b: any) => a.urutan - b.urutan).map((p: any) => {
                const selected = jawaban[soal.id]?.pilihan_id === p.id
                return (
                  <button
                    key={p.id}
                    onClick={() => handlePilih(soal.id, p.id)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                      selected
                        ? 'border-brand-500 bg-brand-50 text-brand-800'
                        : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      selected ? 'border-brand-500 bg-brand-500' : 'border-neutral-300'
                    }`}>
                      {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <span className="font-medium text-sm w-5 shrink-0">{p.label}.</span>
                    <span className="text-sm">{p.teks}</span>
                  </button>
                )
              })
            }

            {soal.tipe === 'isian_singkat' && (
              <input
                type="text"
                className="form-input text-base py-3"
                placeholder="Ketik jawaban Anda..."
                value={jawaban[soal.id]?.teks || ''}
                onChange={e => handleTeks(soal.id, e.target.value)}
                onBlur={e => handleTeksSave(soal.id, e.target.value)}
              />
            )}

            {soal.tipe === 'esai' && (
              <textarea
                className="form-input text-base py-3 min-h-[150px]"
                placeholder="Tuliskan jawaban Anda..."
                value={jawaban[soal.id]?.teks || ''}
                onChange={e => handleTeks(soal.id, e.target.value)}
                onBlur={e => handleTeksSave(soal.id, e.target.value)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <div className="bg-white border-t border-neutral-200 px-4 py-3 flex items-center justify-between gap-3 shrink-0">
        <button
          onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
          disabled={currentIdx === 0}
          className="btn-secondary btn disabled:opacity-30"
        >
          ← Sebelumnya
        </button>

        <div className="flex items-center gap-1.5 overflow-x-auto max-w-xs">
          {soalList.slice(Math.max(0, currentIdx - 3), currentIdx + 4).map((s, i) => {
            const realIdx = Math.max(0, currentIdx - 3) + i
            const isDone = !!jawaban[s.id]
            const isCurrent = realIdx === currentIdx
            return (
              <button
                key={s.id}
                onClick={() => setCurrentIdx(realIdx)}
                className={`w-7 h-7 rounded text-xs font-medium shrink-0 transition-all ${
                  isCurrent ? 'bg-brand-600 text-white' :
                  isDone ? 'bg-brand-100 text-brand-700' :
                  'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                }`}
              >
                {realIdx + 1}
              </button>
            )
          })}
        </div>

        {currentIdx < totalSoal - 1 ? (
          <button
            onClick={() => setCurrentIdx(i => i + 1)}
            className="btn-primary btn"
          >
            Selanjutnya →
          </button>
        ) : (
          <button
            onClick={handleSelesai}
            disabled={submitting}
            className="btn-primary btn bg-green-600 hover:bg-green-700"
          >
            {submitting ? 'Menyimpan...' : '✓ Selesaikan Tes'}
          </button>
        )}
      </div>
    </div>
  )
}
