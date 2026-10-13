// Tiny breadcrumb trail for diagnosing LINE login loops. Lives in
// localStorage (survives the redirects to LINE and back) and holds only
// event names and timings — never tokens. Viewed at /auth-debug.
const KEY = 'yokyai:auth-log'
const MAX_ENTRIES = 40

export interface AuthLogEntry {
  at: string
  event: string
  detail?: string
}

export function authLog(event: string, detail?: string) {
  if (typeof window === 'undefined') return
  try {
    const entries = readAuthLog()
    entries.push({ at: new Date().toISOString(), event, detail })
    localStorage.setItem(KEY, JSON.stringify(entries.slice(-MAX_ENTRIES)))
  } catch {
    // Diagnostics only — never break login over it.
  }
  console.info('[auth]', event, detail ?? '')
}

export function readAuthLog(): AuthLogEntry[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

export function clearAuthLog() {
  try {
    localStorage.removeItem(KEY)
  } catch {}
}
