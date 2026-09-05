'use client'

import { useEffect, useState } from 'react'
import { initLiffPlain, liffLogin } from '@/lib/liff'

export default function LoggedOutPage() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    initLiffPlain()
      .then(() => setReady(true))
      .catch(() => setReady(true))
  }, [])

  return (
    <div className="max-w-lg mx-auto p-4 flex flex-col items-center gap-4 text-center pt-16">
      <p className="text-lg">คุณออกจากระบบแล้ว</p>
      <button
        type="button"
        onClick={() => liffLogin()}
        disabled={!ready}
        className="btn-primary"
      >
        เข้าสู่ระบบอีกครั้ง
      </button>
    </div>
  )
}
