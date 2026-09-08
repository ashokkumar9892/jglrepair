import type { ReactNode } from 'react'
import type { JobStatus, ServiceRequest, Technician } from '../types'
import { JOB_STATUSES } from '../types'
import { statusIndex } from '../store/selectors'
import { formatTimestamp, timeAgo } from '../lib/format'

/* ---------------------------------------------------------------- */
/* Demo disclaimer                                                    */
/* ---------------------------------------------------------------- */

export function DemoNotice({ tone = 'bar' }: { tone?: 'bar' | 'inline' }) {
  if (tone === 'inline') {
    return (
      <p className="text-[11px] leading-relaxed text-ink-500">
        <span className="font-semibold text-ink-600">Unofficial demonstration concept.</span> Not
        affiliated with, endorsed by, or connected to any real business. Sample data only.
      </p>
    )
  }
  return (
    <div className="bg-ink-900 text-white text-[11px] leading-tight px-4 py-1.5 text-center">
      <span className="font-semibold">Unofficial demonstration concept</span>
      <span className="hidden sm:inline"> — sample data, mocked payments / SMS / GPS</span>
    </div>
  )
}

/* ---------------------------------------------------------------- */
/* Status                                                            */
/* ---------------------------------------------------------------- */

const STATUS_TONE: Record<JobStatus, string> = {
  Requested: 'bg-ink-100 text-ink-700',
  Scheduled: 'bg-sky-100 text-sky-800',
  'Technician Assigned': 'bg-indigo-100 text-indigo-800',
  Diagnosed: 'bg-violet-100 text-violet-800',
  'Estimate Ready': 'bg-amber-100 text-amber-900',
  Approved: 'bg-emerald-100 text-emerald-800',
  'Part Ordered': 'bg-flame-100 text-flame-700',
  'Repair Scheduled': 'bg-brand-100 text-brand-800',
  Completed: 'bg-emerald-600 text-white',
}

export function StatusBadge({ status, className = '' }: { status: JobStatus; className?: string }) {
  return <span className={`chip ${STATUS_TONE[status]} ${className}`}>{status}</span>
}

export function UrgencyBadge({ urgency }: { urgency: ServiceRequest['urgency'] }) {
  if (urgency !== 'emergency') return null
  return <span className="chip bg-red-100 text-red-700">⚡ Emergency</span>
}

export function StatusTracker({ status }: { status: JobStatus }) {
  const current = statusIndex(status)
  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <p className="text-sm font-semibold text-ink-900">{status}</p>
        <p className="text-xs text-ink-500">
          Step {current + 1} of {JOB_STATUSES.length}
        </p>
      </div>
      <div className="flex gap-1 mb-4">
        {JOB_STATUSES.map((s, i) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full ${i <= current ? 'bg-brand-600' : 'bg-ink-200'}`}
            title={s}
          />
        ))}
      </div>
      <ol className="space-y-0">
        {JOB_STATUSES.map((s, i) => {
          const done = i < current
          const active = i === current
          return (
            <li key={s} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={`grid h-6 w-6 place-items-center rounded-full text-[11px] font-bold ${
                    done
                      ? 'bg-brand-600 text-white'
                      : active
                        ? 'bg-flame-500 text-white ring-4 ring-flame-100'
                        : 'bg-ink-100 text-ink-400'
                  }`}
                >
                  {done ? '✓' : i + 1}
                </span>
                {i < JOB_STATUSES.length - 1 && (
                  <span className={`w-0.5 flex-1 ${done ? 'bg-brand-500' : 'bg-ink-200'}`} />
                )}
              </div>
              <p
                className={`pb-3 text-sm ${
                  active ? 'font-semibold text-ink-900' : done ? 'text-ink-600' : 'text-ink-400'
                }`}
              >
                {s}
              </p>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

/* ---------------------------------------------------------------- */
/* Small building blocks                                             */
/* ---------------------------------------------------------------- */

export function SectionTitle({
  children,
  action,
}: {
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="mb-2.5 flex items-center justify-between gap-3">
      <h2 className="text-sm font-bold uppercase tracking-wide text-ink-500">{children}</h2>
      {action}
    </div>
  )
}

export function Stat({
  label,
  value,
  hint,
  tone = 'default',
  onClick,
}: {
  label: string
  value: ReactNode
  hint?: string
  tone?: 'default' | 'alert' | 'good' | 'warn'
  onClick?: () => void
}) {
  const tones = {
    default: 'border-ink-100',
    alert: 'border-red-200 bg-red-50/60',
    good: 'border-emerald-200 bg-emerald-50/60',
    warn: 'border-amber-200 bg-amber-50/60',
  }
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      onClick={onClick}
      className={`card ${tones[tone]} p-4 text-left w-full ${onClick ? 'hover:shadow-md transition' : ''}`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-ink-900 leading-tight">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-ink-500">{hint}</p>}
    </Tag>
  )
}

export function TechAvatar({
  tech,
  size = 'md',
}: {
  tech?: Technician
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizes = { sm: 'h-8 w-8 text-[11px]', md: 'h-11 w-11 text-sm', lg: 'h-14 w-14 text-base' }
  if (!tech) {
    return (
      <span
        className={`${sizes[size]} grid place-items-center rounded-full bg-ink-100 text-ink-400 font-bold border border-ink-200`}
      >
        ?
      </span>
    )
  }
  return (
    <span
      className={`${sizes[size]} grid place-items-center rounded-full font-bold border ${tech.tint}`}
    >
      {tech.initials}
    </span>
  )
}

export function Empty({ icon = '📭', title, body }: { icon?: string; title: string; body?: string }) {
  return (
    <div className="card p-8 text-center">
      <div className="text-3xl">{icon}</div>
      <p className="mt-2 font-semibold text-ink-800">{title}</p>
      {body && <p className="mt-1 text-sm text-ink-500">{body}</p>}
    </div>
  )
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-500">{hint}</span>}
    </label>
  )
}

export function MockTag({ children }: { children: ReactNode }) {
  return (
    <span className="chip bg-ink-100 text-ink-500 border border-dashed border-ink-300">
      {children}
    </span>
  )
}

/* ---------------------------------------------------------------- */
/* Timeline                                                          */
/* ---------------------------------------------------------------- */

export function Timeline({ events }: { events: ServiceRequest['timeline'] }) {
  const ordered = [...events].sort((a, b) => (a.at < b.at ? 1 : -1))
  if (!ordered.length) return <Empty icon="🕓" title="No activity yet" />
  return (
    <ol className="space-y-4">
      {ordered.map((e) => (
        <li key={e.id} className="flex gap-3">
          <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500 ring-4 ring-brand-100" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink-900">{e.label}</p>
            {e.detail && <p className="text-sm text-ink-600">{e.detail}</p>}
            <p className="mt-0.5 text-xs text-ink-400">
              {formatTimestamp(e.at)} · {e.by} · {timeAgo(e.at)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}
