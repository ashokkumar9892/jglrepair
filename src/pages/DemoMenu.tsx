import { Link } from 'react-router-dom'
import { usePortal } from '../store/PortalContext'
import { adminMetrics } from '../store/selectors'
import { DemoNotice } from '../components/ui'
import { currency } from '../lib/format'

const ROLES = [
  {
    to: '/customer',
    icon: '🏠',
    title: 'Customer Portal',
    tag: 'Homeowner',
    blurb:
      'Book a repair in 4 taps, track the job through 9 statuses, review the estimate and approve it, message the tech, and see every appliance you own.',
    points: ['New request wizard + photo upload', 'Live status tracker', 'Estimate approval', 'Appliance history'],
    accent: 'from-brand-700 to-brand-900',
  },
  {
    to: '/tech',
    icon: '🔧',
    title: 'Technician Mobile',
    tag: 'In the field',
    blurb:
      "Phone-first job list for the day: start the job, add a diagnosis, snap photos, add parts, build the estimate, order the part, and close the ticket.",
    points: ['Today’s route', 'Diagnosis + photos', 'Parts & estimate builder', 'Complete repair'],
    accent: 'from-ink-800 to-ink-900',
  },
  {
    to: '/admin',
    icon: '📊',
    title: 'Admin & Dispatch',
    tag: 'Back office',
    blurb:
      'Shop-wide view: today’s jobs, emergency queue, estimates awaiting approval, parts on order, completed work and revenue, plus a drag-free dispatch calendar.',
    points: ['KPI dashboard', 'Emergency queue', 'Dispatch calendar', 'Assign technicians'],
    accent: 'from-brand-800 to-ink-900',
  },
]

const SCRIPT = [
  {
    step: '1',
    title: 'Book a repair',
    body: 'Customer Portal → New Request. Pick Refrigerator → Samsung → "Not cooling", add a photo, choose a window. A ticket number is generated.',
    to: '/customer/new',
    cta: 'Start the wizard',
  },
  {
    step: '2',
    title: 'Work the job as the tech',
    body: 'Technician Mobile → open a job → Start Job → add a diagnosis → add a part → Generate Estimate → Mark Part Ordered → Complete Repair.',
    to: '/tech',
    cta: "Open today's jobs",
  },
  {
    step: '3',
    title: 'Approve the estimate',
    body: 'Back in the Customer Portal, request #JGL-1039 has a $440 estimate waiting: Diagnostic $85, Replacement Part $195, Labor $160.',
    to: '/customer/request/JGL-1039',
    cta: 'Review estimate',
  },
  {
    step: '4',
    title: 'Run the shop',
    body: 'Admin → dashboard KPIs and the dispatch calendar. Assign the unassigned emergency, then watch the counters move.',
    to: '/admin',
    cta: 'Open admin',
  },
]

const MOCKED = [
  ['Payments', 'Estimates settle to a fake "Card ending 4242" record.'],
  ['SMS / email', 'Every notification is logged in-app, nothing is sent.'],
  ['GPS / routing', 'Technician ETA and "on my way" are simulated.'],
  ['Database', 'All state lives in this browser’s localStorage.'],
  ['Authentication', 'Switch roles freely from this menu - no login.'],
]

