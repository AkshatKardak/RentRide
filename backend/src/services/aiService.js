const Groq = require('groq-sdk');
const { HfInference } = require('@huggingface/inference');
const Car = require('../models/Car');

// Initialize clients
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

class AIService {
  constructor() {
    this.groqRequestsToday = 0;
    this.hfRequestsToday = 0;
    this.dailyLimit = 14400;
    this.dailyResetTime = this.getNextMidnightPST();
    this.scheduleReset();
  }

  // ===== FEATURE 1: Natural Language Car Search =====
  async searchCarsNLP(userQuery, filters = {}) {
    try {
      const availableCars = await Car.find({ 
        available: true,
        ...filters 
      }).limit(50);

      if (availableCars.length === 0) {
        return {
          message: "Sorry, no cars match your criteria right now. Try adjusting your requirements?",
          cars: [],
          suggestions: ["Try a different date range", "Consider nearby locations", "Check our upcoming arrivals"]
        };
      }

      const carCatalog = availableCars.map(car => ({
        id: car._id,
        name: car.name,
        brand: car.brand,
        type: car.type,
        seats: car.seats,
        transmission: car.transmission,
        fuel: car.fuelType,
        pricePerDay: car.pricePerDay,
        features: car.features || [],
        rating: car.rating || 0
      }));

      const prompt = `You are a car rental expert helping customers find the perfect car in India.

User request: "${userQuery}"

Available cars (JSON):
${JSON.stringify(carCatalog.slice(0, 20), null, 2)}

Instructions:
1. Analyze the user's needs (budget, type, features, purpose)
2. Recommend the TOP 3 most suitable cars with clear reasons
3. Mention applicable promotions: WEEKEND25 (Fri-Sun), LONGTERM7 (7+ days), LUXURY500 (luxury cars)
4. Be conversational, friendly, and helpful
5. Include prices in ₹ (Indian Rupees)
6. IMPORTANT: Respond ONLY with valid JSON, no extra text

JSON Response Format (strict):
{
  "message": "friendly explanation in 2-3 sentences",
  "recommendations": [
    {
      "carId": "exact id from catalog",
      "carName": "exact name from catalog",
      "reason": "why it's perfect for user's needs",
      "price": "₹X/day",
      "highlights": ["key feature 1", "key feature 2", "key feature 3"]
    }
  ],
  "promoCode": "applicable promo code or null"
}`;

      const result = await this.callGroq(prompt);
      const response = JSON.parse(this.extractJSON(result.content));
      
      // Attach full car details
      response.recommendations = response.recommendations.map(rec => {
        const fullCar = availableCars.find(c => c._id.toString() === rec.carId);
        return { ...rec, carDetails: fullCar };
      });

      return response;

    } catch (error) {
      console.error('NLP Search Error:', error);
      throw new Error('Unable to process your request. Please try browsing cars manually.');
    }
  }

  // ===== FEATURE 5: Insurance Advisor =====
  async adviseInsurance(bookingDetails) {
    const { tripType, days, carType, driverExperience, tripDistance, destination } = bookingDetails;

    const prompt = `You are an insurance advisor for RentRide car rentals in India.

Customer Details:
- Trip type: ${tripType || 'City driving'}
- Duration: ${days} days
- Car: ${carType || 'Standard'}
- Driver experience: ${driverExperience || 'Unknown'} years
- Trip distance: ${tripDistance || 'Not specified'} km
- Destination: ${destination || 'Local'}

Available Insurance Options:
1. Basic CDW: ₹200/day - Covers damage up to ₹5L, ₹5K deductible
2. Theft Protection: ₹50/day - Full theft coverage
3. Personal Accident: ₹100/day - ₹10L coverage
4. Zero Deductible: ₹300/day - CDW + Theft + No deductible
5. Adventure Package: ₹400/day - Off-road/hills coverage

Add-ons: GPS (₹100), Dashcam (₹150/day), Child Seat (₹50/day), Wifi (₹100/day)

Task: Recommend insurance based on trip. Respond ONLY with valid JSON.

JSON Format:
{
  "recommended": [{"item": "name", "price": "₹X", "reason": "why", "priority": "Must Have/Good to Have/Optional"}],
  "notRecommended": ["item"],
  "totalEstimate": "₹X/day",
  "summary": "2-3 sentences"
}`;

    const result = await this.callGroq(prompt);
    return JSON.parse(this.extractJSON(result.content));
  }

