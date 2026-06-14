'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import type { Soal } from '@/types'

const tipeLabel: Record<string, string> = {
  pilihan_ganda: 'PG', benar_salah: 'B/S',
  skala_likert: 'Likert', isian_singkat: 'Isian', esai: 'Esai'
}
const tipeBadge: Record<string, string> = {
  pilihan_ganda: 'bg-blue-50 text-blue-700', benar_salah: 'bg-green-50 text-green-700',
  skala_likert: 'bg-purple-50 text-purple-700', isian_singkat: 'bg-yellow-50 text-yellow-700',
  esai: 'bg-orange-50 text-orange-700'
}

export default function SoalList({ bankId, soalList }: { bankId: string; soalList: Soal[] }) {
  const [soal, setSoal] = useState(soalList)
  const supabase = createClient()
  const router = useRouter()

  async function handleDelete(soalId: string) {
    if (!confirm('Hapus soal ini? Tindakan tidak dapat diurungkan.')) return
    const { error } = await supabase.from('soal').delete().eq('id', soalId)
    if (error) { toast.error('Gagal menghapus soal'); return }
    setSoal(s => s.filter(q => q.id !== soalId))
    toast.success('Soal dihapus')
  }

  if (soal.length === 0) {
    return (
      <div className="card p-12 text-center">
        <p className="text-neutral-400 text-sm mb-3">Belum ada soal di bank ini</p>
        <Link href={`/dashboard/admin/bank-soal/${bankId}/soal/baru`} className="btn-primary btn btn-sm">
          Tambah Soal Pertama
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {soal.map((q, i) => (
        <div key={q.id} className="card p-4 flex items-start gap-4">
          <div className="w-8 h-8 bg-neutral-100 rounded-md flex items-center justify-center text-xs font-mono text-neutral-500 shrink-0">
            {q.nomor_urut}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tipeBadge[q.tipe]}`}>
                {tipeLabel[q.tipe]}
              </span>
              {q.kelompok && (
                <span className="text-xs text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">{q.kelompok}</span>
              )}
              {q.waktu_pengerjaan && (
                <span className="text-xs text-neutral-400">⏱ {q.waktu_pengerjaan}d</span>
              )}
              <span className="text-xs text-neutral-400">Bobot: {q.bobot}</span>
            </div>
            <p className="text-sm text-neutral-800 line-clamp-2">{q.pertanyaan}</p>
            {q.pilihan_jawaban && q.pilihan_jawaban.length > 0 && (
              <p className="text-xs text-neutral-400 mt-1">
                {q.pilihan_jawaban.length} pilihan jawaban
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href={`/dashboard/admin/bank-soal/${bankId}/soal/${q.id}`} className="btn-ghost btn btn-sm">
              Edit
            </Link>
            <button onClick={() => handleDelete(q.id)} className="btn-ghost btn btn-sm text-red-500 hover:bg-red-50">
              Hapus
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
