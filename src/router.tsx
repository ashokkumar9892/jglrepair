import { createBrowserRouter } from 'react-router-dom'
import DemoMenu from './pages/DemoMenu'
import NotFound from './pages/NotFound'
import CustomerHome from './pages/customer/CustomerHome'
import NewRequest from './pages/customer/NewRequest'
import RequestDetail from './pages/customer/RequestDetail'
import Appliances from './pages/customer/Appliances'
import ApplianceDetail from './pages/customer/ApplianceDetail'
import TechToday from './pages/tech/TechToday'
import TechJob from './pages/tech/TechJob'
import TechSchedule from './pages/tech/TechSchedule'
import TechParts from './pages/tech/TechParts'
import AdminHome from './pages/admin/AdminHome'
import Dispatch from './pages/admin/Dispatch'
import AdminJobs from './pages/admin/AdminJobs'
import AdminJobDetail from './pages/admin/AdminJobDetail'

export const router = createBrowserRouter([
  { path: '/', element: <DemoMenu /> },

  { path: '/customer', element: <CustomerHome /> },
  { path: '/customer/new', element: <NewRequest /> },
  { path: '/customer/request/:id', element: <RequestDetail /> },
  { path: '/customer/appliances', element: <Appliances /> },
  { path: '/customer/appliances/:id', element: <ApplianceDetail /> },

  { path: '/tech', element: <TechToday /> },
  { path: '/tech/job/:id', element: <TechJob /> },
  { path: '/tech/schedule', element: <TechSchedule /> },
  { path: '/tech/parts', element: <TechParts /> },

  { path: '/admin', element: <AdminHome /> },
  { path: '/admin/dispatch', element: <Dispatch /> },
  { path: '/admin/jobs', element: <AdminJobs /> },
  { path: '/admin/jobs/:id', element: <AdminJobDetail /> },

  { path: '*', element: <NotFound /> },
])
