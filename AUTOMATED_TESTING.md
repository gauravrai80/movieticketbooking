# Automated Testing Strategy

This document outlines the strategy for automated testing of the application.

## 🔐 Default Admin Credentials for Tests
- **Username (Email)**: `admin@example.com`
- **Password**: `admin123`

---

## 🛠️ Testing Stack
- **Unit Testing**: Jest (Backend logic, utility functions)
- **Integration Testing**: Supertest (API Endpoints, Database interactions)
- **E2E Testing**: Cypress or Playwright (Frontend user flows)

## 📋 Test Plan

### 1. Backend API Tests (Integration)
**Location**: `backend/tests/`
- `POST /api/auth/login`: Verify admin login returns valid JWT.
- `GET /api/showtimes`: Verify showtimes list is returned.
- `POST /api/bookings`: Verify booking creation with valid seat data.
- **Pricing Logic**:
  - Mock a Showtime with `price: 100` and `premiumSeats: ['A1']`.
  - Send booking for `A1`.
  - Assert `totalAmount` is `130`.

### 2. Frontend E2E Tests
**Location**: `frontend/cypress/e2e/`
- **Admin Flow**:
  1. Visit Login page.
  2. Input Admin credentials (`admin@example.com` / `admin123`).
  3. Navigate to Dashboard.
  4. Create a showtime.
  5. Assert showtime is visible in the list.
- **User Flow**:
  1. Login as standard user.
  2. Select a showtime.
  3. Click seats.
  4. Assert Total Price updates correctly.

## 🏃 Running Tests (Future Implementation)
To run the test suite (once implemented):
```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm run cypress:open
```
