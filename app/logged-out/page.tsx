'use client'

import { useEffect, useState } from 'react'
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

  return (
    <div className="max-w-lg mx-auto p-4 flex flex-col items-center gap-4 text-center pt-16">
      <p className="text-lg">คุณออกจากระบบแล้ว</p>
      <button type="button" onClick={() => liffLogin()} disabled={!ready} className="btn-primary">
        เข้าสู่ระบบอีกครั้ง
      </button>
    </div>
  )
}
