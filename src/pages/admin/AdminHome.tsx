import { Link } from 'react-router-dom'
import { AppShell } from '../../components/AppShell'
import { ADMIN_NAV } from '../../components/navs'
import {
  DemoNotice,
  Empty,
  MockTag,
  SectionTitle,
  Stat,
  StatusBadge,
  TechAvatar,
  UrgencyBadge,
} from '../../components/ui'
import { usePortal } from '../../store/PortalContext'
import {
  adminMetrics,
  applianceLabel,
  boardWindow,
  getCustomer,
  getTechnician,
  jobsOnDay,
} from '../../store/selectors'
import { currency, currencyExact, friendlyDay, todayISO } from '../../lib/format'
import type { ServiceRequest } from '../../types'

function JobLine({ r }: { r: ServiceRequest }) {
  const { state } = usePortal()
  const c = getCustomer(state, r.customerId)
  const tech = getTechnician(state, r.technicianId)
  return (
    <Link
      to={`/admin/jobs/${r.id}`}
      className="flex items-center gap-3 border-b border-ink-100 px-4 py-3 last:border-0 hover:bg-ink-50"
    >
      <TechAvatar tech={tech} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-ink-900">{c?.name}</p>
          <UrgencyBadge urgency={r.urgency} />
        </div>
        <p className="truncate text-xs text-ink-500">
          #{r.id} · {applianceLabel(state, r)} · {r.problem}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <StatusBadge status={r.status} />
        <p className="mt-1 text-[11px] text-ink-400">
          {friendlyDay(r.repairAppointment?.date ?? r.appointment.date)} · {boardWindow(r)}
        </p>
      </div>
    </Link>
  )
}

function Bucket({
  title,
  items,
  empty,
  tone = '',
}: {
  title: string
  items: ServiceRequest[]
  empty: string
  tone?: string
}) {
  return (
    <section className={`card overflow-hidden ${tone}`}>
      <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-600">{title}</h2>
        <span className="chip bg-ink-100 text-ink-600">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-ink-400">{empty}</p>
      ) : (
        <div>
          {items.map((r) => (
            <JobLine key={r.id} r={r} />
          ))}
        </div>
      )}
    </section>
  )
}

export default function AdminHome() {
  const { state } = usePortal()
  const m = adminMetrics(state)
  const day = todayISO()

  return (
    <AppShell
      role="admin"
      title="Shop dashboard"
      subtitle={`${friendlyDay(day)} · ${m.today.length} jobs on the board`}
      nav={ADMIN_NAV}
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Stat label="Today's jobs" value={m.today.length} hint={`${m.completedToday.length} completed`} />
        <Stat
          label="Emergency requests"
          value={m.emergencies.length}
          hint={m.emergencies.length ? 'Needs same-day dispatch' : 'All clear'}
          tone={m.emergencies.length ? 'alert' : 'default'}
        />
        <Stat
          label="Awaiting approval"
          value={m.awaitingApproval.length}
          hint={currency(m.awaitingApproval.reduce((s, r) => s + (r.estimate?.total ?? 0), 0))}
          tone={m.awaitingApproval.length ? 'warn' : 'default'}
        />
        <Stat label="Parts ordered" value={m.partsOrdered.length} hint="Awaiting delivery" />
        <Stat label="Completed jobs" value={m.completedAll.length} hint={`${m.completedToday.length} today`} tone="good" />
        <Stat
          label="Revenue (month)"
          value={currency(m.revenueMonth)}
          hint={`All time ${currency(m.revenueAll)} · avg ticket ${currency(m.avgTicket)}`}
          tone="good"
        />
      </div>

      {m.unassigned.length > 0 && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <span className="text-lg">⚠️</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-900">
              {m.unassigned.length} job{m.unassigned.length > 1 ? 's' : ''} without a technician
            </p>
            <p className="text-xs text-red-800">
              Assign from the dispatch board before the arrival window opens.
            </p>
          </div>
          <Link to="/admin/dispatch" className="btn-danger btn-sm shrink-0">
            Dispatch
          </Link>
        </div>
      )}

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <Bucket
          title="Today's jobs"
          items={jobsOnDay(state, day)}
          empty="Nothing scheduled today."
        />
        <Bucket
          title="Emergency queue"
          items={m.emergencies}
          empty="No emergencies open."
          tone="ring-1 ring-red-100"
        />
        <Bucket
          title="Awaiting customer approval"
          items={m.awaitingApproval}
          empty="No estimates pending."
        />
        <Bucket title="Parts on order" items={m.partsOrdered} empty="No parts on order." />
      </div>

      <section className="card mt-5 p-4">
        <SectionTitle>Technician workload today</SectionTitle>
        <ul className="space-y-3">
          {state.technicians.map((t) => {
            const jobs = jobsOnDay(state, day, t.id)
            const done = jobs.filter((j) => j.status === 'Completed').length
            const pct = jobs.length ? Math.round((done / jobs.length) * 100) : 0
            return (
              <li key={t.id} className="flex items-center gap-3">
                <TechAvatar tech={t} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-ink-900">{t.name}</p>
                    <p className="shrink-0 text-xs text-ink-500">
                      {done}/{jobs.length} done
                    </p>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-ink-100">
                    <div
                      className="h-2 rounded-full bg-brand-600 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-1 truncate text-[11px] text-ink-400">
                    {t.specialties.join(' · ')} · ★ {t.rating}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="card mt-5 overflow-hidden">
        <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink-600">
            Completed jobs & revenue
          </h2>
          <span className="text-sm font-extrabold text-emerald-700">
            {currencyExact(m.revenueAll)}
          </span>
        </div>
        {m.completedAll.length === 0 ? (
          <Empty title="No completed jobs yet" />
        ) : (
          m.completedAll
            .slice()
            .sort((a, b) => ((a.completedAt ?? '') < (b.completedAt ?? '') ? 1 : -1))
            .slice(0, 6)
            .map((r) => (
              <Link
                key={r.id}
                to={`/admin/jobs/${r.id}`}
                className="flex items-center gap-3 border-b border-ink-100 px-4 py-3 last:border-0 hover:bg-ink-50"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-base">
                  ✅
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink-900">
                    {getCustomer(state, r.customerId)?.name} · {applianceLabel(state, r)}
                  </p>
                  <p className="truncate text-xs text-ink-500">
                    #{r.id} · {r.completedAt ? friendlyDay(r.completedAt.slice(0, 10)) : ''}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-bold tabular-nums text-ink-800">
                  {r.payment ? currencyExact(r.payment.amount) : '—'}
                </span>
              </Link>
            ))
        )}
        <p className="px-4 py-3 text-[11px] text-ink-400">
          Revenue is derived from completed estimates. <MockTag>Payments mocked</MockTag>
        </p>
      </section>

      <div className="mt-6">
        <DemoNotice tone="inline" />
      </div>
    </AppShell>
  )
}
