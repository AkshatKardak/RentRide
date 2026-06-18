const mongoose = require('mongoose');
const Car = require('../models/Car');
require('dotenv').config({ path: '../../.env' });

const PLACEHOLDER_IMAGE = 'https://placehold.co/600x400?text=Car+Image';

const cars = [
  // --- SEDAN ---
  {
    name: 'Swift Dzire', brand: 'Maruti Suzuki', model: 'Dzire',
    year: 2023, color: 'Pearl White', pricePerDay: 1200,
    category: 'sedan', fuelType: 'petrol', transmission: 'manual',
    seats: 5, mileage: 23, location: 'Mumbai', city: 'Mumbai',
    features: ['AC', 'Bluetooth', 'Rear Camera', 'Power Steering'],
    images: [PLACEHOLDER_IMAGE],
    available: true, rating: 4.3, totalReviews: 18,
    description: 'Compact and fuel-efficient sedan, perfect for city drives.'
  },
  {
    name: 'Honda City', brand: 'Honda', model: 'City',
    year: 2023, color: 'Lunar Silver', pricePerDay: 1600,
    category: 'sedan', fuelType: 'petrol', transmission: 'automatic',
    seats: 5, mileage: 17, location: 'Delhi', city: 'Delhi',
    features: ['AC', 'Sunroof', 'Cruise Control', 'Lane Watch', 'Bluetooth'],
    images: [PLACEHOLDER_IMAGE],
    available: true, rating: 4.5, totalReviews: 32,
    description: 'Premium sedan with a refined cabin and smooth automatic gearbox.'
  },
  {
    name: 'Hyundai Verna', brand: 'Hyundai', model: 'Verna',
    year: 2024, color: 'Fiery Red', pricePerDay: 1500,
    category: 'sedan', fuelType: 'petrol', transmission: 'automatic',
    seats: 5, mileage: 18, location: 'Bangalore', city: 'Bangalore',
    features: ['AC', 'Sunroof', 'Ventilated Seats', 'Wireless Charging'],
    images: [PLACEHOLDER_IMAGE],
    available: true, rating: 4.4, totalReviews: 22,
    description: 'Stylish sedan with a sporty stance and feature-loaded interior.'
  },
  {
    name: 'Toyota Camry', brand: 'Toyota', model: 'Camry',
    year: 2023, color: 'Platinum White', pricePerDay: 3500,
    category: 'sedan', fuelType: 'hybrid', transmission: 'automatic',
    seats: 5, mileage: 19, location: 'Mumbai', city: 'Mumbai',
    features: ['AC', 'Sunroof', 'JBL Audio', 'HUD', 'Adaptive Cruise Control'],
    images: [PLACEHOLDER_IMAGE],
    available: true, rating: 4.7, totalReviews: 14,
    description: 'Flagship hybrid sedan delivering class, comfort, and efficiency.'
  },
  {
    name: 'Skoda Slavia', brand: 'Skoda', model: 'Slavia',
    year: 2023, color: 'Candy White', pricePerDay: 1800,
    category: 'sedan', fuelType: 'petrol', transmission: 'automatic',
    seats: 5, mileage: 19, location: 'Pune', city: 'Pune',
    features: ['AC', 'Sunroof', 'Wireless CarPlay', 'Ventilated Seats'],
    images: [PLACEHOLDER_IMAGE],
    available: true, rating: 4.3, totalReviews: 11,
    description: 'European engineering meets Indian roads in this refined mid-size sedan.'
  },

  // --- SUV ---
  {
    name: 'Hyundai Creta', brand: 'Hyundai', model: 'Creta',
    year: 2024, color: 'Atlas White', pricePerDay: 2200,
    category: 'suv', fuelType: 'petrol', transmission: 'automatic',
    seats: 5, mileage: 16, location: 'Mumbai', city: 'Mumbai',
    features: ['AC', 'Panoramic Sunroof', 'ADAS', 'Wireless Charging', 'Bose Sound'],
    images: [PLACEHOLDER_IMAGE],
    available: true, rating: 4.6, totalReviews: 45,
    description: 'India\'s most popular SUV — packed with features and everyday comfort.'
  },
  {
    name: 'Toyota Fortuner', brand: 'Toyota', model: 'Fortuner',
    year: 2023, color: 'Super White', pricePerDay: 4500,
    category: 'suv', fuelType: 'diesel', transmission: 'automatic',
    seats: 7, mileage: 14, location: 'Delhi', city: 'Delhi',
    features: ['AC', '4WD', 'Leather Seats', 'JBL Audio', 'Hill Assist'],
    images: [PLACEHOLDER_IMAGE],
    available: true, rating: 4.8, totalReviews: 28,
    description: 'Commanding SUV for highway road trips and off-road adventures.'
  },
  {
    name: 'Mahindra XUV700', brand: 'Mahindra', model: 'XUV700',
    year: 2023, color: 'Midnight Black', pricePerDay: 2800,
    category: 'suv', fuelType: 'diesel', transmission: 'automatic',
    seats: 7, mileage: 15, location: 'Hyderabad', city: 'Hyderabad',
    features: ['AC', 'Sunroof', 'ADAS', 'Sony 3D Sound', 'Wireless Charging'],
    images: [PLACEHOLDER_IMAGE],
    available: true, rating: 4.5, totalReviews: 36,
    description: 'Feature-rich 7-seater with class-leading ADAS and premium interiors.'
  },
  {
    name: 'Kia Seltos', brand: 'Kia', model: 'Seltos',
    year: 2024, color: 'Glacier White Pearl', pricePerDay: 2000,
    category: 'suv', fuelType: 'petrol', transmission: 'automatic',
    seats: 5, mileage: 16, location: 'Chennai', city: 'Chennai',
    features: ['AC', 'Sunroof', 'Bose Audio', 'ADAS', 'Digital Cluster'],
    images: [PLACEHOLDER_IMAGE],
    available: true, rating: 4.4, totalReviews: 29,
    description: 'Stylish compact SUV with a bold design and tech-forward features.'
  },
  {
    name: 'Tata Safari', brand: 'Tata', model: 'Safari',
    year: 2023, color: 'Oberon Black', pricePerDay: 3000,
    category: 'suv', fuelType: 'diesel', transmission: 'automatic',
    seats: 7, mileage: 14, location: 'Bangalore', city: 'Bangalore',
    features: ['AC', 'Panoramic Sunroof', '360 Camera', 'Terrain Modes', 'JBL Audio'],
    images: [PLACEHOLDER_IMAGE],
    available: true, rating: 4.3, totalReviews: 21,
    description: 'Iconic name reborn as a premium 7-seater SUV built for Indian roads.'
  },
  {
    name: 'MG Hector Plus', brand: 'MG', model: 'Hector Plus',
    year: 2023, color: 'Starry Black', pricePerDay: 2600,
    category: 'suv', fuelType: 'petrol', transmission: 'manual',
    seats: 7, mileage: 14, location: 'Kolkata', city: 'Kolkata',
    features: ['AC', 'Panoramic Sunroof', 'i-SMART AI', 'Wireless CarPlay'],
    images: [PLACEHOLDER_IMAGE],
    available: true, rating: 4.2, totalReviews: 17,
    description: 'Connected SUV with AI-powered features and a massive panoramic sunroof.'
  },
  {
    name: 'Jeep Compass', brand: 'Jeep', model: 'Compass',
    year: 2023, color: 'Exotica Red', pricePerDay: 3200,
    category: 'suv', fuelType: 'diesel', transmission: 'automatic',
    seats: 5, mileage: 16, location: 'Pune', city: 'Pune',
    features: ['AC', 'Sunroof', '4x4', 'McIntosh Audio', 'Heated Seats'],
    images: [PLACEHOLDER_IMAGE],
    available: true, rating: 4.4, totalReviews: 19,
    description: 'Premium off-road capable SUV with authentic Jeep DNA.'
  },

  // --- HATCHBACK ---
  {
    name: 'Maruti Swift', brand: 'Maruti Suzuki', model: 'Swift',
    year: 2024, color: 'Lucent Orange', pricePerDay: 900,
    category: 'hatchback', fuelType: 'petrol', transmission: 'manual',
    seats: 5, mileage: 25, location: 'Mumbai', city: 'Mumbai',
    features: ['AC', 'Bluetooth', 'Rear Camera'],
    images: [PLACEHOLDER_IMAGE],
    available: true, rating: 4.4, totalReviews: 52,
    description: 'Fun-to-drive hatchback with best-in-class fuel efficiency.'
  },
  {
    name: 'Hyundai i20', brand: 'Hyundai', model: 'i20',
    year: 2023, color: 'Fiery Red', pricePerDay: 1100,
    category: 'hatchback', fuelType: 'petrol', transmission: 'automatic',
    seats: 5, mileage: 20, location: 'Delhi', city: 'Delhi',
    features: ['AC', 'Sunroof', 'Wireless CarPlay', 'Bose Audio'],
    images: [PLACEHOLDER_IMAGE],
    available: true, rating: 4.3, totalReviews: 34,
    description: 'Premium hatchback with a sunroof and sporty looks.'
  },
  {
    name: 'Tata Altroz', brand: 'Tata', model: 'Altroz',
    year: 2023, color: 'Avenue White', pricePerDay: 1000,
    category: 'hatchback', fuelType: 'petrol', transmission: 'manual',
    seats: 5, mileage: 19, location: 'Pune', city: 'Pune',
    features: ['AC', 'Harman Audio', 'Rear Camera', 'Wireless CarPlay'],
    images: [PLACEHOLDER_IMAGE],
    available: true, rating: 4.1, totalReviews: 26,
    description: '5-star NCAP safety rated hatchback with a premium cabin.'
  },
  {
    name: 'Volkswagen Polo', brand: 'Volkswagen', model: 'Polo',
    year: 2022, color: 'Candy White', pricePerDay: 1100,
    category: 'hatchback', fuelType: 'petrol', transmission: 'manual',
    seats: 5, mileage: 18, location: 'Bangalore', city: 'Bangalore',
    features: ['AC', 'Bluetooth', 'Cruise Control'],
    images: [PLACEHOLDER_IMAGE],
    available: true, rating: 4.2, totalReviews: 20,
    description: 'Rock-solid German build quality in a fun city hatchback.'
  },
  {
    name: 'Renault Kwid', brand: 'Renault', model: 'Kwid',
    year: 2023, color: 'Moonlight Silver', pricePerDay: 700,
    category: 'hatchback', fuelType: 'petrol', transmission: 'manual',
    seats: 5, mileage: 22, location: 'Jaipur', city: 'Jaipur',
    features: ['AC', 'Touchscreen', 'Rear Camera'],
    images: [PLACEHOLDER_IMAGE],
    available: true, rating: 3.9, totalReviews: 15,
    description: 'Budget-friendly hatchback with SUV styling and high ground clearance.'
  },

  // --- LUXURY ---
  {
    name: 'BMW 3 Series', brand: 'BMW', model: '3 Series',
    year: 2023, color: 'Alpine White', pricePerDay: 8000,
    category: 'luxury', fuelType: 'petrol', transmission: 'automatic',
    seats: 5, mileage: 14, location: 'Mumbai', city: 'Mumbai',
    features: ['AC', 'Sunroof', 'Harman Kardon Audio', 'Heated Seats', 'Park Assist'],
    images: [PLACEHOLDER_IMAGE],
    available: true, rating: 4.8, totalReviews: 12,
    description: 'The ultimate driving machine — sporty, luxurious, and thrilling.'
  },
  {
    name: 'Mercedes C-Class', brand: 'Mercedes-Benz', model: 'C-Class',
    year: 2023, color: 'Obsidian Black', pricePerDay: 9000,
    category: 'luxury', fuelType: 'petrol', transmission: 'automatic',
    seats: 5, mileage: 13, location: 'Delhi', city: 'Delhi',
    features: ['AC', 'Panoramic Sunroof', 'Burmester Audio', 'MBUX', 'Massage Seats'],
    images: [PLACEHOLDER_IMAGE],
    available: true, rating: 4.9, totalReviews: 9,
    description: 'Class-defining luxury sedan with a stunning interior and MBUX infotainment.'
  },
  {
    name: 'Audi A4', brand: 'Audi', model: 'A4',
    year: 2023, color: 'Glacier White', pricePerDay: 8500,
    category: 'luxury', fuelType: 'petrol', transmission: 'automatic',
    seats: 5, mileage: 13, location: 'Bangalore', city: 'Bangalore',
    features: ['AC', 'Virtual Cockpit', 'B&O Audio', 'Matrix LED', 'Heated Seats'],
    images: [PLACEHOLDER_IMAGE],
    available: true, rating: 4.7, totalReviews: 10,
    description: 'Refined executive sedan with Audi\'s signature Virtual Cockpit.'
  },
  {
    name: 'Volvo XC60', brand: 'Volvo', model: 'XC60',
    year: 2023, color: 'Crystal White', pricePerDay: 7500,
    category: 'luxury', fuelType: 'hybrid', transmission: 'automatic',
    seats: 5, mileage: 15, location: 'Hyderabad', city: 'Hyderabad',
    features: ['AC', 'Sunroof', 'Bowers & Wilkins Audio', 'Pilot Assist', 'Air Suspension'],
    images: [PLACEHOLDER_IMAGE],
    available: true, rating: 4.6, totalReviews: 8,
    description: 'Scandinavian luxury SUV with world-class safety tech and PHEV efficiency.'
  },
  {
    name: 'Jaguar XE', brand: 'Jaguar', model: 'XE',
    year: 2022, color: 'Santorini Black', pricePerDay: 7000,
    category: 'luxury', fuelType: 'petrol', transmission: 'automatic',
    seats: 5, mileage: 12, location: 'Mumbai', city: 'Mumbai',
    features: ['AC', 'Sunroof', 'Meridian Audio', 'Adaptive Dynamics', 'Touch Pro'],
    images: [PLACEHOLDER_IMAGE],
    available: true, rating: 4.5, totalReviews: 7,
    description: 'Agile and stylish British sports sedan with a commanding road presence.'
  },

  // --- SPORTS ---
  {
    name: 'Toyota GR86', brand: 'Toyota', model: 'GR86',
    year: 2023, color: 'Ise Silver', pricePerDay: 6000,
    category: 'sports', fuelType: 'petrol', transmission: 'manual',
    seats: 4, mileage: 12, location: 'Mumbai', city: 'Mumbai',
    features: ['AC', 'Sport Suspension', 'Brembo Brakes', 'Track Mode'],
    images: [PLACEHOLDER_IMAGE],
    available: true, rating: 4.7, totalReviews: 6,
    description: 'Pure driver\'s sports coupe — lightweight, balanced, and thrilling.'
  },
  {
    name: 'Hyundai Elantra N', brand: 'Hyundai', model: 'Elantra N',
    year: 2023, color: 'Performance Blue', pricePerDay: 5500,
    category: 'sports', fuelType: 'petrol', transmission: 'automatic',
    seats: 5, mileage: 11, location: 'Pune', city: 'Pune',
    features: ['AC', 'N Grin Control', 'Rev-Match', 'N Launch Control', 'Brembo Brakes'],
    images: [PLACEHOLDER_IMAGE],
    available: true, rating: 4.6, totalReviews: 5,
    description: 'Hot sedan with a dual-clutch gearbox and true performance DNA.'
  },
  {
    name: 'Ford Mustang', brand: 'Ford', model: 'Mustang',
    year: 2023, color: 'Race Red', pricePerDay: 10000,
    category: 'sports', fuelType: 'petrol', transmission: 'automatic',
    seats: 4, mileage: 10, location: 'Mumbai', city: 'Mumbai',
    features: ['AC', 'V8 Engine', 'Brembo Brakes', 'Launch Control', 'B&O Audio'],
    images: [PLACEHOLDER_IMAGE],
    available: true, rating: 4.9, totalReviews: 8,
    description: 'American muscle icon with a 5.0L V8 and spine-tingling exhaust note.'
  },
  {
    name: 'BMW M2', brand: 'BMW', model: 'M2',
    year: 2023, color: 'Brooklyn Grey', pricePerDay: 12000,
    category: 'sports', fuelType: 'petrol', transmission: 'manual',
    seats: 4, mileage: 10, location: 'Delhi', city: 'Delhi',
    features: ['AC', 'M Active Differential', 'Carbon Ceramic Brakes', 'Harman Kardon'],
    images: [PLACEHOLDER_IMAGE],
    available: true, rating: 5.0, totalReviews: 4,
    description: 'The most driver-focused BMW — compact, powerful, and uncompromising.'
  },

  // --- ELECTRIC ---
  {
    name: 'Tata Nexon EV', brand: 'Tata', model: 'Nexon EV',
    year: 2024, color: 'Pristine White', pricePerDay: 2000,
    category: 'electric', fuelType: 'electric', transmission: 'automatic',
    seats: 5, mileage: 0, location: 'Mumbai', city: 'Mumbai',
    features: ['AC', 'Sunroof', 'Fast Charging', 'Connected Car Tech', '465km Range'],
    images: [PLACEHOLDER_IMAGE],
    available: true, rating: 4.4, totalReviews: 31,
    description: 'India\'s best-selling electric SUV with 465km range and connected features.'
  },
  {
    name: 'MG ZS EV', brand: 'MG', model: 'ZS EV',
    year: 2024, color: 'Starry Black', pricePerDay: 2200,
    category: 'electric', fuelType: 'electric', transmission: 'automatic',
    seats: 5, mileage: 0, location: 'Delhi', city: 'Delhi',
    features: ['AC', 'Panoramic Sunroof', 'DC Fast Charging', 'i-SMART', '461km Range'],
    images: [PLACEHOLDER_IMAGE],
    available: true, rating: 4.3, totalReviews: 22,
    description: 'Feature-rich electric SUV with long range and impressive safety ratings.'
  },
  {
    name: 'BYD Atto 3', brand: 'BYD', model: 'Atto 3',
    year: 2024, color: 'Parkour Red', pricePerDay: 2500,
    category: 'electric', fuelType: 'electric', transmission: 'automatic',
    seats: 5, mileage: 0, location: 'Bangalore', city: 'Bangalore',
    features: ['AC', 'Rotating Touchscreen', 'Fast Charging', 'V2L', '521km Range'],
    images: [PLACEHOLDER_IMAGE],
    available: true, rating: 4.5, totalReviews: 18,
    description: 'Premium electric SUV from BYD with a futuristic interior and longest range.'
  },
  {
    name: 'Kia EV6', brand: 'Kia', model: 'EV6',
    year: 2023, color: 'Glacier White Pearl', pricePerDay: 4000,
    category: 'electric', fuelType: 'electric', transmission: 'automatic',
    seats: 5, mileage: 0, location: 'Hyderabad', city: 'Hyderabad',
    features: ['AC', 'Augmented Reality HUD', '800V Fast Charging', 'V2L', '708km Range'],
    images: [PLACEHOLDER_IMAGE],
    available: true, rating: 4.8, totalReviews: 14,
    description: 'Next-gen EV with 800V ultra-fast charging and striking crossover design.'
  },
  {
    name: 'Hyundai Ioniq 5', brand: 'Hyundai', model: 'Ioniq 5',
    year: 2023, color: 'Gravity Gold', pricePerDay: 4200,
    category: 'electric', fuelType: 'electric', transmission: 'automatic',
    seats: 5, mileage: 0, location: 'Chennai', city: 'Chennai',
    features: ['AC', 'Vehicle-to-Load', '800V Fast Charging', 'Relaxation Seats', '631km Range'],
    images: [PLACEHOLDER_IMAGE],
    available: true, rating: 4.7, totalReviews: 12,
    description: 'Retro-futuristic EV with flat-floor platform and ultra-fast 800V charging.'
  },
  {
    name: 'Volvo C40 Recharge', brand: 'Volvo', model: 'C40 Recharge',
    year: 2024, color: 'Fjord Blue', pricePerDay: 5000,
    category: 'electric', fuelType: 'electric', transmission: 'automatic',
    seats: 5, mileage: 0, location: 'Pune', city: 'Pune',
    features: ['AC', 'Google Built-In', 'Harman Kardon', 'Pilot Assist', '530km Range'],
    images: [PLACEHOLDER_IMAGE],
    available: true, rating: 4.6, totalReviews: 9,
    description: 'Premium Swedish EV crossover with a coupé roofline and advanced safety.'
  },
  {
    name: 'BMW iX', brand: 'BMW', model: 'iX',
    year: 2023, color: 'Sophisto Grey', pricePerDay: 9000,
    category: 'electric', fuelType: 'electric', transmission: 'automatic',
    seats: 5, mileage: 0, location: 'Mumbai', city: 'Mumbai',
    features: ['AC', 'Panoramic Sky Lounge', 'Bowers & Wilkins', 'Augmented Reality Nav', '630km Range'],
    images: [PLACEHOLDER_IMAGE],
    available: true, rating: 4.9, totalReviews: 7,
    description: 'BMW\'s flagship electric SAV with sustainable luxury and cutting-edge tech.'
  }
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI or MONGO_URI not set in .env');
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB...');

    await Car.deleteMany({});
    console.log('Cleared existing cars...');

    const inserted = await Car.insertMany(cars);
    console.log(`Successfully seeded ${inserted.length} cars!`);

    await mongoose.disconnect();
    console.log('Done. Disconnected.');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
};

seedDB();
