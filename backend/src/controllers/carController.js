const Car = require('../models/Car');

// Get all cars with comprehensive database-backed filters
exports.getAllCars = async (req, res) => {
  try {
    const {
      brand,
      model,
      category,
      fuelType,
      transmission,
      minPrice,
      maxPrice,
      location,
      city,
      seats,
      available,
      minRating,
      minTrustScore,
      search,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 12
    } = req.query;

    const filter = {};

    // Exact or Regex Filters
    if (brand && brand !== 'All') filter.brand = new RegExp(`^${brand}$`, 'i');
    if (model && model !== 'All') filter.model = new RegExp(model, 'i');
    if (category && category !== 'All') filter.category = category.toLowerCase();
    if (fuelType && fuelType !== 'All') filter.fuelType = fuelType.toLowerCase();
    if (transmission && transmission !== 'All') filter.transmission = transmission.toLowerCase();
    
    if (city && city !== 'All') {
      filter.$or = [
        { city: new RegExp(city, 'i') },
        { location: new RegExp(city, 'i') }
      ];
    } else if (location && location !== 'All') {
      filter.$or = [
        { city: new RegExp(location, 'i') },
        { location: new RegExp(location, 'i') }
      ];
    }

    if (seats && seats !== 'All') filter.seats = Number(seats);
    if (available !== undefined && available !== 'All') filter.available = available === 'true';

    // Price Range Filter
    if (minPrice || maxPrice) {
      filter.pricePerDay = {};
      if (minPrice && !isNaN(minPrice)) filter.pricePerDay.$gte = Number(minPrice);
      if (maxPrice && !isNaN(maxPrice)) filter.pricePerDay.$lte = Number(maxPrice);
    }

    // Rating & Trust Filters
    if (minRating && !isNaN(minRating)) {
      filter.rating = { $gte: Number(minRating) };
    }
    if (minTrustScore && !isNaN(minTrustScore)) {
      filter.trustScore = { $gte: Number(minTrustScore) };
    }

    // General Search (Brand, Model, Name, City)
    if (search && search.trim()) {
      const q = search.trim();
      const regex = new RegExp(q, 'i');
      filter.$or = [
        { brand: regex },
        { model: regex },
        { variant: regex },
        { name: regex },
        { city: regex },
        { location: regex },
        { category: regex }
      ];
    }

    const sortOptions = {};
    if (sortBy === 'price') sortOptions.pricePerDay = order === 'asc' ? 1 : -1;
    else if (sortBy === 'rating') sortOptions.rating = order === 'asc' ? 1 : -1;
    else if (sortBy === 'trust') sortOptions.trustScore = order === 'asc' ? 1 : -1;
    else sortOptions[sortBy] = order === 'desc' ? -1 : 1;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));

    const cars = await Car.find(filter)
      .sort(sortOptions)
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const count = await Car.countDocuments(filter);

    res.json({
      success: true,
      count: cars.length,
      total: count,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      data: cars
    });
  } catch (error) {
    console.error('Error fetching cars:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cars',
      error: error.message
    });
  }
};

// Get distinct filter options directly from database
exports.getFilterOptions = async (req, res) => {
  try {
    const [brands, categories, cities, fuelTypes, transmissions] = await Promise.all([
      Car.distinct('brand'),
      Car.distinct('category'),
      Car.distinct('city'),
      Car.distinct('fuelType'),
      Car.distinct('transmission')
    ]);

    const priceBounds = await Car.aggregate([
      {
        $group: {
          _id: null,
          minPrice: { $min: '$pricePerDay' },
          maxPrice: { $max: '$pricePerDay' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        brands: ['All', ...brands.filter(Boolean).sort()],
        categories: ['All', ...categories.filter(Boolean).sort()],
        cities: ['All', ...cities.filter(Boolean).sort()],
        fuelTypes: ['All', ...fuelTypes.filter(Boolean).sort()],
        transmissions: ['All', ...transmissions.filter(Boolean).sort()],
        priceRange: {
          min: priceBounds[0]?.minPrice || 1000,
          max: priceBounds[0]?.maxPrice || 15000
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single car
exports.getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    res.json({
      success: true,
      data: car
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching car',
      error: error.message
    });
  }
};

// Get featured cars for landing page
exports.getFeaturedCars = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const cars = await Car.find({ available: true, status: 'active' })
      .sort({ rating: -1, trustScore: -1 })
      .limit(limit);

    res.json({
      success: true,
      count: cars.length,
      data: cars
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching featured cars',
      error: error.message
    });
  }
};

// Create car (Admin only)
exports.createCar = async (req, res) => {
  try {
    const car = await Car.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Car created successfully',
      data: car
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating car',
      error: error.message
    });
  }
};

// Update car (Admin only)
exports.updateCar = async (req, res) => {
  try {
    const car = await Car.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    res.json({
      success: true,
      message: 'Car updated successfully',
      data: car
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating car',
      error: error.message
    });
  }
};

// Delete car (Admin only)
exports.deleteCar = async (req, res) => {
  try {
    const car = await Car.findByIdAndDelete(req.params.id);
    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    res.json({
      success: true,
      message: 'Car deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting car',
      error: error.message
    });
  }
};
