import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AppShell } from '../../components/AppShell'
import { ADMIN_NAV } from '../../components/navs'
import { EstimateCard, MessageThread, PhotoStrip } from '../../components/panels'
import {
  DemoNotice,
  Empty,
  Field,
  MockTag,
  SectionTitle,
  StatusBadge,
  TechAvatar,
  Timeline,
  UrgencyBadge,
} from '../../components/ui'
import { usePortal } from '../../store/PortalContext'
import { getAppliance, getCustomer, getRequest, getTechnician } from '../../store/selectors'
import { TIME_WINDOWS } from '../../data/catalog'
import { JOB_STATUSES, type JobStatus } from '../../types'
import { currencyExact, friendlyDay, formatTimestamp } from '../../lib/format'

export default function AdminJobDetail() {
  const { id = '' } = useParams()
  const { state, assignTechnician, scheduleVisit, scheduleRepair, setStatus, addMessage, markPartsOrdered } =
    usePortal()
  const request = getRequest(state, id)
  const [toast, setToast] = useState<string | null>(null)
  const [visitDate, setVisitDate] = useState(request?.appointment.date ?? '')
  const [visitWindow, setVisitWindow] = useState(request?.appointment.window ?? TIME_WINDOWS[0])

  if (!request) {
    return (
      <AppShell role="admin" title="Job not found" nav={ADMIN_NAV} back={{ to: '/admin/jobs', label: 'Back' }}>
        <Empty icon="🔎" title={`No job ${id}`} />
      </AppShell>
    )
  }

  const customer = getCustomer(state, request.customerId)!
  const appliance = getAppliance(state, request.applianceId)
  const tech = getTechnician(state, request.technicianId)
  const flash = (m: string) => {
    setToast(m)
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <AppShell
      role="admin"
      title={`#${request.id}`}
      subtitle={`${customer.name} · ${appliance ? `${appliance.brand} ${appliance.type}` : ''}`}
      nav={ADMIN_NAV}
      back={{ to: '/admin/jobs', label: 'Back to all jobs' }}
    >
      {toast && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-900">
          ✅ {toast}
        </div>
      )}

      <section className="card p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-lg font-extrabold text-ink-900">{customer.name}</p>
            <p className="text-sm text-ink-600">
              {customer.address}, {customer.city}, {customer.state} {customer.zip}
            </p>
            <p className="mt-1 text-xs text-ink-500">
              {customer.phone} · {customer.email} · customer since{' '}
              {new Date(customer.since).getFullYear()}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <StatusBadge status={request.status} />
            <div className="mt-1.5">
              <UrgencyBadge urgency={request.urgency} />
            </div>
          </div>
        </div>

        <dl className="mt-4 grid gap-2 rounded-xl bg-ink-50 p-3 text-sm">
          <div className="flex gap-3">
            <dt className="w-24 shrink-0 text-ink-500">Appliance</dt>
            <dd className="font-semibold text-ink-900">
              {appliance ? `${appliance.brand} ${appliance.type}` : '—'}
            </dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-24 shrink-0 text-ink-500">Problem</dt>
            <dd className="text-ink-800">{request.problem}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-24 shrink-0 text-ink-500">Details</dt>
            <dd className="text-ink-700">{request.problemDetail}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-24 shrink-0 text-ink-500">Opened</dt>
            <dd className="text-ink-700">{formatTimestamp(request.createdAt)}</dd>
          </div>
        </dl>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <Link to={`/tech/job/${request.id}`} className="btn-ghost">
            🔧 Open in technician view
          </Link>
          <Link to={`/customer/request/${request.id}`} className="btn-ghost">
            🏠 Open in customer view
          </Link>
        </div>
      </section>

      <section className="card mt-4 p-4">
        <SectionTitle>Dispatch controls</SectionTitle>

        <div className="mb-4 flex items-center gap-3 rounded-xl bg-ink-50 px-3 py-2.5">
          <TechAvatar tech={tech} />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">
              Assigned technician
            </p>
            <p className="truncate text-sm font-semibold text-ink-900">
              {tech ? `${tech.name} · ${tech.title}` : 'Unassigned'}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Field label="Assign / reassign technician">
            <select
              className="field"
              value={request.technicianId ?? ''}
              onChange={(e) => {
                if (!e.target.value) return
                assignTechnician(request.id, e.target.value)
                flash('Technician assigned. Customer notified (mock SMS).')
              }}
            >
              <option value="">Choose a technician…</option>
              {state.technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} — {t.specialties.join(', ')}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-2">
            <Field label="Visit date">
              <input
                type="date"
                className="field"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
              />
            </Field>
            <Field label="Window">
              <select
                className="field"
                value={visitWindow}
                onChange={(e) => setVisitWindow(e.target.value)}
              >
                {TIME_WINDOWS.map((w) => (
                  <option key={w}>{w}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              className="btn-ghost"
              onClick={() => {
                scheduleVisit(request.id, visitDate, visitWindow)
                flash('Diagnostic visit rescheduled.')
              }}
            >
              Set diagnostic visit
            </button>
            <button
              className="btn-ghost"
              onClick={() => {
                scheduleRepair(request.id, visitDate, visitWindow)
                flash('Repair visit scheduled.')
              }}
            >
              Set repair visit
            </button>
          </div>

          {request.parts.some((p) => p.status === 'Needed') && (
            <button
              className="btn-accent w-full"
              onClick={() => {
                markPartsOrdered(request.id, visitDate)
                flash('Parts marked ordered (mock supplier).')
              }}
            >
              📦 Order parts (ETA {friendlyDay(visitDate)})
            </button>
          )}

          <Field label="Override status" hint="Admin escape hatch for the demo.">
            <select
              className="field"
              value={request.status}
              onChange={(e) => {
                setStatus(request.id, e.target.value as JobStatus, 'JGL Dispatch')
                flash(`Status set to ${e.target.value}.`)
              }}
            >
              {JOB_STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      {request.diagnosis && (
        <section className="card mt-4 p-4">
          <SectionTitle>Diagnosis</SectionTitle>
          <p className="text-sm leading-relaxed text-ink-700">{request.diagnosis}</p>
        </section>
      )}

      {request.parts.length > 0 && (
        <section className="card mt-4 p-4">
          <SectionTitle>Parts</SectionTitle>
          <ul className="divide-y divide-ink-100">
            {request.parts.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span className="min-w-0">
                  <span className="block truncate font-medium text-ink-900">{p.name}</span>
                  <span className="block truncate text-xs text-ink-500">
                    #{p.partNumber} · {currencyExact(p.price)} · {p.supplier}
                    {p.eta ? ` · ETA ${friendlyDay(p.eta)}` : ''}
                  </span>
                </span>
                <span className="chip shrink-0 bg-ink-100 text-ink-600">{p.status}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {request.estimate && (
        <section className="mt-4">
          <SectionTitle>Estimate</SectionTitle>
          <EstimateCard estimate={request.estimate} />
        </section>
      )}

      {request.payment && (
        <section className="card mt-4 p-4">
          <SectionTitle>Invoice</SectionTitle>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-ink-900">{request.payment.status}</p>
              <p className="text-xs text-ink-500">
                {request.payment.method} · {formatTimestamp(request.payment.at)}
              </p>
            </div>
            <p className="text-lg font-extrabold text-ink-900">
              {currencyExact(request.payment.amount)}
            </p>
          </div>
          <p className="mt-2 text-[11px] text-ink-400">
            <MockTag>Payments mocked</MockTag> No processor is connected.
          </p>
        </section>
      )}

      <section className="card mt-4 p-4">
        <SectionTitle>Photos</SectionTitle>
        <PhotoStrip photos={request.photos} />
      </section>

      <section className="card mt-4 p-4">
        <SectionTitle>Customer messages</SectionTitle>
        <MessageThread
          messages={request.messages}
          me="Dispatch"
          onSend={(body) => addMessage(request.id, 'Dispatch', 'JGL Dispatch', body)}
          quickReplies={[
            'Your technician is on the way.',
            'We can move you to an earlier window today.',
            'Your part arrived - can we come out tomorrow?',
          ]}
        />
      </section>

      <section className="card mt-4 p-4">
        <SectionTitle>Job activity</SectionTitle>
        <Timeline events={request.timeline} />
      </section>

      <div className="mt-6">
        <DemoNotice tone="inline" />
      </div>
    </AppShell>
  )
}