  // ===== FEATURE 6: Visual Car Recognition (SIMPLIFIED) =====
  async recognizeCarFromImage(imageBase64) {
    try {
      console.log('🤗 Attempting image analysis...');
      this.hfRequestsToday++;

      // Try Hugging Face image classification
      try {
        const imageBuffer = Buffer.from(imageBase64, 'base64');
        const imageBlob = new Blob([imageBuffer], { type: 'image/jpeg' });

        const classification = await hf.imageClassification({
          data: imageBlob,
          model: 'google/vit-base-patch16-224'
        });

        console.log('✅ HF Classification successful');

        // Basic car type detection from labels
        const labels = classification.map(c => c.label.toLowerCase()).join(' ');
        let bodyType = 'Sedan';
        let seats = 5;

        if (labels.includes('suv') || labels.includes('jeep')) {
          bodyType = 'SUV';
          seats = 7;
        } else if (labels.includes('van') || labels.includes('minivan')) {
          bodyType = 'MUV';
          seats = 7;
        } else if (labels.includes('sports') || labels.includes('convertible')) {
          bodyType = 'Luxury';
          seats = 4;
        } else if (labels.includes('compact') || labels.includes('hatchback')) {
          bodyType = 'Hatchback';
          seats = 5;
        }

        const analysis = {
          identification: classification[0].label,
          bodyType,
          estimatedSeats: seats,
          confidence: (classification[0].score * 100).toFixed(1) + '%',
          features: classification.slice(0, 3).map(c => c.label),
          customerProfile: `Looking for ${bodyType} vehicles`,
          searchKeywords: [bodyType, `${seats}-seater`]
        };

        // Search similar cars
        const similarCars = await Car.find({
          available: true,
          $or: [
            { type: new RegExp(bodyType, 'i') },
            { seats: { $gte: seats - 2, $lte: seats + 2 } }
          ]
        }).limit(10);

        return {
          analysis,
          similarCars,
          message: `Found ${similarCars.length} similar ${bodyType} vehicles! 🚗`
        };

      } catch (hfError) {
        console.log('⚠️ HF image analysis unavailable, using smart fallback...');
        
        // SMART FALLBACK: Use Groq to analyze image description
        // In production, you'd ask user to describe the car
        const allCars = await Car.find({ available: true }).limit(10);
        
        return {
          analysis: {
            identification: 'Image uploaded - showing all available cars',
            bodyType: 'All Types',
            estimatedSeats: 5,
            confidence: 'N/A',
            features: ['Browse available vehicles'],
            customerProfile: 'All customers',
            searchKeywords: ['available', 'cars']
          },
          similarCars: allCars,
          message: 'Showing available cars for you to browse! 🚗'
        };
      }

    } catch (error) {
      console.error('Image recognition error:', error);
      
      // Ultimate fallback
      const cars = await Car.find({ available: true }).limit(10);
      return {
        analysis: { identification: 'Browse all cars', bodyType: 'All', estimatedSeats: 5 },
        similarCars: cars,
        message: 'Here are our available cars!'
      };
    }
  }

  // ===== FEATURE 7: Damage Report (TEXT-BASED - PRACTICAL) =====
  async analyzeDamageReport(damageData) {
    const { photos, location, userDescription } = damageData;

    // Use Groq for text-based analysis (works reliably)
    const prompt = `Auto damage expert for RentRide India.

Report:
- Location: ${location || 'Not specified'}
- Description: "${userDescription}"
${photos && photos.length > 0 ? '- Photos: Uploaded (visual analysis pending)' : ''}

Provide assessment. Respond ONLY with valid JSON:

{
  "customerMessage": "Reassuring 3-4 sentence message with estimated cost and next steps",
  "damageSeverity": "Minor/Moderate/Major/Critical",
  "damageType": "Scratch/Dent/Crack/etc",
  "affectedParts": ["part1"],
  "estimatedRepairCost": {"min": 1500, "max": 5000, "currency": "INR"},
  "insuranceCoverage": "CDW coverage explanation",
  "yourResponsibility": "₹2500 (deductible)",
  "nextSteps": ["Take more photos", "Contact support", "Continue if safe"],
  "urgency": "Continue driving/Stop immediately",
  "canContinueDriving": true,
  "supportContact": "support@rentride.com | +91-9876543210"
}`;

    try {
      const result = await this.callGroq(prompt);
      const report = JSON.parse(this.extractJSON(result.content));

      return {
        damageAnalysis: photos && photos.length > 0 ? { photosUploaded: photos.length } : null,
        customerReport: report,
        reportId: `DR-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        timestamp: new Date(),
        imageProcessed: false,
        aiProvider: 'Groq (text-based analysis)'
      };

    } catch (error) {
      // Fallback report
      return {
        customerReport: {
          customerMessage: `Thank you for reporting damage at ${location}. Description: "${userDescription}". Our team will contact you within 2 hours. If unsafe to drive, call us immediately.`,
          damageSeverity: 'Pending Assessment',
          nextSteps: ['Take clear photos', 'Await support call', 'Drive safely if possible'],
          urgency: 'Await assessment',
          supportContact: 'support@rentride.com | +91-9876543210'
        },
        reportId: `DR-${Date.now()}`,
        timestamp: new Date()
      };
    }
  }

  // ===== Groq Chat =====
  async callGroq(prompt, conversationHistory = []) {
    if (this.groqRequestsToday >= this.dailyLimit) {
      throw new Error('Daily limit reached');
    }

    const messages = [
      {
        role: 'system',
        content: 'RentRide AI for India car rentals. Friendly, helpful, use ₹ prices. Respond in JSON when requested.'
      },
      ...conversationHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      })),
      { role: 'user', content: prompt }
    ];

    const completion = await groq.chat.completions.create({
      messages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 2048
    });

    this.groqRequestsToday++;

    return {
      role: 'assistant',
      content: completion.choices[0].message.content,
      model: 'llama-3.3-70b'
    };
  }

  async chat(userMessage, conversationHistory = []) {
    return await this.callGroq(userMessage, conversationHistory);
  }

  extractJSON(text) {
    text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? jsonMatch[0] : text;
  }

  scheduleReset() {
    setInterval(() => {
      const now = new Date();
      if (now >= this.dailyResetTime) {
        this.groqRequestsToday = 0;
        this.hfRequestsToday = 0;
        this.dailyResetTime = this.getNextMidnightPST();
        console.log('✅ Counters reset');
      }
    }, 60000);
  }

  getNextMidnightPST() {
    const now = new Date();
    const pst = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
    pst.setDate(pst.getDate() + 1);
    pst.setHours(0, 0, 0, 0);
    return pst;
  }
}

module.exports = new AIService();
