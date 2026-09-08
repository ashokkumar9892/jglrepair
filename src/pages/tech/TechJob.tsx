import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AppShell } from '../../components/AppShell'
import { TECH_NAV } from '../../components/navs'
import {
  EstimateCard,
  MessageThread,
  PhotoStrip,
  PhotoUploader,
} from '../../components/panels'
import {
  DemoNotice,
  Empty,
  Field,
  MockTag,
  SectionTitle,
  StatusBadge,
  Timeline,
  UrgencyBadge,
} from '../../components/ui'
import { usePortal } from '../../store/PortalContext'
import { getAppliance, getCustomer, getRequest, getTechnician } from '../../store/selectors'
import { COMMON_PARTS, DIAGNOSTIC_FEE, TIME_WINDOWS } from '../../data/catalog'
import { currencyExact, dayOffset, friendlyDay } from '../../lib/format'

type Panel = 'diagnosis' | 'part' | 'estimate' | 'order' | 'repair' | 'complete' | null

export default function TechJob() {
  const { id = '' } = useParams()
  const {
    state,
    startJob,
    setDiagnosis,
    addPhoto,
    removePhoto,
    addPart,
    removePart,
    createEstimate,
    markPartsOrdered,
    scheduleRepair,
    completeRepair,
    addMessage,
  } = usePortal()

  const request = getRequest(state, id)
  const [panel, setPanel] = useState<Panel>(null)
  const [diagnosisDraft, setDiagnosisDraft] = useState(request?.diagnosis ?? '')
  const [partPreset, setPartPreset] = useState('')
  const [partName, setPartName] = useState('')
  const [partNumber, setPartNumber] = useState('')
  const [partPrice, setPartPrice] = useState('')
  const [labor, setLabor] = useState('160')
  const [estimateNote, setEstimateNote] = useState('')
  const [eta, setEta] = useState(dayOffset(2))
  const [repairDate, setRepairDate] = useState(dayOffset(3))
  const [repairWindow, setRepairWindow] = useState(TIME_WINDOWS[1])
  const [summary, setSummary] = useState('Replaced the failed component and tested a full cycle.')
  const [toast, setToast] = useState<string | null>(null)

  if (!request) {
    return (
      <AppShell role="technician" title="Job not found" nav={TECH_NAV} back={{ to: '/tech', label: 'Back' }}>
        <Empty icon="🔎" title={`No job ${id}`} />
        <Link to="/tech" className="btn-primary mt-4 w-full">
          Back to today&rsquo;s jobs
        </Link>
      </AppShell>
    )
  }

  const customer = getCustomer(state, request.customerId)!
  const appliance = getAppliance(state, request.applianceId)
  const tech = getTechnician(state, request.technicianId) ?? getTechnician(state, state.activeTechnicianId)!
  const partsTotal = request.parts.reduce((sum, p) => sum + p.price * p.quantity, 0)
  const flash = (m: string) => {
    setToast(m)
    setPanel(null)
    setTimeout(() => setToast(null), 3200)
  }

  const applyPreset = (value: string) => {
    setPartPreset(value)
    const preset = COMMON_PARTS.find((p) => p.partNumber === value)
    if (preset) {
      setPartName(preset.name)
      setPartNumber(preset.partNumber)
      setPartPrice(String(preset.price))
    }
  }

  const saveDiagnosis = () => {
    if (!diagnosisDraft.trim()) return
    setDiagnosis(request.id, diagnosisDraft.trim())
    flash('Diagnosis saved and shared with the customer.')
  }

  const savePart = () => {
    if (!partName.trim()) return
    addPart(request.id, {
      name: partName.trim(),
      partNumber: partNumber.trim() || 'N/A',
      price: Number(partPrice) || 0,
      quantity: 1,
      supplier: 'Marcone Supply (mock)',
    })
    setPartPreset('')
    setPartName('')
    setPartNumber('')
    setPartPrice('')
    flash('Part added to the job.')
  }

  const buildEstimate = () => {
    const laborAmount = Number(labor) || 0
    const lines = [
      { label: 'Diagnostic', kind: 'diagnostic' as const, amount: DIAGNOSTIC_FEE },
      ...request.parts.map((p) => ({
        label: p.quantity > 1 ? `${p.name} ×${p.quantity}` : p.name,
        kind: 'part' as const,
        amount: p.price * p.quantity,
      })),
      { label: 'Labor', kind: 'labor' as const, amount: laborAmount },
    ]
    createEstimate(request.id, lines, estimateNote.trim() || undefined)
    flash('Estimate sent to the customer for approval.')
  }

  const orderParts = () => {
    markPartsOrdered(request.id, eta)
    flash(`Part marked ordered, ETA ${friendlyDay(eta)}.`)
  }

  const bookRepair = () => {
    scheduleRepair(request.id, repairDate, repairWindow)
    flash('Repair visit scheduled.')
  }

  const finish = () => {
    completeRepair(request.id, summary.trim() || 'Repair completed.')
    flash('Job completed. Invoice and receipt are mocked.')
  }

  const estimateReady = request.parts.length > 0 || !!request.diagnosis
  const canOrder = request.estimate?.status === 'Approved' && request.parts.some((p) => p.status === 'Needed')

  return (
    <AppShell
      role="technician"
      title={`#${request.id}`}
      subtitle={`${customer.name} · ${appliance ? `${appliance.brand} ${appliance.type}` : ''}`}
      nav={TECH_NAV}
      back={{ to: '/tech', label: "Back to today's jobs" }}
    >
      {toast && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-900">
          ✅ {toast}
        </div>
      )}

      {/* Customer / stop card */}
      <section className="card overflow-hidden">
        <div className="flex items-center justify-between bg-ink-900 px-4 py-2.5 text-white">
          <span className="text-xs font-semibold uppercase tracking-widest text-white/70">
            {friendlyDay(request.repairAppointment?.date ?? request.appointment.date)}
          </span>
          <span className="text-xs font-semibold">
            {request.repairAppointment?.window ?? request.appointment.window}
          </span>
        </div>
        <div className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-lg font-extrabold text-ink-900">{customer.name}</p>
              <p className="text-sm text-ink-600">
                {customer.address}, {customer.city}, {customer.state} {customer.zip}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <StatusBadge status={request.status} />
              <div className="mt-1.5">
                <UrgencyBadge urgency={request.urgency} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <a href={`tel:${customer.phone.replace(/\D/g, '')}`} className="btn-ghost">
              📞 Call
            </a>
            <button className="btn-ghost" onClick={() => flash('Navigation is mocked in this demo.')}>
              🧭 Navigate
            </button>
          </div>

          <dl className="grid gap-2 rounded-xl bg-ink-50 p-3 text-sm">
            <div className="flex gap-3">
              <dt className="w-20 shrink-0 text-ink-500">Appliance</dt>
              <dd className="font-semibold text-ink-900">
                {appliance ? `${appliance.brand} ${appliance.type}` : '—'}
                {appliance && (
                  <span className="block text-xs font-normal text-ink-500">
                    Model {appliance.model} · Serial {appliance.serial}
                  </span>
                )}
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-20 shrink-0 text-ink-500">Issue</dt>
              <dd className="font-semibold text-ink-900">{request.problem}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-20 shrink-0 text-ink-500">Notes</dt>
              <dd className="text-ink-700">{request.problemDetail}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Workflow actions */}
      <section className="card mt-4 p-4">
        <SectionTitle>Job actions</SectionTitle>

        {!request.startedAt && request.status !== 'Completed' && (
          <button
            className="btn-accent mb-3 w-full text-base"
            onClick={() => {
              startJob(request.id)
              flash('Job started. The customer was notified (mock SMS).')
            }}
          >
            ▶ Start job
          </button>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            className={`btn-ghost ${panel === 'diagnosis' ? 'ring-2 ring-brand-500' : ''}`}
            onClick={() => setPanel(panel === 'diagnosis' ? null : 'diagnosis')}
          >
            🩺 {request.diagnosis ? 'Edit diagnosis' : 'Add diagnosis'}
          </button>
          <button
            className={`btn-ghost ${panel === 'part' ? 'ring-2 ring-brand-500' : ''}`}
            onClick={() => setPanel(panel === 'part' ? null : 'part')}
          >
            🔩 Add part
          </button>
          <button
            className={`btn-ghost ${panel === 'estimate' ? 'ring-2 ring-brand-500' : ''}`}
            disabled={!estimateReady}
            onClick={() => setPanel(panel === 'estimate' ? null : 'estimate')}
          >
            🧾 Generate estimate
          </button>
          <button
            className={`btn-ghost ${panel === 'order' ? 'ring-2 ring-brand-500' : ''}`}
            disabled={!request.parts.some((p) => p.status === 'Needed')}
            onClick={() => setPanel(panel === 'order' ? null : 'order')}
          >
            📦 Mark part ordered
          </button>
          <button
            className={`btn-ghost ${panel === 'repair' ? 'ring-2 ring-brand-500' : ''}`}
            onClick={() => setPanel(panel === 'repair' ? null : 'repair')}
          >
            📆 Schedule repair
          </button>
          <button
            className={`btn-primary ${panel === 'complete' ? 'ring-2 ring-brand-500' : ''}`}
            disabled={request.status === 'Completed'}
            onClick={() => setPanel(panel === 'complete' ? null : 'complete')}
          >
            ✅ Complete repair
          </button>
        </div>

        {canOrder && panel !== 'order' && (
          <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Estimate approved — the part still needs to be ordered.
          </p>
        )}

        {panel === 'diagnosis' && (
          <div className="mt-4 space-y-3 rounded-xl border border-ink-200 p-3">
            <Field label="Diagnosis" hint="Shared with the customer and stored on the appliance record.">
              <textarea
                className="field min-h-[120px]"
                value={diagnosisDraft}
                onChange={(e) => setDiagnosisDraft(e.target.value)}
                placeholder="Evaporator fan motor has failed - no airflow to the fresh food section…"
              />
            </Field>
            <button className="btn-primary w-full" onClick={saveDiagnosis}>
              Save diagnosis
            </button>
          </div>
        )}

        {panel === 'part' && (
          <div className="mt-4 space-y-3 rounded-xl border border-ink-200 p-3">
            <Field label="Common parts">
              <select className="field" value={partPreset} onChange={(e) => applyPreset(e.target.value)}>
                <option value="">Choose a part…</option>
                {COMMON_PARTS.map((p) => (
                  <option key={p.partNumber} value={p.partNumber}>
                    {p.name} — {currencyExact(p.price)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Part name">
              <input className="field" value={partName} onChange={(e) => setPartName(e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Part number">
                <input
                  className="field"
                  value={partNumber}
                  onChange={(e) => setPartNumber(e.target.value)}
                />
              </Field>
              <Field label="Price">
                <input
                  className="field"
                  inputMode="decimal"
                  value={partPrice}
                  onChange={(e) => setPartPrice(e.target.value)}
                  placeholder="195"
                />
              </Field>
            </div>
            <button className="btn-primary w-full" onClick={savePart} disabled={!partName.trim()}>
              Add part to job
            </button>
          </div>
        )}

        {panel === 'estimate' && (
          <div className="mt-4 space-y-3 rounded-xl border border-ink-200 p-3">
            <div className="rounded-xl bg-ink-50 p-3 text-sm">
              <div className="flex justify-between py-1">
                <span className="text-ink-600">Diagnostic</span>
                <span className="font-semibold tabular-nums">{currencyExact(DIAGNOSTIC_FEE)}</span>
              </div>
              {request.parts.map((p) => (
                <div key={p.id} className="flex justify-between py-1">
                  <span className="text-ink-600">{p.name}</span>
                  <span className="font-semibold tabular-nums">
                    {currencyExact(p.price * p.quantity)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between py-1">
                <span className="text-ink-600">Labor</span>
                <span className="font-semibold tabular-nums">
                  {currencyExact(Number(labor) || 0)}
                </span>
              </div>
              <div className="mt-1 flex justify-between border-t border-ink-200 pt-2 text-base font-extrabold">
                <span>Total</span>
                <span className="tabular-nums">
                  {currencyExact(DIAGNOSTIC_FEE + partsTotal + (Number(labor) || 0))}
                </span>
              </div>
            </div>
            <Field label="Labor charge">
              <input
                className="field"
                inputMode="decimal"
                value={labor}
                onChange={(e) => setLabor(e.target.value)}
              />
            </Field>
            <Field label="Note to customer (optional)">
              <input
                className="field"
                value={estimateNote}
                onChange={(e) => setEstimateNote(e.target.value)}
                placeholder="Part is in stock with 1-2 day delivery."
              />
            </Field>
            <button className="btn-primary w-full" onClick={buildEstimate}>
              Send estimate to customer
            </button>
          </div>
        )}

        {panel === 'order' && (
          <div className="mt-4 space-y-3 rounded-xl border border-ink-200 p-3">
            <Field label="Expected arrival" hint="Supplier ordering is mocked - nothing is purchased.">
              <input
                type="date"
                className="field"
                value={eta}
                onChange={(e) => setEta(e.target.value)}
              />
            </Field>
            <button className="btn-primary w-full" onClick={orderParts}>
              Mark part ordered
            </button>
          </div>
        )}

        {panel === 'repair' && (
          <div className="mt-4 space-y-3 rounded-xl border border-ink-200 p-3">
            <Field label="Repair date">
              <input
                type="date"
                className="field"
                value={repairDate}
                onChange={(e) => setRepairDate(e.target.value)}
              />
            </Field>
            <Field label="Arrival window">
              <select
                className="field"
                value={repairWindow}
                onChange={(e) => setRepairWindow(e.target.value)}
              >
                {TIME_WINDOWS.map((w) => (
                  <option key={w}>{w}</option>
                ))}
              </select>
            </Field>
            <button className="btn-primary w-full" onClick={bookRepair}>
              Schedule repair visit
            </button>
          </div>
        )}

        {panel === 'complete' && (
          <div className="mt-4 space-y-3 rounded-xl border border-ink-200 p-3">
            <Field label="Completion summary">
              <textarea
                className="field min-h-[90px]"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              />
            </Field>
            <p className="text-xs text-ink-500">
              Marks every part installed, closes the ticket, and records a mocked payment of{' '}
              {request.estimate ? currencyExact(request.estimate.total) : 'the estimate total'}.{' '}
              <MockTag>Payments mocked</MockTag>
            </p>
            <button className="btn-accent w-full" onClick={finish}>
              Complete repair
            </button>
          </div>
        )}
      </section>

      {/* Diagnosis + parts summary */}
      {request.diagnosis && (
        <section className="card mt-4 p-4">
          <SectionTitle>Diagnosis</SectionTitle>
          <p className="text-sm leading-relaxed text-ink-700">{request.diagnosis}</p>
        </section>
      )}

      <section className="card mt-4 p-4">
        <SectionTitle>Parts on this job</SectionTitle>
        {request.parts.length === 0 ? (
          <p className="text-sm text-ink-500">No parts added yet.</p>
        ) : (
          <ul className="divide-y divide-ink-100">
            {request.parts.map((p) => (
              <li key={p.id} className="flex items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink-900">{p.name}</p>
                  <p className="truncate text-xs text-ink-500">
                    #{p.partNumber} · {currencyExact(p.price)}
                    {p.eta ? ` · ETA ${friendlyDay(p.eta)}` : ''}
                  </p>
                </div>
                <span className="chip shrink-0 bg-ink-100 text-ink-600">{p.status}</span>
                {p.status === 'Needed' && request.status !== 'Completed' && (
                  <button
                    onClick={() => removePart(request.id, p.id)}
                    className="shrink-0 text-xs font-semibold text-red-600"
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
            <li className="flex items-center justify-between pt-3 text-sm font-bold">
              <span>Parts subtotal</span>
              <span className="tabular-nums">{currencyExact(partsTotal)}</span>
            </li>
          </ul>
        )}
      </section>

      <section className="card mt-4 p-4">
        <SectionTitle>Photos</SectionTitle>
        <PhotoStrip photos={request.photos} />
        <div className="mt-4 border-t border-ink-100 pt-4">
          <PhotoUploader
            photos={request.photos.filter((p) => p.by === 'Technician')}
            by="Technician"
            label="Add job photo"
            hint="Document the failed part, model plate, or completed repair."
            onAdd={(p) => addPhoto(request.id, p)}
            onRemove={(pid) => removePhoto(request.id, pid)}
          />
        </div>
      </section>

      {request.estimate && (
        <section className="mt-4">
          <SectionTitle>Estimate</SectionTitle>
          <EstimateCard estimate={request.estimate} />
        </section>
      )}

      <section className="card mt-4 p-4">
        <SectionTitle>Messages with customer</SectionTitle>
        <MessageThread
          messages={request.messages}
          me="Technician"
          onSend={(body) => addMessage(request.id, 'Technician', tech.name, body)}
          quickReplies={[
            'On my way - about 15 minutes out.',
            'Diagnosis is done, sending an estimate now.',
            'Part arrived - can we schedule the install?',
          ]}
        />
      </section>

      <section className="card mt-4 p-4">
        <SectionTitle>Job activity</SectionTitle>
        <Timeline events={request.timeline} />
      </section>

      <div className="mt-6">
        <DemoNotice tone="inline" />
      </div>
    </AppShell>
  )
}
