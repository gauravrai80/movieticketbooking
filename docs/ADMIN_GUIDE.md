# Admin Functional Guide

This guide explains how to use the Admin Dashboard tools to manage the theater system effectively.

## 1. Schedule Manager
**Purpose**: Plan movie screenings for specific screens.

**How to use**:
1. Go to the **Schedule** tab.
2. Click **+ Add Showtime**.
3. **Select Movie**: The dropdown fetches "Now Playing" movies from TMDB.
4. **Select Screen**: Choose the specific screen (e.g., Screen 1 - IMAX).
5. **Set Date & Time**: Define when the show starts and ends.
6. **Set Price**: Define the base ticket price.
7. Click **Create**. The showtime is now live for users.

**Troubleshooting**:
- *Problem*: "Failed to add showtime".
- *Solution*: Ensure you have selected a valid Screen. If the dropdown is empty, ensure Theaters and Screens are seeded in the database.

## 2. Pricing Manager
**Purpose**: Adjust ticket prices based on demand or day of the week.

**How to use**:
1. Go to the **Pricing** tab.
2. **Select Showtime**: Choose the specific screening you want to modify.
3. **Set Base Price**: Enter the standard ticket cost (e.g., ₹300).
4. **Adjust Multiplier**: Use the slider or presets (Weekday/Weekend) to increase/decrease price.
   - *Example*: Weekend (1.2x) turns ₹300 into ₹360.
5. Click **Update Price**.
   - *Note*: This updates the database immediately. Users attempting to book after this second will see the new price.

## 3. Seat Layout Editor
**Purpose**: Designate premium seats for higher revenue.

**How to use**:
1. Go to the **Seat Layout** tab.
2. **Select Showtime**: Load the seat map for a specific show.
3. **Select Tool**: Choose "Premium Seat" (Purple) or "Standard Seat" (Gray).
4. **Click Seats**: Click on grid cells to change their type.
   - *Premium Seats*: Charged at **1.3x** the base price.
   - *Standard Seats*: Charged at base price.
5. Click **Save Configuration**.

## 4. Dashboard Overview
**Purpose**: Monitor business performance.
- **Total Revenue**: Sum of all confirmed bookings.
- **Active Bookings**: Number of valid future bookings.
- **Showtimes**: Total scheduled screenings.
