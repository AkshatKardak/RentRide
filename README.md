<div align="center">
  <img src="./Frontend/public/tab.png" alt="RentRide Logo" width="200">
  
  # RentRide - Car Rental Platform
  ### Next-Gen Peer-to-Peer Mobility with AI & Polygon Blockchain
  
  [![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge)](https://rentridefrontend.vercel.app/)
  [![Admin Panel](https://img.shields.io/badge/Admin-Panel-green?style=for-the-badge)](https://rentrideadmin.vercel.app/)
  [![Backend API](https://img.shields.io/badge/Backend-API-orange?style=for-the-badge)](https://rentridebackend-seven.vercel.app/)
  [![Node.js Version](https://img.shields.io/badge/Node.js-24.x%20LTS-brightgreen?style=for-the-badge&logo=node.js)](https://nodejs.org/)
  [![Polygon Blockchain](https://img.shields.io/badge/Blockchain-Polygon-purple?style=for-the-badge&logo=polygon)](https://polygon.technology/)
  
</div>

---

## 🌟 Overview

**RentRide** is a full-stack peer-to-peer car rental platform powered by **Node.js 24**, **MongoDB**, **React.js**, **TensorFlow AI**, and the **Polygon Blockchain**. It combines live vehicle telemetry with tamper-proof blockchain passports, predictive maintenance scoring, computer vision damage detection, dynamic pricing, and real-time fleet analytics.

### 🔗 Live Links

- **Frontend (User Portal):** [https://rentridefrontend.vercel.app/](https://rentridefrontend.vercel.app/)
- **Admin Panel:** [https://rentrideadmin.vercel.app/](https://rentrideadmin.vercel.app/)
- **Backend API:** [https://rentridebackend-seven.vercel.app/](https://rentridebackend-seven.vercel.app/)

### 🔑 Demo Credentials

**Admin Access:**
- Email: `admin@rentride.com`
- Password: `password123`

**Test User:**
- Email: `user@example.com`
- Password: `user123`

---

## 🚀 7 Game-Changing Features

### 1. 🚗 Real-Time Vehicle Data API (CarsXE Integration)
- **Live Specs & Trim Data:** Direct access to engine specifications, power, torque, drivetrain, transmission, and seating configurations across Indian & global automakers (Maruti Suzuki, Hyundai, Tata, Mahindra, Kia, Toyota, BMW, Mercedes-Benz).
- **Multi-Angle HD Imagery:** Automatic retrieval of studio-grade front, rear, side, and interior vehicle images.
- **Instant VIN Decoding:** Decode vehicle identification numbers to auto-populate year, make, trim, and manufacturing origin.
- **Automated Fleet Sync:** Scheduled background synchronization ensuring catalog freshness.

### 2. 🔐 Blockchain Vehicle Passport (Polygon ERC-721)
- **Tamper-Proof Digital DNA:** Mints an ERC-721 NFT vehicle passport on the Polygon blockchain for every listed car.
- **Immutable Odometer Logs:** Cryptographically hashed GPS + timestamp verified mileage records to eliminate odometer rollback fraud.
- **Permanent Service History:** Authorized garages record repairs, maintenance, and fluid changes directly to the blockchain ledger.
- **Accident & Insurance Ledger:** Verifiable accident reports signed by insurance partners to guarantee full vehicle transparency.

### 3. 🤖 AI Predictive Maintenance Score
- **TensorFlow ML Failure Prediction:** Evaluates 20+ telemetry metrics (age, cumulative mileage, service intervals, weather/climate exposure, urban/highway driving ratio, brake and tire wear levels).
- **Component-Specific Risk Forecasting:** Early warnings with estimated remaining kilometers for high-wear components (brake pads, battery health, tires, engine oil, AC filters).
- **Automated Action Schedules & Badging:** Classifies vehicle reliability into `EXCELLENT`, `GOOD`, `FAIR`, or `POOR` with instant action recommendations.

### 4. 🎯 AI-Powered Smart Recommendations & Dynamic Pricing
- **Personalized Car Suggestions:** Hybrid collaborative and content-based recommendation engine analyzing user rental history, preferred makes, budget ranges, and trip purposes.
- **Demand Forecasting & Surge Optimization:** Real-time dynamic pricing model adjusting rates based on weekend demand, holiday seasons, regional availability, and weather forecasts.
- **Intelligent Match Explanations:** Clear AI-generated reasoning for each recommendation to maximize booking conversion.

### 5. 🖼️ Computer Vision Damage Detection
- **Automated Bounding-Box Detection:** Computer vision model scanning vehicle photos to locate scratches, dents, bumper cracks, and paint chips.
- **Automated Severity & Repair Costing:** Instant defect categorization (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) with estimated repair costs in INR.
- **Pre- vs. Post-Rental Inspection Comparison:** AI diff analyzer comparing check-in and return photos to automatically verify security deposit refunds or initiate damage claims.

### 6. 📊 Real-Time Fleet Analytics Dashboard
- **Fleet Utilization & Revenue Metrics:** Live tracking of available, booked, and maintenance vehicles with utilization percentages and revenue breakdowns.
- **Geospatial City Heatmaps:** Visual analytics of high-demand pickup/dropoff hubs across major metropolitan regions.
- **Customer Segmentation:** Automated classification into VIP, Regular, and Occasional customer tiers for targeted promotions.
- **Proactive Maintenance Alerts:** Immediate admin alerts for vehicles falling below safety and health thresholds.

### 7. ⚡ Smart Booking Features
- **Instant Booking Engine:** Zero-wait automated confirmation for verified users with high trust ratings.
- **15-Minute Reservation Hold:** Temporary lock preventing race conditions during checkout with automatic expiration timers.
- **AI Flexible Cancellation:** Dynamic cancellation fee computation based on hours until pickup and mitigating emergencies with automated payment refunds.

---

## ⚠️ Node.js 24 LTS Upgrade

RentRide is built and configured for **Node.js 24.x LTS** for enhanced Vercel performance, native cryptographic speedups, and long-term deployment stability.

### Engine Configuration:
```json
"engines": {
  "node": "24.x"
}
```

```bash
# Switch to Node.js 24 locally
nvm install 24
nvm use 24
```

---

## Screenshots

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

## 🛠️ Tech Stack

| Domain | Technologies |
|---|---|
| **Frontend** | React.js 18, Vite, Tailwind CSS, Lucide Icons, Axios, Firebase Auth |
| **Backend** | Node.js 24.x, Express.js, MongoDB Atlas, Mongoose 8 |
| **Blockchain** | Polygon PoS, Ethers.js v6, Web3.js, Smart Contract ERC-721 |
| **Artificial Intelligence** | TensorFlow.js, Google Gemini Pro API, Groq LLaMA 3.3, Hugging Face Vision |
| **Payments & Cloud** | Razorpay SDK, Cloudinary, Firebase Admin SDK, Resend |
| **DevOps & Hosting** | Vercel Serverless (Node 24 Runtime), Git, GitHub Actions |

---

## 🏗️ Architecture

```
car-rental-mern/
├── .nvmrc                         # Node.js 24.0.0 Version Lock
├── .node-version                  # Runtime Version
├── Frontend/                      # React Frontend Application
│   ├── src/
│   │   ├── components/            # UI Components (Auth, Layout, Common)
│   │   ├── context/               # Theme & Auth State Management
│   │   ├── pages/                 # Home, Browse, CarDetails, Bookings, Dashboard
│   │   └── services/              # API Client Services
│   └── package.json
│
├── backend/                       # Node.js 24 Express Backend API
│   ├── src/
│   │   ├── config/                # DB & SDK Integrations
│   │   ├── controllers/           # REST Controllers
│   │   │   ├── vehicleApiController.js       # CarsXE Specs & Images
│   │   │   ├── blockchainController.js       # Polygon Passport & DNA
│   │   │   ├── predictiveMaintenanceController.js # ML Health Scores
│   │   │   ├── recommendationController.js   # AI Recommendations & Dynamic Pricing
│   │   │   ├── damageReportController.js     # CV Damage Detection & Compare
│   │   │   ├── analyticsController.js        # Real-Time Fleet Analytics
│   │   │   ├── bookingController.js          # Smart Bookings & Holds
│   │   │   └── ...
│   │   ├── models/                # Mongoose Schemas (Car, Booking, User, DamageReport)
│   │   ├── routes/                # Modular Express Route Handlers
│   │   │   ├── vehicleApiRoutes.js
│   │   │   ├── blockchainRoutes.js
│   │   │   ├── predictiveMaintenanceRoutes.js
│   │   │   ├── recommendationRoutes.js
│   │   │   ├── analyticsRoutes.js
│   │   │   ├── bookingRoutes.js
│   │   │   └── ...
│   │   ├── services/              # Core Business & AI Services
│   │   │   ├── vehicleApiService.js          # CarsXE Service
│   │   │   ├── blockchainService.js          # Polygon Passport Service
│   │   │   ├── predictiveMaintenance.js      # TensorFlow Maintenance
│   │   │   ├── recommendationService.js      # AI Recommendation & Pricing
│   │   │   ├── damageDetectionService.js     # Computer Vision Damage
│   │   │   ├── analyticsService.js           # Fleet Analytics Aggregations
│   │   │   └── paymentService.js             # Razorpay & Payment Intents
│   │   └── app.js                 # Express Application Entry
│   ├── server.js                  # Serverless Export
│   ├── vercel.json                # Vercel Deployment Configuration
│   └── package.json               # Node 24 Dependencies
│
├── screenshots/                   # Application Visual Previews
└── README.md                      # Project Documentation
```

---

## 📡 API Reference Overview

### 🚗 CarsXE Vehicle API (`/api/vehicles`)
- `GET /api/vehicles/makes` - List available vehicle makes
- `GET /api/vehicles/makes/:make/models` - List models for a specific manufacturer
- `GET /api/vehicles/specs?make=...&model=...&year=...` - Fetch live vehicle specifications
- `GET /api/vehicles/images?make=...&model=...` - Fetch professional multi-angle images
- `GET /api/vehicles/vin/:vin` - Decode VIN to full vehicle data
- `POST /api/vehicles/sync` - Synchronize live vehicle database *(Admin)*

### 🔐 Blockchain Vehicle Passport (`/api/blockchain`)
- `POST /api/blockchain/mint` - Mint ERC-721 vehicle passport on Polygon *(Admin)*
- `GET /api/blockchain/:carId/history` - Retrieve immutable vehicle DNA & service ledger
- `POST /api/blockchain/:carId/service-record` - Log certified service event
- `POST /api/blockchain/:carId/odometer` - Commit verified odometer reading
- `POST /api/blockchain/:carId/accident-report` - Log insurance-backed accident report

### 🤖 AI Predictive Maintenance (`/api/maintenance`)
- `GET /api/maintenance/vehicle/:carId` - Calculate vehicle health score & failure risks
- `GET /api/maintenance/fleet-report` - Fleet-wide maintenance health summary *(Admin)*
- `POST /api/maintenance/evaluate` - Test telemetry payload against ML model

### 🎯 AI Recommendations & Pricing (`/api/recommendations`)
- `GET /api/recommendations/personalized` - Get personalized car recommendations
- `GET /api/recommendations/pricing/:carId` - Get demand-forecasted dynamic rate

### 🖼️ Computer Vision Damage Detection (`/api/damages`)
- `POST /api/damages/cv-detect` - AI visual inspection with bounding box localization
- `POST /api/damages/compare` - Compare pre-rental & return damage reports for security deposit release

### 📊 Real-Time Fleet Analytics (`/api/analytics`)
- `GET /api/analytics/overview` - Fleet stats, revenue, utilization rate *(Admin)*
- `GET /api/analytics/revenue?days=30` - Revenue trends & car category breakdown *(Admin)*
- `GET /api/analytics/utilization` - Car utilization heatmap *(Admin)*
- `GET /api/analytics/locations` - Top pickup and drop-off hubs *(Admin)*
- `GET /api/analytics/customers` - Customer RFM segmentation *(Admin)*
- `GET /api/analytics/maintenance-alerts` - Proactive vehicle health warnings *(Admin)*

### ⚡ Smart Bookings (`/api/bookings`)
- `POST /api/bookings` - Create smart booking with instant confirmation & add-ons
- `POST /api/bookings/hold` - Create 15-minute temporary reservation hold
- `PATCH /api/bookings/:id/cancel` - AI flexible cancellation with auto-refund calculation
- `GET /api/bookings/my-bookings` - Fetch user's active & past trips

---

## ⚙️ Environment Variables Setup

Create `.env` in `backend/`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/rentride?retryWrites=true&w=majority

# Security
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# CORS
CLIENT_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174

# CarsXE Real-Time Vehicle Data API
CARSXE_API_KEY=your_carsxe_api_key_here
CARSXE_BASE_URL=https://api.carsxe.com

# Polygon Blockchain Vehicle Passport
POLYGON_RPC_URL=https://polygon-rpc.com
PRIVATE_KEY=your_wallet_private_key
CAR_DNA_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000

# Payments (Razorpay)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key

# AI & LLM Providers
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
HUGGINGFACE_API_KEY=your_huggingface_api_key

# Cloud Storage & Email
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
RESEND_API_KEY=your_resend_api_key
```

---

## 🚀 Getting Started

### 1. Clone Repository
```bash
git clone https://github.com/AkshatKardak/car-rental-mern.git
cd car-rental-mern
```

### 2. Backend Setup (Node 24)
```bash
cd backend
npm install
npm run dev
```
API runs on `http://localhost:5000`

### 3. Frontend Setup
```bash
cd ../Frontend
npm install
npm run dev
```
App runs on `http://localhost:5173`

---

## 🤝 Contributing
We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/car-rental-mern.git
   cd car-rental-mern
   ```
3. Create a feature branch:
   ```bash
   git checkout -b feature/AmazingFeature
   ```
4. Commit your changes:
   ```bash
   git commit -m "Add: Amazing new feature"
   ```
5. Push to your fork and create a Pull Request.

---

## 📜 License
This project is licensed under the MIT License.

Copyright (c) 2026 **Akshat Kardak** - [GitHub Profile](https://github.com/AkshatKardak)

---

### 📞 Support
- 📧 Email: `kardakakshat@gmail.com`
- 🐛 Bug Reports: Create an Issue on GitHub
- 💬 Discussions: GitHub Discussions
