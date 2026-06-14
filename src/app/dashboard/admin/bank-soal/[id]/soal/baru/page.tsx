import { createClient } from '@/lib/supabase/server'
import SoalForm from '@/components/admin/SoalForm'

export default async function TambahSoalPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { count } = await supabase.from('soal').select('*', { count: 'exact', head: true }).eq('bank_soal_id', params.id)
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-neutral-900">Tambah Soal Baru</h1>
      </div>
      <SoalForm bankId={params.id} nextNomor={(count || 0) + 1} />
    </div>
  )
}
