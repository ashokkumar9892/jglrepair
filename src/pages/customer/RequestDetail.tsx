import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AppShell } from '../../components/AppShell'
import { CUSTOMER_NAV } from '../../components/navs'
import {
  AppointmentLine,
  EstimateCard,
  MessageThread,
  PhotoStrip,
  PhotoUploader,
} from '../../components/panels'
import {
  DemoNotice,
  Empty,
  MockTag,
  SectionTitle,
  StatusBadge,
  StatusTracker,
  TechAvatar,
  Timeline,
  UrgencyBadge,
} from '../../components/ui'
import { usePortal } from '../../store/PortalContext'
import { getAppliance, getCustomer, getRequest, getTechnician } from '../../store/selectors'
import { currencyExact, formatTimestamp } from '../../lib/format'

const TABS = ['Overview', 'Estimate', 'Messages', 'Activity'] as const
type Tab = (typeof TABS)[number]

export default function RequestDetail() {
  const { id = '' } = useParams()
  const { state, decideEstimate, addMessage, addPhoto, removePhoto } = usePortal()
  const [tab, setTab] = useState<Tab>('Overview')
  const [banner, setBanner] = useState<string | null>(null)

  const request = getRequest(state, id)
  const customer = request ? getCustomer(state, request.customerId) : undefined

  if (!request || !customer) {
    return (
      <AppShell role="customer" title="Request not found" nav={CUSTOMER_NAV} back={{ to: '/customer', label: 'Back' }}>
        <Empty icon="🔎" title={`No request ${id}`} body="It may have been reset with the demo data." />
        <Link to="/customer" className="btn-primary mt-4 w-full">
          Back to my service
        </Link>
      </AppShell>
    )
  }

  const appliance = getAppliance(state, request.applianceId)
  const tech = getTechnician(state, request.technicianId)
  const estimate = request.estimate

  const approve = () => {
    decideEstimate(request.id, 'Approved')
    setBanner('Estimate approved. Dispatch will order the part and schedule your repair.')
    setTab('Overview')
  }
  const decline = () => {
    decideEstimate(request.id, 'Declined')
    setBanner('Estimate declined. Only the diagnostic fee applies.')
  }
  const ask = () => {
    setTab('Messages')
    addMessage(
      request.id,
      'Customer',
      customer.name,
      'I have a question about the estimate - can you explain the part cost?',
    )
  }

  return (
    <AppShell
      role="customer"
      title={`Request #${request.id}`}
      subtitle={appliance ? `${appliance.brand} ${appliance.type} · ${request.problem}` : request.problem}
      nav={CUSTOMER_NAV}
      back={{ to: '/customer', label: 'Back to my service' }}
    >
      {banner && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-900">
          <span>✅</span>
          <span className="flex-1">{banner}</span>
          <button onClick={() => setBanner(null)} className="text-xs font-semibold">
            ✕
          </button>
        </div>
      )}

      <div className="card p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <StatusBadge status={request.status} />
          <UrgencyBadge urgency={request.urgency} />
          {estimate?.status === 'Sent' && (
            <span className="chip bg-amber-100 text-amber-900">Action needed</span>
          )}
        </div>
        <StatusTracker status={request.status} />
      </div>

      <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 no-scrollbar">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
              tab === t ? 'bg-brand-700 text-white' : 'bg-white text-ink-600 border border-ink-200'
            }`}
          >
            {t}
            {t === 'Estimate' && estimate?.status === 'Sent' && (
              <span className="ml-1.5 inline-block h-2 w-2 rounded-full bg-amber-500 align-middle" />
            )}
            {t === 'Messages' && request.messages.length > 0 && (
              <span className="ml-1.5 text-xs opacity-70">{request.messages.length}</span>
            )}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div className="mt-4 space-y-4">
          <section className="card space-y-4 p-4">
            <AppointmentLine
              date={request.appointment.date}
              window={request.appointment.window}
              label="Diagnostic visit"
            />
            {request.repairAppointment && (
              <AppointmentLine
                date={request.repairAppointment.date}
                window={request.repairAppointment.window}
                label="Repair visit"
              />
            )}
            <div className="flex items-center gap-3 border-t border-ink-100 pt-4">
              <TechAvatar tech={tech} />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                  Technician
                </p>
                <p className="text-sm font-semibold text-ink-900">
                  {tech ? tech.name : 'Assignment pending'}
                </p>
                {tech && (
                  <p className="text-xs text-ink-500">
                    {tech.title} · ★ {tech.rating} · {tech.jobsCompleted.toLocaleString()} jobs
                  </p>
                )}
              </div>
              {tech && (
                <a href={`tel:${tech.phone.replace(/\D/g, '')}`} className="btn-ghost btn-sm">
                  📞 Call
                </a>
              )}
            </div>
            {tech && (
              <p className="text-[11px] text-ink-400">
                Live technician location is <MockTag>GPS mocked</MockTag> in this concept.
              </p>
            )}
          </section>

          <section className="card p-4">
            <SectionTitle>Appliance & problem</SectionTitle>
            <dl className="space-y-2 text-sm">
              <div className="flex gap-3">
                <dt className="w-24 shrink-0 text-ink-500">Appliance</dt>
                <dd className="font-medium text-ink-900">
                  {appliance ? `${appliance.brand} ${appliance.type}` : '—'}
                  {appliance?.model && appliance.model !== 'Not provided' && (
                    <span className="block text-xs font-normal text-ink-500">
                      Model {appliance.model} · {appliance.location}
                    </span>
                  )}
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-24 shrink-0 text-ink-500">Problem</dt>
                <dd className="font-medium text-ink-900">{request.problem}</dd>
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
          </section>

          {request.diagnosis && (
            <section className="card p-4">
              <SectionTitle>Technician diagnosis</SectionTitle>
              <p className="text-sm leading-relaxed text-ink-700">{request.diagnosis}</p>
            </section>
          )}

          {request.parts.length > 0 && (
            <section className="card p-4">
              <SectionTitle>Parts</SectionTitle>
              <ul className="space-y-2">
                {request.parts.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 text-sm">
                    <span>
                      <span className="font-medium text-ink-900">{p.name}</span>
                      <span className="block text-xs text-ink-500">
                        #{p.partNumber}
                        {p.eta ? ` · ETA ${p.eta}` : ''}
                      </span>
                    </span>
                    <span className="chip bg-ink-100 text-ink-600">{p.status}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="card p-4">
            <SectionTitle>Photos</SectionTitle>
            <PhotoStrip photos={request.photos} />
            <div className="mt-4 border-t border-ink-100 pt-4">
              <PhotoUploader
                photos={request.photos.filter((p) => p.by === 'Customer')}
                by="Customer"
                label="Add photo"
                hint="Add another photo for your technician."
                onAdd={(p) => addPhoto(request.id, p)}
                onRemove={(pid) => removePhoto(request.id, pid)}
              />
            </div>
          </section>

          {request.payment && (
            <section className="card p-4">
              <SectionTitle>Payment</SectionTitle>
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
                No real payment processor is connected. <MockTag>Payments mocked</MockTag>
              </p>
            </section>
          )}
        </div>
      )}

      {tab === 'Estimate' && (
        <div className="mt-4 space-y-4">
          {estimate ? (
            <>
              <EstimateCard
                estimate={estimate}
                onApprove={estimate.status === 'Sent' ? approve : undefined}
                onDecline={estimate.status === 'Sent' ? decline : undefined}
                onAsk={estimate.status === 'Sent' ? ask : undefined}
              />
              <p className="text-xs text-ink-500">
                Approving authorizes the repair and orders the part. Declining closes the ticket with
                the diagnostic fee only. Both actions are simulated here.
              </p>
            </>
          ) : (
            <Empty
              icon="🧾"
              title="No estimate yet"
              body="Your technician builds the estimate after the diagnosis. You will get a text when it is ready."
            />
          )}
        </div>
      )}

      {tab === 'Messages' && (
        <section className="card mt-4 p-4">
          <SectionTitle>Messages</SectionTitle>
          <MessageThread
            messages={request.messages}
            me="Customer"
            onSend={(body) => addMessage(request.id, 'Customer', customer.name, body)}
            quickReplies={[
              'What time will the tech arrive?',
              'Can I reschedule?',
              'Is the diagnostic fee applied to the repair?',
            ]}
          />
        </section>
      )}

      {tab === 'Activity' && (
        <section className="card mt-4 p-4">
          <SectionTitle>Service activity</SectionTitle>
          <Timeline events={request.timeline} />
        </section>
      )}

      <div className="mt-6">
        <DemoNotice tone="inline" />
      </div>
    </AppShell>
  )
}
