# API Reference

Base URL: `http://localhost:5000/api`

## Authentication
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Login user/admin | No |
| `POST` | `/auth/register` | Register new user | No |

## Showtimes (Public)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/showtimes` | List showtimes (supports filters: movie, date) | No |
| `GET` | `/showtimes/:id` | Get showtime details (includes seats) | No |
| `GET` | `/showtimes/:id/seats` | Get available/booked/premium seats | No |

## Showtimes (Admin)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/admin/showtimes` | Create new showtime | Yes (Admin) |
| `PUT` | `/admin/showtimes/:id` | Update showtime details | Yes (Admin) |
| `DELETE` | `/admin/showtimes/:id` | Delete showtime | Yes (Admin) |
| `PATCH` | `/admin/showtimes/:id/pricing` | Update price & premium seats | Yes (Admin) |

### Create Showtime Payload
```json
{
  "tmdbId": "12345",
  "screen": "screen_id_here",
  "theater": "theater_id_here",
  "startTime": "2026-02-04T10:00:00.000Z",
  "endTime": "2026-02-04T12:00:00.000Z",
  "price": 300
}
```

### Update Pricing Payload
```json
{
  "price": 350,
  "premiumSeats": ["A1", "A2", "A3"]
}
```

## Bookings
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/bookings` | Create a booking | Yes |
| `GET` | `/bookings/user/my-bookings` | Get logged-in user's history | Yes |
| `PUT` | `/bookings/:id/cancel` | Cancel a booking | Yes |

### Create Booking Payload
```json
{
  "showtimeId": "showtime_id_here",
  "seats": ["A1", "A2"],
  "paymentMethod": "credit-card",
  "totalAmount": 780
}
```
*Note: `totalAmount` is recalculated on the backend for validation.*

## Theaters & Screens
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/theaters` | List all theaters | No |
| `POST` | `/theaters` | Create theater | Yes (Admin) |
| `POST` | `/theaters/:id/screens` | Add screen to theater | Yes (Admin) |
