import BankSoalForm from '@/components/admin/BankSoalForm'
export default function BankSoalBaruPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-neutral-900">Buat Bank Soal</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Buat kelompok soal berdasarkan konstruk/dimensi psikologi</p>
      </div>
      <BankSoalForm />
    </div>
  )
}
