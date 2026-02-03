# Movie Ticket Booking System - MERN Stack

A full-stack movie ticket booking application built with MongoDB, Express, React, and Node.js. This system features a **centralized architecture** where the Admin and User dashboards share a single source of truth, ensuring that pricing, schedule, and layout changes are instantly reflected for all users.

## Features

### 🌟 Centralized Data & Real-Time Sync
- **Unified Backend**: A single Node.js/Express backend serves both Admin and User frontends.
- **Instant Updates**: Changes made in the Admin Dashboard (e.g., ticket price updates, new showtimes) are immediately available to users.
- **Dynamic Pricing**: Admin-controlled base prices and demand multipliers (e.g., Weekend surge pricing).

### 🎬 User Features
- **Real-time Movie Data**: Browse "Now Showing" and "Upcoming" movies fetched directly from TMDB & MovieGlu.
- **Interactive Booking**:
  - **Dynamic Seat Layouts**: Visual seat selector reflecting real-time availability.
  - **Premium Seats**: Special pricing (1.3x) for admin-designated premium seats.
- **Secure Payments**: Integrated Stripe payment gateway for credit/debit cards.
- **Booking Management**: View history, download tickets, and cancel bookings with auto-refund logic.
- **Cinematic UI**: Glassmorphism design, dark mode, and smooth animations.

### 🛠️ Admin Features
- **Schedule Manager**: 
  - Create showtimes dynamically by selecting Theater -> Screen -> Movie.
  - Integration with TMDB for auto-fetching movie metadata.
- **Pricing Manager**: 
  - Adjust base ticket prices globally or per showtime.
  - Set demand multipliers (Weekday vs. Weekend).
- **Seat Layout Editor**: 
  - Visual editor to configure seat maps.
  - Designate "Premium" vs. "Standard" seats affecting user pricing.
- **Dashboard Overview**: View booking stats, revenue, and occupancy rates.

## Detailed Documentation
For deep dives into specific topics, please refer to the `docs/` folder:
- 📖 [**Admin Functional Guide**](docs/ADMIN_GUIDE.md): How to use the Schedule, Pricing, and Layout tools.
- 🏗️ [**Architecture & Design**](docs/ARCHITECTURE.md): System design, data flow, and database schema.
- 🔌 [**API Reference**](docs/API_REFERENCE.md): Technical documentation for backend endpoints.
- 🎞️ [**Showtime Features**](docs/SHOWTIME_FEATURES.md): Specifics on showtime management.

## Project Structure

```
movie-ticket-booking-system/
├── backend/                 # Node.js Express backend
│   ├── models/             # Shared MongoDB schemas (Showtime, Booking, etc.)
│   ├── routes/             # API routes (Admin & User separate namespaces)
│   ├── services/           # Business logic (Email, Sync, Notifications)
│   └── server.js           # Entry point
├── frontend/               # React Vite frontend
│   ├── src/
│   │   ├── components/     # Shared & Specific Components (Admin/User)
│   │   │   ├── admin/      # Admin-specific tools (PricingManager, etc.)
│   │   │   └── ...
│   │   ├── pages/          # Application Pages
│   │   └── context/        # Global State (Auth, Toast)
└── README.md
```

## Tech Stack

### Backend
- **Node.js & Express.js**: REST API architecture.
- **MongoDB & Mongoose**: Centralized database with complex relationships.
- **JWT**: Role-based authentication (User vs Admin).
- **Stripe**: Payment processing.
- **Nodemailer**: Email notifications.

### Frontend
- **React 18**: Component-based UI.
- **Vite**: Lightning-fast tooling.
- **Tailwind CSS**: Modern, responsive styling.
- **Lucide React**: Iconography.
- **Axios**: API communication.

## Installation & Setup

### Prerequisites
- Node.js (v16+)
- MongoDB (Local or Atlas)
- Stripe Account (for payments)
- TMDB API Key

### 1. Backend Setup

Navigate to `backend/` and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/movie-booking
PORT=5000
JWT_SECRET=your_super_secret_key
FRONTEND_URL=http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=sk_test_...

# TMDB
TMDB_API_KEY=your_tmdb_key

# Email (Optional)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

Start the server:
```bash
npm run dev
```

### 2. Frontend Setup

Navigate to `frontend/` and install dependencies:
```bash
cd frontend
npm install
```

Create a `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

Start the application:
```bash
npm run dev
```

## Usage Guide

### Admin Panel
1. Log in with an admin account (Role: `admin`).
2. Navigate to **Admin Dashboard**.
3. Use **Schedule Manager** to add showtimes for specific screens.
4. Use **Pricing Manager** to set ticket costs.
5. Use **Seat Layout Editor** to define premium seats.

### Default Admin Credentials
For testing and development, use the following credentials:
- **Email**: `admin@example.com`
- **Password**: `admin123`

*(Ensure this user exists in your database with role: 'admin')*

### Testing
We have detailed testing guides available:
- 🧪 [**Manual Testing Guide**](docs/MANUAL_TESTING.md): Step-by-step verification flows.
- 🤖 [**Automated Testing Plan**](docs/AUTOMATED_TESTING.md): Strategy for unit and E2E tests.

### User Booking
1. Browse movies on the Home page.
2. Select a movie -> View Showtimes.
3. Choose a showtime created by the Admin.
4. Select seats (Standard or Premium).
5. Complete payment via Stripe.

