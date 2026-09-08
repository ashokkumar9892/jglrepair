import { Link } from 'react-router-dom'
import { AppShell } from '../../components/AppShell'
import { TECH_NAV } from '../../components/navs'
import { DemoNotice, Empty, MockTag, SectionTitle } from '../../components/ui'
import { usePortal } from '../../store/PortalContext'
import { applianceLabel, getCustomer, getTechnician } from '../../store/selectors'
import { currencyExact, dayOffset, friendlyDay } from '../../lib/format'
import type { PartStatus } from '../../types'

const NEXT: Record<PartStatus, PartStatus | null> = {
  Needed: 'Ordered',
  Ordered: 'Received',
  Received: 'Installed',
  Installed: null,
}

export default function TechParts() {
  const { state, setPartStatus } = usePortal()
  const tech = getTechnician(state, state.activeTechnicianId)!
  const jobs = state.requests.filter((r) => r.technicianId === tech.id && r.parts.length > 0)
  const rows = jobs.flatMap((r) => r.parts.map((p) => ({ request: r, part: p })))
  const open = rows.filter((row) => row.part.status !== 'Installed')

  return (
    <AppShell
      role="technician"
      title="Parts"
      subtitle={`${open.length} open · ${rows.length} total on your jobs`}
      nav={TECH_NAV}
    >
      {rows.length === 0 ? (
        <Empty icon="📦" title="No parts on your jobs" />
      ) : (
        <>
          <SectionTitle>Parts pipeline</SectionTitle>
          <ul className="space-y-3">
            {rows.map(({ request, part }) => {
              const next = NEXT[part.status]
              return (
                <li key={`${request.id}-${part.id}`} className="card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-ink-900">{part.name}</p>
                      <p className="truncate text-xs text-ink-500">
                        #{part.partNumber} · {currencyExact(part.price)} · {part.supplier}
                      </p>
                      <Link
                        to={`/tech/job/${request.id}`}
                        className="mt-1 block truncate text-xs font-semibold text-brand-700"
                      >
                        #{request.id} · {getCustomer(state, request.customerId)?.name} ·{' '}
                        {applianceLabel(state, request)}
                      </Link>
                    </div>
                    <span className="chip shrink-0 bg-ink-100 text-ink-600">{part.status}</span>
                  </div>
                  {part.eta && (
                    <p className="mt-2 text-xs text-ink-500">Expected {friendlyDay(part.eta)}</p>
                  )}
                  {next && (
                    <button
                      className="btn-ghost btn-sm mt-3 w-full"
                      onClick={() =>
                        setPartStatus(
                          request.id,
                          part.id,
                          next,
                          next === 'Ordered' ? dayOffset(2) : part.eta,
                        )
                      }
                    >
                      Mark {next.toLowerCase()}
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
          <p className="mt-4 text-center text-xs text-ink-500">
            Supplier integration is <MockTag>ordering mocked</MockTag>
          </p>
        </>
      )}

      <div className="mt-6">
        <DemoNotice tone="inline" />
      </div>
    </AppShell>
  )
}
