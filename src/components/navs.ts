import type { NavItem } from './AppShell'

export const CUSTOMER_NAV: NavItem[] = [
  { to: '/customer', label: 'My Service', icon: '🏠', end: true },
  { to: '/customer/new', label: 'New Request', icon: '➕' },
  { to: '/customer/appliances', label: 'Appliances', icon: '🧰' },
  { to: '/', label: 'Demo Menu', icon: '☰' },
]

export const TECH_NAV: NavItem[] = [
  { to: '/tech', label: "Today's Jobs", icon: '🧾', end: true },
  { to: '/tech/schedule', label: 'Schedule', icon: '📆' },
  { to: '/tech/parts', label: 'Parts', icon: '📦' },
  { to: '/', label: 'Demo Menu', icon: '☰' },
]

export const ADMIN_NAV: NavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/dispatch', label: 'Dispatch', icon: '🗓️' },
  { to: '/admin/jobs', label: 'All Jobs', icon: '📋' },
  { to: '/', label: 'Demo Menu', icon: '☰' },
]
