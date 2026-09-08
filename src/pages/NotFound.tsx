import { Link } from 'react-router-dom'
import { DemoNotice } from '../components/ui'
import { Logo } from '../components/Logo'

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-ink-50">
      <DemoNotice />
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <Logo size={72} tone="dark" />
        <h1 className="mt-3 text-2xl font-extrabold text-ink-900">Page not found</h1>
        <p className="mt-2 text-sm text-ink-600">
          That screen is not part of this proof of concept. Head back to the demo menu to pick a
          view.
        </p>
        <Link to="/" className="btn-primary mt-6 w-full">
          Go to the POC demo menu
        </Link>
        <div className="mt-6">
          <DemoNotice tone="inline" />
        </div>
      </div>
    </div>
  )
}
