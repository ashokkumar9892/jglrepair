import { Link } from 'react-router-dom'
import { usePortal } from '../store/PortalContext'
import { adminMetrics } from '../store/selectors'
import { DemoNotice } from '../components/ui'
import { Logo } from '../components/Logo'
import { APPLIANCE_META, BRANDS } from '../data/catalog'
import { APPLIANCE_TYPES } from '../types'
import { currency } from '../lib/format'

const ROLES = [
  {
    to: '/customer',
    icon: '🏠',
    title: 'Customer Portal',
    tag: 'Homeowner',
    blurb:
      'Book a repair in a few taps, track the job through every status, review the estimate and approve it, message your technician, and see every appliance in your home.',
    points: [
      'Request a repair + add photos',
      'Live status tracker',
      'Approve or decline the estimate',
      'Appliance & repair history',
    ],
    accent: 'from-brand-600 to-brand-800',
  },
  {
    to: '/tech',
    icon: '🔧',
    title: 'Technician',
    tag: 'In the field',
    blurb:
      "The day's route on a phone: start the job, record the diagnosis, photograph the failed part, add parts, build the estimate, order what is needed, and close the ticket.",
    points: [
      "Today's stops with address & window",
      'Diagnosis + job photos',
      'Parts and estimate builder',
      'Complete the repair',
    ],
    accent: 'from-ink-800 to-ink-900',
  },
  {
    to: '/admin',
    icon: '📋',
    title: 'Office & Dispatch',
    tag: 'Back office',
    blurb:
      "Everything the shop needs on one board: today's jobs, the emergency queue, estimates waiting on customers, parts on order, completed work, and revenue.",
    points: [
      'Job and revenue dashboard',
      'Emergency queue',
      'Dispatch calendar',
      'Assign technicians',
    ],
    accent: 'from-brand-700 to-ink-900',
  },
]

const SCRIPT = [
  {
    step: '1',
    title: 'A customer books a repair',
    body: 'Customer Portal → Request a repair. Refrigerator → Samsung → "Not cooling", add a photo, pick an arrival window. A service request number is created.',
    to: '/customer/new',
    cta: 'Book a repair',
  },
  {
    step: '2',
    title: 'The technician works the job',
    body: 'Technician → open a stop → Start Job → add the diagnosis → add the part → Generate Estimate → Mark Part Ordered → Complete Repair.',
    to: '/tech',
    cta: "See today's jobs",
  },
  {
    step: '3',
    title: 'The customer approves the estimate',
    body: 'Request #JGL-1039 has an estimate waiting: diagnostic $85, replacement part $195, labor $160 — $440 total. Approve it, decline it, or ask a question.',
    to: '/customer/request/JGL-1039',
    cta: 'Review the estimate',
  },
  {
    step: '4',
    title: 'The office runs the board',
    body: 'Office & Dispatch → job counts, emergencies, estimates awaiting approval, parts on order and revenue. Assign the unassigned emergency and watch the board update.',
    to: '/admin',
    cta: 'Open the dispatch board',
  },
]

const MOCKED = [
  ['Payments', 'Approved estimates settle to a placeholder card record. No processor is connected.'],
  ['Texts & email', 'Every notification is written into the app only. Nothing is sent to anyone.'],
  ['GPS', '"On my way", arrival times and Navigate are simulated.'],
  ['Records', 'Everything is stored in this browser, on this device.'],
  ['Sign-in', 'No accounts. Switch between the three views freely from this page.'],
]

export default function DemoMenu() {
  const { state, resetDemo } = usePortal()
  const m = adminMetrics(state)
  const brands = BRANDS.filter((b) => b !== 'Other')

  return (
    <div className="min-h-dvh bg-ink-50">
      <DemoNotice />

      <header className="bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white">
        <div className="mx-auto max-w-5xl px-4 pb-9 pt-8">
          <div className="flex items-center gap-3">
            <Logo size={56} />
            <div>
              <h1 className="text-2xl font-extrabold leading-tight sm:text-3xl">JGL Repair</h1>
              <p className="text-sm font-semibold text-white/80">Service Management Portal</p>
            </div>
          </div>

          <p className="mt-5 text-lg font-extrabold uppercase leading-tight tracking-wide sm:text-2xl">
            Professional and fast appliance repair
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/85">
            Serving Charlotte, NC and surrounding areas. Book a repair online, see exactly where your
            job stands, approve the estimate from your phone, and keep a record of every appliance in
            your home.
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link to="/customer/new" className="btn bg-white px-5 text-brand-800 hover:bg-white/90">
              🔧 Book a repair
            </Link>
            <Link
              to="/customer"
              className="btn border border-white/40 bg-white/10 px-5 text-white hover:bg-white/20"
            >
              Track my service
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-white/80">
            <span>⚡ Same-day service available</span>
            <span>🛠️ All major brands</span>
            <span>📍 Charlotte, NC &amp; surrounding areas</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {/* What the shop services */}
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-500">
            Appliances we service
          </h2>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
            {APPLIANCE_TYPES.map((t) => (
              <Link
                key={t}
                to="/customer/new"
                className="card flex flex-col items-center gap-1 px-2 py-3.5 text-center transition hover:shadow-md"
              >
                <span className="text-2xl" aria-hidden>
                  {APPLIANCE_META[t].icon}
                </span>
                <span className="text-xs font-bold leading-tight text-ink-800">{t}</span>
              </Link>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-500">
              Brands:
            </span>
            {brands.map((b) => (
              <span key={b} className="chip border border-ink-200 bg-white text-ink-600">
                {b}
              </span>
            ))}
          </div>
        </section>

        {/* Role entry points */}
        <section className="mt-8">
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

        {/* Walkthrough */}
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-500">
            Follow one repair from start to finish
          </h2>
          <ol className="grid gap-3 md:grid-cols-2">
            {SCRIPT.map((s) => (
              <li key={s.step} className="card p-4">
                <div className="flex gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-flame-700 text-sm font-bold text-white">
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
              The shop right now
            </h2>
            <dl className="mt-3 grid grid-cols-2 gap-3">
              {[
                ['Jobs today', m.today.length],
                ['Emergencies open', m.emergencies.length],
                ['Awaiting approval', m.awaitingApproval.length],
                ['Parts on order', m.partsOrdered.length],
                ['Technicians', state.technicians.length],
                ['Completed revenue', currency(m.revenueAll)],
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
              Puts every request, message, photo, and estimate back to the starting scenario. Nothing
              you do here leaves this browser.
            </p>
          </div>

          <div className="card p-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-ink-500">
              What is simulated
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

        <footer className="mt-8 border-t border-ink-200 pb-10 pt-5">
          <p className="text-xs leading-relaxed text-ink-500">
            <span className="font-semibold text-ink-700">Unofficial demonstration concept.</span>{' '}
            This is an independent design exercise built from publicly visible business information
            (appliances serviced, brands serviced, Charlotte service area). It is not affiliated
            with, endorsed by, or connected to any real business, and contains no proprietary data or
            source code. The colors and hexagon placeholder mark are an original interpretation — no
            real logo, artwork, or working phone number appears here — and every customer,
            technician, job, price, and repair record is invented sample data.
          </p>
          <p className="mt-3 text-[11px] text-ink-400">
            Concept build · runs entirely in your browser, no account or server required.
          </p>
        </footer>
      </main>
    </div>
  )
}
