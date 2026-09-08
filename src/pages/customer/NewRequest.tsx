import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppShell } from '../../components/AppShell'
import { CUSTOMER_NAV } from '../../components/navs'
import { PhotoUploader } from '../../components/panels'
import { DemoNotice, Field } from '../../components/ui'
import { usePortal } from '../../store/PortalContext'
import { getCustomer } from '../../store/selectors'
import { APPLIANCE_META, BRANDS, TIME_WINDOWS } from '../../data/catalog'
import { APPLIANCE_TYPES, type ApplianceType, type Photo, type Urgency } from '../../types'
import { dayOffset, formatDay, friendlyDay } from '../../lib/format'
import { uid } from '../../lib/id'

const STEPS = ['Appliance', 'Brand', 'Problem', 'Photos', 'Appointment', 'Review'] as const

export default function NewRequest() {
  const { state, createRequest } = usePortal()
  const navigate = useNavigate()
  const customer = getCustomer(state, state.activeCustomerId)!
  const myAppliances = state.appliances.filter((a) => a.customerId === customer.id)

  const [step, setStep] = useState(0)
  const [applianceType, setApplianceType] = useState<ApplianceType | null>(null)
  const [existingApplianceId, setExistingApplianceId] = useState<string | undefined>()
  const [brand, setBrand] = useState('')
  const [customBrand, setCustomBrand] = useState('')
  const [model, setModel] = useState('')
  const [problem, setProblem] = useState('')
  const [customProblem, setCustomProblem] = useState('')
  const [detail, setDetail] = useState('')
  const [urgency, setUrgency] = useState<Urgency>('standard')
  const [photos, setPhotos] = useState<Photo[]>([])
  const [date, setDate] = useState(dayOffset(1))
  const [window, setWindow] = useState(TIME_WINDOWS[0])
  const [createdId, setCreatedId] = useState<string | null>(null)

  const effectiveBrand = brand === 'Other' ? customBrand.trim() : brand
  const effectiveProblem = problem === 'Something else' ? customProblem.trim() : problem

  const days = useMemo(() => Array.from({ length: 10 }, (_, i) => dayOffset(i)), [])

  const canContinue = [
    !!applianceType,
    !!effectiveBrand,
    !!effectiveProblem,
    true,
    !!date && !!window,
    true,
  ][step]

  const pickExisting = (id: string) => {
    const a = myAppliances.find((x) => x.id === id)
    if (!a) return
    setExistingApplianceId(a.id)
    setApplianceType(a.type)
    setBrand(BRANDS.includes(a.brand) ? a.brand : 'Other')
    if (!BRANDS.includes(a.brand)) setCustomBrand(a.brand)
    setModel(a.model === 'Not provided' ? '' : a.model)
    setStep(2)
  }

  const submit = () => {
    const created = createRequest({
      customerId: customer.id,
      applianceType: applianceType!,
      brand: effectiveBrand,
      model,
      existingApplianceId,
      problem: effectiveProblem,
      problemDetail: detail.trim() || 'No additional details provided.',
      urgency,
      date,
      window,
      photos,
    })
    setCreatedId(created?.id ?? null)
  }

  /* ----------------------------- success ---------------------------- */
  if (createdId) {
    return (
      <AppShell role="customer" title="Request submitted" nav={CUSTOMER_NAV}>
        <div className="card overflow-hidden">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 px-5 py-8 text-center text-white">
            <div className="text-4xl">✅</div>
            <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-white/70">
              Service request created
            </p>
            <p className="mt-1 text-3xl font-extrabold">#{createdId}</p>
            <p className="mt-2 text-sm text-white/85">
              {effectiveBrand} {applianceType} · {effectiveProblem}
            </p>
          </div>
          <div className="space-y-3 p-5">
            <div className="rounded-xl bg-ink-50 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                Requested window
              </p>
              <p className="text-sm font-semibold text-ink-900">
                {friendlyDay(date)}, {formatDay(date)} · {window}
              </p>
            </div>
            <p className="text-sm text-ink-600">
              A dispatcher confirms the window and assigns a technician. You will get a text update
              at each step — <span className="text-ink-400">simulated in this demo</span>.
            </p>
            <Link to={`/customer/request/${createdId}`} className="btn-primary w-full">
              Track this request
            </Link>
            <Link to="/customer" className="btn-ghost w-full">
              Back to my service
            </Link>
            <DemoNotice tone="inline" />
          </div>
        </div>
      </AppShell>
    )
  }

  /* ------------------------------ wizard ---------------------------- */
  return (
    <AppShell
      role="customer"
      title="Request a repair"
      subtitle={`Step ${step + 1} of ${STEPS.length} · ${STEPS[step]}`}
      nav={CUSTOMER_NAV}
      back={step === 0 ? { to: '/customer', label: 'Back' } : undefined}
    >
      <div className="mb-4 flex gap-1">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-brand-600' : 'bg-ink-200'}`}
          />
        ))}
      </div>

      {step === 0 && (
        <section>
          <h2 className="text-lg font-bold text-ink-900">What needs service?</h2>
          <p className="mb-4 text-sm text-ink-500">Choose the appliance type.</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {APPLIANCE_TYPES.map((t) => {
              const active = applianceType === t && !existingApplianceId
              return (
                <button
                  key={t}
                  onClick={() => {
                    setApplianceType(t)
                    setExistingApplianceId(undefined)
                    setProblem('')
                  }}
                  className={`card flex flex-col items-start gap-1 p-4 text-left transition ${
                    active ? 'ring-2 ring-brand-600 border-brand-300' : 'hover:shadow-md'
                  }`}
                >
                  <span className="text-2xl" aria-hidden>
                    {APPLIANCE_META[t].icon}
                  </span>
                  <span className="text-sm font-bold text-ink-900">{t}</span>
                  <span className="text-[11px] text-ink-500">{APPLIANCE_META[t].blurb}</span>
                </button>
              )
            })}
          </div>

          {myAppliances.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-ink-500">
                Or pick one we already service
              </h3>
              <div className="space-y-2">
                {myAppliances.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => pickExisting(a.id)}
                    className="card flex w-full items-center gap-3 p-3.5 text-left transition hover:shadow-md"
                  >
                    <span className="text-xl">{APPLIANCE_META[a.type].icon}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-ink-900">
                        {a.brand} {a.type}
                      </span>
                      <span className="block truncate text-xs text-ink-500">
                        Model {a.model} · {a.location}
                      </span>
                    </span>
                    <span className="text-brand-700">→</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {step === 1 && (
        <section>
          <h2 className="text-lg font-bold text-ink-900">Which brand?</h2>
          <p className="mb-4 text-sm text-ink-500">
            We service most major brands sold in the Charlotte area.
          </p>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {BRANDS.map((b) => (
              <button
                key={b}
                onClick={() => setBrand(b)}
                className={`min-h-[52px] rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                  brand === b
                    ? 'border-brand-600 bg-brand-50 text-brand-800 ring-2 ring-brand-200'
                    : 'border-ink-200 bg-white text-ink-700 hover:border-brand-300'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
          {brand === 'Other' && (
            <div className="mt-4">
              <Field label="Brand name">
                <input
                  className="field"
                  value={customBrand}
                  onChange={(e) => setCustomBrand(e.target.value)}
                  placeholder="e.g. Electrolux"
                />
              </Field>
            </div>
          )}
          <div className="mt-4">
            <Field label="Model number (optional)" hint="Usually on a sticker inside the door.">
              <input
                className="field"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. RF28R7351SG"
              />
            </Field>
          </div>
        </section>
      )}

      {step === 2 && applianceType && (
        <section>
          <h2 className="text-lg font-bold text-ink-900">What is it doing?</h2>
          <p className="mb-4 text-sm text-ink-500">Pick the closest match.</p>
          <div className="space-y-2">
            {[...APPLIANCE_META[applianceType].problems, 'Something else'].map((p) => (
              <button
                key={p}
                onClick={() => setProblem(p)}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm font-semibold transition ${
                  problem === p
                    ? 'border-brand-600 bg-brand-50 text-brand-800 ring-2 ring-brand-200'
                    : 'border-ink-200 bg-white text-ink-700 hover:border-brand-300'
                }`}
              >
                <span
                  className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
                    problem === p ? 'border-brand-600 bg-brand-600 text-white' : 'border-ink-300'
                  }`}
                >
                  {problem === p ? '✓' : ''}
                </span>
                {p}
              </button>
            ))}
          </div>

          {problem === 'Something else' && (
            <div className="mt-4">
              <Field label="Describe the problem">
                <input
                  className="field"
                  value={customProblem}
                  onChange={(e) => setCustomProblem(e.target.value)}
                  placeholder="e.g. Door seal torn"
                />
              </Field>
            </div>
          )}

          <div className="mt-4">
            <Field
              label="Any details that would help?"
              hint="When it started, error codes, noises, what you have already tried."
            >
              <textarea
                className="field min-h-[110px]"
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="Fridge side is warm but the freezer still makes ice…"
              />
            </Field>
          </div>

          <button
            onClick={() => setUrgency(urgency === 'emergency' ? 'standard' : 'emergency')}
            className={`mt-4 flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition ${
              urgency === 'emergency'
                ? 'border-red-300 bg-red-50'
                : 'border-ink-200 bg-white hover:border-red-200'
            }`}
          >
            <span className="text-xl">⚡</span>
            <span className="flex-1">
              <span className="block text-sm font-semibold text-ink-900">
                This is an emergency (water leak, no refrigeration)
              </span>
              <span className="block text-xs text-ink-500">
                Emergency requests jump the dispatch queue for same-day service.
              </span>
            </span>
            <span
              className={`mt-0.5 h-6 w-11 shrink-0 rounded-full p-0.5 transition ${
                urgency === 'emergency' ? 'bg-red-500' : 'bg-ink-200'
              }`}
            >
              <span
                className={`block h-5 w-5 rounded-full bg-white transition ${
                  urgency === 'emergency' ? 'translate-x-5' : ''
                }`}
              />
            </span>
          </button>
        </section>
      )}

      {step === 3 && (
        <section>
          <h2 className="text-lg font-bold text-ink-900">Add photos</h2>
          <p className="mb-4 text-sm text-ink-500">
            A photo of the model sticker and the problem area speeds up the visit. Optional — you
            can skip this step.
          </p>
          <div className="card p-4">
            <PhotoUploader
              photos={photos}
              by="Customer"
              onAdd={(p) =>
                setPhotos((prev) => [...prev, { ...p, id: uid('ph'), at: new Date().toISOString() }])
              }
              onRemove={(id) => setPhotos((prev) => prev.filter((p) => p.id !== id))}
            />
          </div>
          <p className="mt-3 text-xs text-ink-500">
            Photos are stored in this browser only. Nothing is uploaded to a server.
          </p>
        </section>
      )}

      {step === 4 && (
        <section>
          <h2 className="text-lg font-bold text-ink-900">Pick an appointment</h2>
          <p className="mb-4 text-sm text-ink-500">
            Choose a day and an arrival window. Dispatch confirms it within the hour.
          </p>

          <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar">
            {days.map((d) => {
              const active = date === d
              return (
                <button
                  key={d}
                  onClick={() => setDate(d)}
                  className={`min-w-[74px] shrink-0 rounded-xl border px-3 py-2.5 text-center transition ${
                    active
                      ? 'border-brand-600 bg-brand-700 text-white'
                      : 'border-ink-200 bg-white text-ink-700'
                  }`}
                >
                  <span className="block text-[11px] font-semibold uppercase opacity-80">
                    {friendlyDay(d) === formatDay(d) ? formatDay(d).split(',')[0] : friendlyDay(d)}
                  </span>
                  <span className="block text-lg font-extrabold leading-tight">
                    {Number(d.slice(-2))}
                  </span>
                  <span className="block text-[10px] uppercase opacity-70">
                    {formatDay(d).split(' ')[1]}
                  </span>
                </button>
              )
            })}
          </div>

          <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-ink-500">
            Arrival window
          </h3>
          <div className="space-y-2">
            {TIME_WINDOWS.map((w) => (
              <button
                key={w}
                onClick={() => setWindow(w)}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-sm font-semibold transition ${
                  window === w
                    ? 'border-brand-600 bg-brand-50 text-brand-800 ring-2 ring-brand-200'
                    : 'border-ink-200 bg-white text-ink-700'
                }`}
              >
                {w}
                <span className="text-xs font-medium text-ink-400">
                  {w === TIME_WINDOWS[0] ? 'Most requested' : '2-hour window'}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 5 && (
        <section>
          <h2 className="text-lg font-bold text-ink-900">Review and submit</h2>
          <p className="mb-4 text-sm text-ink-500">
            Nothing is charged now. The {`$85`} diagnostic is applied to the repair if you approve
            the estimate.
          </p>
          <div className="card divide-y divide-ink-100">
            {[
              ['Appliance', `${effectiveBrand} ${applianceType}${model ? ` · ${model}` : ''}`],
              ['Problem', effectiveProblem],
              ['Details', detail.trim() || 'None added'],
              ['Priority', urgency === 'emergency' ? '⚡ Emergency' : 'Standard'],
              ['Photos', photos.length ? `${photos.length} attached` : 'None'],
              ['Appointment', `${formatDay(date)} · ${window}`],
              ['Service address', `${customer.address}, ${customer.city}, ${customer.state} ${customer.zip}`],
              ['Contact', `${customer.name} · ${customer.phone}`],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-4 px-4 py-3">
                <span className="w-28 shrink-0 text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                  {k}
                </span>
                <span className="flex-1 text-sm text-ink-800">{v}</span>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <DemoNotice tone="inline" />
          </div>
        </section>
      )}

      {/* sticky wizard controls */}
      <div className="fixed inset-x-0 bottom-[56px] z-20 border-t border-ink-200 bg-white/95 p-3 backdrop-blur md:static md:mt-6 md:border-0 md:bg-transparent md:p-0">
        <div className="mx-auto flex max-w-5xl gap-2">
          <button
            className="btn-ghost flex-1"
            onClick={() => (step === 0 ? navigate('/customer') : setStep(step - 1))}
          >
            {step === 0 ? 'Cancel' : 'Back'}
          </button>
          {step < STEPS.length - 1 ? (
            <button
              className="btn-primary flex-[2]"
              disabled={!canContinue}
              onClick={() => setStep(step + 1)}
            >
              Continue
            </button>
          ) : (
            <button className="btn-accent flex-[2]" onClick={submit}>
              Submit request
            </button>
          )}
        </div>
      </div>
      <div className="h-16 md:hidden" />
    </AppShell>
  )
}
