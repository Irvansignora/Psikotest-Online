import PaketTesForm from '@/components/admin/PaketTesForm'
export default function EditPaketTesPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-neutral-900">Edit Paket Tes</h1>
      </div>
      <PaketTesForm paketId={params.id} />
    </div>
  )
}
