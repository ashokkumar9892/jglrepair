# JGL Repair — Service Management Portal (Unofficial POC)

> **Unofficial demonstration concept.** This is an independent, non-commercial design exercise
> built from publicly visible business information about an appliance repair shop in Charlotte, NC
> (appliance types serviced, brands serviced, service area). It is **not affiliated with, endorsed
> by, or connected to any real business**, contains **no proprietary data or source code**, and every
> customer, technician, address, phone number, job, price, and repair record in it is invented sample
> data.

A mobile-first proof of concept for running appliance repair service end to end: customer booking →
technician field work → back-office dispatch.

## Stack

React 18 · TypeScript · Vite 5 · Tailwind CSS 3 · `localStorage` persistence · Netlify-ready

No backend, no build-time services. All state lives in the visitor's browser.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production bundle into dist/
npm run preview  # serve the production build
```

## Deploy to Netlify

`netlify.toml` and `public/_redirects` are committed, so the defaults are already correct:

- Build command: `npm run build`
- Publish directory: `dist`
- SPA fallback: `/* → /index.html 200` (needed for deep links like `/customer/request/JGL-1039`)

## The three views

Everything is reachable from the **POC Demo Menu** at `/`, which also carries the guided 4-minute
demo script and a *Reset demo data* button.

### Customer portal (`/customer`)

- **New request wizard** (`/customer/new`) — appliance → brand → problem → photos → appointment →
  review. Appliance types: Refrigerator, Washer, Dryer, Dishwasher, Oven, Range. Problem presets per
  appliance (Not cooling, Leaking, Not spinning, Making noise, Not heating, Error code, …).
  Submitting generates the next ticket number — **#JGL-1042** on fresh demo data.
- **Dashboard** — active request hero card, technician, appointment, appliance, problem, estimate,
  messages, and full service history.
- **Request detail** (`/customer/request/:id`) — 9-step status tracker, estimate approve / decline /
  ask a question, message thread, photo upload, activity timeline, mocked payment record.
- **My appliances** (`/customer/appliances`) — Samsung Refrigerator, Whirlpool Dryer, GE Dishwasher,
  each with previous repairs, diagnoses, parts used, and spend.

### Technician mobile (`/tech`)

Phone-shaped job list for the day: customer, address, appliance, issue, time window. Per job
(`/tech/job/:id`): **Start Job**, **Add Diagnosis**, **Upload photo**, **Add parts**,
**Generate estimate**, **Mark part ordered**, **Schedule repair**, **Complete repair**, plus a
message thread with the customer and a parts pipeline (`/tech/parts`). Switch technicians from the
picker at the top of the job list.

### Admin & dispatch (`/admin`)

KPI dashboard — Today's Jobs, Emergency Requests, Awaiting Approval, Parts Ordered, Completed Jobs,
Revenue (today / month / all-time, plus average ticket) — with technician workload bars. The
**dispatch calendar** (`/admin/dispatch`) is a week strip plus a technician × time-window grid, with
an unassigned queue you can assign and schedule in place. `/admin/jobs` is the searchable,
filterable list of every ticket; each ticket has dispatch controls, a status override, and links
into both the technician and customer views of the same job.

## Status model

`Requested → Scheduled → Technician Assigned → Diagnosed → Estimate Ready → Approved → Part Ordered
→ Repair Scheduled → Completed`

The centerpiece ticket **#JGL-1039** sits at *Estimate Ready* with the estimate:

| Line             | Amount |
| ---------------- | -----: |
| Diagnostic       |   $85 |
| Replacement Part |  $195 |
| Labor            |  $160 |
| **Total**        | **$440** |

## Deliberately mocked

| Area           | What actually happens                                                     |
| -------------- | ------------------------------------------------------------------------- |
| Payments       | Completing a job writes a fake "Card ending 4242" record. No processor.    |
| SMS / email    | Notifications are generated in-app only. Nothing is sent anywhere.         |
| GPS / routing  | "On my way", ETA, and Navigate are simulated.                             |
| Database       | State is JSON in `localStorage` (`jgl-portal-state-v1`).                   |
| Authentication | No login. Roles are switched freely from the demo menu.                    |

Photos are downscaled and re-encoded in the browser before being stored, and the app warns you if
the storage quota is hit.

## Demo data notes

- Seeded with 14 service requests across 6 customers and 3 technicians; the next ticket is JGL-1042.
- Seed dates are relative to the day you first open the app, and are shifted forward automatically
  if you come back on a later day, so "Today's Jobs" is never empty.
- *Reset demo data* on the demo menu restores the original scenario.

## Project layout

```
src/
  components/    AppShell (header + bottom nav), ui primitives, panels (photos, messages, estimate)
  data/          catalog.ts (appliances, brands, problems, parts) · seed.ts (sample scenario)
  lib/           date/currency formatting, image compression, id generation
  pages/         DemoMenu · customer/ · tech/ · admin/
  store/         PortalContext (state + actions + persistence) · selectors (derived views)
  types.ts       domain model
```
