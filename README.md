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

**RentRide** is an easy-to-use car rental website where people can browse, book, and rent cars across India. It connects car renters with a verified fleet of vehicles, showing clear daily rental prices, real-time availability, and vehicle trust scores.

The platform uses a single unified frontend (React + Vite) for both customers and administrators, a fast Node.js/Express backend, and MongoDB Atlas for database storage.

---

## 🚀 Core Features

- **Vehicle Search & Filters:** Quickly search and filter cars by brand, category, fuel type, transmission, and budget.
- **Fair Pricing Engine:** Calculates realistic daily rental rates based on car value, category baselines, and weekend demand.
- **Vehicle Trust Score:** Displays an explainable trust rating (0–100) based on vehicle condition and maintenance history.
- **Easy Booking & 15-Min Hold:** Simple reservation flow that holds the car for 15 minutes during checkout to prevent duplicate bookings.
- **Damage Inspection:** Renters and admins can upload and review vehicle photos before and after trips.
- **Digital Vehicle Passport:** Verifiable digital ledger tracking vehicle mileage, service milestones, and inspection records.
- **Admin Dashboard:** Centralized control to manage fleet cars, update prices and images, and monitor bookings.
- **Interactive Analytics:** Interactive Apache ECharts dashboards showing real-time revenue, booking trends, and fleet stats.

---

## 📊 Datasets Used

| Dataset | Taken For What | Source URL |
|---|---|---|
| **Indian Cars Market Dataset** (`data/indian_cars.csv`) | Real Indian car catalog, technical specifications, fuel types, variants, and valuations used to calculate realistic daily rental prices. | [Kaggle Dataset](https://www.kaggle.com/) |
| **Indian Vehicle Dataset** (`data/vehicle_images.csv`) | Reference dataset for Indian vehicle classes, evaluated for image provenance, model-accurate matching, and license compliance. | [Kaggle DataCluster Labs](https://www.kaggle.com/datasets/dataclusterlabs/indian-vehicle-dataset) |
| **RentRide Fleet Photography** (`/assets`) | High-resolution, verified vehicle photographs and permissive stock assets for catalog display. | [Unsplash Automotive](https://unsplash.com) |

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
├── indian_cars.csv           # Raw Indian automotive market dataset
├── normalized_cars.csv       # Deduplicated & price-normalized fleet catalog
├── vehicle_images.csv        # Model-aware verified image mappings & licenses
├── import_report.json        # Fleet catalog metrics & statistics
└── image_import_report.json  # Image mapping audit, SSRF checks & license log
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

## 📜 License

This project is licensed under the MIT License.

Copyright (c) 2026 **Akshat Kardak** - [GitHub Profile](https://github.com/AkshatKardak)
