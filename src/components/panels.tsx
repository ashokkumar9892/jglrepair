import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Estimate, Message, MessageAuthor, Photo, ServiceRequest, Technician } from '../types'
import { currencyExact, formatTimestamp, friendlyDay, timeAgo } from '../lib/format'
import { fileToCompressedDataUrl } from '../lib/image'
import { Empty, MockTag, StatusBadge, TechAvatar, UrgencyBadge } from './ui'

/* ---------------------------------------------------------------- */
/* Photos                                                            */
/* ---------------------------------------------------------------- */

export function PhotoUploader({
  photos,
  by,
  onAdd,
  onRemove,
  max = 6,
  label = 'Add photos',
  hint = 'Photos help the technician bring the right part. Optional.',
}: {
  photos: Photo[]
  by: Photo['by']
  onAdd: (photo: { dataUrl: string; caption: string; by: Photo['by'] }) => void
  onRemove?: (id: string) => void
  max?: number
  label?: string
  hint?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return
    setBusy(true)
    setError(null)
    try {
      const room = max - photos.length
      for (const file of Array.from(files).slice(0, Math.max(room, 0))) {
        const dataUrl = await fileToCompressedDataUrl(file)
        onAdd({ dataUrl, caption: file.name.replace(/\.[^.]+$/, '').slice(0, 40), by })
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed.')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const full = photos.length >= max

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {photos.map((p) => (
          <div key={p.id} className="relative">
            <img
              src={p.dataUrl}
              alt={p.caption || 'Uploaded photo'}
              className="h-24 w-24 rounded-xl object-cover border border-ink-200"
            />
            <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1 text-[9px] font-semibold text-white">
              {p.by}
            </span>
            {onRemove && (
              <button
                onClick={() => onRemove(p.id)}
                className="absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full bg-white text-ink-600 shadow border border-ink-200"
                aria-label="Remove photo"
              >
                ×
              </button>
            )}
          </div>
        ))}
        {!full && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="grid h-24 w-24 place-items-center rounded-xl border-2 border-dashed border-ink-300 bg-white text-ink-500 hover:border-brand-400 hover:text-brand-600"
          >
            <span className="text-center text-[11px] font-semibold leading-tight">
              <span className="block text-xl">{busy ? '⏳' : '📷'}</span>
              {busy ? 'Adding…' : label}
            </span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p className="mt-2 text-xs text-ink-500">
        {error ? <span className="text-red-600">{error}</span> : hint}{' '}
        <span className="text-ink-400">
          ({photos.length}/{max})
        </span>
      </p>
    </div>
  )
}

export function PhotoStrip({ photos }: { photos: Photo[] }) {
  const [open, setOpen] = useState<Photo | null>(null)
  if (!photos.length) return <p className="text-sm text-ink-500">No photos yet.</p>
  return (
    <>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 no-scrollbar">
        {photos.map((p) => (
          <button key={p.id} onClick={() => setOpen(p)} className="shrink-0">
            <img
              src={p.dataUrl}
              alt={p.caption || 'Service photo'}
              className="h-24 w-24 rounded-xl border border-ink-200 object-cover"
            />
          </button>
        ))}
      </div>
      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4"
          onClick={() => setOpen(null)}
          role="dialog"
        >
          <div className="max-h-full w-full max-w-lg overflow-auto">
            <img src={open.dataUrl} alt={open.caption} className="w-full rounded-2xl" />
            <p className="mt-2 text-center text-xs text-white/80">
              {open.caption || 'Photo'} · {open.by} · {formatTimestamp(open.at)}
            </p>
            <button className="btn-ghost mt-3 w-full" onClick={() => setOpen(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}

/* ---------------------------------------------------------------- */
/* Messages                                                          */
/* ---------------------------------------------------------------- */

export function MessageThread({
  messages,
  me,
  onSend,
  quickReplies = [],
  placeholder = 'Write a message…',
}: {
  messages: Message[]
  me: MessageAuthor
  onSend: (body: string) => void
  quickReplies?: string[]
  placeholder?: string
}) {
  const [draft, setDraft] = useState('')
  const send = (body: string) => {
    const text = body.trim()
    if (!text) return
    onSend(text)
    setDraft('')
  }
  return (
    <div>
      <div className="space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-ink-500">No messages yet. Start the conversation below.</p>
        )}
        {messages.map((m) => {
          const mine = m.author === me
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] ${mine ? 'text-right' : ''}`}>
                <div
                  className={`rounded-2xl px-3.5 py-2.5 text-sm ${
                    mine
                      ? 'bg-brand-700 text-white rounded-br-sm'
                      : 'bg-ink-100 text-ink-900 rounded-bl-sm'
                  }`}
                >
                  {m.body}
                </div>
                <p className="mt-1 text-[11px] text-ink-400">
                  {m.authorName} · {timeAgo(m.at)}
                  {m.smsMock && <span className="ml-1 text-ink-300">· SMS (mock)</span>}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {quickReplies.length > 0 && (
        <div className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 no-scrollbar">
          {quickReplies.map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              className="shrink-0 rounded-full border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-600 hover:border-brand-400"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          send(draft)
        }}
      >
        <input
          className="field flex-1"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
        />
        <button type="submit" className="btn-primary px-4" disabled={!draft.trim()}>
          Send
        </button>
      </form>
      <p className="mt-1.5 text-[11px] text-ink-400">
        Messages stay in this browser. No real SMS or email is sent.
      </p>
    </div>
  )
}

/* ---------------------------------------------------------------- */
/* Estimate                                                          */
/* ---------------------------------------------------------------- */

export function EstimateCard({
  estimate,
  onApprove,
  onDecline,
  onAsk,
}: {
  estimate: Estimate
  onApprove?: () => void
  onDecline?: () => void
  onAsk?: () => void
}) {
  const decided = estimate.status === 'Approved' || estimate.status === 'Declined'
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-ink-100 px-4 py-3">
        <div>
          <p className="text-sm font-bold text-ink-900">Repair estimate</p>
          <p className="text-xs text-ink-500">Prepared {formatTimestamp(estimate.createdAt)}</p>
        </div>
        <span
          className={`chip ${
            estimate.status === 'Approved'
              ? 'bg-emerald-100 text-emerald-800'
              : estimate.status === 'Declined'
                ? 'bg-red-100 text-red-700'
                : 'bg-amber-100 text-amber-900'
          }`}
        >
          {estimate.status}
        </span>
      </div>

      <dl className="divide-y divide-ink-100">
        {estimate.lines.map((l) => (
          <div key={l.id} className="flex items-baseline justify-between gap-4 px-4 py-3">
            <dt className="text-sm text-ink-700">{l.label}</dt>
            <dd className="text-sm font-semibold tabular-nums text-ink-900">
              {currencyExact(l.amount)}
            </dd>
          </div>
        ))}
        <div className="flex items-baseline justify-between gap-4 bg-ink-50 px-4 py-3.5">
          <dt className="text-sm font-bold uppercase tracking-wide text-ink-700">Total</dt>
          <dd className="text-xl font-extrabold tabular-nums text-ink-900">
            {currencyExact(estimate.total)}
          </dd>
        </div>
      </dl>

      {estimate.note && <p className="px-4 py-3 text-xs text-ink-500">{estimate.note}</p>}

      {(onApprove || onDecline || onAsk) && !decided && (
        <div className="grid gap-2 border-t border-ink-100 p-3 sm:grid-cols-3">
          {onApprove && (
            <button className="btn-primary sm:col-span-1" onClick={onApprove}>
              ✓ Approve
            </button>
          )}
          {onAsk && (
            <button className="btn-ghost" onClick={onAsk}>
              Ask a question
            </button>
          )}
          {onDecline && (
            <button className="btn-danger" onClick={onDecline}>
              Decline
            </button>
          )}
        </div>
      )}

      {decided && (
        <div className="border-t border-ink-100 px-4 py-3 text-xs text-ink-500">
          {estimate.status} {estimate.decidedAt ? `on ${formatTimestamp(estimate.decidedAt)}` : ''} ·{' '}
          <MockTag>Payment mocked</MockTag>
        </div>
      )}
    </div>
  )
}

/* ---------------------------------------------------------------- */
/* Job cards                                                         */
/* ---------------------------------------------------------------- */

export function JobCard({
  request,
  to,
  applianceName,
  customerName,
  address,
  tech,
  when,
  footer,
}: {
  request: ServiceRequest
  to: string
  applianceName: string
  customerName?: string
  address?: string
  tech?: Technician
  when?: string
  footer?: React.ReactNode
}) {
  return (
    <Link to={to} className="card block p-4 transition hover:shadow-md active:scale-[.995]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-extrabold text-ink-900">#{request.id}</span>
            <UrgencyBadge urgency={request.urgency} />
          </div>
          <p className="mt-0.5 truncate text-base font-semibold text-ink-900">{applianceName}</p>
          <p className="truncate text-sm text-ink-600">{request.problem}</p>
          {customerName && (
            <p className="mt-1 truncate text-xs text-ink-500">
              {customerName}
              {address ? ` · ${address}` : ''}
            </p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <StatusBadge status={request.status} />
          {when && <p className="mt-1.5 text-xs font-medium text-ink-600">{when}</p>}
          {tech && (
            <div className="mt-2 flex justify-end">
              <TechAvatar tech={tech} size="sm" />
            </div>
          )}
        </div>
      </div>
      {footer && <div className="mt-3 border-t border-ink-100 pt-3">{footer}</div>}
    </Link>
  )
}

export function AppointmentLine({
  date,
  window,
  label = 'Appointment',
}: {
  date: string
  window: string
  label?: string
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-lg">
        📅
      </span>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">{label}</p>
        <p className="text-sm font-semibold text-ink-900">
          {friendlyDay(date)} · {window}
        </p>
      </div>
    </div>
  )
}

export function EmptyJobs({ what = 'jobs' }: { what?: string }) {
  return <Empty icon="✅" title={`No ${what} right now`} body="Nothing needs attention here." />
}
