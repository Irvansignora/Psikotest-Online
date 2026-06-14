import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { imageData, sesiId } = await req.json()
    if (!imageData || !sesiId) return NextResponse.json({ error: 'Missing data' }, { status: 400 })

    // Verify session belongs to user
    const { data: sesi } = await supabase.from('sesi_tes').select('id').eq('id', sesiId).eq('user_id', user.id).single()
    if (!sesi) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    const timestamp = Math.round(Date.now() / 1000)
    const folder = `psikotes/proctoring/${sesiId}`
    const publicId = `${sesiId}_${timestamp}`

    // Sign the upload
    const crypto = await import('crypto')
    const signStr = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`
    const signature = crypto.createHash('sha1').update(signStr).digest('hex')

    const formData = new FormData()
    formData.append('file', imageData)
    formData.append('api_key', apiKey!)
    formData.append('timestamp', String(timestamp))
    formData.append('signature', signature)
    formData.append('folder', folder)
    formData.append('public_id', publicId)

    const cloudRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: formData }
    )
    const cloudData = await cloudRes.json()

    if (!cloudRes.ok) throw new Error(cloudData.error?.message || 'Upload failed')

    return NextResponse.json({ url: cloudData.secure_url })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
