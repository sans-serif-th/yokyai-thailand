'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

// Pages announce login/logout through this event; the layout can't read their state.
const ADMIN_AUTH_EVENT = 'admin-auth-change'

const NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/news', label: 'News' },
  { href: '/admin/master-data', label: 'Master Data' },
  { href: '/admin/users', label: 'Admin Users' },
]

function hasToken(): boolean {
  try {
    return !!localStorage.getItem('admin_token')
  } catch {
    return false
  }
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    const sync = () => setAuthed(hasToken())
    sync()
    window.addEventListener(ADMIN_AUTH_EVENT, sync)
    return () => window.removeEventListener(ADMIN_AUTH_EVENT, sync)
  }, [pathname])

  if (!authed) return <>{children}</>

  function logout() {
    try {
      localStorage.removeItem('admin_token')
    } catch {}
    window.location.assign('/admin')
  }

  return (
    <div className="min-h-screen md:flex">
      <nav className="shrink-0 border-b border-gray-200 bg-white md:sticky md:top-0 md:h-screen md:w-56 md:border-b-0 md:border-r">
        <div className="flex gap-1 overflow-x-auto p-2 md:h-full md:flex-col md:p-4">
          <p className="hidden px-3 pb-3 text-lg font-bold md:block">Yokyai Admin</p>
          {NAV.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${
                  active ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
          <button
            onClick={logout}
            className="whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 md:mt-auto"
          >
            Logout
          </button>
        </div>
      </nav>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
