import ProjectForm from '@/components/admin/ProjectForm'

export default function EditProjectPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-neutral-900">Edit Project</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Perbarui detail project dan pengaturan proctoring</p>
      </div>
      <ProjectForm projectId={params.id} />
    </div>
  )
}
