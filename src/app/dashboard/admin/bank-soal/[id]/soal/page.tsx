import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import SoalList from '@/components/admin/SoalList'

export default async function KelolaSoalPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const [{ data: bank }, { data: soalList }] = await Promise.all([
    supabase.from('bank_soal').select('id, nama, kategori').eq('id', params.id).single(),
    supabase.from('soal').select('*, pilihan_jawaban(*)')
      .eq('bank_soal_id', params.id)
      .order('nomor_urut', { ascending: true })
  ])

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard/admin/bank-soal" className="text-xs text-neutral-500 hover:text-neutral-700">← Bank Soal</Link>
          </div>
          <h1 className="text-xl font-semibold text-neutral-900">Soal: {bank?.nama}</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{soalList?.length ?? 0} soal</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/admin/bank-soal/${params.id}/soal/import`} className="btn-secondary btn">
            📥 Import CSV
          </Link>
          <Link href={`/dashboard/admin/bank-soal/${params.id}/soal/baru`} className="btn-primary btn">
            + Tambah Soal
          </Link>
        </div>
      </div>

      <SoalList bankId={params.id} soalList={soalList || []} />
    </div>
  )
}
