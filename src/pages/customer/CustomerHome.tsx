import { Link } from 'react-router-dom'
import { AppShell } from '../../components/AppShell'
import { CUSTOMER_NAV } from '../../components/navs'
import { JobCard } from '../../components/panels'
import { DemoNotice, Empty, SectionTitle, StatusBadge, TechAvatar } from '../../components/ui'
import { usePortal } from '../../store/PortalContext'
import {
  applianceLabel,
  customerRequests,
  getCustomer,
  getTechnician,
  nextCustomerAction,
} from '../../store/selectors'
import { currencyExact, friendlyDay, timeAgo } from '../../lib/format'

export default function CustomerHome() {
  const { state } = usePortal()
  const customer = getCustomer(state, state.activeCustomerId)!
  const all = customerRequests(state, customer.id)
  const open = all.filter((r) => r.status !== 'Completed')
  const past = all.filter((r) => r.status === 'Completed')
  const hero = open[0]
  const heroTech = getTechnician(state, hero?.technicianId)
  const action = hero ? nextCustomerAction(hero) : null

  return (
    <AppShell
      role="customer"
      title={`Hi, ${customer.name.split(' ')[0]}`}
      subtitle={`${customer.address}, ${customer.city} ${customer.zip}`}
      nav={CUSTOMER_NAV}
    >
      {hero ? (
        <section className="card overflow-hidden">
          <div className="bg-gradient-to-br from-brand-700 to-brand-900 px-4 py-4 text-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
                  Active service request
                </p>
                <p className="text-xl font-extrabold">#{hero.id}</p>
                <p className="text-sm text-white/80">
                  {applianceLabel(state, hero)} · {hero.problem}
                </p>
              </div>
              <StatusBadge status={hero.status} className="shrink-0" />
            </div>
          </div>

          <div className="space-y-4 p-4">
            {action && (
              <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
                <span className="text-lg">🔔</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-900">{action}</p>
                  {hero.estimate?.status === 'Sent' && (
                    <p className="text-xs text-amber-800">
                      Total {currencyExact(hero.estimate.total)}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl bg-ink-50 px-3 py-2.5">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-lg shadow-sm">
                  📅
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                    {hero.repairAppointment ? 'Repair visit' : 'Appointment'}
                  </p>
                  <p className="truncate text-sm font-semibold text-ink-900">
                    {friendlyDay(hero.repairAppointment?.date ?? hero.appointment.date)} ·{' '}
                    {hero.repairAppointment?.window ?? hero.appointment.window}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-ink-50 px-3 py-2.5">
                <TechAvatar tech={heroTech} />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                    Technician
                  </p>
                  <p className="truncate text-sm font-semibold text-ink-900">
                    {heroTech ? heroTech.name : 'Being assigned'}
                  </p>
                  {heroTech && (
                    <p className="truncate text-[11px] text-ink-500">
                      ★ {heroTech.rating} · {heroTech.title}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Link to={`/customer/request/${hero.id}`} className="btn-primary w-full">
              View request details
            </Link>
          </div>
        </section>
      ) : (
        <Empty
          icon="🧰"
          title="No active service requests"
          body="Start a new request and we will get a technician out to you."
        />
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Link to="/customer/new" className="btn-accent w-full">
          ➕ Request a repair
        </Link>
        <a href="tel:+17045550100" className="btn-ghost w-full">
          📞 Call the shop <span className="text-ink-400">(mock)</span>
        </a>
      </div>

      {open.length > 1 && (
        <section className="mt-6">
          <SectionTitle>Other open requests</SectionTitle>
          <div className="space-y-3">
            {open.slice(1).map((r) => (
              <JobCard
                key={r.id}
                request={r}
                to={`/customer/request/${r.id}`}
                applianceName={applianceLabel(state, r)}
                tech={getTechnician(state, r.technicianId)}
                when={`${friendlyDay(r.appointment.date)} · ${r.appointment.window}`}
              />
            ))}
          </div>
        </section>
      )}

      <section className="mt-6">
        <SectionTitle
          action={
            <Link to="/customer/appliances" className="text-xs font-semibold text-brand-700">
              My appliances →
            </Link>
          }
        >
          Service history
        </SectionTitle>
        {past.length === 0 ? (
          <Empty icon="📁" title="No completed repairs yet" />
        ) : (
          <div className="space-y-3">
            {past.map((r) => (
              <Link
                key={r.id}
                to={`/customer/request/${r.id}`}
                className="card flex items-center gap-3 p-3.5 transition hover:shadow-md"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-lg">
                  ✅
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink-900">
                    {applianceLabel(state, r)} · {r.problem}
                  </p>
                  <p className="truncate text-xs text-ink-500">
                    #{r.id} · {r.completedAt ? timeAgo(r.completedAt) : ''} ·{' '}
                    {getTechnician(state, r.technicianId)?.name ?? 'JGL Repair'}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-bold tabular-nums text-ink-700">
                  {r.payment ? currencyExact(r.payment.amount) : '—'}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className="mt-6">
        <DemoNotice tone="inline" />
      </div>
    </AppShell>
  )
}
