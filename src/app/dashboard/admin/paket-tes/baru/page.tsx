import PaketTesForm from '@/components/admin/PaketTesForm'
export default function PaketTesBaruPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-neutral-900">Buat Paket Tes</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Susun bank soal menjadi satu paket tes yang siap digunakan</p>
      </div>
      <PaketTesForm />
    </div>
  )
}
