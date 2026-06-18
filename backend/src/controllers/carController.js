const Car = require('../models/Car');

// Get all cars with filters
exports.getAllCars = async (req, res) => {
  try {
    const {
      category,
      fuelType,
      transmission,
      minPrice,
      maxPrice,
      location,
      city,
      available,
      seats,
      search,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 12
    } = req.query;

    const filter = {};

    if (category) filter.category = category;
    if (fuelType) filter.fuelType = fuelType;
    if (transmission) filter.transmission = transmission;
    if (location) filter.location = new RegExp(location, 'i');
    if (city) filter.city = new RegExp(city, 'i');
    if (seats) filter.seats = Number(seats);
    if (available !== undefined) filter.available = available === 'true';

    if (minPrice || maxPrice) {
      filter.pricePerDay = {};
      if (minPrice) filter.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerDay.$lte = Number(maxPrice);
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const cars = await Car.find(filter)
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Car.countDocuments(filter);

    res.json({
      success: true,
      count: cars.length,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      data: cars
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching cars',
      error: error.message
    });
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

    // Increment popularity on update interaction
    await Car.findByIdAndUpdate(req.params.id, { $inc: { popularityScore: 1 } });

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

// Get featured cars
exports.getFeaturedCars = async (req, res) => {
  try {
    const cars = await Car.find({ available: true })
      .sort({ rating: -1, popularityScore: -1 })
      .limit(6);

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

// Get cars by category
exports.getCarsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const cars = await Car.find({ category, available: true })
      .sort({ rating: -1 });

    res.json({
      success: true,
      count: cars.length,
      data: cars
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching cars by category',
      error: error.message
    });
  }
};
