import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { PortalProvider } from './store/PortalContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PortalProvider>
      <RouterProvider router={router} />
    </PortalProvider>
  </React.StrictMode>,
)
