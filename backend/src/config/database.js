const dns = require('dns');
try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
    // Ignore in environments where setServers is restricted
}
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Return early if already connected
        if (mongoose.connection.readyState === 1) {
            console.log('MongoDB already connected');
            return mongoose.connection;
        }

        if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('<username>')) {
            console.warn('⚠️ MONGODB_URI not configured or contains placeholder. Running without active database.');
            return null;
        }

        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (err) {
        console.error(`⚠️ MongoDB Connection Notice: ${err.message}. Backend running in offline/resilient mode.`);
        return null;
    }
};

module.exports = connectDB;
