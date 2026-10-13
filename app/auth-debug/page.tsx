'use client'

import { useEffect, useState } from 'react'
import { clearAuthLog, readAuthLog, type AuthLogEntry } from '@/lib/auth-log'

// Diagnostic only: shows the login breadcrumbs recorded on this device.
export default function AuthDebugPage() {
  const [entries, setEntries] = useState<AuthLogEntry[] | null>(null)

  useEffect(() => {
    setEntries(readAuthLog())
  }, [])

  return (
    <div className="mx-auto max-w-lg p-4">
      <h1 className="text-lg font-bold">Auth log</h1>
      <button
        type="button"
        className="mt-2 rounded border px-3 py-1 text-sm"
        onClick={() => {
          clearAuthLog()
          setEntries([])
        }}
      >
        ล้าง log
      </button>
      <ol className="mt-4 flex flex-col gap-2 text-xs">
        {(entries ?? []).map((e, i) => (
          <li key={i} className="rounded bg-white p-2">
            <div className="font-mono text-zinc-500">{e.at}</div>
            <div className="font-semibold">{e.event}</div>
            {e.detail && <div className="break-words">{e.detail}</div>}
          </li>
        ))}
        {entries?.length === 0 && <li className="text-zinc-500">ยังไม่มีข้อมูล</li>}
      </ol>
    </div>
  )
}
