export const APPLIANCE_TYPES = [
  'Refrigerator',
  'Washer',
  'Dryer',
  'Dishwasher',
  'Oven',
  'Range',
  'Garbage Disposal',
] as const
export type ApplianceType = (typeof APPLIANCE_TYPES)[number]

export const JOB_STATUSES = [
  'Requested',
  'Scheduled',
  'Technician Assigned',
  'Diagnosed',
  'Estimate Ready',
  'Approved',
  'Part Ordered',
  'Repair Scheduled',
  'Completed',
] as const
export type JobStatus = (typeof JOB_STATUSES)[number]

export type Urgency = 'standard' | 'emergency'

export interface Customer {
  id: string
  name: string
  phone: string
  email: string
  address: string
  city: string
  state: string
  zip: string
  since: string
}

export interface Technician {
  id: string
  name: string
  initials: string
  title: string
  phone: string
  rating: number
  jobsCompleted: number
  specialties: ApplianceType[]
  /** Tailwind classes used for the dispatch calendar + avatars */
  tint: string
}

export interface Appliance {
  id: string
  customerId: string
  type: ApplianceType
  brand: string
  model: string
  serial: string
  purchasedYear: number
  location: string
}

export interface Photo {
  id: string
  dataUrl: string
  caption: string
  by: 'Customer' | 'Technician'
  at: string
}

export type PartStatus = 'Needed' | 'Ordered' | 'Received' | 'Installed'

export interface Part {
  id: string
  name: string
  partNumber: string
  price: number
  quantity: number
  status: PartStatus
  eta?: string
  supplier?: string
}

export type EstimateLineKind = 'diagnostic' | 'part' | 'labor' | 'other'

export interface EstimateLine {
  id: string
  label: string
  kind: EstimateLineKind
  amount: number
}

export type EstimateStatus = 'Draft' | 'Sent' | 'Approved' | 'Declined'

export interface Estimate {
  id: string
  lines: EstimateLine[]
  total: number
  status: EstimateStatus
  createdAt: string
  decidedAt?: string
  note?: string
}

export type MessageAuthor = 'Customer' | 'Technician' | 'Dispatch'

export interface Message {
  id: string
  author: MessageAuthor
  authorName: string
  body: string
  at: string
  /** true when the mock notification layer "sent an SMS" for this message */
  smsMock?: boolean
}

export interface TimelineEvent {
  id: string
  label: string
  detail?: string
  at: string
  by: string
  status?: JobStatus
}

export interface Appointment {
  /** ISO date, yyyy-mm-dd */
  date: string
  /** e.g. "8:00 AM - 10:00 AM" */
  window: string
}

export interface ServiceRequest {
  id: string
  customerId: string
  applianceId: string
  problem: string
  problemDetail: string
  urgency: Urgency
  status: JobStatus
  technicianId?: string
  appointment: Appointment
  repairAppointment?: Appointment
  diagnosis?: string
  photos: Photo[]
  parts: Part[]
  estimate?: Estimate
  messages: Message[]
  timeline: TimelineEvent[]
  createdAt: string
  startedAt?: string
  completedAt?: string
  /** Mocked payment record - no real processor is involved. */
  payment?: {
    status: 'Unpaid' | 'Paid (mock)'
    method: string
    amount: number
    at: string
  }
}

export interface PortalState {
  customers: Customer[]
  technicians: Technician[]
  appliances: Appliance[]
  requests: ServiceRequest[]
  /** next service request number, e.g. 1042 -> JGL-1042 */
  nextRequestNumber: number
  activeCustomerId: string
  activeTechnicianId: string
  /** mocked outbound notifications (SMS / email) */
  notifications: MockNotification[]
}

export interface MockNotification {
  id: string
  channel: 'SMS' | 'Email' | 'Push'
  to: string
  body: string
  at: string
  requestId?: string
}
