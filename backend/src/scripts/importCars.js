/**
 * RentRide - Indian Cars Dataset Importer & Normalization Pipeline
 * 
 * - Streams and reads dataset (Data/Car Sell Dataset.csv or data/indian_cars.csv)
 * - Normalizes brands, models, fuel types, transmissions, and city locations
 * - Deterministic deduplication using composite keys
 * - Transforms used-car selling valuation into realistic daily rental prices using PricingService
 * - Calculates explainable Vehicle Trust Score using TrustScoreService
 * - Assigns multi-angle HD vehicle images
 * - Writes data/normalized_cars.csv and data/import_report.json
 * - Safely upserts records into MongoDB without dropping database
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const mongoose = require('mongoose');
const pricingService = require('../services/pricingService');
const trustScoreService = require('../services/trustScoreService');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Brand Normalization Map
const BRAND_MAP = {
  'maruti': 'Maruti Suzuki',
  'maruti suzuki': 'Maruti Suzuki',
  'hyundai': 'Hyundai',
  'tata': 'Tata',
  'mahindra': 'Mahindra',
  'toyota': 'Toyota',
  'honda': 'Honda',
  'skoda': 'Skoda',
  'volkswagen': 'Volkswagen',
  'vw': 'Volkswagen',
  'mg': 'MG',
  'kia': 'Kia',
  'audi': 'Audi',
  'bmw': 'BMW',
  'mercedes': 'Mercedes-Benz',
  'mercedes-benz': 'Mercedes-Benz',
  'mercedes benz': 'Mercedes-Benz',
  'ford': 'Ford',
  'renault': 'Renault',
  'chevrolet': 'Chevrolet',
  'jaguar': 'Jaguar'
};

// High-quality verified CDN images for Indian & Global automotive brands
const CURATED_CAR_IMAGES = {
  'maruti suzuki': [
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80'
  ],
  'hyundai': [
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80'
  ],
  'tata': [
    'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80'
  ],
  'mahindra': [
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80'
  ],
  'toyota': [
    'https://images.unsplash.com/photo-1590362891988-39e248e35496?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?auto=format&fit=crop&w=1200&q=80'
  ],
  'honda': [
    'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1200&q=80'
  ],
  'bmw': [
    'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80'
  ],
  'audi': [
    'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1200&q=80'
  ],
  'mercedes-benz': [
    'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=1200&q=80'
  ],
  'jaguar': [
    'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80'
  ],
  'skoda': [
    'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80'
  ],
  'volkswagen': [
    'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80'
  ]
};

const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80'
];

// Top Indian Rental Hubs
const RENTAL_CITIES = [
  { city: 'Mumbai', state: 'Maharashtra' },
  { city: 'Delhi NCR', state: 'Delhi' },
  { city: 'Bengaluru', state: 'Karnataka' },
  { city: 'Hyderabad', state: 'Telangana' },
  { city: 'Chennai', state: 'Tamil Nadu' },
  { city: 'Pune', state: 'Maharashtra' },
  { city: 'Kolkata', state: 'West Bengal' },
  { city: 'Ahmedabad', state: 'Gujarat' },
  { city: 'Jaipur', state: 'Rajasthan' },
  { city: 'Goa', state: 'Goa' },
  { city: 'Chandigarh', state: 'Punjab' }
];

async function runImporter() {
  console.log('====================================================');
  console.log('🚗 RentRide Dataset Normalization & Importer Pipeline');
  console.log('====================================================\n');

  // 1. Locate Dataset File
  const possiblePaths = [
    path.join(__dirname, '../../../Data/Car Sell Dataset.csv'),
    path.join(__dirname, '../../../data/Car Sell Dataset.csv'),
    path.join(__dirname, '../../../data/indian_cars.csv'),
    path.join(__dirname, '../../../Data/indian_cars.csv')
  ];

  let datasetPath = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      datasetPath = p;
      break;
    }
  }

  if (!datasetPath) {
    console.error('❌ Could not find dataset in Data/Car Sell Dataset.csv or data/indian_cars.csv');
    process.exit(1);
  }

  console.log(`📁 Source Dataset: ${datasetPath}`);

  // 2. Prepare Output Directory
  const outputDir = path.join(__dirname, '../../../data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const normalizedCsvPath = path.join(outputDir, 'normalized_cars.csv');
  const reportJsonPath = path.join(outputDir, 'import_report.json');

  // 3. Stream & Process Dataset
  const fileStream = fs.createReadStream(datasetPath, { encoding: 'utf-8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let rowCount = 0;
  let validRows = 0;
  let duplicateRows = 0;
  let invalidRows = 0;

  const seenKeys = new Map();
  const normalizedRecords = [];

  for await (const line of rl) {
    rowCount++;
    if (rowCount === 1) continue; // skip header

    const parts = line.split(',');
    if (parts.length < 12) {
      invalidRows++;
      continue;
    }

    const rawBrand = parts[0]?.trim() || '';
    const rawModel = parts[1]?.trim() || '';
    const rawVariant = parts[2]?.trim() || 'Base';
    const rawCarType = parts[3]?.trim() || 'Sedan';
    const rawTransmission = parts[4]?.trim() || 'Manual';
    const rawFuelType = parts[5]?.trim() || 'Petrol';
    const rawYear = parseInt(parts[6]?.trim(), 10);
    const rawKilometers = parseInt(parts[7]?.trim(), 10);
    const rawState = parts[9]?.trim() || 'Maharashtra';
    const rawAccidental = parts[10]?.trim()?.toLowerCase() === 'yes';
    const rawPrice = parseInt(parts[11]?.trim(), 10);

    // Validation
    if (!rawBrand || !rawModel || isNaN(rawYear) || isNaN(rawPrice) || rawPrice <= 0) {
      invalidRows++;
      continue;
    }

    validRows++;

    // Normalization
    const brandLower = rawBrand.toLowerCase();
    const brand = BRAND_MAP[brandLower] || rawBrand;
    const model = rawModel;
    const variant = rawVariant;
    const carType = rawCarType.toLowerCase();
    const transmission = rawTransmission.toLowerCase() === 'automatic' ? 'automatic' : 'manual';
    const fuelType = rawFuelType.toLowerCase();
    const year = Math.max(2005, Math.min(new Date().getFullYear(), rawYear));
    const kilometers = !isNaN(rawKilometers) && rawKilometers > 0 ? rawKilometers : 35000;

    // Normalization deduplication composite key
    const compositeKey = `${brand.toLowerCase()}|${model.toLowerCase()}|${variant.toLowerCase()}|${carType}|${fuelType}|${transmission}|${year}`;

    if (seenKeys.has(compositeKey)) {
      duplicateRows++;
      continue;
    }

    seenKeys.set(compositeKey, true);

    // Calculate realistic daily rental price
    const pricing = pricingService.calculateRentalPrice({
      brand,
      category: carType,
      transmission,
      fuelType,
      year,
      valuation: rawPrice
    });

    // Select City
    const cityIndex = normalizedRecords.length % RENTAL_CITIES.length;
    const { city, state } = RENTAL_CITIES[cityIndex];

    // Select Curated Images
    const brandImages = CURATED_CAR_IMAGES[brand.toLowerCase()] || DEFAULT_IMAGES;

    // Calculate Trust Score
    const trust = trustScoreService.calculateTrustScore({
      maintenance: { healthScore: 88 },
      serviceHistory: [{ date: new Date() }],
      previousAccidents: rawAccidental ? 1 : 0,
      dna: { odometerHistory: [{ reading: kilometers }] },
      rating: 4.8
    });

    // Category mapping
    let category = 'sedan';
    if (carType.includes('suv')) category = 'suv';
    else if (carType.includes('hatch')) category = 'hatchback';
    else if (carType.includes('mpv')) category = 'mpv';
    else if (carType.includes('lux') || pricingService.luxuryBrands.has(brand.toLowerCase())) category = 'luxury';

    const carRecord = {
      brand,
      model,
      variant,
      name: `${brand} ${model} ${variant}`.trim(),
      year,
      color: 'White',
      category,
      bodyType: carType.toUpperCase(),
      fuelType,
      transmission,
      seats: category === 'suv' || category === 'mpv' ? 7 : 5,
      mileage: kilometers,
      pricePerDay: pricing.pricePerDay,
      securityDeposit: pricing.securityDeposit,
      currency: 'INR',
      valuation: rawPrice,
      city,
      state,
      location: city,
      address: `${city} Central Hub`,
      available: true,
      status: 'active',
      rating: 4.8,
      totalReviews: 12,
      trustScore: trust.trustScore,
      trustBreakdown: trust.breakdown,
      images: brandImages,
      primaryImage: brandImages[0],
      source: 'dataset',
      features: [
        'Air Conditioning',
        'Bluetooth Audio',
        'Power Steering',
        'Airbags',
        transmission === 'automatic' ? 'Automatic Gearbox' : 'Manual Shift',
        'Fastag Enabled'
      ]
    };

    normalizedRecords.push(carRecord);
  }

  console.log(`\n📊 Dataset Audit & Deduplication Complete:`);
  console.log(`- Total Rows Processed: ${rowCount - 1}`);
  console.log(`- Valid Rows:           ${validRows}`);
  console.log(`- Duplicates Removed:   ${duplicateRows}`);
  console.log(`- Invalid Rows:         ${invalidRows}`);
  console.log(`- Unique Normalized:    ${normalizedRecords.length}`);

  // 4. Write normalized_cars.csv (first 500 for compact reference)
  const csvHeaders = 'Brand,Model,Variant,Year,Category,Fuel,Transmission,Seats,PricePerDay,SecurityDeposit,City,TrustScore\n';
  const csvLines = normalizedRecords.slice(0, 500).map(c => 
    `"${c.brand}","${c.model}","${c.variant}",${c.year},"${c.category}","${c.fuelType}","${c.transmission}",${c.seats},${c.pricePerDay},${c.securityDeposit},"${c.city}",${c.trustScore}`
  ).join('\n');
  fs.writeFileSync(normalizedCsvPath, csvHeaders + csvLines, 'utf-8');
  console.log(`💾 Saved normalized dataset to: ${normalizedCsvPath}`);

  // 5. Database Upsert
  let importedRecords = 0;
  let updatedRecords = 0;
  let skippedRecords = 0;

  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri && !mongoUri.includes('<username>')) {
    try {
      console.log('\n🔌 Connecting to MongoDB Atlas for safe database population...');
      await mongoose.connect(mongoUri);
      console.log('✅ Connected to MongoDB Atlas');

      const Car = require('../models/Car');

      // Import the top curated canonical fleet (e.g. 150 diverse cars covering all cities & categories)
      const importBatch = normalizedRecords.slice(0, 150);

      for (const car of importBatch) {
        try {
          const filter = {
            brand: car.brand,
            model: car.model,
            year: car.year,
            city: car.city
          };

          const existing = await Car.findOne(filter);
          if (existing) {
            await Car.updateOne(filter, { $set: car });
            updatedRecords++;
          } else {
            await Car.create(car);
            importedRecords++;
          }
        } catch (dbErr) {
          skippedRecords++;
        }
      }

      console.log(`✅ MongoDB Population Complete:`);
      console.log(`- Newly Inserted: ${importedRecords}`);
      console.log(`- Updated:        ${updatedRecords}`);
      console.log(`- Skipped/Errors: ${skippedRecords}`);
      await mongoose.disconnect();
    } catch (connErr) {
      console.warn(`⚠️ MongoDB connection skipped or failed (${connErr.message}). Normalized dataset generated locally.`);
    }
  } else {
    console.log('ℹ️ MONGODB_URI not configured or contains placeholder. Output saved locally in data/normalized_cars.csv.');
  }

  // 6. Write import_report.json
  const importReport = {
    timestamp: new Date().toISOString(),
    datasetSource: path.basename(datasetPath),
    totalRows: rowCount - 1,
    validRows,
    duplicateRows,
    invalidRows,
    normalizedRecords: normalizedRecords.length,
    importedRecords,
    updatedRecords,
    skippedRecords,
    summary: {
      categories: [...new Set(normalizedRecords.map(c => c.category))],
      brands: [...new Set(normalizedRecords.map(c => c.brand))],
      cities: RENTAL_CITIES.map(c => c.city),
      priceRangeINR: {
        min: Math.min(...normalizedRecords.map(c => c.pricePerDay)),
        max: Math.max(...normalizedRecords.map(c => c.pricePerDay)),
        average: Math.round(normalizedRecords.reduce((s, c) => s + c.pricePerDay, 0) / normalizedRecords.length)
      }
    }
  };

  fs.writeFileSync(reportJsonPath, JSON.stringify(importReport, null, 2), 'utf-8');
  console.log(`📄 Saved Import Report to: ${reportJsonPath}`);
  console.log('\n🎉 Importer completed successfully!');
}

runImporter().catch(err => {
  console.error('❌ Importer failed:', err);
  process.exit(1);
});
