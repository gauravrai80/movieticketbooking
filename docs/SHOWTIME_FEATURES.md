# Showtime Viewing Features

## Overview

The Movie Ticket Booking System now includes two powerful ways to browse and select showtimes:

1. **Calendar View** - Visual calendar interface for date-based showtime browsing
2. **List View** - Filtered list interface with advanced search and sorting options

Both views are accessible from the Movie Details page and offer seamless navigation to the booking process.

---

## Calendar View

### Features

- **Monthly Calendar Display**: Visual representation of the current month with available showtimes
- **Date Selection**: Click on any date to see showtimes for that specific day
- **Availability Indicators**: 
  - Days with showtimes show the count of available shows
  - Days without showtimes are disabled
  - Selected date is highlighted in the accent color
  
- **Showtime Information**:
  - Show time in 12-hour format
  - Theater name and location
  - Ticket price per seat
  - Available seat count
  - Movie format information (2D, 3D, IMAX, etc.)

### Navigation

- **Month Navigation**: Use arrow buttons to move between months
- **Quick Selection**: Click "Select →" to proceed to the booking page
- **Real-time Updates**: Showtime count updates as you navigate dates

### User Experience

The calendar view is ideal for:
- Users browsing casually and exploring available dates
- Visual learners who prefer seeing the full month at a glance
- Planning ahead and discovering showtime options
- Users with accessibility preferences for calendar interfaces

---

## List View

### Features

- **Advanced Filtering**:
  - **Theater Filter**: Select specific theater or view all
  - **Time Period Filter**:
    - All Times (default)
    - Today
    - Tomorrow
    - This Week
    - This Month
  - **Sort Options**:
    - Show Time (earliest first)
    - Price (low to high)

- **Grouped Display**: Showtimes automatically grouped by date for easy scanning
- **Detailed Showtime Cards**:
  - Large time display (HH:MM AM/PM format)
  - Theater name with icon
  - Movie format badges
  - Price per ticket
  - Available seat count
  - Quick select button

### Filtering Examples

**Quick Theater Selection**
```
Theater: PVR Cinemas
Time Period: Today
Result: All showtimes for PVR Cinemas today
```

**Budget Shopping**
```
Time Period: This Week
Sort By: Price (Low to High)
Result: Cheapest showtimes first, organized by date
```

**Weekend Planning**
```
Time Period: This Week
Sort By: Show Time
Result: All week's showtimes, grouped by date, earliest first
```

### User Experience

The list view is ideal for:
- Users with specific requirements (theater, budget, time)
- Comparing multiple showtimes side-by-side
- Quick searches with filtering
- Mobile users who prefer scrolling to clicking calendars
- Users comparing prices across theaters

---

## Technical Implementation

### Components

#### ShowtimeCalendar.jsx
```javascript
<ShowtimeCalendar
  showtimes={showtimes}
  onSelectShowtime={(showtime) => navigate(`/booking/${showtime._id}`)}
/>
```

**Props:**
- `showtimes` (Array): Array of showtime objects
- `onSelectShowtime` (Function): Callback when a showtime is selected

**State Management:**
- `currentDate`: Tracks current month being displayed
- `selectedDate`: Tracks selected date for showtime display

#### ShowtimeList.jsx
```javascript
<ShowtimeList
  showtimes={showtimes}
  onSelectShowtime={(showtime) => navigate(`/booking/${showtime._id}`)}
/>
```

**Props:**
- `showtimes` (Array): Array of showtime objects
- `onSelectShowtime` (Function): Callback when a showtime is selected

**State Management:**
- `selectedTheater`: Current theater filter
- `selectedTime`: Current time period filter
- `sortBy`: Current sort order

### Data Flow

```
MovieDetails Page
    ↓
Fetch Showtimes from API
    ↓
User toggles view mode
    ↓
Calendar View ──→ Select Date ──→ View Showtimes
    ↓
List View ──→ Apply Filters ──→ View Showtimes
    ↓
Click Select Button
    ↓
Navigate to Booking Page with Showtime ID
```

### API Integration

**Fetch Showtimes**
```javascript
GET /api/showtimes?movieId=${movieId}

Response:
{
  _id: "showtime_id",
  movie: { _id: "movie_id", title: "Movie Title" },
  theater: { _id: "theater_id", name: "Theater Name" },
  screen: { screenNumber: 1 },
  startTime: "2024-02-15T18:00:00Z",
  format: ["2D", "Hindi"],
  price: 250,
  availableSeats: ["A1", "A2", "B1"],
  bookedSeats: ["C1", "C2"]
}
```

---

## Date Formatting

All dates are displayed using Indian locale settings (en-IN) for consistent formatting:
- **Calendar**: Shows day numbers and month name
- **List**: Shows full date in DD/MM/YYYY format
- **Showtime**: Shows HH:MM AM/PM format

Example: February 15, 2024 at 6:00 PM → "6:00 PM" or "18:00" depending on context

---

## Responsive Design

Both views are fully responsive:

**Desktop (md and above)**
- Calendar View: 3-column grid (calendar + showtime details + pricing)
- List View: 3-column grid of showtime cards per date

**Tablet (md)**
- Calendar View: 3-column layout maintained
- List View: 2-column grid of showtime cards

**Mobile (sm)**
- Calendar View: 2-row layout (calendar on top, showtimes below)
- List View: Single-column grid, full-width cards

---

## Color Scheme & Styling

### Calendar View Colors
- **Selected Date**: `bg-accent-600` (vibrant pink)
- **Available Dates**: `bg-primary-700` (dark blue)
- **Unavailable Dates**: `bg-primary-700` with `text-gray-500`
- **Hover Effect**: `hover:bg-primary-600` (lighter blue)

### List View Colors
- **Card Background**: `bg-primary-800` (darker blue)
- **Hover Effect**: `bg-primary-700 border-accent-500` (darker with pink border)
- **Price Text**: `text-accent-400` (bright pink)
- **Available Seats**: `text-green-400` (green indicator)

---

## Accessibility Features

- **Semantic HTML**: Proper button and input elements
- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Visual Feedback**: Clear hover and focus states
- **Screen Reader Support**: Descriptive alt text and ARIA labels for complex components
- **Color Contrast**: All text meets WCAG AA standards
- **Focus Management**: Clear focus indicators for keyboard navigation

---

## Future Enhancements

Potential improvements for future releases:

1. **Seat Preview**: Show seat map before booking
2. **Smart Recommendations**: Suggest popular showtimes based on ratings
3. **Price Comparison**: Highlight best-priced showtimes
4. **Notifications**: Alert users to price drops or new showtimes
5. **Saved Preferences**: Remember user's preferred theaters and time slots
6. **Dynamic Filtering**: Real-time filter updates based on availability
7. **Share Functionality**: Share specific showtimes with friends
8. **Wishlist**: Save showtimes to view later

---

## Troubleshooting

### Calendar Not Showing Showtimes
- Ensure showtimes have valid `startTime` field
- Check that movie ID is correctly passed to the fetch request
- Verify backend API is returning showtime data

### List View Filters Not Working
- Clear browser cache if filters appear stuck
- Ensure theater data includes `_id` and `name` fields
- Check that all showtimes have complete date information

### Navigation Issues
- Ensure user is authenticated before attempting to book
- Verify booking page route is correctly configured
- Check browser console for any routing errors

---

## Support

For issues or questions about showtime features:
1. Check the API response structure matches expected format
2. Review browser console for error messages
3. Verify all required showtime fields are present
4. Contact support with showtime ID for debugging