export default function DemoMenu() {
  const { state, resetDemo } = usePortal()
  const m = adminMetrics(state)

  return (
    <div className="min-h-dvh bg-ink-50">
      <DemoNotice />

      <header className="bg-gradient-to-br from-brand-800 via-brand-900 to-ink-900 text-white">
        <div className="mx-auto max-w-5xl px-4 pb-10 pt-8">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 text-lg font-extrabold">
              JGL
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
                Proof of concept
              </p>
              <h1 className="text-2xl font-extrabold leading-tight sm:text-3xl">
                JGL Repair — Service Management Portal
              </h1>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/80">
            A modern, mobile-first concept for how an appliance repair shop in Charlotte, NC could
            run service requests end to end — customer booking, technician field work, and back
            office dispatch — in one app.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
            {['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'localStorage', 'Netlify-ready'].map(
              (t) => (
                <span key={t} className="chip bg-white/10 text-white/90">
                  {t}
                </span>
              ),
            )}
          </div>
          <div className="mt-5 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-xs leading-relaxed text-white/75">
            <strong className="font-semibold text-white">Unofficial demonstration concept.</strong>{' '}
            This is an independent design exercise built from publicly visible business information
            (appliance types, brands serviced, Charlotte service area). It is not affiliated with,
            endorsed by, or connected to any real business, and it contains no proprietary data or
            source code. Every customer, technician, job, and dollar figure here is invented sample
            data.
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-500">
            Choose a view
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {ROLES.map((r) => (
              <Link
                key={r.to}
                to={r.to}
                className="card group flex flex-col overflow-hidden transition hover:shadow-lg"
              >
                <div className={`bg-gradient-to-br ${r.accent} px-4 py-5 text-white`}>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl" aria-hidden>
                      {r.icon}
                    </span>
                    <span className="chip bg-white/15 text-white">{r.tag}</span>
                  </div>
                  <p className="mt-2 text-lg font-bold">{r.title}</p>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <p className="text-sm leading-relaxed text-ink-600">{r.blurb}</p>
                  <ul className="mt-3 space-y-1.5">
                    {r.points.map((p) => (
                      <li key={p} className="flex gap-2 text-xs text-ink-500">
                        <span className="text-brand-600">▸</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                  <span className="mt-4 text-sm font-semibold text-brand-700 group-hover:underline">
                    Open {r.title} →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-500">
            Guided demo (4 minutes)
          </h2>
          <ol className="grid gap-3 md:grid-cols-2">
            {SCRIPT.map((s) => (
              <li key={s.step} className="card p-4">
                <div className="flex gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-flame-500 text-sm font-bold text-white">
                    {s.step}
                  </span>
                  <div>
                    <p className="font-semibold text-ink-900">{s.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-600">{s.body}</p>
                    <Link
                      to={s.to}
                      className="mt-2 inline-block text-sm font-semibold text-brand-700 hover:underline"
                    >
                      {s.cta} →
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="card p-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-ink-500">
              Sample data loaded
            </h2>
            <dl className="mt-3 grid grid-cols-2 gap-3">
              {[
                ['Service requests', state.requests.length],
                ['Jobs today', m.today.length],
                ['Awaiting approval', m.awaitingApproval.length],
                ['Emergencies open', m.emergencies.length],
                ['Technicians', state.technicians.length],
                ['Revenue (all time)', currency(m.revenueAll)],
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-xl bg-ink-50 px-3 py-2.5">
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                    {label}
                  </dt>
                  <dd className="text-lg font-extrabold text-ink-900">{value}</dd>
                </div>
              ))}
            </dl>
            <button onClick={resetDemo} className="btn-ghost mt-4 w-full">
              ↺ Reset demo data
            </button>
            <p className="mt-2 text-[11px] text-ink-400">
              Resets every request, message, photo, and estimate back to the seeded scenario. Data
              lives only in this browser.
            </p>
          </div>

          <div className="card p-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-ink-500">
              What is deliberately mocked
            </h2>
            <ul className="mt-3 space-y-2.5">
              {MOCKED.map(([k, v]) => (
                <li key={k} className="flex gap-3">
                  <span className="chip mt-0.5 shrink-0 border border-dashed border-ink-300 bg-ink-100 text-ink-500">
                    {k}
                  </span>
                  <span className="text-sm text-ink-600">{v}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <footer className="mt-8 border-t border-ink-200 pt-5 pb-10">
          <DemoNotice tone="inline" />
          <p className="mt-2 text-[11px] text-ink-400">
            Built as a portfolio concept. Names, addresses, phone numbers, prices, and repair records
            shown in this app are fictional.
          </p>
        </footer>
      </main>
    </div>
  )
}
