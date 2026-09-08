import { Link } from 'react-router-dom'
import { AppShell } from '../../components/AppShell'
import { TECH_NAV } from '../../components/navs'
import { DemoNotice, Empty, SectionTitle, StatusBadge, UrgencyBadge } from '../../components/ui'
import { usePortal } from '../../store/PortalContext'
import { applianceLabel, boardWindow, getCustomer, getTechnician, jobsOnDay } from '../../store/selectors'
import { dayOffset, formatDay, friendlyDay } from '../../lib/format'

export default function TechSchedule() {
  const { state } = usePortal()
  const tech = getTechnician(state, state.activeTechnicianId)!
  const days = Array.from({ length: 7 }, (_, i) => dayOffset(i))
  const total = days.reduce((n, d) => n + jobsOnDay(state, d, tech.id).length, 0)

  return (
    <AppShell
      role="technician"
      title="My schedule"
      subtitle={`${tech.name} · next 7 days · ${total} stops`}
      nav={TECH_NAV}
    >
      {total === 0 && <Empty icon="📆" title="Nothing booked this week" />}

      <div className="space-y-5">
        {days.map((d) => {
          const jobs = jobsOnDay(state, d, tech.id)
          if (!jobs.length) return null
          return (
            <section key={d}>
              <SectionTitle
                action={<span className="text-xs text-ink-400">{jobs.length} stops</span>}
              >
                {friendlyDay(d)} · {formatDay(d)}
              </SectionTitle>
              <ol className="space-y-2.5">
                {jobs.map((j) => {
                  const c = getCustomer(state, j.customerId)!
                  return (
                    <li key={j.id}>
                      <Link to={`/tech/job/${j.id}`} className="card flex gap-3 p-3.5 hover:shadow-md">
                        <div className="w-16 shrink-0 text-center">
                          <p className="text-xs font-bold text-ink-700">
                            {boardWindow(j).split(' - ')[0].replace(':00', '')}
                          </p>
                          <p className="text-[10px] text-ink-400">2 hr</p>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-bold text-ink-900">{c.name}</p>
                            <UrgencyBadge urgency={j.urgency} />
                          </div>
                          <p className="truncate text-xs text-ink-500">{c.address}</p>
                          <p className="truncate text-sm text-ink-700">
                            {applianceLabel(state, j)} · {j.problem}
                          </p>
                        </div>
                        <StatusBadge status={j.status} className="shrink-0 self-start" />
                      </Link>
                    </li>
                  )
                })}
              </ol>
            </section>
          )
        })}
      </div>

      <div className="mt-6">
        <DemoNotice tone="inline" />
      </div>
    </AppShell>
  )
}
