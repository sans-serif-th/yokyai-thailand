// Client-side only. Vercel rejects request bodies over ~4.5 MB, and phone
// photos easily exceed that, so big images are scaled down before upload.
const MAX_BYTES = 3.5 * 1024 * 1024
const MAX_EDGE = 1800

export async function shrinkImageForUpload(file: File): Promise<File> {
  if (file.size <= MAX_BYTES) return file
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    // WebP keeps transparency (PNG logos) at a fraction of the size.
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.88))
    if (!blob || blob.size >= file.size) return file
    return new File([blob], file.name.replace(/\.\w+$/, '') + '.webp', { type: 'image/webp' })
  } catch {
    return file
  }
}
