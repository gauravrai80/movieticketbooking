# Architecture & System Design

## Overview
The Movie Ticket Booking System employs a **Centralized Architecture** pattern. Unlike systems that separate "Admin" and "User" into distinct applications with potentially disjointed data sources, this system uses a single backend source of truth.

```mermaid
graph TD
    UserClient[User Dashboard (React)]
    AdminClient[Admin Dashboard (React)]
    Backend[Node.js/Express Server]
    DB[(MongoDB Cluster)]
    Stripe[Stripe Payment Gateway]
    TMDB[TMDB API]

    UserClient <-->|REST API| Backend
    AdminClient <-->|REST API| Backend
    Backend <-->|Mongoose| DB
    Backend <-->|Payments| Stripe
    Backend <-->|Metadata| TMDB
```

## Core Components

### 1. Centralized Database (MongoDB)
All data resides in a single MongoDB cluster. Key collections include:
- **Showtimes**: The pivot point of the application. Contains references to `Movie`, `Theater`, `Screen` and arrays for `bookedSeats` and `availableSeats`.
- **Bookings**: Transaction records linking `User` to `Showtime`.
- **Theaters/Screens**: Physical layout configurations.

### 2. Admin Dashboard (Data Producer)
The Admin Dashboard allows theater managers to configure the system.
- **Role**: Read/Write
- **Key Actions**:
    - **Schedule Manager**: Creates `Showtime` documents.
    - **Seat Layout Editor**: Updates `Showtime.premiumSeats` array.
    - **Pricing Manager**: Updates `Showtime.price`.
- **Sync Mechanism**: All actions send standard `POST/PUT/PATCH` requests to the API.

### 3. User Dashboard (Data Consumer)
The User Dashboard allows customers to browse and book.
- **Role**: Read/Write (Write only for Bookings)
- **Key Actions**:
    - **Booking Flow**: Reads `Showtime` documents to render seat maps.
    - **Premium Logic**: `Booking.jsx` checks `showtime.premiumSeats` to calculate dynamic costs (1.3x multiplier).

## Data Synchronization
Because both dashboards fetch from the same API endpoints (or endpoints querying the same collections), synchronization is "Instant on Fetch".

1. **Admin Updates Price**: Admin calls `PATCH /api/showtimes/:id/pricing`.
2. **Database Updates**: MongoDB document is modified.
3. **User Views Showtime**: User visits Booking page -> `GET /api/showtimes/:id`.
4. **Reflection**: The API returns the *new* price immediately.

## Scalability Considerations
- **Socket.io (Future)**: Currently, users must refresh or navigate to see updates. Implementing WebSockets would allow pushing updates (e.g., seat taken by another user) in real-time.
- **Caching**: Heavy read operations (like Movie listings) can be cached using Redis to reduce DB load.
