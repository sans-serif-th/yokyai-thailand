'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { authLog } from '@/lib/auth-log'
import { initLiffPlain, isLiffLoggedIn, liffLogin } from '@/lib/liff'

export default function LoggedOutPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    initLiffPlain()
      .then(() => {
        // "Log in again" sends the user through LINE and back to *this* page
        // (liff.login() returns to the current URL). liff.init() completes
        // that login, so a logged-in session here means they just finished
        // it — go into the app instead of showing the button a second time.
        const loggedIn = isLiffLoggedIn()
        authLog('logged-out:init', `loggedIn=${loggedIn}`)
        if (loggedIn) {
          router.replace('/')
          return
        }
        setReady(true)
      })
      .catch(() => setReady(true))
  }, [router])

  // Figma "Login" (164:3061): red screen with the logo and tagline centred,
  // and the LINE login button in a white sheet pinned to the bottom.
  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-brand-red">
      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-4 pb-8 pt-8">
        <div className="flex size-[160px] items-center justify-center rounded-full bg-white p-[10px]">
          <Image src="/login-logo.png" alt="โยกย้าย" width={129} height={129} priority />
        </div>
        <p className="text-center text-base font-semibold text-white">
          ค้นหาคู่ย้ายเฉพาะราชการที่มี
          <br />
          เป้าหมายสอดคล้องกัน
        </p>
      </div>
      <div className="mx-auto w-full max-w-lg rounded-t-2xl bg-white px-4 pb-[calc(1.375rem+env(safe-area-inset-bottom))] pt-[22px]">
        <button
          type="button"
          onClick={() => liffLogin()}
          disabled={!ready}
          className="flex h-[51px] w-full items-center justify-center gap-4 rounded-lg bg-brand-line px-5 py-3 text-base font-bold text-white disabled:opacity-50"
        >
          <Image src="/line-icon.png" alt="" width={27} height={27} />
          Line login
        </button>
      </div>
    </div>
  )
}
