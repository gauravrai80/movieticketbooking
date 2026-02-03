# Manual Testing Guide

This document outlines manual test cases to verify the core functionality of the Movie Ticket Booking application.

## 🔐 Default Admin Credentials
Use these credentials to log in as an Admin for testing purposes.
- **Username (Email)**: `admin@example.com`
- **Password**: `admin123`
- **Role**: `admin`

*(If this account does not exist, please register a new user with these details and manually update the role to 'admin' in the database).*

---

## 🧪 test Case 1: Admin - Create Showtime
**Objective**: Verify an admin can schedule a movie.
1. Log in with Admin credentials.
2. Navigate to **Admin Dashboard** > **Schedule**.
3. Click "Add Showtime".
4. Select a Movie (e.g., "The Matrix").
5. Select a Scheduler/Screen.
6. Set Date, Start Time, End Time, and Price (e.g., ₹200).
7. Click **Create**.
**Expected Result**: The new showtime appears in the list and is saved to MongoDB.

## 🧪 Test Case 2: Admin - Update Pricing
**Objective**: Verify pricing updates are reflected instantly.
1. Navigate to **Pricing Manager**.
2. Select the showtime created in Test Case 1.
3. Change the Base Price to ₹500.
4. Click **Update**.
**Expected Result**: Success message appears.

## 🧪 Test Case 3: User - View & Book
**Objective**: Verify user sees updated data and can book.
1. Open a new Incognito window (or log out).
2. Register/Login as a Standard User (e.g., `user@test.com`).
3. Browse to the movie from Test Case 1.
4. Verify the ticket price is displayed as **₹500**.
5. Select seats and proceed to checkout.
6. Complete payment (using Stripe Test Card).
**Expected Result**: Booking is confirmed, and "My Bookings" page shows the ticket.

## 🧪 Test Case 4: Premium Seat Pricing
**Objective**: Verify premium seats cost more (1.3x).
1. As Admin, go to **Seat Layout Editor**.
2. Mark Seat `E5` as **Premium**. Save.
3. As User, select Seat `E5` for that showtime.
4. Verify the calculated price is approx **₹650** (1.3 * 500).
**Expected Result**: Total amount reflects the premium surcharge.
