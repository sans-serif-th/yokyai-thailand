'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchProfile, fetchSubscriptionStatus, uploadPaymentSlip } from '@/lib/api'
import { withAuthRetry } from '@/lib/session'
import { BackHeader } from '@/components/back-header'
import type { SubscriptionStatus } from '@/lib/types'

type View = 'loading' | 'ready' | 'error'

const MAX_SLIP_BYTES = 5 * 1024 * 1024

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export default function UpgradePage() {
  const router = useRouter()
  const [view, setView] = useState<View>('loading')
  const [status, setStatus] = useState<SubscriptionStatus | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  useEffect(() => {
    async function bootstrap() {
      try {
        const { result: profile } = await withAuthRetry((t) => fetchProfile(t))
        if (!profile.teacher) {
          router.replace('/')
          return
        }
        const { result } = await withAuthRetry((t) => fetchSubscriptionStatus(t))
        setStatus(result)
        setView('ready')
      } catch (err) {
        setErrorMessage((err as Error).message)
        setView('error')
      }
    }
    bootstrap()
  }, [router])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setUploadError('ไฟล์สลิปต้องเป็น JPG หรือ PNG เท่านั้น')
      return
    }
    if (file.size > MAX_SLIP_BYTES) {
      setUploadError('ไฟล์สลิปต้องมีขนาดไม่เกิน 5MB')
      return
    }

    setUploadError(null)
    setUploading(true)
    try {
      const dataUrl = await readFileAsDataUrl(file)
      await withAuthRetry((t) => uploadPaymentSlip(t, dataUrl))
      const { result } = await withAuthRetry((t) => fetchSubscriptionStatus(t))
      setStatus(result)
    } catch (err) {
      setUploadError((err as Error).message)
    } finally {
      setUploading(false)
    }
  }

  if (view === 'loading') {
    return <p className="text-center p-8 text-zinc-600">กำลังโหลด...</p>
  }

  if (view === 'error') {
    return <p className="text-center p-8 text-terracotta">{errorMessage}</p>
  }

  if (!status) return null

  return (
    <div className="flex flex-col gap-5 max-w-lg mx-auto p-4">
      <BackHeader title="อัปเกรดแพ็กเกจ" href="/criteria" />

      <div className="card-surface">
        <p className="text-xs text-zinc-500">รอบปัจจุบัน</p>
        <p className="text-sm font-medium">{status.round?.label ?? 'ไม่มีรอบที่เปิดใช้งาน'}</p>
      </div>

      {status.package === 'paid' ? (
        <div className="card-surface">
          <p className="text-sm font-medium text-sage-dark">
            ✅ คุณใช้แพ็กเกจพรีเมียมสำหรับรอบนี้แล้ว
          </p>
          <p className="text-sm text-zinc-600 mt-1">
            เพิ่มปลายทางได้สูงสุด {status.maxDestinations} แห่ง
          </p>
        </div>
      ) : status.slipUploaded ? (
        <div className="card-surface">
          <p className="text-sm font-medium">⏳ รอการตรวจสอบสลิปการชำระเงิน</p>
          <p className="text-sm text-zinc-600 mt-1">
            ทีมงานจะตรวจสอบและอัปเกรดแพ็กเกจให้ภายใน 1-2 วัน
          </p>
        </div>
      ) : (
        <>
          <div className="card-surface flex flex-col gap-3 items-center">
            <p className="text-sm font-medium self-start">สแกน PromptPay เพื่อชำระเงิน</p>
            <img
              src="/promptpay-qr.jpg"
              alt="PromptPay QR"
              className="w-48 h-48 object-contain border border-sage rounded-lg"
            />
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">แนบสลิปการโอนเงิน</span>
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleFileChange}
              disabled={uploading}
              className="input-field"
            />
          </label>

          {uploadError && <p className="text-terracotta text-sm">{uploadError}</p>}
          {uploading && <p className="text-sm text-zinc-500">กำลังอัปโหลด...</p>}
        </>
      )}
    </div>
  )
}
