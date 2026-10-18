'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

// Pages announce login/logout through this event; the layout can't read their state.
const ADMIN_AUTH_EVENT = 'admin-auth-change'

// Keep in sync with DEFAULT_ROLE in app/admin/page.tsx.
const DEFAULT_ROLE = 'teacher'

interface MenuRole {
  code: string
  name_th: string
}

const NAV = [
  { href: '/admin/news', label: 'News' },
  { href: '/admin/master-data', label: 'Master Data' },
  { href: '/admin/roles', label: 'Roles' },
  { href: '/admin/users', label: 'Admin Users' },
]

function hasToken(): boolean {
  try {
    return !!localStorage.getItem('admin_token')
  } catch {
    return false
  }
}

function navClass(active: boolean) {
  return `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${
    active ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
  }`
}

// The Dashboard entry expands into one sub-item per role (/admin?role=<code>).
// Only roles with code behind them or with users get one — a coming-soon role
// has nothing to show yet.
function SideNav({ pathname, onLogout }: { pathname: string; onLogout: () => void }) {
  const currentRole = useSearchParams().get('role') ?? DEFAULT_ROLE
  const [roles, setRoles] = useState<MenuRole[]>([])

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) return
    fetch(`/api/admin/roles?token=${encodeURIComponent(token)}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((list: (MenuRole & { hasImplementation: boolean; userCount: number })[]) =>
        setRoles(list.filter((r) => r.hasImplementation || r.userCount > 0))
      )
      .catch(() => {})
    // Refetch when navigating (e.g. after editing roles at /admin/roles).
  }, [pathname])

  const onDashboard = pathname === '/admin'

  return (
    <div className="flex gap-1 overflow-x-auto p-2 md:h-full md:flex-col md:p-4">
      <p className="hidden px-3 pb-3 text-lg font-bold md:block">Yokyai Admin</p>

      {roles.length === 0 ? (
        <Link href="/admin" className={navClass(onDashboard)}>
          Dashboard
        </Link>
      ) : (
        <>
          <span className="hidden px-3 pt-1 text-xs font-semibold uppercase tracking-wide text-gray-400 md:block">
            Dashboard
          </span>
          {roles.map((r) => (
            <Link
              key={r.code}
              href={`/admin?role=${r.code}`}
              className={`${navClass(onDashboard && currentRole === r.code)} md:ml-2`}
            >
              <span className="md:hidden">Dashboard · </span>
              {r.name_th}
            </Link>
          ))}
          <span className="hidden pb-1 md:block" />
        </>
      )}

      {NAV.map((item) => (
        <Link key={item.href} href={item.href} className={navClass(pathname === item.href)}>
          {item.label}
        </Link>
      ))}
      <button
        onClick={onLogout}
        className="whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 md:mt-auto"
      >
        Logout
      </button>
    </div>
  )
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
        <Suspense>
          <SideNav pathname={pathname} onLogout={logout} />
        </Suspense>
      </nav>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
