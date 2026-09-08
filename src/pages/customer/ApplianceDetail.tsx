import { Link, useParams } from 'react-router-dom'
import { AppShell } from '../../components/AppShell'
import { CUSTOMER_NAV } from '../../components/navs'
import { DemoNotice, Empty, SectionTitle, StatusBadge } from '../../components/ui'
import { usePortal } from '../../store/PortalContext'
import { applianceHistory, getAppliance, getTechnician, revenueOf } from '../../store/selectors'
import { APPLIANCE_META } from '../../data/catalog'
import { currency, currencyExact, formatDay, friendlyDay } from '../../lib/format'

export default function ApplianceDetail() {
  const { id = '' } = useParams()
  const { state } = usePortal()
  const appliance = getAppliance(state, id)

  if (!appliance) {
    return (
      <AppShell
        role="customer"
        title="Appliance not found"
        nav={CUSTOMER_NAV}
        back={{ to: '/customer/appliances', label: 'Back' }}
      >
        <Empty icon="🔎" title="We could not find that appliance" />
      </AppShell>
    )
  }

  const history = applianceHistory(state, appliance.id)
  const spend = history.reduce((sum, r) => sum + revenueOf(r), 0)
  const meta = APPLIANCE_META[appliance.type]

  return (
    <AppShell
      role="customer"
      title={`${appliance.brand} ${appliance.type}`}
      subtitle={`Model ${appliance.model} · ${appliance.location}`}
      nav={CUSTOMER_NAV}
      back={{ to: '/customer/appliances', label: 'Back to appliances' }}
    >
      <section className="card overflow-hidden">
        <div className="flex items-center gap-4 bg-gradient-to-br from-ink-800 to-ink-900 px-4 py-5 text-white">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/10 text-3xl">
            {meta.icon}
          </span>
          <div className="min-w-0">
            <p className="text-lg font-extrabold leading-tight">
              {appliance.brand} {appliance.type}
            </p>
            <p className="text-xs text-white/70">
              Serial {appliance.serial} · purchased {appliance.purchasedYear}
            </p>
          </div>
        </div>
        <dl className="grid grid-cols-3 divide-x divide-ink-100">
          {[
            ['Repairs', String(history.filter((r) => r.status === 'Completed').length)],
            ['Open', String(history.filter((r) => r.status !== 'Completed').length)],
            ['Spend', currency(spend)],
          ].map(([k, v]) => (
            <div key={k} className="px-3 py-3 text-center">
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">{k}</dt>
              <dd className="text-lg font-extrabold text-ink-900">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-5">
        <SectionTitle
          action={
            <Link to="/customer/new" className="text-xs font-semibold text-brand-700">
              + Request service
            </Link>
          }
        >
          Repair history
        </SectionTitle>

        {history.length === 0 ? (
          <Empty icon="📁" title="No repairs recorded" body="This appliance has no service history yet." />
        ) : (
          <ol className="space-y-3">
            {history.map((r) => {
              const tech = getTechnician(state, r.technicianId)
              return (
                <li key={r.id}>
                  <Link
                    to={`/customer/request/${r.id}`}
                    className="card block p-4 transition hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold text-ink-900">#{r.id}</p>
                        <p className="truncate text-sm font-semibold text-ink-800">{r.problem}</p>
                        <p className="mt-0.5 text-xs text-ink-500">
                          {r.completedAt
                            ? formatDay(r.completedAt.slice(0, 10), { year: 'numeric' })
                            : `${friendlyDay(r.appointment.date)} · ${r.appointment.window}`}
                          {tech ? ` · ${tech.name}` : ''}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <StatusBadge status={r.status} />
                        {r.payment && (
                          <p className="mt-1.5 text-sm font-bold tabular-nums text-ink-800">
                            {currencyExact(r.payment.amount)}
                          </p>
                        )}
                      </div>
                    </div>
                    {r.diagnosis && (
                      <p className="mt-3 border-t border-ink-100 pt-3 text-xs leading-relaxed text-ink-600">
                        <span className="font-semibold text-ink-700">Diagnosis: </span>
                        {r.diagnosis}
                      </p>
                    )}
                    {r.parts.length > 0 && (
                      <p className="mt-2 text-xs text-ink-500">
                        Parts: {r.parts.map((p) => `${p.name} (#${p.partNumber})`).join(', ')}
                      </p>
                    )}
                  </Link>
                </li>
              )
            })}
          </ol>
        )}
      </section>

      <section className="card mt-5 p-4">
        <SectionTitle>Common issues for this appliance</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {meta.problems.map((p) => (
            <Link
              key={p}
              to="/customer/new"
              className="chip border border-ink-200 bg-white text-ink-600 hover:border-brand-400"
            >
              {p}
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-6">
        <DemoNotice tone="inline" />
      </div>
    </AppShell>
  )
}
