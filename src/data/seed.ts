import type {
  Appliance,
  Customer,
  Estimate,
  EstimateLine,
  JobStatus,
  Message,
  Part,
  PortalState,
  ServiceRequest,
  Technician,
  TimelineEvent,
  Urgency,
} from '../types'
import { dayOffset } from '../lib/format'

/** Build an ISO timestamp from a yyyy-mm-dd day + 24h clock time. */
const at = (day: string, time = '09:00') => {
  const [y, m, d] = day.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  return new Date(y, m - 1, d, hh, mm).toISOString()
}

export const technicians: Technician[] = [
  {
    id: 't1',
    name: 'Ray Alston',
    initials: 'RA',
    title: 'Master Technician',
    phone: '(704) 555-0148',
    rating: 4.9,
    jobsCompleted: 1284,
    specialties: ['Refrigerator', 'Dishwasher'],
    tint: 'bg-brand-100 text-brand-800 border-brand-200',
  },
  {
    id: 't2',
    name: 'Marcus Bell',
    initials: 'MB',
    title: 'Senior Technician',
    phone: '(704) 555-0192',
    rating: 4.8,
    jobsCompleted: 906,
    specialties: ['Washer', 'Dryer'],
    tint: 'bg-flame-100 text-flame-700 border-flame-200',
  },
  {
    id: 't3',
    name: 'Tasha Nguyen',
    initials: 'TN',
    title: 'Appliance Technician',
    phone: '(704) 555-0117',
    rating: 4.9,
    jobsCompleted: 512,
    specialties: ['Oven', 'Range', 'Dishwasher'],
    tint: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
]

export const customers: Customer[] = [
  {
    id: 'c1',
    name: 'Dana Whitfield',
    phone: '(704) 555-0163',
    email: 'dana.whitfield@example.com',
    address: '1418 Winterfield Place',
    city: 'Charlotte',
    state: 'NC',
    zip: '28205',
    since: '2021-04-12',
  },
  {
    id: 'c2',
    name: 'Priya Raman',
    phone: '(704) 555-0184',
    email: 'priya.raman@example.com',
    address: '6220 Sardis Road',
    city: 'Charlotte',
    state: 'NC',
    zip: '28270',
    since: '2022-09-02',
  },
  {
    id: 'c3',
    name: 'Andre Lassiter',
    phone: '(704) 555-0121',
    email: 'andre.lassiter@example.com',
    address: '3105 Beatties Ford Road',
    city: 'Charlotte',
    state: 'NC',
    zip: '28216',
    since: '2023-01-19',
  },
  {
    id: 'c4',
    name: 'Megan Cortez',
    phone: '(704) 555-0139',
    email: 'megan.cortez@example.com',
    address: '819 Providence Road',
    city: 'Charlotte',
    state: 'NC',
    zip: '28207',
    since: '2020-06-30',
  },
  {
    id: 'c5',
    name: 'Ben Okafor',
    phone: '(704) 555-0175',
    email: 'ben.okafor@example.com',
    address: '12040 Copper Way',
    city: 'Charlotte',
    state: 'NC',
    zip: '28277',
    since: '2024-03-08',
  },
  {
    id: 'c6',
    name: 'Sylvia Grant',
    phone: '(704) 555-0110',
    email: 'sylvia.grant@example.com',
    address: '245 Matheson Avenue',
    city: 'Charlotte',
    state: 'NC',
    zip: '28206',
    since: '2019-11-15',
  },
]

export const appliances: Appliance[] = [
  // Demo customer (c1) - the appliance list shown in "My Appliances"
  {
    id: 'a1',
    customerId: 'c1',
    type: 'Refrigerator',
    brand: 'Samsung',
    model: 'RF28R7351SG',
    serial: '0H4K7BCT300142',
    purchasedYear: 2019,
    location: 'Kitchen',
  },
  {
    id: 'a2',
    customerId: 'c1',
    type: 'Dryer',
    brand: 'Whirlpool',
    model: 'WED5620HW',
    serial: 'MJ2210A0417',
    purchasedYear: 2020,
    location: 'Laundry room',
  },
  {
    id: 'a3',
    customerId: 'c1',
    type: 'Dishwasher',
    brand: 'GE',
    model: 'GDT695SSJSS',
    serial: 'FL814392B',
    purchasedYear: 2018,
    location: 'Kitchen',
  },
  // Other customers
  { id: 'a4', customerId: 'c2', type: 'Washer', brand: 'LG', model: 'WM3900HWA', serial: 'LG9938217', purchasedYear: 2021, location: 'Laundry room' },
  { id: 'a5', customerId: 'c2', type: 'Dishwasher', brand: 'Kenmore', model: '665.13473', serial: 'KM7712004', purchasedYear: 2017, location: 'Kitchen' },
  { id: 'a6', customerId: 'c3', type: 'Dryer', brand: 'Whirlpool', model: 'WGD4950HW', serial: 'WP4410221', purchasedYear: 2019, location: 'Garage' },
  { id: 'a7', customerId: 'c3', type: 'Range', brand: 'Samsung', model: 'NE63T8111SS', serial: 'SM6021884', purchasedYear: 2022, location: 'Kitchen' },
  { id: 'a8', customerId: 'c4', type: 'Oven', brand: 'GE', model: 'JTS3000SNSS', serial: 'GE5518890', purchasedYear: 2020, location: 'Kitchen' },
  { id: 'a9', customerId: 'c4', type: 'Refrigerator', brand: 'Whirlpool', model: 'WRS588FIHZ', serial: 'WR2298013', purchasedYear: 2021, location: 'Kitchen' },
  { id: 'a10', customerId: 'c5', type: 'Refrigerator', brand: 'Frigidaire', model: 'FRSS2623AS', serial: 'FG8890231', purchasedYear: 2018, location: 'Kitchen' },
  { id: 'a11', customerId: 'c5', type: 'Dryer', brand: 'GE', model: 'GTD42EASJWW', serial: 'GE1120973', purchasedYear: 2019, location: 'Laundry room' },
  { id: 'a12', customerId: 'c6', type: 'Washer', brand: 'Maytag', model: 'MVW6230HW', serial: 'MT7781200', purchasedYear: 2020, location: 'Laundry room' },
  { id: 'a13', customerId: 'c6', type: 'Oven', brand: 'Amana', model: 'AER6303MFS', serial: 'AM3391027', purchasedYear: 2016, location: 'Kitchen' },
]

let seq = 0
const sid = (p: string) => {
  seq += 1
  return `${p}_seed${seq}`
}

const ev = (
  label: string,
  day: string,
  time: string,
  by: string,
  status?: JobStatus,
  detail?: string,
): TimelineEvent => ({
  id: sid('ev'),
  label,
  detail,
  at: at(day, time),
  by,
  status,
})

const msg = (
  author: Message['author'],
  authorName: string,
  body: string,
  day: string,
  time: string,
): Message => ({
  id: sid('m'),
  author,
  authorName,
  body,
  at: at(day, time),
  smsMock: author !== 'Customer',
})

const estimate = (
  lines: [string, EstimateLine['kind'], number][],
  status: Estimate['status'],
  day: string,
  time = '13:30',
  note?: string,
): Estimate => {
  const built: EstimateLine[] = lines.map(([label, kind, amount]) => ({
    id: sid('el'),
    label,
    kind,
    amount,
  }))
  return {
    id: sid('est'),
    lines: built,
    total: built.reduce((sum, l) => sum + l.amount, 0),
    status,
    createdAt: at(day, time),
    decidedAt: status === 'Approved' || status === 'Declined' ? at(day, '15:05') : undefined,
    note,
  }
}

const part = (
  name: string,
  partNumber: string,
  price: number,
  status: Part['status'],
  eta?: string,
): Part => ({
  id: sid('p'),
  name,
  partNumber,
  price,
  quantity: 1,
  status,
  eta,
  supplier: 'Marcone Supply (mock)',
})

interface Draft {
  n: number
  customerId: string
  applianceId: string
  problem: string
  problemDetail: string
  status: JobStatus
  urgency?: Urgency
  technicianId?: string
  day: string
  window: string
  repair?: { date: string; window: string }
  diagnosis?: string
  parts?: Part[]
  estimate?: Estimate
  messages?: Message[]
  timeline: TimelineEvent[]
  createdDay: string
  completedDay?: string
  paid?: number
}

const build = (d: Draft): ServiceRequest => ({
  id: `JGL-${d.n}`,
  customerId: d.customerId,
  applianceId: d.applianceId,
  problem: d.problem,
  problemDetail: d.problemDetail,
  urgency: d.urgency ?? 'standard',
  status: d.status,
  technicianId: d.technicianId,
  appointment: { date: d.day, window: d.window },
  repairAppointment: d.repair,
  diagnosis: d.diagnosis,
  photos: [],
  parts: d.parts ?? [],
  estimate: d.estimate,
  messages: d.messages ?? [],
  timeline: d.timeline,
  createdAt: at(d.createdDay, '08:12'),
  completedAt: d.completedDay ? at(d.completedDay, '16:20') : undefined,
  payment: d.paid
    ? {
        status: 'Paid (mock)',
        method: 'Card ending 4242 (mock)',
        amount: d.paid,
        at: at(d.completedDay ?? d.day, '16:35'),
      }
    : undefined,
})

const T = dayOffset(0)
const TOMORROW = dayOffset(1)

export const seedRequests = (): ServiceRequest[] => [
  // ---------- Demo customer service history ----------
  build({
    n: 1028,
    customerId: 'c1',
    applianceId: 'a1',
    problem: 'Ice maker not working',
    problemDetail: 'Ice maker stopped dropping cubes, water dispenser still works.',
    status: 'Completed',
    technicianId: 't1',
    day: dayOffset(-243),
    window: '10:00 AM - 12:00 PM',
    createdDay: dayOffset(-246),
    completedDay: dayOffset(-243),
    diagnosis: 'Ice maker auger motor seized. Replaced assembly and verified 3 harvest cycles.',
    parts: [part('Ice maker assembly', 'DA97-15217D', 168, 'Installed')],
    estimate: estimate(
      [
        ['Diagnostic', 'diagnostic', 85],
        ['Ice maker assembly', 'part', 168],
        ['Labor (1.0 hr)', 'labor', 110],
      ],
      'Approved',
      dayOffset(-243),
    ),
    paid: 363,
    timeline: [
      ev('Request received', dayOffset(-246), '08:12', 'Customer portal', 'Requested'),
      ev('Repair completed', dayOffset(-243), '16:20', 'Ray Alston', 'Completed'),
    ],
  }),
  build({
    n: 1031,
    customerId: 'c1',
    applianceId: 'a2',
    problem: 'Not heating',
    problemDetail: 'Dryer tumbles but clothes come out damp after a full cycle.',
    status: 'Completed',
    technicianId: 't2',
    day: dayOffset(-96),
    window: '8:00 AM - 10:00 AM',
    createdDay: dayOffset(-99),
    completedDay: dayOffset(-96),
    diagnosis:
      'Open heating element and failed thermal fuse. Replaced both, cleaned lint from the vent run.',
    parts: [part('Dryer heating element', 'WP279838', 96, 'Installed')],
    estimate: estimate(
      [
        ['Diagnostic', 'diagnostic', 85],
        ['Heating element + thermal fuse', 'part', 96],
        ['Labor (0.75 hr)', 'labor', 95],
      ],
      'Approved',
      dayOffset(-96),
    ),
    paid: 276,
    timeline: [
      ev('Request received', dayOffset(-99), '08:12', 'Customer portal', 'Requested'),
      ev('Repair completed', dayOffset(-96), '16:20', 'Marcus Bell', 'Completed'),
    ],
  }),
  build({
    n: 1035,
    customerId: 'c1',
    applianceId: 'a3',
    problem: 'Leaking',
    problemDetail: 'Small puddle under the front left corner after every wash.',
    status: 'Completed',
    technicianId: 't3',
    day: dayOffset(-31),
    window: '2:00 PM - 4:00 PM',
    createdDay: dayOffset(-34),
    completedDay: dayOffset(-31),
    diagnosis: 'Cracked door gasket at the lower corner. Replaced gasket and ran a leak test cycle.',
    parts: [part('Door gasket', 'WD08X26433', 74, 'Installed')],
    estimate: estimate(
      [
        ['Diagnostic', 'diagnostic', 85],
        ['Door gasket', 'part', 74],
        ['Labor (0.75 hr)', 'labor', 95],
      ],
      'Approved',
      dayOffset(-31),
    ),
    paid: 254,
    timeline: [
      ev('Request received', dayOffset(-34), '08:12', 'Customer portal', 'Requested'),
      ev('Repair completed', dayOffset(-31), '16:20', 'Tasha Nguyen', 'Completed'),
    ],
  }),

  // ---------- Demo customer's ACTIVE request (portal centerpiece) ----------
  build({
    n: 1039,
    customerId: 'c1',
    applianceId: 'a1',
    problem: 'Not cooling',
    problemDetail:
      'Fridge section is warm but the freezer still makes ice. Started two days ago and milk is spoiling overnight.',
    status: 'Estimate Ready',
    technicianId: 't1',
    day: T,
    window: '10:00 AM - 12:00 PM',
    createdDay: dayOffset(-2),
    diagnosis:
      'Evaporator fan motor has failed - no airflow from the freezer into the fresh food section. Coils are clear; compressor and start relay test good. Recommend evaporator fan motor replacement.',
    parts: [part('Evaporator fan motor', 'DA31-00146E', 195, 'Needed', dayOffset(2))],
    estimate: estimate(
      [
        ['Diagnostic', 'diagnostic', 85],
        ['Replacement Part', 'part', 195],
        ['Labor', 'labor', 160],
      ],
      'Sent',
      T,
      '11:40',
      'Estimate valid for 30 days. Part is in stock at our supplier with 1-2 day delivery.',
    ),
    messages: [
      msg(
        'Dispatch',
        'JGL Dispatch',
        'You are confirmed for today, 10:00 AM - 12:00 PM. Ray is your technician.',
        dayOffset(-1),
        '17:02',
      ),
      msg('Technician', 'Ray Alston', 'On my way - about 15 minutes out.', T, '09:48'),
      msg(
        'Technician',
        'Ray Alston',
        'Diagnosis is done. I sent over an estimate for the evaporator fan motor - happy to walk through it.',
        T,
        '11:41',
      ),
    ],
    timeline: [
      ev('Request received', dayOffset(-2), '08:12', 'Customer portal', 'Requested', 'Submitted online'),
      ev('Appointment scheduled', dayOffset(-2), '09:30', 'JGL Dispatch', 'Scheduled', 'Today, 10:00 AM - 12:00 PM'),
      ev('Technician assigned', dayOffset(-1), '16:45', 'JGL Dispatch', 'Technician Assigned', 'Ray Alston - Master Technician'),
      ev('Technician arrived', T, '10:05', 'Ray Alston'),
      ev('Diagnosis added', T, '11:22', 'Ray Alston', 'Diagnosed', 'Evaporator fan motor failure'),
      ev('Estimate sent', T, '11:40', 'Ray Alston', 'Estimate Ready', 'Total $440.00'),
    ],
  }),

  // ---------- Other customers: fills the dispatch board + admin metrics ----------
  build({
    n: 1029,
    customerId: 'c2',
    applianceId: 'a4',
    problem: 'Not spinning',
    problemDetail: 'Drum fills and drains but never spins out.',
    status: 'Completed',
    technicianId: 't2',
    day: dayOffset(-12),
    window: '8:00 AM - 10:00 AM',
    createdDay: dayOffset(-14),
    completedDay: dayOffset(-12),
    diagnosis: 'Worn drive belt and rotor position sensor. Replaced both.',
    parts: [part('Washer drive belt', 'W10006384', 42, 'Installed')],
    estimate: estimate(
      [
        ['Diagnostic', 'diagnostic', 85],
        ['Drive belt + rotor sensor', 'part', 142],
        ['Labor (1.0 hr)', 'labor', 120],
      ],
      'Approved',
      dayOffset(-12),
    ),
    paid: 347,
    timeline: [ev('Repair completed', dayOffset(-12), '16:20', 'Marcus Bell', 'Completed')],
  }),
  build({
    n: 1030,
    customerId: 'c3',
    applianceId: 'a6',
    problem: 'Making noise',
    problemDetail: 'Loud thumping from the back of the dryer whenever it runs.',
    status: 'Completed',
    technicianId: 't2',
    day: T,
    window: '8:00 AM - 10:00 AM',
    createdDay: dayOffset(-4),
    completedDay: T,
    diagnosis: 'Drum support rollers worn flat. Replaced the roller kit and belt.',
    parts: [part('Drum roller kit', 'W10314173', 88, 'Installed')],
    estimate: estimate(
      [
        ['Diagnostic', 'diagnostic', 85],
        ['Drum roller kit', 'part', 88],
        ['Labor (1.0 hr)', 'labor', 120],
      ],
      'Approved',
      dayOffset(-1),
    ),
    paid: 293,
    timeline: [
      ev('Request received', dayOffset(-4), '08:12', 'Customer portal', 'Requested'),
      ev('Repair completed', T, '09:40', 'Marcus Bell', 'Completed'),
    ],
  }),
  build({
    n: 1032,
    customerId: 'c4',
    applianceId: 'a8',
    problem: 'Not heating',
    problemDetail: 'Oven preheats to 200F then stalls. Broiler works fine.',
    status: 'Part Ordered',
    technicianId: 't3',
    day: dayOffset(-2),
    window: '12:00 PM - 2:00 PM',
    repair: { date: dayOffset(2), window: '10:00 AM - 12:00 PM' },
    createdDay: dayOffset(-4),
    diagnosis: 'Weak bake igniter - draws 2.9A, below the 3.2A threshold needed to open the gas valve.',
    parts: [part('Oven igniter', 'WB13K21', 132, 'Ordered', dayOffset(1))],
    estimate: estimate(
      [
        ['Diagnostic', 'diagnostic', 85],
        ['Oven igniter', 'part', 132],
        ['Labor (1.0 hr)', 'labor', 130],
      ],
      'Approved',
      dayOffset(-2),
    ),
    timeline: [
      ev('Estimate approved', dayOffset(-2), '15:05', 'Megan Cortez', 'Approved'),
      ev('Part ordered', dayOffset(-1), '09:15', 'JGL Dispatch', 'Part Ordered', 'Mock supplier order placed'),
    ],
  }),
  build({
    n: 1033,
    customerId: 'c5',
    applianceId: 'a10',
    problem: 'Not cooling',
    problemDetail: 'Whole unit is warm and food is spoiling. Household has an infant - urgent.',
    status: 'Technician Assigned',
    urgency: 'emergency',
    technicianId: 't1',
    day: T,
    window: '2:00 PM - 4:00 PM',
    createdDay: dayOffset(-1),
    messages: [
      msg('Dispatch', 'JGL Dispatch', 'Flagged as an emergency - Ray will be out this afternoon.', dayOffset(-1), '18:20'),
    ],
    timeline: [
      ev('Request received', dayOffset(-1), '17:55', 'Customer portal', 'Requested', 'Emergency request'),
      ev('Technician assigned', dayOffset(-1), '18:20', 'JGL Dispatch', 'Technician Assigned', 'Ray Alston'),
    ],
  }),
  build({
    n: 1034,
    customerId: 'c6',
    applianceId: 'a12',
    problem: 'Leaking',
    problemDetail: 'Water running across the laundry room floor mid-cycle. I shut the valve off.',
    status: 'Requested',
    urgency: 'emergency',
    day: T,
    window: '4:00 PM - 6:00 PM',
    createdDay: T,
    timeline: [ev('Request received', T, '07:41', 'Customer portal', 'Requested', 'Emergency request')],
  }),
  build({
    n: 1036,
    customerId: 'c2',
    applianceId: 'a5',
    problem: 'Error code',
    problemDetail: 'Panel flashes F7 E1 and the cycle stops halfway.',
    status: 'Diagnosed',
    technicianId: 't3',
    day: T,
    window: '10:00 AM - 12:00 PM',
    createdDay: dayOffset(-3),
    diagnosis: 'F7 E1 = motor speed fault. Drain pump is partially blocked and drawing high current.',
    parts: [part('Drain pump', 'W10348269', 124, 'Needed')],
    timeline: [
      ev('Technician arrived', T, '10:12', 'Tasha Nguyen'),
      ev('Diagnosis added', T, '10:50', 'Tasha Nguyen', 'Diagnosed', 'Drain pump fault'),
    ],
  }),
  build({
    n: 1037,
    customerId: 'c3',
    applianceId: 'a7',
    problem: 'Error code',
    problemDetail: 'Range shows SE on the display and the touch panel stops responding.',
    status: 'Scheduled',
    day: TOMORROW,
    window: '8:00 AM - 10:00 AM',
    createdDay: dayOffset(-1),
    timeline: [
      ev('Request received', dayOffset(-1), '13:30', 'Customer portal', 'Requested'),
      ev('Appointment scheduled', dayOffset(-1), '14:02', 'JGL Dispatch', 'Scheduled'),
    ],
  }),
  build({
    n: 1038,
    customerId: 'c4',
    applianceId: 'a9',
    problem: 'Making noise',
    problemDetail: 'Loud buzzing from the back that comes and goes every few minutes.',
    status: 'Estimate Ready',
    technicianId: 't1',
    day: T,
    window: '8:00 AM - 10:00 AM',
    createdDay: dayOffset(-2),
    diagnosis: 'Condenser fan blade striking the shroud; the bearing is failing. Replace the fan motor assembly.',
    parts: [part('Condenser fan motor', 'W10822259', 118, 'Needed')],
    estimate: estimate(
      [
        ['Diagnostic', 'diagnostic', 85],
        ['Condenser fan motor', 'part', 118],
        ['Labor (1.0 hr)', 'labor', 130],
      ],
      'Sent',
      T,
      '09:25',
    ),
    timeline: [ev('Estimate sent', T, '09:25', 'Ray Alston', 'Estimate Ready', 'Total $333.00')],
  }),
  build({
    n: 1040,
    customerId: 'c5',
    applianceId: 'a11',
    problem: 'Not spinning',
    problemDetail: 'Motor hums but the drum will not turn.',
    status: 'Approved',
    technicianId: 't2',
    day: T,
    window: '12:00 PM - 2:00 PM',
    createdDay: dayOffset(-2),
    diagnosis: 'Seized idler pulley and a stretched belt.',
    parts: [part('Idler pulley + belt kit', 'WE12M29', 64, 'Needed')],
    estimate: estimate(
      [
        ['Diagnostic', 'diagnostic', 85],
        ['Idler pulley + belt kit', 'part', 64],
        ['Labor (0.75 hr)', 'labor', 95],
      ],
      'Approved',
      T,
      '12:40',
    ),
    timeline: [ev('Estimate approved', T, '13:05', 'Ben Okafor', 'Approved')],
  }),
  build({
    n: 1041,
    customerId: 'c6',
    applianceId: 'a13',
    problem: 'Not heating',
    problemDetail: 'Bake element glows in spots only and food comes out raw in the middle.',
    status: 'Repair Scheduled',
    technicianId: 't2',
    day: dayOffset(-5),
    window: '2:00 PM - 4:00 PM',
    repair: { date: TOMORROW, window: '12:00 PM - 2:00 PM' },
    createdDay: dayOffset(-7),
    diagnosis: 'Bake element has burned through at the rear bend. Replacement required.',
    parts: [part('Bake element', 'W10310274', 78, 'Received')],
    estimate: estimate(
      [
        ['Diagnostic', 'diagnostic', 85],
        ['Bake element', 'part', 78],
        ['Labor (0.75 hr)', 'labor', 95],
      ],
      'Approved',
      dayOffset(-5),
    ),
    timeline: [
      ev('Part received', dayOffset(-1), '11:00', 'JGL Dispatch'),
      ev('Repair scheduled', dayOffset(-1), '11:10', 'JGL Dispatch', 'Repair Scheduled', 'Tomorrow, 12:00 PM - 2:00 PM'),
    ],
  }),
]

export const buildSeedState = (): PortalState => ({
  customers,
  technicians,
  appliances,
  requests: seedRequests(),
  nextRequestNumber: 1042,
  activeCustomerId: 'c1',
  activeTechnicianId: 't1',
  notifications: [],
})
