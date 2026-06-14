import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MulaiTesClient from '@/components/user/MulaiTesClient'

export default async function MulaiTesPage({ params }: { params: { projectId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get project + verify peserta
  const { data: project } = await supabase
    .from('projects')
    .select('*, paket_tes:paket_tes(id, nama, instruksi, durasi_total, acak_soal, tampilkan_skor, paket_tes_soal(*, bank_soal:bank_soal(id, nama, soal(count))))')
    .eq('id', params.projectId)
    .single()

  if (!project || project.status !== 'aktif') redirect('/dashboard/user')

  const { data: peserta } = await supabase
    .from('project_peserta')
    .select('id')
    .eq('project_id', params.projectId)
    .eq('user_id', user.id)
    .single()

  if (!peserta) redirect('/dashboard/user')

  // Check existing session
  const { data: existingSesi } = await supabase
    .from('sesi_tes')
    .select('id, status')
    .eq('project_id', params.projectId)
    .eq('user_id', user.id)
    .single()

  if (existingSesi?.status === 'selesai') redirect('/dashboard/user')

  return (
    <MulaiTesClient
      project={project}
      userId={user.id}
      existingSesiId={existingSesi?.id}
    />
  )
}
