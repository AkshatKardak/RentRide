<div align="center">
  <img src="./Frontend/public/tab.png" alt="RentRide Logo" width="180">
  
  # RentRide - Car Rental Platform
  ### Next-Gen Peer-to-Peer Mobility with Transparent Pricing & Fleet Intelligence
  
  [![Node.js Version](https://img.shields.io/badge/Node.js-24.x%20LTS-brightgreen?style=for-the-badge&logo=node.js)](https://nodejs.org/)
  [![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
  [![Apache ECharts](https://img.shields.io/badge/Charts-Apache%20ECharts-red?style=for-the-badge&logo=apacheecharts)](https://echarts.apache.org/)
  
</div>

---

## 🌟 Overview

**RentRide** is a full-stack peer-to-peer car rental platform built with a single unified frontend (React 19 + Vite), a scalable Node.js 24 / Express backend, and MongoDB Atlas. It features database-backed vehicle search and filtering, transparent rental pricing derived from Indian automotive market data, explainable vehicle trust scores, and interactive Apache ECharts analytics dashboards for both renters and administrators.

---

## 🚀 Unique Features

- **Vehicle Trust Score:** Gives renters an explainable confidence rating (0–100) based on maintenance health, service history, and verified odometer readings.
- **Transparent Dynamic Pricing:** Adjusts base rental rates using explainable category baselines, vehicle valuations, and weekend demand factors.
- **Smart Recommendations:** Suggests personalized vehicle options tailored to customer preferences and regional fleet availability.
- **Telemetry & Maintenance Risk:** Evaluates vehicle wear indicators to surface actionable maintenance tasks before major breakdowns.
- **Damage Inspection & Human Review:** Supports check-in/return inspection records and routes disputed damage claims to administrator review.
- **Vehicle Digital Passport:** Maintains a verifiable digital ledger of vehicle events, odometer readings, and service milestones.
- **Rental Intelligence Dashboard:** Delivers interactive Apache ECharts visualizations for rental spending, revenue trends, and fleet utilization.
- **15-Minute Reservation Hold:** Prevents checkout race conditions through atomic database-backed hold expiration.
- **Integrated Admin Control:** Manages vehicle inventory, pricing overrides, trip statuses, and financial records within the unified application.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, Lucide Icons, Apache ECharts, Axios, Framer Motion |
| **Backend** | Node.js 24.x LTS, Express.js, MongoDB Atlas, Mongoose 8 |
| **Analytics & Charts** | Apache ECharts (`echarts`, `echarts-for-react`) |
| **Payments** | Razorpay SDK / Payment Intent integration |
| **Security & Auth** | JWT authentication, bcrypt password hashing, role-based route guards |
| **Deployment Targets** | Frontend: Vercel • Backend: Render • Database: MongoDB Atlas |

---

## 📸 Screenshots

### Homepage
<p align="center">
  <img src="./screenshots/LandingSection.png" alt="Homepage" width="900">
</p>

### Browse Cars
<p align="center">
  <img src="./screenshots/BrowseCars.png" alt="Browse Cars" width="900">
</p>

### Car Details
<p align="center">
  <img src="./screenshots/CarDetails.png" alt="Car Details" width="900">
</p>

### Booking Page
<p align="center">
  <img src="./screenshots/MyBookings.png" alt="Booking" width="900">
</p>

### Payment
<p align="center">
  <img src="./screenshots/payment.png" alt="Payment" width="900">
</p>

### Dashboard
<p align="center">
  <img src="./screenshots/dashboard.png" alt="Dashboard" width="900">
</p>

### AI Assistant
<p align="center">
  <img src="./screenshots/AiAssistant.png" alt="AI Assistant" width="900">
</p>

### 🛠️ Damage Report
<p align="center">
  <img src="./screenshots/ReportDamageImage.png" alt="Damage Report" width="900">
</p>

### Admin Dashboard
<p align="center">
  <img src="./screenshots/AdminSection.png" alt="Admin Dashboard" width="900">
</p>

### Reports Damage Statistics
<p align="center">
  <img src="./screenshots/ReportDamage.png" alt="Report Damage" width="900">
</p>

---

## 🔑 Demo Credentials

### Administrator Portal (`/admin/login`)
- **Email:** `admin@rentride.com`
- **Password:** `password123`
- *(Includes a 1-Click "Fill Demo Credentials" button on the login screen)*

### Standard Renter Account
- Register a new account via `/signup` or use existing customer credentials.

---

## ⚙️ Environment Variables Setup

### Backend (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/rentride?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
ADMIN_URL=http://localhost:5173/admin
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
```

### Frontend (`Frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/AkshatKardak/RentRide.git
cd RentRide

# Install Backend dependencies
cd backend
npm install

# Install Frontend dependencies
cd ../Frontend
npm install
```

### 2. Import & Normalize Dataset
Populates MongoDB with realistic rental rates and deduplicated vehicles from `data/indian_cars.csv`:
```bash
cd backend
npm run import:cars
```

Dataset structure:
```
data/
├── indian_cars.csv        # Raw Indian automotive market dataset
├── normalized_cars.csv    # Deduplicated & price-normalized fleet catalog
└── import_report.json     # Pipeline execution metrics & statistics
```

### 3. Run Applications Locally
```bash
# In backend directory:
npm run dev

# In Frontend directory (in a new terminal):
npm run dev
```

- **User Portal:** `http://localhost:5173`
- **Admin Portal:** `http://localhost:5173/admin`
- **Backend API:** `http://localhost:5000`

---

## 🚢 Deployment Architecture

- **Frontend (Vercel):** Single unified build output hosting both renter pages and integrated `/admin/*` routes.
- **Backend (Render):** Standard Node.js Express service running on Node 24 LTS runtime with health checks.
- **Database (MongoDB Atlas):** Cloud MongoDB cluster housing persistent vehicle inventories, bookings, and user profiles.

---

## ⚠️ Known Limitations & Notes

- **AI Inspections:** Damage assessment operates with structured image uploads and human administrator approval; automated CV bounding boxes require active vision service keys.
- **Blockchain Passports:** Operates in local verified ledger mode unless an active Polygon RPC endpoint and private key are supplied.
- **Telemetry:** Current telemetry metrics reflect rule-based heuristics; live IoT GPS hardware integration is planned for future iterations.

---

## 📜 License

This project is licensed under the MIT License.

Copyright (c) 2026 **Akshat Kardak** - [GitHub Profile](https://github.com/AkshatKardak)
