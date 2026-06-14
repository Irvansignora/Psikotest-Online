export type UserRole = 'master_admin' | 'klien' | 'user'
export type QuestionType = 'pilihan_ganda' | 'benar_salah' | 'skala_likert' | 'isian_singkat' | 'esai'
export type ProjectStatus = 'draft' | 'aktif' | 'selesai' | 'arsip'
export type SessionStatus = 'belum_mulai' | 'berjalan' | 'selesai' | 'dibatalkan'

export interface Profile {
  id: string
  full_name: string
  email: string
  role: UserRole
  avatar_url?: string
  phone?: string
  organization?: string
  is_active: boolean
  created_at: string
  updated_at: string
  created_by?: string
}

export interface BankSoal {
  id: string
  nama: string
  deskripsi?: string
  kategori?: string
  owner_id: string
  is_public: boolean
  created_at: string
  updated_at: string
  soal?: Soal[]
  _count?: { soal: number }
}

export interface Soal {
  id: string
  bank_soal_id: string
  nomor_urut: number
  tipe: QuestionType
  pertanyaan: string
  pertanyaan_media_url?: string
  pertanyaan_media_type?: 'image' | 'video' | 'audio'
  kelompok?: string
  bobot: number
  waktu_pengerjaan?: number
  acak_pilihan: boolean
  wajib: boolean
  keterangan?: string
  created_at: string
  updated_at: string
  pilihan_jawaban?: PilihanJawaban[]
}

export interface PilihanJawaban {
  id: string
  soal_id: string
  label: string
  teks: string
  media_url?: string
  skor: number
  urutan: number
  is_benar: boolean
}

export interface PaketTes {
  id: string
  nama: string
  deskripsi?: string
  instruksi?: string
  owner_id: string
  durasi_total?: number
  acak_soal: boolean
  tampilkan_skor: boolean
  created_at: string
  updated_at: string
  paket_tes_soal?: PaketTesSoal[]
}

export interface PaketTesSoal {
  id: string
  paket_tes_id: string
  bank_soal_id: string
  urutan: number
  jumlah_soal?: number
  waktu_per_bagian?: number
  bank_soal?: BankSoal
}

export interface Project {
  id: string
  nama: string
  deskripsi?: string
  kode_project?: string
  owner_id: string
  paket_tes_id?: string
  status: ProjectStatus
  tanggal_mulai?: string
  tanggal_selesai?: string
  proctoring_kamera: boolean
  proctoring_fullscreen: boolean
  proctoring_anti_tab: boolean
  proctoring_rekam_foto: boolean
  proctoring_interval_foto: number
  max_peserta?: number
  allow_registrasi_mandiri: boolean
  pesan_selamat_datang?: string
  pesan_selesai?: string
  created_at: string
  updated_at: string
  paket_tes?: PaketTes
  owner?: Profile
  _count?: { project_peserta: number; sesi_tes: number }
}

export interface ProjectPeserta {
  id: string
  project_id: string
  user_id: string
  kode_akses?: string
  terdaftar_at: string
  diundang_by?: string
  user?: Profile
  project?: Project
}

export interface SesiTes {
  id: string
  project_id: string
  user_id: string
  paket_tes_id: string
  status: SessionStatus
  mulai_at?: string
  selesai_at?: string
  durasi_aktual?: number
  ip_address?: string
  user_agent?: string
  skor_total?: number
  catatan_proctoring: ProctoringEvent[]
  created_at: string
  user?: Profile
  project?: Project
}

export interface ProctoringEvent {
  tipe: 'ganti_tab' | 'minimize' | 'exit_fullscreen' | 'blur' | 'foto'
  timestamp: string
  keterangan?: string
}

export interface Jawaban {
  id: string
  sesi_tes_id: string
  soal_id: string
  pilihan_id?: string
  teks_jawaban?: string
  skor_perolehan?: number
  waktu_jawab?: number
  dijawab_at: string
}

export interface ProctoringLog {
  id: string
  sesi_tes_id: string
  tipe: string
  foto_url?: string
  keterangan?: string
  created_at: string
}
