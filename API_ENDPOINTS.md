# API Endpoints Reference — Airline Booking System

This document lists the HTTP endpoints exposed by the microservices in the repository and how to reach them through the **API Gateway**.

> **Gateway URL:** `http://localhost:8080`
>
> The API Gateway is the only backend URL a frontend should call. It validates JWTs, enforces `ADMIN` roles, and routes requests to the appropriate business services.

---

## Table of Contents

- [Conventions](#conventions)
  - [Security Matrix](#security-matrix)
- [Auth Service](#auth-service-authservice)
- [Pricing Service](#pricing-service-pricing-service)
- [Passenger Service](#passenger-service-passenger-service)
- [Booking Service](#booking-service-booking-service)
- [Payment Service](#payment-service-payment-service)
- [Notification Service](#notification-service-notification-service)
- [Flight Service](#flight-service-flight-service)
  - [Airport & Aircraft Catalogue](#airport--aircraft-catalogue)
- [Admin Service](#admin-service-admin-service)
- [API Gateway](#api-gateway)
- [Common Headers](#common-headers)
- [Quick Testing with cURL](#quick-testing-with-curl)

---

## Conventions

### Authentication

Protected endpoints require:

```http
Authorization: Bearer <accessToken>
```

The following endpoint groups are public:

- Registration
- Login
- Refresh token
- Password reset / verification
- Payment initiation / webhook
- Flight search
- Gateway fallback endpoints

### Caller Identity

After JWT validation, the API Gateway sets:

```http
X-User-Email: <user-email>
X-User-Role: <user-role>
```

Clients **must not send these headers manually**.

### Admin Rights

Routes marked **ADMIN** require the JWT role to be `ADMIN`.

A non-admin request receives:

```http
403 Forbidden
```

### Error Format

All services return errors using the same structure:

```json
{
  "timestamp": "...",
  "status": 400,
  "error": "...",
  "message": "...",
  "path": "..."
}
```

---

## Security Matrix

| Endpoint Group | Access |
|---|---|
| `/api/auth/register` / `/login` / `/refresh` / `/forgot-password` / `/reset-password` / `/verification` / `/verification/confirm` | **Public** |
| `/api/payments/initiate` / `/api/payments/webhook` | **Public** — webhook additionally requires `X-Payment-Webhook-Secret` |
| `GET /api/flights/**` | **Public** |
| `GET /fallback/flight-service` | **Public** |
| `/actuator/**` | **Public** |
| `OPTIONS /**` | **Public** |
| `/api/auth/promote/**` / `/api/flights/admin/**` / `/api/admin/**` | **ADMIN only** |
| `/api/passengers/**` / `/api/bookings/**` / `POST /api/pricing/quote` | **Authenticated** |
| Payment history / refund / invoice | **Authenticated** |
| `/api/notifications/**` | **Authenticated** |

> **Payment note:** `POST /api/payments/initiate` is reachable without a token at the gateway, but the payer is taken from `X-User-Email`, which is normally injected from the JWT. A Bearer token is therefore still required for the payment to belong to a real account.

---

# Auth Service — `authservice`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new user and issue access + refresh tokens. |
| `POST` | `/api/auth/login` | Public | Authenticate with email/password and receive tokens. |
| `POST` | `/api/auth/refresh` | Public | Exchange a refresh token for a new access token. |
| `GET` | `/api/auth/users` | **ADMIN** | List registered users. |
| `PUT` | `/api/auth/users/{userId}/role` | **ADMIN** | Update a user's role. |
| `POST` | `/api/auth/promote/{userId}` | **ADMIN** | Promote or assign a role to an existing user. |
| `POST` | `/api/auth/forgot-password` | Public | Request a password-reset email for an account, if it exists. |
| `POST` | `/api/auth/reset-password` | Public | Set a new password using the emailed reset token. |
| `POST` | `/api/auth/verification` | Public | Request the account-verification email. |
| `POST` | `/api/auth/verification/confirm` | Public | Verify an account using the emailed token. |

### Request & Response Details

#### Register

**Request**

```json
{
  "firstName": "...",
  "lastName": "...",
  "email": "...",
  "password": "..."
}
```

> Password must contain at least 8 characters.

**Response — `201 Created`**

```json
{
  "token": "...",
  "tokenType": "Bearer",
  "userId": 123,
  "firstName": "...",
  "lastName": "...",
  "email": "...",
  "role": "PASSENGER",
  "refreshToken": "..."
}
```

#### Login

**Request**

```json
{
  "email": "...",
  "password": "..."
}
```

**Response — `200 OK`**

Same response shape as registration.

#### Refresh Token

**Request**

```json
{
  "refreshToken": "..."
}
```

**Response — `200 OK`**

Same response shape as registration.

#### Promote User

**Response — `200 OK`**

```json
{
  "message": "User promoted to ADMIN",
  "userId": 123,
  "email": "...",
  "role": "ADMIN"
}
```

#### Forgot Password

**Request**

```json
{
  "email": "..."
}
```

**Response — `202 Accepted`**

```json
{
  "message": "If the account exists, a reset email will be sent"
}
```

#### Reset Password

**Request**

```json
{
  "token": "...",
  "password": "..."
}
```

**Response:** `204 No Content`

#### Request Verification Email

**Request**

```json
{
  "email": "..."
}
```

**Response — `202 Accepted`**

```json
{
  "message": "Verification email requested"
}
```

#### Confirm Verification

**Request**

```json
{
  "token": "..."
}
```

**Response:** `204 No Content`

---

# Pricing Service — `pricing-service`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/pricing/quote` | Authenticated | Calculate a dynamic quote without changing the stored base fare. |

### Request

```json
{
  "flightId": 123,
  "baseFare": 199.99,
  "departureDate": "2026-10-01",
  "availableSeats": 30,
  "totalSeats": 180,
  "cabin": "ECONOMY",
  "promoCode": "WELCOME10",
  "frequentFlyerPoints": 500
}
```

### Response — `200 OK`

```json
{
  "flightId": 123,
  "cabin": "ECONOMY",
  "baseFare": 199.99,
  "multiplier": 1.0,
  "promoDiscount": 19.99,
  "frequentFlyerPointsDiscount": 5.00,
  "total": 175.00,
  "appliedRules": ["..."]
}
```

### Pricing Rules

- Departure within **3 days** → `+35%`
- Departure within **4–14 days** → `+15%`
- Flight occupancy of **65%+** → `+10%`
- Flight occupancy of **85%+** → `+25%`
- `BUSINESS` cabin → `1.80x`
- `FIRST` cabin → `2.75x`
- `WELCOME10` → `10%` discount
- Every **100 frequent-flyer points** offsets **1 currency unit**, capped at `100`

---

# Passenger Service — `passenger-service`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/passengers/me` | Authenticated | List the caller's traveller profiles. |
| `GET` | `/api/passengers/saved-travelers` | Authenticated | List only travellers flagged as saved. |
| `POST` | `/api/passengers` | Authenticated | Create a traveller profile. |
| `PUT` | `/api/passengers/{id}` | Authenticated | Update a passenger. Owner only. |
| `POST` | `/api/passengers/{id}/points` | Authenticated | Add frequent-flyer points. Owner only. |

### Create Passenger

**Request**

```json
{
  "firstName": "...",
  "lastName": "...",
  "dateOfBirth": "YYYY-MM-DD",
  "phone": "...",
  "documentNumber": "...",
  "passportNationality": "...",
  "passportExpiryDate": "YYYY-MM-DD",
  "savedTraveler": true
}
```

**Response — `201 Created`**

Created passenger object.

### Add Frequent-Flyer Points

Query parameter:

```text
points >= 1
```

**Response — `200 OK`**

Updated passenger with the new `frequentFlyerPoints`.

### Passenger Object

```json
{
  "id": 123,
  "ownerEmail": "...",
  "firstName": "...",
  "lastName": "...",
  "dateOfBirth": "YYYY-MM-DD",
  "phone": "...",
  "documentNumber": "...",
  "passportNationality": "...",
  "passportExpiryDate": "YYYY-MM-DD",
  "frequentFlyerPoints": 0,
  "savedTraveler": true
}
```

---

# Booking Service — `booking-service`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/bookings` | Authenticated | List the caller's bookings. |
| `GET` | `/api/bookings/{id}` | Authenticated | Retrieve one of the caller's bookings. |
| `POST` | `/api/bookings` | Authenticated | Create a booking and lock the seat for 10 minutes. |
| `POST` | `/api/bookings/group` | Authenticated | Create one pending booking per traveller. |
| `POST` | `/api/bookings/{id}/upgrade` | Authenticated | Change a pending booking's seat and add the price difference. |
| `POST` | `/api/bookings/{id}/cancel` | Authenticated | Cancel a pending booking. |

### Create Booking

**Request**

```json
{
  "flightId": 123,
  "passengerId": 456,
  "seatNumber": "12A",
  "amount": 199.99
}
```

**Response — `201 Created`**

Booking with status:

```text
PENDING_PAYMENT
```

If the seat is already locked:

```text
409 Conflict
```

### Create Group Booking

**Request**

```json
{
  "flightId": 123,
  "travelers": [
    {
      "passengerId": 1,
      "seatNumber": "12A",
      "amount": 199.99
    },
    {
      "passengerId": 2,
      "seatNumber": "12B",
      "amount": 199.99
    }
  ]
}
```

Each seat is locked independently.

### Upgrade Booking

Query parameters:

```text
seatNumber
additionalAmount
```

**Response:** `200 OK` → updated booking.

### Cancel Booking

**Response:** `200 OK` → booking with status `CANCELLED`.

> Confirmed bookings require support for cancellation.

### Booking Object

```json
{
  "id": 123,
  "pnr": "...",
  "ownerEmail": "...",
  "flightId": 123,
  "passengerId": 456,
  "seatNumber": "12A",
  "amount": 199.99,
  "status": "PENDING_PAYMENT",
  "createdAt": "..."
}
```

Possible statuses:

```text
PENDING_PAYMENT
CONFIRMED
CANCELLED
EXPIRED
```

---

# Payment Service — `payment-service`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/payments/initiate` | Public* | Create a pending payment record for a booking. |
| `GET` | `/api/payments` | Authenticated | List the caller's payment history. |
| `POST` | `/api/payments/{id}/refund` | Authenticated | Refund a succeeded payment. |
| `GET` | `/api/payments/{id}/invoice` | Authenticated | View a payment invoice. |
| `POST` | `/api/payments/webhook` | Public** | Receive provider payment callbacks. |

\* Payment ownership still depends on the authenticated user's identity.

\** The webhook requires the `X-Payment-Webhook-Secret` header.

### Initiate Payment

**Request**

```json
{
  "bookingId": 123,
  "amount": 199.99
}
```

**Response — `201 Created`**

Payment object containing a `providerReference`.

### Refund

**Response — `200 OK`**

Payment with status:

```text
REFUNDED
```

If the payment is not `SUCCEEDED`:

```text
409 Conflict
```

### Invoice

**Response — `200 OK`**

```json
{
  "invoiceNumber": "...",
  "paymentReference": "...",
  "bookingId": 123,
  "amount": 199.99,
  "status": "...",
  "issuedAt": "..."
}
```

### Payment Webhook

**Request**

```json
{
  "providerReference": "pay_...",
  "succeeded": true
}
```

Required header:

```http
X-Payment-Webhook-Secret: <secret>
```

The webhook publishes:

```text
payment.succeeded
payment.failed
```

to RabbitMQ.

**Responses**

- `200 OK` — empty body
- `401 Unauthorized` — invalid webhook secret

### Payment Object

```json
{
  "id": 123,
  "providerReference": "pay_...",
  "bookingId": 123,
  "ownerEmail": "...",
  "amount": 199.99,
  "status": "PENDING",
  "createdAt": "..."
}
```

Possible statuses:

```text
PENDING
SUCCEEDED
FAILED
REFUNDED
```

---

# Notification Service — `notification-service`

## Notification History

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/notifications` | Authenticated | Fetch the 50 most recent delivery logs for the caller. |

The gateway injects:

```http
X-User-Email: <user-email>
```

### Notification Object

```json
{
  "id": 123,
  "eventType": "...",
  "recipient": "...",
  "payload": "...",
  "deliveryStatus": "...",
  "deliveryError": "...",
  "createdAt": "..."
}
```

## Internal Email-Dispatch Endpoints

These endpoints are used internally and may also be called for testing.

All return:

```text
202 Accepted
```

with:

```json
{
  "message": "... queued for dispatch"
}
```

| Controller | Method | Endpoint | Required JSON Fields |
|---|---|---|---|
| `AccountNotificationController` | `POST` | `/api/notifications/account/password-reset` | `recipientEmail`, `resetUrl`, `userName`, `expireInMinutes` |
| `AccountNotificationController` | `POST` | `/api/notifications/account/verification` | `recipientEmail`, `verificationUrl`, `userName` |
| `BookingNotificationController` | `POST` | `/api/notifications/booking/confirmation` | `recipientEmail`, `bookingId`, `bookingReference`, `flightNumber`, `origin`, `destination`, `departureTime`, `arrivalTime`, `totalAmount`, `passengerNames` |
| `FlightNotificationController` | `POST` | `/api/notifications/flight/update` | `recipientEmail`, `flightNumber`, `origin`, `destination`, `scheduledDeparture`, `newDeparture`, `gate`, `statusMessage` |
| `FlightNotificationController` | `POST` | `/api/notifications/flight/cancellation` | `recipientEmail`, `flightNumber`, `origin`, `destination`, `departureDate`, `reason`, `refundPolicyUrl` |
| `PaymentNotificationController` | `POST` | `/api/notifications/payment/confirmation` | `recipientEmail`, `bookingId`, `paymentId`, `providerReference`, `amount`, `paymentMethod` |

---

# Flight Service — `flight-service`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/flights/search` | Public | Search active flights. |
| `GET` | `/api/flights/{id}` | Public | Retrieve flight details by ID. |
| `POST` | `/api/flights/admin` | **ADMIN** | Create a flight. |
| `PUT` | `/api/flights/admin/{id}` | **ADMIN** | Update an existing flight. |
| `POST` | `/api/flights/admin/{id}/delay` | **ADMIN** | Delay a flight by N minutes. |
| `POST` | `/api/flights/admin/{id}/cancel` | **ADMIN** | Cancel a flight and deactivate it. |

## Flight Search

Query parameters:

| Parameter | Required | Description |
|---|---|---|
| `origin` | Yes | 3-letter airport code. |
| `destination` | Yes | 3-letter airport code. |
| `date` | No | ISO date. |
| `passengers` | No | Number of passengers. Defaults to `1`. |
| `airline` | No | Filter by airline. |
| `maxPrice` | No | Maximum price. |
| `maxDurationMinutes` | No | Maximum flight duration. |

**Response — `200 OK`**

List of flight objects.

### Create Flight

**Request**

```json
{
  "flightNumber": "AB123",
  "origin": "JFK",
  "destination": "LAX",
  "departureTime": "2026-10-01T08:00",
  "arrivalTime": "2026-10-01T11:00",
  "fare": 199.99,
  "availableSeats": 150,
  "totalSeats": 180,
  "airline": "Sky High",
  "aircraftCode": "B738"
}
```

**Response — `201 Created`**

Saved flight.

### Delay Flight

Query parameter:

```text
minutes >= 1
```

**Response:** `200 OK` → flight with status `DELAYED`.

### Cancel Flight

**Response:** `200 OK` → flight with:

```json
{
  "active": false,
  "status": "CANCELLED"
}
```

### Flight Object

```json
{
  "id": 123,
  "flightNumber": "AB123",
  "origin": "JFK",
  "destination": "LAX",
  "departureTime": "2026-10-01T08:00",
  "arrivalTime": "2026-10-01T11:00",
  "fare": 199.99,
  "availableSeats": 150,
  "totalSeats": 180,
  "airline": "Sky High",
  "aircraftCode": "B738",
  "status": "SCHEDULED",
  "delayMinutes": 0,
  "active": true
}
```

Possible statuses:

```text
SCHEDULED
DELAYED
CANCELLED
```

---

## Airport & Aircraft Catalogue

All endpoints in this section require **ADMIN** access.

### Airports

| Method | Endpoint | Description | Response |
|---|---|---|---|
| `GET` | `/api/flights/admin/airports` | List airports. | `200 OK` → list of airports |
| `POST` | `/api/flights/admin/airports` | Add an airport. | `201 Created` |
| `PUT` | `/api/flights/admin/airports/{id}` | Update an airport. | `200 OK` |
| `DELETE` | `/api/flights/admin/airports/{id}` | Delete an airport. | `204 No Content` |

**Airport object**

```json
{
  "id": 1,
  "code": "LOS",
  "name": "Murtala Muhammed Intl",
  "city": "Lagos",
  "country": "NG"
}
```

### Aircraft

| Method | Endpoint | Description | Response |
|---|---|---|---|
| `GET` | `/api/flights/admin/aircraft` | List aircraft. | `200 OK` → list of aircraft |
| `POST` | `/api/flights/admin/aircraft` | Add an aircraft. | `201 Created` |
| `PUT` | `/api/flights/admin/aircraft/{id}` | Update an aircraft. | `200 OK` |
| `DELETE` | `/api/flights/admin/aircraft/{id}` | Delete an aircraft. | `204 No Content` |

**Aircraft object**

```json
{
  "id": 1,
  "code": "B738",
  "model": "Boeing 737-800",
  "seatCapacity": 180
}
```

---

# Admin Service — `admin-service`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/dashboard` | **ADMIN** | View the operational dashboard. |
| `POST` | `/api/admin/actions` | **ADMIN** | Record an administrative action in the audit log. |

### Dashboard

**Response — `200 OK`**

```json
{
  "service": "admin-service",
  "generatedAt": "...",
  "auditActionCount": 5,
  "message": "..."
}
```

### Record Administrative Action

**Request**

Free-form JSON action object.

**Response — `202 Accepted`**

```json
{
  "requestedBy": "admin@example.com",
  "action": {},
  "status": "RECORDED"
}
```

---

# API Gateway

| Method | Endpoint | Description | Response |
|---|---|---|---|
| `GET` | `/fallback/flight-service` | Circuit-breaker fallback returned when `flight-service` is unhealthy. | `503 Service Unavailable` |

### Flight Service Fallback Response

```json
{
  "error": "Flight Service Unavailable",
  "message": "..."
}
```

---

# Common Headers

All services expect the caller's email through:

```http
X-User-Email: <user-email>
```

The API Gateway populates this header, along with:

```http
X-User-Role: <user-role>
```

from the validated JWT.

Therefore, clients normally only need to send:

```http
Authorization: Bearer <token>
```

---

# Quick Testing with cURL

The following examples call the API through the gateway on port `8080`.

## 1. Register a User

```bash
curl -X POST http://localhost:8080/api/auth/register   -H "Content-Type: application/json"   -d '{"firstName":"John","lastName":"Doe","email":"john@example.com","password":"Secret123!"}'
```

## 2. Login and Capture the Access Token

```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login   -H "Content-Type: application/json"   -d '{"email":"john@example.com","password":"Secret123!"}' | jq -r .token)
```

## 3. Search Flights

Flight search is public, so no token is required.

```bash
curl "http://localhost:8080/api/flights/search?origin=JFK&destination=LAX&date=2026-10-01"
```

## 4. Create a Traveller Profile

```bash
curl -X POST http://localhost:8080/api/passengers   -H "Authorization: Bearer $TOKEN"   -H "Content-Type: application/json"   -d '{"firstName":"John","lastName":"Doe","dateOfBirth":"1990-01-01","documentNumber":"AB123456"}'
```

## 5. Book a Seat

The seat is locked for **10 minutes**.

```bash
curl -X POST http://localhost:8080/api/bookings   -H "Authorization: Bearer $TOKEN"   -H "Content-Type: application/json"   -d '{"flightId":1,"passengerId":1,"seatNumber":"12A","amount":199.99}'
```

## 6. Initiate Payment

```bash
curl -X POST http://localhost:8080/api/payments/initiate   -H "Authorization: Bearer $TOKEN"   -H "Content-Type: application/json"   -d '{"bookingId":1,"amount":199.99}'
```

## 7. Verify Email Delivery

If MailHog is being used locally, open:

```text
http://localhost:8025
```

---

# Frontend Modular Architecture & Endpoint Routing Map

This repository implements a modular frontend service layer for all microservices in the system.
All REST communications flow through [src/services/apiClient.js](file:///c:/Users/USCHIP/Documents/tigerairlines/tigerairlines---airline-booking-system/src/services/apiClient.js), with centralized modular exports via [src/services/index.js](file:///c:/Users/USCHIP/Documents/tigerairlines/tigerairlines---airline-booking-system/src/services/index.js).

### Service Modules & Component Routing Matrix

> User governance is handled by the Auth Service, not the Admin Service: `GET /api/auth/users`, `PUT /api/auth/users/{userId}/role`, `POST /api/auth/promote/{userId}`, and `DELETE /api/auth/users/{userId}`.
>
> Controller-verified limitations: Booking Service does not expose the `PATCH` seat, extras, or status routes listed in the matrix; seat upgrades use `POST /api/bookings/{id}/upgrade`. Payment Service does not expose `/api/payments/process`; its webhook is for provider/server calls. Flight creation and updates require the full `FlightRequest` shape, and flight cancellation marks a record inactive rather than deleting it. Passenger updates are owner-only and do not support loyalty-tier fields.

| Microservice | Modular File | Endpoints Implemented | Consumed By |
|---|---|---|---|
| **Auth Service** | [`authService.js`](file:///c:/Users/USCHIP/Documents/tigerairlines/tigerairlines---airline-booking-system/src/services/authService.js) | `POST /api/auth/register`<br>`POST /api/auth/login`<br>`POST /api/auth/refresh`<br>`POST /api/auth/promote/{userId}`<br>`POST /api/auth/forgot-password`<br>`POST /api/auth/reset-password`<br>`POST /api/auth/verification`<br>`POST /api/auth/verification/confirm`<br>`DELETE /api/auth/users/{userId}` | - [`RegisterPage.jsx`](file:///c:/Users/USCHIP/Documents/tigerairlines/tigerairlines---airline-booking-system/src/pages/RegisterPage.jsx)<br>- [`LoginPage.jsx`](file:///c:/Users/USCHIP/Documents/tigerairlines/tigerairlines---airline-booking-system/src/pages/LoginPage.jsx)<br>- [`VerifyEmailPage.jsx`](file:///c:/Users/USCHIP/Documents/tigerairlines/tigerairlines---airline-booking-system/src/pages/VerifyEmailPage.jsx)<br>- [`ForgotPasswordPage.jsx`](file:///c:/Users/USCHIP/Documents/tigerairlines/tigerairlines---airline-booking-system/src/pages/ForgotPasswordPage.jsx)<br>- [`AdminUsersPage.jsx`](file:///c:/Users/USCHIP/Documents/tigerairlines/tigerairlines---airline-booking-system/src/pages/AdminUsersPage.jsx)<br>- [`apiClient.js`](file:///c:/Users/USCHIP/Documents/tigerairlines/tigerairlines---airline-booking-system/src/services/apiClient.js) (Auto-refresh on 401) |
| **Pricing Service** | [`pricingService.js`](file:///c:/Users/USCHIP/Documents/tigerairlines/tigerairlines---airline-booking-system/src/services/pricingService.js) | `POST /api/pricing/quote` (advance purchase, load factor, cabin, promo code, frequent flyer points) | - [`PaymentPage.jsx`](file:///c:/Users/USCHIP/Documents/tigerairlines/tigerairlines---airline-booking-system/src/pages/PaymentPage.jsx) (Dynamic quote & promo calculator)<br>- [`ReviewStep.jsx`](file:///c:/Users/USCHIP/Documents/tigerairlines/tigerairlines---airline-booking-system/src/features/booking/ReviewStep.jsx) |
| **Passenger Service** | [`passengerService.js`](file:///c:/Users/USCHIP/Documents/tigerairlines/tigerairlines---airline-booking-system/src/services/passengerService.js) | `GET /api/passengers/me`<br>`GET /api/passengers/saved-travelers`<br>`POST /api/passengers`<br>`PUT /api/passengers/{id}`<br>`POST /api/passengers/{id}/points`<br>`GET /api/passengers`<br>`DELETE /api/passengers/{id}` | - [`MyTripsPage.jsx`](file:///c:/Users/USCHIP/Documents/tigerairlines/tigerairlines---airline-booking-system/src/pages/MyTripsPage.jsx) (Caller's travellers)<br>- [`AdminPassengersPage.jsx`](file:///c:/Users/USCHIP/Documents/tigerairlines/tigerairlines---airline-booking-system/src/pages/AdminPassengersPage.jsx) (Registry CRUD & bulk upgrades)<br>- [`AdminTopbar.jsx`](file:///c:/Users/USCHIP/Documents/tigerairlines/tigerairlines---airline-booking-system/src/components/layout/AdminTopbar.jsx) (Search) |
| **Booking Service** | [`bookingService.js`](file:///c:/Users/USCHIP/Documents/tigerairlines/tigerairlines---airline-booking-system/src/services/bookingService.js) | `GET /api/bookings`<br>`GET /api/bookings/{id}`<br>`POST /api/bookings` (10m seat lock)<br>`POST /api/bookings/group`<br>`POST /api/bookings/{id}/upgrade`<br>`POST /api/bookings/{id}/cancel`<br>`GET /api/bookings/pnr/{pnr}`<br>`GET /api/bookings/search`<br>`PATCH /api/bookings/{id}/seat`<br>`PATCH /api/bookings/{id}/extras`<br>`PATCH /api/bookings/{id}/status` | - [`PaymentPage.jsx`](file:///c:/Users/USCHIP/Documents/tigerairlines/tigerairlines---airline-booking-system/src/pages/PaymentPage.jsx) (Creation & status update)<br>- [`ManageBookingPage.jsx`](file:///c:/Users/USCHIP/Documents/tigerairlines/tigerairlines---airline-booking-system/src/pages/ManageBookingPage.jsx) (Seat/extra change & cancellation)<br>- [`MyTripsPage.jsx`](file:///c:/Users/USCHIP/Documents/tigerairlines/tigerairlines---airline-booking-system/src/pages/MyTripsPage.jsx) (User history)<br>- [`ConfirmationPage.jsx`](file:///c:/Users/USCHIP/Documents/tigerairlines/tigerairlines---airline-booking-system/src/pages/ConfirmationPage.jsx)<br>- [`AdminBookingsPage.jsx`](file:///c:/Users/USCHIP/Documents/tigerairlines/tigerairlines---airline-booking-system/src/pages/AdminBookingsPage.jsx)<br>- [`AdminTopbar.jsx`](file:///c:/Users/USCHIP/Documents/tigerairlines/tigerairlines---airline-booking-system/src/components/layout/AdminTopbar.jsx) |
| **Payment Service** | [`paymentService.js`](file:///c:/Users/USCHIP/Documents/tigerairlines/tigerairlines---airline-booking-system/src/services/paymentService.js) | `POST /api/payments/initiate`<br>`GET /api/payments`<br>`POST /api/payments/{id}/refund`<br>`GET /api/payments/{id}/invoice`<br>`POST /api/payments/webhook`<br>`POST /api/payments/process` | - [`PaymentPage.jsx`](file:///c:/Users/USCHIP/Documents/tigerairlines/tigerairlines---airline-booking-system/src/pages/PaymentPage.jsx) (Pending record initiation & charge)<br>- [`AdminDashboardPage.jsx`](file:///c:/Users/USCHIP/Documents/tigerairlines/tigerairlines---airline-booking-system/src/pages/AdminDashboardPage.jsx) |
| **Notification Service** | [`notificationService.js`](file:///c:/Users/USCHIP/Documents/tigerairlines/tigerairlines---airline-booking-system/src/services/notificationService.js) | `GET /api/notifications` (50 recent alerts)<br>`POST /api/notifications/account/password-reset`<br>`POST /api/notifications/account/verification`<br>`POST /api/notifications/booking/confirmation`<br>`POST /api/notifications/flight/update`<br>`POST /api/notifications/flight/cancellation`<br>`POST /api/notifications/payment/confirmation` | - [`AdminTopbar.jsx`](file:///c:/Users/USCHIP/Documents/tigerairlines/tigerairlines---airline-booking-system/src/components/layout/AdminTopbar.jsx) (Live notification bell & dropdown)<br>- [`PaymentPage.jsx`](file:///c:/Users/USCHIP/Documents/tigerairlines/tigerairlines---airline-booking-system/src/pages/PaymentPage.jsx) (Dispatches booking & payment confirmations) |
| **Flight Service** | [`flightService.js`](file:///c:/Users/USCHIP/Documents/tigerairlines/tigerairlines---airline-booking-system/src/services/flightService.js) | `GET /api/flights/search`<br>`GET /api/flights/{id}`<br>`POST /api/flights/admin`<br>`PUT /api/flights/admin/{id}`<br>`POST /api/flights/admin/{id}/delay`<br>`POST /api/flights/admin/{id}/cancel`<br>`GET /api/flights/admin/airports` (CRUD)<br>`GET /api/flights/admin/aircraft` (CRUD) | - [`SearchResultsPage.jsx`](file:///c:/Users/USCHIP/Documents/tigerairlines/tigerairlines---airline-booking-system/src/pages/SearchResultsPage.jsx)<br>- [`BookingPage.jsx`](file:///c:/Users/USCHIP/Documents/tigerairlines/tigerairlines---airline-booking-system/src/pages/BookingPage.jsx)<br>- [`FlightStatusPage.jsx`](file:///c:/Users/USCHIP/Documents/tigerairlines/tigerairlines---airline-booking-system/src/pages/FlightStatusPage.jsx)<br>- [`AdminFlightsPage.jsx`](file:///c:/Users/USCHIP/Documents/tigerairlines/tigerairlines---airline-booking-system/src/pages/AdminFlightsPage.jsx)<br>- [`AdminAirportsPage.jsx`](file:///c:/Users/USCHIP/Documents/tigerairlines/tigerairlines---airline-booking-system/src/pages/AdminAirportsPage.jsx)<br>- [`AdminAircraftPage.jsx`](file:///c:/Users/USCHIP/Documents/tigerairlines/tigerairlines---airline-booking-system/src/pages/AdminAircraftPage.jsx)<br>- [`AdminTopbar.jsx`](file:///c:/Users/USCHIP/Documents/tigerairlines/tigerairlines---airline-booking-system/src/components/layout/AdminTopbar.jsx) |
| **Admin Service** | [`adminService.js`](file:///c:/Users/USCHIP/Documents/tigerairlines/tigerairlines---airline-booking-system/src/services/adminService.js) | `GET /api/admin/dashboard`<br>`POST /api/admin/actions`<br>`GET /api/admin/stats` | - [`AdminDashboardPage.jsx`](file:///c:/Users/USCHIP/Documents/tigerairlines/tigerairlines---airline-booking-system/src/pages/AdminDashboardPage.jsx)<br>- [`AdminSidebar.jsx`](file:///c:/Users/USCHIP/Documents/tigerairlines/tigerairlines---airline-booking-system/src/components/layout/AdminSidebar.jsx) |

---

## Maintenance

> This file is generated for documentation purposes and kept up to date manually. Add new endpoints as the project evolves.
