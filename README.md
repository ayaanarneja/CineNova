# 🎬 CineNova — Movie Ticket Booking System

A complete, production-ready movie ticket booking web app built with **Vue 3 (Composition API)**, **Vuetify 3**, **Pinia**, **Vue Router**, **Axios**, and **JSON Server** — styled with a premium dark AMOLED neon glassmorphism aesthetic.

## ✨ Features

- User Registration & Login (LocalStorage-based auth)
- Protected routes with navigation guards
- Home page: Now Playing, Trending, Coming Soon, Top Rated, Recommended
- Movie details with cast, ratings, genres
- Search with movie / genre / language / theatre-city filters
- Theatre selection, dynamic date picker (Today + next 4 days), showtime selection
- Interactive seat map — Economy, Gold, Premium & VIP categories with live pricing
- Food & Beverage ordering
- Checkout with offer/coupon codes
- Payment page — Card, UPI, Google Pay, PhonePe, Paytm (simulated)
- Booking confirmation + digital ticket with QR code & barcode
- Download ticket as PDF
- My Bookings — Upcoming / Completed / Cancelled tabs
- Wishlist / Favorites
- Offers listing
- Notifications center
- Profile management & logout
- Fully responsive (mobile / tablet / desktop), skeleton loaders, GSAP micro-interactions, Lottie loader

## 🧱 Tech Stack

Vue 3 · Vite · Vuetify 3 · Vue Router 4 · Pinia · Axios · JSON Server · GSAP · VueUse · Lottie · QRCode · JsBarcode · jsPDF + html2canvas

## 📁 Project Structure

```
movie-ticket-booking/
├── db.json                  # JSON Server mock database
├── src/
│   ├── assets/styles         # Global SCSS theme
│   ├── assets/lottie          # Lottie animation JSON
│   ├── components/
│   │   ├── common/           # AppBar, BottomNav, ToastHost, LottiePlayer
│   │   ├── movie/             # MovieCard, MovieRow
│   │   └── seat/               # SeatMap
│   ├── plugins/vuetify.js
│   ├── router/index.js       # Routes + auth guards
│   ├── services/               # Axios API layer (one file per resource)
│   ├── stores/                  # Pinia stores (auth, movies, theatres, booking, bookings, wishlist, notifications, offers, toast)
│   ├── utils/                    # date, currency, seat layout helpers
│   ├── views/                    # All page-level components
│   ├── App.vue
│   └── main.js
├── package.json
└── vite.config.js
```

## 🚀 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Run JSON Server (backend, port 4000)
```bash
npm run server
```

### 3. Run the Vite dev server (frontend, port 5173) — in a new terminal
```bash
npm run dev
```

### Or run both together
```bash
npm run dev:full
```

The app will be available at **http://localhost:5173**
JSON Server API runs at **http://localhost:4000**

### 4. Demo login
```
Email:    demo@cinenova.com
Password: demo1234
```
Or register a new account — it is saved to `db.json` via JSON Server.

## 🏗️ Build for production
```bash
npm run build
npm run preview
```

## 🎨 Design System

- Background: AMOLED `#0F0826`
- Gradient: Purple `#B15CFF` → Pink `#FF4DA6`
- Glassmorphism cards, 24px rounded corners, floating bottom navigation
- Soft neon glow buttons, animated blurred backgrounds, blur dialogs
- Skeleton loading states throughout, Lottie loader, GSAP entrance animations

## 📝 Notes

- Authentication uses LocalStorage (`cinenova_user`, `cinenova_token`) and validates users against JSON Server's `/users` endpoint — this is a demo auth flow, not intended for real production security.
- Payments are simulated (no real payment gateway integration).
- Seat maps are deterministically generated per showtime so re-visiting a showtime shows a consistent layout.
