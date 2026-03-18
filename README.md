# 🎬 Movie Ticket Booking System (MERN Stack)

A professional, full-stack solution for managing cinema operations and providing a seamless ticket booking experience for customers. Built with the powerful MERN stack (MongoDB, Express, React, Node.js).

---

## 🌟 What is this Project?

Imagine a digital bridge between a Cinema Manager and a Movie Lover. 

- **For the Manager (Admin):** It's a control center to add movies, set showtimes, design seating charts, and track sales.
- **For the Customer (User):** It's a sleek, easy-to-use shop where they can browse movies, pick their favorite seats, and pay securely in seconds.

---

## 🚀 How it Works (The Journey)

### 👤 The Customer's Experience
1. **Browse**: Open the app and see what's "Now Showing" or "Coming Soon."
2. **Select**: Click on a movie to see available theaters and times.
3. **Choose Seats**: Use the interactive map to pick seats. (Look out for **Premium** seats for a better view!)
4. **Pay**: Enter card details securely (powered by Stripe).
5. **Receive**: Get a digital ticket with a unique booking ID and download it as a PDF.

### 🛠️ The Admin's Experience
1. **Dashboard**: Get a bird's-eye view of total revenue and booking stats.
2. **Movie Management**: Fetch movie details instantly from global databases (TMDB) just by typing the ID.
3. **Showtime Manager**: Drag and drop movies into time slots for specific cinema screens.
4. **Pricing & Layout**: Set ticket prices (even add weekend surges!) and design seat maps visually.

---

## 🛠️ The Tech Stack (Simplified)

We use industry-standard tools to ensure the app is fast, secure, and reliable:

| Tool | Role | Why we use it? |
| :--- | :--- | :--- |
| **MongoDB** | Database | Like a digital filing cabinet that stores movie and user data flexibly. |
| **Express.js** | Backend Framework | The "brain" that processes requests and talks to the database. |
| **React.js** | Frontend | The "face" of the app. It makes everything interactive and fast. |
| **Node.js** | Server Runtime | The engine that runs the backend on the computer. |
| **Stripe** | Payments | The secure "cashier" that handles credit card transactions. |
| **Tailwind CSS** | Styling | For a modern, "Glassmorphism" design that looks premium. |

---

## ✨ Key Features

### 💎 For Users
- 📱 **Responsive Design**: Works perfectly on phones, tablets, and desktops.
- 🎟️ **Visual Seat Selector**: Real-time updates—if someone else bags a seat, you'll know instantly.
- 💳 **Secure Payments**: Industry-leading security via Stripe integration.
- 📧 **Auto-Emails**: Confirmation emails sent automatically after booking.
- 📄 **PDF Tickets**: Downloadable tickets for easy entry at the cinema.

### 🛡️ For Admins
- 📊 **Analytical Dashboard**: View sales trends and occupancy rates.
- 🎬 **TMDB Integration**: Automatic fetching of movie posters, descriptions, and ratings.
- 📅 **Dynamic Scheduling**: Create, edit, or delete showtimes with ease.
- 💰 **Pricing Engine**: Set different prices for Weekdays vs. Weekends and Standard vs. Premium seats.

---

## 📦 Project Structure

```text
MTB/
├── backend/                # The logic, database schemas, and API routes
│   ├── models/            # Data structures (User, Movie, Booking, etc.)
│   ├── routes/            # "URLs" the app uses to communicate
│   └── server.js          # The starting point of the backend
├── frontend/               # The visual part of the app
│   ├── src/components/    # Reusable UI parts (Buttons, Navbars, etc.)
│   ├── src/pages/         # The main screens (Home, Booking, Login)
│   └── vite.config.js     # Tools for fast development
└── README.md               # This guide!
```

---

## 🛠️ Getting Started (Setup Guide)

Follow these steps to run the project on your local computer:

### Prerequisites
- [Node.js](https://nodejs.org/) installed.
- [MongoDB](https://www.mongodb.com/try/download/community) installed and running.

### 1. Setup the Backend
Navigate to the `backend` folder and install dependencies:
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder and add your keys:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=any_random_secret_string
STRIPE_SECRET_KEY=your_stripe_test_key
TMDB_API_KEY=your_tmdb_api_key
```
Start the server:
```bash
npm run dev
```

### 2. Setup the Frontend
Navigate to the `frontend` folder and install dependencies:
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend` folder:
```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_public_key
```
Start the application:
```bash
npm run dev
```

---

## 📜 Documentation & Resources
- 🧪 [**Testing Guide**](MANUAL_TESTING.md): How to verify the system's features.
- 🏗️ [**Architecture Deep Dive**](docs/ARCHITECTURE.md): Technical details for developers.

---

*Developed with ❤️ as a full-stack learning journey.*

