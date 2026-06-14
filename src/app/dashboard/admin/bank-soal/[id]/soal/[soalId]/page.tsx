import SoalForm from '@/components/admin/SoalForm'
export default function EditSoalPage({ params }: { params: { id: string; soalId: string } }) {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-neutral-900">Edit Soal</h1>
      </div>
      <SoalForm bankId={params.id} soalId={params.soalId} />
    </div>
  )
}
