import React, { useState, useEffect } from 'react';
import { ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Cards from './Cards';
import { useTheme } from '@/hooks/useTheme';
import { Reveal, StaggerContainer, StaggerItem } from '@/components/fx';
import { carService } from '@/features/cars/carService';

import RollsRoyce from '@/assets/rolls royce.png';
import Mercedes from '@/assets/mercedes.png';
import Bugatti from '@/assets/Bugatti.png';
import luxury from '@/assets/luxury.png';
import bluecar from '@/assets/bluecar.png';
import blackcar from '@/assets/blackcar.png';

const showcaseCars = [
  {
    id: 1,
    name: "Rolls-Royce Ghost",
    brand: "Rolls-Royce",
    model: "Ghost",
    desc: "Experience handcrafted luxury with whisper-quiet acoustics and effortless power.",
    price: "₹18,000",
    pricePerDay: 18000,
    img: RollsRoyce,
    primaryImage: RollsRoyce,
    city: "Mumbai",
    category: "luxury",
    fuelType: "Petrol",
    transmission: "Automatic",
    trustScore: 98,
    rating: 4.9
  },
  {
    id: 2,
    name: "Mercedes-Benz S-Class",
    brand: "Mercedes-Benz",
    model: "S-Class",
    desc: "Executive flagship sedan featuring active suspension and refined German engineering.",
    price: "₹9,500",
    pricePerDay: 9500,
    img: Mercedes,
    primaryImage: Mercedes,
    city: "Delhi NCR",
    category: "luxury",
    fuelType: "Petrol",
    transmission: "Automatic",
    trustScore: 95,
    rating: 4.8
  },
  {
    id: 3,
    name: "Ferrari 488 GTB",
    brand: "Ferrari",
    model: "488 GTB",
    desc: "Italian twin-turbo V8 supercar delivering thrilling precision and track heritage.",
    price: "₹35,000",
    pricePerDay: 35000,
    img: Bugatti,
    primaryImage: Bugatti,
    city: "Bengaluru",
    category: "sports",
    fuelType: "Petrol",
    transmission: "Automatic",
    trustScore: 99,
    rating: 5.0
  },
  {
    id: 4,
    name: "Bentley Continental GT",
    brand: "Bentley",
    model: "Continental GT",
    desc: "Handcrafted grand tourer combining supreme interior appointments with effortless cruising.",
    price: "₹22,000",
    pricePerDay: 22000,
    img: luxury,
    primaryImage: luxury,
    city: "Mumbai",
    category: "luxury",
    fuelType: "Petrol",
    transmission: "Automatic",
    trustScore: 94,
    rating: 4.8
  },
  {
    id: 5,
    name: "Lamborghini Huracán EVO",
    brand: "Lamborghini",
    model: "Huracán EVO",
    desc: "Naturally aspirated V10 performance machine with dynamic all-wheel steering.",
    price: "₹40,000",
    pricePerDay: 40000,
    img: bluecar,
    primaryImage: bluecar,
    city: "Hyderabad",
    category: "sports",
    fuelType: "Petrol",
    transmission: "Automatic",
    trustScore: 96,
    rating: 4.9
  },
  {
    id: 6,
    name: "Porsche 911 Turbo S",
    brand: "Porsche",
    model: "911 Turbo S",
    desc: "Iconic rear-engine sports car delivering benchmark handling and everyday refinement.",
    price: "₹28,000",
    pricePerDay: 28000,
    img: blackcar,
    primaryImage: blackcar,
    city: "Chennai",
    category: "sports",
    fuelType: "Petrol",
    transmission: "Automatic",
    trustScore: 97,
    rating: 4.9
  }
];

const Inventory = () => {
  const { isDarkMode } = useTheme();
  const [cars, setCars] = useState(showcaseCars);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFeaturedCars();
  }, []);

  const fetchFeaturedCars = async () => {
    try {
      const res = await carService.getFeaturedCars();
      if (res.success && Array.isArray(res.data) && res.data.length >= 6) {
        setCars(res.data.slice(0, 6));
      }
    } catch (err) {
      console.warn('Using elite showcase fleet:', err.message);
    }
  };

  return (
    <section id="inventory" className="py-24 px-4 relative overflow-hidden bg-bg transition-colors duration-300">
      {/* Background Glow */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col space-y-3 text-center mb-12">
          <Reveal direction="down" delay={0.1}>
            <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 mx-auto rounded-full bg-primary-soft border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} /> Curated Fleet Showcase
            </div>
          </Reveal>

          <Reveal direction="up" delay={0.2}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-text font-display tracking-tight">
              Our Featured Fleet
            </h2>
          </Reveal>

          <Reveal direction="up" delay={0.3}>
            <p className="text-sm sm:text-base max-w-lg mx-auto text-text-muted font-sans">
              Real database-driven pricing, transparent vehicle trust scores, and verified availability.
            </p>
          </Reveal>
        </div>

        {/* Cars Grid */}
        <StaggerContainer
          staggerChildren={0.08}
          className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        >
          {cars.map((car) => (
            <StaggerItem key={car._id || car.id}>
              <Cards item={car} />
            </StaggerItem>
          ))}
        </StaggerContainer>

        <Reveal direction="up" delay={0.5} className="pt-12 text-center">
          <Link
            to="/browsecars"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all"
          >
            <span>Explore Complete Fleet</span>
            <ChevronRight size={18} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
};

export default Inventory;
