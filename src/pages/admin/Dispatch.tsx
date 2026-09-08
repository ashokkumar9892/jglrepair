import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../../components/AppShell'
import { ADMIN_NAV } from '../../components/navs'
import { DemoNotice, SectionTitle, StatusBadge, TechAvatar, UrgencyBadge } from '../../components/ui'
import { usePortal } from '../../store/PortalContext'
import { applianceLabel, boardDate, boardWindow, getCustomer, jobsOnDay } from '../../store/selectors'
import { TIME_WINDOWS } from '../../data/catalog'
import { dayOffset, formatDay, friendlyDay, todayISO } from '../../lib/format'

export default function Dispatch() {
  const { state, assignTechnician, scheduleVisit } = usePortal()
  const [weekOffset, setWeekOffset] = useState(0)
  const [day, setDay] = useState(todayISO())
  const [assigning, setAssigning] = useState<string | null>(null)
  const [assignTech, setAssignTech] = useState(state.technicians[0]?.id ?? '')
  const [assignWindow, setAssignWindow] = useState(TIME_WINDOWS[0])
  const [assignDate, setAssignDate] = useState(todayISO())
  const [toast, setToast] = useState<string | null>(null)

  const week = Array.from({ length: 7 }, (_, i) => dayOffset(weekOffset * 7 + i))
  const dayJobs = jobsOnDay(state, day)
  const unassigned = state.requests.filter((r) => !r.technicianId && r.status !== 'Completed')

  const doAssign = (requestId: string) => {
    assignTechnician(requestId, assignTech)
    scheduleVisit(requestId, assignDate, assignWindow)
    setAssigning(null)
    setToast(`#${requestId} assigned and scheduled.`)
    setDay(assignDate)
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <AppShell
      role="admin"
      title="Dispatch calendar"
      subtitle={`${dayJobs.length} jobs on ${friendlyDay(day)} · ${unassigned.length} unassigned`}
      nav={ADMIN_NAV}
    >
      {toast && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-900">
          ✅ {toast}
        </div>
      )}

      <div className="mb-3 flex items-center justify-between">
        <button className="btn-ghost btn-sm" onClick={() => setWeekOffset((w) => w - 1)}>
          ← Prev
        </button>
        <p className="text-sm font-semibold text-ink-700">
          {formatDay(week[0])} – {formatDay(week[6])}
        </p>
        <button className="btn-ghost btn-sm" onClick={() => setWeekOffset((w) => w + 1)}>
          Next →
        </button>
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 no-scrollbar">
        {week.map((d) => {
          const count = jobsOnDay(state, d).length
          const active = d === day
          return (
            <button
              key={d}
              onClick={() => setDay(d)}
              className={`min-w-[78px] shrink-0 rounded-xl border px-3 py-2.5 text-center transition ${
                active
                  ? 'border-brand-700 bg-brand-800 text-white'
                  : 'border-ink-200 bg-white text-ink-700'
              }`}
            >
              <span className="block text-[11px] font-semibold uppercase opacity-80">
                {formatDay(d).split(',')[0]}
              </span>
              <span className="block text-lg font-extrabold leading-tight">
                {Number(d.slice(-2))}
              </span>
              <span
                className={`mt-0.5 inline-block rounded-full px-1.5 text-[10px] font-bold ${
                  active ? 'bg-white/20' : count ? 'bg-brand-100 text-brand-800' : 'text-ink-300'
                }`}
              >
                {count ? `${count} job${count > 1 ? 's' : ''}` : 'open'}
              </span>
            </button>
          )
        })}
      </div>

      {/* Technician columns */}
      <section className="mt-4">
        <SectionTitle>
          {friendlyDay(day)} · {formatDay(day)}
        </SectionTitle>
        <div className="-mx-4 overflow-x-auto px-4 pb-2">
          <div
            className="grid min-w-[640px] gap-3"
            style={{ gridTemplateColumns: `72px repeat(${state.technicians.length}, minmax(180px, 1fr))` }}
          >
            <div />
            {state.technicians.map((t) => (
              <div key={t.id} className="flex items-center gap-2 pb-1">
                <TechAvatar tech={t} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-ink-900">{t.name}</p>
                  <p className="truncate text-[10px] text-ink-500">
                    {jobsOnDay(state, day, t.id).length} stops
                  </p>
                </div>
              </div>
            ))}

            {TIME_WINDOWS.map((w) => (
              <div key={w} className="contents">
                <div className="pt-2 text-right text-[11px] font-semibold uppercase text-ink-400">
                  {w.split(' - ')[0].replace(':00', '')}
                </div>
                {state.technicians.map((t) => {
                  const cell = state.requests.filter(
                    (r) => boardDate(r) === day && r.technicianId === t.id && boardWindow(r) === w,
                  )
                  return (
                    <div
                      key={t.id + w}
                      className="min-h-[68px] rounded-xl border border-dashed border-ink-200 bg-white p-1.5"
                    >
                      {cell.map((r) => (
                        <Link
                          key={r.id}
                          to={`/admin/jobs/${r.id}`}
                          className={`mb-1 block rounded-lg border px-2 py-1.5 text-left last:mb-0 ${t.tint}`}
                        >
                          <span className="block truncate text-[11px] font-bold">
                            {getCustomer(state, r.customerId)?.name}
                          </span>
                          <span className="block truncate text-[10px] opacity-80">
                            {applianceLabel(state, r)}
                          </span>
                          <span className="block truncate text-[10px] opacity-70">
                            #{r.id} · {r.status}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Unassigned tray */}
      <section className="mt-6">
        <SectionTitle>Unassigned queue</SectionTitle>
        {unassigned.length === 0 ? (
          <p className="card px-4 py-6 text-center text-sm text-ink-400">
            Every open job has a technician. 🎉
          </p>
        ) : (
          <ul className="space-y-3">
            {unassigned.map((r) => {
              const c = getCustomer(state, r.customerId)!
              const isOpen = assigning === r.id
              return (
                <li key={r.id} className="card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-bold text-ink-900">{c.name}</p>
                        <UrgencyBadge urgency={r.urgency} />
                      </div>
                      <p className="truncate text-xs text-ink-500">
                        {c.address}, {c.city} {c.zip}
                      </p>
                      <p className="mt-1 truncate text-sm text-ink-700">
                        {applianceLabel(state, r)} · {r.problem}
                      </p>
                      <p className="mt-0.5 text-[11px] text-ink-400">
                        #{r.id} · requested {friendlyDay(r.appointment.date)} · {r.appointment.window}
                      </p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>

                  {!isOpen ? (
                    <button
                      className="btn-primary btn-sm mt-3 w-full"
                      onClick={() => {
                        setAssigning(r.id)
                        setAssignDate(r.appointment.date)
                        setAssignWindow(r.appointment.window)
                      }}
                    >
                      Assign technician
                    </button>
                  ) : (
                    <div className="mt-3 space-y-2.5 rounded-xl border border-ink-200 p-3">
                      <label className="block">
                        <span className="label">Technician</span>
                        <select
                          className="field"
                          value={assignTech}
                          onChange={(e) => setAssignTech(e.target.value)}
                        >
                          {state.technicians.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name} — {jobsOnDay(state, assignDate, t.id).length} stops that day
                            </option>
                          ))}
                        </select>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="block">
                          <span className="label">Date</span>
                          <input
                            type="date"
                            className="field"
                            value={assignDate}
                            onChange={(e) => setAssignDate(e.target.value)}
                          />
                        </label>
                        <label className="block">
                          <span className="label">Window</span>
                          <select
                            className="field"
                            value={assignWindow}
                            onChange={(e) => setAssignWindow(e.target.value)}
                          >
                            {TIME_WINDOWS.map((w) => (
                              <option key={w}>{w}</option>
                            ))}
                          </select>
                        </label>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button className="btn-ghost" onClick={() => setAssigning(null)}>
                          Cancel
                        </button>
                        <button className="btn-primary" onClick={() => doAssign(r.id)}>
                          Confirm
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <div className="mt-6">
        <DemoNotice tone="inline" />
      </div>
    </AppShell>
  )
}
