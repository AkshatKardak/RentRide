# RentRide Backend API

Next-Generation Peer-to-Peer Car Rental Backend built with **Node.js 24**, **Express**, **MongoDB Atlas**, **TensorFlow ML**, and the **Polygon Blockchain**.

## 🚀 7 Game-Changing Features
1. **Real-Time Vehicle Data API (CarsXE)** - Live vehicle specifications and professional HD multi-angle photography.
2. **Blockchain Vehicle Passport (Polygon)** - Tamper-proof ERC-721 vehicle passport, odometer ledger, and service tracking.
3. **AI Predictive Maintenance Score** - ML-based failure probability prediction across 20+ telemetry features.
4. **AI-Powered Smart Recommendations & Dynamic Pricing** - Personalized vehicle suggestions and real-time surge pricing.
5. **Computer Vision Damage Detection** - Bounding-box AI inspection with pre- and post-rental photo comparison.
6. **Real-Time Fleet Analytics Dashboard** - Business metrics, revenue trends, utilization heatmaps, and customer segmentation.
7. **Smart Booking Features** - Instant booking, 15-minute reservation holds, and AI flexible cancellation.

---

## ⚡ Node.js 24 LTS Upgrade
This backend is configured for **Node.js 24.x LTS**.

```bash
# Check node version
node -v # >= 24.0.0

# Install dependencies
npm install

# Run locally
npm run dev
```

---

## 🔑 Environment Variables (`.env`)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/rentride?retryWrites=true&w=majority

# Auth
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d

# CarsXE Real-Time Vehicle API
CARSXE_API_KEY=your_carsxe_api_key
CARSXE_BASE_URL=https://api.carsxe.com

# Polygon Blockchain
POLYGON_RPC_URL=https://polygon-rpc.com
PRIVATE_KEY=your_wallet_private_key
CAR_DNA_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000

# Payments (Razorpay)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key

# AI Providers
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
HUGGINGFACE_API_KEY=your_huggingface_key

# Storage & Communications
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
RESEND_API_KEY=your_resend_api_key
```

---

## 📡 API Endpoints

### 🚗 Live Vehicles (CarsXE)
- `GET /api/vehicles/makes`
- `GET /api/vehicles/makes/:make/models`
- `GET /api/vehicles/specs?make=...&model=...&year=...`
- `GET /api/vehicles/images?make=...&model=...`
- `GET /api/vehicles/vin/:vin`
- `POST /api/vehicles/sync` *(Admin)*

### 🔐 Blockchain Vehicle Passport (Polygon)
- `POST /api/blockchain/mint` *(Admin)*
- `GET /api/blockchain/:carId/history`
- `POST /api/blockchain/:carId/service-record`
- `POST /api/blockchain/:carId/odometer`
- `POST /api/blockchain/:carId/accident-report`

### 🤖 AI Predictive Maintenance
- `GET /api/maintenance/vehicle/:carId`
- `GET /api/maintenance/fleet-report` *(Admin)*
- `POST /api/maintenance/evaluate`

### 🎯 AI Recommendations & Pricing
- `GET /api/recommendations/personalized`
- `GET /api/recommendations/pricing/:carId`

### 🖼️ Computer Vision Damage Detection
- `POST /api/damages/cv-detect`
- `POST /api/damages/compare`
- `POST /api/damages/analyze-ai`

### 📊 Real-Time Fleet Analytics
- `GET /api/analytics/overview` *(Admin)*
- `GET /api/analytics/revenue?days=30` *(Admin)*
- `GET /api/analytics/utilization` *(Admin)*
- `GET /api/analytics/locations` *(Admin)*
- `GET /api/analytics/customers` *(Admin)*
- `GET /api/analytics/maintenance-alerts` *(Admin)*

### ⚡ Smart Bookings
- `POST /api/bookings` (Instant booking, add-ons, promo codes)
- `POST /api/bookings/hold` (15-min reservation hold)
- `PATCH /api/bookings/:id/cancel` (AI cancellation & auto-refund)
- `GET /api/bookings/my-bookings`
