'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import * as XLSX from 'xlsx'

export default function ExportPesertaButton({ projectId, projectNama }: { projectId: string; projectNama: string }) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleExport() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('project_peserta')
        .select('terdaftar_at, user:profiles(full_name, email, phone, organization), sesi_tes:sesi_tes(status, skor_total, mulai_at, selesai_at, durasi_aktual)')
        .eq('project_id', projectId)
        .order('terdaftar_at', { ascending: true })

      if (error) throw error

      const rows = (data || []).map((p: any, i: number) => {
        const sesi = p.sesi_tes?.[0]
        const durasi = sesi?.durasi_aktual
          ? `${Math.floor(sesi.durasi_aktual / 60)}m ${sesi.durasi_aktual % 60}d`
          : '-'
        return {
          'No': i + 1,
          'Nama': p.user?.full_name || '',
          'Email': p.user?.email || '',
          'No. HP': p.user?.phone || '',
          'Organisasi': p.user?.organization || '',
          'Tgl Daftar': p.terdaftar_at ? new Date(p.terdaftar_at).toLocaleString('id-ID') : '',
          'Status Tes': sesi?.status?.replace(/_/g, ' ') || 'Belum Mulai',
          'Skor': sesi?.skor_total ?? '',
          'Mulai Tes': sesi?.mulai_at ? new Date(sesi.mulai_at).toLocaleString('id-ID') : '',
          'Selesai Tes': sesi?.selesai_at ? new Date(sesi.selesai_at).toLocaleString('id-ID') : '',
          'Durasi': durasi,
        }
      })

      const ws = XLSX.utils.json_to_sheet(rows)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Peserta')

      // Auto column width
      const cols = Object.keys(rows[0] || {}).map(k => ({ wch: Math.max(k.length, 15) }))
      ws['!cols'] = cols

      const filename = `Peserta_${projectNama.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`
      XLSX.writeFile(wb, filename)
      toast.success('Data berhasil diexport')
    } catch (err: any) {
      toast.error('Export gagal: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleExport} disabled={loading} className="btn-secondary btn">
      {loading ? 'Mengexport...' : '📥 Export Excel'}
    </button>
  )
}
