import BankSoalForm from '@/components/admin/BankSoalForm'
export default function EditBankSoalPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-neutral-900">Edit Bank Soal</h1>
      </div>
      <BankSoalForm bankId={params.id} />
    </div>
  )
}
