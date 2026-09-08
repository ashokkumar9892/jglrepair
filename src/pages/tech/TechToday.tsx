import { Link } from 'react-router-dom'
import { AppShell } from '../../components/AppShell'
import { TECH_NAV } from '../../components/navs'
import { DemoNotice, Empty, MockTag, SectionTitle, StatusBadge, TechAvatar, UrgencyBadge } from '../../components/ui'
import { usePortal } from '../../store/PortalContext'
import {
  applianceLabel,
  boardWindow,
  getCustomer,
  getTechnician,
  jobsOnDay,
} from '../../store/selectors'
import { currency, todayISO } from '../../lib/format'

export default function TechToday() {
  const { state, setActiveTechnician } = usePortal()
  const tech = getTechnician(state, state.activeTechnicianId)!
  const day = todayISO()
  const jobs = jobsOnDay(state, day, tech.id)
  const done = jobs.filter((j) => j.status === 'Completed')
  const remaining = jobs.filter((j) => j.status !== 'Completed')
  const next = remaining[0]
  const potential = jobs.reduce((sum, j) => sum + (j.estimate?.total ?? 0), 0)

  return (
    <AppShell
      role="technician"
      title={tech.name}
      subtitle={`${tech.title} · ${jobs.length} stops today`}
      nav={TECH_NAV}
      actions={<TechAvatar tech={tech} size="sm" />}
    >
      <div className="card p-3">
        <label className="label">Demo: switch technician</label>
        <select
          className="field"
          value={tech.id}
          onChange={(e) => setActiveTechnician(e.target.value)}
        >
          {state.technicians.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} — {t.title}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {[
          ['Stops', jobs.length],
          ['Remaining', remaining.length],
          ['Booked', currency(potential)],
        ].map(([k, v]) => (
          <div key={String(k)} className="card px-3 py-3 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">{k}</p>
            <p className="text-xl font-extrabold text-ink-900">{v}</p>
          </div>
        ))}
      </div>

      {next && (
        <section className="card mt-4 overflow-hidden">
          <div className="flex items-center justify-between bg-ink-900 px-4 py-2.5 text-white">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70">Next stop</p>
            <p className="text-xs font-semibold">{boardWindow(next)}</p>
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-lg font-extrabold text-ink-900">
                  {getCustomer(state, next.customerId)?.name}
                </p>
                <p className="truncate text-sm text-ink-600">
                  {getCustomer(state, next.customerId)?.address},{' '}
                  {getCustomer(state, next.customerId)?.city}
                </p>
                <p className="mt-1.5 text-sm font-semibold text-ink-800">
                  {applianceLabel(state, next)} · {next.problem}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <StatusBadge status={next.status} />
                <div className="mt-1.5">
                  <UrgencyBadge urgency={next.urgency} />
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link to={`/tech/job/${next.id}`} className="btn-primary">
                Open job
              </Link>
              <a
                href={`tel:${getCustomer(state, next.customerId)?.phone.replace(/\D/g, '')}`}
                className="btn-ghost"
              >
                📞 Call
              </a>
            </div>
            <p className="mt-2 text-center text-[11px] text-ink-400">
              Turn-by-turn routing is <MockTag>GPS mocked</MockTag>
            </p>
          </div>
        </section>
      )}

      <section className="mt-6">
        <SectionTitle>Today&rsquo;s jobs</SectionTitle>
        {jobs.length === 0 ? (
          <Empty icon="🌤️" title="No jobs scheduled today" body="Check the Schedule tab for upcoming work." />
        ) : (
          <ol className="space-y-3">
            {jobs.map((j) => {
              const c = getCustomer(state, j.customerId)!
              return (
                <li key={j.id}>
                  <Link to={`/tech/job/${j.id}`} className="card block p-4 transition hover:shadow-md">
                    <div className="flex gap-3">
                      <div className="w-[74px] shrink-0 rounded-xl bg-ink-50 px-2 py-2 text-center">
                        <p className="text-[10px] font-bold uppercase text-ink-500">
                          {boardWindow(j).split(' - ')[0].replace(':00', '')}
                        </p>
                        <p className="text-[10px] text-ink-400">to</p>
                        <p className="text-[10px] font-bold uppercase text-ink-500">
                          {boardWindow(j).split(' - ')[1].replace(':00', '')}
                        </p>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-extrabold text-ink-900">{c.name}</p>
                          <UrgencyBadge urgency={j.urgency} />
                        </div>
                        <p className="truncate text-xs text-ink-500">
                          {c.address}, {c.city} {c.zip}
                        </p>
                        <p className="mt-1 truncate text-sm font-semibold text-ink-800">
                          {applianceLabel(state, j)}
                        </p>
                        <p className="truncate text-sm text-ink-600">{j.problem}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <StatusBadge status={j.status} />
                          <span className="text-[11px] text-ink-400">#{j.id}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ol>
        )}
      </section>

      {done.length > 0 && (
        <p className="mt-4 text-center text-xs text-ink-500">
          {done.length} of {jobs.length} completed today ✅
        </p>
      )}

      <div className="mt-6">
        <DemoNotice tone="inline" />
      </div>
    </AppShell>
  )
}
