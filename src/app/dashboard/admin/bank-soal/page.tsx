import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export default async function BankSoalPage() {
  const supabase = createClient()
  const { data: banks } = await supabase
    .from('bank_soal')
    .select('*, owner:profiles(full_name), soal(count)')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Bank Soal</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{banks?.length ?? 0} bank soal tersedia</p>
        </div>
        <Link href="/dashboard/admin/bank-soal/baru" className="btn-primary btn">
          + Buat Bank Soal
        </Link>
      </div>

      <div className="grid gap-4">
        {banks && banks.length > 0 ? banks.map((bank: any) => (
          <div key={bank.id} className="card p-5 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-neutral-800 text-sm truncate">{bank.nama}</h3>
                {bank.kategori && <span className="badge-blue text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">{bank.kategori}</span>}
                {bank.is_public && <span className="badge-green text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600 font-medium">Publik</span>}
              </div>
              {bank.deskripsi && <p className="text-xs text-neutral-500 line-clamp-1">{bank.deskripsi}</p>}
              <p className="text-xs text-neutral-400 mt-1">
                {bank.soal?.[0]?.count ?? 0} soal · Oleh {bank.owner?.full_name} · {formatDate(bank.created_at)}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link href={`/dashboard/admin/bank-soal/${bank.id}/soal`} className="btn-primary btn btn-sm">
                Kelola Soal
              </Link>
              <Link href={`/dashboard/admin/bank-soal/${bank.id}`} className="btn-ghost btn btn-sm">
                Edit
              </Link>
            </div>
          </div>
        )) : (
          <div className="card p-12 text-center">
            <p className="text-neutral-400 text-sm mb-3">Belum ada bank soal</p>
            <Link href="/dashboard/admin/bank-soal/baru" className="btn-primary btn btn-sm">
              Buat Bank Soal Pertama
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
