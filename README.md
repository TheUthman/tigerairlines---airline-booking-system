# TigerAirlines - Airline Booking System

Full-featured modern Airline Booking System frontend with Customer Portal and Admin Operations Console. Built with React 19, TypeScript, Vite, Tailwind CSS v4, Redux Toolkit, React Router v7, Recharts, and GSAP.

---

## Quick Start (Run Locally)

Follow these exact steps to run the application on your local machine:

### 1. Clone or Unzip
If you received the repository as a ZIP archive, extract it to your preferred directory:
```bash
cd tigerairlines---airline-booking-system
```

### 2. Install Dependencies
```bash
npm install
```
*(An `.npmrc` is included with `legacy-peer-deps=true` to ensure clean, conflict-free dependency resolution across all Node/npm versions).*

### 3. Start the Development Server
```bash
npm run dev
```

### 4. Open in Browser
The application will launch on:
👉 **`http://localhost:3000`**

---

## Mock Data & Backend Integration Guide

The frontend currently runs autonomously with a complete, realistic client-side mock data layer—**no backend server is required to test or demo any workflow**.

### Where Service Files Live
When the real REST API or backend microservices are ready, update the API services located in:
- `src/services/apiClient.ts` – Axios client instance configured with `VITE_API_BASE_URL` and JWT bearer token interceptors.
- `src/services/flightService.ts` – Flight searches, flight status, and airport directory.
- `src/services/bookingService.ts` – PNR creation, booking retrieval, and cancellations.
- `src/services/paymentService.ts` – Payment authorization and transaction logs.
- `src/services/passengerService.ts` – Passenger CRM and frequent flyer directory.
- `src/services/adminService.ts` – Executive KPI statistics, fleet management, and charts.

### Mock Data Files
All mock JSON fixtures are stored in:
- `src/mocks/` (`flights.json`, `airports.json`, `bookings.json`, `aircraft.json`, `passengers.json`, `admin-stats.json`, `payments.json`).

### Environment Variables
Copy `.env.example` to `.env` to configure your backend connection:
```bash
cp .env.example .env
```
```env
VITE_API_BASE_URL="http://localhost:8080/api/v1"
```

---

## Routes & Portal Map

### Customer Portal
- `/` – Homepage with Hero, Flight SearchWidget, Destinations, Bhutan Highlights, Deals, and Testimonials Carousel.
- `/search` – Flight search results with real-time stops, airline, and price filtering.
- `/book` – 4-Step Booking Wizard (Passengers → Seat Selection Map → Add-ons & Extras → Itinerary Review).
- `/payment` – Secure payment checkout with credit card input and instant confirmation.
- `/confirmation` – E-ticket and Boarding Pass with downloadable/printable ticket stubs and barcode.
- `/manage-booking` – Search by PNR and surname to review, print, or cancel reservations.
- `/flight-status` – Live flight status board with gate and delay indicators.
- `/destinations` – International route network from Paro International Airport.
- `/offers` – Seasonal promo codes and discounts.

### Staff Service Desk (Role Protected)

Staff and administrators can sign in to `/staff` to access service-desk tools:

- `/staff` – Flight schedule summary and service-desk shortcuts.
- `/staff/bookings` – Look up booking and flight details by PNR.
- `/staff/manifest` – Select a flight to view passenger names, booking
  references, seats, booking statuses, and check-in status/timestamps.
- `/staff/check-in` – Staff check-in guidance and link to booking lookup.
- `/staff/flights` – Flight schedules and current flight-status information.

The manifest uses the staff-only booking and passenger endpoints. It displays
passenger names but does not request or show passenger contact details or
identity-document data. Staff can mark a confirmed booking checked in from
booking lookup; check-in is persisted by the backend and recorded with a
timestamp. A checked-in booking is shown as checked in in the manifest.

### Admin Operations Console (Role Protected)
- `/admin/login` – Staff authentication with 1-click Administrator and Flight Dispatcher demo logins.
- `/admin` – Executive KPI dashboard, revenue graphs, occupancy load factors, and daily booking volume.
- `/admin/flights` – Flight schedule management (add, edit, cancel, filter, paginate flights).
- `/admin/aircraft` – Fleet registry (seat configurations, tail numbers, airworthiness status).
- `/admin/airports` – International destination hubs, IATA codes, and terminals.
- `/admin/passengers` – Passenger registry with frequent flyer tiers and passport records.
- `/admin/bookings` – PNR booking directory with real-time status management.

---

## Available Scripts

- `npm run dev` – Starts the local Vite development server on port 3000.
- `npm run build` – Bundles the production-ready build into `dist/`.
- `npm run preview` – Locally previews the production build.
- `npm run lint` – Runs TypeScript compilation type-checking with zero emit.
