# **Planora - Backend API**

## Project Overview

**Planora** is a secure, JWT-protected (using Better Auth) backend platform where **Admins and registered Users** can create, manage, and participate in events. Events can be **Public or Private** and may include **registration fees**.

## Live Links

- Frontend: [Frontend URL](https://planora-event.vercel.app)
- Backend: [Backend URL](https://planora-api.vercel.app)
- GitHub Repository: [Repository Link](https://github.com/rakibulhasanroki/b6a5-backend)

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (Prisma ORM)
- **Authentication:** Better Auth (Google OAuth)
- **Payment:** Stripe
- **File Upload:** Multer + Cloudinary

## Environment Variables

```bash
# Server
NODE_ENV=
PORT=

# Database
DATABASE_URL=

# Better Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=

# Frontend
FRONTEND_URL=

# Backend
BACKEND_URL=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Admin Seed
ADMIN_NAME=
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

## Setup Instructions

```bash
# Clone repository
git clone https://github.com/rakibulhasanroki/b6a5-backend

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env

# Run database migrations
pnpm prisma migrate

# Start development server
pnpm dev
```

**Admin user will be seeded automatically on server start.**

## Features

- Authentication (Better Auth + Google OAuth)
- Role-based access control (Admin/User)
- Event creation & management
- Public & private event system
- Booking & participation system
- Invitation system
- Payment workflow (Stripe)
- Participant approval & banning
- Event reviews & ratings

## Roles

```bash
USER
ADMIN
```

## API Base URL

```bash
http://localhost:5000/api/v1
```

## Project Structure

```bash
src/
 ├── app/
 │   ├── config/
 │   ├── middleware/
 │   ├── module/
 │   │   ├── auth/
 │   │   ├── users/
 │   │   ├── admin/
 │   │   ├── events/
 │   │   ├── booking/
 │   │   ├── invitation/
 │   │   ├── payment/
 │   │   ├── review/
 │   ├── routes/
 │   ├── utils/
 │   ├── shared/
 │   └── errorHelpers/
 ├── prisma/
 ├── server.ts
```

## API Routes

```bash
## Auth (/auth)
POST   /auth/register
POST   /auth/login
POST   /auth/change-password         (Protected)
POST   /auth/logout                  (Protected)
GET    /auth/google/callback


## Users (/users)
GET    /users/me                     (Protected)
PATCH  /users/me                     (Protected, multipart/form-data)
GET    /users                        (Admin only, query)


## Admin (/admin)
POST   /admin/create-admin           (Admin only)
DELETE /admin/users/:userId          (Admin only)
DELETE /admin/events/:eventId        (Admin only)


## Events (/events)
POST   /events                       (Protected)
GET    /events                       (Public, query)
GET    /events/:eventId              (Public)

GET    /events/my                    (Protected)
GET    /events/joined                (Protected)

GET    /events/participants/all      (Protected)
GET    /events/:eventId/participants (Protected)
GET    /events/:eventId/requests     (Protected)

PATCH  /events/:eventId              (Protected)
DELETE /events/:eventId              (Protected)


## Invitations (/invitations)
POST   /invitations                  (Protected)
GET    /invitations/my               (Protected)
GET    /invitations/event/:eventId   (Protected)
PATCH  /invitations/:invitationId    (Protected)


## Bookings (/bookings)
POST   /bookings                     (Protected)
GET    /bookings/my                  (Protected)
GET    /bookings/:bookingId          (Protected)
PATCH  /bookings/:bookingId/status   (Protected)


## Payments (/payments)
GET    /payments/my                  (Protected, query)
GET    /payments/organizer           (Protected, query)


## Reviews (/reviews)
POST   /reviews                      (Protected)
PATCH  /reviews/:reviewId            (Protected)
DELETE /reviews/:reviewId            (Protected)
GET    /reviews/event/:eventId       (Public, query)
GET    /reviews/my                   (Protected)
```

## Deployment

This backend service is deployed on Vercel.

### Notes

- Event status is automatically updated using a cron job.
- Review editing/deletion is time-restricted.
- Admin is seeded automatically on first run.

## Thank You

**GitHub:** [rakibulhasanroki](https://github.com/rakibulhasanroki)
