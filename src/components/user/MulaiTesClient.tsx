'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Webcam from 'react-webcam'
import toast from 'react-hot-toast'

export default function MulaiTesClient({
  project, userId, existingSesiId
}: {
  project: any; userId: string; existingSesiId?: string
}) {
  const [step, setStep] = useState<'briefing' | 'kamera' | 'siap'>('briefing')
  const [kameraOk, setKameraOk] = useState(false)
  const [loading, setLoading] = useState(false)
  const webcamRef = useRef<any>(null)
  const router = useRouter()
  const supabase = createClient()

  const paket = project.paket_tes
  const prokKamera = project.proctoring_kamera
  const prokFullscreen = project.proctoring_fullscreen

  async function enterFullscreen() {
    if (prokFullscreen && document.documentElement.requestFullscreen) {
      try { await document.documentElement.requestFullscreen() } catch {}
    }
  }

  async function handleMulai() {
    setLoading(true)
    try {
      let sesiId = existingSesiId

      if (!sesiId) {
        const { data, error } = await supabase.from('sesi_tes').insert({
          project_id: project.id,
          user_id: userId,
          paket_tes_id: paket.id,
          status: 'berjalan',
          mulai_at: new Date().toISOString(),
          ip_address: null,
          user_agent: navigator.userAgent,
        }).select('id').single()

        if (error) throw error
        sesiId = data.id
      } else {
        // Resume - update status to berjalan if it was paused
        await supabase.from('sesi_tes').update({ status: 'berjalan' }).eq('id', sesiId)
      }

      await enterFullscreen()
      router.push(`/tes/${sesiId}`)
    } catch (err: any) {
      toast.error('Gagal memulai tes: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">

        {step === 'briefing' && (
          <div className="card">
            <div className="card-header text-center py-6">
              <div className="text-3xl mb-2">📋</div>
              <h1 className="text-xl font-semibold text-neutral-900">{project.nama}</h1>
              <p className="text-sm text-neutral-500 mt-1">Paket: {paket?.nama}</p>
            </div>
            <div className="card-body space-y-5">
              {project.pesan_selamat_datang && (
                <div className="bg-brand-50 border border-brand-100 rounded-lg p-4">
                  <p className="text-sm text-brand-800 whitespace-pre-line">{project.pesan_selamat_datang}</p>
                </div>
              )}

              {paket?.instruksi && (
                <div>
                  <h2 className="font-semibold text-neutral-800 text-sm mb-2">Petunjuk Pengerjaan</h2>
                  <p className="text-sm text-neutral-600 whitespace-pre-line leading-relaxed">{paket.instruksi}</p>
                </div>
              )}

              {/* Rules */}
              <div>
                <h2 className="font-semibold text-neutral-800 text-sm mb-3">Peraturan Tes</h2>
                <ul className="space-y-2">
                  {prokFullscreen && (
                    <li className="flex items-start gap-2 text-sm text-neutral-600">
                      <span className="text-yellow-500 mt-0.5">⚠</span>
                      Tes akan berjalan dalam mode <strong>layar penuh</strong>. Jangan keluar dari fullscreen.
                    </li>
                  )}
                  {project.proctoring_anti_tab && (
                    <li className="flex items-start gap-2 text-sm text-neutral-600">
                      <span className="text-yellow-500 mt-0.5">⚠</span>
                      <strong>Dilarang berpindah tab/window</strong> selama tes berlangsung.
                    </li>
                  )}
                  {prokKamera && (
                    <li className="flex items-start gap-2 text-sm text-neutral-600">
                      <span className="text-yellow-500 mt-0.5">⚠</span>
                      <strong>Kamera depan akan aktif</strong> selama tes berlangsung.
                    </li>
                  )}
                  {paket?.durasi_total && (
                    <li className="flex items-start gap-2 text-sm text-neutral-600">
                      <span className="text-blue-500 mt-0.5">ℹ</span>
                      Durasi tes: <strong>{paket.durasi_total} menit</strong>.
                    </li>
                  )}
                </ul>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => router.back()} className="btn-secondary btn">Kembali</button>
                <button onClick={() => prokKamera ? setStep('kamera') : setStep('siap')} className="btn-primary btn flex-1">
                  Saya Mengerti, Lanjutkan →
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'kamera' && (
          <div className="card text-center">
            <div className="card-header py-6">
              <div className="text-3xl mb-2">📷</div>
              <h2 className="text-lg font-semibold text-neutral-900">Izin Kamera Diperlukan</h2>
              <p className="text-sm text-neutral-500 mt-1">Kamera Anda harus aktif selama tes berlangsung</p>
            </div>
            <div className="card-body space-y-4">
              <div className="flex justify-center">
                <div className="rounded-xl overflow-hidden w-72 h-48 bg-neutral-100 border border-neutral-200">
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    width={288}
                    height={192}
                    videoConstraints={{ facingMode: 'user' }}
                    onUserMedia={() => setKameraOk(true)}
                    onUserMediaError={() => { setKameraOk(false); toast.error('Tidak bisa mengakses kamera') }}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              {kameraOk
                ? <p className="text-sm text-green-600 font-medium">✓ Kamera terdeteksi dengan baik</p>
                : <p className="text-sm text-neutral-400">Mendeteksi kamera...</p>
              }
              <div className="flex gap-3">
                <button onClick={() => setStep('briefing')} className="btn-secondary btn">Kembali</button>
                <button onClick={() => setStep('siap')} disabled={!kameraOk} className="btn-primary btn flex-1">
                  Lanjutkan →
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'siap' && (
          <div className="card text-center">
            <div className="card-body py-10 space-y-5">
              <div className="text-5xl">🚀</div>
              <div>
                <h2 className="text-xl font-semibold text-neutral-900 mb-2">Siap Mengerjakan Tes?</h2>
                <p className="text-sm text-neutral-500">
                  Setelah menekan tombol di bawah, tes akan segera dimulai
                  {prokFullscreen && ' dalam mode layar penuh'}.
                </p>
              </div>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setStep(prokKamera ? 'kamera' : 'briefing')} className="btn-secondary btn">Kembali</button>
                <button onClick={handleMulai} disabled={loading} className="btn-primary btn btn-lg px-10">
                  {loading ? 'Mempersiapkan...' : '▶ Mulai Tes Sekarang'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
