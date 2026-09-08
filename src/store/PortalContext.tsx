import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type {
  Appliance,
  ApplianceType,
  Estimate,
  EstimateLine,
  JobStatus,
  Message,
  MessageAuthor,
  MockNotification,
  Part,
  PartStatus,
  Photo,
  PortalState,
  ServiceRequest,
  Urgency,
} from '../types'
import { buildSeedState } from '../data/seed'
import { addDays, todayISO } from '../lib/format'
import { uid } from '../lib/id'

const STORAGE_KEY = 'jgl-portal-state-v1'
const SEEDED_KEY = 'jgl-portal-seeded-on'

/* ------------------------------------------------------------------ */
/* Demo-date drift: keep "Today's Jobs" meaningful on any day you open */
/* ------------------------------------------------------------------ */

const shiftISO = (iso: string | undefined, days: number) => {
  if (!iso) return iso
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

const shiftDay = (day: string | undefined, days: number) => (day ? addDays(day, days) : day)

const shiftRequest = (r: ServiceRequest, days: number): ServiceRequest => ({
  ...r,
  appointment: { ...r.appointment, date: shiftDay(r.appointment.date, days)! },
  repairAppointment: r.repairAppointment
    ? { ...r.repairAppointment, date: shiftDay(r.repairAppointment.date, days)! }
    : undefined,
  createdAt: shiftISO(r.createdAt, days)!,
  startedAt: shiftISO(r.startedAt, days),
  completedAt: shiftISO(r.completedAt, days),
  payment: r.payment ? { ...r.payment, at: shiftISO(r.payment.at, days)! } : undefined,
  photos: r.photos.map((p) => ({ ...p, at: shiftISO(p.at, days)! })),
  parts: r.parts.map((p) => ({ ...p, eta: shiftDay(p.eta, days) })),
  estimate: r.estimate
    ? {
        ...r.estimate,
        createdAt: shiftISO(r.estimate.createdAt, days)!,
        decidedAt: shiftISO(r.estimate.decidedAt, days),
      }
    : undefined,
  messages: r.messages.map((m) => ({ ...m, at: shiftISO(m.at, days)! })),
  timeline: r.timeline.map((t) => ({ ...t, at: shiftISO(t.at, days)! })),
})

const daysBetween = (fromISODay: string, toISODay: string) =>
  Math.round(
    (new Date(toISODay + 'T00:00:00').getTime() - new Date(fromISODay + 'T00:00:00').getTime()) /
      86400000,
  )

const loadState = (): PortalState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) throw new Error('no state')
    const parsed = JSON.parse(raw) as PortalState
    if (!parsed?.requests?.length) throw new Error('empty state')
    const seededOn = localStorage.getItem(SEEDED_KEY) ?? todayISO()
    const drift = daysBetween(seededOn, todayISO())
    if (drift !== 0) {
      return { ...parsed, requests: parsed.requests.map((r) => shiftRequest(r, drift)) }
    }
    return parsed
  } catch {
    return buildSeedState()
  }
}

/* ------------------------------------------------------------------ */
/* Context                                                             */
/* ------------------------------------------------------------------ */

export interface NewRequestInput {
  customerId: string
  applianceType: ApplianceType
  brand: string
  model?: string
  existingApplianceId?: string
  problem: string
  problemDetail: string
  urgency: Urgency
  date: string
  window: string
  photos: Photo[]
}

