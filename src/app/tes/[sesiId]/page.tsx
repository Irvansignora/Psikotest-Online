import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TesEngine from '@/components/user/TesEngine'

export default async function TesPage({ params }: { params: { sesiId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: sesi } = await supabase
    .from('sesi_tes')
    .select('*, project:projects(id, nama, proctoring_kamera, proctoring_fullscreen, proctoring_anti_tab, proctoring_rekam_foto, proctoring_interval_foto, pesan_selesai, paket_tes:paket_tes(id, nama, durasi_total, tampilkan_skor, acak_soal, paket_tes_soal(*, bank_soal:bank_soal(id, nama, soal(*, pilihan_jawaban(*)))))), jawaban(*)')
    .eq('id', params.sesiId)
    .eq('user_id', user.id)
    .single()

  if (!sesi || sesi.status === 'selesai' || sesi.status === 'dibatalkan') {
    redirect('/dashboard/user')
  }

  // Flatten and prepare soal
  const paket = sesi.project?.paket_tes
  let allSoal: any[] = []

  if (paket?.paket_tes_soal) {
    for (const pts of paket.paket_tes_soal.sort((a: any, b: any) => a.urutan - b.urutan)) {
      const soalInBank = pts.bank_soal?.soal || []
      const sorted = [...soalInBank].sort((a: any, b: any) => a.nomor_urut - b.nomor_urut)
      const limit = pts.jumlah_soal ? sorted.slice(0, pts.jumlah_soal) : sorted

      // Acak per bank jika setting
      const final = paket.acak_soal ? limit.sort(() => Math.random() - 0.5) : limit
      allSoal = [...allSoal, ...final.map((s: any) => ({ ...s, bank_nama: pts.bank_soal?.nama }))]
    }
  }

  return (
    <TesEngine
      sesi={sesi}
      soalList={allSoal}
      jawabanExisting={sesi.jawaban || []}
      project={sesi.project}
      paket={paket}
    />
  )
}
