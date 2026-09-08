import type { JobStatus, PortalState, ServiceRequest } from '../types'
import { JOB_STATUSES } from '../types'
import { todayISO, windowStartMinutes } from '../lib/format'

export const OPEN_STATUSES: JobStatus[] = JOB_STATUSES.filter((s) => s !== 'Completed')

export const statusIndex = (status: JobStatus) => JOB_STATUSES.indexOf(status)

export const getCustomer = (s: PortalState, id: string) => s.customers.find((c) => c.id === id)
export const getTechnician = (s: PortalState, id?: string) =>
  id ? s.technicians.find((t) => t.id === id) : undefined
export const getAppliance = (s: PortalState, id: string) => s.appliances.find((a) => a.id === id)
export const getRequest = (s: PortalState, id: string) => s.requests.find((r) => r.id === id)

export const applianceLabel = (s: PortalState, request: ServiceRequest) => {
  const a = getAppliance(s, request.applianceId)
  return a ? `${a.brand} ${a.type}` : 'Appliance'
}

/** The date a job is "on the board" for: the repair visit if one is set, else the first visit. */
export const boardDate = (r: ServiceRequest) => r.repairAppointment?.date ?? r.appointment.date
export const boardWindow = (r: ServiceRequest) => r.repairAppointment?.window ?? r.appointment.window

export const byWindow = (a: ServiceRequest, b: ServiceRequest) =>
  windowStartMinutes(boardWindow(a)) - windowStartMinutes(boardWindow(b))

export const jobsOnDay = (s: PortalState, day: string, technicianId?: string) =>
  s.requests
    .filter((r) => boardDate(r) === day)
    .filter((r) => (technicianId ? r.technicianId === technicianId : true))
    .sort(byWindow)

export const customerRequests = (s: PortalState, customerId: string) =>
  s.requests
    .filter((r) => r.customerId === customerId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))

export const activeCustomerRequests = (s: PortalState) =>
  customerRequests(s, s.activeCustomerId).filter((r) => r.status !== 'Completed')

export const applianceHistory = (s: PortalState, applianceId: string) =>
  s.requests
    .filter((r) => r.applianceId === applianceId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))

export const revenueOf = (r: ServiceRequest) =>
  r.payment?.amount ?? (r.status === 'Completed' ? (r.estimate?.total ?? 0) : 0)

export interface AdminMetrics {
  today: ServiceRequest[]
  emergencies: ServiceRequest[]
  awaitingApproval: ServiceRequest[]
  partsOrdered: ServiceRequest[]
  completedToday: ServiceRequest[]
  completedAll: ServiceRequest[]
  unassigned: ServiceRequest[]
  revenueToday: number
  revenueMonth: number
  revenueAll: number
  openJobs: ServiceRequest[]
  avgTicket: number
}

export const adminMetrics = (s: PortalState): AdminMetrics => {
  const day = todayISO()
  const month = day.slice(0, 7)
  const completedAll = s.requests.filter((r) => r.status === 'Completed')
  const completedToday = completedAll.filter((r) => (r.completedAt ?? '').slice(0, 10) === day)
  const revenueOfList = (list: ServiceRequest[]) => list.reduce((sum, r) => sum + revenueOf(r), 0)

  return {
    today: jobsOnDay(s, day),
    emergencies: s.requests.filter((r) => r.urgency === 'emergency' && r.status !== 'Completed'),
    awaitingApproval: s.requests.filter((r) => r.estimate?.status === 'Sent'),
    partsOrdered: s.requests.filter((r) => r.parts.some((p) => p.status === 'Ordered')),
    completedToday,
    completedAll,
    unassigned: s.requests.filter((r) => !r.technicianId && r.status !== 'Completed'),
    revenueToday: revenueOfList(completedToday),
    revenueMonth: revenueOfList(
      completedAll.filter((r) => (r.completedAt ?? '').slice(0, 7) === month),
    ),
    revenueAll: revenueOfList(completedAll),
    openJobs: s.requests.filter((r) => r.status !== 'Completed'),
    avgTicket: completedAll.length ? revenueOfList(completedAll) / completedAll.length : 0,
  }
}

/** What the customer should be nudged to do next, if anything. */
export const nextCustomerAction = (r: ServiceRequest) => {
  if (r.estimate?.status === 'Sent') return 'Estimate ready - approve or decline'
  if (r.status === 'Requested') return 'Waiting on dispatch to confirm'
  if (r.status === 'Part Ordered') return 'Part on order - we will schedule the install'
  return null
}
