import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../../components/AppShell'
import { ADMIN_NAV } from '../../components/navs'
import { DemoNotice, Empty, StatusBadge, TechAvatar, UrgencyBadge } from '../../components/ui'
import { usePortal } from '../../store/PortalContext'
import { applianceLabel, boardWindow, getCustomer, getTechnician } from '../../store/selectors'
import { JOB_STATUSES } from '../../types'
import { friendlyDay } from '../../lib/format'

const FILTERS = ['All', 'Open', 'Emergency', 'Unassigned', ...JOB_STATUSES] as const

export default function AdminJobs() {
  const { state } = usePortal()
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('Open')
  const [query, setQuery] = useState('')
  const [techFilter, setTechFilter] = useState('all')

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return state.requests
      .filter((r) => {
        if (filter === 'Open') return r.status !== 'Completed'
        if (filter === 'Emergency') return r.urgency === 'emergency'
        if (filter === 'Unassigned') return !r.technicianId && r.status !== 'Completed'
        if (filter === 'All') return true
        return r.status === filter
      })
      .filter((r) => (techFilter === 'all' ? true : r.technicianId === techFilter))
      .filter((r) => {
        if (!q) return true
        const c = getCustomer(state, r.customerId)
        return [r.id, r.problem, r.problemDetail, applianceLabel(state, r), c?.name, c?.address]
          .join(' ')
          .toLowerCase()
          .includes(q)
      })
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  }, [state, filter, query, techFilter])

  return (
    <AppShell
      role="admin"
      title="All jobs"
      subtitle={`${rows.length} of ${state.requests.length} service requests`}
      nav={ADMIN_NAV}
    >
      <input
        className="field"
        placeholder="Search ticket, customer, address, appliance…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition ${
              filter === f ? 'bg-brand-800 text-white' : 'border border-ink-200 bg-white text-ink-600'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <select
        className="field mt-3"
        value={techFilter}
        onChange={(e) => setTechFilter(e.target.value)}
      >
        <option value="all">All technicians</option>
        {state.technicians.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>

      <div className="mt-4 space-y-3">
        {rows.length === 0 && <Empty icon="🔎" title="No jobs match those filters" />}
        {rows.map((r) => {
          const c = getCustomer(state, r.customerId)!
          const tech = getTechnician(state, r.technicianId)
          return (
            <Link key={r.id} to={`/admin/jobs/${r.id}`} className="card block p-4 hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-extrabold text-ink-900">#{r.id}</span>
                    <UrgencyBadge urgency={r.urgency} />
                  </div>
                  <p className="mt-0.5 truncate text-sm font-semibold text-ink-900">{c.name}</p>
                  <p className="truncate text-xs text-ink-500">
                    {c.address}, {c.city} {c.zip}
                  </p>
                  <p className="mt-1 truncate text-sm text-ink-700">
                    {applianceLabel(state, r)} · {r.problem}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <StatusBadge status={r.status} />
                  <p className="mt-1 text-[11px] text-ink-400">
                    {friendlyDay(r.repairAppointment?.date ?? r.appointment.date)}
                    <br />
                    {boardWindow(r)}
                  </p>
                  <div className="mt-1.5 flex justify-end">
                    <TechAvatar tech={tech} size="sm" />
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="mt-6">
        <DemoNotice tone="inline" />
      </div>
    </AppShell>
  )
}
