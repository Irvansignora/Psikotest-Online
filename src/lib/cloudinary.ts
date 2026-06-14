// Client-side upload to Cloudinary via unsigned preset
export async function uploadToCloudinary(
  file: File,
  folder: string = 'psikotes'
): Promise<{ url: string; public_id: string }> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', 'psikotes_unsigned') // create this in Cloudinary dashboard
  formData.append('folder', folder)

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    { method: 'POST', body: formData }
  )

  if (!res.ok) throw new Error('Upload gagal')
  const data = await res.json()
  return { url: data.secure_url, public_id: data.public_id }
}

export function getCloudinaryUrl(publicId: string, options: {
  width?: number; height?: number; quality?: number; format?: string
} = {}): string {
  const { width, height, quality = 80, format = 'auto' } = options
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const transforms = [
    `q_${quality}`, `f_${format}`,
    width && `w_${width}`, height && `h_${height}`
  ].filter(Boolean).join(',')

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${publicId}`
}
