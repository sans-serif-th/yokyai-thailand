'use client'

import { useEffect } from 'react'

// Short-lived toast above the bottom nav. `message` null = hidden; changing
// `token` restarts the timer, so tapping twice in a row re-shows the message.
export function Snackbar({
  message,
  token,
  onDismiss,
  durationMs = 2500,
}: {
  message: string | null
  token: number
  onDismiss: () => void
  durationMs?: number
}) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(onDismiss, durationMs)
    return () => clearTimeout(timer)
  }, [message, token, onDismiss, durationMs])

  if (!message) return null
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(6rem+env(safe-area-inset-bottom))] z-30 flex justify-center px-4">
      <p
        role="status"
        className="rounded-lg bg-foreground px-4 py-3 text-sm leading-[21px] text-white shadow-lg"
      >
        {message}
      </p>
    </div>
  )
}
