import { checkAdminToken } from '@/lib/admin-token'
import { createServiceClient } from '@/lib/supabase-server'

const BUCKET = 'news-images'
// Vercel rejects request bodies over ~4.5 MB before they reach this route;
// the admin page shrinks larger images first (lib/image-resize.ts).
const MAX_BYTES = 4 * 1024 * 1024
const EXTENSIONS: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
}

// multipart/form-data with a single `file` field; returns the public URL to
// store in news.cover_image_url or inline in the body.
export async function POST(request: Request) {
  if (!checkAdminToken(new URL(request.url).searchParams.get('token'))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const form = await request.formData()
  const file = form.get('file')
  if (!(file instanceof File)) {
    return Response.json({ error: 'file is required' }, { status: 400 })
  }
  const ext = EXTENSIONS[file.type]
  if (!ext) {
    return Response.json({ error: 'Only PNG, JPEG or WebP images are allowed' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: 'Image must be 4 MB or smaller' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const path = `${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, await file.arrayBuffer(), { contentType: file.type })
  if (error) return Response.json({ error: error.message }, { status: 500 })

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return Response.json({ url: data.publicUrl })
}
