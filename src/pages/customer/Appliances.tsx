import { Link } from 'react-router-dom'
import { AppShell } from '../../components/AppShell'
import { CUSTOMER_NAV } from '../../components/navs'
import { DemoNotice, Empty, SectionTitle } from '../../components/ui'
import { usePortal } from '../../store/PortalContext'
import { applianceHistory, getCustomer, revenueOf } from '../../store/selectors'
import { APPLIANCE_META } from '../../data/catalog'
import { currency, timeAgo } from '../../lib/format'

export default function Appliances() {
  const { state } = usePortal()
  const customer = getCustomer(state, state.activeCustomerId)!
  const mine = state.appliances.filter((a) => a.customerId === customer.id)
  const allRepairs = state.requests.filter((r) => r.customerId === customer.id)
  const lifetime = allRepairs.reduce((sum, r) => sum + revenueOf(r), 0)

  return (
    <AppShell
      role="customer"
      title="My appliances"
      subtitle={`${mine.length} tracked · ${allRepairs.length} service requests`}
      nav={CUSTOMER_NAV}
    >
      <div className="grid grid-cols-3 gap-3">
        {[
          ['Appliances', mine.length],
          ['Repairs', allRepairs.filter((r) => r.status === 'Completed').length],
          ['Lifetime', currency(lifetime)],
        ].map(([k, v]) => (
          <div key={String(k)} className="card px-3 py-3 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">{k}</p>
            <p className="text-lg font-extrabold text-ink-900">{v}</p>
          </div>
        ))}
      </div>

      <section className="mt-5">
        <SectionTitle
          action={
            <Link to="/customer/new" className="text-xs font-semibold text-brand-700">
              + New request
            </Link>
          }
        >
          Appliances at {customer.address}
        </SectionTitle>

        {mine.length === 0 ? (
          <Empty icon="🧰" title="No appliances on file" />
        ) : (
          <div className="space-y-3">
            {mine.map((a) => {
              const history = applianceHistory(state, a.id)
              const last = history[0]
              const open = history.filter((r) => r.status !== 'Completed').length
              return (
                <Link
                  key={a.id}
                  to={`/customer/appliances/${a.id}`}
                  className="card block p-4 transition hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-ink-50 text-2xl">
                      {APPLIANCE_META[a.type].icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-bold text-ink-900">
                        {a.brand} {a.type}
                      </p>
                      <p className="truncate text-xs text-ink-500">
                        Model {a.model} · {a.location} · purchased {a.purchasedYear}
                      </p>
                      <p className="mt-1.5 text-xs text-ink-600">
                        {history.length === 0
                          ? 'No service history yet'
                          : `${history.length} service ${history.length === 1 ? 'record' : 'records'}${
                              last?.completedAt ? ` · last ${timeAgo(last.completedAt)}` : ''
                            }`}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      {open > 0 && (
                        <span className="chip bg-amber-100 text-amber-900">{open} open</span>
                      )}
                      <p className="mt-1 text-xs font-semibold text-brand-700">View →</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      <div className="mt-6">
        <DemoNotice tone="inline" />
      </div>
    </AppShell>
  )
}
