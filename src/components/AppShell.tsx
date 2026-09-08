import type { ReactNode } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { DemoNotice } from './ui'
import { usePortal } from '../store/PortalContext'

export interface NavItem {
  to: string
  label: string
  icon: string
  end?: boolean
}

const ROLE_STYLES = {
  customer: { bar: 'bg-brand-800', tag: 'Customer' },
  technician: { bar: 'bg-ink-900', tag: 'Technician' },
  admin: { bar: 'bg-brand-900', tag: 'Admin' },
} as const

export function AppShell({
  role,
  title,
  subtitle,
  nav,
  back,
  actions,
  children,
}: {
  role: keyof typeof ROLE_STYLES
  title: string
  subtitle?: ReactNode
  nav: NavItem[]
  back?: { to: string; label: string }
  actions?: ReactNode
  children: ReactNode
}) {
  const styles = ROLE_STYLES[role]
  const { storageWarning, dismissStorageWarning } = usePortal()
  const navigate = useNavigate()

  return (
    <div className="min-h-dvh bg-ink-50 flex flex-col">
      <DemoNotice />

      <header className={`${styles.bar} text-white sticky top-0 z-30`}>
        <div className="mx-auto w-full max-w-5xl px-4 py-3">
          <div className="flex items-center gap-3">
            {back ? (
              <button
                onClick={() => navigate(back.to)}
                className="-ml-2 shrink-0 rounded-lg px-2 py-2 text-sm text-white/80 hover:bg-white/10"
                aria-label={back.label}
              >
                ←
              </button>
            ) : (
              <Link
                to="/"
                className="shrink-0 grid h-9 w-9 place-items-center rounded-xl bg-white/15 text-sm font-extrabold"
                title="POC demo menu"
              >
                JGL
              </Link>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-bold leading-tight">{title}</h1>
              {subtitle && (
                <p className="truncate text-xs text-white/70 leading-tight">{subtitle}</p>
              )}
            </div>
            <span className="hidden sm:inline chip bg-white/15 text-white">{styles.tag} view</span>
            {actions}
          </div>
        </div>

        {/* Desktop / tablet nav */}
        <nav className="hidden md:block border-t border-white/10">
          <div className="mx-auto w-full max-w-5xl px-2">
            <ul className="flex gap-1">
              {nav.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2.5 text-sm font-medium border-b-2 transition ${
                        isActive
                          ? 'border-white text-white'
                          : 'border-transparent text-white/70 hover:text-white'
                      }`
                    }
                  >
                    <span aria-hidden>{item.icon}</span>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </header>

      {storageWarning && (
        <div className="mx-auto w-full max-w-5xl px-4 pt-3">
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 flex items-start gap-2">
            <span>⚠️</span>
            <span className="flex-1">{storageWarning}</span>
            <button onClick={dismissStorageWarning} className="font-semibold">
              Dismiss
            </button>
          </div>
        </div>
      )}

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-4 pb-28 md:pb-10">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-ink-200 bg-white/95 backdrop-blur safe-bottom">
        <ul className="mx-auto flex max-w-5xl">
          {nav.map((item) => (
            <li key={item.to} className="flex-1">
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex min-h-[56px] flex-col items-center justify-center gap-0.5 px-1 pt-2 pb-1 text-[11px] font-semibold ${
                    isActive ? 'text-brand-700' : 'text-ink-400'
                  }`
                }
              >
                <span className="text-lg leading-none" aria-hidden>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