interface PortalApi {
  state: PortalState
  /** persisted-storage warning, e.g. quota exceeded from photo uploads */
  storageWarning: string | null
  createRequest: (input: NewRequestInput) => ServiceRequest
  addMessage: (requestId: string, author: MessageAuthor, name: string, body: string) => void
  addPhoto: (requestId: string, photo: Omit<Photo, 'id' | 'at'>) => void
  removePhoto: (requestId: string, photoId: string) => void
  assignTechnician: (requestId: string, technicianId: string) => void
  scheduleVisit: (requestId: string, date: string, window: string) => void
  scheduleRepair: (requestId: string, date: string, window: string) => void
  startJob: (requestId: string) => void
  setDiagnosis: (requestId: string, diagnosis: string) => void
  addPart: (requestId: string, part: Omit<Part, 'id' | 'status'>) => void
  removePart: (requestId: string, partId: string) => void
  setPartStatus: (requestId: string, partId: string, status: PartStatus, eta?: string) => void
  createEstimate: (requestId: string, lines: Omit<EstimateLine, 'id'>[], note?: string) => void
  decideEstimate: (requestId: string, decision: 'Approved' | 'Declined', note?: string) => void
  markPartsOrdered: (requestId: string, eta: string) => void
  completeRepair: (requestId: string, summary: string) => void
  setStatus: (requestId: string, status: JobStatus, by: string, detail?: string) => void
  setActiveCustomer: (id: string) => void
  setActiveTechnician: (id: string) => void
  resetDemo: () => void
  dismissStorageWarning: () => void
}

const PortalContext = createContext<PortalApi | null>(null)

const stamp = () => new Date().toISOString()

const withEvent = (
  r: ServiceRequest,
  label: string,
  by: string,
  status?: JobStatus,
  detail?: string,
): ServiceRequest => ({
  ...r,
  timeline: [...r.timeline, { id: uid('ev'), label, detail, at: stamp(), by, status }],
})

export function PortalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PortalState>(() => loadState())
  const [storageWarning, setStorageWarning] = useState<string | null>(null)
  const firstRender = useRef(true)
  /** Always-current snapshot so createRequest can return the new ticket synchronously. */
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      if (firstRender.current) {
        localStorage.setItem(SEEDED_KEY, todayISO())
        firstRender.current = false
      }
    } catch {
      setStorageWarning(
        'Browser storage is full - the newest photos may not survive a refresh. Everything else still works.',
      )
    }
  }, [state])

  const notify = (
    prev: PortalState,
    note: Omit<MockNotification, 'id' | 'at'>,
  ): MockNotification[] =>
    [{ ...note, id: uid('n'), at: stamp() }, ...prev.notifications].slice(0, 40)

  /** Update one request and (optionally) queue a mocked notification. */
  const patch = useCallback(
    (
      requestId: string,
      fn: (r: ServiceRequest) => ServiceRequest,
      notification?: (r: ServiceRequest, s: PortalState) => Omit<MockNotification, 'id' | 'at'>,
    ) => {
      setState((prev) => {
        const target = prev.requests.find((r) => r.id === requestId)
        if (!target) return prev
        const next = fn(target)
        return {
          ...prev,
          requests: prev.requests.map((r) => (r.id === requestId ? next : r)),
          notifications: notification ? notify(prev, notification(next, prev)) : prev.notifications,
        }
      })
    },
    [],
  )

  const customerPhone = (s: PortalState, customerId: string) =>
    s.customers.find((c) => c.id === customerId)?.phone ?? 'unknown'

  const createRequest = useCallback((input: NewRequestInput) => {
    const prev = stateRef.current
    const number = prev.nextRequestNumber

    let applianceId = input.existingApplianceId
    let appliances: Appliance[] = prev.appliances
    if (!applianceId) {
      const appliance: Appliance = {
        id: uid('a'),
        customerId: input.customerId,
        type: input.applianceType,
        brand: input.brand,
        model: input.model || 'Not provided',
        serial: 'Not provided',
        purchasedYear: new Date().getFullYear() - 3,
        location:
          input.applianceType === 'Washer' || input.applianceType === 'Dryer'
            ? 'Laundry room'
            : 'Kitchen',
      }
      appliances = [...prev.appliances, appliance]
      applianceId = appliance.id
    }

    const request: ServiceRequest = {
      id: `JGL-${number}`,
      customerId: input.customerId,
      applianceId,
      problem: input.problem,
      problemDetail: input.problemDetail,
      urgency: input.urgency,
      status: 'Requested',
      appointment: { date: input.date, window: input.window },
      photos: input.photos,
      parts: [],
      messages: [
        {
          id: uid('m'),
          author: 'Dispatch',
          authorName: 'JGL Dispatch',
          body: `Thanks! We received your request for the ${input.brand} ${input.applianceType.toLowerCase()}. A dispatcher will confirm your ${input.window} window shortly.`,
          at: stamp(),
          smsMock: true,
        },
      ],
      timeline: [
        {
          id: uid('ev'),
          label: 'Request received',
          detail:
            input.urgency === 'emergency'
              ? 'Emergency request submitted online'
              : 'Submitted through the customer portal',
          at: stamp(),
          by: 'Customer portal',
          status: 'Requested',
        },
      ],
      createdAt: stamp(),
    }

    setState((current) => ({
      ...current,
      appliances:
        appliances === prev.appliances
          ? current.appliances
          : [...current.appliances, appliances[appliances.length - 1]],
      requests: current.requests.some((r) => r.id === request.id)
        ? current.requests
        : [request, ...current.requests],
      nextRequestNumber: Math.max(current.nextRequestNumber, number + 1),
      notifications: notify(current, {
        channel: 'SMS',
        to: customerPhone(current, input.customerId),
        body: `JGL Repair: we got your request ${request.id}. We will text you when a technician is assigned. (mock)`,
        requestId: request.id,
      }),
    }))

    return request
  }, [])

  const addMessage = useCallback(
    (requestId: string, author: MessageAuthor, name: string, body: string) => {
      const message: Message = {
        id: uid('m'),
        author,
        authorName: name,
        body,
        at: stamp(),
        smsMock: author !== 'Customer',
      }
      patch(
        requestId,
        (r) => ({ ...r, messages: [...r.messages, message] }),
        (r, s) => ({
          channel: 'SMS',
          to: author === 'Customer' ? 'JGL Dispatch' : customerPhone(s, r.customerId),
          body: `${name}: ${body}`,
          requestId: r.id,
        }),
      )
    },
    [patch],
  )

  const addPhoto = useCallback(
    (requestId: string, photo: Omit<Photo, 'id' | 'at'>) => {
      patch(requestId, (r) => ({
        ...r,
        photos: [...r.photos, { ...photo, id: uid('ph'), at: stamp() }],
      }))
    },
    [patch],
  )

  const removePhoto = useCallback(
    (requestId: string, photoId: string) => {
      patch(requestId, (r) => ({ ...r, photos: r.photos.filter((p) => p.id !== photoId) }))
    },
    [patch],
  )

  const setStatus = useCallback(
    (requestId: string, status: JobStatus, by: string, detail?: string) => {
      patch(
        requestId,
        (r) => withEvent({ ...r, status }, `Status set to ${status}`, by, status, detail),
        (r, s) => ({
          channel: 'SMS',
          to: customerPhone(s, r.customerId),
          body: `JGL Repair ${r.id}: status updated to ${status}. (mock)`,
          requestId: r.id,
        }),
      )
    },
    [patch],
  )

  const assignTechnician = useCallback(
    (requestId: string, technicianId: string) => {
      setState((prev) => {
        const tech = prev.technicians.find((t) => t.id === technicianId)
        const target = prev.requests.find((r) => r.id === requestId)
        if (!tech || !target) return prev
        const nextStatus: JobStatus =
          target.status === 'Requested' || target.status === 'Scheduled'
            ? 'Technician Assigned'
            : target.status
        const next = withEvent(
          { ...target, technicianId, status: nextStatus },
          'Technician assigned',
          'JGL Dispatch',
          nextStatus,
          `${tech.name} - ${tech.title}`,
        )
        return {
          ...prev,
          requests: prev.requests.map((r) => (r.id === requestId ? next : r)),
          notifications: notify(prev, {
            channel: 'SMS',
            to: customerPhone(prev, target.customerId),
            body: `JGL Repair ${requestId}: ${tech.name} is assigned to your visit. (mock)`,
            requestId,
          }),
        }
      })
    },
    [],
  )

  const scheduleVisit = useCallback(
    (requestId: string, date: string, window: string) => {
      patch(
        requestId,
        (r) =>
          withEvent(
            {
              ...r,
              appointment: { date, window },
              status: r.status === 'Requested' ? 'Scheduled' : r.status,
            },
            'Appointment scheduled',
            'JGL Dispatch',
            r.status === 'Requested' ? 'Scheduled' : r.status,
            `${date}, ${window}`,
          ),
        (r, s) => ({
          channel: 'SMS',
          to: customerPhone(s, r.customerId),
          body: `JGL Repair ${r.id}: your visit is set for ${date}, ${window}. (mock)`,
          requestId: r.id,
        }),
      )
    },
    [patch],
  )

  const scheduleRepair = useCallback(
    (requestId: string, date: string, window: string) => {
      patch(
        requestId,
        (r) =>
          withEvent(
            { ...r, repairAppointment: { date, window }, status: 'Repair Scheduled' },
            'Repair scheduled',
            'JGL Dispatch',
            'Repair Scheduled',
            `${date}, ${window}`,
          ),
        (r, s) => ({
          channel: 'SMS',
          to: customerPhone(s, r.customerId),
          body: `JGL Repair ${r.id}: your repair visit is set for ${date}, ${window}. (mock)`,
          requestId: r.id,
        }),
      )
    },
    [patch],
  )

  const startJob = useCallback(
    (requestId: string) => {
      patch(
        requestId,
        (r) =>
          withEvent(
            { ...r, startedAt: stamp() },
            'Technician started the job',
            'Technician',
          ),
        (r, s) => ({
          channel: 'SMS',
          to: customerPhone(s, r.customerId),
          body: `JGL Repair ${r.id}: your technician has started work. (mock)`,
          requestId: r.id,
        }),
      )
    },
    [patch],
  )

  const setDiagnosis = useCallback(
    (requestId: string, diagnosis: string) => {
      patch(requestId, (r) =>
        withEvent(
          { ...r, diagnosis, status: 'Diagnosed' },
          'Diagnosis added',
          'Technician',
          'Diagnosed',
          diagnosis.slice(0, 80),
        ),
      )
    },
    [patch],
  )

  const addPart = useCallback(
    (requestId: string, part: Omit<Part, 'id' | 'status'>) => {
      patch(requestId, (r) => ({
        ...r,
        parts: [...r.parts, { ...part, id: uid('p'), status: 'Needed' }],
      }))
    },
    [patch],
  )

  const removePart = useCallback(
    (requestId: string, partId: string) => {
      patch(requestId, (r) => ({ ...r, parts: r.parts.filter((p) => p.id !== partId) }))
    },
    [patch],
  )

  const setPartStatus = useCallback(
    (requestId: string, partId: string, status: PartStatus, eta?: string) => {
      patch(requestId, (r) => ({
        ...r,
        parts: r.parts.map((p) => (p.id === partId ? { ...p, status, eta: eta ?? p.eta } : p)),
      }))
    },
    [patch],
  )

  const createEstimate = useCallback(
    (requestId: string, lines: Omit<EstimateLine, 'id'>[], note?: string) => {
      const built: EstimateLine[] = lines.map((l) => ({ ...l, id: uid('el') }))
      const estimate: Estimate = {
        id: uid('est'),
        lines: built,
        total: built.reduce((sum, l) => sum + l.amount, 0),
        status: 'Sent',
        createdAt: stamp(),
        note,
      }
      patch(
        requestId,
        (r) =>
          withEvent(
            { ...r, estimate, status: 'Estimate Ready' },
            'Estimate sent',
            'Technician',
            'Estimate Ready',
            `Total $${estimate.total.toFixed(2)}`,
          ),
        (r, s) => ({
          channel: 'SMS',
          to: customerPhone(s, r.customerId),
          body: `JGL Repair ${r.id}: your estimate of $${estimate.total.toFixed(2)} is ready to review. (mock)`,
          requestId: r.id,
        }),
      )
    },
    [patch],
  )

  const decideEstimate = useCallback(
    (requestId: string, decision: 'Approved' | 'Declined', note?: string) => {
      patch(
        requestId,
        (r) => {
          if (!r.estimate) return r
          const estimate: Estimate = {
            ...r.estimate,
            status: decision,
            decidedAt: stamp(),
            note: note ?? r.estimate.note,
          }
          const status: JobStatus = decision === 'Approved' ? 'Approved' : r.status
          return withEvent(
            { ...r, estimate, status },
            decision === 'Approved' ? 'Estimate approved by customer' : 'Estimate declined by customer',
            'Customer',
            status,
            `Total $${estimate.total.toFixed(2)}`,
          )
        },
        (r) => ({
          channel: 'SMS',
          to: 'JGL Dispatch',
          body: `${r.id}: customer ${decision.toLowerCase()} the estimate. (mock)`,
          requestId: r.id,
        }),
      )
    },
    [patch],
  )

  const markPartsOrdered = useCallback(
    (requestId: string, eta: string) => {
      patch(
        requestId,
        (r) =>
          withEvent(
            {
              ...r,
              status: 'Part Ordered',
              parts: r.parts.map((p) => (p.status === 'Needed' ? { ...p, status: 'Ordered', eta } : p)),
            },
            'Part ordered',
            'Technician',
            'Part Ordered',
            `Expected ${eta}`,
          ),
        (r, s) => ({
          channel: 'SMS',
          to: customerPhone(s, r.customerId),
          body: `JGL Repair ${r.id}: your part is on order, expected ${eta}. We will call to schedule the install. (mock)`,
          requestId: r.id,
        }),
      )
    },
    [patch],
  )

  const completeRepair = useCallback(
    (requestId: string, summary: string) => {
      patch(
        requestId,
        (r) =>
          withEvent(
            {
              ...r,
              status: 'Completed',
              completedAt: stamp(),
              parts: r.parts.map((p) => ({ ...p, status: 'Installed' as PartStatus })),
              payment: r.estimate
                ? {
                    status: 'Paid (mock)',
                    method: 'Card ending 4242 (mock)',
                    amount: r.estimate.total,
                    at: stamp(),
                  }
                : r.payment,
            },
            'Repair completed',
            'Technician',
            'Completed',
            summary,
          ),
        (r, s) => ({
          channel: 'SMS',
          to: customerPhone(s, r.customerId),
          body: `JGL Repair ${r.id}: your repair is complete. Receipt sent by email. (mock)`,
          requestId: r.id,
        }),
      )
    },
    [patch],
  )

  const setActiveCustomer = useCallback((id: string) => {
    setState((prev) => ({ ...prev, activeCustomerId: id }))
  }, [])

  const setActiveTechnician = useCallback((id: string) => {
    setState((prev) => ({ ...prev, activeTechnicianId: id }))
  }, [])

  const resetDemo = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.setItem(SEEDED_KEY, todayISO())
    setState(buildSeedState())
    setStorageWarning(null)
  }, [])

  const value = useMemo<PortalApi>(
    () => ({
      state,
      storageWarning,
      createRequest,
      addMessage,
      addPhoto,
      removePhoto,
      assignTechnician,
      scheduleVisit,
      scheduleRepair,
      startJob,
      setDiagnosis,
      addPart,
      removePart,
      setPartStatus,
      createEstimate,
      decideEstimate,
      markPartsOrdered,
      completeRepair,
      setStatus,
      setActiveCustomer,
      setActiveTechnician,
      resetDemo,
      dismissStorageWarning: () => setStorageWarning(null),
    }),
    [
      state,
      storageWarning,
      createRequest,
      addMessage,
      addPhoto,
      removePhoto,
      assignTechnician,
      scheduleVisit,
      scheduleRepair,
      startJob,
      setDiagnosis,
      addPart,
      removePart,
      setPartStatus,
      createEstimate,
      decideEstimate,
      markPartsOrdered,
      completeRepair,
      setStatus,
      setActiveCustomer,
      setActiveTechnician,
      resetDemo,
    ],
  )

  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>
}

export function usePortal() {
  const ctx = useContext(PortalContext)
  if (!ctx) throw new Error('usePortal must be used inside <PortalProvider>')
  return ctx
}
